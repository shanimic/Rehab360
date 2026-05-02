import apiClient from "@/lib/apiClient"
import { authAtom } from "@/store/authAtom"
import { WeeklyScheduleItem } from "@/types/patient"
import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"

export function useGetWeeklySchedule() {
    const user = useAtomValue(authAtom)
    const patientId = user?.id

    const { data } = useQuery({
        queryKey: ["weekly-schedule", patientId],
        queryFn: async (): Promise<WeeklyScheduleItem[]> => {
            const res = await apiClient.get(`/patient/weekly-schedule/${patientId}`)
            return res.data
        }
    })
    return { data }
}
