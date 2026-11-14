import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, apiGet, apiPost } from '../src/services/api.js';
import { catalogueTopics, typeChartData, topicChartData } from '../src/utils/catalogue.js';
import { valueOrMissing, sourceText } from '../src/utils/formatters.js';

test('missing values are never presented as measured zero', () => {
  assert.equal(valueOrMissing(null), 'Not available in the provided source');
  assert.equal(valueOrMissing([]), 'Not available in the provided source');
  assert.equal(valueOrMissing({ value: null, unit: '%' }), 'Not available in the provided source');
  assert.equal(valueOrMissing({ value: 0, unit: '%' }), '0 %');
  assert.equal(sourceText({ text: 'Captured excerpt…', completeness: 'truncated_catalogue_excerpt' }), 'Captured excerpt…');
});

test('chart/filter helpers do not modify source records', () => {
  const records = Object.freeze([
    Object.freeze({ id: 'PSI-26', topic_tags: ['flame', 'materials'] }),
    Object.freeze({ id: 'PSI-25', topic_tags: ['flame'] }),
  ]);
  assert.deepEqual(catalogueTopics(records), ['flame', 'materials']);
  assert.deepEqual(typeChartData({ type_counts: { 'Ground Investigation': 5 } }), [{ name: 'Ground', value: 5 }]);
  assert.deepEqual(topicChartData(records), [{ topic: 'flame', count: 2 }, { topic: 'materials', count: 1 }]);
});

test('API transport handles success and sends JSON only on POST', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ answer: 'Found source.' }) };
  };
  try {
    assert.deepEqual(await apiGet('/health', undefined, 'http://example.test'), { answer: 'Found source.' });
    assert.deepEqual(await apiPost('/api/assistant/ask', { question: 'PSI-26' }, undefined, 'http://example.test'), { answer: 'Found source.' });
    assert.equal(calls[0].options.method, 'GET');
    assert.equal(calls[0].options.body, undefined);
    assert.equal(JSON.parse(calls[1].options.body).question, 'PSI-26');
  } finally { globalThis.fetch = original; }
});

test('API validation errors are readable; credentials are not copied into messages', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 422, json: async () => ({ detail: [{ msg: 'Question must be at least 3 characters' }] }) });
  try {
    await assert.rejects(apiPost('/api/assistant/ask', { question: '' }), (error) => error instanceof ApiError && error.status === 422 && /at least 3/.test(error.message));
  } finally { globalThis.fetch = original; }
});

test('network errors are actionable and aborts propagate', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(apiGet('/health'), /Cannot reach FLARE-X API/);
    globalThis.fetch = async () => { throw Object.assign(new Error('aborted'), { name: 'AbortError' }); };
    await assert.rejects(apiGet('/health'), (error) => error.name === 'AbortError');
  } finally { globalThis.fetch = original; }
});
