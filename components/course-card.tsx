"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
}

export function CourseCard({
  id,
  title,
  description,
  imageUrl,
  price,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer">
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

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {description || "No description"}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-blue-600 font-bold text-lg">
              {price ? `$${price}` : "Free"}
            </span>
            <span className="text-gray-500 text-sm">Learn more →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
