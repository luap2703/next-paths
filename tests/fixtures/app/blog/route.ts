import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Blog list" });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ message: "Blog created", data });
}

export async function PUT(request: Request) {
  const data = await request.json();
  return NextResponse.json({ message: "Blog updated", data });
}
