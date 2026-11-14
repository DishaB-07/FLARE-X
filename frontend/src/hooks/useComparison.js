import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../services/api.js';
import { API_BASE } from '../config/constants.js';

export function useComparison(activePage) {
  const [compareIds, setCompareIds] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const toggleCompare = useCallback((id) => setCompareIds((current) => {
    if (current.includes(id)) return current.filter((item) => item !== id);
    return current.length >= 3 ? current : [...current, id];
  }), []);

  useEffect(() => {
    if (activePage !== 'compare' || compareIds.length < 2) {
      setComparison(null); setError(''); setLoading(false); return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams();
    compareIds.forEach((id) => params.append('ids', id));
    setComparison(null); setError(''); setLoading(true);
    apiGet(`/api/compare?${params}`, controller.signal, API_BASE)
      .then((result) => {
        if (!Array.isArray(result.items)) throw new Error('Invalid comparison response.');
        setComparison(result);
      }).catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [activePage, compareIds, retryToken]);
  return { compareIds, toggleCompare, comparison, error, loading, retry: () => setRetryToken((n) => n + 1) };
}
