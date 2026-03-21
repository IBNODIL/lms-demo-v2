import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { isEnrolled: false },
        { status: 200 }
      );
    }

    // Check if user is enrolled in this course
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
    });

    return NextResponse.json({ isEnrolled: !!purchase });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      { isEnrolled: false },
      { status: 200 }
    );
  }
}
