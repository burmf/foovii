import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    let query = sql`
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as order_count,
        COALESCE(SUM(total_cents), 0) as total_revenue,
        COALESCE(AVG(total_cents), 0) as avg_order_value
      FROM orders
      WHERE created_at >= ${start.toISOString()}
      AND created_at <= ${end.toISOString()}
      AND status != 'cancelled'
    `;

    if (storeSlug) {
      query = sql`${query} AND store_slug = ${storeSlug}`;
    }

    query = sql`${query}
      GROUP BY EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)
      ORDER BY hour, day_of_week
    `;

    const result = await query;

    const hourlyData = result.map((row) => ({
      hour: parseInt(row.hour as string),
      dayOfWeek: parseInt(row.day_of_week as string),
      orderCount: parseInt(row.order_count as string),
      totalRevenue: parseFloat(row.total_revenue as string) / 100,
      avgOrderValue: parseFloat(row.avg_order_value as string) / 100,
    }));

    const peakHours = [...result]
      .sort((a, b) => parseInt(b.order_count as string) - parseInt(a.order_count as string))
      .slice(0, 5)
      .map((row) => ({
        hour: parseInt(row.hour as string),
        orderCount: parseInt(row.order_count as string),
        revenue: parseFloat(row.total_revenue as string) / 100,
      }));

    return NextResponse.json({ hourlyData, peakHours }, { status: 200 });
  } catch (error) {
    console.error("[analytics/hourly] fetch error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to fetch hourly analytics",
      },
      { status: 500 }
    );
  }
}
