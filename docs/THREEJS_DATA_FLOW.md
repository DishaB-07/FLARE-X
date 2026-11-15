# FLARE-X — Standalone 3D data-flow walkthrough

## What's new

The Overview hero and the workflow are now separate. A full-width panel illustrates **how metadata moves through the FLARE-X software workflow**. It is not a physical model of combustion.

The diagram contains five navigable stages:

1. NASA PSI catalogue — link to the official source.
2. Structured metadata — link to the Investigation Explorer.
3. Exploration and comparison — link to Compare Studies.
4. Research intelligence — link to explainable ranking and evidence gaps.
5. Research Assistant — link to the retrieval-first assistant.

Selecting a stage changes its glow in the WebGL visualization, updates the description, advances the progress bar, and keeps the selected mobile card visible. A **Pause motion** button stops the animation. **Next stage** cycles through the stages.

## Implementation and performance

- `frontend/src/components/research/ResearchWorkflow.jsx` — UI, stage data, actions and state.
- `frontend/src/components/research/FlowCurrent3D.jsx` — visibility, reduced motion, renderer lifecycle and lazy loading.
- `frontend/src/visuals/flowCurrentScene.js` — Three.js scene with a curved line, five highlighted nodes and moving points.
- `frontend/src/styles/workflow.css` — responsive cards, CSS-only animated data stream fallback, focus indicators, hero polish and motion preferences.

Three.js is the only new dependency; installed with the existing `npm install` command. It is loaded only when the section becomes visible; the rest of the app is not dependent on the canvas. The scene uses a limited particle count, caps pixel ratio, avoids expensive postprocessing, pauses offscreen and disposes geometries/materials/renderer on cleanup. Users who disable motion or cannot use WebGL still get all five actionable stages.

The 24-record JSON, source/citation audit, API response contracts and existing functionality remain unchanged.

## Local QA (required before deployment)

From `flare-x/frontend`:

```powershell
npm install
npm test
npm run build
npm run dev
```

From `flare-x`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

Check in a browser:

- Desktop widths (1440, 1024): the workflow is visually separate from the hero and no cards overlap the animated current.
- Tablet and mobile widths (768, 390, 320): the five-stage rail scrolls horizontally without page-level horizontal overflow, active selection remains visible, and text stays legible.
- Click all five stages, use Next stage and open each linked feature.
- Pause/Play works, the animation pauses offscreen, and activating system **Reduce Motion** disables the Three.js animation.
- Block WebGL via browser settings and confirm the CSS fallback and all stage actions still render.
- Enable Easy read and navigate by keyboard (Tab / Enter / Space).
- Confirm `/health` reports 24 and the Research Assistant, comparison modal and research intelligence pages still function.

**Build status:** The API and dependency-free frontend tests have passed in the editing environment. The actual npm build and WebGL/browser checks require a machine able to install frontend dependencies. Do not claim these checks passed until you run them.
