"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";

export function EnrollButton({
  courseId,
  price,
}: {
  courseId: string;
  price: number;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    // Check if user is authenticated
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/courses/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to enroll in course");
        return;
      }

      // Success
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Enrollment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {price > 0 ? `Enroll - $${price.toFixed(2)}` : "Enroll Free"}
          </>
        )}
      </button>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">
        {price === 0
          ? "Get full access to this course"
          : "Secure payment. Money-back guarantee."}
      </p>
    </div>
  );
}
