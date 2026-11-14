import { useEffect, useState } from 'react';
import { BookOpen, CheckCheck, Clipboard, Database, GitCompareArrows, Info, LoaderCircle, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useSIWorkbench } from '../../hooks/useSIWorkbench.js';
import { apiGet } from '../../services/api.js';
import { EvidenceCard } from './EvidenceCard.jsx';

const THEMES = [
  ['prevention', 'Prevention and materials'],
  ['detection', 'Smoke and detection'],
  ['suppression', 'Suppression and extinction'],
  ['modelling', 'Computational modelling'],
];

function ModelStatus({ output }) {
  if (!output) return <span className="si-status-muted"><Database size={15}/> Retrieval-first · Gemini optional</span>;
  return <span className={`si-mode-badge ${output.mode === 'gemini' ? 'si-mode-gemini' : 'si-mode-catalogue'}`}>
    {output.mode === 'gemini' ? <Sparkles size={15}/> : <Database size={15}/>}
    {output.mode === 'gemini' ? 'Gemini-assisted' : 'Catalogue fallback'}
  </span>;
}

function ComparisonMatrix({ comparison }) {
  if (!comparison) return null;
  return <div className="si-matrix-wrap">
    <div className="si-subhead"><GitCompareArrows size={17}/><h3>Captured catalogue fields</h3></div>
    <div className="si-scroll-matrix" tabIndex="0" aria-label="Side-by-side comparison data, horizontally scrollable">
      <table className="si-matrix"><thead><tr><th scope="col">Field</th>{comparison.ids.map((id) => <th key={id} scope="col">{id}</th>)}</tr></thead>
        <tbody>{comparison.rows.map((row) => <tr key={row.key}><th scope="row">{row.label}{row.shared && <small className="si-shared">Shared</small>}</th>{row.values.map((entry) => <td key={entry.id} className={row.has_missing && entry.value.startsWith('Not available') ? 'si-not-captured' : ''}>{entry.value}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <p className="si-small-note"><Info size={15}/>{comparison.method}</p>
  </div>;
}

function BriefSections({ brief }) {
  if (!brief) return null;
  return <section className="si-brief-grid" aria-label="Structured research brief">
    <div><span className="si-field-label">Research question</span><p>{brief.research_question}</p></div>
    <div><span className="si-field-label">Proposed follow-up</span><p>{brief.recommended_next_step}</p></div>
    <div className="si-brief-wide"><span className="si-field-label">Relevant source records</span><div className="si-record-tags">{brief.records.map((record) => <span key={record.id} title={record.title}>{record.id}</span>)}</div></div>
  </section>;
}

export function SIWorkbench({ apiBase, task, records, onOpenRecord }) {
  const { ids, changeId, theme, setTheme, question, setQuestion, busy, error, output, execute } = useSIWorkbench(apiBase);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [output]);
  const [providerStatus, setProviderStatus] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    apiGet('/api/assistant/status', controller.signal, apiBase).then(setProviderStatus).catch(() => {});
    return () => controller.abort();
  }, [apiBase]);
  const isCompare = task === 'compare';
  const hasRecords = records.length >= 2;
  const selected = ids.filter(Boolean);
  const validComparison = selected.length >= 2 && new Set(selected).size === selected.length;
  const canRun = !busy && (isCompare ? hasRecords && validComparison : true);

  async function copyAnalysis() {
    if (!output) return;
    try {
      const text = [output.answer, 'Evidence: ' + output.evidence.map((entry) => entry.id).join(', '), output.notice, 'Source: https://psi.nasa.gov/'].join('\n\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch { setCopied(false); }
  }

  return <div className="si-workbench" key={task}>
    <div className="si-workbench-head">
      <div className="si-workbench-icon">{isCompare ? <GitCompareArrows size={24}/> : <BookOpen size={24}/>}</div>
      <div><div className="eyebrow">SI / RETRIEVAL FIRST</div><h2>{isCompare ? 'Cross-investigation analysis' : 'Evidence-linked research brief'}</h2><p>{isCompare ? 'Compare documented facts across selected investigations without inventing experimental outcomes.' : 'Turn a research theme into a sourced starting brief and identify what still needs verification.'}</p><p className="si-provider-note">{providerStatus === null ? 'Gemini is optional; local catalogue analysis is always available.' : providerStatus.gemini_configured ? 'Gemini API key configured. Connection is only confirmed when a Gemini response succeeds.' : 'Catalogue mode available. Configure GEMINI_API_KEY in the backend to enable Gemini synthesis.'}</p></div>
    </div>
    <div className="si-workbench-grid">
      <form className="si-controls" onSubmit={(event) => { event.preventDefault(); execute(task); }}>
        <div className="si-field-label">{isCompare ? 'Select investigations to compare' : 'Choose a research direction'}</div>
        {isCompare ? <div className="si-select-grid">
          {ids.map((id, index) => <label key={index}><span>{index < 2 ? `Study ${index + 1}` : 'Optional third study'}</span><select value={id} onChange={(event) => changeId(index, event.target.value)}><option value="">{index === 2 ? 'No third study' : 'Choose a PSI record'}</option>{records.map((record) => <option value={record.id} key={record.id}>{record.id} — {record.title}</option>)}</select></label>)}
        </div> : <div className="si-theme-pills" role="group" aria-label="Research direction">{THEMES.map(([value, label]) => <button key={value} type="button" aria-pressed={theme === value} className={theme === value ? 'is-active' : ''} onClick={() => setTheme(value)}>{label}</button>)}</div>}
        <label className="si-question-label"><span className="si-field-label">Optional focus question</span><textarea maxLength={500} rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={isCompare ? 'Example: How do these studies differ in fuel materials and methods?' : 'Example: What research is relevant to spacecraft material flammability?'} /></label>
        {isCompare && !validComparison && <p className="si-input-note">Select at least two different PSI records.</p>}
        <div className="si-run-row"><button type="submit" className="primary-button si-run-button" disabled={!canRun}>{busy ? <LoaderCircle className="spin" size={18}/> : <Sparkles size={18}/>} {busy ? 'Retrieving and checking…' : isCompare ? 'Compare evidence' : 'Generate research brief'}</button><span>Sources retrieved before AI synthesis</span></div>
        {error && <div className="assistant-error" role="alert">{error} <button type="button" onClick={() => execute(task)}>Retry</button></div>}
      </form>
      <div className="si-process">
        <div><Database size={19}/><span><strong>01 · Retrieve</strong><small>Selected PSI catalogue records</small></span></div>
        <div><SearchCheck size={19}/><span><strong>02 · Compare / structure</strong><small>Known fields versus unavailable data</small></span></div>
        <div><Sparkles size={19}/><span><strong>03 · Synthesize</strong><small>Gemini if configured, local fallback otherwise</small></span></div>
        <div><ShieldCheck size={19}/><span><strong>04 · Inspect</strong><small>Citations, numeric guardrails and evidence links</small></span></div>
      </div>
    </div>
    {busy && <div className="si-loading" role="status"><LoaderCircle className="spin" size={22}/> Reading selected catalogue excerpts and preparing the analysis…</div>}
    {output && <section className="si-output" aria-live="polite">
      <div className="si-output-top"><div><div className="eyebrow">GROUNDED ANALYSIS</div><h2>{isCompare ? 'Comparison findings' : 'Research brief'}</h2></div><div className="si-output-actions"><ModelStatus output={output}/><button type="button" className="secondary-button" onClick={copyAnalysis}>{copied ? <CheckCheck size={16}/> : <Clipboard size={16}/>} {copied ? 'Copied' : 'Copy summary'}</button></div></div>
      <div className="si-explanation">{output.answer.split('\n\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      {isCompare ? <ComparisonMatrix comparison={output.comparison}/> : <BriefSections brief={output.brief}/>}
      <div className="si-validation"><ShieldCheck size={19}/><div><strong>Evidence check</strong><p>{output.notice}</p><p>Validation: {output.validation?.level?.replaceAll('_', ' ')}. Automated checks do not independently verify scientific claims or full-text results.</p></div></div>
      <div className="si-evidence-heading"><div><div className="eyebrow">TRACEABLE EVIDENCE</div><h3>Retrieved PSI records</h3><p>Inspect the original excerpts before citing or interpreting results.</p></div><span>{output.evidence.length} records</span></div>
      <div className="si-evidence-grid">{output.evidence.map((item) => <EvidenceCard key={item.id} item={item} onOpenRecord={onOpenRecord}/>)}</div>
    </section>}
    {!output && !busy && <div className="si-idle"><Info size={18}/> Select your inputs and run an analysis. Results include the source records and explicit limitations. This is a research assistant, not a spacecraft fire-risk calculator.</div>}
  </div>;
}
