import { auth } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get the session from the request headers (cookies)
    const session = await auth.api.getSession({ 
      headers: req.headers
    });
    
    if (session?.user) {
      // Session exists, proceed with logout by clearing the session cookie
      const response = NextResponse.json(
        { message: "Logout successful" },
        { status: 200 }
      );
      
      // Clear the session cookies
      response.cookies.delete("better-auth.session_token");
      response.cookies.delete("better-auth.csrf_token");
      
      return response;
    }

    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
