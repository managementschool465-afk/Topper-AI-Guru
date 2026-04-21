import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Dinamic Tailwind classes ko merge karne ke liye helper.
 * Isse "className" conflicts solve hote hain.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
