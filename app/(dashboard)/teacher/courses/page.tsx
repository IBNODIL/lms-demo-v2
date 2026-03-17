import { TeacherCoursesList } from "@/components/teacher-courses-list";

export default function TeacherCoursesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Manage your courses and reach students</p>
      </div>

      <TeacherCoursesList />
    </div>
  );
}
