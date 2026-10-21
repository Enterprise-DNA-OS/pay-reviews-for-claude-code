---
description: "Import a configured CompXL worksheet saved as CSV."
---

# import

Import a configured CompXL worksheet saved as CSV.

Read the relevant proposal and history first. Obtain the human decision and evidence reference before recording it. Do not choose pay amounts or approve on someone's behalf. Actor labels are not authenticated identities. Read docs/replace-compxl.md. Start with --dry-run, reconcile counts and amounts, then run the same command without that flag. Imported approvals are history only.

```bash
node scripts/reviews.mjs import compxl <file.csv> --cycle=<cycle> [--dry-run] --actor="<authorised-person>" --json
```

Replace angle-bracket placeholders with verified inputs. The salary and budget amounts shown are syntax examples, never recommendations. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
