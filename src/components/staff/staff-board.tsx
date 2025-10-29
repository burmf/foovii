"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";

import type { Order, OrderStatus } from "@/lib/db";
import { cn } from "@/lib/utils";

type StaffOrderStatus = "pending" | "preparing" | "ready" | "completed";

const STATUS_FLOW: StaffOrderStatus[] = ["pending", "preparing", "ready", "completed"];

const COLUMNS: Array<{
  id: StaffOrderStatus;
  title: string;
  description: string;
  accent: string;
}> = [
  {
    id: "pending",
    title: "New",
    description: "Orders just placed from QR menus.",
    accent: "border-primary/60 bg-primary/5",
  },
  {
    id: "preparing",
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
    id: "completed",
    title: "Served",
    description: "Delivered to guests.",
    accent: "border-border/60 bg-foreground/[0.03]",
  },
];

export function StaffBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?status=pending,preparing,ready,completed&limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const groupedOrders = useMemo(() => {
    const groups = new Map<StaffOrderStatus, Order[]>(
      STATUS_FLOW.map((status) => [status, [] as Order[]])
    );
    orders.forEach((order) => {
      const collection = groups.get(order.status as StaffOrderStatus);
      if (collection) {
        collection.push(order);
      }
    });
    return groups;
  }, [orders]);

  const moveOrder = async (orderId: string, nextStatus: StaffOrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus as OrderStatus,
              }
            : order
        )
      );
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleCancelClick = (orderId: string, orderNumber: string) => {
    setCancelConfirmation({ orderId, orderNumber });
  };

  const confirmCancelOrder = async () => {
    if (!cancelConfirmation) return;

    const { orderId } = cancelConfirmation;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setCancelConfirmation(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert('注文のキャンセルに失敗しました。もう一度お試しください。');
      setCancelConfirmation(null);
    }
  };

  const getNextStatus = (status: OrderStatus) => {
    const index = STATUS_FLOW.indexOf(status as StaffOrderStatus);
    return index >= 0 && index < STATUS_FLOW.length - 1 ? STATUS_FLOW[index + 1] : null;
  };

  const getPreviousStatus = (status: OrderStatus) => {
    const index = STATUS_FLOW.indexOf(status as StaffOrderStatus);
    return index > 0 ? STATUS_FLOW[index - 1] : null;
  };

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Live Orders</h1>
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </header>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Live Orders</h1>
          <p className="text-sm text-destructive">Error: {error}</p>
        </header>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Live Orders</h1>
        <p className="text-sm text-muted-foreground">
          Tap a card to progress an order through the kitchen workflow. Orders auto-refresh every 5 seconds.
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
                                  {order.customer_name || 'Guest'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  #{order.order_number} · Placed {formatRelativeTime(order.created_at)}
                                </p>
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                                  onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                  title="メニュー"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {openMenuId === order.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-10" 
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="absolute right-0 top-8 z-20 min-w-[120px] rounded-lg border border-border bg-card shadow-lg">
                                      <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          handleCancelClick(order.id, order.order_number);
                                        }}
                                      >
                                        キャンセル
                                      </button>
                                    </div>
                                  </>
                                )}
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

                            {order.items.some((item) => item.notes) || order.notes ? (
                              <div className="rounded-lg bg-foreground/[0.05] px-3 py-2 text-xs text-muted-foreground">
                                {order.notes && <div className="font-medium">Note: {order.notes}</div>}
                                {order.items
                                  .filter((item) => item.notes)
                                  .map((item, index) => (
                                    <div key={index}>{item.name}: {item.notes}</div>
                                  ))}
                              </div>
                            ) : null}

                            <footer className="flex items-center justify-between gap-2 pt-2">
                              <div className="flex items-center gap-2">
                                {prevStatus ? (
                                  <button
                                    type="button"
                                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                                    onClick={() => moveOrder(order.id, prevStatus as StaffOrderStatus)}
                                  >
                                    ← {columnLabel(prevStatus as StaffOrderStatus)}
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
                                  onClick={() => moveOrder(order.id, nextStatus as StaffOrderStatus)}
                                >
                                  Move to {columnLabel(nextStatus as StaffOrderStatus)}
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

      {cancelConfirmation && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50" 
            onClick={() => setCancelConfirmation(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-foreground">
              注文をキャンセルしますか？
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              注文 #{cancelConfirmation.orderNumber} をキャンセルしようとしています。
              <br />
              この操作は取り消せません。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                onClick={() => setCancelConfirmation(null)}
              >
                戻る
              </button>
              <button
                type="button"
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow transition hover:bg-destructive/90"
                onClick={confirmCancelOrder}
              >
                キャンセルする
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function columnLabel(status: StaffOrderStatus) {
  switch (status) {
    case "pending":
      return "New";
    case "preparing":
      return "In Progress";
    case "ready":
      return "Ready";
    case "completed":
      return "Served";
    default:
      return status;
  }
}

function formatRelativeTime(dateOrIso: Date | string) {
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
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
