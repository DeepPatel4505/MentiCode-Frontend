import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with support for conditional classes.
 * Automatically handles class conflicts by giving precedence to later classes.
 * 
 * @param {...any} inputs - Class names, conditional objects, or arrays
 * @returns {string} Merged class string
 * 
 * @example
 * cn('px-2 py-1', true && 'bg-red-500') // 'px-2 py-1 bg-red-500'
 * cn('px-4 py-2', 'px-2') // 'py-2 px-2' (px-2 takes precedence)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
