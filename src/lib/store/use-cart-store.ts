import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MenuItem } from "@/lib/types";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity: number;
  notes?: string;
  image?: string;
};

interface CartState {
  lines: CartLine[];
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

function buildLineId(itemId: string, notes?: string) {
  return notes ? `${itemId}::${notes}` : itemId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (item, quantity = 1, notes) =>
        set((state) => {
          const lineId = buildLineId(item.id, notes);
          const existingIndex = state.lines.findIndex(
            (line) => line.id === lineId,
          );

          if (existingIndex >= 0) {
            const updated = [...state.lines];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity,
            };
            return { lines: updated };
          }

          return {
            lines: [
              ...state.lines,
              {
                id: lineId,
                name: item.name,
                price: item.price,
                currency: item.currency,
                quantity,
                notes,
                image: item.image,
              },
            ],
          };
        }),
      increment: (id) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        })),
      decrement: (id) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.id === id
                ? { ...line, quantity: Math.max(0, line.quantity - 1) }
                : line,
            )
            .filter((line) => line.quantity > 0),
        })),
      remove: (id) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.id !== id),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "foovii-cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Helper selectors for common computations to avoid re-rendering issues
export const useCartTotals = () => {
  const lines = useCartStore((state) => state.lines);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  return { subtotal, totalQuantity };
};
