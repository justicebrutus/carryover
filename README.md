# Carryover

**Shift continuity for the work that cannot be dropped.**

Carryover is a fictional plant-operations product case study for preparing shift handoffs, accepting responsibility, assigning action, and recording proof of closure.

`Observation → Prepared handoff → Incoming cross-check → Assigned action → Resolution evidence → Updated operating record`

## Product architecture

- **Overview** — current shift brief, unresolved conditions, unacknowledged transfers, and the next decision.
- **Handoffs** — outgoing preparation and incoming cross-check remain two accountable sides of one record.
- **Issues** — searchable operating records with connected handoffs, actions, evidence, and immutable history.
- **Actions** — ownership, evidence submission, approval, return-for-work, and closure.
- **Reports** — filtered operating brief, print/PDF output, and CSV export.

The shareable `?tour=handoff` guide uses the same real routes, records, permissions, persistence, and audit history as freeform use.

## Engineering

- React, TypeScript, React Router, Vite.
- Versioned V2 workspace with V1 migration and corruption recovery.
- Replaceable repository interface with local-storage implementation.
- Deterministic fictional record date and audit events.
- Role-preview permissions for Operator, Shift supervisor, and Plant manager.
- Desktop operating ledgers, tablet task sequences, and mobile record views.
- Vitest domain coverage and Playwright journey/route verification.

## Run locally

```bash
npm install
npm run dev
npm test
npm run test:e2e
npm run build
```

## Demonstration boundary

All plants, people, equipment, incidents, actions, and records are fictional and unrelated to any real employer. Role preview demonstrates interface behaviour; it is not authentication. Carryover does not replace approved plant procedures.
