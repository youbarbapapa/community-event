import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decimalToNumber(value: null | number | { toString(): string }) {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value.toString());
  return Number.isNaN(parsed) ? null : parsed;
}

export function generateSlug(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}
