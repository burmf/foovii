import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "10");

    const start = startDate ? new Date(startDate) : new Date(new Date().setHours(0, 0, 0, 0));
    const end = endDate ? new Date(endDate) : new Date(new Date().setHours(23, 59, 59, 999));

    let query = sql`
      SELECT 
        item->>'id' as item_id,
        item->>'name' as item_name,
        SUM((item->>'quantity')::int) as total_quantity,
        SUM((item->>'price')::numeric * (item->>'quantity')::int) as total_revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM orders o,
      jsonb_array_elements(o.items) as item
      WHERE o.created_at >= ${start.toISOString()}
      AND o.created_at <= ${end.toISOString()}
      AND o.status != 'cancelled'
    `;

    if (storeSlug) {
      query = sql`${query} AND o.store_slug = ${storeSlug}`;
    }

    query = sql`${query}
      GROUP BY item->>'id', item->>'name'
      ORDER BY total_quantity DESC
      LIMIT ${limit}
    `;

    const result = await query;

    const topItems = result.map((row) => ({
      itemId: row.item_id as string,
      itemName: row.item_name as string,
      totalQuantity: parseInt(row.total_quantity as string),
      totalRevenue: parseFloat(row.total_revenue as string),
      orderCount: parseInt(row.order_count as string),
    }));

    return NextResponse.json({ topItems }, { status: 200 });
  } catch (error) {
    console.error("[analytics/top-items] fetch error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to fetch top items",
      },
      { status: 500 }
    );
  }
}
