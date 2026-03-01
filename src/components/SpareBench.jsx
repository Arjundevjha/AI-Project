import SenatorSeat from './SenatorSeat';
import { useDebate } from '../context/DebateContext';

export default function SpareBench() {
  const { spares } = useDebate();

  return (
    <div className="bg-surface-1 border border-white/6 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 bg-surface-2">
        <h4 className="font-display text-[0.75rem] text-text-secondary uppercase tracking-wider">🪑 Reserve Bench</h4>
        <span className="text-[0.7rem] text-text-dim font-mono">{spares.length} available</span>
      </div>

      {/* List */}
      <div className="p-2 flex flex-col gap-1 max-h-[400px] overflow-y-auto">
        {spares.map(spare => (
          <SenatorSeat key={spare.id} participant={{ ...spare, role: 'spare', status: 'idle' }} compact />
        ))}
        {spares.length === 0 && (
          <div className="text-center py-6 text-text-dim text-[0.8rem] italic">
            No reserve models remaining
          </div>
        )}
      </div>
    </div>
  );
}
