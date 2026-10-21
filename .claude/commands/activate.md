---
description: "Reconcile an imported row into a draft proposal."
---

# activate

Reconcile an imported row into a draft proposal.

Read the relevant proposal and history first. Obtain the human decision and evidence reference before recording it. Do not choose pay amounts or approve on someone's behalf. Actor labels are not authenticated identities.

```bash
node scripts/reviews.mjs activate <proposal-id> --evidence=<source-reconciliation-reference> --actor="<authorised-person>" --json
```

Replace angle-bracket placeholders with verified inputs. The salary and budget amounts shown are syntax examples, never recommendations. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
