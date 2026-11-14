import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, BookOpen, Check, ExternalLink, FileSearch } from 'lucide-react';
import { PSI_SEARCH_URL as PSI_SEARCH } from '../config/constants.js';
import { apiGet } from '../services/api.js';

export function CitationsPage({ apiBase, onOpenRecord }) {
  const [audit, setAudit] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('confirmed');
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    apiGet('/api/citations', controller.signal, apiBase).then(setAudit).catch((reason) => {if (reason.name !== 'AbortError') setError(reason.message);}).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [apiBase, retryToken]);
  const items = (audit?.items || []).filter((item) => filter === 'all' || item.status === (filter === 'confirmed' ? 'confirmed_nasa_psi' : 'needs_verification'));
  return <div className="intel-page"><div className="page-heading"><div><div className="eyebrow">SOURCE PROVENANCE / MANUAL AUDIT</div><h1>Check the source, not just the summary.</h1><p>Trace six independently checked PSI investigation DOI records and official NASA background links for the other eighteen.</p></div></div>
    <div className="intel-boundary"><BookOpen size={20}/><p><strong>Citation scope:</strong> These 24 investigations are a historical catalogue snapshot, not a live search total. Confirmation means the PSI ID, investigation title, and investigation DOI appeared on the indexed NASA PSI page. NASA programme links for the remaining 18 corroborate the research topics, but do not verify each PSI identifier, investigation DOI or citation control. No raw datasets or papers were downloaded.</p></div>
    {error && <div className="intel-error" role="alert">{error} <button type="button" className="secondary-button" onClick={() => setRetryToken((n) => n + 1)}>Retry</button></div>}
    {loading && <p className="intel-loading" role="status">Loading source audit…</p>}
    {audit && <><div className="intel-citation-summary"><div><strong>{audit.confirmed}</strong><span>NASA PSI pages confirmed</span></div><div><strong>{audit.remaining}</strong><span>DOIs not independently verified</span></div><div><strong>{audit.checked_on}</strong><span>Verification date</span></div></div>
      <div className="intel-tabs" role="group" aria-label="Citation verification filter"><button aria-pressed={filter==='confirmed'} className={filter==='confirmed'?'is-active':''} onClick={()=>setFilter('confirmed')}>Confirmed</button><button aria-pressed={filter==='pending'} className={filter==='pending'?'is-active':''} onClick={()=>setFilter('pending')}>Needs verification</button><button aria-pressed={filter==='all'} className={filter==='all'?'is-active':''} onClick={()=>setFilter('all')}>All records</button></div>
      <div className="intel-citation-list">{items.map((item) => <article className="intel-citation-card" key={item.id}><div><div className="intel-rank-meta"><span className="record-id">{item.id}</span>{item.status === 'confirmed_nasa_psi' ? <span className="intel-verified"><Check size={13}/> NASA PSI page confirmed</span> : <span>Not independently verified</span>}</div><h3>{item.title}</h3><p>{item.doi ? `Investigation DOI: ${item.doi}${item.doi_origin === 'local_catalogue_only' ? ' (only from local capture)' : ''}` : 'Investigation DOI not captured or verified.'}</p><small>{item.verification_scope}</small>{item.nasa_program_context_note && <p className="intel-source-context"><strong>NASA programme context:</strong> {item.nasa_program_context_note}</p>}</div><div className="intel-citation-actions"><button className="secondary-button" onClick={() => onOpenRecord(item.id)}><FileSearch size={15}/> Inspect</button>{item.status === 'confirmed_nasa_psi' && item.landing_page_url ? <a className="secondary-button" href={item.landing_page_url} target="_blank" rel="noreferrer">NASA PSI page <ExternalLink size={14}/></a> : <a className="secondary-button" href={audit?.repository_search_url || PSI_SEARCH} target="_blank" rel="noreferrer">Open PSI search <ArrowUpRight size={14}/></a>}{item.nasa_program_context_url && <a className="secondary-button" href={item.nasa_program_context_url} target="_blank" rel="noreferrer">NASA background <ExternalLink size={14}/></a>}</div></article>)}</div>
      <div className="intel-method"><AlertCircle size={16}/><p>{audit.notice} For an authoritative bibliography, open the investigation and use its “Cite this Investigation” control.</p></div>
    </>}
  </div>;
}
