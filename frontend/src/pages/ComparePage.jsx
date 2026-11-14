import { PageHeading } from '../components/ui/PageHeading.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { valueOrMissing, sourceText } from '../utils/formatters.js';
import { AlertCircle, BarChart3, Check, Eye, FileSearch, Flame, GitCompareArrows, ShieldCheck, X } from 'lucide-react';

function ComparePage({ records, compareIds, toggleCompare, comparison, error, loading, onRetry, onExplore }) {
  const selectedRecords = compareIds.map((id)=>records.find((record)=>record.id===id)).filter(Boolean);
  const fields = [
    ['Project type','type'], ['Objective','objective'], ['Experimental approach','approach'],
    ['Fuel / material','fuel_material'], ['Hardware / software','hardware_software'], ['Platform','platform'],
    ['Documented conditions','documented_conditions'], ['Oxygen','oxygen'], ['Pressure','pressure'],
    ['Airflow','airflow'], ['Measurements / diagnostics','measurements_or_diagnostics'],
    ['Related investigations','related_investigation_ids'], ['Research themes','topic_tags'], ['Persistent identifier (DOI)','doi']
  ];
  const byId = comparison?.items ? Object.fromEntries(comparison.items.map((item)=>[item.id,item])) : {};
  function cellValue(item, key) {
    if (key==='oxygen'||key==='pressure'||key==='airflow') return valueOrMissing(item.numeric_conditions?.[key]);
    if (key==='objective'||key==='approach') return sourceText(item[key]);
    if (key==='doi') return item.doi || 'Not captured in the supplied record';
    return valueOrMissing(item[key]);
  }
  return <>
    <PageHeading eyebrow="SIDE-BY-SIDE REVIEW" title="Compare investigations" description="Compare two or three catalogue records. Unreported conditions remain visibly unavailable." actions={<button className="secondary-button" onClick={onExplore}><FileSearch size={16}/> Add studies</button>} />
    <section className="panel compare-picker"><div className="panel-heading"><div><h3>Comparison set</h3><p>Select two or three records from the investigation explorer.</p></div><span className="compare-count">{compareIds.length} / 3</span></div><div className="selected-chips">{selectedRecords.length ? selectedRecords.map((record)=><span className="selected-chip" key={record.id}>{record.id}<button onClick={()=>toggleCompare(record.id)} aria-label={`Remove ${record.id}`}><X size={12}/></button></span>) : <span className="muted">No investigations selected yet.</span>}</div><div className="picker-records">{records.slice(0,24).map((record)=><button key={record.id} className={`picker-record ${compareIds.includes(record.id)?'picker-active':''}`} onClick={()=>toggleCompare(record.id)} disabled={!compareIds.includes(record.id)&&compareIds.length>=3}><span className="picker-check">{compareIds.includes(record.id)?<Check size={12}/>:null}</span><span>{record.id}</span><small>{record.title}</small></button>)}</div></section>
    {loading && <div className="data-footnote" role="status">Loading comparison…</div>}
    {error && <div className="error-banner" role="alert"><AlertCircle size={16}/>{error} <button className="secondary-button" onClick={onRetry}>Retry comparison</button></div>}
    {compareIds.length>=2 && comparison && <section className="panel comparison-panel"><div className="panel-heading"><div><h3>Comparison matrix</h3><p>Values reflect the supplied investigation catalogue records.</p></div><span className="verified-note"><ShieldCheck size={14}/> Evidence fields only</span></div><div className="table-scroll"><table className="comparison-table"><thead><tr><th>ATTRIBUTE</th>{comparison.items.map((item)=><th key={item.id}><span className="record-id">{item.id}</span><span className="compare-title">{item.title}</span></th>)}</tr></thead><tbody>{fields.map(([label,key])=><tr key={key}><th>{label}</th>{comparison.items.map((item)=><td key={item.id}>{cellValue(item,key)}</td>)}</tr>)}</tbody></table></div><div className="comparison-note"><AlertCircle size={15}/>{comparison.notice}</div></section>}
    {compareIds.length<2 && <EmptyState icon={<GitCompareArrows size={24}/>} title="Choose at least two investigations" text="Use the compare control on investigation cards, or select records above. You can compare up to three at a time."/>}
  </>;
}

const PATHWAYS = [
  { id:'prevention', icon:<Flame size={18}/>, title:'Prevention & flammability', subtitle:'Material behaviour, flame spread and ignition-related research', terms:['material flammability','flame spread','large-scale fire growth','soot formation','burning rate','ignition'] },
  { id:'detection', icon:<Eye size={18}/>, title:'Detection & smoke behaviour', subtitle:'Smoke particles, aerosols, diagnostics and observation methods', terms:['smoke aerosols','particle sizing','smoke generation','aerosol','diagnostics'] },
  { id:'suppression', icon:<ShieldCheck size={18}/>, title:'Suppression & extinction', subtitle:'Flame extinction, suppressants and burning behaviour', terms:['flame extinction','fire suppressant','suppression','limiting oxygen index','flammability limits'] },
  { id:'modelling', icon:<BarChart3 size={18}/>, title:'Predictive modelling & fundamentals', subtitle:'Simulation, combustion models and fundamental flame behaviour', terms:['computational modelling','cool flames','diffusion flames','soot formation','thermal and convective perturbations'] },
];

export { ComparePage };
