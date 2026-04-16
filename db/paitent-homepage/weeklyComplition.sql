-- weekly completion
select EXE_COMP_WEEK.EXECOMP , EXE_TODO_WEEK.EXETDW
from 
(select count(*) as EXECOMP from exercise_completion ec,sessions s
where ec.session_id = s.session_id and s.patient_id =?
and s.session_status = 'ACTIVE'
and ec.execution_date >= 
(SELECT DATE_SUB(CURDATE(), INTERVAL DAYOFWEEK(CURDATE()) - 1 DAY) AS start_of_week)) 
as EXE_COMP_WEEK,
(select sum( pe.time_duration * (case pe.time_unit when'Weekly'then 1 else 7 end )) as EXETDW
from plan_exercises pe,sessions s
where pe.session_id = s.session_id and s.patient_id =?
and s.session_status = 'ACTIVE') as EXE_TODO_WEEK;
