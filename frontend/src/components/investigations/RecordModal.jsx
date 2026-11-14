import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NASA_PSI_URL, TYPE_MICRO, TYPE_GROUND } from '../../config/constants.js';
import { valueOrMissing, sourceText } from '../../utils/formatters.js';
import { Activity, AlertCircle, ArrowRight, ArrowUpRight, Atom, Check, ChevronRight, Copy, Database, FileSearch, FlaskConical, Gauge, Microscope, Search, ShieldCheck, Sparkles, Wind, X } from 'lucide-react';

function RecordModal({ record, citation, onClose, onOpenRelated, onAsk, easyRead }) {
  const num = record.numeric_conditions || {};
  const sourceComplete = !String(record.source_completeness || '').includes('truncated');
  const verified = citation?.status === 'confirmed_nasa_psi';
  const verifiedUrl = verified && citation?.landing_page_url ? citation.landing_page_url : NASA_PSI_URL;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const contentRef = useRef(null);
  const exitTimer = useRef(null);
  const closeCallbackRef = useRef(onClose);
  const [closing, setClosing] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  closeCallbackRef.current = onClose;

  function requestClose() {
    if (exitTimer.current !== null) return;
    setClosing(true);
    exitTimer.current = window.setTimeout(() => closeCallbackRef.current(), 200);
  }

  useEffect(() => {
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        // The handler reads the current dialog without capturing old record props.
        if (exitTimer.current === null) {
          setClosing(true);
          exitTimer.current = window.setTimeout(() => closeCallbackRef.current(), 200);
        }
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = oldOverflow;
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setCopyMessage('');
  }, [record.id]);

  async function copyReference() {
    const reference = `${record.id} — ${record.title}\n${verified ? verifiedUrl : 'NASA Physical Sciences Informatics repository: ' + NASA_PSI_URL}`;
    try {
      await navigator.clipboard.writeText(reference);
      setCopyMessage('Reference copied');
    } catch {
      setCopyMessage('Clipboard unavailable — use the source link below');
    }
  }

  function scrollToSection(id) {
    contentRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  return createPortal(
    <div className={`record-modal-backdrop ${easyRead ? 'reading-mode' : ''} ${closing ? 'is-closing' : ''}`} onMouseDown={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
      <section ref={dialogRef} className={`record-modal ${closing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="record-modal-title" aria-describedby="record-modal-description" tabIndex={-1}>
        <header className="record-modal-header">
          <div className="record-modal-topline">
            <div className="record-modal-identity"><span className="record-id">{record.id}</span><span className="record-modal-classification">NASA PSI / CATALOGUE RECORD</span></div>
            <button ref={closeRef} type="button" className="record-modal-close" onClick={requestClose} aria-label={`Close ${record.id} details`} title="Close details (Esc)"><X size={20}/></button>
          </div>
          <h2 id="record-modal-title">{record.title}</h2>
          <div className="record-modal-meta">
            <span className={`type-tag ${record.type === TYPE_MICRO ? 'type-micro' : 'type-ground'}`}>{record.type}</span>
            <span className={`record-modal-source-pill ${verified ? 'verified' : ''}`}>{verified ? <ShieldCheck size={14}/> : <AlertCircle size={14}/>} {verified ? 'NASA landing page verified' : 'Citation verification pending'}</span>
            <span className={`completeness ${sourceComplete ? 'is-record' : 'is-excerpt'}`}><span/>{sourceComplete ? 'Source text captured' : 'Catalogue excerpt'}</span>
          </div>
          <p className="sr-only" id="record-modal-description">Investigation details from the supplied NASA PSI catalogue. Press Escape to close.</p>
          <nav className="record-modal-section-nav" aria-label="Jump to a section in this record">
            <button type="button" onClick={() => scrollToSection('record-research')}>Overview</button>
            <button type="button" onClick={() => scrollToSection('record-conditions')}>Evidence &amp; conditions</button>
            <button type="button" onClick={() => scrollToSection('record-source')}>Source &amp; citation</button>
          </nav>
        </header>

        <div className="record-modal-scroll" ref={contentRef}>
          <div className="record-modal-summary" id="record-research">
            <div className="record-modal-summary-copy">
              <div className="eyebrow">RESEARCH SNAPSHOT</div>
              <h3>What this investigation covers</h3>
              <p>Use the source excerpts and documented conditions below to understand the scope of this study. FLARE-X does not infer missing measurements or experimental results.</p>
              <div className="record-modal-summary-facts">
                <span><Microscope size={16}/> {valueOrMissing(record.research_area)}</span>
                <span><FlaskConical size={16}/> {record.type === TYPE_GROUND ? 'Ground research / modelling' : 'Microgravity investigation'}</span>
              </div>
            </div>
            <div className="record-modal-diagram" role="img" aria-label="Illustration of the FLARE-X evidence workflow: study context, catalogue excerpts, and evidence review. Not an experimental simulation.">
              <span className="record-modal-diagram-caption">EVIDENCE WORKFLOW · CONCEPTUAL</span>
              <div className="record-modal-diagram-nodes"><span><FlaskConical size={22}/><small>Context</small></span><ArrowRight size={17}/><span><Database size={22}/><small>Excerpt</small></span><ArrowRight size={17}/><span><FileSearch size={22}/><small>Review</small></span></div>
              <span className="record-modal-diagram-foot">Traceable catalogue metadata · No calculated risk</span>
            </div>
          </div>

          <div className="record-modal-columns">
            <div className="record-modal-main-column">
              <section className="record-modal-section"><div className="eyebrow">INVESTIGATION OBJECTIVE</div><p className="record-modal-prose">{sourceText(record.objective)}</p></section>
              <section className="record-modal-section"><div className="eyebrow">EXPERIMENTAL APPROACH</div><p className="record-modal-prose">{sourceText(record.approach)}</p></section>
              <section className="record-modal-section"><div className="eyebrow">RESEARCH CONTEXT</div><div className="record-modal-rows"><DetailRow label="Research area" value={record.research_area}/><DetailRow label="Project type" value={record.type}/><DetailRow label="Fuel / material" value={record.fuel_material}/><DetailRow label="Platform" value={record.platform}/><DetailRow label="Hardware / software" value={record.hardware_software}/></div></section>
            </div>
            <div className="record-modal-side-column">
              <section className="record-modal-panel" id="record-conditions">
                <div className="record-modal-panel-heading"><Activity size={17}/><div><div className="eyebrow">EVIDENCE &amp; CONDITIONS</div><h3>What is documented?</h3></div></div>
                <div className="record-modal-condition-grid">
                  <ConditionTile icon={<Atom size={19}/>} label="Oxygen" value={num.oxygen}/>
                  <ConditionTile icon={<Gauge size={19}/>} label="Pressure" value={num.pressure}/>
                  <ConditionTile icon={<Wind size={19}/>} label="Airflow" value={num.airflow}/>
                </div>
                <p className="record-modal-data-caution"><AlertCircle size={15}/> Unavailable means not documented in this catalogue capture, not a zero measurement.</p>
                {Object.entries(num).filter(([, condition]) => condition && typeof condition === 'object' && condition.basis).map(([key, condition]) => <p className="record-modal-value-basis" key={key}><strong>{key} context:</strong> {condition.basis}</p>)}
                <div className="record-modal-rows"><DetailRow label="Reported conditions" value={record.documented_conditions}/><DetailRow label="Measurements / diagnostics" value={record.measurements_or_diagnostics}/></div>
              </section>
              <section className="record-modal-panel"><div className="eyebrow">RESEARCH THEMES <span className="si-inline">SI-GENERATED</span></div><div className="tag-list">{(record.topic_tags || []).map((tag) => <span className="topic-tag" key={tag}>{tag}</span>)}{!record.topic_tags?.length && <span className="muted">Not available in the provided source</span>}</div></section>
              {record.related_investigation_ids?.length > 0 && <section className="record-modal-panel"><div className="eyebrow">RELATED INVESTIGATIONS</div><div className="related-buttons">{record.related_investigation_ids.map((id) => <button key={id} onClick={() => onOpenRelated(id)}>{id}<ChevronRight size={15}/></button>)}</div></section>}
              <section className="record-modal-panel record-modal-citation" id="record-source"><div className="record-modal-panel-heading"><ShieldCheck size={18}/><div><div className="eyebrow">SOURCE &amp; CITATION</div><h3>Trace this record</h3></div></div><p>{verified ? `NASA PSI landing page confirmed · investigation DOI: ${citation.doi}` : record.doi ? `DOI captured in local catalogue; not independently verified: ${record.doi}` : 'Investigation DOI not verified in this project.'}</p><a className="inline-link" href={verifiedUrl} target="_blank" rel="noreferrer">{verified ? 'Open verified NASA PSI investigation' : 'Search NASA PSI for this investigation'} <ArrowUpRight size={15}/></a><p className="record-modal-citation-hint">For an authoritative citation, use the investigation's “Cite this Investigation” control on NASA PSI. No DOI or landing page has been guessed.</p><button className="record-modal-copy" type="button" onClick={copyReference}><Copy size={14}/> Copy PSI reference</button>{copyMessage && <p className="record-modal-copy-message" role="status">{copyMessage}</p>}</section>
            </div>
          </div>
        </div>
        <footer className="record-modal-footer">
          <span className="record-modal-footnote"><Database size={15}/>{record.data_availability || 'Data availability not verified'} <span className="record-modal-foot-separator">·</span> Research exploration only</span>
          <div className="record-modal-actions"><button className="secondary-button" onClick={onAsk}><Sparkles size={16}/> Ask assistant</button><button className="primary-button" onClick={requestClose}>Done <Check size={16}/></button></div>
        </footer>
      </section>
    </div>, document.body
  );
}


function ConditionTile({ icon, label, value }) {
  const available = value !== null && value !== undefined && value !== '' && (typeof value !== 'object' || value.value !== null && value.value !== undefined && value.value !== '');
  return <div className={`record-modal-condition ${available ? 'has-value' : 'is-missing'}`}><div className="record-modal-condition-label">{icon}<span>{label}</span></div><strong>{available ? valueOrMissing(value) : 'Not documented'}</strong><small>{available ? 'Captured value · verify context' : 'In supplied catalogue'}</small></div>;
}


function DetailRow({label,value}) { return <div className="detail-row"><span>{label}</span><strong>{valueOrMissing(value)}</strong></div>; }

export { RecordModal };
