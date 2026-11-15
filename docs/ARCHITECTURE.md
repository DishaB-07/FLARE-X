# FLARE-X architecture — modular refactor

## Request/data flow

```text
Browser (React/Vite)
  ├─ App.jsx ─ shared page selection, open record, comparison selection
  ├─ pages/ ─ UI content only
  ├─ components/ ─ modal, cards, layout, summaries, evidence
  ├─ hooks/ ─ local state and async data loading
  └─ services/api.js ─ GET/POST, parsing, abort signals, errors
             │ /api/* or /health
             ▼
FastAPI backend/main.py (app/router composition + production assets)
  ├─ api/routes/catalogue.py ─ metadata, investigations, compare
  ├─ api/routes/research.py ─ relevance, coverage, brief
  ├─ api/routes/citations.py ─ citation audit
  └─ api/routes/assistant.py ─ retrieval first, Gemini optional
             │
  ├─ services/ ─ domain computations; never render UI
  └─ data_access/catalogue.py ─ read-only JSON loaded once at startup
             │
     data/investigations.json + data/psi_citation_audit.json
```

## Component design and state

`App.jsx` owns **only** cross-page UI state: selected investigation, recent visits, selected research theme, assistant seed question, mobile navigation, and Easy read preference. Hash-based navigation is handled by `useHashPage`; comparison state by `useComparison`; catalogue filters, loading and results by `useCatalogue`; and Assistant messages by `useAssistantChat`. These are small local hooks — **no Redux, global mutable store or database is needed for the 24-record scope**.

Each page renders props and calls hooks or callbacks; pages do not implement network transport. `services/api.js` handles HTTP errors, 422 validation responses, network failures and aborts. All requests from the interface go through this shared service.

The original CSS selectors remain compatible with existing JSX and are grouped under `src/styles/`: `styles.css`, `readability.css`, `presentation.css`, `research-intelligence.css`, and `workflow.css`. The Overview now uses an interactive five-stage research pipeline instead of the former decorative orbit; the centered modal, charts, navigation and other page designs are unchanged. `components/research/ResearchWorkflow.jsx` owns local step-selection state and receives existing navigation callbacks.

## FastAPI responsibilities

- `api/routes/`: request parameters, response endpoints, explicit 400/404/422 statuses.
- `schemas/assistant.py`: typed input validation with 3–500 character limit.
- `services/catalogue.py`: pure search and comparison, no HTTP or disk I/O.
- `services/research.py`: transparent textual ranking/coverage and source-bounded briefs.
- `services/assistant.py`: keyword retrieval, evidence display fields, optional server-side Gemini REST, deterministic fallback.
- `services/citations.py`: separate title/DOI verification enrichment, no fabricated links.
- `data_access/catalogue.py`: JSON loading/shape validation. JSON is loaded once per process, not edited by API calls.
- `core/config.py`: filesystem references, backend `.env`, CORS origins.
- `main.py`: app assembly + production Vite asset serving.

`backend/assistant.py` and `backend/research.py` provide compatibility for earlier imports. New code should import services from `backend.services.*`. The `main.RECORDS`, `main.CATALOGUE`, and `main.FRONTEND_DIST` names are retained to support existing tests/integrations.

## Extend a feature safely

1. Put a new pure transformation in `backend/services/`, and include a Python unit test.
2. Expose it through an existing or new `backend/api/routes/` router; include the router from `main.py`.
3. Add the client API call to `frontend/src/services/api.js` or a focused hook — never duplicate raw `fetch` in components.
4. Keep page JSX in `pages/` and reusable pieces in `components/`.
5. Avoid moving/mutating the source JSON or making claims beyond the available metadata.
6. Run `pytest`, `npm test`, `npm run build`, then inspect UI on desktop and mobile.

No ORM/database, vector store, global state library, or new 3D engine was introduced: none is necessary at this volume or supported by the data scope.
