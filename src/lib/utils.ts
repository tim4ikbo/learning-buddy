import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge class names conditionally and resolve Tailwind conflicts
// - Uses clsx to join and conditionally include class names
// - Uses tailwind-merge to resolve conflicting Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
