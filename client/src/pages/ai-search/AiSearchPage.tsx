import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useAtom, useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import { currentQueryAtom } from '@/store/aiSearchAtom'
import { useAiSearchMutation } from '@/hooks/useAiSearchMutation'
import { useQueryHistory } from '@/hooks/useQueryHistory'
import { useDeleteQuery } from '@/hooks/useDeleteQuery'
import { useRestoreQuery } from '@/hooks/useRestoreQuery'
import { useSavedContent } from '@/hooks/useSavedContent'
import { errMsg } from '@/lib/utils'
import PatientTopNav from '@/components/PatientTopNav'
import QueryChips from './components/QueryChips'
import HistoryPanel from './components/HistoryPanel'
import './AiSearchPage.css'

const searchSchema = z.object({
  query: z.string().min(3, 'Please enter at least 3 characters'),
})

type SearchValues = z.infer<typeof searchSchema>

export default function AiSearchPage() {
  const auth = useAtomValue(authAtom)
  const [currentQuery, setCurrentQuery] = useAtom(currentQueryAtom)
  const searchMutation = useAiSearchMutation()
  const restoreQuery = useRestoreQuery()
  const history = useQueryHistory()
  const savedContent = useSavedContent()

  const deleteQuery = useDeleteQuery(() => {})

  const form = useForm({
    defaultValues: { query: currentQuery } as SearchValues,
    validators: { onSubmit: searchSchema },
    onSubmit: ({ value }) => {
      setCurrentQuery(value.query)
      searchMutation.mutate(value.query)
    },
  })

  function handleChipSelect(chip: string) {
    setCurrentQuery(chip)
    form.setFieldValue('query', chip)
  }

  function handleHistoryDelete(queryId: string) {
    deleteQuery.mutate(queryId)
  }

  return (
    <div className="ais-page pt-16">
      <PatientTopNav patientName={auth?.first_name} />

      <main className="ais-page__main">
        <div className="ais-page__layout">
          {/* ─── Left column ─── */}
          <div className="ais-page__left">
            <div className="ais-page__hero">
              <div className="ais-page__eyebrow">
                <span className="ais-page__pulse-dot" aria-hidden="true" />
                <span className="ais-page__eyebrow-text">AI-Powered Medical Search</span>
              </div>
              <h1 className="ais-page__headline">Ask anything about your rehabilitation</h1>
              <p className="ais-page__subtagline">
                Get answers powered by Gemini AI, enriched with content your clinic&apos;s professionals have already reviewed and approved.
              </p>
            </div>

            <div className="ais-page__search-card">
              <form
                onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
              >
                <form.Field name="query">
                  {(field) => (
                    <div className="ais-page__field">
                      <div className="ais-page__textarea-wrap">
                        <span className="ais-page__stethoscope" aria-hidden="true">🩺</span>
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
                  <button
                    type="submit"
                    className="ais-page__search-btn"
                    disabled={searchMutation.isPending}
                  >
                    {searchMutation.isPending ? (
                      <><span className="ais-page__spinner" aria-hidden="true" /> Searching…</>
                    ) : (
                      '🔍 Search'
                    )}
                  </button>
                </div>
              </form>
            </div>

            <QueryChips onSelect={handleChipSelect} />
          </div>

          {/* ─── Right column (history panel) ─── */}
          <div className="ais-page__right">
            <HistoryPanel
              history={history}
              onRestore={(queryId) => restoreQuery.mutate(queryId)}
              onDelete={handleHistoryDelete}
              onClearAll={() => history.forEach((q) => deleteQuery.mutate(q.query_id))}
              totalSearches={history.length}
              savedCount={savedContent.length}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
