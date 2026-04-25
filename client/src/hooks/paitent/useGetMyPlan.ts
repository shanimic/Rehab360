import apiClient from "@/lib/apiClient"
import { authAtom } from "@/store/authAtom"
import type { MyPlanResponse } from "@/types/patient"
import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"

export function useGetMyPlan() {
    const user = useAtomValue(authAtom)
    const patientId = user?.id

    const { data, isLoading, error } = useQuery({
        queryKey: ['myPlan', patientId],
        queryFn: async (): Promise<MyPlanResponse> => {
            const res = await apiClient.get(`/exercise/${patientId}`)
            return res.data
        }
    })
    return { data, isLoading, error }
}