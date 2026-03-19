import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/course-editor";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  // Check authentication
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch course with chapters
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
      </div>
    );
  }

  // Check if user is the course owner
  if (course.user.id !== session.user.id) {
    redirect("/teacher/courses");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-gray-600 mt-2">{course.title}</p>
      </div>

      <CourseEditor course={course} chapters={course.chapters} />
    </div>
  );
}
