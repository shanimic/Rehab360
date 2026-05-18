import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAtomValue } from 'jotai'

import { usePatientDetails } from '@/hooks/usePatientDetails'
import PatientDetails from '../PatientDetails'

vi.mock('@/hooks/usePatientDetails')
vi.mock('@/components/TopNav', () => ({ default: () => <div /> }))
vi.mock('jotai', () => ({ useAtomValue: vi.fn() }))

const FULL_DATA = {
  patient: {
    user_id: 'P100',
    first_name: 'John',
    last_name: 'Smith',
    birth_date: '1990-01-15',
    phone: '+972-50-000-0001',
    email: 'john@example.com',
  },
  latest_visit_summary: {
    session_id: 10,
    visit_date: '2026-03-28',
    visit_time: '10:00:00',
    visit_type: 'PHYSIOTHERAPIST',
    therapist_name: 'Dr. Cohen',
    description: 'Good progress noted.',
  },
  treatment_plan: {
    plan_id: 2,
    session_id: 10,
    medical_diagnosis: 'Shoulder Impingement',
    start_date: '2026-01-01',
    end_date: '2026-06-01',
    progress_percentage: 75,
    last_progress_update: null,
  },
  fitness_plan: {
    plan_id: 1,
    session_id: 10,
    medical_diagnosis: 'Core Strengthening',
    start_date: '2026-01-01',
    end_date: '2026-06-01',
    progress_percentage: 45,
    last_progress_update: null,
  },
  viewer_role: 'PHYSIOTHERAPIST',
}

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/patient/:id', element: <PatientDetails /> },
      { path: '/patient/:id/visit-summaries', element: <div>Visit Summaries</div> },
      { path: '/patient/:id/treatment-plans/:planId', element: <div>Plan</div> },
    ],
    { initialEntries: ['/patient/P100'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  vi.mocked(useAtomValue).mockReturnValue({ role: 'PHYSIOTHERAPIST', id: 'T1', first_name: 'Doc', last_name: 'Test' })
  vi.mocked(usePatientDetails).mockReturnValue({ data: FULL_DATA, isLoading: false, isError: false } as ReturnType<typeof usePatientDetails>)
})

describe('PatientDetails', () => {
  it('shows loading state', () => {
    vi.mocked(usePatientDetails).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof usePatientDetails>)
    renderPage()
    expect(screen.getByText('Loading patient data…')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(usePatientDetails).mockReturnValue({ data: undefined, isLoading: false, isError: true } as ReturnType<typeof usePatientDetails>)
    renderPage()
    expect(screen.getByText(/Failed to load patient data/)).toBeInTheDocument()
  })

  it('shows "Patient Details" title for PHYSIOTHERAPIST', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Patient Details' })).toBeInTheDocument()
  })

  it('shows "Patient Details" title for FITNESS_TRAINER', () => {
    vi.mocked(useAtomValue).mockReturnValue({ role: 'FITNESS_TRAINER', id: 'T2' })
    renderPage()
    expect(screen.getByRole('heading', { name: 'Patient Details' })).toBeInTheDocument()
  })

  it('shows "My Process" title for PATIENT', () => {
    vi.mocked(useAtomValue).mockReturnValue({ role: 'PATIENT', id: 'P100' })
    renderPage()
    expect(screen.getByRole('heading', { name: 'My Process' })).toBeInTheDocument()
  })

  it('renders patient name from API data', () => {
    renderPage()
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })

  it('renders patient contact info', () => {
    renderPage()
    expect(screen.getByText('+972-50-000-0001')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders treatment plan data', () => {
    renderPage()
    expect(screen.getByText('Treatment Plan')).toBeInTheDocument()
    expect(screen.getByText('Shoulder Impingement')).toBeInTheDocument()
  })

  it('does not show "Training Plan" label anywhere', () => {
    renderPage()
    expect(screen.queryByText('Training Plan')).not.toBeInTheDocument()
  })

  it('renders fitness plan with "Fitness Plan" heading and data', () => {
    renderPage()
    expect(screen.getByText('Fitness Plan')).toBeInTheDocument()
    expect(screen.getByText('Core Strengthening')).toBeInTheDocument()
  })

  it('shows empty state when latest_visit_summary is null', () => {
    vi.mocked(usePatientDetails).mockReturnValue({
      data: { ...FULL_DATA, latest_visit_summary: null },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePatientDetails>)
    renderPage()
    expect(screen.getByText('No visit summary on record.')).toBeInTheDocument()
  })

  it('shows empty state when treatment_plan is null', () => {
    vi.mocked(usePatientDetails).mockReturnValue({
      data: { ...FULL_DATA, treatment_plan: null },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePatientDetails>)
    renderPage()
    expect(screen.getByText('No active treatment plan.')).toBeInTheDocument()
  })

  it('shows empty state when fitness_plan is null', () => {
    vi.mocked(usePatientDetails).mockReturnValue({
      data: { ...FULL_DATA, fitness_plan: null },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePatientDetails>)
    renderPage()
    expect(screen.getByText('No active fitness plan.')).toBeInTheDocument()
  })

  it('"View All Summaries" navigates to /patient/P100/visit-summaries', async () => {
    const user = userEvent.setup()
    const router = renderPage()
    await user.click(screen.getByRole('button', { name: 'View All Summaries' }))
    expect(router.state.location.pathname).toBe('/patient/P100/visit-summaries')
  })

  it('"Go to Current Treatment Plan" navigates to /patient/P100/treatment-plans/2', async () => {
    const user = userEvent.setup()
    const router = renderPage()
    await user.click(screen.getByRole('button', { name: 'Go to Current Treatment Plan' }))
    expect(router.state.location.pathname).toBe('/patient/P100/treatment-plans/2')
  })

  it('"Go to Current Fitness Plan" navigates to /patient/P100/treatment-plans/1', async () => {
    const user = userEvent.setup()
    const router = renderPage()
    await user.click(screen.getByRole('button', { name: 'Go to Current Fitness Plan' }))
    expect(router.state.location.pathname).toBe('/patient/P100/treatment-plans/1')
  })
})
