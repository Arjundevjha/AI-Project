import SenatorSeat from './SenatorSeat';
import { useDebate } from '../context/DebateContext';

export default function JudgeBench() {
  const { participants, phase } = useDebate();
  const judges = participants.filter(p => p.role === 'judge');

  const EmptySeat = () => (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-judge/5 border border-white/6 px-4 py-2 min-w-[90px] opacity-20">
      <div className="w-14 h-14 rounded-full flex items-center justify-center text-[1.6rem] bg-judge/10 border-2 border-judge/30">⚖️</div>
      <span className="text-[0.7rem] text-text-primary">Empty</span>
    </div>
  );

  return (
    <div className="relative z-2 flex flex-col items-center gap-6 px-8 py-6 bg-gradient-to-b from-surface-2 to-surface-1 border border-judge/15 rounded-3xl
      before:absolute before:inset-[-1px] before:rounded-3xl before:bg-gradient-to-br before:from-judge/10 before:via-transparent before:to-gold-500/10 before:-z-1 before:pointer-events-none">

      <div className="font-display text-[0.85rem] text-judge uppercase tracking-[0.15em] mb-1">
        ⚖️ The Honorable Judges
      </div>

      <div className="flex gap-6 justify-center">
        {judges.length > 0
          ? judges.map(judge => <SenatorSeat key={judge.id} participant={judge} />)
          : <><EmptySeat /><EmptySeat /><EmptySeat /></>
        }
      </div>

      {phase === 'DELIBERATION' && (
        <div className="font-serif text-[0.85rem] text-text-secondary italic">
          The judges are now deliberating...
        </div>
      )}
    </div>
  );
}
