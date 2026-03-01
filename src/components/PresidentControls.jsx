import { useDebate, useDebateDispatch, PHASES } from '../context/DebateContext';

export default function PresidentControls() {
  const state = useDebate();
  const dispatch = useDebateDispatch();
  const { phase, round, totalRounds } = state;

  const handleNextRound = () => {
    if (round >= totalRounds) {
      dispatch({ type: 'START_DELIBERATION' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. President', role: 'president',
          text: 'All rounds have concluded. The judges will now retire to deliberate.', type: 'system',
        },
      });
    } else {
      dispatch({ type: 'NEXT_ROUND' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. President', role: 'president',
          text: `Round ${round + 1} of ${totalRounds} is now in session. Order!`, type: 'system',
        },
      });
    }
  };

  const handlePause = () => {
    if (phase === PHASES.PAUSED) {
      dispatch({ type: 'RESUME_SESSION' });
    } else {
      dispatch({ type: 'PAUSE_SESSION', payload: 'Session paused by the President' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. President', role: 'president',
          text: 'I hereby suspend proceedings. Order in the chamber!', type: 'system',
        },
      });
    }
  };

  const Btn = ({ children, primary, danger, onClick }) => (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-[0.875rem] font-medium cursor-pointer transition-all duration-250
        ${primary
          ? 'bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border-gold-400 font-semibold hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]'
          : danger
            ? 'bg-surface-2 border-faction-against text-faction-against hover:bg-faction-against/10 hover:shadow-[0_0_20px_rgba(231,76,60,0.3)]'
            : 'bg-surface-2 border-white/6 text-text-primary hover:bg-surface-3 hover:border-gold-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]'
        }
        hover:-translate-y-px active:translate-y-0
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-6 px-6 py-4 bg-gradient-to-br from-president/6 via-surface-2 to-president/6 border border-president/15 rounded-2xl backdrop-blur-md">
      {/* Badge */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-president/15 to-gold-500/10 border-2 border-president/30 flex items-center justify-center text-[1.4rem] shadow-[0_0_20px_rgba(243,156,18,0.15)]">
          🏛️
        </div>
        <div className="flex flex-col">
          <span className="text-[0.65rem] uppercase tracking-[0.15em] text-text-dim">Presiding</span>
          <span className="font-display text-[0.95rem] text-president font-semibold">Mr. President</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-4 ml-auto">
        <div className="flex items-baseline gap-1">
          <span className="text-[0.7rem] uppercase tracking-wider text-text-dim">Round</span>
          <span className="font-display text-2xl text-gold-400 font-bold leading-none">{round}</span>
          <span className="text-[0.85rem] text-text-dim">/ {totalRounds}</span>
        </div>
        <span className={`inline-flex items-center px-2 py-[2px] rounded-md text-[0.7rem] font-semibold uppercase tracking-wider
          ${phase === PHASES.PAUSED
            ? 'bg-faction-against/10 text-faction-against border border-faction-against/20'
            : 'bg-faction-for/10 text-faction-for border border-faction-for/20'}
        `}>
          {phase === PHASES.PAUSED ? 'PAUSED' : phase === PHASES.DEBATE_ACTIVE ? 'IN SESSION' : phase}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {phase === PHASES.DEBATE_ACTIVE && (
          <>
            <Btn onClick={handleNextRound}>
              {round >= totalRounds ? '⚖️ Send to Deliberation' : `▶️ Round ${round + 1}`}
            </Btn>
            <Btn onClick={handlePause}>⏸️ Pause</Btn>
          </>
        )}
        {phase === PHASES.PAUSED && (
          <Btn primary onClick={handlePause}>▶️ Resume Session</Btn>
        )}
        {phase === PHASES.DEBATE_ACTIVE && round >= 2 && (
          <Btn onClick={() => dispatch({ type: 'START_DELIBERATION' })}>⚖️ Skip to Deliberation</Btn>
        )}
      </div>
    </div>
  );
}
