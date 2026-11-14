# FLARE-X Phase 5 — Investigation modal & visual clarity

This phase builds directly on the complete Phase 4 `FLARE-X-FINAL.zip` (24-record catalogue, unchanged backend, full Research Assistant, ranking, evidence charts, citation audit, and submission materials).

## Changes

- Replaced the right-edge investigation drawer with a centered, responsive details dialog. It uses a React portal so it overlays the entire application correctly.
- Separated the record into an accessible heading, quick section-navigation buttons, scrollable evidence content, context and documented-conditions columns, and a fixed action footer.
- Added animated opening and closing, a blurred scrim, outside-click close, Escape close, keyboard focus containment, focus restoration, and background scroll lock. Reduced-motion preferences disable motion.
- Added a visual research workflow to the Overview and a conceptual (not experimental) source-to-evidence diagram in the modal.
- Made oxygen, pressure and airflow availability visually explicit, preserved **numeric value basis/context** notes from the original dataset, and retained the required "not documented" disclaimer.
- Added a context-aware "Copy PSI reference" control that uses a verified NASA page where independently checked, otherwise the repository homepage. No missing DOI is created.
- Refined shadows, hovering, keyboard-focus outlines, and card elevation without changing existing navigation, source data, or FastAPI integration.
- Preserved Easy read and improved small-screen modal layouts.

## Validation

From the project root:

```powershell
py -3.12 -m pytest backend\tests -q
cd frontend
npm install
npm run build
npm run dev
```

The current build environment could not fetch npm dependencies (`EAI_AGAIN registry.npmjs.org`), so local React build and interactive browser QA must still be performed. The backend Python tests and JSX/CSS syntax checks can run without npm downloads.

## Essential manual checks

1. Open a record from Explorer, Research intelligence, Research Assistant evidence or Recent investigations. Each should show **the same centered modal**.
2. Confirm the dialog centers on desktop; at 320–680px it remains scrollable without horizontal overflow and with a visible action footer.
3. Use the "Overview", "Evidence & conditions", and "Source & citation" shortcuts. Press Escape or click the backdrop to close. The previous control should regain keyboard focus.
4. Press Tab/Shift+Tab while open to verify focus stays inside the dialog.
5. Open PSI-62: it must still say **Ground Investigation** and distinguish modelling from direct flight observations.
6. Open PSI-159: the oxygen value's *basis/context* must be shown; an unavailable pressure or airflow value must never be rendered as zero.
7. Try the Easy read toggle, related investigations, copy-reference, Ask assistant, comparison, charts, and NASA source links.
8. Verify all scientific references are catalogue data or independently verified links, and that generated research labels are disclosed as SI-generated.

**Scope:** This is a research exploration prototype, not a certified spacecraft fire-risk assessment tool. Public deployment and real-user browser testing remain outstanding.
