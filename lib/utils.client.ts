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

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function parseJson<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}
