import axios from 'axios'

export function resolveSearchError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 503) {
      return 'The AI service is temporarily busy. Please try again in a moment.'
    }
    return error.response?.data?.detail ?? 'Something went wrong. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}