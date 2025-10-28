"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Payload, TooltipProps } from "recharts";

import type { Analytics } from "@/lib/db";
import { cn, formatCurrency } from "@/lib/utils";

export function ManagerDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <section className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Manager Insights</h1>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </header>
      </section>
    );
  }

  if (error || !analytics) {
    return (
      <section className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Manager Insights</h1>
          <p className="text-sm text-destructive">
            {error || 'No analytics data available'}
          </p>
        </header>
      </section>
    );
  }

  const kpiCards = [
    {
      key: "revenue",
      label: "Revenue",
      value: formatCurrency(analytics.totalRevenue),
      delta: `${analytics.totalOrders} orders today`,
    },
    {
      key: "orders",
      label: "Orders",
      value: analytics.totalOrders.toString(),
      delta: analytics.totalOrders > 0 ? "Active orders" : "No orders yet",
    },
    {
      key: "aov",
      label: "Avg Order Value",
      value: formatCurrency(analytics.avgOrderValue),
      delta: analytics.totalOrders > 0 ? "Today's average" : "N/A",
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Manager Insights</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your dining room in real time. Metrics auto-refresh every 30 seconds.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {kpiCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      {analytics.hourlyData.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Orders & Revenue by Hour</h2>
              <p className="text-xs text-muted-foreground">Today's performance</p>
            </div>
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Today
            </span>
          </div>

          <div className="mt-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourlyData} margin={{ top: 16, right: 32, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 6" strokeOpacity={0.4} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  yAxisId="orders"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  stroke="var(--muted-foreground)"
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--primary)", strokeWidth: 1 }} />
                <Area
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="var(--primary)"
                  fill="url(#ordersGradient)"
                  strokeWidth={2}
                  name="Orders"
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            No hourly data available. Orders will appear here once they start coming in.
          </p>
        </div>
      )}
    </section>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const typedPayload = payload as Payload<number, string>[];
  const ordersPoint = typedPayload.find((item) => item.dataKey === "orders");
  const revenuePoint = typedPayload.find((item) => item.dataKey === "revenue");

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">
        Orders: <span className="font-medium text-foreground">{ordersPoint?.value ?? 0}</span>
      </p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-medium text-foreground">{formatCurrency(revenuePoint?.value ?? 0)}</span>
      </p>
    </div>
  );
}
