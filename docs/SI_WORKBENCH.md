# FLARE-X SI Research Studio — source-bounded intelligence

## What is genuinely AI-powered?

**Gemini synthesis is optional.** The Research Assistant can send *retrieved* PSI metadata excerpts to the Gemini GenerateContent API after choosing candidate records locally. Gemini synthesizes plain-language explanations, which must pass citation and numeric guardrails to be displayed. If an API key is absent, the request fails, or the output is rejected, the site returns a deterministic catalogue-derived explanation instead.

The 3D data-flow animation, metadata coverage charts, keyword rankings and structured comparisons are **not separate AI models**. This differentiation is important for the NASA Space Apps submission.

## Three user workflows

1. **Ask questions** (`POST /api/assistant/ask`) — retrieve relevant excerpts using transparent keyword matching, answer with optional Gemini or local fallback, show the source trail.
2. **Cross-study analysis** (`POST /api/assistant/compare`) — select two or three investigations, compare their captured type, platform, material, diagnostics and numeric condition fields. Only *literally equal, populated* fields are labelled shared; no scientific equivalence is inferred. Optional Gemini narrates the selected records.
3. **Research brief** (`POST /api/assistant/brief`) — choose prevention, detection, suppression or modelling, retrieve top relevant catalogue records, generate an evidence-linked explanation and a structured next-step checklist. The underlying ranking is deterministic text matching, not an ML-generated quality score.

The exact source scope is the **24-record user-provided NASA PSI catalogue snapshot**. The backend does **not** access full-text papers, raw experiment data or live NASA PSI search results. An unpopulated numeric field means **Not available in the provided source**, not zero or not measured. For official citations, open the original investigation's **Cite this Investigation** link on <https://psi.nasa.gov/>.

## Gemini configuration and testing (Windows)

From the `flare-x` root:

```powershell
Copy-Item .env.example .env
notepad .env
```

Enter your **own** `GEMINI_API_KEY` in the root `.env`. The default `GEMINI_MODEL=gemini-3.5-flash-lite` can be adjusted to a supported text-generation model. **Never** put secrets in `frontend/.env`, a `VITE_` variable, Git, screenshots or browser JavaScript. Leave the key empty for a fully usable offline-to-Gemini fallback mode (the FastAPI backend still needs to be running).

Install and start from project root (assuming Windows Python 3.12):

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Use `python.exe -m pip` instead of a blocked `pip.exe` on managed devices. If your organization also blocks module execution, use its approved installation procedure; do not disable Device Guard.

In a **second** terminal from the root:

```powershell
cd frontend
npm install
npm test
npm run build
npm run dev
```

Open `http://localhost:5173` and click **Research Assistant**. It now opens the **SI Research Studio** with tabs for Q&A, cross-study analysis and research briefs.

### Verify the actual backend mode

`GET http://127.0.0.1:8000/api/assistant/status` checks only whether a key is **configured**. It cannot confirm successful Gemini requests. To test a live call:

```powershell
$body = @{ question = 'What fuel material is captured for PSI-26?' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/assistant/ask' -Method Post -ContentType 'application/json' -Body $body | Select-Object mode,answer,notice
```

- `mode: gemini` indicates that a Gemini response was received and passed implemented format/numeric checks.
- `mode: catalogue` indicates a deterministic fallback. Check backend environment variables, provider availability and model access if you expected Gemini.
- The API **does not expose a key**, and public `/status` only reports a configuration Boolean.

The backend tests include a **mocked** Gemini HTTP response and rejection/fallback tests. They do not verify your account's key, billing, model access or the external Gemini service. Verify your own live setup before describing Gemini as operational in a submitted demo.

## Reliability boundaries

- Retrieve first; the model sees only selected catalogue evidence, not general web results.
- The model must include an allowed `[PSI-##]` reference in every factual statement; unknown IDs and model-invented URLs/DOIs are rejected.
- Numeric literals must be present in the *cited* record's evidence fields; PSI ID numbers are excluded from this numerical check.
- Ground-investigation records are not called direct flight observations.
- Failing calls and rejected outputs fall back to local catalogue answers.
- **This is a conservative guardrail, not semantic proof.** Citations can be syntactically valid yet fail to support an inferred claim; users should inspect evidence and original NASA pages before citing conclusions.
- Research pathways and tags are project-generated interpretations, not NASA classifications or spacecraft safety advice.

## API examples

```http
POST /api/assistant/compare
Content-Type: application/json

{"ids":["PSI-26","PSI-62"],"question":"Which methods and conditions are documented?"}
```

```http
POST /api/assistant/brief
Content-Type: application/json

{"theme":"detection","question":"Which catalogue records discuss smoke particles?"}
```

Both return `answer`, `mode`, `notice`, `evidence`, and `validation`, plus either `comparison` (field matrix) or `brief` (structured research direction). The original `/api/assistant/ask` endpoint and all existing API routes remain available.

## Demo story for judges (about 30 seconds)

- **Problem:** It is difficult to navigate microgravity fire research across many records.
- **Source:** Show the 24-record PSI catalogue scope and a sample study in the Explorer.
- **SI:** Ask an evidence-linked question, then compare PSI-26 and PSI-62 to contrast a microgravity investigation with ground modelling.
- **Responsibility:** Point to a missing oxygen value, the cited PSI excerpts, and the generated-versus-fallback badge.
- **Impact:** Researchers can find relevant investigations and the next questions to verify—**not** calculate spacecraft fire risk.

Use real screenshots or a live demo. Do not claim the catalogue is raw combustion data or that Gemini is running unless `mode: gemini` has been observed in the live environment.
