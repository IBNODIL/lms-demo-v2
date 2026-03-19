import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Play, Clock, BookOpen } from "lucide-react";
import { EnrollButton } from "@/components/enroll-button";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // Get session to check enrollment status
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          isPublished: true,
          videoUrl: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if user is enrolled
  let isEnrolled = false;
  let isOwner = false;
  if (session?.user) {
    // Check if user is the course owner
    isOwner = course.user.id === session.user.id;

    // Check if user is enrolled
    if (!isOwner) {
      const enrollment = await prisma.purchase.findFirst({
        where: {
          userId: session.user.id,
          courseId: courseId,
        },
      });
      isEnrolled = !!enrollment;
    } else {
      isEnrolled = true;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="text-gray-600 mt-2">
          By {course.user?.name || course.user?.email}
        </p>
      </div>

      {course.imageUrl && (
        <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-80 object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {course.description || "No description available"}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Total Chapters:</span>{" "}
                {course.chapters.length}
              </p>
              <p>
                <span className="font-semibold">Price:</span> ${course.price.toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                {course.published ? (
                  <span className="text-green-600 font-semibold">Published</span>
                ) : (
                  <span className="text-yellow-600 font-semibold">Draft</span>
                )}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BookOpen size={24} className="text-blue-600" />
              Course Content
            </h2>
            {course.chapters.length > 0 ? (
              <div className="space-y-3">
                {course.chapters.map((chapter) => (
                  <div key={chapter.id}>
                    {isEnrolled ? (
                      <Link
                        href={`/dashboard/courses/${course.id}/chapters/${chapter.id}`}
                      >
                        <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer border border-blue-200 hover:shadow-md">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0 font-semibold">
                                {chapter.position}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {chapter.title}
                                </h3>
                                {chapter.description && (
                                  <p className="text-gray-600 text-sm mt-1">
                                    {chapter.description.substring(0, 100)}
                                    {chapter.description.length > 100 ? "..." : ""}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  {chapter.videoUrl && (
                                    <span className="flex items-center gap-1">
                                      <Play size={14} />
                                      Video Available
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    Ready to watch
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 shrink-0">
                              {chapter.isPublished ? (
                                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                  Available
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                                  Coming Soon
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-400 text-white rounded-lg flex items-center justify-center shrink-0 font-semibold">
                              {chapter.position}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {chapter.title}
                              </h3>
                              {chapter.description && (
                                <p className="text-gray-600 text-sm mt-1">
                                  {chapter.description.substring(0, 100)}
                                  {chapter.description.length > 100 ? "..." : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 shrink-0">
                            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                              Locked
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-3">No chapters yet</p>
                <p className="text-sm text-gray-400">
                  This course doesn't have any chapters.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <div className="space-y-4">
              {isOwner ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-semibold">
                    You are the course instructor
                  </p>
                </div>
              ) : isEnrolled ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                    ✓ You are enrolled
                  </p>
                </div>
              ) : (
                <EnrollButton courseId={courseId} price={course.price} />
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-semibold text-gray-900">
                    {course.chapters.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-900">
                    {course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Level</span>
                  <span className="font-semibold text-gray-900">Intermediate</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Instructor</p>
                <p className="text-sm font-semibold text-gray-900">
                  {course.user?.name || course.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
