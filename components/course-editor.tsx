"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, BookOpen, Settings } from "lucide-react";
import { ChaptersList } from "./chapters-list";
import { updateCourse } from "@/actions/create-course";

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  published: boolean;
  userId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export function CourseEditor({
  course,
  chapters: initialChapters,
}: {
  course: Course;
  chapters: Chapter[];
}) {
  const [activeTab, setActiveTab] = useState<"details" | "chapters">("details");
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    price: course.price.toString(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [chapters, setChapters] = useState(initialChapters);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateCourse(course.id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save course");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (chapters.length === 0) {
      setError("Please add at least one chapter before publishing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateCourse(course.id, {
        published: true,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        // Refresh page to show updated state
        window.location.reload();
      } else {
        setError(result.error || "Failed to publish course");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Changes saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "details"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Settings className="inline mr-2" size={18} />
          Course Details
        </button>
        <button
          onClick={() => setActiveTab("chapters")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "chapters"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <BookOpen className="inline mr-2" size={18} />
          Chapters ({chapters.length})
        </button>
      </div>

      {/* Course Details Tab */}
      {activeTab === "details" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD)
            </label>
            <Input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong>{" "}
              {course.published ? (
                <span className="text-green-600 font-semibold">Published</span>
              ) : (
                <span className="text-gray-600">Draft</span>
              )}
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Add chapters and content before publishing your course.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Save size={18} />
              Save Changes
            </Button>

            {!course.published && (
              <Button
                onClick={handlePublish}
                disabled={loading || chapters.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Publish Course
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chapters Tab */}
      {activeTab === "chapters" && (
        <ChaptersList
          courseId={course.id}
          chapters={chapters}
          onChaptersChange={setChapters}
        />
      )}
    </div>
  );
}
