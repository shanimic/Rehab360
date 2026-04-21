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
         
select pe.exercise_id,e.exercise_name,e.visit_type,pe.reps,ec.execution_status,
e.ex_video_url,e.text_instructions,wp.session_id,wp.weekly_plan_id,wp.plan_id
from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and pe.session_id = ec.session_id
  and wp.exercise_date= CURDATE()   
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id = 'P100'  
         and s.session_status = 'ACTIVE' );   
         
         select * from exercise_completion t;
         
select e.exercise_name,e.visit_type,pe.reps,ec.execution_status,
pe.reps*pe.num_sets as num_exe_completed,
e.ex_video_url,e.text_instructions,wp.session_id,wp.weekly_plan_id,wp.plan_id
from weekly_plans wp , plan_exercises pe, exercises e,exercise_completion ec
where wp.session_id = pe.session_id
  and pe.exercise_id = e.exercise_id
  and e.exercise_id = 1
  and pe.session_id = ec.session_id
  and wp.exercise_date= CURDATE()   
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id = 'P100'  
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

SELECT pe.exercise_id, 
                           e.exercise_name,  
                           e.visit_type,
                           pe.reps,
                           ec.execution_status,
                           ec.execution_date
                    FROM weekly_plans wp , 
                         plan_exercises pe, 
                         exercises e,
                         sessions s,
                         exercise_completion ec
                    WHERE wp.session_id = pe.session_id AND 
                          pe.exercise_id = e.exercise_id AND
                          pe.session_id = s.session_id AND
                          pe.session_id = ec.session_id AND
                          wp.exercise_date= CURDATE() AND
                          pe.session_id IN ( 
                                           SELECT s.session_id
                                           FROM sessions s 
                                           WHERE s.patient_id = %s AND
                                                 s.session_status = 'ACTIVE' );
