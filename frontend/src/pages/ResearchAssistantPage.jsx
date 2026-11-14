import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Bot, ChevronRight, Database, Flame, Info, LoaderCircle, MessageSquareText, RotateCcw, Send, Sparkles } from 'lucide-react';
import { EvidenceCard } from '../components/assistant/EvidenceCard.jsx';
import { SIWorkbench } from '../components/assistant/SIWorkbench.jsx';
import { useAssistantChat } from '../hooks/useAssistantChat.js';

const EXAMPLES = [
  { label: 'BASS & material burning', question: 'What does PSI-26 BASS investigate, and which fuel material is documented?' },
  { label: 'Smoke detection research', question: 'Which investigations relate to smoke and aerosol detection?' },
  { label: 'Suppression & extinction', question: 'Which catalogue records discuss flame suppression or extinction?' },
  { label: 'Missing conditions', question: 'What oxygen concentration is reported for PSI-26?' },
];

export default function ResearchAssistant({ apiBase, onOpenRecord, seed, onSeedConsumed, records = [] }) {
  const [task, setTask] = useState('ask');
  const {
    question, setQuestion, messages, sending, error, selectedReply, setSelectedReply,
    currentReply, ask, clearConversation,
  } = useAssistantChat({ apiBase, seed, onSeedConsumed });
  const scrollRef = useRef(null);
  useEffect(() => { if (seed) setTask('ask'); }, [seed]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="assistant-page">
      <div className="page-heading assistant-heading">
        <div>
          <div className="eyebrow">FLARE-X / SUPER INTELLIGENCE WORKBENCH</div>
          <h1>SI Research Studio</h1>
          <p>Ask questions, compare investigations and prepare evidence-linked research briefs. Every workflow starts with the 24-record PSI catalogue.</p>
        </div>
        {task === 'ask' && <button className="secondary-button" onClick={clearConversation} disabled={!messages.length && !sending}>
          <RotateCcw size={15}/> New conversation
        </button>}
      </div>
      <div className="assistant-trust-note">
        <Info size={17}/>
        <p><strong>Catalogue evidence only.</strong> This assistant does not access full papers or raw PSI datasets. Missing measurements remain unavailable; generated summaries are not safety recommendations.</p>
      </div>
      <div className="si-navigation" role="group" aria-label="Research Assistant workflows">
        <button className={task === 'ask' ? 'is-active' : ''} aria-pressed={task === 'ask'} onClick={() => setTask('ask')}><MessageSquareText size={17}/> Ask questions <span>Evidence-linked Q&A</span></button>
        <button className={task === 'compare' ? 'is-active' : ''} aria-pressed={task === 'compare'} onClick={() => setTask('compare')}><Database size={17}/> Cross-study analysis <span>Compare actual fields</span></button>
        <button className={task === 'brief' ? 'is-active' : ''} aria-pressed={task === 'brief'} onClick={() => setTask('brief')}><BookOpen size={17}/> Research brief <span>Sourced research direction</span></button>
      </div>
      {task !== 'ask' && <SIWorkbench key={task} apiBase={apiBase} task={task} records={records} onOpenRecord={onOpenRecord}/>}
      <div className="assistant-layout" hidden={task !== 'ask'}>
        <section className="assistant-chat-panel" aria-label="Research Assistant conversation">
          <div className="assistant-panel-top">
            <div className="assistant-panel-identity"><span className="assistant-bot-icon"><Bot size={19}/></span><div><strong>FLARE-X Research Assistant</strong><span>Retrieval first · Gemini optional</span></div></div>
            <span className="assistant-ready-pill"><span/> {currentReply?.mode === 'gemini' ? 'Gemini-assisted answer' : currentReply ? 'Catalogue answer' : 'Gemini optional'}</span>
          </div>
          <div className="assistant-messages" ref={scrollRef} aria-live="polite">
            {!messages.length && <div className="assistant-welcome">
              <div className="assistant-welcome-symbol"><Flame size={28}/><span className="assistant-welcome-halo"/></div>
              <div className="assistant-welcome-overline">YOUR RESEARCH COPILOT</div>
              <h2>What would you like to understand?</h2>
              <p>Explore a topic, find related investigations, or check which experimental conditions are documented in the supplied catalogue.</p>
              <div className="assistant-prompts">{EXAMPLES.map((example) => <button key={example.label} onClick={() => ask(example.question)} disabled={sending}><Sparkles size={14}/><span>{example.label}</span><ArrowUpRight size={14}/></button>)}</div>
            </div>}
            {messages.map((message, index) => {
              const replyIndex = messages.slice(0, index + 1).filter((entry) => entry.role === 'assistant').length - 1;
              return <div key={index} className={`assistant-message ${message.role === 'user' ? 'assistant-user-message' : 'assistant-bot-message'}`}>
                <div className="assistant-message-avatar">{message.role === 'user' ? 'YOU' : <Bot size={16}/>}</div>
                <div className="assistant-message-body">
                  <div className="assistant-message-label">{message.role === 'user' ? 'YOU' : message.mode === 'gemini' ? 'SI-GENERATED RESPONSE · GEMINI' : 'CATALOGUE-BASED RESPONSE'}</div>
                  {message.role === 'user' ? <p>{message.text}</p> : <>
                    <div className="assistant-answer-text">{message.answer.split('\n\n').map((part, i) => <p key={i}>{part}</p>)}</div>
                    <button className="assistant-source-button" onClick={() => setSelectedReply(replyIndex)} disabled={!message.evidence?.length}><BookOpen size={14}/> View {message.evidence?.length || 0} evidence records <ChevronRight size={14}/></button>
                    <p className="assistant-message-notice">{message.notice}</p>
                  </>}
                </div>
              </div>;
            })}
            {sending && <div className="assistant-message assistant-bot-message"><div className="assistant-message-avatar"><Bot size={16}/></div><div className="assistant-message-body"><span className="assistant-thinking"><LoaderCircle className="spin" size={17}/> Retrieving matching PSI records…</span></div></div>}
            {error && <div className="assistant-error" role="alert">{error} <button onClick={() => ask([...messages].reverse().find((entry) => entry.role === 'user')?.text || question)}>Retry</button></div>}
          </div>
          <form className="assistant-compose" onSubmit={(event) => {event.preventDefault(); ask();}}>
            <div className="assistant-compose-field"><MessageSquareText size={19}/><textarea value={question} maxLength={500} rows={2} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => {if (event.key === 'Enter' && !event.shiftKey) {event.preventDefault(); ask();}}} placeholder="Ask about BASS, smoke, flame extinction, PSI IDs…" aria-label="Ask a research question"/><button className="assistant-send" type="submit" disabled={sending || question.trim().length < 3} aria-label="Send question">{sending ? <LoaderCircle className="spin" size={18}/> : <Send size={18}/>}</button></div>
            <div className="assistant-compose-hint"><span>Enter to send · Include PSI IDs in follow-up questions</span><span>{question.length}/500</span></div>
          </form>
        </section>
        <aside className="assistant-evidence-pane" aria-label="Evidence linked to the selected answer">
          <div className="assistant-evidence-top"><div><div className="eyebrow">RETRIEVED SOURCE RECORDS</div><h2>Evidence trail</h2></div><Database size={19}/></div>
          <p className="assistant-evidence-intro">Trace the answer back to exactly what the supplied catalogue says. SI-generated tags are not NASA classifications.</p>
          {currentReply?.evidence?.length ? <div className="assistant-evidence-list">{currentReply.evidence.map((item) => <EvidenceCard key={item.id} item={item} onOpenRecord={onOpenRecord}/>)}</div> : <div className="assistant-evidence-empty"><BookOpen size={30}/><strong>No sources selected yet</strong><p>Ask a research question to see matching PSI catalogue excerpts here.</p></div>}
          <div className="assistant-evidence-foot"><Info size={15}/> Official citations must be checked using each investigation’s “Cite this Investigation” link on NASA PSI.</div>
        </aside>
      </div>
    </div>
  );
}
