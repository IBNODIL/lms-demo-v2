import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseCreationForm } from "@/components/course-creation-form";

export default async function CreateCoursePage() {
  // Check if user is a teacher
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-gray-600 mt-2">Start creating and sharing your expertise</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <CourseCreationForm />
      </div>
    </div>
  );
}
