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









select * from plan_exercises;
select * from sessions s;
select * from plans p;

select sum( pe.reps * pe.num_sets * pe.time_duration * (case pe.time_unit when'Weekly'then 1 else 7 end ))
from plan_exercises pe,sessions s
where pe.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS';

SELECT TIMESTAMPDIFF(WEEK, p.start_date , p.end_date) AS weeks_diff 
from plans p, sessions s
where p.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS'
;
select sum(ec.num_exe_completed) from exercise_completion ec,sessions s
where ec.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS' ;
;
 
select (EXE_COMPLETED.EXECOMP / (NUM_EXE_PER_W.NEPW * NUM_WEEKS.weeks_diff)) * 100 
from 
(select sum( pe.reps * pe.num_sets * pe.time_duration * 
(case pe.time_unit when'Weekly'then 1 else 7 end )) as NEPW
from plan_exercises pe,sessions s
where pe.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS') as NUM_EXE_PER_W,
(SELECT TIMESTAMPDIFF(WEEK, p.start_date , p.end_date) AS weeks_diff 
from plans p, sessions s
where p.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS') as NUM_WEEKS,
(select sum(ec.num_exe_completed) as EXECOMP from exercise_completion ec,sessions s
where ec.session_id = s.session_id
and s.session_status = 'ACTIVE'
and s.visit_type = 'FITNESS') as EXE_COMPLETED 
;



update sessions s set s.visit_type = 'PHYSIOTHERAPIST' where s.session_id in (102);
update plan_exercises pe
set pe.time_duration = 4 ,pe.time_unit = 'Weekly' where pe.exercise_id = 1;
update plan_exercises pe
set pe.time_duration = 1 ,pe.time_unit = 'Daily' where pe.exercise_id = 2;
update plan_exercises pe
set pe.time_duration = 2 ,pe.time_unit = 'Weekly' where pe.exercise_id = 3;
alter table exercise_completion  rename column um_exe_completed to num_exe_completed;

select * from exercise_completion;
update exercise_completion e set e.num_exe_completed = 8 where e.weekly_plan_id = 502;
;