"use client";

export type DateRangePreset = "today" | "yesterday" | "last7days" | "last30days" | "thisMonth" | "lastMonth";

interface DateRangeFilterProps {
  value: DateRangePreset;
  onChange: (preset: DateRangePreset) => void;
}

const presets: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
];

export function getDateRangeFromPreset(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (preset) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "last7days":
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "last30days":
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "thisMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "lastMonth":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
      };
  }
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
            value === preset.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
