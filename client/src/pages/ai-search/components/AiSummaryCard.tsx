import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { AiExchange } from '@/types'

interface AiSummaryCardProps {
  exchange: AiExchange
  defaultCollapsed?: boolean
}

export default function AiSummaryCard({ exchange, defaultCollapsed = false }: AiSummaryCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const injectedCount = exchange.sources.filter((s) => s.is_injected).length

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
          <span className="text-sm font-semibold text-white">AI Summary</span>
        </div>
        <span className="text-xs text-blue-200 hidden sm:block">
          Always consult your healthcare professional
        </span>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 bg-gradient-to-br from-blue-50 to-purple-50">
          <p className="text-sm text-gray-700 leading-relaxed">{exchange.ai_summary}</p>
        </div>
      )}

      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3',
          collapsed ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-blue-50',
        )}
      >
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'text-xs font-medium underline-offset-2 hover:underline min-h-[44px] text-left',
            collapsed ? 'text-white' : 'text-blue-600',
          )}
        >
          {collapsed ? '▶ Expand summary' : '▲ Collapse summary'}
        </button>
        {injectedCount > 0 && (
          <span className={cn('text-xs', collapsed ? 'text-blue-200' : 'text-blue-500')}>
            🏥 {injectedCount} clinic-verified {injectedCount === 1 ? 'source' : 'sources'} included
          </span>
        )}
      </div>
    </div>
  )
}
