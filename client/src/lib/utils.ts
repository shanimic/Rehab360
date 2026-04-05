import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extracts a string message from a TanStack Form field error (string or StandardSchemaV1Issue). */
export function errMsg(error: unknown): string | undefined {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message)
  return String(error)
}
