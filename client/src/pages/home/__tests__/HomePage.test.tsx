import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAtomValue } from 'jotai'

import { useHomePatients } from '@/hooks/useHomePatients'
import { useAllPatients } from '@/hooks/useAllPatients'
import { usePatientsList } from '@/hooks/usePatientsList'
import HomePage from '../HomePage'

vi.mock('@/hooks/useHomePatients')
vi.mock('@/hooks/useAllPatients')
vi.mock('@/hooks/usePatientsList')
vi.mock('@/components/TopNav', () => ({ default: () => <div /> }))
vi.mock('jotai', () => ({ useAtomValue: vi.fn() }))

const MOCK_PATIENTS = [
  {
    patient_id: 'P100',
    first_name: 'Alice',
    last_name: 'Brown',
    medical_diagnosis: 'Back pain',
    progress_percentage: 60,
    last_progress_update: null,
  },
]

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/physiotherapist/home', element: <HomePage /> },
      { path: '/patient/:id', element: <div>Patient Details</div> },
    ],
    { initialEntries: ['/physiotherapist/home'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.mocked(useAtomValue).mockReturnValue({ role: 'PHYSIOTHERAPIST', id: 'T1', first_name: 'Doc', last_name: 'Test' })
  vi.mocked(useHomePatients).mockReturnValue({ data: MOCK_PATIENTS, isLoading: false, isError: false } as ReturnType<typeof useHomePatients>)
  vi.mocked(useAllPatients).mockReturnValue({ data: [] } as any)
  vi.mocked(usePatientsList).mockReturnValue({ alerts: [], patients: [], schedule: [] })
})

describe('HomePage — patient card navigation', () => {
  it('clicking a patient card navigates to /patient/{patientId}', async () => {
    const user = userEvent.setup()
    const router = renderPage()
    await user.click(screen.getByRole('button', { name: /Alice Brown/i }))
    expect(router.state.location.pathname).toBe('/patient/P100')
  })
})
