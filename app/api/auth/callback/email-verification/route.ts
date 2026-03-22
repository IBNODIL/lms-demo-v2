import { prisma } from "@/lib/prisma";

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
      // Clean up expired token
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

    // If already verified, just return success
    if (user.emailVerified) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      return Response.json({
        success: true,
        message: "Email already verified",
        user,
      });
    }

    // Mark email as verified
    const updatedUser = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return Response.json({
      success: true,
      message: "Email verified successfully",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Email verification failed";
    console.error("Email verification callback error:", error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
