# FLARE-X — Phase 2 implementation changelog

Date: November 14, 2026. This is an incremental update to the supplied project, **not** a new scaffold.

## Added
- `backend/assistant.py`: lexical retrieval over supplied catalogue, snippet-level evidence, explicit missing-data handling and offline fallback, optional Gemini REST synthesis.
- `POST /api/assistant/ask`: validated short research questions.
- `frontend/src/ResearchAssistant.jsx`: assistant page with prompt suggestions, chat, expandable structured evidence, source buttons and record-detail access.
- New backend tests and development test requirements.

## Updated
- `backend/main.py`: assistant route, `.env` loading, configurable production CORS origin, DOI values in the compare response.
- `frontend/src/App.jsx`: Research Assistant nav link, mobile navigation scrim, assistant shortcut from investigation detail, overview CTA, pointer-reactive 3D-style hero decoration.
- `frontend/src/styles.css`: responsive evidence-first assistant layout, readability/contrast adjustments, hover/focus states, reduced-motion handling.
- README, `.env.example`, handoff and next-session prompt.

## Preserved
- The **unchanged** original 24-record `data/investigations.json`, `data/schema.json`, catalogue/search/detail routes, comparison UI, research pathways and About/reference sections.

## Verified in editing environment
- **12/12 Python tests passed**.
- Supplied JSON passes its local JSON schema; the three captured DOI IDs remain PSI-25, PSI-69, PSI-98.
- React `.jsx` source passes a TypeScript JSX syntax parse; CSS stylesheet parsing passes.

## Not verified here
- `npm install`, `npm run build`, live browser/responsive QA (npm registry access timed out in the editing environment).
- A real Gemini API request, additional NASA landing-page citations, public hosting, and official NASA submission materials.

The orbital 3D effect is conceptual decoration only. The assistant is **catalogue-grounded retrieval**, not a full-paper RAG system or a safety-certified calculator. Citation validation checks referenced PSI IDs but does not independently fact-check every generated phrase; users should inspect the original source records.
