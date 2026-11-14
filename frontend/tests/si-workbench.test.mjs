import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { apiGet, apiPost } from '../src/services/api.js';

const root = new URL('../src/', import.meta.url);
const read = (file) => fs.readFileSync(new URL(file, root), 'utf8');

test('SI workbench supports three workflows with source links and real API calls', () => {
  const page = read('pages/ResearchAssistantPage.jsx');
  const component = read('components/assistant/SIWorkbench.jsx');
  const hook = read('hooks/useSIWorkbench.js');
  assert.match(page, /SI Research Studio/);
  for (const task of ['ask', 'compare', 'brief']) assert.match(page, new RegExp(`task === '${task}'`));
  assert.match(hook, /\/api\/assistant\/compare/);
  assert.match(hook, /\/api\/assistant\/brief/);
  assert.match(component, /<EvidenceCard/);
  assert.match(component, /semantic claims|scientific claims/i);
  assert.match(component, /Gemini API key configured/);
});

test('new assistant routes send structured JSON and load key-free status', async () => {
  const previous = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ ok: true }) };
    };
    await apiGet('/api/assistant/status');
    await apiPost('/api/assistant/compare', { ids: ['PSI-26', 'PSI-62'] });
    await apiPost('/api/assistant/brief', { theme: 'prevention' });
    assert.deepEqual(calls.map((call) => call.url), ['/api/assistant/status', '/api/assistant/compare', '/api/assistant/brief']);
    assert.deepEqual(JSON.parse(calls[1].options.body), { ids: ['PSI-26', 'PSI-62'] });
    assert.equal(JSON.parse(calls[2].options.body).theme, 'prevention');
  } finally { globalThis.fetch = previous; }
});
