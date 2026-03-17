import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // TODO: Implement UploadThing endpoint
    return NextResponse.json({ message: "Upload endpoint" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
