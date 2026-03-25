import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CourseList } from "@/components/course-list";
import { BookOpen, TrendingUp, Award, Play } from "lucide-react";

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

  // Get progress for each course
  const enrollmentData = await Promise.all(
    enrollments.map(async (e: typeof enrollments[0]) => {
      const completedChapters = await prisma.progress.count({
        where: {
          userId: session.user.id,
          chapter: {
            courseId: e.course.id,
          },
        },
      });

      const totalChapters = e.course.chapters.length;
      const progress =
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0;

      return {
        id: e.course.id,
        title: e.course.title,
        description: e.course.description || undefined,
        imageUrl: e.course.imageUrl || undefined,
        price: e.course.price,
        isEnrolled: true,
        progress,
        chaptersTotal: totalChapters,
        chaptersCompleted: completedChapters,
      };
    })
  );

  const enrolledCourses = enrollmentData;

  // Fetch user statistics
  const userStats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: {
          purchases: true,
        },
      },
    },
  });

  // Get user's progress
  const progressData = await prisma.progress.groupBy({
    by: ["userId"],
    where: { userId: session.user.id },
    _count: { id: true },
  });

  const completedLessons = progressData[0]?._count.id || 0;
  const totalLessons = enrollments.reduce(
    (sum: number, e: typeof enrollments[0]) => sum + e.course.chapters.length,
    0
  );
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.name || "Learner"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Enrolled Courses</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {enrolledCourses.length}
              </p>
            </div>
            <BookOpen size={40} className="text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {progressPercentage}%
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {completedLessons} of {totalLessons} lessons
              </p>
            </div>
            <TrendingUp size={40} className="text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Learning Streak</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">7 days</p>
              <p className="text-gray-500 text-xs mt-1">Keep it up!</p>
            </div>
            <Award size={40} className="text-orange-100" />
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Play size={24} className="text-blue-600" />
            My Courses
          </h2>
          <Link href="/search" className="text-blue-600 hover:text-blue-700 font-semibold">
            Browse Courses →
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <CourseList courses={enrolledCourses} />
        ) : (
          <div className="text-center py-12">
            <BookOpen
              size={64}
              className="mx-auto text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg mb-4">
              You haven't enrolled in any courses yet
            </p>
            <Link
              href="/search"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Explore Courses
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {enrolledCourses.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span>Complete lessons regularly to maintain your learning streak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span>
                Set a daily learning goal - even 15 minutes a day makes a difference
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span>Review completed lessons to reinforce your knowledge</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}