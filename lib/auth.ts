import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
      provider: "sqlite"
  }),
  emailAndPassword: {
    enabled: true,
    verifyEmail: false,
  },
  
});