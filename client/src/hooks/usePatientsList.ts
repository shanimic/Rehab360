// TODO: replace with useQuery once patients API endpoint is available
import type { Patient, PatientAlert, Appointment, AlertType, AlertSeverity } from '@/types'

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    rehabType: 'Shoulder Rehabilitation',
    weeklyCompliance: 82,
    painTrend: 'improving',
    lastReport: '2 hours ago',
    currentPain: 3,
    previousPain: 6,
    hoursWithoutReport: 2,
    stableDays: 0,
    completionPercent: 91,
    effortLevel: 5,
  },
  {
    id: '2',
    name: 'Dana Lopez',
    rehabType: 'Knee Rehabilitation',
    weeklyCompliance: 65,
    painTrend: 'stable',
    lastReport: '1 day ago',
    currentPain: 5,
    previousPain: 5,
    hoursWithoutReport: 24,
    stableDays: 16,
    completionPercent: 60,
    effortLevel: 6,
  },
  {
    id: '3',
    name: 'Ron Klein',
    rehabType: 'Lower Back Rehabilitation',
    weeklyCompliance: 40,
    painTrend: 'worsening',
    lastReport: '3 days ago',
    currentPain: 7,
    previousPain: 4,
    hoursWithoutReport: 72,
    stableDays: 0,
    completionPercent: 35,
    effortLevel: 4,
  },
  {
    id: '4',
    name: 'Maya Cohen',
    rehabType: 'Hip Rehabilitation',
    weeklyCompliance: 95,
    painTrend: 'worsening',
    lastReport: '30 min ago',
    currentPain: 8,
    previousPain: 3,
    hoursWithoutReport: 0.5,
    stableDays: 0,
    completionPercent: 78,
    effortLevel: 2,
  },
  {
    id: '5',
    name: 'Eli Zamir',
    rehabType: 'Ankle Rehabilitation',
    weeklyCompliance: 73,
    painTrend: 'stable',
    lastReport: '5 hours ago',
    currentPain: 4,
    previousPain: 4,
    hoursWithoutReport: 5,
    stableDays: 7,
    completionPercent: 55,
    effortLevel: 5,
  },
]

const MOCK_SCHEDULE: Appointment[] = [
  { id: '1', time: '09:00', patientName: 'John Smith', reason: 'Shoulder Progress Review' },
  { id: '2', time: '10:30', patientName: 'Dana Lopez', reason: 'Knee Assessment' },
  { id: '3', time: '12:00', patientName: 'Maya Cohen', reason: 'Hip Mobility Session' },
  { id: '4', time: '14:00', patientName: 'Ron Klein', reason: 'Back Pain Consultation' },
  { id: '5', time: '15:30', patientName: 'Eli Zamir', reason: 'Ankle Follow-up' },
]

interface AlertDef {
  type: AlertType
  severity: AlertSeverity
  condition: (p: Patient) => boolean
  message: (p: Patient) => string
}

// Triage order: Critical → Pain Spike → Inactive → Stuck → Milestone
const SEVERITY_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }

const TYPE_ORDER: Record<AlertType, number> = {
  overexertion: 0,
  pain_spike: 1,
  inactivity: 2,
  stuck: 3,
  milestone: 4,
}

const ALERT_RULES: AlertDef[] = [
  {
    type: 'overexertion',
    severity: 'critical',
    condition: (p) => p.currentPain >= 8 && p.effortLevel <= 3,
    message: (p) =>
      `Severe pain (${p.currentPain}/10) at very low effort (${p.effortLevel}/10). Possible flare-up – review immediately.`,
  },
  {
    type: 'pain_spike',
    severity: 'warning',
    condition: (p) => p.currentPain - p.previousPain >= 2,
    message: (p) =>
      `Pain jumped from ${p.previousPain}/10 to ${p.currentPain}/10 since last session. Monitor before next load.`,
  },
  {
    type: 'inactivity',
    severity: 'warning',
    condition: (p) => p.hoursWithoutReport >= 48,
    message: (p) =>
      `No activity logged in ${Math.round(p.hoursWithoutReport / 24)} days. Consider reaching out.`,
  },
  {
    type: 'stuck',
    severity: 'info',
    condition: (p) => p.painTrend === 'stable' && p.stableDays >= 14,
    message: (p) =>
      `Pain stable at ${p.currentPain}/10 for ${p.stableDays} days. Consider adjusting the plan.`,
  },
  {
    type: 'milestone',
    severity: 'info',
    condition: (p) => p.completionPercent >= 90,
    message: (p) =>
      `${p.completionPercent}% of program completed. Ready to advance to the next phase.`,
  },
]

function computeAlerts(patients: Patient[]): PatientAlert[] {
  const alerts: PatientAlert[] = []
  patients.forEach((p) => {
    ALERT_RULES.forEach((rule) => {
      if (rule.condition(p)) {
        alerts.push({
          id: `${rule.type}-${p.id}`,
          patientId: p.id,
          patientName: p.name,
          message: rule.message(p),
          type: rule.type,
          severity: rule.severity,
        })
      }
    })
  })
  return alerts.sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (severityDiff !== 0) return severityDiff
    return TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
  })
}

export interface PatientsListData {
  alerts: PatientAlert[]
  patients: Patient[]
  schedule: Appointment[]
}

export function usePatientsList(): PatientsListData {
  return {
    alerts: computeAlerts(MOCK_PATIENTS),
    patients: MOCK_PATIENTS,
    schedule: MOCK_SCHEDULE,
  }
}
