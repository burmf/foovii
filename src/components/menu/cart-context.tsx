"use client";

import { createContext, useContext, useMemo, useReducer } from "react";

import type { MenuItem } from "@/lib/types";

type CartLine = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity: number;
  notes?: string;
  image?: string;
};

type CartAction =
  | { type: "add"; payload: { item: MenuItem; quantity: number; notes?: string } }
  | { type: "increment"; payload: { id: string } }
  | { type: "decrement"; payload: { id: string } }
  | { type: "remove"; payload: { id: string } }
  | { type: "clear" };

type CartState = {
  lines: CartLine[];
};

const CartContext = createContext<{
  lines: CartLine[];
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  subtotal: number;
  totalQuantity: number;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const { item, quantity, notes } = action.payload;
      const existingIndex = state.lines.findIndex(
        (line) => line.id === buildLineId(item.id, notes)
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
            id: buildLineId(item.id, notes),
            name: item.name,
            price: item.price,
            currency: item.currency,
            quantity,
            notes,
            image: item.image,
          },
        ],
      };
    }
    case "increment": {
      const updated = state.lines.map((line) =>
        line.id === action.payload.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      );
      return { lines: updated };
    }
    case "decrement": {
      const updated = state.lines
        .map((line) =>
          line.id === action.payload.id
            ? { ...line, quantity: Math.max(0, line.quantity - 1) }
            : line
        )
        .filter((line) => line.quantity > 0);
      return { lines: updated };
    }
    case "remove":
      return {
        lines: state.lines.filter((line) => line.id !== action.payload.id),
      };
    case "clear":
      return { lines: [] };
    default:
      return state;
  }
}

function buildLineId(itemId: string, notes?: string) {
  return notes ? `${itemId}::${notes}` : itemId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] });

  const value = useMemo(() => {
    const subtotal = state.lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    );
    const totalQuantity = state.lines.reduce(
      (sum, line) => sum + line.quantity,
      0
    );
    return {
      lines: state.lines,
      subtotal,
      totalQuantity,
      addItem: (item: MenuItem, quantity = 1, notes?: string) =>
        dispatch({ type: "add", payload: { item, quantity, notes } }),
      increment: (id: string) =>
        dispatch({ type: "increment", payload: { id } }),
      decrement: (id: string) =>
        dispatch({ type: "decrement", payload: { id } }),
      remove: (id: string) =>
        dispatch({ type: "remove", payload: { id } }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
