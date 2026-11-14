import { ChevronRight, Menu, Search, Type } from 'lucide-react';
import { PAGE_TITLES } from '../../config/constants.js';

export function Topbar({ activePage, openNavigation, onFind, easyRead, setEasyRead, apiStatus }) {
  return (
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => openNavigation()}><Menu size={20}/></button>
          <div className="breadcrumbs"><span>FLARE-X</span><ChevronRight size={14}/><strong>{PAGE_TITLES[activePage] || 'Overview'}</strong></div>
          <div className="topbar-right">
            <button className="topbar-search" onClick={onFind} title="Find catalogue studies (/)"><Search size={15}/><span>Find a study</span><kbd>/</kbd></button>
            <button
              type="button"
              className={`readability-toggle ${easyRead ? 'is-on' : ''}`}
              onClick={() => setEasyRead((value) => !value)}
              aria-pressed={easyRead}
              aria-label={easyRead ? 'Turn off Easy read larger text' : 'Turn on Easy read larger text'}
              title={easyRead ? 'Return to standard text size' : 'Increase text size and contrast'}
            ><Type size={17}/><span>{easyRead ? 'Standard text' : 'Easy read'}</span></button>
            <div className={`api-pill ${apiStatus}`}><span className="status-dot"/>{apiStatus === 'online' ? 'API connected' : apiStatus === 'checking' ? 'Connecting' : 'API offline'}</div>
            <div className="topbar-divider"/>
            <div className="user-chip"><div className="avatar">FX</div><span>Research workspace</span></div>
          </div>
        </header>
  );
}
