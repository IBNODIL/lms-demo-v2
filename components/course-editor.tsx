"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, BookOpen, Settings, Upload, X } from "lucide-react";
import { ChaptersList } from "./chapters-list";
import { updateCourse } from "@/actions/create-course";
import { formatDateConsistent } from "@/lib/date-utils";

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
    imageUrl: course.imageUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [chapters, setChapters] = useState(initialChapters);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    course.imageUrl || null
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let imageUrl = formData.imageUrl;

      // If image file was selected, create a data URL (in production, you'd upload to a service)
      if (imageFile && imagePreview) {
        imageUrl = imagePreview;
      }

      const result = await updateCourse(course.id, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        imageUrl: imageUrl || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setImageFile(null);
        setHasChanges(false);
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

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
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
          {/* Course Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b">
            <div className="md:col-span-1">
              <div className="bg-gray-100 rounded-lg overflow-hidden h-48">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={imagePreview}
                      alt={formData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-400 to-blue-600 text-white text-3xl font-semibold">
                    {formData.title[0] || "C"}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Course Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {chapters.length}
                    </p>
                    <p className="text-xs text-gray-600">Chapters</p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(formData.price) || 0}
                    </p>
                    <p className="text-xs text-gray-600">Price</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Course Metadata
                </h3>
                <p className="text-xs text-gray-600">
                  Created: {formatDateConsistent(course.createdAt)}
                </p>
                <p className="text-xs text-gray-600">
                  Updated: {formatDateConsistent(course.updatedAt)}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Status:</strong>{" "}
                  {course.published ? (
                    <span className="text-green-600 font-semibold">
                      Published
                    </span>
                  ) : (
                    <span className="text-gray-600">Draft</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Course Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Cover Image
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Upload size={18} className="text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Click to upload image
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
              </div>
              {imagePreview && (
                <Button
                  onClick={removeImage}
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <X size={16} />
                  Remove Image
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Recommended size: 400x300px. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Course Title */}
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
              placeholder="Enter course title"
            />
          </div>

          {/* Description */}
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
              placeholder="Describe what students will learn in this course..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-gray-600">$</span>
              <Input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                className="w-full"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set to 0 for a free course
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={handleSaveClick}
              disabled={loading || !hasChanges}
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

      {/* Save Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Save Changes?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes to your course?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
