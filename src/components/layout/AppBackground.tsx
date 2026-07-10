export function AppBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-noise opacity-60" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid animate-grid-scroll opacity-[0.35]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/25 to-transparent" />
      <div className="absolute -left-[20%] top-[5%] h-[520px] w-[520px] rounded-full bg-brand/[0.04] blur-[140px] animate-shimmer" />
      <div className="absolute -right-[15%] top-[35%] h-[420px] w-[420px] rounded-full bg-accent/[0.035] blur-[120px] animate-shimmer" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
