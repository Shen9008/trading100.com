"use client";

import { useEffect, useRef } from "react";

type SymbolOverviewProps = {
  symbol: string;
  height?: number;
};

export function SymbolOverviewWidget({
  symbol,
  height = 400,
}: SymbolOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [[`${symbol}|1D`]],
      chartOnly: false,
      width: "100%",
      height,
      locale: "en",
      colorTheme: "dark",
      isTransparent: false,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      lineColor: "rgba(245, 158, 11, 1)",
      bottomColor: "rgba(245, 158, 11, 0.12)",
      topColor: "rgba(245, 158, 11, 0.4)",
      gridLineColor: "rgba(240, 243, 250, 0)",
    });
    containerRef.current.appendChild(script);
  }, [symbol, height]);

  return (
    <div className="tv-widget-container" style={{ height }}>
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}
