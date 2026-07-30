import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface VerifyRequest {
  reference: string;
  user_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackSecret = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Supabase config missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Create client with user auth
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { reference }: VerifyRequest = await req.json();

    if (!reference || reference.length < 5) {
      return new Response(JSON.stringify({ error: "Invalid reference" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    console.log(`Verifying Paystack reference: ${reference} for user: ${user.id}`);

    // Check if already verified in payment_logs
    const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabaseUser;

    const { data: existingLog } = await supabaseAdmin.from("payment_logs").select("*").eq("reference", reference).maybeSingle();

    if (existingLog && existingLog.status === "success") {
      console.log(`Reference ${reference} already verified as success`);
      // Ensure user plan is premium
      const { data: plan } = await supabaseAdmin.from("user_plans").select("plan").eq("user_id", user.id).maybeSingle();
      if (plan?.plan !== "premium") {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);
        await supabaseAdmin.from("user_plans").update({
          plan: "premium",
          plan_name: "Premium Plan",
          plan_expires_at: expiresAt.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      }

      return new Response(JSON.stringify({ status: "success", message: "Payment already verified", reference, plan: "premium" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // If PAYSTACK_SECRET_KEY not set, we cannot verify via Paystack API - fallback to pending check
    if (!paystackSecret) {
      console.warn("PAYSTACK_SECRET_KEY not set, cannot verify via Paystack API - using local pending check");
      // For dev, if payment_logs exists with pending, promote to success if reference looks like simulated
      if (reference.startsWith("FP_DAY_SIM_") || reference.startsWith("test_")) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);

        await supabaseAdmin.from("payment_logs").upsert({
          user_id: user.id,
          provider: "paystack",
          reference,
          plan: "premium",
          amount: 100,
          currency: "KES",
          status: "success",
          expires_at: expiresAt.toISOString(),
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "reference" });

        await supabaseAdmin.from("user_plans").update({
          plan: "premium",
          plan_name: "Premium Plan",
          plan_expires_at: expiresAt.toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);

        return new Response(JSON.stringify({ status: "success", message: "Simulated payment verified (dev mode)", reference, plan: "premium" }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      return new Response(JSON.stringify({ status: "pending", message: "Payment verification pending webhook", reference }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Verify via Paystack API
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error(`Paystack verification failed: ${paystackData.message}`);
      return new Response(JSON.stringify({ status: "failed", message: paystackData.message || "Verification failed", reference }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const transaction = paystackData.data;
    if (transaction.status !== "success") {
      return new Response(JSON.stringify({ status: transaction.status, message: `Transaction status: ${transaction.status}`, reference }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Verify amount (100 KES = 10000 kobo)
    const expectedAmount = 10000; // 100 KES in kobo
    if (transaction.amount < expectedAmount) {
      return new Response(JSON.stringify({ status: "failed", message: `Invalid amount: ${transaction.amount}`, reference }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Success - update payment_logs and user_plans
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    await supabaseAdmin.from("payment_logs").upsert({
      user_id: user.id,
      provider: "paystack",
      reference,
      plan: "premium",
      amount: transaction.amount,
      currency: transaction.currency || "KES",
      status: "success",
      expires_at: expiresAt.toISOString(),
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { paystack_data: transaction },
    }, { onConflict: "reference" });

    await supabaseAdmin.from("user_plans").update({
      plan: "premium",
      plan_name: "Premium Plan",
      plan_expires_at: expiresAt.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);

    console.log(`Successfully verified and upgraded user ${user.id} with reference ${reference}`);

    return new Response(JSON.stringify({ status: "success", message: "Payment verified and premium activated", reference, plan: "premium", expires_at: expiresAt.toISOString() }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error(`Verify paystack error: ${error}`);
    return new Response(JSON.stringify({ status: "error", message: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
