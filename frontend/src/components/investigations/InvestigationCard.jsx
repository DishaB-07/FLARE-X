import { TYPE_MICRO } from '../../config/constants.js';
import { sourceText } from '../../utils/formatters.js';
import { Check, ChevronRight, GitCompareArrows } from 'lucide-react';

function InvestigationCard({ record, selected, compareDisabled, onToggle, onOpen }) {
  return <article className={`investigation-card ${selected?'selected-card':''}`}><div className="card-topline"><span className="record-id">{record.id}</span><span className={`type-tag ${record.type===TYPE_MICRO?'type-micro':'type-ground'}`}>{record.type===TYPE_MICRO?'MICROGRAVITY':'GROUND'}</span></div><button className="card-title-button" onClick={onOpen}><h3>{record.title}</h3><ChevronRight size={16}/></button><p className="card-excerpt">{sourceText(record.objective)}</p><div className="tag-list">{(record.topic_tags||[]).slice(0,3).map((tag)=><span className="topic-tag" key={tag}>{tag}</span>)}</div><div className="card-bottom"><span className={`completeness ${String(record.source_completeness||'').includes('truncated')?'is-excerpt':'is-record'}`}><span/> {String(record.source_completeness||'').includes('truncated')?'Catalogue excerpt':'Record text'}</span><button className={`compare-check ${selected?'checked':''}`} disabled={compareDisabled} onClick={onToggle} title={selected?'Remove from comparison':compareDisabled?'Maximum of 3 studies selected':'Add to comparison'}>{selected?<Check size={14}/>:<GitCompareArrows size={14}/>}<span>{selected?'Selected':'Compare'}</span></button></div></article>;
}

export { InvestigationCard };
