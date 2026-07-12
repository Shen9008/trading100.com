"use client";

import { useId } from "react";
import type { HeroVariant } from "@/lib/hero/variants";

type HeroGraphicProps = {
  variant: HeroVariant;
  className?: string;
};

function MarketsGraphic({ uid }: { uid: string }) {
  const candles = [
    { x: 20, h: 60, w: 12, up: true, delay: 0 },
    { x: 44, h: 40, w: 12, up: false, delay: 0.1 },
    { x: 68, h: 80, w: 12, up: true, delay: 0.2 },
    { x: 92, h: 50, w: 12, up: true, delay: 0.3 },
    { x: 116, h: 35, w: 12, up: false, delay: 0.4 },
    { x: 140, h: 70, w: 12, up: true, delay: 0.5 },
    { x: 164, h: 55, w: 12, up: false, delay: 0.6 },
    { x: 188, h: 90, w: 12, up: true, delay: 0.7 },
  ];
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-candleUp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(168 45% 55%)" />
          <stop offset="100%" stopColor="hsl(168 45% 40% / 0.4)" />
        </linearGradient>
        <linearGradient id={`${uid}-candleDown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 65% 55%)" />
          <stop offset="100%" stopColor="hsl(0 65% 40% / 0.4)" />
        </linearGradient>
      </defs>
      {candles.map((c) => (
        <g
          key={c.x}
          className="hero-candle-pop"
          style={{ animationDelay: `${c.delay}s` }}
        >
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
            fill={c.up ? `url(#${uid}-candleUp)` : `url(#${uid}-candleDown)`}
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
        <g
          key={i}
          transform={`translate(0, ${i * 28})`}
          className="hero-headline-slide"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
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
      <circle cx="195" cy="14" r="6" fill="hsl(0 65% 55%)" className="hero-pulse-dot" />
      <text x="175" y="17" fill="hsl(0 65% 55% / 0.8)" fontSize="7" fontFamily="monospace" className="hero-pulse-dot">
        LIVE
      </text>
    </svg>
  );
}

function ForecastsGraphic({ uid }: { uid: string }) {
  const pathD = "M10,95 C50,90 70,70 100,65 S150,40 210,20";
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-forecastLine`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(42 62% 58% / 0.3)" />
          <stop offset="100%" stopColor="hsl(168 45% 55%)" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L210,110 L10,110 Z`} fill="hsl(168 45% 46% / 0.08)" />
      <path
        d={pathD}
        fill="none"
        stroke={`url(#${uid}-forecastLine)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength="1"
        className="hero-line-draw"
      />
      <line
        x1="10"
        y1="50"
        x2="210"
        y2="50"
        stroke="hsl(42 62% 58% / 0.3)"
        strokeDasharray="6 4"
        className="hero-dash-march"
      />
      <circle cx="210" cy="20" r="5" fill="hsl(168 45% 55%)" className="hero-pulse-dot" />
    </svg>
  );
}

function EducationGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full hero-book-float" aria-hidden>
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
        pathLength="1"
        className="hero-line-draw"
        style={{ animationDelay: "0.5s" }}
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
            className={highlight ? "hero-calendar-pulse" : undefined}
            style={highlight ? { animationDelay: `${d * 0.3}s` } : undefined}
          />
        );
      })}
    </svg>
  );
}

function ConverterGraphic() {
  const symbols = [
    { label: "$", x: 110, y: 22, delay: 0 },
    { label: "€", x: 168, y: 60, delay: 0.5 },
    { label: "£", x: 110, y: 98, delay: 1 },
    { label: "¥", x: 52, y: 60, delay: 1.5 },
  ];
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <circle
        cx="110"
        cy="60"
        r="40"
        fill="none"
        stroke="hsl(42 62% 58% / 0.2)"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="hero-dash-march"
      />
      {symbols.map(({ label, x, y, delay }) => (
        <g key={label} className="hero-orbit-item" style={{ animationDelay: `${delay}s` }}>
          <circle cx={x} cy={y} r="16" fill="hsl(42 62% 58% / 0.15)" stroke="hsl(42 62% 58% / 0.4)" strokeWidth="1" />
          <text x={x} y={y + 5} textAnchor="middle" fill="hsl(42 70% 72%)" fontSize="14" fontWeight="bold">
            {label}
          </text>
        </g>
      ))}
      <text x="110" y="66" textAnchor="middle" fill="hsl(168 45% 55%)" fontSize="18" fontWeight="bold" className="hero-swap-pulse">
        ⇄
      </text>
    </svg>
  );
}

function CryptoGraphic() {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden>
      <circle cx="110" cy="60" r="35" fill="hsl(270 60% 60% / 0.1)" stroke="hsl(270 60% 60% / 0.3)" strokeWidth="1" />
      <text x="110" y="66" textAnchor="middle" fill="hsl(270 70% 70%)" fontSize="22" fontWeight="bold">
        ₿
      </text>
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x = 110 + Math.cos(rad) * 50;
        const y = 60 + Math.sin(rad) * 32;
        return (
          <circle
            key={deg}
            cx={x}
            cy={y}
            r="3"
            fill="hsl(270 60% 65%)"
            className="hero-orbit-item"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        );
      })}
    </svg>
  );
}

function GenericOrbGraphic({ color = "hsl(42 62% 58%)" }: { color?: string }) {
  return (
    <svg viewBox="0 0 220 120" className="h-full w-full hero-book-float" aria-hidden>
      <circle cx="110" cy="60" r="45" fill={color} opacity="0.08" />
      <circle cx="110" cy="60" r="30" fill={color} opacity="0.12" className="hero-pulse-dot" />
      <circle cx="110" cy="60" r="15" fill={color} opacity="0.25" />
    </svg>
  );
}

export function HeroGraphic({ variant, className }: HeroGraphicProps) {
  const uid = useId().replace(/:/g, "");

  const graphics: Partial<Record<HeroVariant, JSX.Element>> = {
    markets: <MarketsGraphic uid={uid} />,
    news: <NewsGraphic />,
    forecasts: <ForecastsGraphic uid={uid} />,
    education: <EducationGraphic />,
    calendar: <CalendarGraphic />,
    converter: <ConverterGraphic />,
    forex: <MarketsGraphic uid={uid} />,
    crypto: <CryptoGraphic />,
    commodities: <GenericOrbGraphic color="hsl(42 70% 50%)" />,
    stocks: <NewsGraphic />,
    indices: <ForecastsGraphic uid={uid} />,
    etfs: <MarketsGraphic uid={uid} />,
  };

  return (
    <div className={className} aria-hidden>
      {graphics[variant] ?? <GenericOrbGraphic />}
    </div>
  );
}
