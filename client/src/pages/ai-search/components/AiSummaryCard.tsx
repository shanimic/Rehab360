import type { AiExchange } from '@/types'

interface AiSummaryCardProps {
  exchange: AiExchange
}

export default function AiSummaryCard({ exchange }: AiSummaryCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <span className="text-sm font-semibold text-white">Powered by Gemini</span>
        <span className="text-xs text-blue-200 hidden sm:block">
          always consult a professional
        </span>
      </div>

      <div className="px-4 py-4 bg-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed">{exchange.ai_summary}</p>
      </div>
    </div>
  )
}
