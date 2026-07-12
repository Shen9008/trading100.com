"use client";

import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

type TradingViewChartProps = {
  symbol: string;
  height?: number;
  mobileHeight?: number;
};

export function TradingViewChart({
  symbol,
  height,
  mobileHeight,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const widgetHeight = isMobile
    ? (mobileHeight ?? (height !== undefined ? Math.min(height, 400) : 360))
    : (height ?? 500);

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
      height: widgetHeight,
    });
    containerRef.current.appendChild(script);
  }, [symbol, widgetHeight]);

  return (
    <div className="tv-widget-container" style={{ height: widgetHeight }}>
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  );
}
