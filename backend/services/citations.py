"""Citation status enrichment from the human-curated, separate audit file."""
from __future__ import annotations
from typing import Any
from backend.core.config import NASA_PSI_SEARCH_URL


def citation_report(records: list[dict[str, Any]], audit: dict[str, Any]) -> dict[str, Any]:
    verified = audit["verified_records"]
    reviewed = audit.get("reviewed_remaining", {})
    items = []
    for record in records:
        entry = verified.get(record["id"])
        context = reviewed.get(record["id"])
        items.append({
            "id": record["id"], "title": record["title"],
            "status": "confirmed_nasa_psi" if entry else "needs_verification",
            "doi": entry["investigation_doi"] if entry else record.get("doi"),
            "doi_origin": "official_NASA_PSI" if entry else "local_catalogue_only" if record.get("doi") else "not_captured",
            "landing_page_url": entry["landing_page_url"] if entry else (
                record.get("source_url") if record.get("source_url", "").rstrip("/") != "https://psi.nasa.gov" else None
            ),
            "verification_scope": entry["verification_scope"] if entry else "Investigation DOI not independently verified; consult its own NASA PSI Cite this Investigation control.",
            "nasa_program_context_url": context["official_nasa_source_url"] if context else None,
            "nasa_program_context_note": context["review_note"] if context else None,
        })
    return {
        "checked_on": audit["audit_date"], "repository_search_url": NASA_PSI_SEARCH_URL,
        "catalogue_scope": "24 records from an earlier user-provided listing capture; not a live repository result count",
        "confirmed": len(verified), "remaining": len(records) - len(verified),
        "program_context_reviewed": len(reviewed), "items": items,
        "notice": "Only independently checked PSI page title and DOI pairs are marked confirmed. NASA programme references support the other studies but do not verify PSI landing-page DOIs. Full-text and raw data were not retrieved.",
    }


def annotate_evidence(answer: dict[str, Any], audit: dict[str, Any]) -> dict[str, Any]:
    for evidence in answer["evidence"]:
        confirmed = audit["verified_records"].get(evidence["id"])
        evidence["citation_verification"] = "official_PSI_title_DOI_confirmed" if confirmed else "not_independently_verified"
        if confirmed:
            evidence["source_url"] = confirmed["landing_page_url"]
            evidence["source_is_record_page"] = True
    return answer
