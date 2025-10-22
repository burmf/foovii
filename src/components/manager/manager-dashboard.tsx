"use client";

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

import { cn, formatCurrency } from "@/lib/utils";

const KPI_CARDS = [
  {
    key: "revenue",
    label: "Revenue",
    value: formatCurrency(4320),
    delta: "+12% vs last Wednesday",
  },
  {
    key: "orders",
    label: "Orders",
    value: "148",
    delta: "+9 tickets",
  },
  {
    key: "aov",
    label: "Avg Order Value",
    value: formatCurrency(29.2),
    delta: "-1.4% vs 7-day avg",
  },
];

const HOURLY_DATA = [
  { hour: "11:00", orders: 12, revenue: 340 },
  { hour: "12:00", orders: 24, revenue: 780 },
  { hour: "13:00", orders: 21, revenue: 640 },
  { hour: "14:00", orders: 16, revenue: 480 },
  { hour: "15:00", orders: 11, revenue: 330 },
  { hour: "16:00", orders: 18, revenue: 510 },
  { hour: "17:00", orders: 22, revenue: 690 },
  { hour: "18:00", orders: 24, revenue: 860 },
  { hour: "19:00", orders: 29, revenue: 980 },
];

export function ManagerDashboard() {
  return (
    <section className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Manager Insights</h1>
        <p className="text-sm text-muted-foreground">
          Monitor the dining room in real time. Metrics below use sample data from Foovii&apos;s QR
          ordering flow.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {KPI_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{card.value}</p>
            <p
              className={cn(
                "mt-2 text-xs",
                card.delta.trim().startsWith("-")
                  ? "text-rose-500 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Orders & Revenue by Hour</h2>
            <p className="text-xs text-muted-foreground">Sample from last service window (Dodam)</p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Today · 11:00–19:00
          </span>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_DATA} margin={{ top: 16, right: 32, left: 0, bottom: 8 }}>
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
