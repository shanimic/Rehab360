import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FollowUpBarProps {
  onSubmit: (text: string) => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
}

export default function FollowUpBar({ onSubmit, isPending, isError, errorMessage }: FollowUpBarProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div className="ais-followup-bar">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a follow-up…"
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 placeholder-gray-400"
          />
          {isError && errorMessage && (
            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isPending || !text.trim()}
          className="rounded-xl min-h-[44px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-none disabled:cursor-not-allowed disabled:pointer-events-auto"
        >
          {isPending ? (
            <><Loader2 size={16} className="animate-spin" />Asking…</>
          ) : (
            <><Send size={16} />Ask</>
          )}
        </Button>
      </form>
    </div>
  )
}
