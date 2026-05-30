import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { useAtom, useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { currentQueryAtom, searchResultsAtom, searchModeAtom } from '@/store/aiSearchAtom'
import { useAiSearchMutation } from '@/hooks/useAiSearchMutation'
import { resolveSearchError } from '@/lib/aiSearchUtils'
import BackButton from '@/components/ui/BackButton'
import TopNav from '@/components/TopNav'
import QueryChips from './components/QueryChips'
import SearchResultsArea from './components/SearchResultsArea'
import FollowUpBar from './components/FollowUpBar'
import ScrollToBottomButton from './components/ScrollToBottomButton'
import geminiLogo from '@/assets/gemini-logo.svg'
import './AiSearchPage.css'

export default function AiSearchPage() {
  const auth = useAtomValue(authAtom)
  const [currentQuery, setCurrentQuery] = useAtom(currentQueryAtom)
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom)
  const searchMode = useAtomValue(searchModeAtom)
  const searchMutation = useAiSearchMutation()
  const navigate = useNavigate()

  // True when no search has been submitted yet (no results and not loading)
  const isIdle = searchResults === null && !searchMutation.isPending

  // Pre-fill the bar when the user clicks a suggestion chip
  function handleChipSelect(chip: string) {
    setCurrentQuery(chip)
  }

  // Navigate back to the correct home depending on user role
  function handleBack() {
    if (auth?.role === 'PHYSIOTHERAPIST') navigate('/physiotherapist/home')
    else if (auth?.role === 'FITNESS_TRAINER') navigate('/fitness/home')
    else navigate('/patient')
  }

  return (
    <div className="ais-page pt-16">
      <TopNav />

      <main className="ais-page__main">
        {/* ── Idle state: no search submitted yet ── */}
        {isIdle ? (
          <div className="ais-page__idle">
            <div className="ais-page__back-row">
              <BackButton onClick={handleBack} aria-label="Back to home" />
            </div>

            <div className="ais-page__idle-center">
              <h1 className="ais-page__headline">AI Search</h1>

              {/* Gemini branding — logo already contains the word "Gemini" */}
              <div className="ais-page__gemini-branding">
                <span>powered by</span>
                <img src={geminiLogo} alt="Gemini" className="ais-page__gemini-star" />
              </div>

              {/* Inline search bar — submits the first query */}
              <FollowUpBar
                variant="inline"
                placeholder="Ask about your recovery, exercises, or diagnosis…"
                value={currentQuery}
                onValueChange={setCurrentQuery}
                onSubmit={(text) => { setCurrentQuery(text); searchMutation.mutate({ query: text, searchMode }) }}
                isPending={searchMutation.isPending}
                isError={searchMutation.isError}
                errorMessage={resolveSearchError(searchMutation.error)}
              />

              {/* Suggested topics — clicking a chip pre-fills the bar */}
              <QueryChips onSelect={handleChipSelect} />

              <p className="ais-page__idle-disclaimer">
                <Info size={12} />
                AI-generated · always consult a professional
              </p>
            </div>
          </div>
        ) : (
          /* ── Results state: conversation in progress ── */
          <>
            <div className="ais-page__results-header">
              {/* Clears results and returns to the idle state */}
              <button
                type="button"
                className="ais-page__new-chat-btn"
                onClick={() => {
                  setSearchResults(null)
                  setCurrentQuery('')
                  searchMutation.reset()
                }}
              >
                <ArrowLeft size={16} />
                New Chat
              </button>
            </div>

            <div className="ais-page__results-container">
              <SearchResultsArea
                exchanges={searchResults ?? []}
                isPending={searchMutation.isPending}
                pendingQuery={currentQuery}
              />
            </div>

            {/* Fixed follow-up bar and scroll button are portaled to body so they
                float above all content regardless of scroll position */}
            {createPortal(
              <FollowUpBar
                onSubmit={(text: string) => { setCurrentQuery(text); searchMutation.mutate({ query: text, searchMode }) }}
                isPending={searchMutation.isPending}
                isError={searchMutation.isError}
                errorMessage={resolveSearchError(searchMutation.error)}
              />,
              document.body,
            )}
            {createPortal(<ScrollToBottomButton />, document.body)}
          </>
        )}
      </main>
    </div>
  )
}
