"""SI workbench workflows grounded in the immutable 24-record PSI catalogue.

The structured comparison / brief is deterministic. Gemini may *describe* the
selected evidence, but never chooses sources or changes underlying facts.
"""
from __future__ import annotations

import os
from typing import Any

import httpx

from backend.services import assistant
from backend.services.research import THEMES, research_brief

MISSING = assistant.MISSING

FIELDS = (
    ("type", "Investigation type"),
    ("platform", "Platform / research context"),
    ("fuel_material", "Fuel / material"),
    ("hardware_software", "Hardware / software"),
    ("measurements_or_diagnostics", "Measurements / diagnostics"),
    ("documented_conditions", "Documented conditions"),
    ("oxygen", "Numeric oxygen"),
    ("pressure", "Numeric pressure"),
    ("airflow", "Numeric airflow"),
)


def _value(record: dict[str, Any], field: str) -> str:
    if field in {"oxygen", "pressure", "airflow"}:
        raw = (record.get("numeric_conditions") or {}).get(field)
    else:
        raw = record.get(field)
    if isinstance(raw, dict):
        number = raw.get("value")
        if number is None:
            return MISSING
        return f"{number} {raw.get('unit') or ''}".strip()
    if isinstance(raw, list):
        return "; ".join(map(str, raw)) if raw else MISSING
    return str(raw).strip() if raw is not None and str(raw).strip() else MISSING


def comparison_table(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Side-by-side direct values; 'shared' means literal populated equality only."""
    rows = []
    for field, label in FIELDS:
        values = [{"id": record["id"], "value": _value(record, field)} for record in records]
        populated = all(item["value"] != MISSING for item in values)
        rows.append({
            "key": field,
            "label": label,
            "values": values,
            "shared": populated and len({item["value"].casefold() for item in values}) == 1,
            "has_missing": not populated,
        })
    return {
        "ids": [record["id"] for record in records],
        "rows": rows,
        "shared_fields": [row["label"] for row in rows if row["shared"]],
        "unavailable_fields": [row["label"] for row in rows if row["has_missing"]],
        "method": "Literal comparison of populated catalogue fields; no statistical or experimental equivalence is inferred.",
    }


def _answer_from_rows(selected: list[dict[str, Any]], table: dict[str, Any]) -> str:
    ids = [record["id"] for record in selected]
    names = ", ".join(f"{record['id']} ({record['type']}) [{record['id']}]" for record in selected)
    rows = [row for row in table["rows"] if not row["has_missing"] and not row["shared"]]
    detail = "\n\n".join(
        f"{row['label']}: " + "; ".join(f"{entry['id']}: {entry['value']} [{entry['id']}]" for entry in row["values"])
        for row in rows[:3]
    )
    missing = ", ".join(table["unavailable_fields"][:4]) or "none in the compared fields"
    return (
        f"Compared supplied catalogue entries: {names}.\n\n"
        + (detail + "\n\n" if detail else "")
        + f"Fields with at least one unavailable value: {missing}. "
        + "Missing catalogue information is not evidence that a measurement was never taken. "
        + "These metadata differences do not establish differences in actual combustion outcomes."
    )


async def _optional_synthesis(question: str, selected: list[dict[str, Any]], fallback: str) -> tuple[str, str, str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return fallback, "catalogue", "No Gemini key configured; showing transparent catalogue-derived output."
    evidence = [assistant.evidence_item(record) for record in selected]
    try:
        generated = await assistant.ask_gemini(
            question,
            evidence,
            os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip(),
            api_key,
        )
        return generated, "gemini", "Gemini synthesized retrieved excerpts; citation and numeric-format checks passed, but scientific claims are not independently verified."
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError) as exc:
        reason, explanation = assistant.gemini_failure(exc)
        return fallback, "catalogue", f"{explanation} Showing the catalogue fallback (reason: {reason})."


async def compare_selected(
    ids: list[str], records: list[dict[str, Any]], question: str | None = None,
) -> dict[str, Any]:
    by_id = {item["id"]: item for item in records}
    selected = [by_id[record_id] for record_id in ids]
    table = comparison_table(selected)
    instruction = (
        f"Compare only these NASA PSI catalogue records: {', '.join(ids)}. "
        f"Question: {question or 'What documented similarities, differences and unknowns are visible?'} "
        "Distinguish modelling from flight investigations. Cite every factual sentence. "
        "Do not infer results, safety outcomes or comparable experimental conditions."
    )
    fallback = _answer_from_rows(selected, table)
    answer, mode, notice = await _optional_synthesis(instruction, selected, fallback)
    return {
        "mode": mode, "answer": answer, "notice": notice,
        "comparison": table,
        "evidence": [assistant.evidence_item(record) for record in selected],
        "validation": {
            "level": "catalogue_fields" if mode == "catalogue" else "citation_and_numeric_guardrails",
            "semantic_claims_verified": False,
            "notice": "Inspect the original NASA record before interpreting scientific results.",
        },
    }


async def create_si_brief(
    theme: str, records: list[dict[str, Any]], question: str | None = None,
) -> dict[str, Any]:
    structured = research_brief(records, theme)
    ids = [item["id"] for item in structured["records"]]
    by_id = {record["id"]: record for record in records}
    selected = [by_id[record_id] for record_id in ids]
    intro = (
        f"Research theme: {THEMES[theme]['title']}. "
        f"Question: {question or structured['research_question']} "
        "Summarize only documented catalogue excerpts, cite every factual sentence, "
        "identify unavailable data, and propose only questions for further investigation. "
        "Do not provide operational fire-safety advice or claim scientific findings."
    )
    if selected:
        fallback = (
            f"Research direction: {structured['research_question']}\n\n"
            + "Relevant catalogue entries: "
            + "; ".join(f"{item['id']} — {item['title']} [{item['id']}]" for item in structured["records"])
            + "\n\nFollow-up: open each original PSI investigation and verify its methods, data and citations. "
              "This brief is a literature-navigation aid, not a synthesis of full papers or experimental outcomes."
        )
    else:
        fallback = "No matching catalogue records were found for this theme. This is not proof the NASA repository contains no relevant studies."
    answer, mode, notice = await _optional_synthesis(intro, selected, fallback) if selected else (fallback, "catalogue", "No records retrieved.")
    return {
        "mode": mode, "answer": answer, "notice": notice,
        "brief": structured,
        "evidence": [assistant.evidence_item(record) for record in selected],
        "validation": {
            "level": "catalogue_fields" if mode == "catalogue" else "citation_and_numeric_guardrails",
            "semantic_claims_verified": False,
            "notice": "Proposed research directions are FLARE-X interpretations, not NASA findings or safety recommendations.",
        },
    }
