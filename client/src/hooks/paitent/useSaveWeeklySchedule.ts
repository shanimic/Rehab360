import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import apiClient from '@/lib/apiClient'
import { authAtom } from '@/store/authAtom'
import { useAtomValue } from 'jotai'

export interface ScheduledExercisePayload {
    exercise_id: number
    day_index: number
    sets: number
    reminder_date: string | null
    reminder_time: string | null
    session_id?: number
    plan_id?: number
}

export interface SaveWeeklySchedulePayload {
    reminders_enabled: boolean
    schedule: ScheduledExercisePayload[]
}

export function useSaveWeeklySchedule() {
    const navigate = useNavigate()
    const user = useAtomValue(authAtom)

    return useMutation({
        mutationFn: async (payload: SaveWeeklySchedulePayload) => {
            console.log('Saving schedule with payload:', payload)
            await apiClient.post(`/patient/weekly-schedule/${user?.id}`, payload)
        },
        onSuccess: () => {
            navigate(-1)
        },
    })
}
