# Refactor log — November 2026

**Base:** `FLARE-X-Centered-Modal-Full-Updated.zip` (Phase 5), not a recreated scaffold.

- Split monolithic `frontend/src/App.jsx` into `pages/`, `components/`, `hooks/`, `services/`, `utils/`, and `config/`.
- Centralized HTTP, request cancellation, error status, JSON decode and 422 messages in `services/api.js`.
- Moved filter fetching, research fetching, comparison, assistant messages, hash navigation, and Easy read persistence into focused hooks.
- Removed duplicate missing-value formatters and unreferenced imports; kept the source's text and CSS class names.
- Grouped the existing styles into `frontend/src/styles/`; retained all existing CSS and visual features.
- Split `backend/main.py` into API routers, pure services, request schemas, core configuration, and read-only data access.
- Kept all original API routes, response fields, compatibility imports, source JSON, citation audit and original PPTX untouched.
- Added API error/retry/loading handling, clearer malformed-JSON startup failures, input validation tests, and source-preserving regression tests.
- Added Node `--test` tests for frontend utilities and API transport (no test dependencies).
- Added architecture/environment docs and CI workflow. Historical phase notes moved into `docs/history/` and the submission draft into `submission/`.

**Verified:** 27 Python tests, 5 Node tests, JS/JSX parse and local imports, unchanged SHA-256 for all source JSON files. **Not verified here:** Vite build, browser responsive QA, Docker/Render deployment, live Gemini calls; npm registry unavailable (`EAI_AGAIN`).
