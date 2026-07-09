export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-grid-pattern bg-grid animate-grid-scroll opacity-40" />
      <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute -right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse-glow" />
    </div>
  );
}
