"use client";

import { formatCurrency } from "@/lib/utils";

interface TopItem {
  itemId: string;
  itemName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

interface TopItemsTableProps {
  items: TopItem[];
}

export function TopItemsTable({ items }: TopItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-background/50">
        <p className="text-sm text-muted-foreground">No menu items ordered yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Top Menu Items</h3>
        <p className="text-sm text-muted-foreground">Most popular dishes by quantity sold</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Item
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Orders
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {items.map((item, index) => (
              <tr key={item.itemId} className="transition hover:bg-muted/10">
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {index === 0 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-white">
                        1
                      </span>
                    )}
                    {index === 1 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white">
                        2
                      </span>
                    )}
                    {index === 2 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                        3
                      </span>
                    )}
                    {index > 2 && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{item.itemName}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-foreground">{item.totalQuantity}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="font-semibold text-primary">{formatCurrency(item.totalRevenue)}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-sm text-muted-foreground">{item.orderCount}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
