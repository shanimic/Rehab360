import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAtomValue } from 'jotai'

import { useVisitSummaries } from '@/hooks/useVisitSummaries'
import AllVisitSummaries from '../AllVisitSummaries'

vi.mock('@/hooks/useVisitSummaries')
vi.mock('@/components/TopNav', () => ({ default: () => <div /> }))
vi.mock('jotai', () => ({ useAtomValue: vi.fn() }))

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/patient/:id/visit-summaries', element: <AllVisitSummaries /> },
      { path: '/patient/:id/visit-summaries/new', element: <div>New Summary</div> },
    ],
    { initialEntries: ['/patient/P100/visit-summaries'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.mocked(useVisitSummaries).mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as ReturnType<typeof useVisitSummaries>)
})

describe('AllVisitSummaries — New Summary button visibility', () => {
  it('PATIENT role does not see New Summary button', () => {
    vi.mocked(useAtomValue).mockReturnValue({ role: 'PATIENT', id: 'P100' })
    renderPage()
    expect(screen.queryByRole('button', { name: /New Summary/i })).not.toBeInTheDocument()
  })

  it('PHYSIOTHERAPIST role sees New Summary button', () => {
    vi.mocked(useAtomValue).mockReturnValue({ role: 'PHYSIOTHERAPIST', id: 'T1' })
    renderPage()
    expect(screen.getByRole('button', { name: /New Summary/i })).toBeInTheDocument()
  })

  it('FITNESS_TRAINER role sees New Summary button', () => {
    vi.mocked(useAtomValue).mockReturnValue({ role: 'FITNESS_TRAINER', id: 'T2' })
    renderPage()
    expect(screen.getByRole('button', { name: /New Summary/i })).toBeInTheDocument()
  })
})
