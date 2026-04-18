import apiClient from "@/lib/apiClient"
import { authAtom } from "@/store/authAtom"
import { PatientHomeData } from "@/types/patient"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"

export function useGetPatientHome() {
    const user = useAtomValue(authAtom)
    const patientId = user?.id

    const { data, isLoading, error } = useQuery({
        queryKey: ['patientHome', patientId],
        queryFn: async (): Promise<PatientHomeData> => {
            console.log(`/patient/home/${patientId}`)
            const res = await apiClient.get(`/patient/home/${patientId}`)
            console.log(res.data)
            return res.data
        }
    })
    return { data, isLoading, error }
}
