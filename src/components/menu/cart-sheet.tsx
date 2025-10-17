"use client";

import { AnimatePresence, motion } from "framer-motion";

import type { StoreConfig } from "@/lib/types";

import { CartReviewPanel } from "./cart-review-panel";

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  store: StoreConfig;
}

export function CartSheet({ open, onClose, store }: CartSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-4 pb-6 pt-12 sm:items-center"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="w-full max-w-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <CartReviewPanel store={store} onClose={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
