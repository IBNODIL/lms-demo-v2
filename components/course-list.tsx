"use client";

import { CourseCard } from "./course-card";

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
}

export function CourseList({ courses }: { courses: Course[] }) {
  if (!courses.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No courses available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} {...course} />
      ))}
    </div>
  );
}
