import { useState, useRef, useEffect } from 'react';
import { useDebate } from '../context/DebateContext';
import { useSenateSpeech } from '../hooks/useSenateSpeech';

export default function TranscriptPanel() {
  const { transcript } = useDebate();
  const [search, setSearch] = useState('');
  const bodyRef = useRef(null);
  const { challengeSpeech, loading } = useSenateSpeech();

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [transcript]);

  const filtered = search
    ? transcript.filter(e =>
        e.text.toLowerCase().includes(search.toLowerCase()) ||
        e.speakerName.toLowerCase().includes(search.toLowerCase())
      )
    : transcript;

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const speakerColor = {
    for: 'text-faction-for',
    against: 'text-faction-against',
    judge: 'text-judge',
    president: 'text-president',
    system: 'text-text-dim',
  };

  const entryStyles = {
    system: 'text-text-dim italic border-l-2 border-text-dim my-1',
    objection: 'bg-faction-against/5 border-l-3 border-faction-against font-semibold',
    point_of_order: 'bg-president/5 border-l-3 border-president',
    bribe_attempt: 'bg-faction-against/8 border-l-3 border-faction-against relative',
    statement: '',
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-surface-2">
        <h3 className="font-display text-[0.85rem] text-gold-400 tracking-wider uppercase">📜 Official Record</h3>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[0.7rem]">🔍</span>
          <input
            type="text"
            placeholder="Search transcript..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-surface-1 border border-white/6 rounded-md py-1 px-2 pl-7 text-text-primary font-mono text-[0.75rem] w-40 transition-all duration-250 focus:outline-none focus:border-gold-500 focus:w-50"
          />
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-2 font-mono text-[0.78rem] leading-relaxed">
        {filtered.length === 0 ? (
          <div className="text-center text-text-dim py-8 font-serif italic text-base">
            The record stands empty.<br />
            Commence proceedings to begin transcription.
          </div>
        ) : (
          filtered.map((entry, index) => (
            <div
              key={entry.id}
              className={`
                flex gap-2 px-2 py-1 rounded-md transition-colors duration-150 group relative
                ${entry.stricken ? 'opacity-40' : 'hover:bg-white/3'}
                ${entryStyles[entry.type] || ''}
                animate-fade-in
              `}
            >
              <span className="text-text-dim min-w-8 text-right select-none text-[0.7rem]">{index + 1}.</span>
              <span className="text-text-dim min-w-[65px] text-[0.7rem]">{formatTime(entry.timestamp)}</span>
              <span className={`font-semibold min-w-[100px] truncate ${speakerColor[entry.role] || 'text-text-dim'}`}>
                {entry.speakerName}
              </span>
              <span className={`text-[0.6rem] px-1 py-[1px] rounded uppercase tracking-wider self-center
                ${entry.role === 'for' ? 'bg-faction-for/10 text-faction-for border border-faction-for/20' : ''}
                ${entry.role === 'against' ? 'bg-faction-against/10 text-faction-against border border-faction-against/20' : ''}
                ${entry.role === 'judge' ? 'bg-judge/10 text-judge border border-judge/20' : ''}
                ${entry.role === 'president' ? 'bg-president/10 text-president border border-president/30' : ''}
                ${entry.role === 'system' ? 'bg-spare/10 text-spare border border-spare/20' : ''}
              `}>
                {entry.role}
              </span>
              <span className={`flex-1 text-text-primary break-words ${entry.stricken ? 'line-through decoration-faction-against/60' : ''}`}>
                {entry.text}
              </span>

              {/* Stricken badge */}
              {entry.stricken && (
                <span className="text-[0.6rem] text-faction-against font-bold tracking-wider bg-faction-against/8 px-1.5 py-0.5 rounded self-center flex-shrink-0">
                  STRICKEN
                </span>
              )}

              {/* Challenge button — only on senator statements that haven't been stricken */}
              {entry.type === 'statement' && !entry.stricken && (entry.role === 'for' || entry.role === 'against') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    challengeSpeech(entry);
                  }}
                  disabled={loading}
                  className="opacity-0 group-hover:opacity-100 text-[0.6rem] text-faction-against bg-faction-against/8 border border-faction-against/15 px-1.5 py-0.5 rounded cursor-pointer self-center flex-shrink-0 transition-all duration-200
                    hover:bg-faction-against/15 hover:border-faction-against/30
                    disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Raise point of order — challenge for unparliamentary language"
                >
                  ⚠️ Challenge
                </button>
              )}

              {entry.type === 'bribe_attempt' && (
                <span className="absolute top-0.5 right-2 text-[0.6rem] text-faction-against font-bold tracking-wider">⚠️ BRIBE DETECTED</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/6 flex justify-between items-center text-[0.7rem] text-text-dim">
        <span>{transcript.length} entries recorded</span>
        <span>
          {transcript.filter(t => t.stricken).length > 0 && (
            <span className="text-faction-against mr-3">{transcript.filter(t => t.stricken).length} stricken</span>
          )}
          Session Active
        </span>
      </div>
    </div>
  );
}
