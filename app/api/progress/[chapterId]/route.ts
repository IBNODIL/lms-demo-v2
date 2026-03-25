import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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
