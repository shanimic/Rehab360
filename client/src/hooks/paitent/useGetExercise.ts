import apiClient from "@/lib/apiClient"
import { authAtom } from "@/store/authAtom"
import { Exercise } from "@/types/exercise"
import { useQuery } from "@tanstack/react-query"
import { useAtomValue } from "jotai"

export function useGetExercise(exerciseId: number) {
    const user = useAtomValue(authAtom)
    const patientId = user?.id

    const { data } = useQuery({
        queryKey: [exerciseId, patientId],
        queryFn: async (): Promise<Exercise> => {
            const res = await apiClient.get(`/exercise/${exerciseId}/${patientId}`)
            console.log(res.data)
            return res.data
        }
    })
    return { data }
}
