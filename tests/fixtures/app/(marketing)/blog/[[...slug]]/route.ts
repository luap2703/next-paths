import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const draft = searchParams.get("draft");
  return NextResponse.json({ message: "Blog post", draft });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ message: "Blog post created", data });
}

export async function PUT(request: Request) {
  const data = await request.json();
  return NextResponse.json({ message: "Blog post updated", data });
}
