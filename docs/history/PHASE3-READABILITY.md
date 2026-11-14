# FLARE-X Phase 3 — clarity / readability update

This is a **targeted upgrade of the existing Phase 3 source**, not a new scaffold.
The unchanged data catalogue, FastAPI API, Gemini optional integration, Dockerfile,
and Render deployment configuration remain intact.

## Updated files

- `frontend/src/readability.css` — new, readable typography/contrast layer.
- `frontend/src/styles.css` — existing fonts import updated to include Inter.
- `frontend/src/main.jsx` — imports the readability layer after the original styles.
- `frontend/src/App.jsx` — adds the Easy read toggle (with local storage persistence),
  accessible button name/pressed state, and larger/brighter chart axis labels.
- `README.md`, `DEPLOYMENT.md` — updated accessibility and verification notes.

## Visual changes

- Clear **Inter** body font with Segoe UI fallback, preserving Manrope display headings.
- Bigger navigation and form text, visible placeholders and brighter secondary text.
- Larger investigation titles, excerpts, SI-generated tag labels and comparison cells.
- Higher-contrast Assistant answers, evidence cards and source limitations.
- Better chart tick visibility and breathing room for layouts.
- Optional **Easy read** toggle increases body/source text further and adds stronger
  contrast; the preference is remembered per browser when local storage is enabled.
- Mobile CSS overrides keep fonts readable without requiring a separate UI.
- The original conceptual 3D hero and interactions are preserved.

## Validation

- `python -m pytest -q backend/tests`: **14 passing**.
- JSX was parsed with the TypeScript JSX parser; existing and new CSS parsed with PostCSS.
- CSS-only Chromium checks at 320, 375, 390, 768, 1024 and 1440px: no horizontal overflow
  in the representative catalogue layout.
- **Not verified:** `npm run build` (npm registry unavailable, `EAI_AGAIN`), the actual
  React app on different devices, Docker image, a public URL or live Gemini requests.

## Windows smoke test

From the **project root**, start the unchanged FastAPI backend. In a second terminal:

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Test the Explorer, comparison table and Research Assistant in the Vite URL.
Click **Easy read**, refresh the page to check it stays on, then click again to
return to regular text. Check a 390px mobile viewport, including the menu and
assistant evidence panel. Deployment instructions remain in `DEPLOYMENT.md`.
