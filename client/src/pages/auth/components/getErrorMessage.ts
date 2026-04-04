const getErrorMessage = (error: unknown): string | undefined => {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message)
  return undefined
}

export default getErrorMessage
