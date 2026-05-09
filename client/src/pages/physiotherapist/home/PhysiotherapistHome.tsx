import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'
import TopNav from '@/components/TopNav'
import AlertItem from './components/AlertItem'
import ScheduleCard from './components/ScheduleCard'
import PatientsCarousel from './components/PatientsCarousel'
import { usePatientsList } from '@/hooks/usePatientsList'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export default function PhysiotherapistHome() {
  const auth = useAtomValue(authAtom)
  const displayName = auth ? `${auth.first_name} ${auth.last_name}`.trim() : 'Doctor'
  const { alerts, patients, schedule } = usePatientsList()

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      <main className="pt-16">
        <div className="w-full max-w-[1280px] mx-auto px-8 py-6 pb-10">

          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{TODAY}</p>
          </div>

          {/* ── Top Row: Alerts (70%) + Schedule (30%) ── */}
          <div
            className="grid gap-6 mb-6"
            style={{ gridTemplateColumns: '1fr 380px' }}
          >
            {/* Priority Alerts */}
            <div
              className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden"
              style={{ height: '450px' }}
            >
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
            <div
              className="flex flex-col overflow-hidden"
              style={{ height: '450px', width: '100%' }}
            >
              <ScheduleCard schedule={schedule} />
            </div>
          </div>

          {/* ── Bottom Row: Patients Overview (full width) ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Patients Overview</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {patients.length} patients
              </span>
            </div>
            <div className="px-4 py-4">
              <PatientsCarousel patients={patients} onPatientClick={() => {}} />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
