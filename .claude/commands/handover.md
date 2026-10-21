---
description: "Write an internal handover CSV for a finalised cycle."
---

# handover

Write an internal handover CSV for a finalised cycle.

Read fresh data. Keep employee pay records and output private. Do not infer a missing approval or invent evidence.

```bash
node scripts/reviews.mjs handover <cycle> --file=exports/handover.csv --json
```

Replace angle-bracket placeholders with verified inputs. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
