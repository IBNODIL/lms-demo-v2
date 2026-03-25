import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all chapters for the course
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      select: { id: true },
    });

    if (!chapters.length) {
      return NextResponse.json({ completedCount: 0, totalCount: 0 });
    }

    const chapterIds = chapters.map((c: { id: string }) => c.id);

    // Get completed chapters for this user
    const completedProgress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        chapterId: { in: chapterIds },
        isCompleted: true,
      },
      select: { chapterId: true },
    });

    return NextResponse.json({
      completedCount: completedProgress.length,
      totalCount: chapters.length,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
