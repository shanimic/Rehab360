import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import AlertItem from '../physiotherapist/home/components/AlertItem'
import ScheduleCard from '../physiotherapist/home/components/ScheduleCard'
import PatientsCarousel from '../physiotherapist/home/components/PatientsCarousel'
import { usePatientsList } from '@/hooks/usePatientsList'
import { useHomePatients } from '@/hooks/useHomePatients'
import { useAllPatients } from '@/hooks/useAllPatients'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

export default function HomePage() {
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)
  const displayName = auth ? `${auth.first_name} ${auth.last_name}`.trim() : 'Doctor'

  const { alerts, schedule } = usePatientsList()
  const { data: homePatients = [], isLoading: patientsLoading, isError: patientsError } = useHomePatients()
  const { data: allPatients = [] } = useAllPatients()

  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSearch, setModalSearch] = useState('')

  const q = searchQuery.toLowerCase()
  const filteredPatients = homePatients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
  )

  const mq = modalSearch.toLowerCase()
  const modalPatients = allPatients.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(mq) ||
      p.patient_id.toLowerCase().includes(mq),
  )

  const handlePatientSelect = (patientId: string) => {
    setModalOpen(false)
    setModalSearch('')
    navigate(`/patient/${patientId}/visit-summaries/new`)
  }

  const closeModal = () => { setModalOpen(false); setModalSearch('') }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <main className="pt-16">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">

          {/* Greeting + primary CTA */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                {getGreeting()}, {displayName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">{TODAY}</p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <span className="text-base leading-none">+</span>
              New Visit Summary
            </button>
          </div>

          {/* ── Top Row: Alerts (70%) + Schedule (30%) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-6">
            {/* Priority Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[280px] lg:h-[450px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <h2 className="text-sm font-bold text-slate-800">Priority Alerts</h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {alerts.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                {alerts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center mt-8">No alerts at this time.</p>
                ) : (
                  alerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))
                )}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="flex flex-col overflow-hidden min-h-[280px] lg:h-[450px]">
              <ScheduleCard schedule={schedule} />
            </div>
          </div>

          {/* ── Bottom Row: Patients Overview (full width) ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-800">Patients Overview</h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {filteredPatients.length} patients
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-[280px] bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-slate-400 focus-within:border-slate-300 focus-within:bg-white transition-colors">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-0 text-xs text-slate-700 placeholder:text-slate-400 bg-transparent focus:outline-none leading-none"
                />
              </div>
            </div>
            <div className="px-4 py-4 min-h-[160px] flex items-center justify-center">
              {patientsLoading ? (
                <p className="text-sm text-slate-400">Loading patients…</p>
              ) : patientsError ? (
                <p className="text-sm text-red-400">Failed to load patients.</p>
              ) : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center gap-1 py-6">
                  <p className="text-sm font-medium text-slate-600">No results found</p>
                  <p className="text-xs text-slate-400">Try searching by another patient name.</p>
                </div>
              ) : (
                <div className="w-full">
                  <PatientsCarousel patients={filteredPatients} onPatientClick={(patientId) => navigate(`/patient/${patientId}`)} />
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Select Patient modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-bold text-slate-800">Select Patient</h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal search */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-400 focus-within:border-slate-300 focus-within:bg-white transition-colors">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  autoFocus
                  className="flex-1 min-w-0 text-sm text-slate-700 placeholder:text-slate-400 bg-transparent focus:outline-none leading-none"
                />
              </div>
            </div>

            {/* Patient list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {modalPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-1">
                  <p className="text-sm font-medium text-slate-600">No patients found</p>
                  <p className="text-xs text-slate-400">Try searching by another name or ID.</p>
                </div>
              ) : (
                modalPatients.map((patient) => (
                  <button
                    key={patient.patient_id}
                    onClick={() => handlePatientSelect(patient.patient_id)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left cursor-pointer"
                  >
                    <span className="font-semibold text-sm text-slate-800">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                      ID {patient.patient_id}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
