import { useMemo, useState } from 'react';
import { ChevronRight, ClipboardList } from 'lucide-react';

export function ResearchBrief({ brief }) {
  const [message, setMessage] = useState('');
  const content = useMemo(() => {
    if (!brief) return '';
    return [
      brief.title,
      `Research question: ${brief.research_question}`,
      `Research direction (SI-generated): ${brief.interpretation}`,
      'Relevant investigation records (ranked by keyword match, not scientific quality):',
      ...brief.records.map((item) => `- ${item.id} — ${item.title}. ${item.why_relevant}`),
      `Next research step: ${brief.recommended_next_step}`,
      'Limitations:',
      ...brief.limitations.map((item) => `- ${item}`),
      `Catalogue source: ${brief.source}`,
    ].join('\n\n');
  }, [brief]);
  if (!brief) return null;
  return <section className="intel-panel intel-brief">
    <div className="intel-panel-top"><div><div className="intel-eyebrow">EXPORT / RESEARCH SUMMARY</div><h2>Evidence-linked research brief</h2><p>A shareable research starting point—not experimental results or fire-safety advice.</p></div><button className="secondary-button" onClick={async () => {
      try { await navigator.clipboard.writeText(content); setMessage('Brief copied.'); }
      catch { setMessage('Clipboard unavailable; select and copy the text below.'); }
    }}><ClipboardList size={16}/> Copy brief</button></div>
    {message && <p className="intel-message" role="status">{message}</p>}
    <details className="intel-brief-details"><summary>Preview source-grounded brief <ChevronRight size={16}/></summary><textarea aria-label="Research brief text" readOnly value={content} rows={13}/></details>
  </section>;
}

