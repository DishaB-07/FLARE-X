/** UI composition root: page selection and shared cross-page state only.
 * API requests and derived catalogue data live in hooks/services.
 */
import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { API_BASE, TYPE_GROUND, TYPE_MICRO } from './config/constants.js';
import { useCatalogue } from './hooks/useCatalogue.js';
import { useComparison } from './hooks/useComparison.js';
import { useHashPage } from './hooks/useHashPage.js';
import { usePersistentBoolean } from './hooks/usePersistentBoolean.js';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Topbar } from './components/layout/Topbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { RecordModal } from './components/investigations/RecordModal.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { ExplorerPage } from './pages/ExplorerPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import ResearchAssistant from './pages/ResearchAssistantPage.jsx';
import { ResearchIntelligence } from './pages/ResearchIntelligencePage.jsx';
import { CitationsPage } from './pages/CitationsPage.jsx';

export default function App() {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recentIds, setRecentIds] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [assistantSeed, setAssistantSeed] = useState('');
  const [researchTheme, setResearchTheme] = useState('prevention');
  const [focusExplorerSearch, setFocusExplorerSearch] = useState(false);
  const [easyRead, setEasyRead] = usePersistentBoolean('flarex-easy-read');
  const searchInputRef = useRef(null);

  const { activePage, navigate } = useHashPage(() => {
    setSelectedRecord(null);
    setMobileNavOpen(false);
  });
  const catalogue = useCatalogue();
  const comparisonState = useComparison(activePage);
  const { compareIds, toggleCompare, comparison, error: compareError, loading: compareLoading, retry: retryComparison } = comparisonState;
  const { metadata, records, filteredRecords, citations, loading, filtering, status, error, retry } = catalogue;

  function openRecord(record) {
    setSelectedRecord(record);
    setRecentIds((old) => [record.id, ...old.filter((id) => id !== record.id)].slice(0, 5));
  }
  function openRecordById(id) {
    const found = records.find((record) => record.id === id);
    if (found) openRecord(found);
  }
  function openExplorerSearch() {
    navigate('explorer');
    setFocusExplorerSearch(true);
  }

  useEffect(() => {
    function handleShortcut(event) {
      if (event.key === 'Escape') setMobileNavOpen(false);
      if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]') || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault(); openExplorerSearch();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [navigate]);

  useEffect(() => {
    if (focusExplorerSearch && activePage === 'explorer') {
      searchInputRef.current?.focus();
      setFocusExplorerSearch(false);
    }
  }, [focusExplorerSearch, activePage]);

  return (
    <div className={`app-shell ${easyRead ? 'reading-mode' : ''}`}>
      {mobileNavOpen && <button className="mobile-nav-scrim" aria-label="Close navigation overlay" onClick={() => setMobileNavOpen(false)}/>}
      <Sidebar mobileNavOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} activePage={activePage} navigate={navigate} compareCount={compareIds.length}/>
      <main className="main-area">
        <Topbar activePage={activePage} openNavigation={() => setMobileNavOpen(true)} onFind={openExplorerSearch} easyRead={easyRead} setEasyRead={setEasyRead} apiStatus={status}/>
        <div className="page-content">
          {status === 'offline' && <div className="connection-banner" role="alert"><AlertCircle size={19}/><div><strong>Catalogue API unavailable</strong><span>{error || 'Start the backend or check the configured API address, then reconnect.'}</span></div><button className="secondary-button" onClick={retry}>Retry connection</button></div>}
          {activePage === 'overview' && <OverviewPage
            metadata={metadata} records={records} typeChartData={catalogue.typeData} topicChartData={catalogue.topicData}
            doiCount={catalogue.doiCount} microCount={metadata?.type_counts?.[TYPE_MICRO] || 0} groundCount={metadata?.type_counts?.[TYPE_GROUND] || 0}
            recentIds={recentIds} loading={loading} onExplore={() => navigate('explorer')} onOpen={openRecord}
            onCompare={() => navigate('compare')} onAssistant={() => navigate('assistant')} onIntelligence={() => navigate('intelligence')}
          />}
          {activePage === 'explorer' && <ExplorerPage
            records={filteredRecords} allCount={records.length} query={catalogue.query} setQuery={catalogue.setQuery}
            typeFilter={catalogue.typeFilter} setTypeFilter={catalogue.setTypeFilter} topicFilter={catalogue.topicFilter}
            setTopicFilter={catalogue.setTopicFilter} topics={catalogue.topics} sort={catalogue.sort} setSort={catalogue.setSort}
            compareIds={compareIds} toggleCompare={toggleCompare} onOpen={openRecord}
            searchInputRef={searchInputRef} loading={loading || filtering} error={error} onCompare={() => navigate('compare')}
          />}
          {activePage === 'intelligence' && <ResearchIntelligence apiBase={API_BASE} selectedTheme={researchTheme} onThemeChange={setResearchTheme} onOpenRecord={openRecordById} onCompare={() => navigate('compare')}/>}
          {activePage === 'compare' && <ComparePage records={records} compareIds={compareIds} toggleCompare={toggleCompare} comparison={comparison} error={compareError} loading={compareLoading} onRetry={retryComparison} onExplore={() => navigate('explorer')}/>}
          <div hidden={activePage !== 'assistant'}><ResearchAssistant apiBase={API_BASE} records={records} seed={assistantSeed} onSeedConsumed={() => setAssistantSeed('')} onOpenRecord={openRecordById}/></div>
          {activePage === 'insights' && <InsightsPage records={records} onOpen={openRecord} onRank={(theme) => { setResearchTheme(theme); navigate('intelligence'); }}/>} 
          {activePage === 'citations' && <CitationsPage apiBase={API_BASE} onOpenRecord={openRecordById}/>}
          {activePage === 'about' && <AboutPage metadata={metadata} doiCount={catalogue.doiCount} citationCount={citations?.confirmed}/>}
        </div>
        <Footer/>
      </main>
      {selectedRecord && <RecordModal
        record={selectedRecord} easyRead={easyRead} citation={citations?.items?.find((item) => item.id === selectedRecord.id)}
        onClose={() => setSelectedRecord(null)}
        onAsk={() => { setAssistantSeed(`What does ${selectedRecord.id} investigate and what information is documented?`); navigate('assistant'); }}
        onOpenRelated={openRecordById}
      />}
    </div>
  );
}
