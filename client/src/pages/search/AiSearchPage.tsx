import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Menu, Search, Clock, X, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAiSearchMutation } from '@/hooks/useAiSearchMutation'
import { useQueryHistory } from '@/hooks/useQueryHistory'
import { useDeleteQuery } from '@/hooks/useDeleteQuery'
import { errMsg } from '@/lib/utils'
import type { AiQuery } from '@/types'
import './AiSearchPage.css'

const searchSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
})

type SearchValues = z.infer<typeof searchSchema>

export default function AiSearchPage() {
  const navigate = useNavigate()
  const searchMutation = useAiSearchMutation()
  const queryHistory = useQueryHistory()
  const [localHistory, setLocalHistory] = useState<AiQuery[]>(queryHistory)

  const deleteQuery = useDeleteQuery((deletedId) => {
    setLocalHistory((prev) => prev.filter((q) => q.query_id !== deletedId))
  })

  const form = useForm({
    defaultValues: { query: '' } as SearchValues,
    validators: { onSubmit: searchSchema },
    onSubmit: async ({ value }) => {
      searchMutation.mutate(value.query)
    },
  })

  function handleRecentClick(queryContent: string) {
    form.setFieldValue('query', queryContent)
  }

  function handleClearAll() {
    localHistory.forEach((q) => deleteQuery.mutate(q.query_id))
    setLocalHistory([])
  }

  return (
    <div className="ais-home">
      {/* Header */}
      <header className="ais-home__header">
        <span className="ais-home__header-title">AI Medical Search</span>
        <div className="ais-home__header-actions">
          <button
            className="ais-home__icon-btn"
            aria-label="Menu"
            onClick={() => navigate('/placeholder')}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="ais-home__main">
        {/* Search icon + hero text */}
        <div className="ais-home__hero">
          <div className="ais-home__search-icon" aria-hidden="true">
            <Search size={32} color="white" />
          </div>
          <h1 className="ais-home__title">Search Medical Information</h1>
          <p className="ais-home__subtitle">
            Ask questions about your treatment, exercises, or symptoms
          </p>
        </div>

        {/* Search form */}
        <form
          className="ais-home__form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="query">
            {(field) => (
              <div className="ais-home__field">
                <textarea
                  className="ais-home__textarea"
                  placeholder="Is it normal to feel pain after knee exercises?"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={4}
                />
                {field.state.meta.errors[0] && (
                  <p className="ais-home__field-error">{errMsg(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </form.Field>

          <button
            type="submit"
            className="ais-home__search-btn"
            disabled={searchMutation.isPending}
          >
            <Search size={18} />
            {searchMutation.isPending ? 'Searching…' : 'Search'}
          </button>
        </form>

        {/* Recent searches */}
        {localHistory.length > 0 && (
          <section className="ais-home__recent">
            <div className="ais-home__recent-header">
              <span className="ais-home__recent-label">Recent Searches</span>
              <button className="ais-home__clear-btn" onClick={handleClearAll}>
                <Trash2 size={14} />
                Clear all
              </button>
            </div>

            <ul className="ais-home__recent-list">
              {localHistory.map((q) => (
                <li key={q.query_id} className="ais-home__recent-item">
                  <button
                    className="ais-home__recent-text"
                    onClick={() => handleRecentClick(q.query_content)}
                  >
                    <Clock size={15} className="ais-home__recent-icon" />
                    <span>{q.query_content}</span>
                  </button>
                  <button
                    className="ais-home__recent-delete"
                    aria-label="Remove search"
                    onClick={() => deleteQuery.mutate(q.query_id)}
                  >
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
