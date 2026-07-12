import type { HeroVariant } from "@/lib/hero/variants";

type HeroGraphicProps = {
  variant: HeroVariant;
  className?: string;
};

function MarketsGraphic() {
  const candles = [
    { x: 20, h: 60, w: 12, up: true },
    { x: 44, h: 40, w: 12, up: false },
    { x: 68, h: 80, w: 12, up: true },
    { x: 92, h: 50, w: 12, up: true },
    { x: 116, h: 35, w: 12, up: false },
    { x: 140, h: 70, w: 12, up: true },
    { x: 164, h: 55, w: 12, up: false },
    { x: 188, h: 90, w: 12, up: true },
  ];
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="candleUp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(168 45% 55%)" />
          <stop offset="100%" stopColor="hsl(168 45% 40% / 0.4)" />
        </linearGradient>
        <linearGradient id="candleDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 65% 55%)" />
          <stop offset="100%" stopColor="hsl(0 65% 40% / 0.4)" />
        </linearGradient>
      </defs>
      {candles.map((c) => (
        <g key={c.x}>
          <line
            x1={c.x + c.w / 2}
            y1={110 - c.h - 10}
            x2={c.x + c.w / 2}
            y2={110}
            stroke={c.up ? "hsl(168 45% 55% / 0.6)" : "hsl(0 65% 55% / 0.6)"}
            strokeWidth="1.5"
          />
          <rect
            x={c.x}
            y={110 - c.h}
            width={c.w}
            height={c.h}
            rx="2"
            fill={c.up ? "url(#candleUp)" : "url(#candleDown)"}
          />
        </g>
      ))}
    </svg>
  );
}

function NewsGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0, ${i * 28})`}>
          <rect
            x="10"
            y="4"
            width={180 - i * 15}
            height="8"
            rx="4"
            fill="hsl(42 62% 58% / 0.5)"
          />
          <rect
            x="10"
            y="18"
            width={140 - i * 10}
            height="5"
            rx="2.5"
            fill="white"
            opacity="0.15"
          />
        </g>
      ))}
      <circle cx="195" cy="14" r="6" fill="hsl(0 65% 55%)">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function ForecastsGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="forecastLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(42 62% 58% / 0.3)" />
          <stop offset="100%" stopColor="hsl(168 45% 55%)" />
        </linearGradient>
      </defs>
      <path
        d="M10,95 C50,90 70,70 100,65 S150,40 210,20"
        fill="none"
        stroke="url(#forecastLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 0"
      />
      <path
        d="M10,95 C50,90 70,70 100,65 S150,40 210,20 L210,110 L10,110 Z"
        fill="hsl(168 45% 46% / 0.08)"
      />
      <line x1="10" y1="50" x2="210" y2="50" stroke="hsl(42 62% 58% / 0.3)" strokeDasharray="6 4" />
      <text x="12" y="46" fill="hsl(42 62% 58% / 0.7)" fontSize="8" fontFamily="monospace">
        TARGET
      </text>
      <circle cx="210" cy="20" r="5" fill="hsl(168 45% 55%)" />
    </svg>
  );
}

function EducationGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <path
        d="M30,40 L110,20 L190,40 L110,60 Z"
        fill="hsl(42 62% 58% / 0.2)"
        stroke="hsl(42 62% 58% / 0.5)"
        strokeWidth="1.5"
      />
      <path d="M30,40 L30,85 L110,105 L110,60" fill="hsl(42 62% 58% / 0.1)" stroke="hsl(42 62% 58% / 0.3)" strokeWidth="1" />
      <path d="M190,40 L190,85 L110,105 L110,60" fill="hsl(168 45% 46% / 0.1)" stroke="hsl(168 45% 46% / 0.3)" strokeWidth="1" />
      <path
        d="M50,90 C80,75 100,70 130,55 S170,40 190,30"
        fill="none"
        stroke="hsl(168 45% 55% / 0.7)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarGraphic() {
  const days = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <rect x="30" y="15" width="160" height="90" rx="8" fill="white" opacity="0.04" stroke="white" strokeOpacity="0.1" />
      <rect x="30" y="15" width="160" height="22" rx="8" fill="hsl(42 62% 58% / 0.25)" />
      {days.map((d) => {
        const col = d % 4;
        const row = Math.floor(d / 4);
        const highlight = d === 7 || d === 9;
        return (
          <rect
            key={d}
            x={40 + col * 36}
            y={44 + row * 18}
            width="28"
            height="14"
            rx="3"
            fill={highlight ? "hsl(0 65% 55% / 0.5)" : "white"}
            opacity={highlight ? 1 : 0.08}
          />
        );
      })}
    </svg>
  );
}

function ConverterGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <circle cx="110" cy="60" r="40" fill="none" stroke="hsl(42 62% 58% / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      {[
        { label: "$", x: 110, y: 22 },
        { label: "€", x: 168, y: 60 },
        { label: "£", x: 110, y: 98 },
        { label: "¥", x: 52, y: 60 },
      ].map(({ label, x, y }) => (
        <g key={label}>
          <circle cx={x} cy={y} r="16" fill="hsl(42 62% 58% / 0.15)" stroke="hsl(42 62% 58% / 0.4)" strokeWidth="1" />
          <text x={x} y={y + 5} textAnchor="middle" fill="hsl(42 70% 72%)" fontSize="14" fontWeight="bold">
            {label}
          </text>
        </g>
      ))}
      <text x="110" y="66" textAnchor="middle" fill="hsl(168 45% 55%)" fontSize="18" fontWeight="bold">
        ⇄
      </text>
    </svg>
  );
}

function GenericOrbGraphic({ color = "hsl(42 62% 58%)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <circle cx="110" cy="60" r="45" fill={color} opacity="0.08" />
      <circle cx="110" cy="60" r="30" fill={color} opacity="0.12" />
      <circle cx="110" cy="60" r="15" fill={color} opacity="0.25" />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 110 + Math.cos(rad) * 55;
        const y = 60 + Math.sin(rad) * 35;
        return <circle key={deg} cx={x} cy={y} r="4" fill={color} opacity="0.5" />;
      })}
    </svg>
  );
}

const GRAPHIC_MAP: Partial<Record<HeroVariant, () => JSX.Element>> = {
  markets: MarketsGraphic,
  news: NewsGraphic,
  forecasts: ForecastsGraphic,
  education: EducationGraphic,
  calendar: CalendarGraphic,
  converter: ConverterGraphic,
  forex: MarketsGraphic,
  crypto: () => <GenericOrbGraphic color="hsl(270 60% 60%)" />,
  commodities: () => <GenericOrbGraphic color="hsl(42 70% 50%)" />,
  stocks: NewsGraphic,
  indices: ForecastsGraphic,
  etfs: MarketsGraphic,
};

export function HeroGraphic({ variant, className }: HeroGraphicProps) {
  const Graphic = GRAPHIC_MAP[variant] ?? (() => <GenericOrbGraphic />);
  return (
    <div className={className} aria-hidden>
      <Graphic />
    </div>
  );
}
