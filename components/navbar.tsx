"use client";

import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Menu, X } from "lucide-react";

export function Navbar({ onMenuClick, userRole }: { onMenuClick: () => void; userRole?: string }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            LMS
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg transition-colors ${pathname === "/dashboard"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className={`px-3 py-2 rounded-lg transition-colors ${pathname === "/search"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Search
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-600">{session?.user?.email}</p>
                </div>
                {userRole === "TEACHER" && (
                  <Link
                    href="/teacher/courses"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Teacher Dashboard
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    setDropdownOpen(false);
                    redirect("/login");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
