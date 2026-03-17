"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GradientAvatar } from "@/components/gradient-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function MainPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    // router.push("/login");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Redirecting to login...</p>
      </div>
    );
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between shadow-xl p-4">
        <h1 className="text-xl font-bold">My App</h1>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer hover:opacity-80 transition-opacity rounded-full">
            <GradientAvatar name={user.name} image={user.image} size="md" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2">
            <div className="mb-2 p-2 border-b">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <DropdownMenuItem>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Log out"}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <main className="p-6">
        <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
        <p className="mt-2 text-gray-600">This is your main dashboard.</p>
      </main>
    </div>
  );
}