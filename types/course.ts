import { Chapter } from "./chapter";

export interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  published: boolean;
  userId: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseWithRelations extends Course {
  user: {
    name?: string;
    email: string;
  };
  chapters: Chapter[];
  purchaseCount?: number;
}
