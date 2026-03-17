export default function ChapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chapter Content</h1>
        <p className="text-gray-600 mt-2">
          Course ID: {params.courseId} | Chapter ID: {params.chapterId}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center">
            <p className="text-white">Video player will be here</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Chapter Content</h2>
          <p className="text-gray-600">Content coming soon...</p>
        </div>
      </div>
    </div>
  );
}
