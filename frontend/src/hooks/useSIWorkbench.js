import { useEffect, useRef, useState } from 'react';
import { apiPost } from '../services/api.js';

/** Independent state for optional-Gemini compare/brief tasks; no global store. */
export function useSIWorkbench(apiBase) {
  const [ids, setIds] = useState(['PSI-26', 'PSI-62', '']);
  const [theme, setTheme] = useState('prevention');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function changeId(index, value) {
    setIds((old) => old.map((id, position) => position === index ? value : id));
    setOutput(null);
  }

  async function execute(task) {
    const selected = ids.filter(Boolean);
    if (busy) return;
    if (task === 'compare' && (selected.length < 2 || new Set(selected).size !== selected.length)) {
      setError('Select at least two different PSI records.');
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true); setError(''); setOutput(null);
    try {
      const path = task === 'compare' ? '/api/assistant/compare' : '/api/assistant/brief';
      const body = task === 'compare' ? { ids: selected, question: question.trim() || null }
        : { theme, question: question.trim() || null };
      const result = await apiPost(path, body, controller.signal, apiBase);
      if (typeof result.answer !== 'string' || !Array.isArray(result.evidence) || !['gemini', 'catalogue'].includes(result.mode)) {
        throw new Error('The research workflow returned an incomplete response.');
      }
      setOutput(result);
    } catch (reason) {
      if (reason.name !== 'AbortError') setError(reason.message || 'Could not generate the analysis.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setBusy(false);
    }
  }

  return { ids, changeId, theme, setTheme, question, setQuestion, busy, error, output, execute };
}
