import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Supports two variants:
//   'inline'  — used in the idle state, sits in the normal document flow
//   'fixed'   — used in the results state, portaled to <body> and positioned fixed
interface FollowUpBarProps {
  onSubmit: (text: string) => void
  isPending: boolean
  isError: boolean
  errorMessage?: string
  placeholder?: string
  // Controlled mode: pass value + onValueChange (idle state pre-fill from chips/atom)
  // Uncontrolled mode: omit both (results state manages its own text)
  value?: string
  onValueChange?: (v: string) => void
  variant?: 'fixed' | 'inline'
}

export default function FollowUpBar({
  onSubmit,
  isPending,
  isError,
  errorMessage,
  placeholder = 'Ask a follow-up…',
  value,
  onValueChange,
  variant = 'fixed',
}: FollowUpBarProps) {
  const [internalText, setInternalText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Controlled when value prop is provided, uncontrolled otherwise
  const text = value !== undefined ? value : internalText

  // Auto-resize textarea to fit content, capped by CSS max-height.
  // In fixed variant, also tracks bar height via --ais-bar-height so the
  // scroll-to-bottom button can position itself above the bar.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.overflowY = 'hidden'
    el.style.height = `${el.scrollHeight}px`
    const maxPx = parseFloat(getComputedStyle(el).maxHeight)
    if (!isNaN(maxPx) && el.scrollHeight > maxPx) {
      el.style.overflowY = 'auto'
    }
    if (variant === 'fixed' && containerRef.current) {
      const bar = containerRef.current
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--ais-bar-height', `${bar.offsetHeight}px`)
      })
    }
  }, [text, variant])

  // Clean up the CSS variable when the fixed bar unmounts (results → idle transition)
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--ais-bar-height')
    }
  }, [])

  function handleChange(v: string) {
    if (value !== undefined) {
      onValueChange?.(v)
    } else {
      setInternalText(v)
    }
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    onSubmit(trimmed)
    // Only clear internally when uncontrolled; parent owns state in controlled mode
    if (value === undefined) {
      setInternalText('')
    }
  }

  // Enter submits; Shift+Enter inserts a newline
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div ref={containerRef} className={cn('ais-followup-bar', variant === 'inline' && 'ais-followup-bar--inline')}>
      <div className="flex flex-col gap-1">
        {/* Error is rendered outside the flex row so it doesn't affect button height */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-stretch">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 placeholder-gray-400"
          />
          {/* self-stretch makes the button exactly as tall as the textarea */}
          <Button
            type="submit"
            disabled={isPending || !text.trim()}
            className="rounded-xl self-stretch bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-none disabled:cursor-not-allowed disabled:pointer-events-auto"
          >
            {isPending ? (
              <><Loader2 size={16} className="animate-spin" />Asking…</>
            ) : (
              <><Send size={16} />Ask</>
            )}
          </Button>
        </form>
        {isError && errorMessage && (
          <p className="text-red-500 text-xs">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}
