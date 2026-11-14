import { useEffect, useRef, useState } from 'react';
import { apiPost } from '../services/api.js';

/** Session-local conversation state; no global store or stored conversation data. */
export function useAssistantChat({ apiBase, seed, onSeedConsumed }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [selectedReply, setSelectedReply] = useState(null);
  const abortRef = useRef(null);
  const consumeRef = useRef(onSeedConsumed);
  consumeRef.current = onSeedConsumed;

  useEffect(() => {
    if (seed) { setQuestion(seed); consumeRef.current(); }
  }, [seed]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(text = question) {
    const prompt = text.trim();
    if (sending || prompt.length < 3 || prompt.length > 500) return;
    setQuestion(''); setError(''); setSending(true); setSelectedReply(null);
    setMessages((old) => [...old, { role: 'user', text: prompt }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await apiPost('/api/assistant/ask', { question: prompt }, controller.signal, apiBase);
      if (!Array.isArray(result.evidence) || typeof result.answer !== 'string') {
        throw new Error('The Assistant API returned an incomplete answer.');
      }
      setMessages((old) => [...old, { role: 'assistant', ...result }]);
    } catch (reason) {
      if (reason.name !== 'AbortError') setError(reason.message || 'Unable to reach the research assistant.');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setSending(false);
    }
  }

  function clearConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setSending(false); setMessages([]); setQuestion(''); setError(''); setSelectedReply(null);
  }

  const replies = messages.filter((entry) => entry.role === 'assistant');
  const currentReply = selectedReply === null ? replies[replies.length - 1] : replies[selectedReply];
  return { question, setQuestion, messages, sending, error, selectedReply, setSelectedReply, currentReply, ask, clearConversation };
}
