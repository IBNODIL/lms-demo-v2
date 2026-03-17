export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Course Details</h1>
        <p className="text-gray-600 mt-2">Course ID: {params.courseId}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Course details content coming soon...</p>
      </div>
    </div>
  );
}
