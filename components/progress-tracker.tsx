"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ProgressTrackerProps {
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  totalChapters: number;
  completedChapters: number;
}

export function ProgressTracker({
  courseId,
  chapterId,
  chapterTitle,
  totalChapters,
  completedChapters,
}: ProgressTrackerProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressPercentage = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

  useEffect(() => {
    // Check if this chapter is completed
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${chapterId}`);
        if (response.ok) {
          const data = await response.json();
          setIsCompleted(data.isCompleted || false);
        }
      } catch (error) {
        console.error("Failed to check progress:", error);
      }
    };

    checkProgress();
  }, [chapterId]);

  const handleMarkComplete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chapterId,
          isCompleted: !isCompleted,
        }),
      });

      if (response.ok) {
        setIsCompleted(!isCompleted);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update progress");
        console.error("Failed to update progress:", data);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
      setError(errorMsg);
      console.error("Failed to update progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Alert about progress not saving */}
      {showAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded flex gap-3 items-start">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800">Note</h3>
            <p className="text-yellow-700 text-sm">
              Progress tracking is for demonstration purposes. Your course progress is not persistently saved to the
              database in this demo version.
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-yellow-600 hover:text-yellow-800 font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Progress Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-3">
          {/* Current Chapter */}
          <div>
            <p className="text-sm text-gray-600">Currently Watching</p>
            <p className="font-semibold text-gray-900">{chapterTitle}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Course Progress</p>
              <p className="text-sm font-semibold text-gray-900">
                {completedChapters} / {totalChapters} completed
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}% complete</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="pt-2 border-t border-gray-200">
              <div className="bg-red-50 text-red-700 text-sm p-2 rounded border border-red-200">
                {error}
              </div>
            </div>
          )}

          {/* Mark as Complete Button */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleMarkComplete}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isCompleted
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:hover:bg-green-50"
                  : "bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Updating...
                </>
              ) : isCompleted ? (
                <>
                  <CheckCircle size={18} />
                  Completed
                </>
              ) : (
                <>
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
