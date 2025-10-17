import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  console.info("[orders] mock payload", payload);

  return NextResponse.json(
    { orderId: "mock123", status: "ok" },
    { status: 200 }
  );
}
