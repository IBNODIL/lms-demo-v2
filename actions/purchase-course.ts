"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function purchaseCourse(courseId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Check if already purchased
    const existing = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId,
      },
    });

    if (existing) {
      throw new Error("Already purchased");
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    });

    return { success: true, purchase };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function markChapterComplete(chapterId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      update: {
        isCompleted: true,
      },
      create: {
        userId: session.user.id,
        chapterId,
        isCompleted: true,
      },
    });

    return { success: true, progress };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}
