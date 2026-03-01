import { useState } from 'react';
import { useDebateDispatch } from '../context/DebateContext';

export default function SenatorSeat({ participant, compact = false }) {
  const [showMenu, setShowMenu] = useState(false);
  const dispatch = useDebateDispatch();

  if (!participant) return null;

  const { id, modelName, icon, provider, role, status } = participant;

  const roleColors = {
    for: { border: 'border-l-faction-for', avatarBg: 'bg-faction-for/10', avatarBorder: 'border-faction-for/30', badge: 'bg-faction-for/10 text-faction-for border border-faction-for/20' },
    against: { border: 'border-l-faction-against', avatarBg: 'bg-faction-against/10', avatarBorder: 'border-faction-against/30', badge: 'bg-faction-against/10 text-faction-against border border-faction-against/20' },
    judge: { border: 'border-l-judge', avatarBg: 'bg-judge/10', avatarBorder: 'border-judge/30', badge: 'bg-judge/10 text-judge border border-judge/20' },
    spare: { border: 'border-l-spare', avatarBg: 'bg-spare/10', avatarBorder: 'border-spare/30', badge: 'bg-spare/10 text-spare border border-spare/20' },
  };

  const colors = roleColors[role] || roleColors.spare;

  const handleRemove = () => {
    dispatch({ type: 'PAUSE_SESSION', payload: `Removal of ${modelName} requested` });
    dispatch({ type: 'REMOVE_PARTICIPANT', payload: id });
    dispatch({
      type: 'ADD_TRANSCRIPT',
      payload: {
        speakerId: 'president',
        speakerName: 'Mr. President',
        role: 'president',
        text: `I hereby order the removal of Senator ${modelName} from these proceedings.`,
        type: 'system',
      },
    });
    setShowMenu(false);
    setTimeout(() => dispatch({ type: 'RESUME_SESSION' }), 1500);
  };

  const handleRequestSubstitution = () => {
    dispatch({
      type: 'ADD_TRANSCRIPT',
      payload: {
        speakerId: id,
        speakerName: modelName,
        role,
        text: `I request a substitution for this position.`,
        type: 'point_of_order',
      },
    });
    setShowMenu(false);
  };

  return (
    <div
      className={`
        flex flex-col items-center gap-1 rounded-2xl bg-surface-2 border border-white/6 cursor-pointer
        transition-all duration-250 ease-in-out relative min-w-[90px] backdrop-blur-md
        border-l-3 ${colors.border}
        ${status === 'speaking' ? 'animate-speaking border-gold-400' : ''}
        ${status === 'removed' ? 'opacity-35 pointer-events-none grayscale-[0.8]' : ''}
        ${role === 'spare' ? 'opacity-60' : ''}
        ${compact ? 'px-2 py-1' : 'px-4 py-2'}
        hover:-translate-y-[3px] hover:border-gold-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]
      `}
      onClick={() => setShowMenu(!showMenu)}
      title={`${modelName} (${provider}) — ${role.toUpperCase()}`}
    >
      {/* Status dot */}
      <span className={`
        w-2 h-2 rounded-full inline-block
        ${status === 'active' ? 'bg-faction-for shadow-[0_0_8px_rgba(46,204,113,0.3)]' : ''}
        ${status === 'speaking' ? 'bg-gold-400 shadow-[0_0_8px_rgba(201,168,76,0.25)] animate-pulse-glow' : ''}
        ${status === 'removed' ? 'bg-faction-against' : ''}
        ${status === 'idle' ? 'bg-text-dim' : ''}
      `} />

      {/* Avatar */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center text-[1.4rem]
        bg-surface-1 border-2 ${colors.avatarBg} ${colors.avatarBorder}
      `}>
        {icon || '🤖'}
      </div>

      {/* Name */}
      <span className="font-body text-[0.7rem] font-semibold text-text-primary text-center max-w-[80px] truncate">
        {modelName}
      </span>

      {/* Badge & Provider */}
      {!compact && (
        <>
          <span className={`inline-flex items-center px-2 py-[2px] rounded-md text-[0.7rem] font-semibold uppercase tracking-wider ${colors.badge}`}>
            {role}
          </span>
          <span className="text-[0.6rem] text-text-dim font-mono">{provider}</span>
        </>
      )}

      {/* Top-right status dot */}
      <span className={`
        absolute top-1.5 right-1.5 w-2 h-2 rounded-full
        ${status === 'active' ? 'bg-faction-for shadow-[0_0_8px_rgba(46,204,113,0.3)]' : ''}
        ${status === 'speaking' ? 'bg-gold-400 shadow-[0_0_8px_rgba(201,168,76,0.25)]' : ''}
        ${status === 'removed' ? 'bg-faction-against' : ''}
        ${status === 'idle' ? 'bg-text-dim' : ''}
      `} />

      {/* Context Menu */}
      {showMenu && status !== 'removed' && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-navy-700 border border-white/6 rounded-xl p-1 z-[100] flex flex-col gap-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-[140px] animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-2 py-1 bg-transparent border-none text-text-primary text-[0.75rem] cursor-pointer rounded-md hover:bg-surface-3 transition-colors duration-150"
            onClick={handleRequestSubstitution}
          >
            🔄 Request Substitution
          </button>
          <button
            className="w-full text-left px-2 py-1 bg-transparent border-none text-faction-against text-[0.75rem] cursor-pointer rounded-md hover:bg-faction-against/10 transition-colors duration-150"
            onClick={handleRemove}
          >
            🚫 Remove Senator
          </button>
          <button
            className="w-full text-left px-2 py-1 bg-transparent border-none text-text-primary text-[0.75rem] cursor-pointer rounded-md hover:bg-surface-3 transition-colors duration-150"
            onClick={() => setShowMenu(false)}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
