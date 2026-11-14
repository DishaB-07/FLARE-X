import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const overview = read('../src/pages/OverviewPage.jsx');
const workflow = read('../src/components/research/ResearchWorkflow.jsx');
const canvas = read('../src/components/research/FlowCurrent3D.jsx');
const scene = read('../src/visuals/flowCurrentScene.js');
const css = read('../src/styles/workflow.css');
const packageJson = JSON.parse(read('../package.json'));

test('workflow is a standalone Overview section after the hero and before feature cards', () => {
  const heroEnd = overview.indexOf('</section>', overview.indexOf('className="hero-panel"'));
  const sectionPosition = overview.indexOf('<ResearchWorkflow', heroEnd);
  assert.ok(heroEnd > 0);
  assert.ok(sectionPosition > heroEnd, 'Workflow must not be nested inside hero');
  assert.ok(sectionPosition < overview.indexOf('className="launch-grid"'));
  assert.ok(overview.includes("getElementById('research-workflow')"));
});

test('data current uses lazy loaded Three.js and cleans up renderer resources', () => {
  assert.match(packageJson.dependencies.three, /^\^0\.\d+\.\d+$/);
  assert.match(canvas, /import\('\.\.\/\.\.\/visuals\/flowCurrentScene\.js'\)/);
  assert.match(canvas, /IntersectionObserver/);
  assert.match(canvas, /ResizeObserver/);
  assert.match(canvas, /cancelAnimationFrame/);
  assert.match(canvas, /prefers-reduced-motion/);
  assert.match(canvas, /scene\?\.dispose\(\)/);
  assert.match(scene, /from 'three'/);
  assert.match(scene, /PointsMaterial/);
  assert.match(scene, /WebGLRenderer/);
  assert.match(scene, /renderer\.dispose\(\)/);
});

test('selectable workflow keeps source-aware language, all five destinations and motion controls', () => {
  assert.equal((workflow.match(/shortLabel:\s*'/g) || []).length, 5);
  for (const action of ['onExplore()', 'onCompare()', 'onAssistant()', 'onIntelligence()']) {
    assert.ok(workflow.includes(action));
  }
  assert.match(workflow, /aria-pressed=\{active === index\}/);
  assert.match(workflow, /aria-live="polite"/);
  assert.match(workflow, /Pause animated data flow/);
  assert.match(workflow, /data-paused=\{!running\}/);
  assert.ok(workflow.includes('not the full NASA repository'));
});

test('mobile scroll, accessible focus, CSS fallback and reduced-motion are present', () => {
  assert.match(css, /overflow-x: auto/);
  assert.match(css, /scroll-snap-type: x proximity/);
  assert.match(css, /\.flow-current-fallback/);
  assert.match(css, /focus-visible/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /scroll-behavior: smooth/);
});
