import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a YYYY-MM-DD date key from local date components.
 * This avoids timezone issues that occur with toISOString() which converts to UTC.
 * 
 * @param date - The date to convert
 * @returns A string in YYYY-MM-DD format using local timezone
 */
export function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
