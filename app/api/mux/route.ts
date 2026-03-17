import { NextResponse } from "next/server";
import { createMuxUpload, getMuxAsset } from "@/lib/mux";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, courseId, chapterId, assetId } = await request.json();

    // Create Mux upload URL
    if (action === "create-upload") {
      const { fileName } = await request.json();

      // Verify authorization
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course || course.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const uploadData = await createMuxUpload(fileName, courseId, chapterId);
      return NextResponse.json(uploadData);
    }

    // Get asset info after upload completes
    if (action === "get-asset") {
      const asset = await getMuxAsset(assetId);
      return NextResponse.json(asset);
    }

    // Handle webhook for completed uploads
    if (action === "webhook") {
      // This would be called by Mux when upload completes
      const body = await request.json();
      if (body.type === "video.asset.created") {
        // Update chapter with video URL
        await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            videoUrl: `mux:${body.data.id}`,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("MUX API Error:", error);
    return NextResponse.json(
      { error: "Mux request failed", details: String(error) },
      { status: 500 }
    );
  }
}
