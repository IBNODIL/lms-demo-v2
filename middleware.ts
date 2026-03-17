import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

async function authenticateRequest(request: NextRequest) {
  const url = new URL(request.url);
  
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/search"];
  
  if (publicRoutes.includes(url.pathname)) {
    return null;
  }

  // Try to get session - for now we'll return null if no session
  // In production, you'd implement proper session validation
  return null;
}

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // Public routes
  const publicRoutes = ["/", "/login", "/register"];
  const isPublic = publicRoutes.includes(url.pathname);
  
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes - add session validation here
  // For now, allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
