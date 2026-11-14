# Overview interactive workflow update

## Change

The original orbital graphic and its “CONCEPTUAL 3D VIEW / NOT A SIMULATION” label have been removed from the Overview hero. The previous static three-step evidence trail has also been removed to avoid showing redundant diagrams. In its place, the hero contains a clearly connected, accessible five-stage workflow.

## Five stages

1. **NASA PSI catalogue** — supplied listing snapshot, with a link to the official search.
2. **Structure the records** — 24 local normalized metadata entries, no invented missing measurements.
3. **Explore and compare** — existing Explorer and Compare tools.
4. **Research intelligence** — explainable relevance ranking and evidence-gap views.
5. **Evidence-linked answers** — existing retrieval-first Research Assistant.

Clicking a stage updates the detail panel; a **Next stage** control advances through the flow and loops back at the end. Each stage's primary button navigates to the appropriate existing page or opens NASA PSI.

## Source and functionality safeguards

- The 24-record JSON, schema, citation audit, API routes, and scientific boundaries are unchanged.
- No numbers, experimental results, or science claims were added.
- The existing hero text, search, comparison, assistant, data charts, filters and investigation modal remain.
- Native buttons, visible focus styling, semantic region labels, responsive layout, and reduced-motion CSS are included.

## QA checklist

- [ ] Open Overview in desktop browser; all five steps are visible in their connected flow.
- [ ] Click each step: active highlighting and explanatory panel change.
- [ ] Click **Next stage** five times: it cycles back to source.
- [ ] Source link opens NASA PSI; remaining stage actions reach existing app pages.
- [ ] Check 1440px, 1024px, 768px, and 390px layouts.
- [ ] Tab through all steps and controls using keyboard.
- [ ] Enable Easy read; ensure text does not clip.
- [ ] With reduced motion enabled, no animated transitions are required.
- [ ] Check `npm run build` and `npm test` locally.

**Note:** The app remains a metadata-first research prototype; source limitations are described in the Overview notice, About page, and individual record views.
