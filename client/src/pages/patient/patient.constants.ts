import { Flame, CalendarCheck, Dumbbell, Home, BarChart2, Sparkles, User } from 'lucide-react'
import type { Exercise } from './patient.types'

export const exercises: Exercise[] = [
  { id: 1, name: 'Push Up', plan: 'Treatment Plan', desc: '100 Push ups a day', done: true },
  { id: 2, name: 'Sit Up', plan: 'Training Plan', desc: '20 Sit ups a day', done: false },
  { id: 3, name: 'Knee Push Up', plan: 'Treatment Plan', desc: '20 Knee push ups a day', done: false },
  { id: 4, name: 'Shoulder Stretch', plan: 'Treatment Plan', desc: '15 reps each side', done: false },
]

export const completedCount = exercises.filter(e => e.done).length
export const progressPercent = Math.round((completedCount / exercises.length) * 100)

export const stats = [
  { icon: Flame, value: '5', label: 'Day Streak', color: '#f97316' },
  { icon: CalendarCheck, value: '12', label: 'This Week', color: '#10b981' },
  { icon: Dumbbell, value: `${completedCount}/${exercises.length}`, label: 'Today', color: '#1a56db' },
]

export const bottomNav = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Exercises', icon: Dumbbell, active: false },
  { label: 'Progress', icon: BarChart2, active: false },
  { label: 'AI Search', icon: Sparkles, active: false },
  { label: 'Profile', icon: User, active: false },
]

export const topNav = [
  { label: 'Exercises', icon: Dumbbell },
  { label: 'AI Search', icon: Sparkles },
  { label: 'My Profile', icon: User },
]
