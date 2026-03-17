"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Maximize } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen?.();
    }
  };

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play Button Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <Pause size={64} className="text-white" />
          ) : (
            <Play size={64} className="text-white" />
          )}
        </button>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Progress Bar */}
          <div
            onClick={handleProgressClick}
            className="w-full h-1 bg-gray-600 cursor-pointer hover:h-2 transition-all group"
          >
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(progress / duration) * 100}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white text-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="hover:bg-white/20 p-2 rounded transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <Volume2 size={16} className="hover:bg-white/20 p-2 w-8 h-8 rounded transition-colors cursor-pointer" />
              <span>
                {formatTime(progress)} / {formatTime(duration)}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="hover:bg-white/20 p-2 rounded transition-colors"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
      </div>
    </div>
  );
}
