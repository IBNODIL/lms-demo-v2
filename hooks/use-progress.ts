"use client";

import { useEffect, useState } from "react";

export function useProgress(courseId: string) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // TODO: Fetch progress from API
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId]);

  return { progress, loading };
}
