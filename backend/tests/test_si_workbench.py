"""Source-bounded SI workflows, validation and fallback regressions."""
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from backend.main import app
from backend.services import assistant, si_workbench

client = TestClient(app)


def test_workbench_comparison_preserves_factual_fields(monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-62']})
    assert response.status_code == 200
    result = response.json()
    assert result['mode'] == 'catalogue'
    assert result['comparison']['ids'] == ['PSI-26', 'PSI-62']
    type_row = next(row for row in result['comparison']['rows'] if row['key'] == 'type')
    assert [entry['value'] for entry in type_row['values']] == ['Microgravity Investigation', 'Ground Investigation']
    assert result['validation']['semantic_claims_verified'] is False
    assert {item['id'] for item in result['evidence']} == {'PSI-26', 'PSI-62'}


def test_workbench_rejects_invalid_ids_and_unknown_records():
    assert client.post('/api/assistant/compare', json={'ids': ['PSI-26']}).status_code == 422
    assert client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-26']}).status_code == 422
    assert client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-999']}).status_code == 404
    assert client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'bad']}).status_code == 422
    assert client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-62'], 'question': 'x' * 501}).status_code == 422


def test_si_brief_returns_grounded_records_and_explains_scope(monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    result = client.post('/api/assistant/brief', json={'theme': 'suppression'}).json()
    assert result['mode'] == 'catalogue'
    assert result['brief']['records']
    assert all(item['id'] in result['answer'] for item in result['brief']['records'])
    assert len(result['evidence']) == len(result['brief']['records'])
    assert result['validation']['semantic_claims_verified'] is False
    assert client.post('/api/assistant/brief', json={'theme': 'unknown'}).status_code == 422


def test_status_does_not_expose_key_or_claim_a_live_test(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY', 'top-secret-key')
    response = client.get('/api/assistant/status').json()
    assert response['gemini_configured'] is True
    assert response['gemini_connection_verified'] is False
    assert 'top-secret-key' not in str(response)


def test_sentence_citation_and_numeric_validation():
    evidence = [assistant.evidence_item({
        'id': 'PSI-26', 'title': 'BASS', 'type': 'Microgravity Investigation',
        'objective': {'text': 'Tests 75% cotton and 25% fiberglass.', 'completeness': 'excerpt'},
        'numeric_conditions': {'oxygen': None},
    })]
    validated = assistant.validate_synthesis('The supplied excerpt lists 75% cotton. [PSI-26]', evidence)
    assert validated['citations_checked'] == 1
    assert validated['numeric_mentions_checked'] == 1
    assert validated['semantic_claims_verified'] is False
    for invalid in [
        'An unsupported uncited claim.',
        'The study measured 90% oxygen. [PSI-26]',
        'The study examined cotton. [PSI-999]',
        'See https://example.test for results. [PSI-26]',
    ]:
        try:
            assistant.validate_synthesis(invalid, evidence)
            assert False, f'Unsafe synthesis passed: {invalid}'
        except ValueError:
            pass


def test_gemini_comparison_mock_and_rejected_answer_fallback(monkeypatch):
    monkeypatch.setenv('GEMINI_API_KEY', 'fake-test-key')
    monkeypatch.setattr(assistant, 'ask_gemini', AsyncMock(return_value='BASS is a microgravity investigation. [PSI-26]'))
    success = client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-62']}).json()
    assert success['mode'] == 'gemini'
    assert success['answer'].endswith('[PSI-26]')
    monkeypatch.setattr(assistant, 'ask_gemini', AsyncMock(side_effect=ValueError('bad citation')))
    fallback = client.post('/api/assistant/compare', json={'ids': ['PSI-26', 'PSI-62']}).json()
    assert fallback['mode'] == 'catalogue'
    assert 'fallback' in fallback['notice'].lower()
