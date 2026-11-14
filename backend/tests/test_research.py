"""Regression tests for research ranking, evidence gaps and citation provenance."""
from fastapi.testclient import TestClient

from backend.main import app, RECORDS
from backend.research import relevance_ranking, evidence_coverage, research_brief

client = TestClient(app)


def test_relevance_exposes_transparent_matches_without_risk_score():
    response = client.get('/api/relevance?theme=detection')
    assert response.status_code == 200
    payload = response.json()
    assert payload['total_matching'] >= 2
    assert 'weighted text matching' in payload['method']
    assert 'not' in payload['notice'].lower()
    ids = [item['id'] for item in payload['items']]
    assert 'PSI-101' in ids and 'PSI-102' in ids
    assert all(item['score'] > 0 and item['matches'] for item in payload['items'])
    assert all(item['why_relevant'].startswith('Matched:') for item in payload['items'])
    assert payload['items'] == sorted(payload['items'], key=lambda item: (-item['score'],item['id']))
    assert 'risk_score' not in payload['items'][0]


def test_relevance_limit_invalid_theme_and_repeatability():
    first = client.get('/api/relevance', params={'theme':'suppression','limit':3})
    assert first.status_code == 200
    assert len(first.json()['items']) <= 3
    assert first.json() == client.get('/api/relevance', params={'theme':'suppression','limit':3}).json()
    assert client.get('/api/relevance?theme=not-a-theme').status_code == 422
    assert client.get('/api/relevance?limit=100').status_code == 422


def test_metadata_coverage_exact_counts():
    payload = client.get('/api/evidence-coverage').json()
    assert payload['total'] == 24
    fields = {item['key']: item for item in payload['fields']}
    assert fields['fuel_material']['documented'] == 14
    assert fields['doi']['documented'] == 3
    assert fields['platform']['documented'] == 24
    assert fields['oxygen']['documented'] == 2
    assert fields['pressure']['documented'] == 3
    assert fields['airflow']['documented'] == 6
    assert all(row['documented'] + row['not_documented'] == 24 for row in payload['fields'])
    # Field count does not imply NASA never collected it.
    assert 'does not mean not measured' in payload['notice']


def test_brief_explicitly_scoped():
    payload = client.get('/api/research-brief?theme=prevention').json()
    assert 1 <= len(payload['records']) <= 5
    assert payload['source'] == 'https://psi.nasa.gov/'
    assert all('PSI-' in item['id'] for item in payload['records'])
    assert any('raw data' in limitation for limitation in payload['limitations'])


def test_citations_verified_subset_exact_and_source_json_unchanged():
    payload = client.get('/api/citations').json()
    assert payload['confirmed'] == 6
    assert payload['remaining'] == 18
    assert len(payload['items']) == 24
    by_id = {item['id']: item for item in payload['items']}
    assert by_id['PSI-101']['doi'] == '10.60555/2np7-jv14'
    assert by_id['PSI-101']['status'] == 'confirmed_nasa_psi'
    assert by_id['PSI-107']['doi'] == '10.60555/9kbh-e962'
    assert by_id['PSI-62']['doi'] == '10.60555/e9xp-ex83'
    assert by_id['PSI-62']['status'] == 'confirmed_nasa_psi'
    assert by_id['PSI-26']['landing_page_url'] is None
    assert by_id['PSI-26']['status'] == 'needs_verification'
    assert next(record for record in RECORDS if record['id'] == 'PSI-101')['doi'] is None


def test_research_retrieval_never_depends_on_external_services():
    for theme in ('prevention','detection','suppression','modelling'):
        ranked = relevance_ranking(RECORDS,theme)
        assert all(match['id'] in {r['id'] for r in RECORDS} for match in ranked['items'])
    assert evidence_coverage(RECORDS)['total'] == 24
    assert research_brief(RECORDS,'modelling')['research_question']


def test_assistant_evidence_enriched_only_for_confirmed_urls():
    checked = client.post('/api/assistant/ask', json={'question':'What is PSI-101 studying?'})
    assert checked.status_code == 200
    checked_sources = checked.json()['evidence']
    assert checked_sources[0]['id'] == 'PSI-101'
    assert checked_sources[0]['citation_verification'] == 'official_PSI_title_DOI_confirmed'
    assert checked_sources[0]['source_url'] == 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-101'
    pending = client.post('/api/assistant/ask', json={'question':'What does PSI-26 study?'})
    assert pending.status_code == 200
    assert pending.json()['evidence'][0]['citation_verification'] == 'not_independently_verified'
    assert pending.json()['evidence'][0]['source_url'] == 'https://psi.nasa.gov/'


def test_citation_audit_links_to_provided_psi_search_without_claiming_live_totals():
    payload = client.get('/api/citations').json()
    assert payload['repository_search_url'] == 'https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation'
    assert 'not a live repository result count' in payload['catalogue_scope']
    assert payload['confirmed'] + payload['remaining'] == 24
    assert next(r for r in RECORDS if r['id'] == 'PSI-107')['doi'] is None
    assert next(r for r in RECORDS if r['id'] == 'PSI-62')['doi'] is None


def test_all_24_records_have_audited_provenance_or_nasa_program_context():
    payload = client.get('/api/citations').json()
    assert payload['confirmed'] == 6
    assert payload['program_context_reviewed'] == 18
    assert payload['remaining'] == 18  # Programme context is not a DOI verification.
    assert sum(bool(item['nasa_program_context_url']) for item in payload['items']) == 18
    for item in payload['items']:
        if item['status'] == 'needs_verification':
            assert item['nasa_program_context_url'].startswith('https://')
            assert item['doi'] is None
            assert 'not independently verified' in item['verification_scope']
        else:
            assert item['doi'] and item['landing_page_url']
    assert next(item for item in payload['items'] if item['id'] == 'PSI-117')['status'] == 'needs_verification'
    assert 'not verify' in payload['notice']
