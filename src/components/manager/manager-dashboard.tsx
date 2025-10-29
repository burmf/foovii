"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, DollarSign, Package, ShoppingCart } from "lucide-react";

import type { Analytics } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

import { DateRangeFilter, getDateRangeFromPreset, type DateRangePreset } from "./date-range-filter";
import { KPICard } from "./kpi-card";
import { TopItemsTable } from "./top-items-table";
import { PeakHoursChart } from "./peak-hours-chart";

interface TopItem {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

interface PeakHour {
  hour: number;
  orderCount: number;
  revenue: number;
}

export function ManagerDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangePreset>("today");

  const fetchAnalytics = useCallback(async () => {
    try {
      const { start, end } = getDateRangeFromPreset(dateRange);
      const compareWithPrevious = true;

      const [analyticsRes, topItemsRes, hourlyRes] = await Promise.all([
        fetch(`/api/analytics?startDate=${start.toISOString()}&endDate=${end.toISOString()}&compareWithPrevious=${compareWithPrevious}`),
        fetch(`/api/analytics/top-items?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=10`),
        fetch(`/api/analytics/hourly?startDate=${start.toISOString()}&endDate=${end.toISOString()}`),
      ]);

      if (!analyticsRes.ok || !topItemsRes.ok || !hourlyRes.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const [analyticsData, topItemsData, hourlyData] = await Promise.all([
        analyticsRes.json(),
        topItemsRes.json(),
        hourlyRes.json(),
      ]);

      setAnalytics(analyticsData);
      setTopItems(topItemsData.topItems || []);
      setPeakHours(hourlyData.peakHours || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

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

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueChange = analytics.comparison
    ? calculatePercentageChange(analytics.totalRevenue, analytics.comparison.revenue)
    : undefined;

  const ordersChange = analytics.comparison
    ? calculatePercentageChange(analytics.totalOrders, analytics.comparison.orders)
    : undefined;

  const avgOrderValueChange = analytics.comparison
    ? calculatePercentageChange(analytics.avgOrderValue, analytics.comparison.avgOrderValue)
    : undefined;

  return (
    <section className="flex flex-col gap-8">
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Manager Insights</h1>
          <p className="text-sm text-muted-foreground">
            Monitor your dining room in real time. Metrics auto-refresh every 30 seconds.
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          subtitle={`${analytics.totalOrders} orders`}
          comparison={
            revenueChange !== undefined
              ? { value: revenueChange, label: "vs previous period" }
              : undefined
          }
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KPICard
          title="Total Orders"
          value={analytics.totalOrders}
          subtitle={`${analytics.completedOrders} completed`}
          comparison={
            ordersChange !== undefined
              ? { value: ordersChange, label: "vs previous period" }
              : undefined
          }
          icon={<ShoppingCart className="h-6 w-6" />}
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(analytics.avgOrderValue)}
          subtitle={analytics.totalOrders > 0 ? "Per order" : "N/A"}
          comparison={
            avgOrderValueChange !== undefined
              ? { value: avgOrderValueChange, label: "vs previous period" }
              : undefined
          }
          icon={<Package className="h-6 w-6" />}
        />
        <KPICard
          title="Avg Fulfillment Time"
          value={
            analytics.avgFulfillmentTime !== null
              ? `${analytics.avgFulfillmentTime.toFixed(1)} min`
              : "N/A"
          }
          subtitle={analytics.completedOrders > 0 ? "Order to completion" : "No completed orders"}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      {analytics.hourlyData.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Orders & Revenue by Hour</h2>
              <p className="text-sm text-muted-foreground">Hourly performance breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.hourlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50">
          <p className="text-sm text-muted-foreground">
            No hourly data available. Orders will appear here once they start coming in.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <TopItemsTable items={topItems} />
        <PeakHoursChart peakHours={peakHours} />
      </div>
    </section>
  );
}
