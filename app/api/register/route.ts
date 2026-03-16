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
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Register failed" },
      { status: 400 }
    );
  }
}