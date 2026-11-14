"""Retriever-first assistant endpoint; optional Gemini stays server-side."""
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, HTTPException
from backend.schemas.assistant import AssistantQuestion, CompareQuestion, BriefQuestion
from backend.data_access.catalogue import RECORDS, CITATION_AUDIT
from backend.assistant import answer_question
from backend.services.citations import annotate_evidence

router = APIRouter(prefix="/api/assistant", tags=["Assistant"])


@router.post("/ask")
async def research_assistant(payload: AssistantQuestion) -> dict[str, Any]:
    question = payload.question.strip()
    if len(question) < 3:
        raise HTTPException(status_code=422, detail="Please enter at least three characters.")
    answer = await answer_question(question, RECORDS)
    return annotate_evidence(answer, CITATION_AUDIT)


@router.get('/status')
def assistant_status() -> dict[str, Any]:
    """Configuration state only: does not imply the Gemini endpoint was contacted."""
    import os
    return {
        'gemini_configured': bool(os.environ.get('GEMINI_API_KEY', '').strip()),
        'gemini_connection_verified': False,
        'fallback_available': True,
        'source_scope': '24-record supplied NASA PSI catalogue snapshot; no full-text or raw datasets',
    }


@router.post('/compare')
async def si_compare(payload: 'CompareQuestion') -> dict[str, Any]:
    from backend.services.si_workbench import compare_selected
    available_ids = {record['id'] for record in RECORDS}
    missing = [record_id for record_id in payload.ids if record_id not in available_ids]
    if missing:
        raise HTTPException(status_code=404, detail=f"Unknown catalogue investigation: {', '.join(missing)}")
    result = await compare_selected(payload.ids, RECORDS, payload.question)
    return annotate_evidence(result, CITATION_AUDIT)


@router.post('/brief')
async def si_research_brief(payload: 'BriefQuestion') -> dict[str, Any]:
    from backend.services.si_workbench import create_si_brief
    result = await create_si_brief(payload.theme, RECORDS, payload.question)
    return annotate_evidence(result, CITATION_AUDIT)
