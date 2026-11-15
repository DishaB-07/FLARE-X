# FLARE-X Gemini reliability fix (15 November 2026)

This patch retains the current 24-record catalogue, React UI, FastAPI routes and Docker/Render deployment structure. It improves the optional server-side Gemini synthesis, but **cannot bypass an invalid key, unavailable model, rate limit, exhausted quota, or service outage**.

## What changed

- The Gemini API now requests a short structured JSON `claims[]` response. The backend, not the model, formats and attaches citations to retrieved PSI records. Each generated statement still undergoes citation and numeric validation; scientific claims are **not independently fact-checked**.
- Output token budget increased from 700 to 2048 and timeout increased from 18 to 30 seconds.
- If Gemini cannot be used, `/api/assistant/ask` preserves the source-grounded catalogue answer and includes a safe `fallback_reason`, as well as a readable `notice` in the existing UI. It never exposes the API key or Google's raw error body.
- `/api/assistant/compare` and `/api/assistant/brief` receive the same user-facing failure explanations.
- Backend regression tests cover structured Gemini output, source/number rejection, 429 responses, timeout and successful responses.

## Redeploy

1. Extract the full ZIP and **replace your repository's files** with the included `flare-x/` contents (preserving any private `.env` locally). Commit and push to `main`, e.g. `git add . && git commit -m "Improve Gemini SI reliability" && git push`.
2. In Render, verify that the web service is using that commit. Keep `GEMINI_API_KEY` only in **Render → Environment** and `GEMINI_MODEL=gemini-3.5-flash-lite` (or another text-generation model your key can access). The repository already includes `render.yaml` and `Dockerfile`.
3. Open `https://flare-x.onrender.com/` → SI Research Studio → Ask. Ask: `What materials are documented for PSI-26?`. Look at the response mode and the notice below it.

**If `mode: gemini`:** a Gemini call returned an answer that passed the implemented citation/number checks.

**If `mode: catalogue`:** the `notice` now states the likely reason. The HTTP response also includes `fallback_reason` such as `http_404`, `http_429`, `timeout`, `connection_error` or `validation_failed`. `GET /api/assistant/status` continues to be a configuration check, not a live connectivity test.

## Optional direct check (PowerShell)

```powershell
$body = @{ question = 'What materials are documented for PSI-26?' } | ConvertTo-Json
$r = Invoke-RestMethod -Method Post -Uri 'https://flare-x.onrender.com/api/assistant/ask' -ContentType 'application/json' -Body $body
$r | Select-Object mode, fallback_reason, notice
```

The external Google API is **not invoked by the automated tests**. For public use, also consider server-side rate limiting and account quotas to protect your API key from unexpected usage.
