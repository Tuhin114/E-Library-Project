import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names intelligently, resolving conflicting
 * utility classes (e.g. "p-2" vs "p-4"). Used by every shadcn/ui-style
 * component in components/ui.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
