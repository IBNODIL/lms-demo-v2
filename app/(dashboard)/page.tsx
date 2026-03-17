"use client";

import { useEffect, useState } from "react";
import { CourseList } from "@/components/course-list";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  published: boolean;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    progress: 0,
    certificates: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
        setStats({
          totalCourses: data?.length || 0,
          progress: 0,
          certificates: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your learning management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Courses</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
          <p className="text-gray-600 text-sm">courses available</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Progress</h3>
          <p className="text-3xl font-bold text-green-600">{stats.progress}%</p>
          <p className="text-gray-600 text-sm">overall progress</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-2">Certificates</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.certificates}</p>
          <p className="text-gray-600 text-sm">earned</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Available Courses</h3>
          <Link href="/search" className="text-blue-600 hover:text-blue-700">
            View All
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-600">Loading courses...</p>
        ) : courses.length > 0 ? (
          <CourseList courses={courses.slice(0, 4)} />
        ) : (
          <p className="text-gray-600">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}