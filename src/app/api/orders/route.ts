import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    console.info("[orders] received", payload);

    return NextResponse.json(
      {
        orderId: `mock-${Date.now()}`,
        status: "ok",
        receivedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[orders] error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to process order",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "alive" }, { status: 200 });
}
