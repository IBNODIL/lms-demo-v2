"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "TEACHER";
  image: string | null;
}

export function useUser() {
  const { data: session, isPending } = authClient.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session?.user]);

  return {
    user,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session?.user,
  };
}
