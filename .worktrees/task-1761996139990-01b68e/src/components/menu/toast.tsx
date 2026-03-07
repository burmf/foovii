"use client";

import { motion } from "framer-motion";

type ToastProps = {
  message: string;
  tone?: "success" | "error" | "info";
  onDismiss: () => void;
};

export function Toast({ message, tone = "info", onDismiss }: ToastProps) {
  const toneClasses = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-primary text-primary-foreground",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="fixed bottom-24 left-1/2 z-40 w-[min(90vw,320px)] -translate-x-1/2"
    >
      <button
        type="button"
        onClick={onDismiss}
        className={`w-full rounded-full px-5 py-3 text-sm font-semibold tracking-[0.2em] shadow-lg transition hover:shadow-xl ${toneClasses[tone]}`}
      >
        {message}
      </button>
    </motion.div>
  );
}
