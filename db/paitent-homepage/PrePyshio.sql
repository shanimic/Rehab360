-- precentage of PHYSIOTHERAPIST completion
select (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100 
from 
(select sum( pe.reps * pe.num_sets * pe.time_duration * 
(case pe.time_unit when'Weekly'then 1 else 7 end )) as NEPW
from plan_exercises pe,sessions s 
where pe.session_id = s.session_id and s.patient_id ='P100'
and s.session_status = 'ACTIVE'
and s.visit_type = 'PHYSIOTHERAPIST') as NUM_EXE_PER_W,
(SELECT TIMESTAMPDIFF(WEEK, p.start_date , p.end_date) AS weeks_diff 
from plans p, sessions s
where p.session_id = s.session_id and s.patient_id ='P100'
and s.session_status = 'ACTIVE'
and s.visit_type = 'PHYSIOTHERAPIST') as NUM_WEEKS,
(select sum(ec.num_exe_completed) as EXECOMP from exercise_completion ec,sessions s
where ec.session_id = s.session_id and s.patient_id ='P100'
and ec.execution_status = 1
and s.session_status = 'ACTIVE'
and s.visit_type = 'PHYSIOTHERAPIST') as EXE_COMPLETED 
;