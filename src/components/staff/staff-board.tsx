"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type OrderStatus = "new" | "in_progress" | "ready" | "served";

type OrderItem = {
  name: string;
  quantity: number;
  notes?: string;
};

type StaffOrder = {
  id: string;
  ticket: string;
  customer?: string;
  status: OrderStatus;
  placedAt: string;
  items: OrderItem[];
};

const STATUS_FLOW: OrderStatus[] = ["new", "in_progress", "ready", "served"];

const COLUMNS: Array<{
  id: OrderStatus;
  title: string;
  description: string;
  accent: string;
}> = [
  {
    id: "new",
    title: "New",
    description: "Orders just placed from QR menus.",
    accent: "border-primary/60 bg-primary/5",
  },
  {
    id: "in_progress",
    title: "In Progress",
    description: "Kitchen is preparing these orders.",
    accent: "border-amber-500/60 bg-amber-500/10",
  },
  {
    id: "ready",
    title: "Ready",
    description: "Ready for pickup by staff.",
    accent: "border-emerald-500/60 bg-emerald-500/10",
  },
  {
    id: "served",
    title: "Served",
    description: "Delivered to guests.",
    accent: "border-border/60 bg-foreground/[0.03]",
  },
];

const INITIAL_ORDERS: StaffOrder[] = [
  {
    id: "ord-1024",
    ticket: "Table 12",
    customer: "Kim",
    status: "new",
    placedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    items: [
      { name: "Boneless Whole Chicken – Soy Garlic", quantity: 1 },
      { name: "Sprite", quantity: 2 },
    ],
  },
  {
    id: "ord-1025",
    ticket: "Table 8",
    customer: "Lee",
    status: "in_progress",
    placedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      { name: "Cupbap – Spicy Pork", quantity: 2, notes: "Medium spice" },
      { name: "Bong-Bong", quantity: 2 },
    ],
  },
  {
    id: "ord-1026",
    ticket: "Pickup",
    customer: "Delivery",
    status: "ready",
    placedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    items: [
      { name: "Cheese Corn Rib Twigim", quantity: 1 },
      { name: "Eggplant Twigim", quantity: 1 },
    ],
  },
  {
    id: "ord-1027",
    ticket: "Table 3",
    customer: "Nguyen",
    status: "served",
    placedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    items: [{ name: "Cupbap – Beef Bulgogi", quantity: 1 }],
  },
  {
    id: "ord-1028",
    ticket: "Table 18",
    customer: "Chen",
    status: "new",
    placedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    items: [
      { name: "Vegetable Mandu", quantity: 1 },
      { name: "Soy Cucumbers – Mushroom", quantity: 1 },
    ],
  },
];

export function StaffBoard() {
  const [orders, setOrders] = useState<StaffOrder[]>(INITIAL_ORDERS);

  const groupedOrders = useMemo(() => {
    const groups = new Map<OrderStatus, StaffOrder[]>(
      STATUS_FLOW.map((status) => [status, [] as StaffOrder[]])
    );
    orders.forEach((order) => {
      const collection = groups.get(order.status);
      if (collection) {
        collection.push(order);
      }
    });
    return groups;
  }, [orders]);

  const moveOrder = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
            }
          : order
      )
    );
  };

  const getNextStatus = (status: OrderStatus) => {
    const index = STATUS_FLOW.indexOf(status);
    return index >= 0 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null;
  };

  const getPreviousStatus = (status: OrderStatus) => {
    const index = STATUS_FLOW.indexOf(status);
    return index > 0 ? STATUS_FLOW[index - 1] : null;
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Live Orders</h1>
        <p className="text-sm text-muted-foreground">
          Tap a card to progress an order through the kitchen workflow. These samples match the
          Foovii QR ordering flow (New → In Progress → Ready → Served).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnOrders = groupedOrders.get(column.id) ?? [];
          return (
            <div
              key={column.id}
              className={cn(
                "flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm",
                column.accent
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{column.title}</h2>
                  <p className="text-xs text-muted-foreground">{column.description}</p>
                </div>
                <span className="rounded-full bg-background px-2 py-1 text-xs font-medium text-foreground/70">
                  {columnOrders.length}
                </span>
              </div>

              <div className="mt-4 flex flex-1 flex-col gap-3 overflow-hidden">
                {columnOrders.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40 p-4 text-center text-xs text-muted-foreground">
                    No orders in this stage.
                  </div>
                ) : (
                  <ul className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                    {columnOrders.map((order) => {
                      const nextStatus = getNextStatus(order.status);
                      const prevStatus = getPreviousStatus(order.status);
                      return (
                        <li key={order.id}>
                          <article className="flex flex-col gap-3 rounded-xl border border-border bg-card/90 p-4 shadow-sm transition hover:border-primary/60">
                            <header className="flex items-center justify-between gap-2">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                  {order.ticket}
                                  {order.customer ? ` · ${order.customer}` : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  #{order.id} · Placed {formatRelativeTime(order.placedAt)}
                                </p>
                              </div>
                            </header>

                            <ul className="space-y-2 text-sm text-foreground">
                              {order.items.map((item, index) => (
                                <li key={`${order.id}-item-${index}`} className="flex items-start justify-between gap-3">
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-muted-foreground">×{item.quantity}</span>
                                </li>
                              ))}
                            </ul>

                            {order.items.some((item) => item.notes) ? (
                              <div className="rounded-lg bg-foreground/[0.05] px-3 py-2 text-xs text-muted-foreground">
                                {order.items
                                  .filter((item) => item.notes)
                                  .map((item) => `${item.name}: ${item.notes}`)
                                  .join(" · ")}
                              </div>
                            ) : null}

                            <footer className="flex items-center justify-between gap-2 pt-2">
                              <div className="flex items-center gap-2">
                                {prevStatus ? (
                                  <button
                                    type="button"
                                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                                    onClick={() => moveOrder(order.id, prevStatus)}
                                  >
                                    ← {columnLabel(prevStatus)}
                                  </button>
                                ) : (
                                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                    Start stage
                                  </span>
                                )}
                              </div>

                              {nextStatus ? (
                                <button
                                  type="button"
                                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow transition hover:bg-primary/90"
                                  onClick={() => moveOrder(order.id, nextStatus)}
                                >
                                  Move to {columnLabel(nextStatus)}
                                </button>
                              ) : (
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  Complete
                                </span>
                              )}
                            </footer>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function columnLabel(status: OrderStatus) {
  switch (status) {
    case "new":
      return "New";
    case "in_progress":
      return "In Progress";
    case "ready":
      return "Ready";
    case "served":
      return "Served";
    default:
      return status;
  }
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "recently";
  }
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  if (diffMinutes <= 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;
  if (diffHours >= 4) {
    return date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
  }
  if (remainingMinutes === 0) {
    return `${diffHours} hr ago`;
  }
  return `${diffHours} hr ${remainingMinutes} min ago`;
}
