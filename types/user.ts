export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
