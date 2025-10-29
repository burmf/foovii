"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PeakHour {
  hour: number;
  orderCount: number;
  revenue: number;
}

interface PeakHoursChartProps {
  peakHours: PeakHour[];
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function PeakHoursChart({ peakHours }: PeakHoursChartProps) {
  if (peakHours.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50">
        <p className="text-sm text-muted-foreground">No data available yet</p>
      </div>
    );
  }

  const data = peakHours.map((item) => ({
    hour: formatHour(item.hour),
    orders: item.orderCount,
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Peak Hours</h3>
        <p className="text-sm text-muted-foreground">Busiest times by order volume</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Bar 
            dataKey="orders" 
            fill="hsl(var(--primary))" 
            radius={[8, 8, 0, 0]}
            name="Orders"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
