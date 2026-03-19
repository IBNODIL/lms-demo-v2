"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChapterEditor } from "@/components/chapter-editor";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Course {
  id: string;
  title: string;
  userId: string;
}

export default function EditChapterPage({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) {
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chapterRes, courseRes] = await Promise.all([
          fetch(`/api/chapters?id=${params.chapterId}`),
          fetch(`/api/courses/${params.courseId}`),
        ]);

        if (!chapterRes.ok || !courseRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const chapterData = await chapterRes.json();
        const courseData = await courseRes.json();

        if (!chapterData || !courseData) {
          throw new Error("Chapter or course not found");
        }

        // Verify chapter belongs to course
        if (chapterData.courseId !== params.courseId) {
          throw new Error("Chapter does not belong to this course");
        }

        setChapter(chapterData);
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.chapterId, params.courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!chapter || !course) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-700">
        <h2 className="text-xl font-bold mb-2">Not Found</h2>
        <p>The chapter you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/teacher/courses/${params.courseId}`}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1"
        >
          <span>← Back to Course</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Chapter</h1>
        <p className="text-gray-600 mt-2">
          {course.title} → {chapter.title}
        </p>
      </div>

      <ChapterEditor
        chapterId={chapter.id}
        chapter={chapter}
        onUpdate={(updatedChapter) => {
          setChapter(updatedChapter);
        }}
        onClose={() => {
          router.push(`/dashboard/teacher/courses/${params.courseId}`);
        }}
      />
    </div>
  );
}
