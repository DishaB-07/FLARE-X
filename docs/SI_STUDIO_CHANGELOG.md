# FLARE-X SI Research Studio update

Based directly on `FLARE-X-ThreeJS-Flow-Premium-Full-Project.zip`; this is a targeted extension, not a rebuild.

## Added

- `POST /api/assistant/compare` — 2–3 PSI record comparisons with deterministic side-by-side catalogue fields and optional Gemini narration.
- `POST /api/assistant/brief` — theme-based research brief with ranked source IDs, evidence and optional Gemini narration.
- `GET /api/assistant/status` — safe Gemini configuration indicator; **does not test connectivity or expose credentials**.
- `backend/services/si_workbench.py` — reusable, retrieval-first comparison and brief logic.
- `frontend/src/components/assistant/SIWorkbench.jsx` — responsive compare/brief UI, live mode indicators, evidence cards, available-field matrix and accessible inputs.
- `frontend/src/hooks/useSIWorkbench.js` — API requests, errors, aborts, busy state and form state.
- `frontend/src/styles/si-workbench.css` — matched to the original dark theme with mobile layouts and reduced-motion support.
- `docs/SI_WORKBENCH.md` — full configuration, architecture, verification and demo notes.

## Strengthened

- Gemini-generated answers now require retrieved-source PSI citations on each statement and reject invented numeric literals not present in the cited record metadata. Source-ID numerals are excluded from numeric evidence checks.
- Original Assistant's mode label now reports actual response mode instead of always implying catalogue mode.
- The Overview shortcut and sidebar now make the SI Research Studio discoverable.
- Existing catalogue responses remain intact; the original JSON, schema and DOI audit were not edited.

## Verified locally

- 34/34 FastAPI tests passing, including mocked Gemini REST transport and new SI workflow failures/fallbacks.
- 14/14 frontend API/helper/workflow tests passing.
- All frontend JS/JSX parsed and local imports resolved; all CSS files parsed without syntax errors.
- Eleven original API endpoint responses matched the previous project, with only a backward-compatible additional `validation` field on the legacy assistant response.
- Original `data/investigations.json`, `data/schema.json`, and `data/psi_citation_audit.json` byte-identical.

## Not verified in this environment

- Live Gemini request with your key, rate limits or provider availability.
- Full Vite/React build: required npm dependencies were not available in local cache, and registry access was unavailable.
- Interactive/browser/mobile end-to-end visual tests.
- Public deployment and NASA Space Apps project submission.

**Scientific scope:** Catalogue metadata only, not full-paper RAG, raw combustion experiments, safety certification or validated fire-risk estimation.
