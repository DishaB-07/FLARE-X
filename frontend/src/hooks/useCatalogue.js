import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../services/api.js';
import { API_BASE } from '../config/constants.js';
import { useDebouncedValue } from './useDebouncedValue.js';
import { catalogueTopics, typeChartData, topicChartData } from '../utils/catalogue.js';

/** Owns catalogue fetching and filter state; API responses remain authoritative. */
export function useCatalogue() {
  const [metadata, setMetadata] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [citations, setCitations] = useState(null);
  const [status, setStatus] = useState('checking');
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [sort, setSort] = useState('id');
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setStatus('checking');
    setError('');
    Promise.all([
      apiGet('/health', controller.signal, API_BASE),
      apiGet('/api/metadata', controller.signal, API_BASE),
      apiGet('/api/investigations?sort=id', controller.signal, API_BASE),
      apiGet('/api/citations', controller.signal, API_BASE),
    ]).then(([health, meta, list, citationAudit]) => {
      if (!Array.isArray(list.items) || !Array.isArray(citationAudit.items) || !meta.type_counts) {
        throw new Error('The catalogue API returned incomplete data.');
      }
      setStatus(health.status === 'ok' ? 'online' : 'offline');
      setMetadata(meta);
      setRecords(list.items);
      setFilteredRecords(list.items);
      setCitations(citationAudit);
    }).catch((reason) => {
      if (reason.name !== 'AbortError') { setStatus('offline'); setError(reason.message || 'Unable to load the catalogue.'); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retryToken]);

  useEffect(() => {
    if (!metadata) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
    if (typeFilter) params.set('type', typeFilter);
    if (topicFilter) params.set('topic', topicFilter);
    params.set('sort', sort);
    setFiltering(true);
    apiGet(`/api/investigations?${params}`, controller.signal, API_BASE)
      .then((result) => {
        if (!Array.isArray(result.items)) throw new Error('Invalid investigation list response.');
        setFilteredRecords(result.items);
        setError('');
      }).catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setFiltering(false); });
    return () => controller.abort();
  }, [debouncedQuery, typeFilter, topicFilter, sort, metadata]);

  const topics = useMemo(() => catalogueTopics(records), [records]);
  const typeData = useMemo(() => typeChartData(metadata), [metadata]);
  const topicData = useMemo(() => topicChartData(records), [records]);
  const doiCount = useMemo(() => records.filter((record) => record.doi).length, [records]);
  const retry = () => setRetryToken((value) => value + 1);
  return {
    metadata, records, filteredRecords, citations, status, loading, filtering, error, retry,
    query, setQuery, typeFilter, setTypeFilter, topicFilter, setTopicFilter, sort, setSort,
    topics, typeData, topicData, doiCount,
  };
}
