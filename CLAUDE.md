# Pay Reviews for Claude Code

For an authorised HR or finance operator recording human pay-review decisions. Track annual salary baselines, review budgets, manager proposals, independent approvals and agreement evidence. Payroll, tax and payments remain with their existing systems.

## Rules

- Every answer starts with a current CLI read. Never invent amounts, people, reasons, evidence or command output.
- Record human pay decisions. Never choose a person's raise, rate performance or infer protected characteristics.
- Never send, pay, update payroll, write an employment agreement or disclose another employee's pay data.
- Annual increases and fixed bonuses have separate budgets. Never combine currencies or infer exchange rates.
- Reconcile imported records explicitly. A source Approved status is history only.
- Reviewers supply real decisions and references. Actor labels do not authenticate identity.
- Keep the employee's own rights to discuss their pay distinct from protection of the employer's private dataset.
- Do not delete records, weaken approval gates or rewrite finalised cycles. Use a new migration and meaningful tests for /customise.
- Read docs/compliance.md before interpreting evidence findings. This desk cannot certify employment-law compliance.

## Routes

- /cycles: Read review cycles and agreed dates.
- /people: Read salary baselines, managers and departments.
- /bands: Read employer-supplied salary ranges.
- /budgets: Read separate increase and bonus budgets.
- /proposals: Read the current proposal register.
- /proposal: Read one proposal and its history.
- /attention: Find overdue work and missing evidence.
- /budget-check: Find departments whose full plan exceeds a budget.
- /manager-chase: Find managers with unfinished worksheets.
- /exceptions: Review proposals outside the recorded salary band.
- /agreement-chase: Find approved changes awaiting agreement evidence.
- /compliance: Check the evidence against the documented rules.
- /insights: Answer ten questions across proposals, budgets and evidence.
- /activity: Read recorded changes and their actor labels.
- /add-band: Record an employer-approved salary band.
- /add-person: Record a verified annual salary baseline.
- /open-cycle: Open a review cycle with its approved policy.
- /set-budget: Record authorised departmental budgets.
- /propose: Record the human manager's proposed salary and bonus.
- /activate: Reconcile an imported row into a draft proposal.
- /revise: Revise a draft or rejected proposal.
- /submit: Submit a draft after checking the reserved budget.
- /review: Record a separate human reviewer's decision.
- /record-agreement: Record evidence of an employee agreement already completed.
- /finalise: Freeze a completed review cycle.
- /log: Record an internal follow-up reference.
- /import: Import a configured CompXL worksheet saved as CSV.
- /export: Archive all domain records to a new private file.
- /handover: Write an internal handover CSV for a finalised cycle.
- /weekly-review: Draft the Monday review from attention, budget-check and compliance.
- /draft-review-note: Draft an internal note from a proposal and its recorded history.
- /documents: Render branded internal paperwork.
- /view: Render private read-only snapshots.
- /new-view: Add a read-only report.
- /customise: Add a field or local rule through a migration.

## Files and verification

scripts/reviews.mjs is the one CLI. docs/cli.md gives syntax. supabase/migrations is the data model, supabase/seed.sql is fictional demo data. DATABASE_URL chooses a dedicated PostgreSQL database, otherwise DATA_DIR selects embedded PGlite. TEST_DATABASE_URL is for an empty disposable test database only.

brand.json controls the business identity. views.json and documents.json use the shared template renderers. Never commit .data, exports, drafts, generated reports or credentials. Run npm install, npm test and npm run demo. Use a protected local machine or dedicated database owner. Shared use requires separate authenticated access and permissions.

Omni by Enterprise DNA installs, customises and operates your version for a setup fee, then a retainer.
