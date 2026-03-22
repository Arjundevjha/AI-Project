import { useDebate, useDebateDispatch, PHASES } from '../context/DebateContext';
import { useSenateSpeech } from '../hooks/useSenateSpeech';

export default function PresidentControls() {
  const state = useDebate();
  const dispatch = useDebateDispatch();
  const { phase, round, totalRounds, speakRequests, activeChallenges } = state;
  const { grantFloor, denyFloor, strikeFromRecord, dismissChallenge, loading } = useSenateSpeech();

  const handleNextRound = () => {
    if (round >= totalRounds) {
      dispatch({ type: 'START_DELIBERATION' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. Speaker', role: 'president',
          text: 'All rounds have concluded. The judges will now retire to deliberate.', type: 'system',
        },
      });
    } else {
      dispatch({ type: 'NEXT_ROUND' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. Speaker', role: 'president',
          text: `Round ${round + 1} of ${totalRounds} is now in session. Order!`, type: 'system',
        },
      });
    }
  };

  const handlePause = () => {
    if (phase === PHASES.PAUSED) {
      dispatch({ type: 'RESUME_SESSION' });
    } else {
      dispatch({ type: 'PAUSE_SESSION', payload: 'Session paused by the Speaker' });
      dispatch({
        type: 'ADD_TRANSCRIPT',
        payload: {
          speakerId: 'president', speakerName: 'Mr. Speaker', role: 'president',
          text: 'I hereby suspend proceedings. Order in the chamber!', type: 'system',
        },
      });
    }
  };

  const Btn = ({ children, primary, danger, disabled, onClick }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-[0.875rem] font-medium cursor-pointer transition-all duration-250
        ${primary
          ? 'bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border-gold-400 font-semibold hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]'
          : danger
            ? 'bg-surface-2 border-faction-against text-faction-against hover:bg-faction-against/10 hover:shadow-[0_0_20px_rgba(231,76,60,0.3)]'
            : 'bg-surface-2 border-white/6 text-text-primary hover:bg-surface-3 hover:border-gold-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]'
        }
        hover:-translate-y-px active:translate-y-0
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Main controls bar */}
      <div className="flex items-center gap-6 px-6 py-4 bg-gradient-to-br from-president/6 via-surface-2 to-president/6 border border-president/15 rounded-2xl backdrop-blur-md">
        {/* Badge */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-president/15 to-gold-500/10 border-2 border-president/30 flex items-center justify-center text-[1.4rem] shadow-[0_0_20px_rgba(243,156,18,0.15)]">
            🏛️
          </div>
          <div className="flex flex-col">
            <span className="text-[0.65rem] uppercase tracking-[0.15em] text-text-dim">Presiding</span>
            <span className="font-display text-[0.95rem] text-president font-semibold">Mr. Speaker</span>
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

      {/* Speak Requests Queue */}
      {speakRequests.length > 0 && phase === PHASES.DEBATE_ACTIVE && (
        <div className="bg-surface-1 border border-gold-500/20 rounded-2xl px-5 py-4 animate-fade-in">
          <h4 className="font-display text-[0.75rem] uppercase tracking-[0.15em] text-gold-400 mb-3 flex items-center gap-2">
            🙋 Senators Requesting the Floor
            <span className="bg-gold-500/15 text-gold-400 text-[0.65rem] px-2 py-0.5 rounded-full font-semibold">{speakRequests.length}</span>
          </h4>
          <div className="flex flex-col gap-2">
            {speakRequests.map((req) => (
              <div key={req.senatorId} className="flex items-center gap-3 px-4 py-3 bg-surface-2 border border-white/6 rounded-xl transition-all duration-200 hover:border-gold-500/20">
                <span className="text-[1.2rem]">{req.icon || '🤖'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-semibold text-text-primary truncate">{req.senatorName}</div>
                  <div className={`text-[0.65rem] font-mono ${req.side === 'for' ? 'text-faction-for' : 'text-faction-against'}`}>
                    {req.side.toUpperCase()}
                  </div>
                  <div className="text-[0.72rem] text-text-secondary italic mt-1 font-serif">"{req.request}"</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => grantFloor(req)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-faction-for/10 border border-faction-for/25 text-faction-for text-[0.75rem] font-semibold rounded-lg cursor-pointer transition-all duration-200
                      hover:bg-faction-for/20 hover:border-faction-for/40 hover:shadow-[0_0_12px_rgba(46,204,113,0.2)]
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ✅ Grant
                  </button>
                  <button
                    onClick={() => denyFloor(req.senatorId)}
                    className="px-3 py-1.5 bg-faction-against/10 border border-faction-against/25 text-faction-against text-[0.75rem] font-semibold rounded-lg cursor-pointer transition-all duration-200
                      hover:bg-faction-against/20 hover:border-faction-against/40 hover:shadow-[0_0_12px_rgba(231,76,60,0.2)]"
                  >
                    ❌ Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="bg-faction-against/5 border border-faction-against/25 rounded-2xl px-5 py-4 animate-fade-in">
          <h4 className="font-display text-[0.75rem] uppercase tracking-[0.15em] text-faction-against mb-3 flex items-center gap-2">
            ⚠️ Point of Order — Unparliamentary Language
            <span className="bg-faction-against/15 text-faction-against text-[0.65rem] px-2 py-0.5 rounded-full font-semibold">{activeChallenges.length}</span>
          </h4>
          <div className="flex flex-col gap-3">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-surface-2 border border-faction-against/15 rounded-xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <div className="text-[0.7rem] text-text-dim uppercase tracking-wider mb-1">Challenged Speech by {challenge.challengedSenatorName}</div>
                    <div className="text-[0.8rem] text-text-secondary font-serif italic border-l-2 border-faction-against/30 pl-3">
                      "{challenge.challengedSpeech.substring(0, 200)}{challenge.challengedSpeech.length > 200 ? '...' : ''}"
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <div className="text-[0.7rem] text-text-dim uppercase tracking-wider mb-1">Objection by {challenge.objectorName}</div>
                    <div className="text-[0.8rem] text-text-primary font-serif">"{challenge.pointOfOrder}"</div>
                  </div>
                </div>
                {challenge.analysis && (
                  <div className="bg-surface-1 rounded-lg px-3 py-2 mb-3 border border-white/6">
                    <div className="text-[0.65rem] uppercase tracking-wider text-text-dim mb-1">Clerk's Analysis</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded-md ${
                        challenge.analysis.isUnparliamentary
                          ? 'bg-faction-against/10 text-faction-against border border-faction-against/20'
                          : 'bg-faction-for/10 text-faction-for border border-faction-for/20'
                      }`}>
                        {challenge.analysis.isUnparliamentary ? `⚠️ ${challenge.analysis.severity?.toUpperCase()}` : '✅ PARLIAMENTARY'}
                      </span>
                    </div>
                    <div className="text-[0.75rem] text-text-secondary">{challenge.analysis.explanation}</div>
                    {challenge.analysis.offendingPhrases?.length > 0 && (
                      <div className="mt-1 text-[0.7rem] text-faction-against">
                        Flagged: {challenge.analysis.offendingPhrases.map((p, i) => (
                          <span key={i} className="bg-faction-against/8 px-1.5 py-0.5 rounded mx-0.5 font-mono">"{p}"</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => strikeFromRecord(challenge.id, challenge.transcriptEntryId)}
                    className="px-4 py-2 bg-faction-against/10 border border-faction-against/25 text-faction-against text-[0.8rem] font-semibold rounded-lg cursor-pointer transition-all duration-200
                      hover:bg-faction-against/20 hover:border-faction-against/40 hover:shadow-[0_0_15px_rgba(231,76,60,0.25)]"
                  >
                    🚫 Strike from Record
                  </button>
                  <button
                    onClick={() => dismissChallenge(challenge.id)}
                    className="px-4 py-2 bg-surface-3 border border-white/10 text-text-primary text-[0.8rem] font-semibold rounded-lg cursor-pointer transition-all duration-200
                      hover:bg-surface-2 hover:border-gold-500/25 hover:shadow-[0_0_15px_rgba(201,168,76,0.15)]"
                  >
                    ✅ Dismiss Objection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
