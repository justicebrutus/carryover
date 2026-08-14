# UI Audit — Carryover V2

## Release decision

**PASS.** Carryover is approved for public deployment. Every applicable item in the 121-check exceptional frontend standard passes; nine non-applicable checks have written scope reasons in `.ui-audit.json`. No failures or blockers remain. This re-audit adds four product-depth features — a command palette, undo/redo time-travel of the operating record, cross-tab live sync, and an installable offline (PWA) build — with no regression to the existing surfaces.

## Product goal and scope

Carryover helps a fictional beverage-packaging team move an unresolved operating condition through observation, outgoing preparation, incoming verification, assigned work, evidence, closure, and an updated operating record. This full-project audit covers every workspace, every deep-link record, the role preview, V1 migration, corruption recovery, local persistence, CSV output, print output, responsive navigation, and the guided recruiter journey.

## Verified evidence

- 25 Vitest domain, migration, permission, lifecycle, filter, export, and undo/redo-history checks pass.
- Strict TypeScript and the Vite production build pass.
- `npm audit` reports zero dependency vulnerabilities.
- 105 Playwright release cases pass: seven product checks in each of 15 browser/viewport cells.
- Chromium, Firefox, and WebKit each passed at 1440×900, 1024×768, 768×1024, 390×844, and 320×568.
- The matrix covers ten important routes, horizontal overflow, browser-console errors, the complete persisted handoff journey, role restrictions, responsive keyboard navigation, CSV naming, print-only output, and the three new product-depth features — command palette, undo/redo of the operating record, and cross-tab live sync.
- Lighthouse on the production build scored 100 Performance, 100 Accessibility, and 100 Best Practices, re-run after the additions and unchanged.
- The final JavaScript bundle is 239.74 kB (73.75 kB gzip); CSS is 32.58 kB (6.66 kB gzip). Carryover ships no remote fonts, raster photography, chart dependency, client API, or analytics payload.

## Repairs made during audit

- Replaced employer-adjacent composite-manufacturing records with a fictional Canadian beverage-packaging plant.
- Changed the guide from a simulated completed state into a real observation-first workflow using product forms and persisted mutations.
- Made record state outrank stale URL tour hints so progress remains truthful after refresh and back/forward navigation.
- Persisted changes at the mutation boundary so route changes cannot drop the final decision.
- Rebuilt tablet and mobile navigation as task-focused layouts instead of compressed desktop UI.
- Added focus trapping, Escape dismissal, and focus restoration to the responsive navigation sheet.
- Removed laptop logbook overflow and narrow-screen decorative overflow.
- Aligned the CSV filename with the interface’s “shift brief” language.
- Added a valid robots policy after Lighthouse exposed the missing production artifact.

## Product-depth additions (this re-audit)

- **Command palette** (Ctrl/Cmd+K, or the on-screen trigger): a hand-rolled accessible dialog that searches real issue, handoff, and action records and runs navigation and workspace commands. Focus is trapped, Escape closes and restores focus, and one shared focus-trap hook now backs both the palette and the responsive navigation sheet.
- **Undo/redo time-travel**: every record mutation already flows through one boundary, so a session-only snapshot history rewinds and replays real changes — the operating record and its immutable audit trail revert and re-apply together. Bound to ⌘Z / ⌘⇧Z, guarded so native text undo still works inside the composer forms, and announced through an aria-live region.
- **Cross-tab live sync**: a save in one tab is adopted by any other open tab through BroadcastChannel with a storage-event fallback and an equality guard that prevents echo loops. Local undo history is cleared on a foreign change because it cannot be coherently reversed from another tab.
- **Installable + offline (PWA)**: a web manifest and a hand-rolled service worker — which precaches the shell and the hashed build assets it discovers from `index.html`, then serves cache-first with a network fallback — make Carryover installable and fully usable offline. Verified in Chromium by registering the worker, going fully offline, and confirming the workspace still renders and operates from cache with zero failed requests. The app icon is a vector `C/O` mark, so the zero-raster identity holds; the worker registers in production only, leaving development and the test suite un-cached.
- All four additions are zero-dependency and hand-rolled; the production bundle grew about 2 kB gzip. The original 60 release cases still pass unchanged, and 45 new cases exercise the additions across the same 15-cell matrix.

## Accessibility and human checks

- Semantic links, buttons, forms, tables, headings, status text, skip navigation, and visible focus are present.
- Disabled actions state the role required; the role preview is explicitly not authentication.
- Navigation is operable with pointer and keyboard, traps focus only while open, closes with Escape, and returns focus to its trigger.
- Reduced motion removes nonessential transitions while preserving state feedback.
- Mobile controls maintain at least 44px targets; 200% zoom and narrow-screen reading order do not require horizontal panning.
- Print output removes application controls while retaining record date, filters, disclosure, and readable tables.

## Boundaries and justified exclusions

- Authentication, server APIs, server errors, notifications, analytics, and post-launch user data are outside this explicitly local fictional demonstration.
- Raster-image delivery is not part of this interface; its identity is carried by typography, rules, state, and layout.
- No lint or formatter command exists in the repository. Strict TypeScript, the production build, unit tests, browser tests, source review, and clean console cover the release instead.
- Carryover does not replace approved plant safety or production procedures.

Machine-readable evidence and every item-level disposition are stored in `.ui-audit.json` and validated by the distinctive UI skill’s deterministic release gate.
