import { useState } from 'react';
import { AlertCircle, BookOpen, ChevronRight, Database, GitCompareArrows, Search, ShieldCheck } from 'lucide-react';
import { useResearchData } from '../hooks/useResearchData.js';
import { ResearchBrief } from '../components/research/ResearchBrief.jsx';
import { CoveragePanel } from '../components/research/CoveragePanel.jsx';

const THEMES = [
  { id: 'prevention', label: 'Prevention', detail: 'Materials and fire spread' },
  { id: 'detection', label: 'Detection', detail: 'Smoke and aerosols' },
  { id: 'suppression', label: 'Suppression', detail: 'Extinction and limits' },
  { id: 'modelling', label: 'Modelling', detail: 'Analysis and validation' },
];
export function ResearchIntelligence({ apiBase, selectedTheme, onThemeChange, onOpenRecord, onCompare }) {
  const { ranking, coverage, brief, busy, error, retry } = useResearchData(apiBase, selectedTheme);
  const [tab, setTab] = useState('ranking');
  return <div className="intel-page">
    <div className="page-heading"><div><div className="eyebrow">RESEARCH INTELLIGENCE / SOURCE-BOUNDED</div><h1>Find the evidence behind the question.</h1><p>Explainable research relevance, evidence coverage and carefully qualified research implications from 24 NASA PSI catalogue records.</p></div></div>
    <div className="intel-boundary"><ShieldCheck size={21}/><p><strong>Research relevance ≠ fire risk.</strong> Ranking scores are text-match points, not measured probabilities, scientific quality scores, or certified safety recommendations. No raw experiment files were ingested.</p></div>
    <div className="intel-theme-grid" aria-label="Research focus">
      {THEMES.map((theme) => <button key={theme.id} className={`intel-theme ${selectedTheme === theme.id ? 'is-active' : ''}`} aria-pressed={selectedTheme === theme.id} onClick={() => onThemeChange(theme.id)}><strong>{theme.label}</strong><span>{theme.detail}</span></button>)}
    </div>
    <div className="intel-tabs" role="group" aria-label="Research intelligence views"><button aria-pressed={tab === 'ranking'} className={tab === 'ranking' ? 'is-active' : ''} onClick={() => setTab('ranking')}><Search size={16}/> Ranked studies</button><button aria-pressed={tab === 'gaps'} className={tab === 'gaps' ? 'is-active' : ''} onClick={() => setTab('gaps')}><Database size={16}/> Evidence gaps</button></div>
    {error && <div className="intel-error" role="alert"><AlertCircle size={17}/>{error} <button className="secondary-button" onClick={retry}>Retry</button></div>}
    {busy && <p className="intel-loading">Loading catalogue-based evidence…</p>}
    {!busy && !error && ranking && tab === 'ranking' && <>
      <section className="intel-panel intel-question"><div className="intel-eyebrow">SI-ASSISTED RESEARCH INTERPRETATION</div><h2>{ranking.pathway.title}</h2><p className="intel-question-main">{ranking.pathway.question}</p><p><strong>Potential use:</strong> {ranking.pathway.implication}</p><p><strong>What to verify next:</strong> {ranking.pathway.next_step}</p></section>
      <div className="intel-results-title"><div><h2>{ranking.total_matching} matching investigations</h2><p>Ordered by transparent, repeatable keyword matching. Open a record to review its original captured excerpt.</p></div><button className="secondary-button" onClick={onCompare}><GitCompareArrows size={16}/> Compare selected studies</button></div>
      <div className="intel-rank-list">{ranking.items.map((item, index) => <article className="intel-rank-card" key={item.id}>
        <div className="intel-rank-index">{String(index + 1).padStart(2, '0')}</div>
        <div className="intel-rank-body"><div className="intel-rank-meta"><span className="record-id">{item.id}</span><span>{item.type}</span>{String(item.source_completeness).includes('truncated') && <span>Truncated source excerpt</span>}</div><h3>{item.title}</h3><p className="intel-why">{item.why_relevant}</p><div className="intel-rank-actions"><button className="secondary-button" onClick={() => onOpenRecord(item.id)}>Inspect evidence <ChevronRight size={15}/></button></div></div>
        <div className="intel-match"><strong>{item.score}</strong><span>match points</span></div>
      </article>)}</div>
      {!ranking.items.length && <div className="intel-panel"><p>No catalogue excerpts matched this pathway's terms. This does not indicate an absence of relevant NASA research.</p></div>}
      <div className="intel-method"><BookOpen size={17}/><p><strong>How the ranking works:</strong> {ranking.method} {ranking.notice}</p></div>
      <ResearchBrief brief={brief}/>
    </>}
    {!busy && !error && coverage && tab === 'gaps' && <CoveragePanel coverage={coverage}/>} 
  </div>;
}

