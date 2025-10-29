import { NextRequest, NextResponse } from "next/server";
import { getOrderHistory } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const storeSlug = searchParams.get("storeSlug") || undefined;
    const statusParam = searchParams.get("status");
    const orderNumber = searchParams.get("orderNumber") || undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10))) : 50;
    const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10)) : 0;

    const statuses = statusParam
      ? statusParam.split(",").map((s) => s.trim()).filter((s) => s)
      : undefined;

    const result = await getOrderHistory({
      startDate,
      endDate,
      storeSlug,
      statuses,
      orderNumber,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch order history:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
