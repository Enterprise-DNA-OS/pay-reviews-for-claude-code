-- Fictional records only. Dates deliberately include overdue work.
insert into pay_bands(id,code,currency,minimum_cents,maximum_cents,source_ref) values
 ('10000000-0000-0000-0000-000000000001','NZ-ANALYST','NZD',7000000,11000000,'demo://approved-band'),
 ('10000000-0000-0000-0000-000000000002','AU-OPS','AUD',8000000,13000000,'demo://approved-band') on conflict do nothing;
insert into people(id,employee_code,name,department,manager,jurisdiction,currency,salary_cents,band_id,baseline_ref) values
 ('20000000-0000-0000-0000-000000000001','DEMO-01','Alex Rowan','Advisory','Morgan Lee','NZ','NZD',9000000,'10000000-0000-0000-0000-000000000001','demo://agreement-01'),
 ('20000000-0000-0000-0000-000000000002','DEMO-02','Alex Rivers','Advisory','Morgan Lee','NZ','NZD',10500000,'10000000-0000-0000-0000-000000000001','demo://agreement-02'),
 ('20000000-0000-0000-0000-000000000003','DEMO-03','Casey Banks','Delivery','Jamie Park','NZ','NZD',8200000,'10000000-0000-0000-0000-000000000001','demo://agreement-03'),
 ('20000000-0000-0000-0000-000000000004','DEMO-04','Jordan Vale','Delivery','Jamie Park','NZ','NZD',7600000,'10000000-0000-0000-0000-000000000001',null),
 ('20000000-0000-0000-0000-000000000005','DEMO-05','Taylor Lake','Operations','Robin Hale','AU','AUD',10000000,'10000000-0000-0000-0000-000000000002','demo://agreement-05'),
 ('20000000-0000-0000-0000-000000000006','DEMO-06','Riley Woods','Operations','Robin Hale','AU','AUD',9500000,'10000000-0000-0000-0000-000000000002','demo://agreement-06') on conflict do nothing;
insert into review_cycles(id,code,currency,effective_on,due_on,owner,policy_ref) values
 ('30000000-0000-0000-0000-000000000001','DEMO-NZ','NZD',current_date+30,current_date-5,'HR Lead','demo://nz-review-policy'),
 ('30000000-0000-0000-0000-000000000002','DEMO-AU','AUD',current_date+45,current_date-2,'HR Lead','demo://au-review-policy') on conflict do nothing;
insert into budgets(id,cycle_id,department,increase_cents,bonus_cents,evidence_ref) values
 ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Advisory',1500000,500000,'demo://board-budget'),
 ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Delivery',600000,200000,'demo://board-budget'),
 ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','Operations',1000000,300000,'demo://board-budget') on conflict do nothing;
insert into proposals(id,cycle_id,person_id,baseline_cents,proposed_cents,bonus_cents,department,manager,rationale,proposer,status,review_by,review_ref,policy_check_ref,agreement_ref,source_status,created_at) values
 ('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',9000000,9450000,100000,'Advisory','Morgan Lee','Annual review','Morgan Lee','submitted',null,null,null,null,null,now()-interval '20 days'),
 ('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',10500000,11500000,200000,'Advisory','Morgan Lee','Expanded role requires band review','Morgan Lee','draft',null,null,null,null,null,now()-interval '12 days'),
 ('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',8200000,8600000,0,'Delivery','Jamie Park','Annual review','Jamie Park','approved','HR Lead','demo://review-03','demo://policy-check-03',null,null,now()-interval '15 days'),
 ('50000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004',7600000,7900000,0,'Delivery','Jamie Park','Imported worksheet awaiting reconciliation','Import operator','imported',null,null,null,null,'Approved',now()-interval '8 days'),
 ('50000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000005',10000000,10400000,150000,'Operations','Robin Hale','Annual review','Robin Hale','submitted',null,null,null,null,null,now()-interval '10 days'),
 ('50000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000006',9500000,9800000,100000,'Operations','Robin Hale','Annual review','Robin Hale','approved','HR Lead','demo://review-06','demo://policy-check-06','demo://agreement-change-06',null,now()-interval '10 days') on conflict do nothing;
