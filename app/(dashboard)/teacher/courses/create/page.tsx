import { CourseCreationForm } from "@/components/course-creation-form";

export default function CreateCoursePage() {
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
