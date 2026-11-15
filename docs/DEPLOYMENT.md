# FLARE-X — deployment and demo checklist (Phases 3–4)

## What this package prepares

A **single-origin Docker deployment**: Node 22 compiles the existing Vite frontend;
Python 3.12 runs the existing FastAPI backend and serves the compiled public assets.
The API, research assistant and UI are hosted on the **same HTTPS origin**.
No database, external vector store, NASA dataset download, or new app scaffold is introduced.

Relevant files: `Dockerfile`, `.dockerignore`, `render.yaml`, `backend/main.py`,
`frontend/vite.config.js`, `frontend/.env.example`.

## Local checks on Windows (PowerShell)

Open a terminal in **`flare-x` (the folder containing `backend`, `frontend`, and `Dockerfile`)**.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Open a **second terminal** in `flare-x`:

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`. Vite now proxies `/health`
and `/api` to `http://127.0.0.1:8000`. The frontend does **not** need
`VITE_API_BASE_URL` for this setup; if an older `frontend/.env` file sets a
remote or incorrect URL, remove only that local setting and restart Vite.
Use `./.venv/Scripts/python.exe -m pip` rather than `pip.exe` if your machine
blocks standalone executable commands. **Do not disable Device Guard**.

Without Vite, you can also serve a previously built frontend from FastAPI:
stop and restart the backend after building `frontend/dist`, then visit
`http://127.0.0.1:8000/`. This works only after `npm run build` succeeds.

## Optional local Docker test

If Docker Desktop is approved/available on your device, from `flare-x`:

```powershell
docker build -t flare-x .
docker run --rm -p 8000:8000 flare-x
```

Visit `http://localhost:8000/` and `http://localhost:8000/health`.
The container has no Gemini key by default and uses the catalogue-only assistant.
Docker is **not** required for your ordinary two-terminal local development.

## Publish with Render (requires your own GitHub repository and Render account)

1. Push the `flare-x` project folder contents to a **new or existing GitHub repo**.
   The `Dockerfile` and `render.yaml` must be at the repository root.
   Verify that `.env`, `frontend/.env`, `node_modules/`, `.venv/`, and build
   artifacts are **not** committed. Never push a Gemini API key.
2. In the Render Dashboard, select **New → Blueprint**, connect the repository,
   and review the service defined in `render.yaml`. Alternatively choose
   **New → Web Service**, connect the repository, set **Language: Docker**,
   Dockerfile path `./Dockerfile`, and health check `/health`.
3. The example Blueprint requests Render's **Free** plan if available to your
   account. Free services can have sleep/cold-start delays; check current Render
   terms and consider a paid plan if demonstration latency is unacceptable.
4. Deploy. Render will build the frontend, install backend requirements, and
   start Uvicorn using its supplied `PORT` on `0.0.0.0`.
5. Open the assigned `https://<your-service>.onrender.com/` URL in an **incognito**
   browser. Confirm the Overview is visible without login, `/health` shows
   24 records, Explorer search works, Compare returns data, and Research
   Assistant cites PSI records correctly. Verify on mobile viewport as well.
6. Only after testing those URLs should the project be described as **publicly
   deployed** or submitted with that URL.

### Gemini (optional, not required for deployment)

In the Render service **Environment** settings, optionally create a secret
`GEMINI_API_KEY`. You may also set `GEMINI_MODEL=gemini-3.5-flash-lite`.
Never prefix the key with `VITE_` or place it in frontend source. Live API
quotas, credentials, rate limits and billing need separate verification before
sharing a public assistant. Without a key, the assistant uses deterministic,
record-linked catalogue retrieval and remains demo-useful.

### Important security / scientific boundaries

- The web service's assistant endpoint is public. If Gemini is enabled,
  establish account quotas and abuse protection before circulating the URL.
- The backend serves **only** built public assets, not source folders or `.env`.
- This is a curated NASA PSI **catalogue excerpt**, not complete research
  papers, raw measurements, an official NASA service, or a flight-safety tool.
- Do not add NASA logos, implied endorsement, invented DOI URLs or simulated
  scientific results to the deployment.

## 5-minute acceptance test

| Check | Expected result |
|---|---|
| `GET /health` | `status: ok`, `records_loaded: 24` |
| Overview | Counts 24 / 19 microgravity / 5 ground; five-stage interactive research workflow (select a stage and open its linked feature) |
| Explorer | Search `BASS`; open PSI-26; oxygen labelled unavailable |
| Compare | Select PSI-25 and PSI-26; missing conditions stay unavailable |
| Assistant | Ask “What oxygen concentration is reported for PSI-26?”; no invented value; sources shown |
| Mobile | Menu, cards, assistant evidence and comparison tray work at 390px |
| Readability | Easy read button enlarges text/contrast; preference persists after refresh |
| Keyboard | `/` or `Ctrl+K` focuses catalogue search (outside input fields) |
| Research ranking | `/#/intelligence` loads; detection theme includes PSI-101/102; reasons shown |
| Evidence gap | Numerical oxygen populated for 2/24, pressure 3/24, airflow 6/24 |
| Source audit | `/#/citations` shows six confirmed PSI title/DOI pairs and 18 pending with supporting NASA programme context links |
| Research brief | Copy/preview theme-based brief; no invented results |
| Direct URL | `/#/assistant`, `/#/intelligence`, `/#/citations` load correctly |
| Security | Public JS bundle contains **no** Gemini API key |
| Unauthenticated | Site and API usable in a fresh private browser session |

**Current status:** Deployment files are prepared and backend tests passed.
The frontend build, Docker build, real-device/browser QA, Gemini with a real key
and a public Render URL have **not** been verified in this editing environment.


## Submission readiness (not automatic)

- GitHub push and Render account authorization must be completed by the project owner. The ZIP alone is **not** a live website.
- Do not put placeholder URLs in the NASA submission form. Test your real deployment URL in a private browser first; free-tier cold starts may affect short judging windows.
- Open **`submission/SPACE_APPS_SUBMISSION_DRAFT.md`** and fill in team names, public project link and public demo link.
- The editable **`submission/FLARE-X-7-Slide-Demo-DRAFT.pptx`** is limited to seven slides but contains visible placeholders. Replace the screen placeholders with genuine screenshots and test public viewing permission. This is a draft, not a finished NASA submission.
- Ask the team owner to confirm the deadline shown on their Space Apps Project page; the guide states November 15, 2026 at 11:59 PM local-event time (Universal Event: Team Owner's time zone).
