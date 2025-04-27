import { type ClassValue, clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes
 * @param inputs - Tailwind CSS classes
 * @returns Merged Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
