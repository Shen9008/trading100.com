"use client";

import { useEffect, useRef } from "react";

type TradingViewChartProps = {
  symbol: string;
  height?: number;
};

export function TradingViewChart({ symbol, height = 500 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      height,
    });
    containerRef.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div className="tv-widget-container" style={{ height }}>
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}
