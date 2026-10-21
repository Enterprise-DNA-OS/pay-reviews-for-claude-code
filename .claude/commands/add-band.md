---
description: "Record an employer-approved salary band."
---

# add-band

Record an employer-approved salary band.

Read the relevant proposal and history first. Obtain the human decision and evidence reference before recording it. Do not choose pay amounts or approve on someone's behalf. Actor labels are not authenticated identities.

```bash
node scripts/reviews.mjs add-band --code=NZ-ANALYST --currency=NZD --minimum=70000 --maximum=110000 --evidence=<reference> --actor="<authorised-person>" --json
```

Replace angle-bracket placeholders with verified inputs. The salary and budget amounts shown are syntax examples, never recommendations. List ambiguous matches and resolve the intended record. Present the result and next unresolved evidence item. Nothing sends, pays or changes payroll.
