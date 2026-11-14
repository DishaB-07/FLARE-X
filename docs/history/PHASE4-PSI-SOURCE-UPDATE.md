# FLARE-X source verification update — 14 November 2026

The user provided the official NASA PSI investigation search URL:

https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation

## Changes

- Retained original 24-record normalized catalogue and schema **without modifying them**.
- Expanded the separate title/DOI verification audit from 4 to 6 official NASA PSI investigation records.
- Verified PSI-107 (SPICE): investigation DOI `10.60555/9kbh-e962`.
- Verified PSI-62 (ground-based flame-spread modelling): investigation DOI `10.60555/e9xp-ex83`.
- Source Verification now links remaining records to the **provided repository search**, rather than claiming to know their investigation-specific pages.
- The citation API explicitly labels the 24 records as a captured snapshot rather than current live repository search results.
- Added regression tests for added citations and the provided search URL.

## Limits

The search listing is JavaScript-rendered and did not yield a live result total in the available web reader. Verification used individually indexed official NASA PSI record pages; it is **not** a complete ingestion, DOI audit, citation UI retrieval, or raw-data download. The remaining 18 local records have not been independently checked. Always use the “Cite this Investigation” control on NASA PSI for authoritative citations.

The 24 records' `source_url` values and original `doi` fields remain untouched to preserve source provenance. No experimental values, outcomes or safety conclusions have been added.
