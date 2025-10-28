import { NextResponse } from "next/server";

import { createOrder, getOrders } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const { storeSlug, customerName, customerPhone, customerEmail, items, totalCents, currency, notes } = payload;

    if (!storeSlug || !items || !Array.isArray(items) || items.length === 0 || !totalCents) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const order = await createOrder({
      store_slug: storeSlug,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      items,
      total_cents: totalCents,
      currency,
      notes,
    });

    console.info("[orders] created", order.order_number);

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.order_number,
        status: "ok",
        receivedAt: order.created_at.toISOString(),
      },
      { status: 201 }
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeSlug = searchParams.get("storeSlug");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const filters: Parameters<typeof getOrders>[0] = {};

    if (storeSlug) {
      filters.store_slug = storeSlug;
    }

    if (status) {
      const statuses = status.split(",");
      filters.status = statuses.length === 1 ? statuses[0] as any : statuses as any;
    }

    if (limit) {
      filters.limit = parseInt(limit, 10);
    }

    const orders = await getOrders(filters);

    return NextResponse.json({
      orders,
      count: orders.length,
    }, { status: 200 });
  } catch (error) {
    console.error("[orders] fetch error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to fetch orders",
      },
      { status: 500 }
    );
  }
}
