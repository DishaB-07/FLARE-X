# FLARE-X — final project handoff (2026-11-14)

- Project: FLARE-X, NASA Space Apps 2026, Flame in Freefall. Preserve this codebase; do not replace it with new scaffold.
- Current application: FastAPI backend, React/Vite UI, 24 normalized metadata records, search/filter, investigation details, 2–3 record comparison, research pathways, research relevance ranking, evidence-gap view, source verification, evidence-first Research Assistant with optional Gemini REST call.
- Scientific boundary: metadata-only historical snapshot; no full-paper RAG or raw PSI experiments ingested. No measured fire-risk scores, operational flight-safety claims, fabricated DOI or NASA endorsement.
- NASA citation audit: six independently verified investigation DOI pairs; 18 official NASA programme/context references still need exact individual PSI page DOI/citation confirmation. Details in `NASA_PSI_VERIFICATION_REPORT.md`.
- Tests: 23 backend tests passed during packaging. Frontend production build and Docker hosting still require local verification.
- User requested one fully updated ZIP because an earlier download link was inaccessible; this package includes complete code, data, documentation, deployment files, and editable presentation draft.
- Run and deploy instructions: see `START_HERE.md` and `DEPLOYMENT.md`. Set Gemini key only as backend environment secret.
- Public deployment and NASA submission are **not completed**.


## Phase 5 — Investigation popup and visual refinement

- Centered, responsive, portal-based details modal replaced right-hand drawer.
- Added accessible keyboard handling and source-aware condition/citation display with numeric basis notes.
- Added overview evidence workflow diagram and subtle depth/hover effects.
- Data JSON, backend interfaces and existing features were preserved.
- Test & local verification details: `PHASE5-VISUAL-UPDATE.md`.
