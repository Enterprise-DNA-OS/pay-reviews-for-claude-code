# Command reference

All commands: `node scripts/reviews.mjs <command>`. Add `--json` for structured output. Human output uses aligned columns. Flags use `--key=value`, with quotes around values containing spaces. Unknown flags fail before a write. `--dry-run` is a valueless flag, not `--dry-run=false`.

All monetary inputs are plain decimals with at most two decimal places and no currency symbols or thousands separators. Salary means actual annual base salary, not a full-time-equivalent rate. Bonus means a fixed one-off amount. Stored and exported `_cents` values are integer minor units. No proration, currency conversion, deductions, tax, pension, award calculation or payroll execution occurs.

Names and codes are case-insensitive. Exact matches win, then partial UUID or name matches. Ambiguous matches list candidates and exit 1. Proposal arguments use UUIDs or unique prefixes from `proposal` / machine output. Reads include IDs through `proposal`, `compliance` and the archive. `--help` prints the command list.

## Commands

- `cycles `: Read review cycles and agreed dates.
- `people `: Read salary baselines, managers and departments.
- `bands `: Read employer-supplied salary ranges.
- `budgets `: Read separate increase and bonus budgets.
- `proposals `: Read the current proposal register.
- `proposal <proposal-id>`: Read one proposal and its history.
- `attention `: Find overdue work and missing evidence.
- `budget-check `: Find departments whose full plan exceeds a budget.
- `manager-chase `: Find managers with unfinished worksheets.
- `exceptions `: Review proposals outside the recorded salary band.
- `agreement-chase `: Find approved changes awaiting agreement evidence.
- `compliance `: Check the evidence against the documented rules.
- `insights `: Answer ten questions across proposals, budgets and evidence.
- `activity `: Read recorded changes and their actor labels.
- `add-band --code=NZ-ANALYST --currency=NZD --minimum=70000 --maximum=110000 --evidence=<reference> --actor=<person>`: Record an employer-approved salary band.
- `add-person --code=<employee-id> --name="<name>" --department="<department>" --manager="<manager>" --jurisdiction=NZ --currency=NZD --salary=90000 --band=NZ-ANALYST --evidence=<reference> --actor=<person>`: Record a verified annual salary baseline.
- `open-cycle --code=<cycle> --currency=NZD --effective=2027-04-01 --due=2027-03-15 --owner="<owner>" --policy=<reference> --actor=<person>`: Open a review cycle with its approved policy.
- `set-budget <cycle> --department="<department>" --increase=5000 --bonus=1000 --evidence=<reference> --actor=<person>`: Record authorised departmental budgets.
- `propose <cycle> --person=<employee-id> --salary=94000 --bonus=500 --rationale="<reason>" --actor=<person>`: Record the human manager's proposed salary and bonus.
- `activate <proposal-id> --evidence=<source-reconciliation-reference> --actor=<person>`: Reconcile an imported row into a draft proposal.
- `revise <proposal-id> --salary=94000 --bonus=500 --rationale="<reason>" --actor=<person>`: Revise a draft or rejected proposal.
- `submit <proposal-id> --actor=<person>`: Submit a draft after checking the reserved budget.
- `review <proposal-id> --decision=approved --evidence=<decision-reference> --policy=<employment-policy-check> [--exception=<range-exception-reference>] --actor=<person>`: Record a separate human reviewer's decision.
- `record-agreement <proposal-id> --evidence=<agreement-reference> --actor=<person>`: Record evidence of an employee agreement already completed.
- `finalise <cycle> --evidence=<authorised-close-reference> --actor=<person>`: Freeze a completed review cycle.
- `log <proposal-id> --evidence=<reference> --actor=<person>`: Record an internal follow-up reference.
- `import compxl <file.csv> --cycle=<cycle> [--dry-run] --actor=<person>`: Import a configured CompXL worksheet saved as CSV.
- `export --file=exports/archive.json`: Archive all domain records to a new private file.
- `handover <cycle> --file=exports/handover.csv`: Write an internal handover CSV for a finalised cycle.
- `weekly-review `: Draft the Monday review from attention, budget-check and compliance.
- `draft-review-note <proposal-id>`: Draft an internal note from a proposal and its recorded history.

## Review sequence

Open a cycle, register separate departmental budgets, propose, submit, review, record-agreement, finalise, handover. A rejected proposal can be revised and resubmitted. Approval requires a reviewer label different from the proposer, an employment-policy review reference and, when outside the recorded band, a range-exception reference. Rejection requires a reason reference but no policy or range exception. No command sends an employee letter or issues payment.

Submission reserves the annual increase and bonus independently. Draft and imported rows count in planned totals but do not reserve budget. The budget check shows a full plan that exceeds capacity even when reserved work still fits. All changes lock the cycle before checking its budget. Finalisation requires every proposal approved or rejected, agreement evidence for each approval, and valid budgets. Finalised records cannot be edited through the CLI. The people register is not changed by finalisation. To start a later cycle, reconcile a new baseline from the authoritative HR record through an explicit migration or a reviewed extension using /customise.

`activate` records that an authorised human has reconciled the imported annual salary and proposed amounts. It does not approve anything. It changes the local baseline evidence reference and moves the row to draft. A repeat of the identical import is skipped even after reconciliation. Changed source rows fail and must be reviewed separately.

`handover` writes a private CSV with integer cents, evidence references and effective dates. It is not a payroll-compatible import promise. The payroll owner validates the mapping, annual basis and agreed effective date separately. All output files are created exclusively, so existing exports are never overwritten.

The trusted database owner can bypass application rules. Actor labels are operational history, not authenticated approval. Deploy identity, access controls and tested backups before shared use.
