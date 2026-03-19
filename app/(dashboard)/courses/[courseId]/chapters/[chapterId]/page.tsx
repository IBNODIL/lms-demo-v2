import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/video-player";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;

  // Get session to check enrollment
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect("/login");
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          userId: true,
        },
      },
    },
  });

  if (!chapter) {
    notFound();
  }

  // Verify the chapter belongs to the course
  if (chapter.courseId !== courseId) {
    notFound();
  }

  // Check if user is course owner or enrolled
  const isOwner = chapter.course.userId === session.user.id;
  let isEnrolled = false;

  if (!isOwner) {
    const enrollment = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
    });
    isEnrolled = !!enrollment;

    if (!isEnrolled) {
      redirect(`/dashboard/courses/${courseId}`);
    }
  }

  // Get all chapters for navigation
  const allChapters = await prisma.chapter.findMany({
    where: { courseId: courseId },
    orderBy: { position: "asc" },
    select: { id: true, title: true, position: true },
  });

  const currentIndex = allChapters.findIndex((c) => c.id === chapter.id);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1"
        >
          <span>← Back to Course</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">{chapter.title}</h1>
        <p className="text-gray-600 mt-2">
          Lesson {chapter.position} of {allChapters.length}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {chapter.videoUrl ? (
              <VideoPlayer videoUrl={chapter.videoUrl} title={chapter.title} />
            ) : (
              <div className="bg-gray-900 rounded-lg h-96 flex flex-col items-center justify-center gap-4">
                <div className="text-gray-400 text-center">
                  <p className="text-lg font-semibold">No video available</p>
                  <p className="text-sm">This lesson doesn't have a video yet.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Lesson Content</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {chapter.description ? (
                <div className="whitespace-pre-line">{chapter.description}</div>
              ) : (
                <p className="text-gray-500">No content available for this lesson.</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-4">
            {previousChapter ? (
              <Link
                href={`/dashboard/courses/${courseId}/chapters/${previousChapter.id}`}
                className="flex-1 flex items-center justify-start gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
              >
                <ChevronLeft size={20} />
                <span className="text-left">
                  <div className="text-xs text-gray-700">Previous Lesson</div>
                  <div className="truncate">{previousChapter.title}</div>
                </span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextChapter ? (
              <Link
                href={`/dashboard/courses/${courseId}/chapters/${nextChapter.id}`}
                className="flex-1 flex items-center justify-end gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <span className="text-right">
                  <div className="text-xs text-blue-100">Next Lesson</div>
                  <div className="truncate">{nextChapter.title}</div>
                </span>
                <ChevronRight size={20} />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="text-lg font-bold mb-4">Course Lessons</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allChapters.map((c) => (
                <Link key={c.id} href={`/dashboard/courses/${courseId}/chapters/${c.id}`}>
                  <div
                    className={`p-3 rounded-lg text-sm transition cursor-pointer ${
                      c.id === chapter.id
                        ? "bg-blue-100 border-l-4 border-blue-600 text-blue-900 font-semibold"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="font-semibold">Lesson {c.position}</div>
                    <div className="text-xs opacity-75 truncate">{c.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
