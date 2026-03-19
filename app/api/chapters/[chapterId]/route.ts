import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          select: { id: true, userId: true, title: true },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Verify access: owner or enrolled student
    if (session?.user) {
      const isOwner = chapter.course.userId === session.user.id;
      if (isOwner) {
        return NextResponse.json(chapter);
      }

      const isEnrolled = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          courseId: chapter.course.id,
        },
      });

      if (isEnrolled && chapter.isPublished) {
        return NextResponse.json(chapter);
      }
    }

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!chapter || chapter.course.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, videoUrl, isPublished, position } = body;

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: title || chapter.title,
        description: description !== undefined ? description : chapter.description,
        videoUrl: videoUrl !== undefined ? videoUrl : chapter.videoUrl,
        isPublished: isPublished !== undefined ? isPublished : chapter.isPublished,
        position: position !== undefined ? position : chapter.position,
      },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!chapter || chapter.course.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const deletedChapter = await prisma.chapter.delete({
      where: { id: chapterId },
    });

    // Reorder remaining chapters
    const remainingChapters = await prisma.chapter.findMany({
      where: { courseId: chapter.course.id },
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < remainingChapters.length; i++) {
      await prisma.chapter.update({
        where: { id: remainingChapters[i].id },
        data: { position: i + 1 },
      });
    }

    return NextResponse.json(deletedChapter);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
