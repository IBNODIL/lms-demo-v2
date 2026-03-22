"use server";

import { resend } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export async function resendVerificationEmail(email: string) {
  try {
    console.log("🔄 Resend verification email requested for:", email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      return {
        error: "User not found",
        success: false,
      };
    }

    // User already verified
    if (user.emailVerified) {
      console.log("✅ Email already verified:", email);
      return {
        error: "Email already verified",
        success: false,
      };
    }

    // Delete ALL old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });
    console.log("🗑️ Deleted old tokens for:", email);

    // Generate NEW 6-digit code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 Generated new 6-digit code:", token);

    // Create new verification token
    const created = await prisma.verificationToken.create({
      data: {
        identifier: email,
        value: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    console.log("✅ Created verification token:", created.value);

    // Send verification email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Verify your email for Antonio LMS",
      html: getVerificationEmailTemplate(token, user.name || undefined),
    });
    console.log("📨 Email sent successfully");

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to send verification email";
    console.error("❌ Failed to resend verification email:", error);
    return {
      error: errorMessage,
      success: false,
    };
  }
}
