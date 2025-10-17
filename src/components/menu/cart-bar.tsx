"use client";

import { AnimatePresence, motion } from "framer-motion";

import { formatCurrency } from "@/lib/utils";

import { useCart } from "./cart-context";

interface CartBarProps {
  onReview: () => void;
  isReviewOpen?: boolean;
}

export function CartBar({ onReview, isReviewOpen = false }: CartBarProps) {
  const { subtotal, totalQuantity } = useCart();

  return (
    <AnimatePresence>
      {totalQuantity > 0 && !isReviewOpen ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 border-t border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Your order
              </p>
              <p className="text-sm font-medium text-foreground">
                {totalQuantity} items · {formatCurrency(subtotal)}
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onReview}
              whileTap={{ scale: 0.96 }}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-primary/90"
            >
              Review order
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
