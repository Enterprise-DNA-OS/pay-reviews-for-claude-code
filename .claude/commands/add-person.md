---
description: "Record a verified annual salary baseline."
---

# add-person

Record a verified annual salary baseline.

Read the relevant proposal and history first. Obtain the human decision and evidence reference before recording it. Do not choose pay amounts or approve on someone's behalf. Actor labels are not authenticated identities.

```bash
node scripts/reviews.mjs add-person --code=<employee-id> --name="<name>" --department="<department>" --manager="<manager>" --jurisdiction=NZ --currency=NZD --salary=90000 --band=NZ-ANALYST --evidence=<reference> --actor="<authorised-person>" --json
```

Replace angle-bracket placeholders with verified inputs. The salary and budget amounts shown are syntax examples, never recommendations. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
