import { useDebate, useDebateDispatch, PHASES } from '../context/DebateContext';
import MotionBanner from '../components/MotionBanner';
import JudgeBench from '../components/JudgeBench';
import SenatorSeat from '../components/SenatorSeat';
import TranscriptPanel from '../components/TranscriptPanel';
import PresidentControls from '../components/PresidentControls';
import SpareBench from '../components/SpareBench';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSenateSpeech } from '../hooks/useSenateSpeech';

export default function SenateChamber() {
  const state = useDebate();
  const dispatch = useDebateDispatch();
  const navigate = useNavigate();
  const { phase, motion, participants, round, loading } = state;
  const { triggerSpeakRequests } = useSenateSpeech();

  useEffect(() => {
    if (phase === PHASES.DELIBERATION) navigate('/deliberation');
  }, [phase, navigate]);

  const forDebaters = participants.filter(p => p.role === 'for');
  const againstDebaters = participants.filter(p => p.role === 'against');

  return (
    <div className="min-h-screen grid grid-cols-[1fr_340px] grid-rows-[auto_auto_1fr_auto] gap-4 p-4 max-lg:grid-cols-1">
      {/* President Controls */}
      <div className="col-span-full animate-slide-up">
        <PresidentControls />
      </div>

      {/* Motion */}
      <div className="col-span-full animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <MotionBanner motion={motion} />
      </div>

      {/* Main Floor */}
      <div className="col-start-1 row-start-3 flex flex-col items-center gap-6 px-6 py-6 relative overflow-hidden
        before:absolute before:bottom-[-20%] before:left-1/2 before:-translate-x-1/2 before:w-[120%] before:h-[80%] before:rounded-t-[50%] before:border before:border-gold-500/6 before:pointer-events-none
        after:absolute after:bottom-[-30%] after:left-1/2 after:-translate-x-1/2 after:w-[140%] after:h-[80%] after:rounded-t-[50%] after:border after:border-gold-500/3 after:pointer-events-none">
        {/* Judge Bench */}
        <JudgeBench />

        {/* Senate Floor — Split Grid */}
        <div className="w-full flex gap-0 items-stretch">
          {/* FOR faction — left side */}
          <div className="flex-1 flex flex-col items-center gap-3 pr-4">
            <span className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faction-for bg-faction-for/8 border border-faction-for/15 px-4 py-1 rounded-md">
              🟢 For the Motion
            </span>
            <div className="grid grid-cols-2 gap-2 w-full justify-items-center xl:grid-cols-3">
              {forDebaters.map(p => (
                <SenatorSeat key={p.id} participant={p} />
              ))}
            </div>
          </div>

          {/* Center Divider */}
          <div className="w-px bg-gradient-to-b from-transparent via-gold-500/30 to-transparent self-stretch mx-1 flex-shrink-0" />

          {/* AGAINST faction — right side */}
          <div className="flex-1 flex flex-col items-center gap-3 pl-4">
            <span className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faction-against bg-faction-against/8 border border-faction-against/15 px-4 py-1 rounded-md">
              🔴 Against the Motion
            </span>
            <div className="grid grid-cols-2 gap-2 w-full justify-items-center xl:grid-cols-3">
              {againstDebaters.map(p => (
                <SenatorSeat key={p.id} participant={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Summon Speakers button */}
        <button
          onClick={() => triggerSpeakRequests(3)}
          disabled={loading || phase !== PHASES.DEBATE_ACTIVE}
          className="mt-4 px-6 py-3 bg-gradient-to-br from-gold-500/15 to-president/10 border border-gold-500/25 rounded-xl text-text-primary text-[0.875rem] font-semibold cursor-pointer transition-all duration-250 flex items-center gap-2
            hover:bg-gold-500/20 hover:border-gold-400 hover:shadow-[0_0_25px_rgba(201,168,76,0.3)] hover:-translate-y-px
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? (
            <><span className="animate-spin">⏳</span> Generating...</>
          ) : (
            <>🙋 Call for Speakers</>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className="col-start-2 row-start-3 row-span-2 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-200px)] max-lg:col-start-1 max-lg:row-start-auto max-lg:max-h-[400px]">
        <TranscriptPanel />
        <SpareBench />
      </div>

      {/* Pause Overlay */}
      {phase === PHASES.PAUSED && (
        <div className="fixed inset-0 bg-navy-900/85 flex items-center justify-center z-[1000] backdrop-blur-md animate-fade-in">
          <div className="bg-surface-1 border border-faction-against/30 rounded-3xl px-12 py-8 text-center max-w-[500px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="font-display text-faction-against text-xl mb-4">⏸️ Session Suspended</h2>
            <p className="text-text-secondary mb-6 font-serif text-[1.05rem]">{state.pauseReason || 'Session has been paused by the Speaker.'}</p>
            <button
              onClick={() => dispatch({ type: 'RESUME_SESSION' })}
              className="px-6 py-3 bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border border-gold-400 rounded-xl font-semibold cursor-pointer transition-all duration-250 hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]"
            >
              ▶️ Resume Proceedings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
