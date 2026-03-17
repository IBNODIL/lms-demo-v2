"use client";

import { useEffect, useState } from "react";
import { CourseList } from "@/components/course-list";

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // TODO: Fetch enrolled courses
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here are your enrolled courses.</p>
      </div>

      <div>
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No courses yet. Start exploring!</p>
          </div>
        ) : (
          <CourseList courses={courses} />
        )}
      </div>
    </div>
  );
}
