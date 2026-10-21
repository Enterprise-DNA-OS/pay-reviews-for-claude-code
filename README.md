# Pay Reviews for Claude Code

The open-source pay review desk that is just a database and Claude Code. Built by Enterprise DNA. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Follow the quick start below. | Your review fields, budget rules and CompXL history. [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=compxl). | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. [See the offer](https://enterprisedna.co/omni/instead-of/compxl?utm_source=github&utm_medium=readme&utm_campaign=compxl). |

## The bill and the work

CompXL's published ADP Marketplace Annual Planning offer lists US$20,000 a year for up to 250 employees on a one-year contract. This is a listed edition, not a verified local customer invoice or a current CompXL Max quote. [Pricing evidence and selection](docs/research.md).

This desk covers the HR operator's review cycle: verified annual salary baselines, employer-supplied pay bands, separate salary-increase and bonus budgets, manager proposals, review decisions and agreement evidence. A prepared CompXL planning worksheet saved as CSV imports in one command. Payroll, tax, licensed market data and legal pay decisions stay with the existing systems and authorised people.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/pay-reviews-for-claude-code.git
cd pay-reviews-for-claude-code
npm install
npm test
npm run demo
npm run view
npm run docs
```

Node 20 or later. PGlite runs locally without a server. DATABASE_URL selects a dedicated PostgreSQL 15+ database and DATA_DIR selects local storage. Use a fresh database and npm run migrate for business records. All demo people and references are fictional. Never seed demo data into your operational database.

## Five weekly rituals

Chase unfinished manager worksheets, check departmental budgets, review range exceptions, collect agreement evidence and prepare the decision pack. /weekly-review drafts the Monday note from three current reports. A submitted proposal reserves its annual increase and bonus separately. The whole plan can still exceed budget, which /budget-check shows before managers finish.

## Commands

31 CLI commands and 35 slash recipes. [Exact syntax and state transitions](docs/cli.md).

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
- /view: Render the week, budget and evidence snapshots.
- /new-view: Add a read-only report.
- /customise: Add a field or rule through a migration.

## Ten questions your desk answers today

/insights answers these from existing data. They are shipped reports across your records, not a claim that CompXL cannot be configured to answer them.

1. Which managers have overdue proposals and missing salary evidence?
2. Which departments exceed their proposed increase budget while holding approved changes?
3. Which range exceptions still need a decision?
4. Which approved changes have no agreement reference?
5. Which imported approvals have never been reconciled?
6. Which managers have both approved and unfinished proposals?
7. How much approved annual increase is waiting on agreement, by currency?
8. Which people appear in more than one open cycle?
9. Which submitted Australian changes still need employment-policy review?
10. Which people have a proposed bonus and an unresolved range exception?

## Your first hour: ten things to ask for

1. Put our business name and logo on the decision packs.
2. Show the unfinished manager worksheets.
3. Show which department's planned increases exceed budget.
4. Explain why annual increases and bonuses stay separate.
5. Show approved changes waiting for agreement evidence.
6. Add our employer-approved salary band.
7. Import our mapped workbook with a dry run.
8. Compare source totals with the imported proposal count.
9. Add our business-unit field through /customise.
10. Prepare an internal handover after a complete test cycle.

## Evidence, privacy and ownership

Imported Approved rows stay unapproved until reconciled. A distinct human reviewer label, employment-policy review reference and any range exception are required for approval. Every approved change needs agreement evidence before finalisation. Finalised cycles cannot be changed through the CLI. Finalisation never updates the salary register or payroll. [Rules and sources](docs/compliance.md).

The free version uses a trusted local operator or a dedicated database owner. Actor labels are not authenticated identities and the activity log is not tamper-proof. Shared use needs authenticated permissions, tested backups and a retention policy. Keep salaries, imports, exports and rendered documents private. Protecting the employer's dataset does not remove an employee's rights to discuss their own pay.

npm run docs produces private cycle packs, individual review worksheets and agreement follow-up registers. These are internal working papers, not employment agreements or payslips. npm run view produces three branded read-only dashboards. brand.json controls identity. [Why no front end](docs/why-no-front-end.md).

## Import and verification

[Switching guide](docs/replace-compxl.md). The importer validates one configured workbook saved as CSV. It rejects unknown columns, changed source rows and mismatched baselines, rolls back the entire file on any failure, and skips an identical repeat. Attachments, formulas, market-data subscriptions and historic access controls require separate migration work.

npm test uses temporary storage and exercises every CLI command, seed idempotence, independent reviews, currency isolation, separate budgets, finalisation, import rollback, drafts, export completeness and HTML escaping. CI covers Windows and Linux on Node 20 and 22, plus PostgreSQL 17. Check the actual run before claiming those platforms passed.

## Your version

Omni by Enterprise DNA brings your agreed CompXL records across, builds your review rules and documents, connects the systems you need and operates the result. Team screens and a different stack can be scoped. One setup fee, then a retainer.

[Book Sam's 30-minute call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=compxl).

MIT. Copyright 2026 Enterprise DNA. CompXL is its owner's trademark. This independent project is not affiliated with Salary.com or CompXL.
