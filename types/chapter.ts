export interface Chapter {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  position: number;
  isPublished: boolean;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChapterWithProgress extends Chapter {
  progress?: {
    isCompleted: boolean;
  };
}
