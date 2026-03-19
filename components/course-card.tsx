"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isEnrolled?: boolean;
  progress?: number;
  chaptersTotal?: number;
  chaptersCompleted?: number;
}

export function CourseCard({
  id,
  title,
  description,
  imageUrl,
  price,
  isEnrolled,
  progress,
  chaptersTotal,
  chaptersCompleted,
}: CourseCardProps) {
  const href = isEnrolled ? `/dashboard/courses/${id}` : `/dashboard/courses/${id}`;

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer h-full flex flex-col">
        <div className="relative h-40 bg-gray-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-400 to-blue-600 text-white text-lg font-semibold">
              {title[0]}
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2 flex-1">
            {description || "No description"}
          </p>

          {isEnrolled && progress !== undefined && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {chaptersCompleted !== undefined && chaptersTotal !== undefined && (
                <p className="text-xs text-gray-500">
                  {chaptersCompleted} of {chaptersTotal} lessons completed
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className={`font-bold text-lg ${price && price > 0 ? "text-gray-900" : "text-green-600"}`}>
              {price ? `$${price}` : "Free"}
            </span>
            <span className="text-gray-500 text-sm">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
