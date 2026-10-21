create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table pay_bands (
 id uuid primary key default gen_random_uuid(), code text not null unique, currency text not null check(currency in ('NZD','AUD','USD','GBP','EUR')),
 minimum_cents bigint not null check(minimum_cents>0), maximum_cents bigint not null check(maximum_cents>=minimum_cents), source_ref text not null check(length(trim(source_ref))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table people (
 id uuid primary key default gen_random_uuid(), employee_code text not null unique, name text not null, department text not null, manager text not null,
 jurisdiction text not null check(jurisdiction in ('NZ','AU')), currency text not null check(currency in ('NZD','AUD','USD','GBP','EUR')),
 salary_cents bigint not null check(salary_cents>0), band_id uuid references pay_bands(id), baseline_ref text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table review_cycles (
 id uuid primary key default gen_random_uuid(), code text not null unique, currency text not null check(currency in ('NZD','AUD','USD','GBP','EUR')),
 effective_on date not null, due_on date not null, owner text not null, policy_ref text not null, status text not null default 'open' check(status in ('open','finalised')),
 finalised_by text, finalised_ref text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(due_on<=effective_on)
);
create table budgets (
 id uuid primary key default gen_random_uuid(), cycle_id uuid not null references review_cycles(id), department text not null,
 increase_cents bigint not null check(increase_cents>=0), bonus_cents bigint not null check(bonus_cents>=0), evidence_ref text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(cycle_id,department)
);
create table proposals (
 id uuid primary key default gen_random_uuid(), cycle_id uuid not null references review_cycles(id), person_id uuid not null references people(id),
 baseline_cents bigint not null check(baseline_cents>0), proposed_cents bigint not null check(proposed_cents>=baseline_cents), bonus_cents bigint not null default 0 check(bonus_cents>=0),
 department text not null, manager text not null, rationale text not null, proposer text not null,
 status text not null default 'draft' check(status in ('imported','draft','submitted','approved','rejected')),
 review_by text, review_ref text, policy_check_ref text, exception_ref text, agreement_ref text,
 source_key text, source_hash text, source_status text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(cycle_id,person_id), unique(cycle_id,source_key),
 check(status<>'approved' or (review_by is not null and lower(trim(review_by))<>lower(trim(proposer)) and review_ref is not null and policy_check_ref is not null))
);
create table activity (
 id uuid primary key default gen_random_uuid(), entity_id uuid not null, action text not null, actor text not null, detail jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['pay_bands','people','review_cycles','budgets','proposals','activity'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 end loop;
end $$;
create view proposal_register with (security_invoker=true) as
 select p.id,c.code cycle,c.status cycle_status,c.currency,c.due_on,c.effective_on,e.employee_code,e.name,e.jurisdiction,
 p.department,p.manager,p.status,p.baseline_cents,p.proposed_cents,p.proposed_cents-p.baseline_cents increase_cents,p.bonus_cents,
 round(100.0*(p.proposed_cents-p.baseline_cents)/p.baseline_cents,2) increase_percent,
 b.code band,b.minimum_cents,b.maximum_cents,
 (b.id is not null and (p.proposed_cents<b.minimum_cents or p.proposed_cents>b.maximum_cents)) outside_band,
 e.baseline_ref,p.proposer,p.review_by,p.review_ref,p.policy_check_ref,p.exception_ref,p.agreement_ref,p.rationale,p.source_status,p.created_at,p.updated_at
 from proposals p join review_cycles c on c.id=p.cycle_id join people e on e.id=p.person_id left join pay_bands b on b.id=e.band_id;
create view budget_summary with (security_invoker=true) as
 select c.code cycle,c.currency,b.department,b.increase_cents increase_budget_cents,b.bonus_cents bonus_budget_cents,
 coalesce(sum(p.proposed_cents-p.baseline_cents) filter(where p.status<>'rejected'),0)::bigint planned_increase_cents,
 coalesce(sum(p.bonus_cents) filter(where p.status<>'rejected'),0)::bigint planned_bonus_cents,
 coalesce(sum(p.proposed_cents-p.baseline_cents) filter(where p.status in ('submitted','approved')),0)::bigint reserved_increase_cents,
 coalesce(sum(p.bonus_cents) filter(where p.status in ('submitted','approved')),0)::bigint reserved_bonus_cents,
 b.increase_cents-coalesce(sum(p.proposed_cents-p.baseline_cents) filter(where p.status in ('submitted','approved')),0)::bigint remaining_increase_cents,
 b.bonus_cents-coalesce(sum(p.bonus_cents) filter(where p.status in ('submitted','approved')),0)::bigint remaining_bonus_cents
 from budgets b join review_cycles c on c.id=b.cycle_id left join proposals p on p.cycle_id=c.id and p.department=b.department group by c.code,c.currency,b.id;
create view attention_queue with (security_invoker=true) as
 select id,cycle,employee_code,name,manager,status,currency,due_on,'import needs reconciliation' reason from proposal_register where status='imported' and cycle_status='open'
 union all select id,cycle,employee_code,name,manager,status,currency,due_on,'manager decision overdue' from proposal_register where status in ('draft','submitted') and due_on<current_date and cycle_status='open'
 union all select id,cycle,employee_code,name,manager,status,currency,due_on,'approved change missing agreement' from proposal_register where status='approved' and agreement_ref is null
 union all select id,cycle,employee_code,name,manager,status,currency,due_on,'range exception needs evidence' from proposal_register where outside_band and exception_ref is null and status<>'rejected'
 union all select id,cycle,employee_code,name,manager,status,currency,due_on,'salary baseline needs evidence' from proposal_register where baseline_ref is null and status<>'rejected';
create view compliance_findings with (security_invoker=true) as
 select id,cycle,employee_code,'BASELINE' rule,'Confirm the current agreed annual salary' finding from proposal_register where baseline_ref is null and status<>'rejected'
 union all select id,cycle,employee_code,'NZ-AGREEMENT','Record the agreed change before handover' from proposal_register where jurisdiction='NZ' and status='approved' and agreement_ref is null
 union all select id,cycle,employee_code,'AU-PAY-REVIEW','Record human review of applicable pay terms and pay secrecy rights' from proposal_register where jurisdiction='AU' and status in ('submitted','approved') and policy_check_ref is null
 union all select id,cycle,employee_code,'BAND-EXCEPTION','Record the authorised range exception' from proposal_register where outside_band and exception_ref is null and status<>'rejected'
 union all select id,cycle,employee_code,'POLICY','Obtain an employment-policy review reference' from proposal_register where status='submitted' and policy_check_ref is null;
revoke all on proposal_register,budget_summary,attention_queue,compliance_findings from public;
