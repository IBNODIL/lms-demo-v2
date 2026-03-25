import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// This is only for testing/development - remove in production
export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Get the latest verification token for this email (there can be multiple)
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { id: "desc" }, // Get the most recent one
    });

    if (!token) {
      return NextResponse.json(
        { error: "No verification code found for this email" },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (token.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      email,
      code: token.value,
      expiresAt: token.expiresAt,
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get verification code" },
      { status: 500 }
    );
  }
}
