"use client";

import { useEffect, useRef } from "react";
import { TICKER_SYMBOLS } from "@/lib/constants";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;

    const initWidget = () => {
      if (!containerRef.current || !window.TradingView) return;
      containerRef.current.innerHTML = "";
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbols: TICKER_SYMBOLS.map((s) => ({ proName: s, title: s.split(":")[1] ?? s })),
        showSymbolLogo: true,
        colorTheme: "dark",
        isTransparent: true,
        displayMode: "adaptive",
        locale: "en",
      });
      loadedRef.current = true;
    };

    if (window.TradingView) {
      initWidget();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.onload = initWidget;
    document.body.appendChild(script);

    return () => {
      loadedRef.current = false;
    };
  }, []);

  return (
    <div className="ticker-tape-container">
      <div
        id="tradingview-ticker-tape"
        ref={containerRef}
        className="h-12 w-full"
        aria-label="Live market ticker"
      />
    </div>
  );
}
