import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../src/components/research/ResearchWorkflow.jsx', import.meta.url), 'utf8');
const overview = readFileSync(new URL('../src/pages/OverviewPage.jsx', import.meta.url), 'utf8');
const stylesheet = readFileSync(new URL('../src/styles/workflow.css', import.meta.url), 'utf8');

test('research workflow exposes all five evidence stages and no decorative orbit', () => {
  const stageCount = (workflow.match(/shortLabel:\s*'/g) || []).length;
  assert.equal(stageCount, 5);
  for (const label of ['NASA PSI catalogue', 'Structure the records', 'Explore and compare', 'Research intelligence', 'Evidence-linked answers']) {
    assert.ok(workflow.includes(label), `Missing stage ${label}`);
  }
  assert.ok(overview.includes('<ResearchWorkflow'));
  assert.ok(!overview.includes('hero-orbit'));
  assert.ok(!overview.includes('CONCEPTUAL 3D VIEW'));
  assert.ok(!overview.includes('<ResearchEvidenceTrail'));
});

test('workflow selection, navigation and accessibility controls are wired', () => {
  assert.match(workflow, /onClick=\{\(\) => setActive\(index\)\}/);
  assert.match(workflow, /onClick=\{\(\) => setActive\(\(index\) => \(index \+ 1\) % stages.length\)\}/);
  assert.match(workflow, /aria-pressed=\{active === index\}/);
  assert.match(workflow, /aria-controls=\{descriptionId\}/);
  assert.match(workflow, /aria-live="polite"/);
  for (const action of ['onExplore()', 'onCompare()', 'onAssistant()', 'onIntelligence()']) {
    assert.ok(workflow.includes(action), `Missing action ${action}`);
  }
  assert.match(workflow, /window.open\(NASA_PSI_URL, '_blank', 'noopener,noreferrer'\)/);
});

test('workflow preserves mobile layout, keyboard focus and reduced-motion support', () => {
  assert.match(stylesheet, /@media \(max-width: 680px\)/);
  assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(stylesheet, /\.research-flow-steps::before/);
});
