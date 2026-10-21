---
description: "Record authorised departmental budgets."
---

# set-budget

Record authorised departmental budgets.

Read the relevant proposal and history first. Obtain the human decision and evidence reference before recording it. Do not choose pay amounts or approve on someone's behalf. Actor labels are not authenticated identities.

```bash
node scripts/reviews.mjs set-budget <cycle> --department="<department>" --increase=5000 --bonus=1000 --evidence=<reference> --actor="<authorised-person>" --json
```

Replace angle-bracket placeholders with verified inputs. The salary and budget amounts shown are syntax examples, never recommendations. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
