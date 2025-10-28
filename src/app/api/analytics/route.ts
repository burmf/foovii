import { NextResponse } from "next/server";

import { getAnalytics } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filters: Parameters<typeof getAnalytics>[0] = {};

    if (storeSlug) {
      filters.store_slug = storeSlug;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    const analytics = await getAnalytics(filters);

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("[analytics] fetch error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to fetch analytics",
      },
      { status: 500 }
    );
  }
}
