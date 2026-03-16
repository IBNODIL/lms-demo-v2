import { betterAuth } from "better-auth";
import { prisma } from "@/lib/prisma"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { sendEmail } from "./email";

export const auth = betterAuth({
//   database: prismaAdapter(prisma),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Verify your email",
        `<a href="${url}">Verify email</a>`
      );
    },
  },

//   resetPassword: {
//     sendResetPassword: async ({ user, url }) => {
//       await sendEmail(
//         user.email,
//         "Reset password",
//         `<a href="${url}">Reset password</a>`
//       );
//     },
//   },
});