import { NextResponse } from "next/server";

import { updateOrderStatus } from "@/lib/db";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = await request.json().catch(() => null);

    if (!payload || !payload.status) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing status field",
        },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(payload.status)) {
      return NextResponse.json(
        {
          status: "error",
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, payload.status);

    console.info("[orders] updated", order.order_number, "to", order.status);

    return NextResponse.json({
      order,
      status: "ok",
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Order not found') {
      return NextResponse.json(
        {
          status: "error",
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    console.error("[orders] update error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to update order",
      },
      { status: 500 }
    );
  }
}
