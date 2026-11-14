from unittest.mock import AsyncMock

import asyncio
from fastapi.testclient import TestClient

from backend import assistant
from backend.main import app

client = TestClient(app)


def test_retrieval_first_and_citations_without_gemini(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    response = client.post("/api/assistant/ask", json={"question": "What is BASS PSI-26?"})
    assert response.status_code == 200
    result = response.json()
    assert result["mode"] == "catalogue"
    assert result["evidence"][0]["id"] == "PSI-26"
    assert "[PSI-26]" in result["answer"]
    assert result["evidence"][0]["source_is_record_page"] is False
    assert result["evidence"][0]["excerpts"][0]["completeness"] == "truncated_catalogue_excerpt"


def test_missing_oxygen_remains_unavailable(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    result = client.post("/api/assistant/ask", json={"question": "What oxygen concentration in PSI-26?"}).json()
    assert "oxygen: Not available in the provided source" in result["answer"]
    assert "not zero" in result["answer"]


def test_unknown_topic_does_not_make_up_studies(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    result = client.post("/api/assistant/ask", json={"question": "photosynthesis chlorophyll"}).json()
    assert result["evidence"] == []
    assert "couldn't find" in result["answer"]


def test_input_validation():
    assert client.post("/api/assistant/ask", json={"question": "x"}).status_code == 422
    assert client.post("/api/assistant/ask", json={"question": "z" * 501}).status_code == 422


def test_gemini_failure_falls_back(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")
    monkeypatch.setattr(assistant, "ask_gemini", AsyncMock(side_effect=ValueError("bad citations")))
    result = client.post("/api/assistant/ask", json={"question": "PSI-26 oxygen"}).json()
    assert result["mode"] == "catalogue"
    assert "citation" in result["notice"]
    assert result["evidence"][0]["id"] == "PSI-26"


def test_never_invent_psi_id(monkeypatch):
    # No network access. Validate response cited IDs only among retrieved evidence.
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    result = asyncio.run(assistant.answer_question("PSI-26", [
        {"id": "PSI-26", "title": "Burning and Suppression of Solids (BASS)",
         "type": "Microgravity Investigation", "objective": {"text": "Burning research.", "completeness": "excerpt"},
         "approach": {"text": "Approach", "completeness": "excerpt"}}
    ]))
    assert "[PSI-26]" in result["answer"]
    assert "PSI-999" not in result["answer"]


def test_explicit_id_keeps_answer_focused(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    result = client.post("/api/assistant/ask", json={"question": "PSI-26 oxygen"}).json()
    assert [item["id"] for item in result["evidence"]] == ["PSI-26"]


def test_material_question_uses_structured_source_field(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    result = client.post("/api/assistant/ask", json={"question": "What fuel material is listed for PSI-26?"}).json()
    assert "75% cotton and 25% fiberglass" in result["answer"]
    assert "[PSI-26]" in result["answer"]
