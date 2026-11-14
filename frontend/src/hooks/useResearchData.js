import { useEffect, useState } from 'react';
import { apiGet } from '../services/api.js';

export function useResearchData(apiBase, theme) {
  const [ranking, setRanking] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [brief, setBrief] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError('');
    Promise.all([
      apiGet( `/api/relevance?theme=${encodeURIComponent(theme)}`, controller.signal, apiBase),
      apiGet( '/api/evidence-coverage', controller.signal, apiBase),
      apiGet( `/api/research-brief?theme=${encodeURIComponent(theme)}`, controller.signal, apiBase),
    ]).then(([ranked, gaps, report]) => {
      setRanking(ranked);
      setCoverage(gaps);
      setBrief(report);
    }).catch((reason) => {
      if (reason.name !== 'AbortError') setError(reason.message || 'Unable to load research intelligence.');
    }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [apiBase, theme, retryToken]);
  return { ranking, coverage, brief, error, busy, retry: () => setRetryToken((n) => n + 1) };
}

