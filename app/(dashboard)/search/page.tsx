"use client";

import { useState } from "react";
import { CourseList } from "@/components/course-list";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // TODO: Search courses
      setIsSearching(false);
    } catch (error) {
      console.error(error);
      setIsSearching(false);
    }
  };

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

      {searchQuery && (
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
