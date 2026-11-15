"""Regression coverage for safe Gemini error reporting and structured claims."""
import asyncio
import json
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.data_access.catalogue import RECORD_BY_ID
from backend.main import app
from backend.services import assistant


def evidence():
    return [assistant.evidence_item(RECORD_BY_ID['PSI-26'])]


def test_structured_output_attaches_checked_citation():
    raw = json.dumps({"claims": [{
        "text": "The catalogue identifies BASS as a microgravity investigation.",
        "sources": ["PSI-26"],
    }]})
    answer = assistant._format_structured_answer(raw, evidence())
    assert "[PSI-26]" in answer
    assert assistant.validate_synthesis(answer, evidence())["citations_checked"] == 1


def test_structured_output_rejects_unretrieved_sources_and_numbers():
    for text, sources in [
        ("The source documents cotton.", ["PSI-999"]),
        ("The source documents 99% oxygen.", ["PSI-26"]),
        ("The source cites PSI-999 as an investigation.", ["PSI-26"]),
    ]:
        raw = json.dumps({"claims": [{"text": text, "sources": sources}]})
        with pytest.raises(ValueError):
            assistant._format_structured_answer(raw, evidence())


def test_structured_json_request_with_mocked_gemini(monkeypatch):
    requests = []

    def response_for(request: httpx.Request):
        requests.append(request)
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": json.dumps({
            "claims": [{"text": "BASS is classified as a microgravity investigation.", "sources": ["PSI-26"]}]
        })}]}}]})

    real_client = httpx.AsyncClient

    def fake_client(timeout):
        assert timeout == 30
        return real_client(transport=httpx.MockTransport(response_for), timeout=timeout)

    monkeypatch.setattr(assistant.httpx, 'AsyncClient', fake_client)
    result = asyncio.run(assistant.ask_gemini('What is PSI-26?', evidence(), 'gemini-3.5-flash-lite', 'test-key'))
    assert result.endswith('[PSI-26]')
    sent = json.loads(requests[0].content)
    assert sent['generationConfig']['responseMimeType'] == 'application/json'
    assert sent['generationConfig']['maxOutputTokens'] == 2048
    assert requests[0].headers['x-goog-api-key'] == 'test-key'


def test_http_errors_produce_safe_user_visible_reason(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY', 'secret-never-show')
    request = httpx.Request('POST', 'https://generativelanguage.googleapis.com/v1beta/models/test:generateContent')
    response = httpx.Response(429, request=request)
    exc = httpx.HTTPStatusError('secret-never-show', request=request, response=response)
    monkeypatch.setattr(assistant, 'ask_gemini', AsyncMock(side_effect=exc))
    reply = TestClient(app).post('/api/assistant/ask', json={'question': 'What is PSI-26?'}).json()
    assert reply['mode'] == 'catalogue'
    assert reply['fallback_reason'] == 'http_429'
    assert 'quota' in reply['notice'].lower()
    assert 'secret-never-show' not in json.dumps(reply)


def test_timeout_reason_and_gemini_success(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY', 'safe-fake-key')
    monkeypatch.setattr(assistant, 'ask_gemini', AsyncMock(side_effect=httpx.ReadTimeout('test timeout')))
    r = TestClient(app).post('/api/assistant/ask', json={'question': 'Explain PSI-26'}).json()
    assert r['fallback_reason'] == 'timeout'
    monkeypatch.setattr(assistant, 'ask_gemini', AsyncMock(return_value='BASS is a microgravity investigation. [PSI-26]'))
    r2 = TestClient(app).post('/api/assistant/ask', json={'question': 'Explain PSI-26'}).json()
    assert r2['mode'] == 'gemini'
    assert r2['fallback_reason'] is None
