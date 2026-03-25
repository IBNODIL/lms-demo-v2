import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/email";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    // Ensure verification email is sent
    if (result.user) {
      try {
        // Check if verification token already exists
        const existingToken = await prisma.verificationToken.findFirst({
          where: { identifier: result.user.email },
        });

        let verificationCode = existingToken?.value;

        // If no token exists, create one
        if (!verificationCode) {
          verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

          await prisma.verificationToken.create({
            data: {
              identifier: result.user.email,
              value: verificationCode,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            },
          });
        }

        console.log("📧 Sending verification email for:", result.user.email);
        console.log("🔢 Verification code:", verificationCode);

        await transporter.sendMail({
          from: process.env.EMAIL_FROM!,
          to: result.user.email,
          subject: "Verify your email for Antonio LMS",
          html: getVerificationEmailTemplate(
            verificationCode,
            result.user.name || undefined
          ),
        });

        console.log("✅ Verification email sent");
      } catch (emailError) {
        console.error("⚠️ Warning: Could not send verification email:", emailError);
        // Don't fail registration if email fails
      }
    }

    return Response.json(result);
  } catch (error: any) {
    console.error("Registration error:", error);
    return Response.json(
      { error: error.message || "Register failed" },
      { status: 400 }
    );
  }
}