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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check access: course owner or enrolled student (if published)
    const isOwner = session?.user?.id === course.userId;
    
    if (!isOwner) {
      // Non-owners can only see published courses
      if (!course.published) {
        return NextResponse.json(
          { error: "You don't have permission to view this course" },
          { status: 403 }
        );
      }
      
      // Only show published chapters for non-owners
      const courseWithChapters = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          chapters: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      });
      
      return NextResponse.json(courseWithChapters);
    }

    // Owner can see all chapters (published and unpublished)
    const courseWithChapters = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { position: "asc" },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(courseWithChapters);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    if (course.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this course" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, price, imageUrl, categoryId, published } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || course.title,
        description: description !== undefined ? description : course.description,
        price: price !== undefined ? price : course.price,
        imageUrl: imageUrl !== undefined ? imageUrl : course.imageUrl,
        categoryId: categoryId !== undefined ? categoryId : course.categoryId,
        published: published !== undefined ? published : course.published,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    if (course.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this course" },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
