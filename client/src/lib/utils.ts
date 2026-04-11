import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function errMsg(error: unknown): string | undefined {
  if (!error) return undefined;

  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    // Handle objects with a 'message' property (StandardSchemaV1Issue, Error objects, etc.)
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // If it's a standard Error object without a custom 'message' property check
    if (error instanceof Error) {
      return error.message;
    }
  }
}
