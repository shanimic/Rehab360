import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import apiClient from '@/lib/apiClient'
import { useAtomValue } from 'jotai'
import { authAtom } from '@/store/authAtom'

export interface ExerciseReportPayload {
    exercise_id: number
    execution_status: boolean
    pain_level: number
    effort_level: number
    reason_for_non_performance: string
    request_for_change: string
}

export function useSaveExerciseReport() {
    const navigate = useNavigate()
    const user = useAtomValue(authAtom)

    return useMutation({
        mutationFn: async (data: ExerciseReportPayload) => {
            await apiClient.post(`/exercise/${data.exercise_id}/${user?.id}`, data)
        },
        onSuccess: () => {
            navigate('/patient/my-plan')
        },
    })
}
