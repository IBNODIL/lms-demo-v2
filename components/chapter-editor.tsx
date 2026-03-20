"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, Upload } from "lucide-react";
import { updateChapter } from "@/actions/create-chapter";

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

export function ChapterEditor({
  chapterId,
  chapter,
  onUpdate,
  onClose,
}: {
  chapterId: string;
  chapter: Chapter;
  onUpdate: (chapter: Chapter) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: chapter.title,
    description: chapter.description || "",
    videoUrl: chapter.videoUrl || "",
    isPublished: chapter.isPublished,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  const handleTogglePublish = () => {
    setFormData((prev) => ({
      ...prev,
      isPublished: !prev.isPublished,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Chapter title is required");
      return;
    }

    setShowConfirmDialog(false);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateChapter(chapterId, {
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl || undefined,
        isPublished: formData.isPublished,
      });

      if (result.success && result.chapter) {
        setSuccess(true);
        setHasChanges(false);
        onUpdate(result.chapter);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Failed to save chapter");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = () => {
    if (!formData.title.trim()) {
      setError("Chapter title is required");
      return;
    }
    setShowConfirmDialog(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Chapter</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              Chapter saved successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title <span className="text-red-500">*</span>
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <div className="space-y-2">
              <Input
                name="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://example.com/video.mp4"
                disabled={loading}
                className="w-full"
              />
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 space-y-2">
                <p className="font-semibold">💡 Example video URLs for testing:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4"}))}
                      className="hover:underline text-blue-600"
                    >
                      Big Buck Bunny (Blender)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4"}))}
                      className="hover:underline text-blue-600"
                    >
                      Elephant's Dream
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4"}))}
                      className="hover:underline text-blue-600"
                    >
                      For Bigger Blazes
                    </button>
                  </li>
                </ul>
                <p className="text-xs mt-2">Or paste your own video URL (MP4, WebM, or Mux URLs supported)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={handleTogglePublish}
                disabled={!formData.videoUrl || loading}
                className="rounded"
              />
              <span className="text-sm">
                {formData.isPublished ? (
                  <span className="text-green-600 font-semibold">
                    Published - Students can view this chapter
                  </span>
                ) : (
                  <span className="text-gray-600">
                    Draft - Chapter is hidden from students
                  </span>
                )}
              </span>
            </div>
            {!formData.videoUrl && (
              <p className="text-xs text-yellow-600 mt-2">
                Add a video URL before publishing this chapter.
              </p>
            )}
          </div>

          {/* Preview */}
          {formData.videoUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Preview
              </label>
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex gap-4 justify-end">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveClick}
            disabled={loading || !formData.title.trim() || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Save size={18} />
            Save Chapter
          </Button>
        </div>

        {/* Save Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Save Changes?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to save these changes to this chapter?
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
    </div>
  );
}
