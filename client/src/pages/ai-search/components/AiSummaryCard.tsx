import { useState } from 'react'
import { Sparkles, Hospital } from 'lucide-react'
import type { AiExchange } from '@/types'

interface AiSummaryCardProps {
  exchange: AiExchange
}

const GEMINI_LOGO_URL = 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg'

export default function AiSummaryCard({ exchange }: AiSummaryCardProps) {
  const [geminiLogoError, setGeminiLogoError] = useState(false)
  const injectedCount = exchange.sources.filter((s) => s.is_injected).length

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          {geminiLogoError ? (
            <Sparkles size={20} className="text-white" aria-hidden="true" />
          ) : (
            <img
              src={GEMINI_LOGO_URL}
              alt="Gemini"
              width={20}
              height={20}
              onError={() => setGeminiLogoError(true)}
            />
          )}
          <span className="text-sm font-semibold text-white">Powered by Gemini AI</span>
        </div>
        <div className="flex items-center gap-3">
          {injectedCount > 0 && (
            <span className="text-xs text-blue-200 hidden sm:flex items-center gap-1">
              <Hospital size={14} aria-hidden="true" />
              {injectedCount} clinic-verified {injectedCount === 1 ? 'source' : 'sources'}
            </span>
          )}
          <span className="text-xs text-blue-200 hidden sm:block">
            Always consult your healthcare professional
          </span>
        </div>
      </div>

      <div className="px-4 py-4 bg-gray-100">
        <p className="text-sm text-gray-700 leading-relaxed">{exchange.ai_summary}</p>
      </div>
    </div>
  )
}
