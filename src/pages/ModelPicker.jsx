import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS, SLOT_CONFIG, SAMPLE_MOTIONS } from '../data/models';
import { useDebateDispatch } from '../context/DebateContext';

export default function ModelPicker() {
  const [selectedModels, setSelectedModels] = useState([]);
  const [motion, setMotion] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const dispatch = useDebateDispatch();
  const navigate = useNavigate();

  const totalSlots = SLOT_CONFIG.total;

  const toggleModel = (model) => {
    setSelectedModels(prev => {
      const exists = prev.find(m => m.id === model.id);
      if (exists) return prev.filter(m => m.id !== model.id);
      if (prev.length >= totalSlots) return prev;
      return [...prev, model];
    });
  };

  const filteredModels = providerFilter === 'All'
    ? AVAILABLE_MODELS
    : AVAILABLE_MODELS.filter(m => m.provider === providerFilter);

  const handleStart = () => {
    if (selectedModels.length < totalSlots || !motion.trim()) return;

    const shuffled = [...selectedModels].sort(() => Math.random() - 0.5);

    const judges = shuffled.slice(0, SLOT_CONFIG.judges).map((m, i) => ({
      ...m, id: `judge-${i}-${m.id}`, modelId: m.id, role: 'judge', status: 'active',
    }));
    const debaters = shuffled.slice(SLOT_CONFIG.judges, SLOT_CONFIG.judges + SLOT_CONFIG.debaters).map((m, i) => ({
      ...m, id: `debater-${i}-${m.id}`, modelId: m.id, role: i < SLOT_CONFIG.debaters / 2 ? 'for' : 'against', status: 'active',
    }));
    const spares = shuffled.slice(SLOT_CONFIG.judges + SLOT_CONFIG.debaters).map((m, i) => ({
      ...m, id: `spare-${i}-${m.id}`, modelId: m.id, role: 'spare', status: 'idle',
    }));

    dispatch({ type: 'SET_MOTION', payload: motion.trim() });
    dispatch({ type: 'START_SESSION', payload: { participants: [...judges, ...debaters], spares } });
    navigate('/chamber');
  };

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col items-center gap-8">
      {/* Header */}
      <header className="text-center animate-slide-up">
        <h1 className="font-display text-4xl text-gold-400 tracking-wide mb-2" style={{ textShadow: '0 0 40px rgba(201,168,76,0.25)' }}>
          ⚖️ Senate Chamber
        </h1>
        <p className="font-serif text-lg text-text-secondary italic">Select your senators and present the motion for debate</p>
      </header>

      {/* Motion Input */}
      <section className="w-full max-w-[700px] animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <label htmlFor="motion-input" className="block font-display text-[0.75rem] uppercase tracking-[0.15em] text-gold-400 mb-2">
          The Motion Before the House
        </label>
        <textarea
          id="motion-input"
          placeholder="Enter the motion to be debated..."
          value={motion}
          onChange={e => setMotion(e.target.value)}
          rows={3}
          className="w-full px-6 py-4 bg-surface-2 border border-white/6 rounded-xl text-text-primary font-serif text-[1.05rem] leading-relaxed resize-y min-h-[80px] transition-colors duration-250 focus:outline-none focus:border-gold-500 focus:shadow-[0_0_15px_rgba(201,168,76,0.25)]"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {SAMPLE_MOTIONS.slice(0, 4).map((sample, i) => (
            <button
              key={i}
              onClick={() => setMotion(sample)}
              className="px-2 py-1 bg-surface-3 border border-white/6 rounded-md text-text-secondary text-[0.7rem] cursor-pointer transition-all duration-150 font-body hover:border-gold-500 hover:text-gold-400 hover:bg-gold-500/5"
            >
              {sample.substring(0, 50)}...
            </button>
          ))}
        </div>
      </section>

      {/* Model Selection */}
      <section className="w-full max-w-[1100px] animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-base text-text-primary tracking-wide">Select {totalSlots} Models</h2>
          <div className="flex gap-4 font-mono text-[0.8rem] text-text-secondary">
            <span>Selected: <span className={`font-semibold ${selectedModels.length >= totalSlots ? 'text-faction-for' : 'text-gold-400'}`}>{selectedModels.length}</span> / {totalSlots}</span>
            <span>│</span>
            <span>Judges: {SLOT_CONFIG.judges}</span>
            <span>Debaters: {SLOT_CONFIG.debaters}</span>
            <span>Spares: {SLOT_CONFIG.spares}</span>
          </div>
        </div>

        {/* Provider Tabs */}
        <div className="flex gap-1 mb-6">
          {['All', 'OpenRouter', 'HuggingFace'].map(tab => (
            <button
              key={tab}
              onClick={() => setProviderFilter(tab)}
              className={`px-4 py-1 rounded-md text-[0.8rem] cursor-pointer transition-all duration-150 font-body border
                ${providerFilter === tab
                  ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                  : 'bg-surface-2 border-white/6 text-text-secondary hover:border-gold-500'}
              `}
            >
              {tab === 'All' ? '🌐 All' : tab === 'OpenRouter' ? '🔀 OpenRouter' : '🤗 HuggingFace'}
            </button>
          ))}
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
          {filteredModels.map(model => {
            const isSelected = selectedModels.some(m => m.id === model.id);
            return (
              <div
                key={model.id}
                onClick={() => toggleModel(model)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all duration-250 border
                  ${isSelected
                    ? 'bg-gold-500/8 border-gold-500 shadow-[0_0_12px_rgba(201,168,76,0.25)]'
                    : 'bg-surface-2 border-white/6 hover:border-gold-500 hover:-translate-y-0.5 hover:shadow-sm'}
                `}
              >
                <div className="text-[1.3rem] w-9 h-9 flex items-center justify-center bg-surface-1 rounded-md">{model.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8rem] font-semibold text-text-primary truncate">{model.name}</div>
                  <div className="text-[0.65rem] text-text-dim font-mono">{model.provider}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[0.7rem] transition-all duration-150
                  ${isSelected ? 'bg-gold-500 border-gold-400 text-navy-900' : 'border-white/6'}
                `}>
                  {isSelected ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Start Button */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <button
          disabled={selectedModels.length < totalSlots || !motion.trim()}
          onClick={handleStart}
          className="px-12 py-4 font-display text-base tracking-wider uppercase bg-gradient-to-br from-gold-500 to-gold-400 text-navy-900 border border-gold-400 rounded-xl font-semibold cursor-pointer transition-all duration-250
            hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_30px_rgba(201,168,76,0.25)] hover:-translate-y-px
            disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          ⚖️ Commence Session
        </button>
        {selectedModels.length < totalSlots && (
          <p className="text-center text-text-dim text-[0.8rem] mt-2">
            Select {totalSlots - selectedModels.length} more model{totalSlots - selectedModels.length !== 1 ? 's' : ''} to begin
          </p>
        )}
      </section>
    </div>
  );
}
