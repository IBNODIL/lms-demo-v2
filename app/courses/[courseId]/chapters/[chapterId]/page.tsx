"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/video-player";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, BookOpen } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isPublished: boolean;
  courseId: string;
}

interface Course {
  id: string;
  title: string;
  userId: string;
  published: boolean;
}

interface NavChapter {
  id: string;
  title: string;
  position: number;
}

export default function ViewChapterPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const router = useRouter();
  const [params, setParams] = useState<{ courseId: string; chapterId: string } | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<NavChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Get params from promise
  useEffect(() => {
    paramsPromise.then((p) => setParams(p));
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    const fetchData = async () => {
      try {
        // Get current user session and course info
        const sessionRes = await fetch("/api/user");
        const courseRes = await fetch(`/api/courses/${params.courseId}`);
        const chapterRes = await fetch(`/api/chapters?id=${params.chapterId}`);

        if (!courseRes.ok || !chapterRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const session = sessionRes.ok ? await sessionRes.json() : null;
        const courseData = await courseRes.json();
        const chapterData = await chapterRes.json();

        if (!courseData || !chapterData) {
          throw new Error("Course or chapter not found");
        }

        // Verify chapter belongs to course
        if (chapterData.courseId !== params.courseId) {
          throw new Error("Chapter does not belong to this course");
        }

        // Check if user is owner
        const isOwner = session?.id === courseData.userId;
        setIsOwner(isOwner);

        // Check if course is published or user is owner
        if (!courseData.published && !isOwner) {
          throw new Error("Course is not published");
        }

        // Check if user is enrolled or is owner
        if (session && !isOwner) {
          try {
            const enrollRes = await fetch(`/api/courses/${params.courseId}/purchase`);
            const enrollData = enrollRes.ok ? await enrollRes.json() : null;
            setIsEnrolled(!!enrollData?.isEnrolled);
          } catch {
            setIsEnrolled(false);
          }
        } else if (isOwner) {
          setIsEnrolled(true);
        }

        setCourse(courseData);
        setChapter(chapterData);

        // Get all chapters for navigation
        if (Array.isArray(courseData.chapters)) {
          setChapters(courseData.chapters);
        } else {
          // Fetch chapters if not included
          try {
            const chaptersRes = await fetch(`/api/courses/${params.courseId}`);
            if (chaptersRes.ok) {
              const data = await chaptersRes.json();
              setChapters(data.chapters || []);
            }
          } catch {
            // proceed without chapter list
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (!params || loading) {
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
      <div className="container mx-auto px-4 py-8">
        <Link href={`/courses/${params.courseId}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1">
          <ChevronLeft size={20} />
          <span>Back to Course</span>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 mt-4">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!chapter || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href={`/courses/${params.courseId}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1">
          <ChevronLeft size={20} />
          <span>Back to Course</span>
        </Link>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-700 mt-4">
          <h2 className="text-xl font-bold mb-2">Not Found</h2>
          <p>The chapter you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Check if user can view this chapter
  if (!isEnrolled && !isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href={`/courses/${params.courseId}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-1">
          <ChevronLeft size={20} />
          <span>Back to Course</span>
        </Link>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-700 mt-4">
          <h2 className="text-xl font-bold mb-2">Enrollment Required</h2>
          <p>You must be enrolled in this course to view chapters.</p>
          <Link href={`/courses/${params.courseId}`}>
            <Button className="mt-4">Go Back to Course</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPosition = chapter.position;
  const previousChapter = chapters.find((c) => c.position === currentPosition - 1);
  const nextChapter = chapters.find((c) => c.position === currentPosition + 1);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Link href={`/courses/${params.courseId}`} className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Course</span>
        </Link>

        <div className="mb-8">
          <p className="text-sm text-gray-600 font-medium">
            {course.title} • Chapter {chapter.position}
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-3">{chapter.title}</h1>
          <div className="h-1 w-20 bg-linear-to-r from-blue-600 to-blue-400 rounded-full"></div>
        </div>

        {chapter.videoUrl ? (
          <div className="mb-12 rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
            <VideoPlayer videoUrl={chapter.videoUrl} title={chapter.title} />
          </div>
        ) : (
          <div className="mb-12 rounded-2xl bg-linear-to-br from-gray-200 to-gray-300 aspect-video flex items-center justify-center text-gray-600 shadow-lg">
            <div className="text-center">
              <Play size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">No video available for this chapter</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {chapter.description && (
              <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen size={24} className="text-blue-600" />
                  Chapter Description
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{chapter.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Chapter Info</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium">Position</p>
                  <p className="text-2xl font-bold text-blue-600">{chapter.position}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 font-medium">Status</p>
                  <p className="font-semibold text-green-700">Published</p>
                </div>
                {chapter.videoUrl && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 font-medium">Video</p>
                    <p className="font-semibold text-purple-700">Available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-16 pt-12 border-t border-gray-300">
          <div>
            {previousChapter ? (
              <Link href={`/courses/${params.courseId}/chapters/${previousChapter.id}`}>
                <button className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold transition-all flex items-center gap-2 group">
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Previous</span>
                  <span className="hidden md:inline text-sm">: {previousChapter.title}</span>
                </button>
              </Link>
            ) : null}
          </div>

          <div>
            {nextChapter ? (
              <Link href={`/courses/${params.courseId}/chapters/${nextChapter.id}`}>
                <button className="px-6 py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition-all flex items-center gap-2 group shadow-md hover:shadow-lg">
                  <span>Next</span>
                  <span className="hidden md:inline text-sm">: {nextChapter.title}</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
