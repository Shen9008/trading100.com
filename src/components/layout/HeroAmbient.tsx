type HeroAmbientProps = {
  /** Accent hue for orb tinting, e.g. "42" for gold */
  accentHue?: number;
};

/** Pure-CSS ambient motion — orbs, scan line, particles, shifting gradient */
export function HeroAmbient({ accentHue = 42 }: HeroAmbientProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Slow-shifting color wash */}
      <div
        className="hero-gradient-shift absolute inset-0 opacity-40"
        style={
          {
            "--hero-accent-h": accentHue,
          } as React.CSSProperties
        }
      />

      {/* Floating light orbs */}
      <div
        className="hero-orb hero-orb-1 absolute h-40 w-40 rounded-full blur-3xl"
        style={{ background: `hsl(${accentHue} 62% 58% / 0.18)` }}
      />
      <div
        className="hero-orb hero-orb-2 absolute h-56 w-56 rounded-full blur-3xl"
        style={{ background: "hsl(168 45% 46% / 0.12)" }}
      />
      <div
        className="hero-orb hero-orb-3 absolute h-28 w-28 rounded-full blur-2xl"
        style={{ background: `hsl(${accentHue} 70% 65% / 0.15)` }}
      />

      {/* Drifting data particles */}
      <div className="hero-particles absolute inset-0" />

      {/* Horizontal scan beam */}
      <div className="hero-scan-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

      {/* Shimmer sweep */}
      <div className="hero-shimmer-sweep absolute inset-0" />
    </div>
  );
}

/** Pulsing live indicator for hero eyebrows */
export function HeroLivePulse({ label = "Live" }: { label?: string }) {
  return (
    <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 align-middle">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/70 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-brand">
        {label}
      </span>
    </span>
  );
}
