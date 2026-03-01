export default function MotionBanner({ motion }) {
  if (!motion) return null;

  return (
    <div className="flex items-center justify-center gap-6 px-6 py-4 bg-gradient-to-br from-gold-500/8 via-transparent to-gold-500/8 border border-gold-500/15 rounded-2xl mb-6 animate-fade-in">
      <div className="text-[1.2rem] opacity-60">⚜️</div>
      <div className="text-center">
        <span className="block font-display text-[0.65rem] uppercase tracking-[0.2em] text-gold-400 mb-1">
          Motion Before the Chamber
        </span>
        <h2 className="font-serif text-[1.1rem] font-semibold text-text-primary italic leading-relaxed">
          "{motion}"
        </h2>
      </div>
      <div className="text-[1.2rem] opacity-60">⚜️</div>
    </div>
  );
}
