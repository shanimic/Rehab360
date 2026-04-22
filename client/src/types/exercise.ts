import { VisitType } from "./patient";

export interface Exercise {
    exercise_name: string,
    visit_type: VisitType,
    reps: number,
    ex_video_url?: string,
    execution_status: boolean,
    text_instructions?: string,
    num_sets: number
}