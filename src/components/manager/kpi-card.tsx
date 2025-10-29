"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  comparison?: {
    value: number;
    label: string;
  };
  icon?: React.ReactNode;
}

export function KPICard({ title, value, subtitle, comparison, icon }: KPICardProps) {
  const hasPositiveTrend = comparison && comparison.value > 0;
  const hasNegativeTrend = comparison && comparison.value < 0;
  const trendPercentage = comparison ? Math.abs(comparison.value) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {comparison && (
            <div className="mt-3 flex items-center gap-2">
              {hasPositiveTrend && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{trendPercentage.toFixed(1)}%</span>
                </div>
              )}
              {hasNegativeTrend && (
                <div className="flex items-center gap-1 text-sm font-medium text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span>{trendPercentage.toFixed(1)}%</span>
                </div>
              )}
              {comparison.value === 0 && (
                <div className="text-sm font-medium text-muted-foreground">
                  <span>No change</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">{comparison.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
