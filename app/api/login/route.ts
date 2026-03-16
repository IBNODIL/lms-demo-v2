import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await auth.api.signInEmail({
      body: {
        email: body.email,
        password: body.password,
      },
    });

    return Response.json(result);
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Login failed" },
      { status: 400 }
    );
  }
}