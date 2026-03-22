import { Resend } from "resend";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Send test email
    const testEmail = process.env.TEST_EMAIL || "delivered@resend.dev";
    const verificationLink = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/email-verification?token=test-token-123`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: testEmail,
      subject: "Test: Email Verification - Antonio LMS",
      html: getVerificationEmailTemplate(verificationLink, "Test User"),
    });

    return Response.json({
      success: true,
      message: "Test email sent successfully",
      email: testEmail,
      result,
      note: "Check your email (or RESEND dashboard) for the test email",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send test email";
    console.error("Test email error:", error);
    return Response.json(
      {
        error: errorMessage,
        details: error,
      },
      { status: 500 }
    );
  }
}
