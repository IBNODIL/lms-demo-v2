"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Video, Film } from "lucide-react";
import { createChapter, deleteChapter } from "@/actions/create-chapter";
import { ChapterEditor } from "./chapter-editor";

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

export function ChaptersList({
  courseId,
  chapters: initialChapters,
  onChaptersChange,
}: {
  courseId: string;
  chapters: Chapter[];
  onChaptersChange: (chapters: Chapter[]) => void;
}) {
  const [chapters, setChapters] = useState(initialChapters);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const handleAddChapter = async () => {
    if (!newTitle.trim()) {
      setError("Chapter title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createChapter(courseId, {
        title: newTitle,
      });

      if (result.success && result.chapter) {
        setChapters([...chapters, result.chapter]);
        onChaptersChange([...chapters, result.chapter]);
        setNewTitle("");
        setShowNew(false);
      } else {
        setError(result.error || "Failed to create chapter");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    try {
      const result = await deleteChapter(chapterId);

      if (result.success) {
        const updated = chapters.filter((c) => c.id !== chapterId);
        setChapters(updated);
        onChaptersChange(updated);
      } else {
        setError(result.error || "Failed to delete chapter");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleChapterUpdate = (updatedChapter: Chapter) => {
    const updated = chapters.map((c) =>
      c.id === updatedChapter.id ? updatedChapter : c
    );
    setChapters(updated);
    onChaptersChange(updated);
    setEditingChapterId(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {editingChapterId && (
        <ChapterEditor
          chapterId={editingChapterId}
          chapter={chapters.find((c) => c.id === editingChapterId)!}
          onUpdate={handleChapterUpdate}
          onClose={() => setEditingChapterId(null)}
        />
      )}

      {/* Add New Chapter */}
      {showNew && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Add New Chapter</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter chapter title"
                disabled={loading}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleAddChapter}
                disabled={loading || !newTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Chapter
              </Button>
              <Button
                onClick={() => {
                  setShowNew(false);
                  setNewTitle("");
                }}
                disabled={loading}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Film size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No chapters yet. Add your first chapter to get started.</p>
          {!showNew && (
            <Button
              onClick={() => setShowNew(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Add Chapter
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-8">
                        {chapter.position}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {chapter.title}
                        </h3>
                        {chapter.description && (
                          <p className="text-gray-600 text-sm mt-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-6 ml-11">
                      {chapter.videoUrl ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Video size={16} />
                          <span className="text-sm font-medium">
                            Video uploaded
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Video size={16} />
                          <span className="text-sm font-medium">
                            No video yet
                          </span>
                        </div>
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          chapter.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {chapter.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingChapterId(chapter.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showNew && (
            <Button
              onClick={() => setShowNew(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus size={18} />
              Add Another Chapter
            </Button>
          )}
        </>
      )}
    </div>
  );
}
