select exercise_id,reps,num_sets,time_duration,time_unit, 
from plan_exercises pe, plans p, ex
where 
p.plan_id= pe.plan_id
e.
and p.session_id=pe.session_id
and p.end_date >= curdate()
and p.start_date <= curdate()
and pe.session_id in 
(select s.session_id
    from sessions s where s.patient_id ='P100'
         and s.session_status = 'ACTIVE' );	
         

         
