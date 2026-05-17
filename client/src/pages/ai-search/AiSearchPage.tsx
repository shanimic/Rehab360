import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Send, Loader2, ArrowLeft } from 'lucide-react'
import { useAtom, useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { currentQueryAtom, searchResultsAtom } from '@/store/aiSearchAtom'
import { useAiSearchMutation } from '@/hooks/useAiSearchMutation'
import { errMsg } from '@/lib/utils'
import { resolveSearchError } from '@/lib/aiSearchUtils'
import { Button } from '@/components/ui/button'
import BackButton from '@/components/ui/BackButton'
import PatientTopNav from '@/components/PatientTopNav'
import QueryChips from './components/QueryChips'
import SearchResultsArea from './components/SearchResultsArea'
import FollowUpBar from './components/FollowUpBar'
import ScrollToBottomButton from './components/ScrollToBottomButton'
import './AiSearchPage.css'

const searchSchema = z.object({
  query: z.string().min(3, 'Please enter at least 3 characters'),
})

type SearchValues = z.infer<typeof searchSchema>

export default function AiSearchPage() {
  const auth = useAtomValue(authAtom)
  const [currentQuery, setCurrentQuery] = useAtom(currentQueryAtom)
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom)
  const searchMutation = useAiSearchMutation()

  const navigate = useNavigate()
  const isIdle = searchResults === null && !searchMutation.isPending

  const form = useForm({
    defaultValues: { query: currentQuery } as SearchValues,
    validators: { onSubmit: searchSchema },
    onSubmit: ({ value }) => {
      setCurrentQuery(value.query)
      setSearchResults(null)
      searchMutation.mutate(value.query)
    },
  })

  function handleChipSelect(chip: string) {
    setCurrentQuery(chip)
    form.setFieldValue('query', chip)
  }

  return (
    <div className="ais-page pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-page__main">
        {isIdle ? (
          <div className="ais-page__left">
              <div className="ais-page__title-row">
                <BackButton
                  onClick={() => navigate(
                    auth?.role === 'PHYSIOTHERAPIST' ? '/physiotherapist/home'
                    : auth?.role === 'FITNESS_TRAINER' ? '/fitness/home'
                    : '/patient'
                  )}
                  aria-label="Back to home"
                />
                <h1 className="ais-page__headline">AI Search</h1>
              </div>
              <div className="ais-page__hero">
                <p className="ais-page__subtagline">
                  Get answers powered by Gemini AI, enriched with content your clinic&apos;s professionals have already reviewed and approved.
                </p>
              </div>

              <div className="ais-page__search-card">
                <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
                  <form.Field name="query">
                    {(field) => (
                      <div className="ais-page__field">
                        <div className="ais-page__textarea-wrap">
                          <textarea
                            className="ais-page__textarea"
                            placeholder="E.g. Is it normal to feel pain after knee exercises?"
                            value={field.state.value}
                            onChange={(e) => { field.handleChange(e.target.value); setCurrentQuery(e.target.value) }}
                            onBlur={field.handleBlur}
                            rows={3}
                          />
                        </div>
                        {field.state.meta.errors[0] && (
                          <p className="ais-page__field-error">{errMsg(field.state.meta.errors[0])}</p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <div className="ais-page__search-footer">
                    <span className="ais-page__disclaimer hidden sm:block">
                      Results are AI-generated. Always consult a professional.
                    </span>
                    <Button
                      type="submit"
                      disabled={searchMutation.isPending}
                      className="rounded-xl min-h-[44px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-none disabled:cursor-not-allowed disabled:pointer-events-auto"
                    >
                      {searchMutation.isPending ? (
                        <><Loader2 size={16} className="animate-spin" />Asking…</>
                      ) : (
                        <><Send size={16} />Ask</>
                      )}
                    </Button>
                  </div>
                  {searchMutation.isError && (
                    <p className="ais-page__field-error">
                      {resolveSearchError(searchMutation.error)}
                    </p>
                  )}
                </form>
              </div>

              <QueryChips onSelect={handleChipSelect} />
          </div>
        ) : (
          <>
            <div className="ais-page__results-header">
              <button
                type="button"
                className="ais-page__new-chat-btn"
                onClick={() => {
                  setSearchResults(null)
                  setCurrentQuery('')
                  form.reset()
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
              />
            </div>
            {createPortal(
              <FollowUpBar
                onSubmit={(text: string) => searchMutation.mutate(text)}
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
