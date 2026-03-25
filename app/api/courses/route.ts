import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log("📝 Session lookup result:", session ? `Found: ${session.user.id}` : "Not found");
    console.log("🔍 Headers:", {
      cookie: headersList.get("cookie"),
      authorization: headersList.get("authorization"),
    });

    // Teachers can see all their own courses (including drafts)
    // Students only see published courses
    // Unauthenticated users only see published courses
    let courses;
    
    if (session?.user && session.user.role === "TEACHER") {
      // Teachers see their own courses
      courses = await prisma.course.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Students and unauthenticated users see all published courses
      courses = await prisma.course.findMany({
        where: {
          published: true,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    
    // Get session token from cookies
    const cookieHeader = headersList.get("cookie");
    const sessionTokenMatch = cookieHeader?.match(/better-auth\.session_token=([^;]+)/);
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : null;

    let session = null;
    if (sessionToken) {
      // Find session by token
      const dbSession = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true },
      });

      if (dbSession && dbSession.expiresAt > new Date()) {
        session = { user: dbSession.user };
      }
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create courses" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, categoryId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description: description || "",
        price: price || 0,
        userId: session.user.id,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
