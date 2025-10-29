"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { Order } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { getDateRangeFromPreset, type DateRangePreset } from "./date-range-filter";

interface OrderHistoryTableProps {
  storeSlug?: string;
}

type ExtendedDateRangePreset = DateRangePreset | "all";

export function OrderHistoryTable({ storeSlug }: OrderHistoryTableProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<ExtendedDateRangePreset>("last7days");

  const limit = 20;

  const fetchOrderHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * limit;

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (storeSlug) {
        params.append("storeSlug", storeSlug);
      }

      if (searchTerm.trim()) {
        params.append("orderNumber", searchTerm.trim());
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (dateRange !== "all") {
        const { start, end } = getDateRangeFromPreset(dateRange);
        params.append("startDate", start.toISOString());
        params.append("endDate", end.toISOString());
      }

      const response = await fetch(`/api/orders/history?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, dateRange, storeSlug]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedOrder) {
        setSelectedOrder(null);
      }
    };

    if (selectedOrder) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [selectedOrder]);

  const totalPages = Math.ceil(total / limit);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "New";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as ExtendedDateRangePreset);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">New</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No orders found</p>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                        {order.order_number}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {order.customer_name || "Guest"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                        {formatCurrency(order.total_cents / 100)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Order Details - {selectedOrder.order_number}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm text-foreground">{selectedOrder.customer_name || "Guest"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(selectedOrder.status)}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedOrder.total_cents / 100)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          ×{item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price / 100)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm text-foreground">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
