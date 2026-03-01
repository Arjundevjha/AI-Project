import { useNavigate } from 'react-router-dom';
import { useDebate, useDebateDispatch } from '../context/DebateContext';
import SenatorSeat from '../components/SenatorSeat';

export default function VerdictHall() {
  const state = useDebate();
  const dispatch = useDebateDispatch();
  const navigate = useNavigate();

  const { motion, verdict, presidentialVerdict, participants, impeachmentActive, impeachmentRound, impeachmentVotes } = state;

  const isBiased = verdict && presidentialVerdict && verdict !== presidentialVerdict;
  const displayVerdict = presidentialVerdict || verdict;

  const handleStartImpeachment = () => {
    dispatch({ type: 'START_IMPEACHMENT' });
    dispatch({ type: 'ADD_TRANSCRIPT', payload: { speakerId: 'system', speakerName: 'System', role: 'system', text: '⚠️ IMPEACHMENT PROCEEDINGS INITIATED — The Senate suspects presidential bias!', type: 'system' } });
  };

  const handleImpeachmentVote = (vote) => dispatch({ type: 'IMPEACHMENT_VOTE', payload: vote });

  const handleNextImpeachmentRound = () => {
    if (impeachmentRound >= 3) {
      const overturned = impeachmentVotes.for > impeachmentVotes.against;
      dispatch({ type: 'END_IMPEACHMENT', payload: { overturned } });
      dispatch({ type: 'ADD_TRANSCRIPT', payload: { speakerId: 'system', speakerName: 'System', role: 'system', text: overturned ? '🔄 IMPEACHMENT SUCCESSFUL — The verdict has been overturned!' : '🛡️ IMPEACHMENT FAILED — The President\'s verdict stands.', type: 'system' } });
    } else {
      dispatch({ type: 'NEXT_IMPEACHMENT_ROUND' });
    }
  };

  const handleNewSession = () => { dispatch({ type: 'RESET' }); navigate('/'); };

  const Btn = ({ children, primary, danger, lg, onClick, className = '' }) => (
    <button onClick={onClick} className={`
      inline-flex items-center gap-2 border rounded-xl font-medium cursor-pointer transition-all duration-250
      ${lg ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'}
      ${primary ? 'bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border-gold-400 font-semibold hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]' :
        danger ? 'bg-surface-2 border-faction-against text-faction-against hover:bg-faction-against/10 hover:shadow-[0_0_20px_rgba(231,76,60,0.3)]' :
        'bg-surface-2 border-white/6 text-text-primary hover:bg-surface-3 hover:border-gold-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]'}
      hover:-translate-y-px active:translate-y-0 ${className}
    `}>{children}</button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 gap-8">

      {/* Verdict Card */}
      <div className="w-full max-w-[700px] text-center px-12 py-12 bg-gradient-to-br from-surface-2 to-surface-1 rounded-3xl border border-gold-500/15 relative overflow-hidden animate-slide-up
        before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-gradient-to-r before:from-transparent before:via-gold-500 before:to-transparent">
        <span className="text-6xl block mb-4 animate-float">{displayVerdict === 'for' ? '✅' : '❌'}</span>
        <div className="font-display text-[0.75rem] uppercase tracking-[0.2em] text-gold-400 mb-2">The Verdict of the Chamber</div>
        <div className={`font-display text-3xl font-black mb-4 ${displayVerdict === 'for' ? 'text-faction-for' : 'text-faction-against'}`}
          style={{ textShadow: displayVerdict === 'for' ? '0 0 30px rgba(46,204,113,0.3)' : '0 0 30px rgba(231,76,60,0.3)' }}>
          {displayVerdict === 'for' ? 'MOTION CARRIES' : 'MOTION FALLS'}
        </div>
        <div className="font-serif text-[1.05rem] text-text-secondary italic mb-6 leading-relaxed">"{motion}"</div>

        {isBiased ? (
          <div className="text-[0.8rem] text-faction-against px-4 py-2 bg-faction-against/5 border border-faction-against/15 rounded-xl">
            ⚠️ The President has altered the judges' original ruling.
            The judges ruled: <strong>{verdict === 'for' ? 'CARRIES' : 'FALLS'}</strong>.
            Senators may initiate impeachment proceedings.
          </div>
        ) : displayVerdict && (
          <div className="text-[0.8rem] text-text-dim px-4 py-2 bg-president/5 border border-president/10 rounded-xl">
            The President has faithfully presented the judges' verdict.
          </div>
        )}
      </div>

      {/* Senator Reactions */}
      <div className="w-full max-w-[800px]">
        <h3 className="font-display text-[0.85rem] text-text-secondary uppercase tracking-wider text-center mb-4">The Senate</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {participants.filter(p => p.role !== 'judge').map(p => (
            <SenatorSeat key={p.id} participant={p} compact />
          ))}
        </div>
      </div>

      {/* Impeachment */}
      <div className="w-full max-w-[700px] animate-slide-up">
        {!impeachmentActive && (
          <div className="w-full text-center p-6 bg-faction-against/4 border border-dashed border-faction-against/20 rounded-2xl">
            <p className="text-text-dim text-[0.85rem] mb-4 font-serif">
              {isBiased
                ? 'Senators have detected presidential bias. They may call for impeachment proceedings.'
                : 'If the senators believe the President was biased, they may still challenge the ruling.'}
            </p>
            <Btn danger lg onClick={handleStartImpeachment}>
              {isBiased ? '⚠️ Initiate Impeachment Proceedings' : '🗳️ Challenge the Ruling'}
            </Btn>
          </div>
        )}

        {impeachmentActive && (
          <div className="p-6 bg-gradient-to-br from-faction-against/4 via-transparent to-transparent border border-faction-against/15 rounded-3xl text-center">
            <h3 className="font-display text-xl text-faction-against mb-4">🔥 Impeachment Proceedings</h3>

            {/* Round pips */}
            <div className="flex gap-4 justify-center mb-6">
              {[1, 2, 3].map(r => (
                <div key={r} className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-[0.9rem] font-bold border-2 bg-surface-2 transition-all duration-250
                  ${r === impeachmentRound ? 'border-faction-against text-faction-against shadow-[0_0_20px_rgba(231,76,60,0.3)] scale-115' :
                    r < impeachmentRound ? 'border-faction-for bg-faction-for/8 text-faction-for' :
                    'border-white/6 text-text-dim'}
                `}>{r}</div>
              ))}
            </div>

            {/* Vote tally */}
            <div className="flex gap-8 justify-center mb-6">
              <div className="text-center">
                <div className="font-display text-4xl font-black text-faction-against leading-none">{impeachmentVotes.for}</div>
                <div className="text-[0.75rem] uppercase tracking-wider text-faction-against mt-1">Impeach</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl font-black text-faction-for leading-none">{impeachmentVotes.against}</div>
                <div className="text-[0.75rem] uppercase tracking-wider text-faction-for mt-1">Acquit</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Btn danger onClick={() => handleImpeachmentVote('for')}>👎 Vote to Impeach</Btn>
              <Btn onClick={() => handleImpeachmentVote('against')}>👍 Vote to Acquit</Btn>
              <Btn primary onClick={handleNextImpeachmentRound}>
                {impeachmentRound >= 3 ? '📊 Final Tally' : `➡️ Round ${impeachmentRound + 1}`}
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* New Session */}
      <div className="mt-6">
        <Btn lg onClick={handleNewSession}>🔄 New Session</Btn>
      </div>
    </div>
  );
}
