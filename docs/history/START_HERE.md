# FLARE-X — full updated project (Phase 5 UI refinement)

This is the **entire application**, not a patch: FastAPI backend, React/Vite frontend, original 24-record JSON and schema, optional Gemini-backed Research Assistant, research ranking, evidence gap dashboard, sources/citation audit, Docker/Render deployment configuration, automated tests and editable seven-slide draft.

## Quick start: Windows PowerShell

Extract the ZIP first. Open **`flare-x`**, the folder containing `backend`, `frontend` and `Dockerfile`.

**Terminal 1 — backend**

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend**

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). Backend health: `http://127.0.0.1:8000/health`.

## What is new in Phase 5

- Investigation details now appear in a centered, responsive popup, replacing the old right-hand drawer.
- The popup has keyboard-safe focus, animated entry/exit, contextual source evidence and a clearer responsive layout.
- The dashboard includes a visual evidence workflow with subtle modern hover/depth effects.
- All source data and backend endpoints are preserved. See `PHASE5-VISUAL-UPDATE.md`.

## What is verified / what remains

- **23/23 local backend automated tests passed** in the packaging environment.
- **Six** NASA PSI ID/title/investigation DOI pairs independently checked; official NASA research context available for 18 further records, but **their investigation DOIs remain unverified**.
- The 24-record source JSON and schema were preserved; the catalogue is not full-text research or raw measurements.
- The Phase 5 React files were JSX-parsed and the new CSS was syntax-checked, but the full Vite production build, real-browser interaction, Docker image, optional Gemini API key and **public URL have not been verified** here (npm registry access was unavailable).
- This package **does not** mean the project is deployed or submitted to NASA.

For provenance, read `NASA_PSI_VERIFICATION_REPORT.md`. For hosting, read `DEPLOYMENT.md`. For NASA submission, use `SPACE_APPS_SUBMISSION_DRAFT.md` and the seven-slide editable draft inside `submission/`. Replace the team details, public links and screenshots before submitting.
