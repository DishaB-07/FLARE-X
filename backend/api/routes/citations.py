"""NASA PSI citation audit endpoint, distinct from source records."""
from __future__ import annotations
from typing import Any
from fastapi import APIRouter
from backend.data_access.catalogue import RECORDS, CITATION_AUDIT
from backend.services.citations import citation_report

router = APIRouter(prefix="/api", tags=["Provenance"])


@router.get("/citations")
def citation_audit() -> dict[str, Any]:
    return citation_report(RECORDS, CITATION_AUDIT)
