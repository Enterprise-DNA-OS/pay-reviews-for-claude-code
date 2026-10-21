import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {REPO_ROOT} from './db.mjs';
import {parseCsv} from './csv.mjs';
import {table} from './format.mjs';
export const TABLES=['pay_bands','people','review_cycles','budgets','proposals','activity'];
export const READS={
 'cycles':'select code,currency,status,due_on,effective_on,owner from review_cycles order by code',
 'people':'select e.employee_code,e.name,e.department,e.manager,e.jurisdiction,e.currency,e.salary_cents,b.code band,e.baseline_ref from people e left join pay_bands b on b.id=e.band_id order by employee_code',
 'bands':'select code,currency,minimum_cents,maximum_cents,source_ref from pay_bands order by code',
 'budgets':'select * from budget_summary order by cycle,department',
 'proposals':'select cycle,employee_code,name,department,manager,status,currency,baseline_cents,proposed_cents,bonus_cents from proposal_register order by cycle,employee_code',
 'attention':'select cycle,employee_code,name,manager,status,reason,due_on from attention_queue order by due_on,employee_code,reason',
 'budget-check':'select * from budget_summary where planned_increase_cents>increase_budget_cents or planned_bonus_cents>bonus_budget_cents order by cycle,department',
 'manager-chase':"select cycle,manager,count(*)::int pending,min(due_on) due_on from proposal_register where status in ('draft','imported') and cycle_status='open' group by cycle,manager order by cycle,manager",
 'exceptions':"select cycle,employee_code,name,currency,proposed_cents,minimum_cents,maximum_cents,exception_ref from proposal_register where outside_band and status<>'rejected' order by cycle,employee_code",
 'agreement-chase':"select cycle,employee_code,name,currency,proposed_cents,effective_on from proposal_register where status='approved' and agreement_ref is null order by effective_on,employee_code",
 'compliance':'select * from compliance_findings order by cycle,employee_code,rule',
 'activity':'select entity_id,action,actor,detail,created_at from activity order by created_at,id',
};
export const QUESTIONS=[
 ['Which managers have overdue proposals and missing salary evidence?',"select cycle,manager,count(*)::int records from proposal_register where due_on<current_date and baseline_ref is null and status not in ('approved','rejected') group by cycle,manager"],
 ['Which departments exceed their proposed increase budget while holding approved changes?',"select b.* from budget_summary b where planned_increase_cents>increase_budget_cents and exists(select 1 from proposal_register p where p.cycle=b.cycle and p.department=b.department and p.status='approved')"],
 ['Which range exceptions still need a decision?',"select cycle,employee_code,name,manager from proposal_register where outside_band and status in ('draft','submitted','imported')"],
 ['Which approved changes have no agreement reference?',READS['agreement-chase']],
 ['Which imported approvals have never been reconciled?',"select cycle,employee_code,source_status from proposal_register where status='imported' and lower(source_status)='approved'"],
 ['Which managers have both approved and unfinished proposals?',"select cycle,manager,count(*)::int records from proposal_register group by cycle,manager having bool_or(status='approved') and bool_or(status in ('draft','submitted','imported'))"],
 ['How much approved annual increase is waiting on agreement, by currency?',"select currency,sum(increase_cents)::bigint increase_cents from proposal_register where status='approved' and agreement_ref is null group by currency"],
 ['Which people appear in more than one open cycle?',"select employee_code,count(*)::int open_cycles from proposal_register where cycle_status='open' group by employee_code having count(*)>1"],
 ['Which submitted Australian changes still need employment-policy review?',"select cycle,employee_code,manager from proposal_register where jurisdiction='AU' and status='submitted' and policy_check_ref is null"],
 ['Which people have a proposed bonus and an unresolved range exception?',"select cycle,employee_code,name,currency,bonus_cents from proposal_register where bonus_cents>0 and outside_band and exception_ref is null and status<>'rejected'"],
];
// Flag allowlists catch typos before any writes. All amounts are annual actual salary or fixed bonus.
const SPECS={
 ...Object.fromEntries(Object.keys(READS).map(k=>[k,[0,[]]])),insights:[0,[]],proposal:[1,[]],
 'add-band':[0,['actor','code','currency','minimum','maximum','evidence']],
 'add-person':[0,['actor','code','name','department','manager','jurisdiction','currency','salary','band','evidence']],
 'open-cycle':[0,['actor','code','currency','effective','due','owner','policy']],
 'set-budget':[1,['actor','department','increase','bonus','evidence']],
 propose:[1,['actor','person','salary','bonus','rationale']],
 activate:[1,['actor','evidence']],revise:[1,['actor','salary','bonus','rationale']],submit:[1,['actor']],
 review:[1,['actor','decision','evidence','policy','exception']],
 'record-agreement':[1,['actor','evidence']],finalise:[1,['actor','evidence']],
 handover:[1,['file']],import:[2,['actor','cycle','dry-run']],export:[0,['file']],
 'weekly-review':[0,[]],'draft-review-note':[1,[]],log:[1,['actor','evidence']],
};
export const COMMANDS=Object.keys(SPECS);
export function help(){return `Pay review desk. node scripts/reviews.mjs <command> [arguments] [--key=value] [--json]\n${COMMANDS.join(', ')}\nExact syntax: docs/cli.md. Nothing sends or changes payroll.`;}
function required(o,k){const v=o[k];if(typeof v!=='string'||!v.trim())throw Error(`Required --${k}=value`);return v.trim();}
export function cents(value){const s=String(value??'');if(!/^\d{1,9}(\.\d{1,2})?$/.test(s))throw Error('Amount must be a nonnegative decimal with at most two places, no symbols or separators');const [a,b='']=s.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));}
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('Invalid ISO date');return s;}
function currency(s){if(!['NZD','AUD','USD','GBP','EUR'].includes(s))throw Error('Unsupported currency');return s;}
function same(a,b){return String(a).trim().toLowerCase()===String(b).trim().toLowerCase();}
const MAP={people:'employee_code',review_cycles:'code',pay_bands:'code',proposals:'id'};
async function resolve(db,t,ref){
 if(!ref)throw Error(`Missing ${t} reference`);
 const key=MAP[t];
 const rows=await db.query(`select * from ${t} order by ${key}`);
 const exact=rows.filter(r=>same(r.id,ref)||same(r[key],ref)||(t==='people'&&same(r.name,ref)));
 const hits=exact.length?exact:rows.filter(r=>String(r.id).toLowerCase().startsWith(ref.toLowerCase())||String(r[key]).toLowerCase().includes(ref.toLowerCase())||(t==='people'&&r.name.toLowerCase().includes(ref.toLowerCase())));
 if(hits.length!==1)throw Error(`${hits.length?'Ambiguous':'No matching'} ${t}: ${ref}\n${(hits.length?hits:rows).map(r=>`${r.id}  ${r[key]}  ${r.name||''}`).join('\n')}`);
 return hits[0];
}
async function cycleLock(db,id){const c=(await db.query('select * from review_cycles where id=$1 for update',[id]))[0];if(c.status!=='open')throw Error('Cycle is finalised');return c;}
async function audit(db,id,action,actor,detail){await db.query('insert into activity(entity_id,action,actor,detail) values($1,$2,$3,$4)',[id,action,actor,JSON.stringify(detail)]);}
async function insert(db,t,values){const keys=Object.keys(values);return (await db.query(`insert into ${t}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(values)))[0];}
async function update(db,t,id,values){const keys=Object.keys(values);return (await db.query(`update ${t} set ${keys.map((k,i)=>`${k}=$${i+2}`).join(',')} where id=$1 returning *`,[id,...Object.values(values)]))[0];}
async function checkBudget(db,p){
 const b=(await db.query('select * from budgets where cycle_id=$1 and department=$2',[p.cycle_id,p.department]))[0];if(!b)throw Error('No departmental budget');
 const used=(await db.query("select coalesce(sum(proposed_cents-baseline_cents),0)::text inc,coalesce(sum(bonus_cents),0)::text bonus from proposals where cycle_id=$1 and department=$2 and status in ('submitted','approved') and id<>$3",[p.cycle_id,p.department,p.id]))[0];
 if(Number(used.inc)+Number(p.proposed_cents)-Number(p.baseline_cents)>Number(b.increase_cents)||Number(used.bonus)+Number(p.bonus_cents)>Number(b.bonus_cents))throw Error('Departmental budget exceeded');
}
function privateFile(file,content){if(!file)throw Error('Required --file=path');const f=path.resolve(file);fs.mkdirSync(path.dirname(f),{recursive:true,mode:0o700});fs.writeFileSync(f,content,{flag:'wx',mode:0o600});return f;}
function draft(name,body){return {file:privateFile(path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`${name}-${randomUUID()}.md`),body)};}
function render(rows){if(!rows.length)return '(none)';return table(rows,Object.keys(rows[0]).map(key=>({key,label:key.replace(/_cents$/,'').replaceAll('_',' '),format:v=>key.endsWith('_cents')&&v!=null?(Number(v)/100).toFixed(2):v&&typeof v==='object'?JSON.stringify(v):v})));}
export function human(result){if(Array.isArray(result)&&result[0]?.question)return result.map(x=>x.question+'\n'+render(x.rows)).join('\n\n');if(Array.isArray(result))return render(result);return JSON.stringify(result,null,2);}

async function importWorkbook(db,args,o){
 if(args[0]!=='compxl')throw Error('Supported import: compxl');
 const cycle=await resolve(db,'review_cycles',required(o,'cycle'));await cycleLock(db,cycle.id);
 const actor=required(o,'actor'),rows=parseCsv(fs.readFileSync(args[1],'utf8'));
 if(!rows.length)throw Error('Empty import');
 const needed=['Employee ID','Name','Department','Manager','Jurisdiction','Currency','Current Salary','Proposed Salary','Bonus','Rationale','Status'];
 if(needed.some(k=>!(k in rows[0]))||Object.keys(rows[0]).some(k=>!needed.includes(k)))throw Error(`Use the configured workbook columns: ${needed.join(', ')}`);
 let inserted=0,skipped=0;const seen=new Set();
 for(const row of rows){
  for(const k of needed)if(!row[k].trim())throw Error(`Missing ${k}`);
  const key=row['Employee ID'].trim();if(seen.has(key))throw Error('Duplicate Employee ID in file');seen.add(key);
  currency(row.Currency);if(row.Currency!==cycle.currency)throw Error('Currency differs from cycle');
  if(!['NZ','AU'].includes(row.Jurisdiction))throw Error('Jurisdiction must be NZ or AU');
  const salary=cents(row['Current Salary']),proposed=cents(row['Proposed Salary']),bonus=cents(row.Bonus);
  if(salary<=0||proposed<salary)throw Error('Salary must be positive and proposed salary must not reduce the baseline');
  const hash=createHash('sha256').update(JSON.stringify(needed.map(k=>row[k]))).digest('hex');
  const old=(await db.query('select * from proposals where cycle_id=$1 and source_key=$2',[cycle.id,key]))[0];
  if(old){if(old.source_hash!==hash)throw Error(`Changed import for ${key}; reconcile changes separately`);skipped++;continue;}
  let person=(await db.query('select * from people where employee_code=$1',[key]))[0];
  if(person){if(person.currency!==row.Currency||Number(person.salary_cents)!==salary||person.name!==row.Name||person.department!==row.Department||person.manager!==row.Manager||person.jurisdiction!==row.Jurisdiction)throw Error(`Existing employee differs from import: ${key}`);}
  else person=await insert(db,'people',{employee_code:key,name:row.Name,department:row.Department,manager:row.Manager,jurisdiction:row.Jurisdiction,currency:row.Currency,salary_cents:salary});
  const p=await insert(db,'proposals',{cycle_id:cycle.id,person_id:person.id,baseline_cents:salary,proposed_cents:proposed,bonus_cents:bonus,department:person.department,manager:person.manager,rationale:row.Rationale,proposer:actor,status:'imported',source_key:key,source_hash:hash,source_status:row.Status});
  await audit(db,p.id,'import',actor,{source_key:key,source_hash:hash,source_status:row.Status});inserted++;
 }
 return {inserted,skipped,dry_run:Boolean(o['dry-run']),note:'Imported statuses are history, not approval.'};
}
export async function run(db,cmd,args=[],o={}){
 const spec=SPECS[cmd];if(!spec)throw Error(`Unknown command: ${cmd}`);
 if(args.length!==spec[0])throw Error(`${cmd} needs ${spec[0]} positional argument(s)`);
 for(const k of Object.keys(o))if(!spec[1].includes(k))throw Error(`Unknown flag --${k}`);
 if('dry-run'in o&&o['dry-run']!==true)throw Error('--dry-run takes no value');
 if(READS[cmd])return db.query(READS[cmd]);
 if(cmd==='insights'){const out=[];for(const [question,sql] of QUESTIONS)out.push({question,rows:await db.query(sql)});return out;}
 if(cmd==='proposal'){
  const p=await resolve(db,'proposals',args[0]);return {...(await db.query('select * from proposal_register where id=$1',[p.id]))[0],activity:await db.query('select action,actor,detail,created_at from activity where entity_id=$1 order by created_at,id',[p.id])};
 }
 if(cmd==='weekly-review'){const blocks=[];for(const c of ['attention','budget-check','compliance'])blocks.push(`## ${c}\n\n${render(await run(db,c))}`);return draft('weekly-review',`# Pay review handover\n\nInternal draft. Annual salary changes and one-off bonuses are separate budgets. No payroll is changed.\n\n${blocks.join('\n\n')}\n`);}
 if(cmd==='draft-review-note'){const p=await run(db,'proposal',args);return draft('review-note',`# Internal review note\n\nNothing sends. Not an offer or an employment agreement. Human review required.\n\n${JSON.stringify(p,null,2)}\n`);}
 if(cmd==='export'){
  const result={format:'pay-reviews-v1',exported_at:new Date().toISOString()};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try{for(const t of TABLES)result[t]=await db.query(`select * from ${t} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  return {file:privateFile(required(o,'file'),JSON.stringify(result,null,2)+'\n'),counts:Object.fromEntries(TABLES.map(t=>[t,result[t].length]))};
 }
 if(cmd==='handover'){
  const c=await resolve(db,'review_cycles',args[0]);if(c.status!=='finalised')throw Error('Finalise cycle before handover');
  const rows=await db.query("select employee_code,name,currency,baseline_cents,proposed_cents,bonus_cents,effective_on,agreement_ref,review_by,review_ref from proposal_register where cycle=$1 and status='approved' order by employee_code",[c.code]);
  if(!rows.length)throw Error('No approved proposals');
  // Formula-safe text cells; this is an internal review file, never a payroll integration.
  const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
  const keys=Object.keys(rows[0]);return {file:privateFile(required(o,'file'),[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k])).join(','))].join('\r\n')+'\r\n'),records:rows.length,note:'Internal handover only. Amounts are cents. Payroll operator validates before use.'};
 }
 const actor=required(o,'actor');await db.exec('BEGIN');
 try{
  let out;
  if(cmd==='import')out=await importWorkbook(db,args,o);
  else if(cmd==='add-band'){
   out=await insert(db,'pay_bands',{code:required(o,'code'),currency:currency(required(o,'currency')),minimum_cents:cents(required(o,'minimum')),maximum_cents:cents(required(o,'maximum')),source_ref:required(o,'evidence')});
  }else if(cmd==='add-person'){
   const cur=currency(required(o,'currency'));let b=null;if(o.band){b=await resolve(db,'pay_bands',required(o,'band'));if(b.currency!==cur)throw Error('Band currency differs');}
   out=await insert(db,'people',{employee_code:required(o,'code'),name:required(o,'name'),department:required(o,'department'),manager:required(o,'manager'),jurisdiction:required(o,'jurisdiction'),currency:cur,salary_cents:cents(required(o,'salary')),band_id:b?.id||null,baseline_ref:required(o,'evidence')});
  }else if(cmd==='open-cycle'){
   out=await insert(db,'review_cycles',{code:required(o,'code'),currency:currency(required(o,'currency')),effective_on:date(required(o,'effective')),due_on:date(required(o,'due')),owner:required(o,'owner'),policy_ref:required(o,'policy')});
  }else if(['set-budget','propose','finalise'].includes(cmd)){
   const c=await resolve(db,'review_cycles',args[0]);await cycleLock(db,c.id);
   if(cmd==='set-budget'){
    const values={cycle_id:c.id,department:required(o,'department'),increase_cents:cents(required(o,'increase')),bonus_cents:cents(required(o,'bonus')),evidence_ref:required(o,'evidence')};
    const b=(await db.query('select * from budgets where cycle_id=$1 and department=$2',[c.id,values.department]))[0];
    const used=(await db.query("select coalesce(sum(proposed_cents-baseline_cents),0)::text inc,coalesce(sum(bonus_cents),0)::text bonus from proposals where cycle_id=$1 and department=$2 and status in ('submitted','approved')",[c.id,values.department]))[0];
    if(Number(used.inc)>values.increase_cents||Number(used.bonus)>values.bonus_cents)throw Error('Budget cannot fall below reserved proposals');
    out=b?await update(db,'budgets',b.id,values):await insert(db,'budgets',values);
   }else if(cmd==='propose'){
    const e=await resolve(db,'people',required(o,'person'));if(e.currency!==c.currency)throw Error('Employee currency differs from cycle');
    out=await insert(db,'proposals',{cycle_id:c.id,person_id:e.id,baseline_cents:e.salary_cents,proposed_cents:cents(required(o,'salary')),bonus_cents:cents(required(o,'bonus')),department:e.department,manager:e.manager,rationale:required(o,'rationale'),proposer:actor});
   }else{
    const ps=await db.query('select * from proposals where cycle_id=$1',[c.id]);if(!ps.length||ps.some(p=>!['approved','rejected'].includes(p.status)))throw Error('All proposals must be approved or rejected');
    if(ps.some(p=>p.status==='approved'&&!p.agreement_ref))throw Error('Approved proposals need agreement evidence');
    for(const p of ps.filter(p=>p.status==='approved'))await checkBudget(db,p);
    out=await update(db,'review_cycles',c.id,{status:'finalised',finalised_by:actor,finalised_ref:required(o,'evidence')});
   }
  }else{
   let p=await resolve(db,'proposals',args[0]);await cycleLock(db,p.cycle_id);
   p=(await db.query('select * from proposals where id=$1 for update',[p.id]))[0];
   const e=(await db.query('select * from people where id=$1',[p.person_id]))[0];
   if(cmd==='activate'){
    if(p.status!=='imported')throw Error('Only imported proposals can be activated');
    await update(db,'people',e.id,{baseline_ref:required(o,'evidence')});
    out=await update(db,'proposals',p.id,{status:'draft',proposer:actor});
   }else if(cmd==='revise'){
    if(!['draft','rejected'].includes(p.status))throw Error('Only draft or rejected proposals can be revised');
    out=await update(db,'proposals',p.id,{proposed_cents:cents(required(o,'salary')),bonus_cents:cents(required(o,'bonus')),rationale:required(o,'rationale'),proposer:actor,status:'draft',review_by:null,review_ref:null,policy_check_ref:null,exception_ref:null,agreement_ref:null});
   }else if(cmd==='submit'){
    if(p.status!=='draft')throw Error('Only draft proposals can be submitted');if(!e.baseline_ref)throw Error('Reconcile salary baseline first');
    await checkBudget(db,p);out=await update(db,'proposals',p.id,{status:'submitted'});
   }else if(cmd==='review'){
    if(p.status!=='submitted')throw Error('Only submitted proposals can be reviewed');if(same(actor,p.proposer))throw Error('Independent reviewer required');
    const decision=required(o,'decision');if(!['approved','rejected'].includes(decision))throw Error('Decision must be approved or rejected');
    const ref=required(o,'evidence');let policy=null,exception=null;
    if(decision==='approved'){
     policy=required(o,'policy');await checkBudget(db,p);
     const b=e.band_id?(await db.query('select * from pay_bands where id=$1',[e.band_id]))[0]:null;
     if(b&&(Number(p.proposed_cents)<Number(b.minimum_cents)||Number(p.proposed_cents)>Number(b.maximum_cents)))exception=required(o,'exception');
    }
    out=await update(db,'proposals',p.id,{status:decision,review_by:actor,review_ref:ref,policy_check_ref:policy,exception_ref:exception});
   }else if(cmd==='record-agreement'){
    if(p.status!=='approved')throw Error('Only approved proposals can have an agreement');if(p.agreement_ref)throw Error('Agreement already recorded');
    out=await update(db,'proposals',p.id,{agreement_ref:required(o,'evidence')});
   }else if(cmd==='log'){out={id:p.id,evidence:required(o,'evidence')};}
  }
  if(!out)throw Error('Command not implemented');
  if(cmd!=='import')await audit(db,out.id,cmd,actor,{input:o,result:out});
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return out;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
