-- Operator-only aggregate report. Run using an authorized private database connection.
-- Reports are voluntary mutually-exclusive daily choices, not unique residents,
-- contact-click conversion, inquiries, verified bookings or verified outcomes.
select report_day,city,outcome,sum(reports) as self_reported_updates
from directory_private.resident_outcome_daily
where report_day >= (now() at time zone 'America/Los_Angeles')::date - 29
group by report_day,city,outcome
order by report_day desc,city,outcome;
