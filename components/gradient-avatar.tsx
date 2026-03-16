"use client";

import { getGradientColors, getInitial } from "@/lib/avatar-utils";

interface GradientAvatarProps {
  name: string | null | undefined;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}

export function GradientAvatar({ name, image, size = "md" }: GradientAvatarProps) {
  const displayName = name || "U"; // Default to "U" if name is null/undefined
  const { from, to } = getGradientColors(displayName);
  const initial = getInitial(displayName);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  if (image) {
    return (
      <img
        src={image}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-linear-to-br ${from} ${to} flex items-center justify-center text-white font-bold shadow-md`}
    >
      {initial}
    </div>
  );
}
