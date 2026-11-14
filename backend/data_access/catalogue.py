"""Read-only access to the checked-in NASA PSI catalogue snapshot and citation audit.

No live repository queries are performed. Data is loaded once at startup.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from backend.core.config import CATALOGUE_PATH, CITATION_AUDIT_PATH


def _load_json(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except FileNotFoundError as exc:
        raise RuntimeError(f"Required project data file is missing: {path}") from exc
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Cannot load project data from {path.name}: {exc}") from exc
    if not isinstance(payload, dict):
        raise RuntimeError(f"Expected JSON object in {path.name}.")
    return payload


def load_catalogue(path: Path = CATALOGUE_PATH) -> dict[str, Any]:
    payload = _load_json(path)
    records = payload.get("records")
    if not isinstance(records, list) or not all(isinstance(record, dict) for record in records):
        raise RuntimeError("Catalogue must contain a 'records' array of objects.")
    ids = [record.get("id") for record in records]
    if not all(isinstance(value, str) and value for value in ids):
        raise RuntimeError("Every catalogue record must have a nonempty investigation ID.")
    if len(ids) != len(set(ids)):
        raise RuntimeError("Catalogue contains duplicate investigation IDs.")
    return payload


def load_citation_audit(path: Path = CITATION_AUDIT_PATH) -> dict[str, Any]:
    payload = _load_json(path)
    if not isinstance(payload.get("verified_records"), dict):
        raise RuntimeError("Citation audit must include a 'verified_records' object.")
    return payload


CATALOGUE = load_catalogue()
RECORDS: list[dict[str, Any]] = CATALOGUE["records"]
RECORD_BY_ID: dict[str, dict[str, Any]] = {record["id"].upper(): record for record in RECORDS}
CITATION_AUDIT = load_citation_audit()
