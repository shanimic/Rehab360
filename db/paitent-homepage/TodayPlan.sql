-- list of today exercies with status of execution 
select pe.exercise_id,e.exercise_name,  e.visit_type,pe.reps,ec.execution_status
    from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and pe.session_id = ec.session_id
  and wp.exercise_date= CURDATE()
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id =?
         and s.session_status = 'ACTIVE' );

