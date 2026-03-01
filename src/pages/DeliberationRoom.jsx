import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebate, useDebateDispatch } from '../context/DebateContext';
import SenatorSeat from '../components/SenatorSeat';
import TranscriptPanel from '../components/TranscriptPanel';

export default function DeliberationRoom() {
  const state = useDebate();
  const dispatch = useDebateDispatch();
  const navigate = useNavigate();
  const [selectedVerdict, setSelectedVerdict] = useState(null);
  const [deliberationMessages, setDeliberationMessages] = useState([
    { speaker: 'System', text: 'The judges have retired to deliberate. The President is observing.' },
  ]);

  const judges = state.participants.filter(p => p.role === 'judge');

  const simulateDeliberation = () => {
    const judge = judges[Math.floor(Math.random() * judges.length)];
    const thoughts = [
      "Having reviewed the arguments, I find the proposition's case more compelling on the merits.",
      "The opposition raised critical points that cannot be dismissed. I lean toward their position.",
      "Both sides presented strong arguments. However, the burden of proof lies with the proposition.",
      "I am persuaded by the evidence presented in Round 3. The facts favor the motion.",
      "The emotional appeals aside, the logical framework of the opposition is more sound.",
      "I believe the motion, while well-intentioned, would create unintended consequences.",
    ];
    setDeliberationMessages(prev => [...prev, {
      speaker: judge.modelName,
      text: thoughts[Math.floor(Math.random() * thoughts.length)],
    }]);
  };

  const handleSubmitVerdict = () => {
    if (!selectedVerdict) return;
    dispatch({ type: 'SET_VERDICT', payload: selectedVerdict });
    dispatch({
      type: 'ADD_TRANSCRIPT',
      payload: { speakerId: 'system', speakerName: 'System', role: 'system', text: `The judges have reached a verdict: Motion ${selectedVerdict === 'for' ? 'CARRIES' : 'FALLS'}.`, type: 'system' },
    });
    navigate('/verdict');
  };

  return (
    <div className="min-h-screen grid grid-cols-[1fr_380px] grid-rows-[auto_1fr] gap-6 p-6 max-lg:grid-cols-1">
      {/* Header */}
      <div className="col-span-full text-center p-6 bg-gradient-to-br from-judge/6 via-transparent to-judge/6 border border-judge/12 rounded-3xl animate-slide-up">
        <h1 className="font-display text-2xl text-judge mb-1">🔒 Deliberation Chamber</h1>
        <p className="font-serif text-text-secondary italic text-base">The judges deliberate in private. The President observes.</p>
      </div>

      {/* Main */}
      <div className="flex flex-col items-center gap-6 px-6 py-6">
        {/* Judge Circle */}
        <div className="flex gap-8 justify-center p-8 bg-[radial-gradient(circle_at_center,rgba(155,89,182,0.04),transparent_70%)] rounded-3xl border border-judge/8 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-10">⚖️</span>
          {judges.map((judge, i) => (
            <div key={judge.id} className="min-w-[130px]" style={{ animation: `float 3s ease-in-out ${i}s infinite` }}>
              <SenatorSeat participant={judge} />
            </div>
          ))}
        </div>

        {/* Deliberation Chat */}
        <div className="w-full max-w-[600px] bg-surface-1 border border-white/6 rounded-2xl p-6">
          <h3 className="font-display text-[0.8rem] text-judge uppercase tracking-wider mb-4">💬 Deliberation Proceedings</h3>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-6">
            {deliberationMessages.map((msg, i) => (
              <div key={i} className="px-4 py-2 bg-surface-2 rounded-xl border-l-3 border-judge animate-fade-in">
                <div className="text-[0.75rem] font-semibold text-judge mb-1">{msg.speaker}</div>
                <div className="font-serif text-[0.9rem] text-text-primary leading-relaxed">{msg.text}</div>
              </div>
            ))}
          </div>
          <button
            onClick={simulateDeliberation}
            className="px-4 py-2 bg-surface-2 border border-white/6 rounded-xl text-text-primary text-[0.875rem] font-medium cursor-pointer transition-all duration-250 hover:bg-surface-3 hover:border-gold-500 hover:shadow-[0_0_20px_rgba(201,168,76,0.25)]"
          >
            🗣️ Simulate Judge Discussion
          </button>
        </div>

        {/* Verdict Selection */}
        <div className="w-full max-w-[600px] p-6 bg-surface-1 border border-gold-500/15 rounded-2xl">
          <h3 className="font-display text-[0.8rem] text-gold-400 uppercase tracking-wider mb-4">⚖️ Judges' Verdict</h3>
          <p className="text-text-secondary text-[0.85rem] mb-4 font-serif">
            As President, you will receive the judges' verdict and present it to the chamber.
            You may choose to present it faithfully... or not.
          </p>
          <div className="flex gap-4 mb-6">
            <div
              onClick={() => setSelectedVerdict('for')}
              className={`flex-1 p-4 bg-surface-2 border-2 rounded-xl cursor-pointer text-center transition-all duration-250 font-display text-faction-for
                ${selectedVerdict === 'for' ? 'border-faction-for bg-faction-for/8 shadow-[0_0_20px_rgba(46,204,113,0.3)]' : 'border-white/6 hover:-translate-y-0.5 hover:border-faction-for'}
              `}
            >
              <div className="text-2xl mb-1">✅</div>
              <div>Motion Carries</div>
            </div>
            <div
              onClick={() => setSelectedVerdict('against')}
              className={`flex-1 p-4 bg-surface-2 border-2 rounded-xl cursor-pointer text-center transition-all duration-250 font-display text-faction-against
                ${selectedVerdict === 'against' ? 'border-faction-against bg-faction-against/8 shadow-[0_0_20px_rgba(231,76,60,0.3)]' : 'border-white/6 hover:-translate-y-0.5 hover:border-faction-against'}
              `}
            >
              <div className="text-2xl mb-1">❌</div>
              <div>Motion Falls</div>
            </div>
          </div>
          <button
            disabled={!selectedVerdict}
            onClick={handleSubmitVerdict}
            className="w-full px-6 py-3 bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border border-gold-400 rounded-xl font-semibold text-base cursor-pointer transition-all duration-250
              hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📜 Present Verdict to Chamber
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="row-start-2 flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto max-lg:max-h-[350px]">
        <div className="px-4 py-2 bg-president/6 border border-president/15 rounded-xl text-center font-mono text-[0.75rem] text-president">
          👁️ OBSERVING AS PRESIDENT
        </div>
        <TranscriptPanel />
      </div>
    </div>
  );
}
