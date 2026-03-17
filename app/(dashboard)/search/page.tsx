"use client";

import { useState, useEffect } from "react";
import { CourseList } from "@/components/course-list";

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setAllCourses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Search in title and description
    const filtered = allCourses.filter((course) => {
      const searchLower = query.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower))
      );
    });

    setSearchResults(filtered);
    setIsSearching(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Courses</h1>
        <p className="text-gray-600 mt-2">Find courses that match your interests</p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {!searchQuery ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">All Courses</h2>
          <CourseList courses={allCourses} />
        </div>
      ) : (
        <div>
          {isSearching ? (
            <div className="text-center py-12">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No courses found for "{searchQuery}"</p>
            </div>
          ) : (
            <CourseList courses={searchResults} />
          )}
        </div>
      )}
    </div>
  );
}
