import { PageHeading } from '../components/ui/PageHeading.jsx';
import { ResearchWorkflow } from '../components/research/ResearchWorkflow.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { NASA_PSI_URL } from '../config/constants.js';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Atom, BarChart3, ChevronRight, ClipboardList, Database, ExternalLink, FileSearch, FlaskConical, GitCompareArrows, Layers3, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function OverviewPage({ metadata, records, typeChartData, topicChartData, doiCount, microCount, groundCount, recentIds, loading, onExplore, onOpen, onCompare, onAssistant, onIntelligence }) {
  const recent = recentIds.map((id) => records.find((record) => record.id === id)).filter(Boolean);
  return <>
    <PageHeading eyebrow="SPACE FIRE RESEARCH / OVERVIEW" title="Combustion evidence, made navigable." description="Explore NASA physical-sciences investigation records and trace the evidence behind space fire-safety research." actions={<button className="primary-button" onClick={onExplore}><FileSearch size={16}/> Explore investigations <ChevronRight size={16}/></button>} />
    <section className="hero-panel">
      <div className="hero-grid"/>
      <div className="hero-content">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-marker"/> RESEARCH CATALOGUE CONNECTED</div>
          <h2>Understand the science<br/><span>behind fire in freefall.</span></h2>
          <p>Explore documented combustion research, compare investigations and follow the source evidence behind every insight.</p>
          <div className="hero-actions">
            <button className="hero-button" onClick={onExplore}>Open investigation library <ArrowUpRight size={16}/></button>
            <button className="text-button light" onClick={onAssistant}><Sparkles size={15}/> Ask the assistant <ArrowDownRight size={15}/></button>
          </div>
          <button className="hero-flow-link" type="button" onClick={() => document.getElementById('research-workflow')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })}>
            See how the research flows <ArrowDownRight size={17}/>
          </button>
        </div>
        <div className="hero-snapshot" aria-label="Supplied catalogue snapshot">
          <span className="hero-snapshot-overline">NASA PSI / RESEARCH INDEX</span>
          <strong>Evidence in context.</strong>
          <div className="hero-snapshot-values">
            <div><span>INVESTIGATIONS</span><strong>{metadata?.total ?? records.length}</strong></div>
            <div><span>MICROGRAVITY</span><strong>{microCount}</strong></div>
            <div><span>GROUND</span><strong>{groundCount}</strong></div>
          </div>
          <span className="hero-snapshot-foot"><span/> Catalogue data, not raw experiment measurements</span>
        </div>
      </div>
      <div className="hero-foot"><span><span className="hero-foot-dot"/> NASA PSI catalogue snapshot</span><span>24 records · metadata-first research index</span></div>
    </section>

    <ResearchWorkflow
      recordCount={metadata?.total ?? records.length}
      onExplore={onExplore}
      onCompare={onCompare}
      onAssistant={onAssistant}
      onIntelligence={onIntelligence}
    />

    <section className="launch-grid" aria-label="Choose a research workflow">
      <button className="launch-card launch-explore" onClick={onExplore}>
        <span className="launch-icon"><FileSearch size={20}/></span>
        <span className="launch-number">01 / DISCOVER</span>
        <strong>Explore the catalogue</strong>
        <span>Search 24 supplied investigations by theme, material or PSI ID.</span>
        <ArrowUpRight className="launch-arrow" size={19}/>
      </button>
      <button className="launch-card launch-compare" onClick={onCompare}>
        <span className="launch-icon"><GitCompareArrows size={20}/></span>
        <span className="launch-number">02 / COMPARE</span>
        <strong>Compare research</strong>
        <span>Review up to three investigation records side by side.</span>
        <ArrowUpRight className="launch-arrow" size={19}/>
      </button>
      <button className="launch-card launch-ask" onClick={onAssistant}>
        <span className="launch-icon"><Sparkles size={20}/></span>
        <span className="launch-number">03 / UNDERSTAND</span>
        <strong>Open SI Research Studio</strong>
        <span>Ask, compare studies and create evidence-linked briefs with optional Gemini.</span>
        <ArrowUpRight className="launch-arrow" size={19}/>
      </button>
    </section>

    <button className="intel-overview-cta" onClick={onIntelligence}><span className="intel-overview-icon"><BarChart3 size={23}/></span><span><strong>NEW · Research intelligence</strong><small>Rank investigation relevance, inspect evidence gaps and create source-linked briefs.</small></span><ArrowUpRight size={19}/></button>

    <div className="section-head"><div><div className="eyebrow">CATALOGUE AT A GLANCE</div><h2>Research inventory</h2></div><span className="data-stamp"><Database size={13}/> API catalogue data</span></div>
    <section className="metric-grid">
      <MetricCard icon={<Layers3 size={18}/>} label="Total investigations" value={metadata?.total ?? '—'} detail="Records in supplied catalogue" tone="cyan" loading={loading}/>
      <MetricCard icon={<Atom size={18}/>} label="Microgravity" value={microCount || '—'} detail="Microgravity investigation type" tone="blue" loading={loading}/>
      <MetricCard icon={<FlaskConical size={18}/>} label="Ground investigations" value={groundCount || '—'} detail="Modelling / ground research type" tone="violet" loading={loading}/>
      <MetricCard icon={<ClipboardList size={18}/>} label="DOIs captured" value={doiCount} detail="Identifiers present in local records" tone="amber" loading={loading}/>
    </section>

    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h3>Investigation types</h3><p>Distribution from NASA catalogue project-type labels</p></div><span className="panel-icon"><BarChart3 size={17}/></span></div>
        {typeChartData.length ? <div className="type-chart-wrap"><div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={typeChartData} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="91%" paddingAngle={4} stroke="none">{typeChartData.map((entry, index) => <Cell key={entry.name} fill={['#41d5e8', '#7887ff', '#ab7cf6'][index % 3]}/>)}</Pie><Tooltip contentStyle={{background:'#101d2d',border:'1px solid #263a50',borderRadius:10,color:'#e9f3ff'}}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{metadata?.total ?? 0}</strong><span>STUDIES</span></div></div><div className="chart-legend">{typeChartData.map((item,index)=><div className="legend-row" key={item.name}><span className={`legend-swatch swatch-${index}`}/><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></div> : <EmptyState text="Chart will appear when catalogue data is available."/>}
      </section>
      <section className="panel chart-panel"><div className="panel-heading"><div><h3>Frequent research themes</h3><p>SI-generated tags counted across the 24 records</p></div><span className="panel-icon"><Sparkles size={17}/></span></div>
        {topicChartData.length ? <div className="bar-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={topicChartData} layout="vertical" margin={{top:4,right:12,bottom:0,left:8}}><CartesianGrid stroke="#203246" horizontal={false}/><XAxis type="number" allowDecimals={false} tick={{fill:'#cadbe7',fontSize:13}} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="topic" width={155} tick={{fill:'#e0eaf2',fontSize:13}} axisLine={false} tickLine={false}/><Tooltip cursor={{fill:'rgba(78,205,225,.08)'}} contentStyle={{background:'#101d2d',border:'1px solid #263a50',borderRadius:10,color:'#e9f3ff'}}/><Bar dataKey="count" name="Records" fill="#45c9df" radius={[0,5,5,0]} barSize={13}/></BarChart></ResponsiveContainer></div> : <EmptyState text="Research themes will appear when catalogue data is available."/>}
      </section>
    </div>

    <section className="notice-panel"><div className="notice-icon"><AlertCircle size={18}/></div><div><strong>Interpret the catalogue carefully</strong><p>This local dataset contains catalogue excerpts, not the complete PSI research papers or raw experimental files. Missing conditions are shown as unavailable—not as zero or proof that an experiment did not study them.</p></div><button className="notice-link" onClick={() => window.open(NASA_PSI_URL, '_blank', 'noopener,noreferrer')}>Open NASA PSI <ExternalLink size={13}/></button></section>

    {recent.length > 0 && <section className="panel recent-panel"><div className="panel-heading"><div><h3>Recently opened</h3><p>Records explored in this session</p></div></div><div className="recent-list">{recent.map((record)=><button key={record.id} className="recent-item" onClick={()=>onOpen(record)}><span className="record-id">{record.id}</span><span>{record.title}</span><ChevronRight size={15}/></button>)}</div></section>}
  </>;
}



function MetricCard({ icon, label, value, detail, tone, loading }) {
  return <div className={`metric-card metric-${tone}`}><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span></div><div className="metric-value">{loading ? <span className="skeleton-value"/> : value}</div><div className="metric-detail">{detail}</div></div>;
}

export { OverviewPage };
