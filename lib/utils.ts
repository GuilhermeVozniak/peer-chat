import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(e: Error) {
  throw new Error(
    `Failed to initialize stream: ${e instanceof Error ? e.message : 'Unknown error'}`,
  );
}
