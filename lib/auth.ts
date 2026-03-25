import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { transporter } from "@/lib/email";
import { getVerificationEmailTemplate } from "@/lib/email-templates";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user }: { user: { email: string; name?: string } }) => {
      try {
        console.log("🔐 sendVerificationEmail callback triggered");
        console.log("📧 User email:", user.email);
        
        const verificationCode =
          Math.floor(100000 + Math.random() * 900000).toString();

        console.log("🔢 Generated 6-digit code:", verificationCode);
        
        await prisma.verificationToken.deleteMany({
          where: { identifier: user.email },
        });

        const stored = await prisma.verificationToken.create({
          data: {
            identifier: user.email,
            value: verificationCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          },
        });

        console.log("✅ Stored verification code:", stored.value);

        await transporter.sendMail({
          from: process.env.EMAIL_FROM!,
          to: user.email,
          subject: "Verify your email for Antonio LMS",
          html: getVerificationEmailTemplate(
            verificationCode,
            user.name || undefined
          ),
        });

        console.log("📨 Email sent");

      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error;
      }
    },
  },

  secret:
    process.env.BETTER_AUTH_SECRET ||
    "default-secret-key-change-in-production",

  baseURL:
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000",

  trustHost: true,
});