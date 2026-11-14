"""Explainable *catalogue relevance* and field availability, not fire-risk science.

Every score is a transparent text-match heuristic against the 24 supplied PSI
catalogue records. The source JSON is not modified, and no outcome is inferred.
"""
from __future__ import annotations

import re
from typing import Any

SOURCE_NOTE = (
    "Based only on the supplied NASA PSI catalogue excerpts. Relevance is not "
    "scientific quality, a finding, a safety rating, or a fire-risk estimate. "
    "SI-generated pathways are not NASA classifications."
)
MISSING_NOTE = (
    "Not documented in this supplied catalogue does not mean not measured or "
    "not available in NASA's underlying datasets."
)

THEMES: dict[str, dict[str, Any]] = {
    "prevention": {
        "title": "Prevention & material flammability",
        "question": "Which investigations could guide further review of ignition, material flammability and flame spread?",
        "implication": "Explore candidate studies on material selection, ignition, flame spread and fire growth before consulting original experiment results.",
        "terms": ["flammab", "flame spread", "ignition", "fire growth", "solid fuel", "solid-material", "burning rate", "materials", "fuel thickness", "fabric"],
        "next_step": "Inspect the source's material geometry, atmosphere, airflow and reported flame behaviour before attempting any design comparison.",
    },
    "detection": {
        "title": "Detection & smoke research",
        "question": "Which investigation records might help study smoke particles and detection in low gravity?",
        "implication": "Identify smoke/aerosol investigations and documented measurement approaches for follow-up review of detector-relevant research.",
        "terms": ["smoke", "aerosol", "particle", "detector", "detection", "diagnostic", "pyrolysis", "soot", "image analysis"],
        "next_step": "Check original sensor methods and size-distribution data; catalogue tags alone cannot establish detector performance.",
    },
    "suppression": {
        "title": "Suppression & extinction",
        "question": "Which records focus on flame extinction, flammability limits or suppressant research?",
        "implication": "Locate investigations relevant to extinction and suppressant-related questions, not validated suppression instructions.",
        "terms": ["extinguish", "extinct", "suppress", "flammability limit", "limiting oxygen", "blowoff", "quench", "oxygen variation"],
        "next_step": "Read original protocols and recorded atmospheric conditions; never infer a usable suppressant concentration from catalogue metadata.",
    },
    "modelling": {
        "title": "Combustion modelling & fundamentals",
        "question": "Which records may help explore combustion models or numerical validation?",
        "implication": "Find analysis, computational work and related experiments that could support a model-validation literature review.",
        "terms": ["model", "simulat", "computational", "cfd", "openfoam", "flamelet", "numerical", "kinetic", "analysis"],
        "next_step": "Separate ground-based modelling from direct flight observations and verify available validation data at the original source.",
    },
}

SEARCH_FIELDS = (
    ("title", 5, lambda r: r.get("title") or ""),
    ("objective excerpt", 3, lambda r: (r.get("objective") or {}).get("text") or ""),
    ("approach excerpt", 3, lambda r: (r.get("approach") or {}).get("text") or ""),
    ("SI-generated tag", 1, lambda r: " | ".join(r.get("topic_tags") or [])),
)


def matches(term: str, text: str) -> bool:
    """Match full word/phrase or a bounded technical prefix (model*, extinct*)."""
    term = term.casefold()
    prefix = term in {"flammab", "extinct", "suppress", "model", "simulat"}
    return bool(re.search(r"(?<![\w])" + re.escape(term) + (r"[a-z]*" if prefix else r"(?![\w])"), text.casefold()))


def relevance_ranking(records: list[dict[str, Any]], theme: str, limit: int = 24) -> dict[str, Any]:
    if theme not in THEMES:
        raise ValueError("Unknown research theme")
    config = THEMES[theme]
    ranked = []
    for record in records:
        hits = []
        score = 0
        for label, weight, getter in SEARCH_FIELDS:
            value = getter(record)
            terms = [term for term in config["terms"] if matches(term, value)]
            if terms:
                # One field weight per matched term; repeated words do not inflate points.
                score += weight * len(terms)
                hits.append({"field": label, "terms": terms, "points": weight * len(terms)})
        if score:
            ranked.append({
                "id": record["id"], "title": record["title"], "type": record["type"],
                "score": score, "matches": hits,
                "why_relevant": "Matched: " + "; ".join(
                    f"{entry['field']} ({', '.join(entry['terms'])})" for entry in hits
                ),
                "source_url": record.get("source_url") or "https://psi.nasa.gov/",
                "source_completeness": record.get("source_completeness") or "catalogue excerpt",
            })
    ranked.sort(key=lambda item: (-item["score"], item["id"]))
    return {
        "theme": theme,
        "pathway": {key: config[key] for key in ("title", "question", "implication", "next_step")},
        "total_matching": len(ranked), "items": ranked[:limit],
        "method": "Deterministic weighted text matching: title 5, objective 3, approach 3, SI-generated tags 1 points per matched term in each field. Ties sort by PSI ID.",
        "notice": SOURCE_NOTE,
    }


def _documented(value: Any) -> bool:
    if isinstance(value, dict) and "value" in value:
        return value.get("value") is not None
    if isinstance(value, (list, tuple)):
        return len(value) > 0
    return value is not None and value != ""


def evidence_coverage(records: list[dict[str, Any]]) -> dict[str, Any]:
    fields = [
        ("fuel_material", "Fuel / material", lambda r: _documented(r.get("fuel_material"))),
        ("platform", "Platform or modelling context", lambda r: _documented(r.get("platform"))),
        ("hardware_software", "Hardware / software", lambda r: _documented(r.get("hardware_software"))),
        ("documented_conditions", "Descriptive conditions", lambda r: _documented(r.get("documented_conditions"))),
        ("diagnostics", "Measurements / diagnostics", lambda r: _documented(r.get("measurements_or_diagnostics"))),
        ("oxygen", "Numerical oxygen", lambda r: _documented((r.get("numeric_conditions") or {}).get("oxygen"))),
        ("pressure", "Numerical pressure", lambda r: _documented((r.get("numeric_conditions") or {}).get("pressure"))),
        ("airflow", "Numerical airflow", lambda r: _documented((r.get("numeric_conditions") or {}).get("airflow"))),
        ("doi", "DOI in original catalogue", lambda r: _documented(r.get("doi"))),
    ]
    total = len(records)
    return {
        "total": total,
        "fields": [{"key": key, "label": label, "documented": sum(bool(check(r)) for r in records), "not_documented": total - sum(bool(check(r)) for r in records)} for key, label, check in fields],
        "source": "User-provided 24-record NASA PSI catalogue snapshot, not full papers or raw datasets.",
        "notice": MISSING_NOTE,
    }


def research_brief(records: list[dict[str, Any]], theme: str) -> dict[str, Any]:
    ranking = relevance_ranking(records, theme, limit=5)
    return {
        "title": f"FLARE-X research brief — {ranking['pathway']['title']}",
        "research_question": ranking["pathway"]["question"],
        "interpretation": ranking["pathway"]["implication"],
        "recommended_next_step": ranking["pathway"]["next_step"],
        "records": [{"id": item["id"], "title": item["title"], "why_relevant": item["why_relevant"]} for item in ranking["items"]],
        "limitations": [SOURCE_NOTE, MISSING_NOTE, "No raw data or full-text research papers were accessed to generate this brief."],
        "source": "https://psi.nasa.gov/",
    }
