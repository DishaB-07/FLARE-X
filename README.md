# FLARE-X — Space Fire Research Intelligence

**NASA Space Apps Challenge 2026 · Flame in Freefall**  
Existing React/FastAPI prototype, reorganized for maintainability without replacing its design, data, or API endpoints.

FLARE-X helps users **search, compare, rank by research relevance, and inspect evidence** in a 24-record snapshot of NASA Physical Sciences Informatics (PSI) Combustion Science investigation catalogue metadata. The project includes an evidence-linked research assistant, transparent keyword ranking, evidence-coverage charts, citation review, a centered investigation-details modal, and a standalone, selectable five-stage evidence workflow with a lightweight Three.js data-current visualization on the Overview page.


## SI Research Studio (new)

The Research Assistant now includes **three workflows**: evidence-linked Q&A, side-by-side **cross-investigation analysis**, and **research brief generation**. Gemini is **optional and server-side**; deterministic catalogue-based responses work without credentials. Results expose the actual mode (`gemini` or `catalogue`), the retrieved PSI evidence and citation/numeric guardrail limitations.

- New: `GET /api/assistant/status` (key configured, **not** proof the service is reachable)
- New: `POST /api/assistant/compare` with `{"ids":["PSI-26","PSI-62"]}`
- New: `POST /api/assistant/brief` with `{"theme":"detection"}`
- Preserved: `POST /api/assistant/ask` and all existing endpoints

See **[SI Workbench documentation](docs/SI_WORKBENCH.md)** for architecture, Windows setup, API usage, data safeguards and live Gemini verification instructions. The catalogue is a 24-record snapshot, not full-text research or raw PSI measurements.

## Quick start (Windows PowerShell)

Open the extracted **`flare-x`** folder (the one containing `backend`, `frontend`, and `Dockerfile`) in VS Code.

**Terminal 1 — API (project root):**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Visit <http://127.0.0.1:8000/health> (expected: `records_loaded: 24`) or <http://127.0.0.1:8000/docs>.

**Terminal 2 — UI (project root first):**

```powershell
cd frontend
npm install
npm test
npm run build
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>. Keep the API running in Terminal 1. Use **Node.js 22** and **Python 3.12** as the recommended versions.

> On organization-managed Windows machines, use `py -3.12 -m pip ...` or `.venv\Scripts\python.exe -m pip ...` rather than standalone `pip.exe` if Device Guard blocks it. Do not disable security controls.

## Project structure

```text
flare-x/
├── backend/
│   ├── main.py                 # Small FastAPI composition root + built-frontend serving
│   ├── api/routes/             # Stable HTTP endpoint handlers
│   ├── core/config.py          # Backend environment, allowed origins, file paths
│   ├── data_access/catalogue.py# Read-only JSON loading + validation
│   ├── schemas/               # Pydantic request schemas
│   ├── services/              # Catalogue, research, citations, assistant logic
│   ├── assistant.py            # Legacy import compatibility
│   ├── research.py             # Legacy import compatibility
│   └── tests/                  # API, integration and integrity tests
├── data/
│   ├── investigations.json     # Original 24 records (unchanged)
│   ├── schema.json             # Original JSON schema (unchanged)
│   └── psi_citation_audit.json # Separate verification audit (unchanged)
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Page composition and cross-page UI state
│   │   ├── components/         # Layout, record modal, interactive workflow, shared UI
│   │   ├── pages/              # Each top-level view
│   │   ├── hooks/              # Catalogue, research, chat, navigation, comparison
│   │   ├── services/api.js     # Shared fetch/error handling
│   │   ├── utils/              # Missing-value formatting and derived chart data
│   │   ├── config/constants.js # Public client constants
│   │   ├── visuals/             # Lazy-loaded, resource-cleaned Three.js scene
│   │   └── styles/             # Existing styles + dedicated workflow styling
│   ├── tests/                  # Dependency-free Node utility/API tests
│   └── vite.config.js          # React + Tailwind + configurable dev proxy
├── docs/                       # Architecture, deployment, historical changes
├── submission/                 # NASA submission draft and seven-slide PPTX draft
├── .env.example                # Backend secret/config template
├── Dockerfile                  # Production single-origin build
└── render.yaml                 # Render blueprint (not yet deployed)
```

See [Architecture](docs/ARCHITECTURE.md) for data flow, page state, and extension instructions. See [Deployment](docs/DEPLOYMENT.md) for Docker/Render and acceptance tests.

## Configuration and secrets

The **default local setup does not require any `.env` file**. The frontend calls the same-origin `/api` paths via Vite's dev proxy, so it can also work in a single-domain Docker deployment.

To optionally enable Gemini, copy `.env.example` to `.env` in the **project root**, then add a key:

```dotenv
GEMINI_API_KEY=your_private_backend_key
GEMINI_MODEL=gemini-3.5-flash-lite
FLAREX_CORS_ORIGINS=
```

Without Gemini, the assistant responds using retrieved catalogue excerpts. Gemini is server-side only. The frontend's `frontend/.env.example` documents `VITE_API_BASE_URL` (for a separately hosted API) and `FLAREX_DEV_API_TARGET` (an optional Vite proxy target). **Never put API keys in `VITE_` variables, React source, Git commits, or public screenshots.** See [Environment](docs/ENVIRONMENT.md).

## API (all URLs preserved)

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Status and count of loaded source records |
| GET | `/api/metadata` | Catalogue metadata and type counts |
| GET | `/api/investigations?search=BASS&type=&topic=&sort=id` | Filter/search/sort catalogue |
| GET | `/api/investigations/PSI-26` | Full local record |
| GET | `/api/compare?ids=PSI-25&ids=PSI-26` | Compare 2–3 distinct IDs |
| GET | `/api/relevance?theme=detection&limit=5` | Explainable textual relevance |
| GET | `/api/evidence-coverage` | Captured vs unavailable metadata |
| GET | `/api/research-brief?theme=prevention` | Research question and source IDs |
| GET | `/api/citations` | Verified subset + remaining citation status |
| POST | `/api/assistant/ask` | Retrieval-first answer (`{"question":"..."}`) |
| GET | `/api/assistant/status` | Optional Gemini key configuration status (not live connectivity) |
| POST | `/api/assistant/compare` | Cited comparison of 2–3 selected PSI records |
| POST | `/api/assistant/brief` | Evidence-linked brief from a research theme |

Run the API, then open `/docs` for interactive request/response schemas. Validation errors use HTTP 422; missing IDs use 404; duplicate comparison IDs use 400. Sample PowerShell request:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/assistant/ask -Method Post `
  -ContentType 'application/json' `
  -Body '{"question":"What oxygen concentration is documented for PSI-26?"}'
```

## Interactive research workflow and 3D current

The Overview hero introduces the catalogue and has a **See how the research flows** link. The **workflow is a separate, full-width section** below the hero, not nested inside it. Its five stages are NASA PSI catalogue → structure metadata → explore/compare → research intelligence → evidence-linked assistant.

Selecting a stage highlights the corresponding point in a Three.js animated current, updates a readable description, and provides a link to an existing page or NASA PSI. There is a motion toggle, a Next stage control, smooth scrolling, and a swipeable stage row on smaller screens. The original static orbit and “CONCEPTUAL 3D VIEW” label are removed.

**Three.js** (`frontend/package.json`) is the only new dependency, loaded via a dynamic import when the workflow is visible. It uses a capped device-pixel ratio and a limited particle count. The scene pauses when off-screen, cleans up WebGL resources on unmount, respects reduced-motion preferences, and has a CSS-only fallback if WebGL cannot run. It conveys **software data movement only**, not a real combustion experiment or prediction.

Code: `frontend/src/components/research/ResearchWorkflow.jsx`, `FlowCurrent3D.jsx`, `frontend/src/visuals/flowCurrentScene.js`, and `frontend/src/styles/workflow.css`. See [Data flow design](docs/THREEJS_DATA_FLOW.md).

## Testing and verification

From project root, after installing Python dev dependencies: `py -3.12 -m pytest -q`. From `frontend`: `npm test` for pure-JavaScript API/formatting checks, `npm run build` for the actual React production build, and `npm run dev` for live browser testing.

**Latest verified results:** 27/27 backend Python tests; 12/12 frontend Node tests, including the new Three.js integration checks. The **React/Vite production build and real mobile/WebGL browser verification could not be completed here**, because the npm registry was unavailable. Source checks do not replace a real React build. Check them on your Windows machine before publishing or submitting.

A GitHub Actions workflow is included to run Python tests plus `npm test` and `npm run build` on a machine with internet/npm access. The workflow has not been run here.

## Scientific and source boundaries

- The checked-in data is a **user-provided 24-record PSI listing snapshot**: **19 Microgravity Investigations + 5 Ground Investigations**. It does not represent the live PSI search result count.
- This is **catalogue metadata**, **not raw experimental measurements, full papers, or a spacecraft fire-risk model**. Truncated descriptions stay labelled as excerpts.
- Ground investigations can include modelling or analysis; they are **not automatically direct spaceflight observations**.
- Numerical conditions are shown only when recorded; missing values mean **“Not available in the provided source”**, not zero.
- Research pathways and ranking are **SI-generated interpretations**, not NASA classifications, scientific-quality scores, or certified safety recommendations.
- Only **six** individual PSI investigation titles/DOIs are separately marked as checked in `data/psi_citation_audit.json`; **18** still need individual investigation citation verification. Original DOI fields in `data/investigations.json` remain unchanged.
- NASA PSI source: <https://psi.nasa.gov/>. Obtain authoritative details via an investigation's own “Cite this Investigation” control. FLARE-X does not imply NASA endorsement.

See [NASA PSI review](docs/NASA_PSI_VERIFICATION_REPORT.md) and [submission draft](submission/SPACE_APPS_SUBMISSION_DRAFT.md). Publication, hosting, real-key Gemini and NASA submission are **not** completed by this archive.
