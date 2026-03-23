import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "better-auth.session_token";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return Response.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        value: token,
      },
    });

    if (!verificationToken) {
      return Response.json(
        { error: "Invalid verification token - token not found" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      return Response.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Create a session for the user (auto-login)
    try {
      const sessionData = await prisma.session.create({
        data: {
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          userId: user.id,
          ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      });

      const response = Response.json({
        success: true,
        message: "Email verified successfully",
        user: { id: user.id, email: user.email },
        session: { id: sessionData.id },
      });

      // Set the session cookie
      const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
      const secure = process.env.NODE_ENV === "production";
      const cookieValue = `${SESSION_COOKIE_NAME}=${sessionData.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
        secure ? "; Secure" : ""
      }`;
      response.headers.set("Set-Cookie", cookieValue);

      return response;
    } catch (sessionErr) {
      console.warn("Session creation during email verification failed:", sessionErr);
      // Even if session creation fails, email verification was successful
      return Response.json({
        success: true,
        message: "Email verified successfully",
        user: { id: user.id, email: user.email },
      });
    }
  } catch (error: any) {
    console.error("Email verification error:", error);
    return Response.json(
      { error: error.message || "Email verification failed" },
      { status: 400 }
    );
  }
}
