import { PageHeading } from '../components/ui/PageHeading.jsx';
import { sourceText } from '../utils/formatters.js';
import { AlertCircle, BarChart3, ChevronRight, Eye, Flame, ShieldCheck, Sparkles } from 'lucide-react';

const PATHWAYS = [
  { id:'prevention', icon:<Flame size={18}/>, title:'Prevention & flammability', subtitle:'Material behaviour, flame spread and ignition-related research', terms:['material flammability','flame spread','large-scale fire growth','soot formation','burning rate','ignition'] },
  { id:'detection', icon:<Eye size={18}/>, title:'Detection & smoke behaviour', subtitle:'Smoke particles, aerosols, diagnostics and observation methods', terms:['smoke aerosols','particle sizing','smoke generation','aerosol','diagnostics'] },
  { id:'suppression', icon:<ShieldCheck size={18}/>, title:'Suppression & extinction', subtitle:'Flame extinction, suppressants and burning behaviour', terms:['flame extinction','fire suppressant','suppression','limiting oxygen index','flammability limits'] },
  { id:'modelling', icon:<BarChart3 size={18}/>, title:'Predictive modelling & fundamentals', subtitle:'Simulation, combustion models and fundamental flame behaviour', terms:['computational modelling','cool flames','diffusion flames','soot formation','thermal and convective perturbations'] },
];

function InsightsPage({ records, onOpen, onRank }) {
  return <>
    <PageHeading eyebrow="EVIDENCE-LED EXPLORATION" title="Research pathways" description="Browse the catalogue through space fire-safety research questions. These are SI-generated groupings—not NASA conclusions or operational recommendations." />
    <div className="insight-intro"><div className="insight-intro-icon"><Sparkles size={20}/></div><div><strong>How to use these pathways</strong><p>Each pathway surfaces records whose catalogue titles, objectives, approaches or SI-generated tags relate to that theme. Open each record to inspect the underlying excerpt and its source limitations.</p></div><span className="si-label">SI-GENERATED GROUPING</span></div>
    <div className="pathway-grid">{PATHWAYS.map((pathway)=>{
      const matched = records.filter((record)=>{
        const text = [record.title,sourceText(record.objective),sourceText(record.approach),...(record.topic_tags||[])].join(' ').toLowerCase();
        return pathway.terms.some((term)=>text.includes(term.toLowerCase()));
      });
      return <section className="pathway-card" key={pathway.id}><div className={`pathway-icon pathway-${pathway.id}`}>{pathway.icon}</div><div className="pathway-top"><span className="pathway-overline">RESEARCH PATHWAY</span><span className="pathway-count">{matched.length} records</span></div><h3>{pathway.title}</h3><p>{pathway.subtitle}</p><div className="pathway-records">{matched.slice(0,5).map((record)=><button key={record.id} onClick={()=>onOpen(record)}><span className="record-id">{record.id}</span><span>{record.title}</span><ChevronRight size={14}/></button>)}{matched.length===0&&<span className="muted">No matching record in supplied excerpts.</span>}</div><button className="intel-pathway-link" onClick={() => onRank(pathway.id)}>View explainable ranking <ChevronRight size={16}/></button><div className="pathway-foot">Catalogue theme matching · No risk score calculated</div></section>;
    })}</div>
    <div className="notice-panel"><div className="notice-icon"><AlertCircle size={18}/></div><div><strong>Not a safety recommendation</strong><p>FLARE-X organizes research evidence for exploration. It does not determine whether a material, habitat atmosphere or fire-suppression system is safe for flight.</p></div></div>
  </>;
}

export { InsightsPage };
