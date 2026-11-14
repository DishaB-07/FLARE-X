import { Activity, Atom, BarChart3, CircleHelp, Database, ExternalLink, FileSearch, Flame, GitCompareArrows, MessageSquareText, ShieldCheck, X } from 'lucide-react';
import { NASA_PSI_URL } from '../../config/constants.js';

export function Sidebar({ mobileNavOpen, onClose, activePage, navigate, compareCount }) {
  return (
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Flame size={21} strokeWidth={2.2} /></div>
          <div><div className="brand-name">FLARE<span>-X</span></div><div className="brand-caption">SPACE FIRE INTELLIGENCE</div></div>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => onClose()}><X size={18} /></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <NavButton icon={<Activity size={17}/>} label="Overview" active={activePage === 'overview'} onClick={() => navigate('overview')} />
          <NavButton icon={<FileSearch size={17}/>} label="Investigation explorer" active={activePage === 'explorer'} onClick={() => navigate('explorer')} />
          <NavButton icon={<BarChart3 size={17}/>} label="Research intelligence" active={activePage === 'intelligence'} onClick={() => navigate('intelligence')} />
          <NavButton icon={<GitCompareArrows size={17}/>} label="Compare studies" active={activePage === 'compare'} count={compareCount || null} onClick={() => navigate('compare')} />
          <NavButton icon={<MessageSquareText size={17}/>} label="SI Research Studio" active={activePage === 'assistant'} onClick={() => navigate('assistant')} />
          <NavButton icon={<ShieldCheck size={17}/>} label="Research pathways" active={activePage === 'insights'} onClick={() => navigate('insights')} />
        </nav>
        <div className="sidebar-divider" />
        <div className="workspace-label">REFERENCE</div>
        <a className="nav-link external-nav" href={NASA_PSI_URL} target="_blank" rel="noreferrer"><Database size={17}/> NASA PSI repository <ExternalLink size={13}/></a>
        <button className={`nav-link ${activePage === 'citations' ? 'active' : ''}`} onClick={() => navigate('citations')}><ShieldCheck size={17}/> Source verification</button>
        <button className={`nav-link ${activePage === 'about' ? 'active' : ''}`} onClick={() => navigate('about')}><CircleHelp size={17}/> About this platform</button>
        <div className="sidebar-bottom">
          <div className="source-mini"><div className="source-mini-icon"><Atom size={17}/></div><div><strong>NASA PSI catalogue</strong><span>24 supplied records</span></div></div>
          <div className="sidebar-footnote">Independent research exploration prototype. Not a flight-safety certification tool.</div>
        </div>
      </aside>
  );
}

function NavButton({ icon, label, active, onClick, count }) {
  return <button className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} onClick={onClick}>{icon}<span>{label}</span>{count ? <em>{count}</em> : null}</button>;
}

