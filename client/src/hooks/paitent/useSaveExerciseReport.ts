import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import apiClient from '@/lib/apiClient'

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

    return useMutation({
        mutationFn: async (data: ExerciseReportPayload) => {
            console.log(data)
            // await apiClient.post(`/patient/exercise/${data.exercise_id}/report`, data)
        },
        onSuccess: () => {
            navigate('/patient/my-plan')
        },
    })
}
