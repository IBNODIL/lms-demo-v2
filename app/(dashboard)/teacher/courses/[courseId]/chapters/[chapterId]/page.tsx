export default function EditChapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Chapter</h1>
        <p className="text-gray-600 mt-2">
          Course ID: {params.courseId} | Chapter ID: {params.chapterId}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Chapter edit form coming soon...</p>
      </div>
    </div>
  );
}
