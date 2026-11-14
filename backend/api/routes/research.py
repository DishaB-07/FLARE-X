"""Research relevance and evidence-coverage endpoints."""
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Query
from backend.data_access.catalogue import RECORDS
from backend.services.research import relevance_ranking, evidence_coverage, research_brief

router = APIRouter(prefix="/api", tags=["Research"])
THEME_PATTERN = "^(prevention|detection|suppression|modelling)$"


@router.get("/relevance")
def investigation_relevance(theme: str = Query(default="prevention", pattern=THEME_PATTERN), limit: int = Query(default=24, ge=1, le=24)) -> dict[str, Any]:
    return relevance_ranking(RECORDS, theme, limit)


@router.get("/evidence-coverage")
def catalogue_evidence_coverage() -> dict[str, Any]:
    return evidence_coverage(RECORDS)


@router.get("/research-brief")
def catalogue_research_brief(theme: str = Query(default="prevention", pattern=THEME_PATTERN)) -> dict[str, Any]:
    return research_brief(RECORDS, theme)
