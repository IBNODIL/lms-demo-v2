import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Debug endpoint to check session status
export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 }
      );
    }

    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if session exists with this token
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return NextResponse.json(
        { error: `No session found with token: ${token.substring(0, 10)}...` },
        { status: 404 }
      );
    }

    // Check if session is for this user
    if (session.userId !== user.id) {
      return NextResponse.json(
        {
          error: `Session found but belongs to different user. Expected: ${user.id}, Got: ${session.userId}`,
        },
        { status: 403 }
      );
    }

    // Get all sessions for this user
    const userSessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      tokenMatch: session ? true : false,
      session: session ? { id: session.id, expiresAt: session.expiresAt } : null,
      allSessionsForUser: userSessions.length,
      message: "Session found and valid",
    });
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check session" },
      { status: 500 }
    );
  }
}
