"""Behavioral regression tests after splitting API routes/services/data access."""
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.data_access.catalogue import load_catalogue, RECORDS
from backend.services.catalogue import list_records

client = TestClient(app)


def test_all_original_endpoints_remain_registered():
    expected = {
        '/health', '/api/metadata', '/api/investigations', '/api/investigations/{investigation_id}',
        '/api/compare', '/api/relevance', '/api/evidence-coverage', '/api/research-brief',
        '/api/citations', '/api/assistant/ask',
    }
    assert expected <= set(client.get('/openapi.json').json()['paths'])
    assert len(RECORDS) == 24


def test_api_errors_are_explicit_and_client_safe():
    assert client.get('/api/investigations?sort=unsupported').status_code == 422
    assert client.get('/api/investigations?search=' + 'x' * 201).status_code == 422
    assert client.get('/api/compare?ids=PSI-26').status_code == 422
    assert client.get('/api/compare?ids=PSI-25&ids=psi-25').status_code == 400
    assert client.get('/api/compare?ids=PSI-25&ids=PSI-999').status_code == 404
    assert client.post('/api/assistant/ask', json={'question': '  '}).status_code == 422
    assert client.post('/api/assistant/ask', json={'question': 'x' * 501}).status_code == 422


def test_filter_service_has_no_mutating_effect():
    before = json.dumps(RECORDS, sort_keys=True)
    matches = list_records(RECORDS, search='flame', investigation_type='Ground Investigation', sort='title')
    assert matches and all(item['type'] == 'Ground Investigation' for item in matches)
    assert json.dumps(RECORDS, sort_keys=True) == before


def test_bad_catalogue_file_gives_actionable_startup_error(tmp_path):
    missing = tmp_path / 'missing.json'
    try:
        load_catalogue(missing)
        assert False, 'Expected startup error'
    except RuntimeError as exc:
        assert 'missing' in str(exc)

    wrong_shape = tmp_path / 'wrong.json'
    wrong_shape.write_text('{"records": "not a list"}', encoding='utf-8')
    try:
        load_catalogue(wrong_shape)
        assert False, 'Expected validation error'
    except RuntimeError as exc:
        assert 'records' in str(exc)
