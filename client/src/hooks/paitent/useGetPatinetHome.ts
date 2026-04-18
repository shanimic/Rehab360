import apiClient from "@/lib/apiClient"
import { authAtom } from "@/store/authAtom"
import { PatientHomeData } from "@/types/patient"
import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"

export function useGetPatientHome() {
    const user = useAtomValue(authAtom)
    const patientId = user?.id

    const { data, isLoading, error } = useQuery({
        queryKey: ['patientHome', patientId],
        queryFn: async (): Promise<PatientHomeData> => {
            const res = await apiClient.get(`/patient/home/${patientId}`)
            return res.data
        }
    })
    return { data, isLoading, error }
}
