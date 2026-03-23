"use server";

import { resend } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export async function resendVerificationEmail(email: string, newEmail?: string) {
  try {
    const targetEmail = newEmail || email;
    console.log("🔄 Resend verification email requested for:", email, "-> Target:", targetEmail);
    
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

    // If changing email, check if new email is already in use
    if (newEmail && newEmail !== email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existingUser) {
        console.log("❌ Email already in use:", newEmail);
        return {
          error: "Email already in use",
          success: false,
        };
      }

      // Update user email
      await prisma.user.update({
        where: { id: user.id },
        data: { email: newEmail },
      });
      console.log("📧 Updated user email to:", newEmail);
    }

    // Delete ALL old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: targetEmail },
    });
    console.log("🗑️ Deleted old tokens for:", targetEmail);

    // Generate NEW 6-digit code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔢 Generated new 6-digit code:", token);

    // Create new verification token
    const created = await prisma.verificationToken.create({
      data: {
        identifier: targetEmail,
        value: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });
    console.log("✅ Created verification token:", created.value);

    // Send verification email
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: targetEmail,
      subject: "Verify your email for Antonio LMS",
      html: getVerificationEmailTemplate(token, user.name || undefined),
    });
    console.log("📨 Email sent successfully to:", targetEmail);

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
