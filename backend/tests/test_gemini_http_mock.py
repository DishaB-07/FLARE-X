"""Exercise outbound Gemini REST integration without needing user credentials."""
import asyncio

from backend.data_access.catalogue import RECORD_BY_ID
from backend.services import assistant


def test_gemini_json_rest_request_and_citation_guard(monkeypatch):
    calls = []

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                'candidates': [
                    {'content': {'parts': [{'text': 'The catalogue lists 75% cotton. [PSI-26]'}]}}
                ]
            }

    class FakeClient:
        def __init__(self, timeout):
            assert timeout == 18

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, headers, json):
            calls.append({'url': url, 'headers': headers, 'json': json})
            return FakeResponse()

    monkeypatch.setattr(assistant.httpx, 'AsyncClient', FakeClient)
    evidence = [assistant.evidence_item(RECORD_BY_ID['PSI-26'])]
    answer = asyncio.run(assistant.ask_gemini('What materials appear in PSI-26?', evidence, 'gemini-3.5-flash-lite', 'example-key'))
    assert answer == 'The catalogue lists 75% cotton. [PSI-26]'
    assert len(calls) == 1
    assert calls[0]['url'].endswith('/models/gemini-3.5-flash-lite:generateContent')
    assert calls[0]['headers']['x-goog-api-key'] == 'example-key'
    assert 'only the evidence' in calls[0]['json']['systemInstruction']['parts'][0]['text'].lower() or 'only' in calls[0]['json']['systemInstruction']['parts'][0]['text'].lower()
    assert calls[0]['json']['generationConfig']['temperature'] == 0.1
    assert 'PSI-26' in calls[0]['json']['contents'][0]['parts'][0]['text']
