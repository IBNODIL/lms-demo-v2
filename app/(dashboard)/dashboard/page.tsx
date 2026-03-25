import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseList } from "@/components/course-list";
import { BookOpen } from "lucide-react";

export default async function DashboardPage() {
  // Get session
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch enrolled courses (purchases by current user)
  const enrollments = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          chapters: {
            select: { id: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to course list format
  const courses = enrollments.map((e: typeof enrollments[0]) => ({
    id: e.course.id,
    title: e.course.title,
    description: e.course.description || undefined,
    imageUrl: e.course.imageUrl || undefined,
    price: e.course.price,
    isEnrolled: true,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here are your enrolled courses.</p>
      </div>

      <div>
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No courses yet. Start exploring!</p>
            <Link
              href="/search"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <CourseList courses={courses} />
        )}
      </div>
    </div>
  );
}
