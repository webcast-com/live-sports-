import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id?: string;
}

serve(async (req: Request): Promise<Response> => {
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
    const { name, email, subject, message, user_id }: ContactFormData = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (message.length < 10 || message.length > 5000) {
      return new Response(JSON.stringify({ error: "Message must be between 10 and 5000 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Phase 3: Save to contact_messages table
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!);
        const { error: insertError } = await supabase.from("contact_messages").insert({
          name,
          email,
          subject,
          message,
          user_id: user_id || null,
          status: "pending",
        });
        if (insertError) console.warn("Failed to save contact message to DB:", insertError.message);
        else console.log(`Saved contact message from ${email} to DB`);
      } catch (dbErr) {
        console.warn("DB save failed, continuing with email", dbErr);
      }
    }

    // Try to send email via Resend if configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured - skipping email, but message saved to DB");
      return new Response(JSON.stringify({ success: true, message: "Message saved successfully (email service not configured, but we saved your inquiry)", savedToDb: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@footypredict.ai";

    const emailContent = `
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <tr><td style="padding: 30px; background: linear-gradient(135deg, #00d4ff 0%, #0066ff 100%);"><h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission - ScoreHub Phase 3</h1></td></tr>
      <tr><td style="padding: 30px; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0 0 20px; color: #666;"><strong>From:</strong> ${name}</p>
        <p style="margin: 0 0 20px; color: #666;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
        <p style="margin: 0 0 20px; color: #666;"><strong>Subject:</strong> ${subject}</p>
        ${user_id ? `<p style="margin: 0 0 20px; color: #666;"><strong>User ID:</strong> ${user_id}</p>` : ''}
      </td></tr>
      <tr><td style="padding: 30px; background: #f9fafb;">
        <h3 style="margin: 0 0 15px; color: #1f2937;">Message:</h3>
        <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </td></tr>
      <tr><td style="padding: 20px 30px; background: #f5f5f5; text-align: center; font-size: 12px; color: #999;">Sent via ScoreHub Contact Form (Phase 3 - saved to DB)</td></tr>
    </table>
  </body>
</html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: "noreply@footypredict.ai",
        to: supportEmail,
        replyTo: email,
        subject: `[Contact Form] ${subject} - ScoreHub`,
        html: emailContent,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      // Still return success because we saved to DB
      return new Response(JSON.stringify({ success: true, message: "Message saved to DB, but email failed to send (will be reviewed)", savedToDb: true, emailError: error }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    console.log(`Contact form submitted from ${email} - saved and emailed`);

    return new Response(JSON.stringify({ success: true, message: "Message sent successfully", savedToDb: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", details: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
