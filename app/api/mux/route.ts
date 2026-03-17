import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // TODO: Implement Mux endpoint
    return NextResponse.json({ message: "Mux endpoint" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Mux request failed" },
      { status: 500 }
    );
  }
}
