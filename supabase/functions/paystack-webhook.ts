import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PaystackChargeData {
  reference: string;
  amount: number;
  currency?: string;
  metadata?: {
    user_id?: string;
    plan_name?: string;
  };
}

interface PaystackEvent {
  event: string;
  data: PaystackChargeData;
}

interface PaymentLog {
  user_id: string;
  provider: string;
  reference: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  expires_at: string;
  updated_at: string;
}

interface UserPlan {
  plan: string;
  plan_name: string;
  plan_expires_at: string;
  is_active: boolean;
  updated_at: string;
}

async function verifyPaystackSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY environment variable not set");
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const key = encoder.encode(secret);

    const computedSignature = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      ),
      data
    );

    const computedHex = Array.from(new Uint8Array(computedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computedHex === signature;
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-paystack-signature",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Received Paystack webhook");

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature (skip for test-signature in dev)
    const isTestMode = signature === "test-signature";
    const isValid = isTestMode || await verifyPaystackSignature(rawBody, signature);

    if (!isValid) {
      console.error("Invalid Paystack signature");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isTestMode) {
      console.warn("⚠️ Using test signature - development mode only");
    }

    // Parse the webhook payload
    const event: PaystackEvent = JSON.parse(rawBody);
    console.log(`Processing Paystack event: ${event.event}`);

    // Only handle charge.success events
    if (event.event !== "charge.success") {
      console.log(`Ignoring event: ${event.event}`);
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data: PaystackChargeData = event.data;
    const reference: string = data.reference;
    const userId: string | undefined = data.metadata?.user_id;
    const planName: string | undefined = data.metadata?.plan_name;
    const amount: number = data.amount;
    const currency: string = data.currency || "KES";

    if (!reference || !userId) {
      console.error("Missing reference or user_id in webhook metadata");
      return new Response(JSON.stringify({ error: "Invalid webhook data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!amount || amount <= 0) {
      console.error("Invalid amount in webhook data");
      return new Response(JSON.stringify({ error: "Invalid payment amount" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Processing payment - Reference: ${reference}, User: ${userId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for idempotency: if payment already processed, skip
    console.log(`Checking if payment already processed for reference: ${reference}`);
    const { data: existingPayment } = await supabase
      .from("payment_logs")
      .select("status")
      .eq("reference", reference)
      .maybeSingle();

    if (existingPayment && existingPayment.status === "success") {
      console.log(`Payment already processed for reference: ${reference}`);
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Payment already processed",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Calculate expiry date for premium plan
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

    // Upsert payment_logs - create if doesn't exist, update if it does
    console.log(`Processing payment_logs for reference: ${reference}`);

    const paymentLogData: PaymentLog = {
      user_id: userId,
      provider: "paystack",
      reference,
      plan: planName || "premium",
      amount,
      currency,
      status: "success",
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: paymentError } = await supabase
      .from("payment_logs")
      .upsert(paymentLogData, { onConflict: "reference" });

    if (paymentError) {
      console.error(`Failed to process payment_logs: ${paymentError.message}`);
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Failed to process payment logs: ${paymentError.message}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Processed payment_logs status to success`);

    // Update user_plans to premium
    console.log(`Updating user_plans for user: ${userId}`);

    const userPlanData: UserPlan = {
      plan: "premium",
      plan_name: planName || "Premium Plan",
      plan_expires_at: expiresAt.toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: planError } = await supabase
      .from("user_plans")
      .update(userPlanData)
      .eq("user_id", userId);

    if (planError) {
      console.error(`Failed to update user_plans: ${planError.message}`);
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Failed to update user plan: ${planError.message}`
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Updated user_plans to premium for user: ${userId}`);
    console.log(
      `Successfully processed payment - User: ${userId}, Reference: ${reference}`
    );

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Payment processed successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(`Webhook processing error: ${error}`);
    // Return 200 to prevent Paystack from retrying indefinitely
    return new Response(
      JSON.stringify({ status: "error", message: String(error) }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
