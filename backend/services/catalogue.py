"""Pure catalogue querying and comparison. No HTTP or filesystem code."""
from __future__ import annotations
from typing import Any

COMPARE_FIELDS = (
    "id", "title", "type", "objective", "approach", "fuel_material",
    "hardware_software", "platform", "documented_conditions", "numeric_conditions",
    "measurements_or_diagnostics", "related_investigation_ids", "topic_tags", "doi",
)


def metadata(catalogue: dict[str, Any]) -> dict[str, Any]:
    records = catalogue["records"]
    counts: dict[str, int] = {}
    for record in records:
        counts[record["type"]] = counts.get(record["type"], 0) + 1
    return {
        "dataset_name": catalogue["dataset_name"],
        "schema_version": catalogue["schema_version"],
        "total": len(records),
        "type_counts": counts,
        "research_areas": sorted({record["research_area"] for record in records}),
        "source": catalogue["source"],
        "notice": "Catalogue metadata only; raw datasets have not been accessed, and individual DOI citations have only been verified for a subset in the separate citation audit.",
    }


def list_records(records: list[dict[str, Any]], search: str = "", investigation_type: str = "", topic: str = "", sort: str = "id") -> list[dict[str, Any]]:
    query = search.strip().casefold()
    topic_query = topic.strip().casefold()
    matches = records
    if query:
        def searchable(record: dict[str, Any]) -> str:
            return " ".join([
                record.get("id", ""), record.get("title", ""), record.get("research_area", ""),
                record.get("type", ""), (record.get("objective") or {}).get("text", ""),
                (record.get("approach") or {}).get("text", ""),
                " ".join(record.get("fuel_material") or []),
                " ".join(record.get("topic_tags") or []),
            ]).casefold()
        matches = [record for record in matches if query in searchable(record)]
    if investigation_type:
        matches = [record for record in matches if record["type"].casefold() == investigation_type.casefold()]
    if topic_query:
        matches = [record for record in matches if any(topic_query in tag.casefold() for tag in record.get("topic_tags", []))]
    return sorted(matches, key=lambda record: record["title"].casefold() if sort == "title" else record["id"])


def compare_records(ids: list[str], by_id: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "items": [{field: by_id[item].get(field) for field in COMPARE_FIELDS} for item in ids],
        "notice": "Comparison reflects the supplied catalogue excerpts. Missing values are not evidence of absence.",
    }
