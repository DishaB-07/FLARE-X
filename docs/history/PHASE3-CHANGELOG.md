# Phase 3 changelog — FLARE-X (November 14, 2026)

## Preserved

- Original 24 NASA PSI catalogue records and `data/schema.json` unchanged.
- FastAPI API routes, investigation explorer, comparison matrix, source detail
  drawer, research pathways, Research Assistant and evidence trail.
- Strict missing-data labels and non-endorsement disclosures.

## UI/UX

- Three prominent, responsive workflow-entry cards on Overview.
- More layered pointer-responsive **conceptual CSS 3D** orbit (not a data model).
- Better hover depth, focus affordances and reduced-motion handling.
- Global `/` and `Ctrl+K` shortcut plus top-bar search action.
- Debounced catalogue search (260 ms) to reduce unnecessary API requests.
- Clear-filter recovery button for empty searches.
- Sticky selection tray when 1–3 investigations are selected for comparison.
- API failure banner with a manual Retry button.
- Hash routes such as `/#/assistant` support direct links and browser back.
- Original FLARE-X SVG favicon, not a NASA mark.

## Deployment prep

- Multi-stage Docker image: Node 22 for frontend, Python 3.12 for FastAPI.
- Vite development proxy and production same-origin API requests.
- FastAPI serves `frontend/dist/index.html`, compiled assets and favicon.
- Render Docker Blueprint with `/health` application-level health check.
- Documented secret handling and public demo verification checklist.

## Validation

- Python backend tests: **14/14 passed** in editing environment.
- React JSX files: parsed without syntax diagnostics via TypeScript parser.
- CSS stylesheet: parsed without top-level syntax errors via tinycss2.
- `npm install` could not reach registry.npmjs.org (`EAI_AGAIN`), so no
  production frontend build or browser rendering was claimed.
- Docker engine unavailable; Docker build and real public deployment untested.
