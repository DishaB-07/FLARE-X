"""Read-only catalogue endpoints. The URL paths are unchanged."""
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, HTTPException, Query
from backend.data_access.catalogue import CATALOGUE, RECORDS, RECORD_BY_ID
from backend.services.catalogue import metadata as metadata_service, list_records, compare_records

router = APIRouter(prefix="/api", tags=["Catalogue"])


@router.get("/metadata")
def metadata() -> dict[str, Any]:
    return metadata_service(CATALOGUE)


@router.get("/investigations")
def list_investigations(
    search: str = Query(default="", max_length=200),
    investigation_type: str = Query(default="", alias="type", max_length=100),
    topic: str = Query(default="", max_length=80),
    sort: str = Query(default="id", pattern="^(id|title)$"),
) -> dict[str, Any]:
    results = list_records(RECORDS, search, investigation_type, topic, sort)
    return {"count": len(results), "items": results}


@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: str) -> dict[str, Any]:
    record = RECORD_BY_ID.get(investigation_id.upper())
    if record is None:
        raise HTTPException(status_code=404, detail=f"Investigation {investigation_id} was not found.")
    return record


@router.get("/compare")
def compare_investigations(ids: list[str] = Query(min_length=2, max_length=3)) -> dict[str, Any]:
    normalized = [item.upper() for item in ids]
    if len(set(normalized)) != len(normalized):
        raise HTTPException(status_code=400, detail="Choose distinct investigation IDs.")
    missing = [item for item in normalized if item not in RECORD_BY_ID]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown investigation IDs: {', '.join(missing)}")
    return compare_records(normalized, RECORD_BY_ID)
