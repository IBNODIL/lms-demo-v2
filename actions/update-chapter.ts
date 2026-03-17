"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function updateChapterWithMuxVideo(
  courseId: string,
  chapterId: string,
  data: {
    muxAssetId: string;
    muxPlaybackId: string;
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

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.courseId !== courseId) {
      throw new Error("Chapter not found");
    }

    // Store the MUX playback ID as the video URL
    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoUrl: `mux:${data.muxPlaybackId}`,
        isPublished: true,
      },
    });

    return { success: true, chapter: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function publishCourse(courseId: string) {
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

    // Check if course has at least one published chapter
    const publishedChapters = await prisma.chapter.count({
      where: {
        courseId,
        isPublished: true,
      },
    });

    if (publishedChapters === 0) {
      throw new Error("Course must have at least one published chapter");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        published: true,
      },
    });

    return { success: true, course: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}
