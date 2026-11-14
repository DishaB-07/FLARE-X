/** Evidence-provenance walkthrough. Stages link to existing FLARE-X features. */
import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, ChevronRight, Database, ExternalLink,
  FileSearch, GitCompareArrows, Layers3, Pause, Play, Sparkles,
} from 'lucide-react';
import { NASA_PSI_URL } from '../../config/constants.js';
import { FlowCurrent3D } from './FlowCurrent3D.jsx';

const stages = [
  {
    shortLabel: 'SOURCE',
    title: 'NASA PSI catalogue',
    summary: 'A traceable starting point',
    detail: 'FLARE-X begins with the supplied snapshot of NASA PSI investigation listings. This local catalogue is not the full NASA repository or a set of raw combustion measurements.',
    result: 'Source provenance preserved',
    actionLabel: 'Visit NASA PSI',
    action: 'source',
    Icon: Database,
  },
  {
    shortLabel: 'STRUCTURE',
    title: 'Structure the records',
    summary: '24 searchable investigations',
    detail: 'Titles, investigation types, material mentions and supplied description excerpts are organized into a consistent catalogue. Undocumented fields remain explicitly unavailable.',
    result: 'Consistent metadata for exploration',
    actionLabel: 'Browse investigations',
    action: 'explore',
    Icon: Layers3,
  },
  {
    shortLabel: 'DISCOVER',
    title: 'Explore and compare',
    summary: 'Follow connections across studies',
    detail: 'Find records by PSI ID or research topic, open evidence excerpts and compare up to three investigations side by side without treating ground research as spaceflight observations.',
    result: 'Cross-study research context',
    actionLabel: 'Compare studies',
    action: 'compare',
    Icon: GitCompareArrows,
  },
  {
    shortLabel: 'INTERPRET',
    title: 'Research intelligence',
    summary: 'Understand relevance and gaps',
    detail: 'Explore explainable rankings of investigation relevance and visualize which metadata fields are present. This does not calculate physical fire risk or validate a safety recommendation.',
    result: 'Explainable relevance and coverage',
    actionLabel: 'Open research intelligence',
    action: 'intelligence',
    Icon: FileSearch,
  },
  {
    shortLabel: 'EXPLAIN',
    title: 'Evidence-linked answers',
    summary: 'Ask questions, inspect sources',
    detail: 'The Research Assistant retrieves relevant local catalogue records before responding. Its answer cites those records and notes uncertainty and missing evidence.',
    result: 'Transparent, catalogue-grounded answers',
    actionLabel: 'Ask the Research Assistant',
    action: 'assistant',
    Icon: Sparkles,
  },
];

function ResearchWorkflow({ recordCount, onExplore, onCompare, onAssistant, onIntelligence }) {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const descriptionId = useId();
  const stepsRef = useRef(null);
  useEffect(() => {
    const rail = stepsRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const item = rail.children[active];
    if (!item) return;
    const left = item.offsetLeft + item.offsetWidth / 2 - rail.clientWidth / 2;
    rail.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [active]);
  const selected = stages[active];

  function openStage(action) {
    if (action === 'source') {
      window.open(NASA_PSI_URL, '_blank', 'noopener,noreferrer');
    } else if (action === 'explore') {
      onExplore();
    } else if (action === 'compare') {
      onCompare();
    } else if (action === 'intelligence') {
      onIntelligence();
    } else if (action === 'assistant') {
      onAssistant();
    }
  }

  return (
    <section className="research-flow" data-paused={!running} id="research-workflow" aria-labelledby="research-flow-heading">
      <div className="research-flow-heading">
        <div>
          <span className="research-flow-eyebrow"><span className="flow-status-light"/> THE FLARE-X DATA JOURNEY</span>
          <h2 id="research-flow-heading">Research you can <em>follow.</em></h2>
          <p>Five connected stages transform a catalogue snapshot into evidence-led exploration. Select any stage to see its role.</p>
        </div>
        <div className="research-flow-header-actions">
          <span className="research-flow-total" title="Records in the supplied local catalogue"><Database size={14}/> {recordCount ?? '—'} records</span>
          <button className="flow-motion-button" type="button" aria-label={running ? 'Pause animated data flow' : 'Play animated data flow'} aria-pressed={!running} onClick={() => setRunning((state) => !state)}>
            {running ? <Pause size={14}/> : <Play size={14}/>} <span>{running ? 'Pause motion' : 'Play motion'}</span>
          </button>
        </div>
      </div>

      <div className="flow-stage-area">
        <div className="flow-current" aria-hidden="true">
          <div className="flow-current-fallback"/>
          <div className="flow-current-beam"/>
          <FlowCurrent3D activeStage={active} running={running}/>
          <div className="flow-current-labels"><span>CATALOGUE INPUT</span><span>RESEARCH INSIGHT</span></div>
        </div>
        <div className="research-flow-steps" ref={stepsRef} role="group" aria-label="Five connected research stages">
          {stages.map((stage, index) => {
            const Icon = stage.Icon;
            return (
              <button
                className={`research-flow-step${active === index ? ' is-active' : ''}`}
                type="button"
                key={stage.shortLabel}
                aria-pressed={active === index}
                aria-controls={descriptionId}
                onClick={() => setActive(index)}
              >
                <span className="research-flow-stage-index">{String(index + 1).padStart(2, '0')} <span> / {stage.shortLabel}</span></span>
                <span className="research-flow-icon"><Icon size={20} strokeWidth={1.9}/></span>
                <strong>{stage.title}</strong>
                <span className="research-flow-step-subtitle">{stage.summary}</span>
                <ChevronRight className="research-flow-chevron" size={16} aria-hidden="true"/>
              </button>
            );
          })}
        </div>
        <span className="flow-swipe-hint">Swipe sideways to explore all five stages</span>
      </div>

      <div className="flow-stage-bottom">
        <div className="research-flow-detail" id={descriptionId} role="region" aria-label="Selected workflow stage" aria-live="polite">
          <div className="research-flow-detail-heading">
            <span>STAGE {String(active + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span>
            <span className="research-flow-result"><CheckCircle2 size={14}/> {selected.result}</span>
          </div>
          <h3>{selected.title}</h3>
          <p>{selected.detail}</p>
          <div className="research-flow-detail-actions">
            <button className="research-flow-action" type="button" onClick={() => openStage(selected.action)}>
              {selected.action === 'source' ? <ExternalLink size={15}/> : <ArrowRight size={15}/>}
              {selected.actionLabel}
            </button>
            <button className="research-flow-next" type="button" onClick={() => setActive((index) => (index + 1) % stages.length)}>
              {active === stages.length - 1 ? 'Start again' : 'Next stage'} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
        <div className="flow-progress" aria-label={`Stage ${active + 1} of ${stages.length}`}>
          <div className="flow-progress-head"><span>WORKFLOW PROGRESS</span><strong>{String(active + 1).padStart(2, '0')} <span>/ 05</span></strong></div>
          <div className="flow-progress-track"><span style={{ width: `${((active + 1) / stages.length) * 100}%` }}/></div>
          <p>Data is linked to its source, not treated as a simulated measurement.</p>
          <span className="flow-progress-key"><span className="flow-key-dot"/> Active stage <span className="flow-key-stream"/> Data current</span>
        </div>
      </div>
    </section>
  );
}

export { ResearchWorkflow };
