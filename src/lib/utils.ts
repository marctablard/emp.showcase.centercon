import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TODO fill with correct sizes
export const imageSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"