# FLARE-X — Phase 4 update (14 November 2026)

## Implemented on the EXISTING application

- Added `backend/research.py`: four SI-curated research themes with bounded research questions, deterministic text-match relevance rankings, field coverage metrics, and exportable research briefs.
- Added FastAPI endpoints: `/api/relevance`, `/api/evidence-coverage`, `/api/research-brief`, `/api/citations`.
- Added the responsive Research intelligence workspace in `frontend/src/ResearchIntelligence.jsx`; includes theme switches, exact match explanations, field-coverage bars, research brief previews, and copy action. It does **not** display a fire-risk prediction.
- Added Source verification page showing **4 official PSI title + investigation DOI pairs confirmed**; verification scope is disclosed, and **20 records remain unverified**. No guessed DOI or detail-page links.
- Updated Research pathways to link to ranked views, detail drawer citation handling, navigation, and Overview entry point.
- Preserved the supplied `data/investigations.json` and `data/schema.json` byte-for-byte. All original Phase 2/3 functionality remains.
- Added 7 backend regression tests (21 total), a submission draft, and editable seven-slide demo draft.

## Scientific boundaries

The rankings are keyword-match *catalogue relevance*, not validated conclusions, study quality rankings, NASA rankings, predictive fire risk, or operational safety guidance. Coverage means 'populated in the 24 supplied JSON records'; it does not mean the investigation never measured a missing parameter. The local JSON has only 3 captured DOI values; PSI-101 is verified **outside** that JSON using the official NASA PSI landing-page text.

## Verification

- **Passed:** 21/21 FastAPI/pytest tests, JSX TypeScript syntax parsing, CSS PostCSS parsing.
- **Not verified:** Vite `npm run build` and live browser testing (npm install timed out at the registry here), Docker build, Gemini with real key, public Render URL, remaining 20 PSI investigation citations, raw experimental files, and NASA submission.

## Changed files

- `backend/main.py`, `backend/research.py`, `backend/tests/test_research.py`
- `data/psi_citation_audit.json` (new, separate from immutable original catalogue)
- `frontend/src/App.jsx`, `frontend/src/ResearchIntelligence.jsx`, `frontend/src/research-intelligence.css`
- `README.md`, `DEPLOYMENT.md`, `PHASE4-CHANGELOG.md`, `SPACE_APPS_SUBMISSION_DRAFT.md`, `submission/*`
