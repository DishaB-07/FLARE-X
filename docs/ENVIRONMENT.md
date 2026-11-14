# Environment and secret configuration

| Variable | Read by | Default | Notes |
|---|---|---|---|
| `GEMINI_API_KEY` | Python backend | unset | Optional private key. Never in browser code. |
| `GEMINI_MODEL` | Python backend | `gemini-3.5-flash-lite` | Configurable; actual model availability requires confirmation. |
| `FLAREX_CORS_ORIGINS` | Python backend | local Vite origins only | Comma-separated origins when hosting UI separately. |
| `VITE_API_BASE_URL` | Browser bundle | empty | **Public** backend URL only when hosting on different domains. |
| `FLAREX_DEV_API_TARGET` | Vite dev server | `http://127.0.0.1:8000` | Local dev proxy destination. |
| `PORT` | Docker/Uvicorn startup | 8000 | Set by host in deployed service. |

The backend loads only the root `.env` file using `python-dotenv` (without overriding host environment settings). Vite reads `frontend/.env` for optional settings. `VITE_` values can be publicly inspected in the browser bundle; never store credentials in them. `.gitignore` and `.dockerignore` exclude `.env` and dependencies. Keep `.env.example` committed, not your real `.env`.

**Single-origin Docker/Render setup**: leave `VITE_API_BASE_URL` and `FLAREX_CORS_ORIGINS` unset. This is the simplest configuration and matches the original deployment design.
