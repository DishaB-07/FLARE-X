import { useState } from 'react';
import { PageHeading } from '../components/ui/PageHeading.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { InvestigationCard } from '../components/investigations/InvestigationCard.jsx';
import { TYPE_MICRO, TYPE_GROUND } from '../config/constants.js';
import { AlertCircle, ChevronDown, ChevronRight, GitCompareArrows, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';

function ExplorerPage({ records, allCount, query, setQuery, typeFilter, setTypeFilter, topicFilter, setTopicFilter, topics, sort, setSort, compareIds, toggleCompare, onOpen, loading, error, onCompare, searchInputRef }) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  return <>
    <PageHeading eyebrow="NASA PSI / RESEARCH LIBRARY" title="Investigation explorer" description="Search the supplied combustion catalogue, inspect record-level evidence and build a comparison set." actions={<button className="secondary-button" onClick={onCompare}><GitCompareArrows size={16}/> Compare set <span className="button-count">{compareIds.length}/3</span></button>} />
    <div className="explorer-toolbar"><div className="search-field"><Search size={17}/><input ref={searchInputRef} id="explorer-search" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search ID, title, objective, fuel or topic..." aria-label="Search investigations"/>{query && <button aria-label="Clear search" onClick={()=>setQuery('')}><X size={15}/></button>}</div><button className={`filter-toggle ${filtersOpen?'filter-on':''}`} onClick={()=>setFiltersOpen((open)=>!open)}><SlidersHorizontal size={16}/> Filters <ChevronDown size={14}/></button></div>
    {filtersOpen && <div className="filter-row"><label><span>Project type</span><select value={typeFilter} onChange={(event)=>setTypeFilter(event.target.value)}><option value="">All types</option><option value={TYPE_MICRO}>{TYPE_MICRO}</option><option value={TYPE_GROUND}>{TYPE_GROUND}</option></select></label><label><span>Research theme</span><select value={topicFilter} onChange={(event)=>setTopicFilter(event.target.value)}><option value="">All themes</option>{topics.map((topic)=><option key={topic} value={topic}>{topic}</option>)}</select></label><label><span>Sort records</span><select value={sort} onChange={(event)=>setSort(event.target.value)}><option value="id">PSI ID</option><option value="title">Title A–Z</option></select></label><button className="clear-filters" onClick={()=>{setQuery('');setTypeFilter('');setTopicFilter('');setSort('id')}}>Clear filters</button></div>}
    <div className="results-summary"><span><strong>{records.length}</strong> results <span className="muted">of {allCount} catalogue records</span></span><span className="selection-label"><span className="selection-dot"/>{compareIds.length} selected for comparison</span></div>
    {error && <div className="error-banner"><AlertCircle size={16}/>{error}</div>}
    {loading ? <div className="loading-grid">{[1,2,3,4,5,6].map((item)=><div className="loading-card" key={item}/>)}</div> : records.length ? <div className="record-grid">{records.map((record)=><InvestigationCard key={record.id} record={record} selected={compareIds.includes(record.id)} compareDisabled={!compareIds.includes(record.id)&&compareIds.length>=3} onToggle={()=>toggleCompare(record.id)} onOpen={()=>onOpen(record)}/>)}</div> : <EmptyState icon={<Search size={22}/>} title="No matching investigations" text="Try another search term or clear one of the filters."/>}
    {!loading && records.length === 0 && (query || typeFilter || topicFilter) && <button className="secondary-button empty-reset" onClick={() => { setQuery(''); setTypeFilter(''); setTopicFilter(''); }}>Clear search and filters</button>}
    {compareIds.length > 0 && <div className="comparison-tray" role="status"><div className="tray-mark"><GitCompareArrows size={20}/></div><div><strong>{compareIds.length} / 3 studies selected</strong><span>{compareIds.length < 2 ? 'Choose one more to compare evidence side by side.' : 'Your study comparison is ready.'}</span></div><button className="primary-button" disabled={compareIds.length < 2} onClick={onCompare}>Compare studies <ChevronRight size={15}/></button></div>}
    <div className="data-footnote"><Sparkles size={13}/> Research theme tags are SI-generated groupings based on the supplied catalogue excerpts, not official NASA classifications.</div>
  </>;
}

export { ExplorerPage };
