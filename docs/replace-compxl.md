# Move the pay-review desk from CompXL

## Export first

An authorised CompXL administrator downloads the planning workbook for the cycle. Salary.com describes downloadable workbooks and online/offline planning in its [CompXL product documentation](https://www.salary.com/platform/compxl/commission-product-details), checked 21 October 2026. Workbooks and columns are configurable. This importer is for the configured worksheet below, not a claim that every CompXL export has these headings.

Keep an untouched workbook and save the relevant sheet as UTF-8 CSV after mapping its headings. Freeze formula results as values. Exclude totals, blank footer rows and unrelated fields. Use plain decimals without currency symbols or grouping separators. A human confirms actual annual base salary, not a full-time-equivalent rate or a pay-period figure. Do not export unneeded personal data.

| CSV heading | Meaning |
|---|---|
| Employee ID | Stable unique employer identifier |
| Name | Display name |
| Department | Budget group, exact spelling |
| Manager | Responsible manager label |
| Jurisdiction | NZ or AU |
| Currency | NZD, AUD, USD, GBP or EUR, matching the cycle |
| Current Salary | Actual annual base salary in major units |
| Proposed Salary | Proposed actual annual base salary, at least the current amount |
| Bonus | Fixed one-off bonus in the same currency, zero allowed |
| Rationale | Human manager's recorded reason |
| Status | Source history, never trusted as approval |

All headings and values are required. Import one currency and one cycle per file. The synthetic tests/fixtures/compxl.csv demonstrates this contract and is not a vendor export captured from a real customer. No universal column schema is published by the vendor.

## One-command import

On a fresh protected database, run npm run migrate, register a cycle and its budgets, then:

```bash
node scripts/reviews.mjs import compxl imports/review.csv --cycle=FY27-NZ --actor="HR Operator" --dry-run --json
node scripts/reviews.mjs import compxl imports/review.csv --cycle=FY27-NZ --actor="HR Operator" --json
```

A dry run validates all rows and rolls back. Both runs use one transaction. A bad or changed row rolls back the entire file. Re-importing an identical source row skips it. Duplicate employee IDs, unexpected headings, currency mismatches, salary reductions and fractional cents fail. Existing employees must match the worksheet's baseline, name, jurisdiction, department and manager.

## Reconcile before using it

Compare source row count, employee IDs, salary totals and bonus totals separately by currency. Review every proposed salary and source status. Link your approved salary bands when configuring the people register. Imported rows enter imported status, including source Approved rows. Activate each with a real reconciliation reference, submit within budget, record a separate human review and attach agreement evidence. The source fingerprint remains after activation.

Test a whole cycle through documents, finalisation and the private handover file with your payroll owner before retiring covered work. A day is a migration target for a prepared, mapped worksheet, not a guarantee for every deployment.

## What needs separate migration work

Attachments, original workbook formulas, linked market-data subscriptions, historical audit identities, role permissions, equity awards, tax calculations, HRIS connections and old employee communications are not in this CSV contract. Bring approved salary bands separately. Never claim the imported dataset is a complete CompXL backup. Export the original records separately for retention.

The current CompXL Max product includes licensed market intelligence and other suite functions. This free build covers the administrative pay-review cycle. Enterprise DNA scopes your required fields, controls, documents, permissions and connections before a switch. Nothing sends or changes payroll.
