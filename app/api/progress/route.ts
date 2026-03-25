import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId, isCompleted } = body;

    if (!chapterId) {
      return Response.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: chapterId,
        },
      },
      create: {
        userId: session.user.id,
        chapterId: chapterId,
        isCompleted: isCompleted ?? true,
      },
      update: {
        isCompleted: isCompleted ?? true,
      },
    });

    return Response.json(progress);
  } catch (error) {
    console.error("Progress update error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update progress" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return Response.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    const progress = await prisma.progress.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: chapterId,
        },
      },
    });

    return Response.json(progress || { isCompleted: false });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch progress" },
      { status: 400 }
    );
  }
}
