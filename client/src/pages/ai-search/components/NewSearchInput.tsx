import { useState } from 'react'
import { Search, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NewSearchInputProps {
  onSubmit: (text: string) => void
  isPending: boolean
  isError?: boolean
  errorMessage?: string
}

export default function NewSearchInput({ onSubmit, isPending, isError, errorMessage }: NewSearchInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <div
      className={cn(
        'bg-white border-t border-gray-200 rounded-2xl lg:rounded-2xl',
        'sticky bottom-0 lg:static z-10',
      )}
    >
      <form onSubmit={handleSubmit} className="p-4">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
          <Search size={16} />New search
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search for another topic…"
          rows={2}
          className={cn(
            'w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400',
            'bg-gray-50 placeholder-gray-400',
          )}
        />
        <div className="flex justify-end mt-2">
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
        </div>
        {isError && errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>
    </div>
  )
}
