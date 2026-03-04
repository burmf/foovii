import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v5 as uuidv5 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: string = "AUD",
  locale: string = "en-AU",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

// Fixed namespace for deterministic UUID generation (v5)
const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

/**
 * Generates a deterministic UUID v5 from a seed string.
 * Used to map local JSON IDs to Supabase UUIDs consistently.
 */
export function deterministicUuid(seed: string): string {
  return uuidv5(seed, UUID_NAMESPACE);
}
