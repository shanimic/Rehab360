-- list of today exercies with status of execution - there is problem with exe that do not exists in exercise_completion
select pe.exercise_id,e.exercise_name,  e.visit_type,pe.reps,ec.execution_status
    from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and pe.session_id = ec.session_id
  and wp.plan_id = pe.plan_id
  and wp.plan_id = ec.plan_id
  and wp.exercise_id = pe.exercise_id
  and wp.exercise_id = ec.exercise_id
  and wp.exercise_date= CURDATE()
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id ='P100'
         and s.session_status = 'ACTIVE' );
         
                                                   
                                                 
 ----------------------------------------------------------------------------------
 -- most updated select 
 -- שאילתא להביא תרגילים שבוצעו וגם תרגילים שלא בוצעו                                                 
  select pe.exercise_id,e.exercise_name,  e.visit_type,pe.reps,0 as "execution_status"
    from weekly_plans wp , plan_exercises pe, exercises e
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and wp.plan_id = pe.plan_id
  and wp.exercise_id = pe.exercise_id
  and wp.exercise_date= CURDATE()
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id ='P100'
         and s.session_status = 'ACTIVE' )
         and not exists
         (select 1 from exercise_completion ec
         where ec.execution_date = wp.exercise_date
         and ec.execution_status = 1
         and ec.exercise_id = e.exercise_id
         and ec.session_id = wp.session_id)
union
select pe.exercise_id,e.exercise_name,  e.visit_type,pe.reps,1 as "execution_status"
    from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and pe.session_id = ec.session_id
  and wp.plan_id = pe.plan_id
  and wp.plan_id = ec.plan_id
  and wp.exercise_id = pe.exercise_id
  and wp.exercise_id = ec.exercise_id
  and wp.exercise_date= CURDATE()
  and ec.execution_status = 1
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id ='P100'
         and s.session_status = 'ACTIVE' );	
         
          INSERT INTO exercise_completion (
    report_id,
    weekly_plan_id,
    plan_id,
    session_id,
    exercise_id,
    execution_date,
    execution_status,
    reason_for_non_performance,
    pain_level,
    effort_level,
    request_for_change,
    num_exe_completed
)
VALUES (
    1,
    101,
    10,
    5,
    200,
    '2026-04-20',
    TRUE,
    NULL,
    3,
    4,
    'Increase repetitions next week',
    12
);



