# FLARE-X — NASA Space Apps 2026 Project Submission Draft

> **DRAFT — NOT SUBMITTED.** Replace `[...]` before pasting into the official Project Page. Add no claims about unverified public deployment, real Gemini key, complete DOI audit, downloaded datasets, or validated fire safety outcomes.

## Project Name

FLARE-X — AI-Powered Space Fire Safety Intelligence Platform

## Team details

Team: **[enter exact team name]**  
Participants: **[enter confirmed members' names]**  
Event: **[enter Local Event / Universal Event]**

## High-Level Project Summary

FLARE-X is a searchable, interactive research exploration platform for understanding NASA microgravity combustion investigations. It organizes a supplied snapshot of 24 NASA Physical Sciences Informatics (PSI) Combustion Science catalogue records into an Investigation Explorer, side-by-side comparison, explainable thematic relevance ranking, evidence-availability views, and a source-linked Research Assistant. The platform identifies relevant research questions and makes missing catalogue fields visible without inventing experimental measurements or presenting safety scores. Its aim is to make existing space-fire research easier to find and evaluate for future study.

## Link to Project Demo

**[Replace with public, login-free URL to the final demo (30-second video or ≤7-slide deck).]**

An editable seven-slide draft is included under `submission/`. Before sharing, insert your team name and actual FLARE-X screenshots, check text readability, and export/host it publicly. Do not upload a PPTX directly to NASA's submission page.

## Link to Final Project

**[Replace with deployed HTTPS URL after testing in a private browser.]**

GitHub source repository: **[optional public repository URL, if created]**

## Detailed Project Description

**The problem.** Decades of combustion experiments in microgravity generate research information that is difficult to discover, compare and interpret. Researchers and future spacecraft designers need a clear starting point for finding relevant investigations, but catalogue records should not be confused with complete results.

**Our solution.** FLARE-X uses a React/Vite interface and FastAPI backend to explore the first 24 NASA PSI Combustion Science catalogue records. Users can filter by investigation type, inspect original objective/approach excerpts, compare two or three studies, ask questions with PSI-linked evidence, and select a research theme to see which investigations match and exactly which terms triggered the ranking. A field-coverage dashboard shows which local records include materials, equipment, platforms, numerical oxygen/pressure/airflow, and other source attributes. An audit page separates verified official PSI title/DOI pairs from records needing manual verification.

**How it works.** The backend stores the original normalized source listing in JSON. Retrieval searches this JSON before optional Gemini summarization. The no-key fallback still provides evidence-linked, catalogue-only answers. Research relevance uses transparent weighted text matching (not ML-predicted risk): 5 points per matching title term, 3 for objective text, 3 for approach, and 1 for SI-generated tags. Source verification is stored separately from the original data.

**Boundaries.** The catalogue contains 24 records: 19 Microgravity Investigations and 5 Ground Investigations. These are investigation metadata, not raw experiments or full papers. Ground records may be models or analyses of spaceflight data; missing measurements mean "not available in the provided source," not zero or absence. FLARE-X is independent, not NASA-endorsed, and not certified for operational flight safety.

## Use of Super Intelligence (SI)

SI tools supported code and interface development, data normalization, topical curation and research interpretation. The Research Assistant retrieves relevant source records before optionally synthesizing responses with Gemini; in the absence of an API key it offers a deterministic, evidence-linked fallback. The four thematic pathways and relevance weights are project-created heuristics, not official NASA classes or validated scientific rankings. Generated text includes citations to PSI IDs and limitations. The tool is *catalogue retrieval*, not full-paper RAG, because full-text papers and raw datasets have not been indexed.

## NASA Data

Source: **NASA Physical Sciences Informatics (PSI) Repository**, Combustion Science search catalogue. <https://psi.nasa.gov/>

The starting snapshot comprises 24 investigation records transcribed from a user-provided search-listing capture, not a comprehensive repository export. The original JSON includes three investigation DOIs (PSI-25, PSI-69 and PSI-98); a **separate** 2026-11-14 audit confirms the existing three and three additional DOIs (PSI-101, PSI-62, PSI-107) against indexed official PSI investigation pages. Verify individual citations using “Cite this Investigation” on each landing page.

## Space Agency Partner Data and Other References

- NASA PSI data repository: <https://psi.nasa.gov/>
- Official NASA Space Apps challenge page: <https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/>
- Confirmed PSI source pages (title and investigation DOI only): <https://psi.nasa.gov/physci/repo/data/investigations/PSI-25>, <https://psi.nasa.gov/physci/repo/data/investigations/PSI-69>, <https://psi.nasa.gov/physci/repo/data/investigations/PSI-98>, <https://psi.nasa.gov/physci/repo/data/investigations/PSI-101>, <https://psi.nasa.gov/physci/repo/data/investigations/PSI-62>, <https://psi.nasa.gov/physci/repo/data/investigations/PSI-107>
- **No Space Agency Partner datasets claimed:** none independently ingested or verified for this prototype.

## Final checklist

- [ ] Replace all placeholder brackets and ensure all team members are confirmed under the same eligible Local Event.
- [ ] Run backend tests, frontend production build, mobile/browser checks, public Render health check and real Project Page URL.
- [ ] Insert authentic screenshots in the seven-slide deck and publish it with public viewing permission.
- [ ] Test all posted URLs in a private browser without sign-in.
- [ ] Confirm no NASA logos/patches, implied endorsement or under-18 participant likenesses in demo.
- [ ] Complete all required Project Page fields in English; accept Terms and Original Work and press **Submit for Judging** before your actual deadline.
