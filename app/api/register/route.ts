import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    return Response.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Register failed";
    console.error("Registration error:", error);
    return Response.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}