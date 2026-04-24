    async def get_exercise_report_metadata(
        self, exercise_id: str, patient_id: str
    ) -> ExerciseReportMetadata | None:
        """Load today's exercise and completion context for the patient and exercise.

        Args:
            exercise_id: Exercise identifier.
            patient_id: Patient identifier (active sessions only).

        Returns:
            Validated metadata, or ``None`` when no matching row exists.
        """
        await self.cursor.execute(
            query="""
                SELECT e.exercise_name,
                       e.visit_type,
                       pe.reps,
                       ec.execution_status,
                       ec.execution_date,
                       ec.reason_for_non_performance,
                       ec.pain_level,
                       ec.effort_level,
                       ec.request_for_change,
                       pe.num_sets,
                       pe.reps * pe.num_sets AS num_exe_completed,
                       e.ex_video_url, 
                       e.text_instructions,
                       wp.session_id,
                       wp.weekly_plan_id,
                       wp.plan_id
                FROM weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
                WHERE wp.session_id = pe.session_id AND
                      pe.exercise_id = e.exercise_id AND
                      e.exercise_id = %s AND
                      pe.session_id = ec.session_id AND
                      wp.exercise_date= CURDATE() AND
                      pe.session_id IN (
                          SELECT s.session_id
                          FROM sessions s WHERE s.patient_id = %s AND
                                s.session_status = 'ACTIVE' );
                 """,
            args=(exercise_id, patient_id),
        )
        row = await self.cursor.fetchone()
        return ExerciseReportMetadata.model_validate(row) if row else None