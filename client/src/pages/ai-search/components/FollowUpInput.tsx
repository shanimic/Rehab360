import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AiConversation } from '@/types'

interface FollowUpInputProps {
  conversation: AiConversation
  onSubmit: (text: string) => void
  isPending: boolean
}

export default function FollowUpInput({ conversation, onSubmit, isPending }: FollowUpInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          💬 Ask a follow-up
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="E.g. What does the recovery timeline look like after ACL surgery?"
          rows={2}
          className={cn(
            'w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400',
            'bg-gray-50 placeholder-gray-400',
          )}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" aria-hidden="true" />
            Session active · {conversation.length} {conversation.length === 1 ? 'exchange' : 'exchanges'}
          </span>
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className={cn(
              'text-sm font-medium px-4 py-2 rounded-xl bg-blue-600 text-white',
              'hover:bg-blue-700 transition-colors min-h-[44px]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isPending ? 'Asking…' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  )
}
