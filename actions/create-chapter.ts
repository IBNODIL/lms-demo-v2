"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMuxPlaybackInfo } from "@/lib/mux";

export async function createChapter(
  courseId: string,
  data: {
    title: string;
    description?: string;
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

    const chapterCount = await prisma.chapter.count({
      where: { courseId },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title: data.title,
        description: data.description || "",
        courseId,
        position: chapterCount + 1,
        isPublished: true, // Publish chapters by default
      },
    });

    return { success: true, chapter };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function updateChapterVideo(
  courseId: string,
  chapterId: string,
  data: {
    videoUrl: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
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

    // Get playback info from MUX if asset ID provided
    let playbackUrl = data.videoUrl;
    if (data.muxAssetId) {
      try {
        const playbackInfo = await getMuxPlaybackInfo(data.muxAssetId);
        if (playbackInfo.playbackId) {
          playbackUrl = `https://image.mux.com/${playbackInfo.playbackId}/animated.gif`; // Store MUX asset ID as URL
        }
      } catch (error) {
        console.error("Failed to get MUX playback info:", error);
      }
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoUrl: playbackUrl,
        isPublished: true,
      },
    });

    return { success: true, chapter: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function updateChapter(
  chapterId: string,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    isPublished?: boolean;
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

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });

    if (!chapter || chapter.course?.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data,
    });

    return { success: true, chapter: updated };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

export async function deleteChapter(chapterId: string) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });

    if (!chapter || chapter.course?.userId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}
