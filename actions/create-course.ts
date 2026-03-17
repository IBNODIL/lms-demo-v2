"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCourse(data: {
  title: string;
  description?: string;
  price?: number;
  categoryId?: string;
}) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Fetch the user to get the role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "TEACHER") {
      throw new Error("Only teachers can create courses");
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description || "",
        price: data.price || 0,
        userId: session.user.id,
        categoryId: data.categoryId || null,
        published: true, // Publish by default
      },
    });

    return { success: true, course };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    published?: true;
  }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data,
    });

    return { success: true, course: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}
