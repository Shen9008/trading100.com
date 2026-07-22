"use client";

import { useEffect, useRef } from "react";
import { FORECAST_TICKERS_SYMBOLS } from "@/lib/constants";

const SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-tickers.js";

function loadTickersScript(): Promise<void> {
  if (customElements.get("tv-tickers")) {
    return Promise.resolve();
  }

  const existing = document.querySelector(
    `script[src="${SCRIPT_SRC}"]`
  ) as HTMLScriptElement | null;

  if (existing) {
    return customElements.whenDefined("tv-tickers").then(() => undefined);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      customElements
        .whenDefined("tv-tickers")
        .then(() => resolve())
        .catch(reject);
    };
    script.onerror = () =>
      reject(new Error("Failed to load TradingView tickers widget"));
    document.head.appendChild(script);
  });
}

export function TradingViewTickers({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadTickersScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const widget = document.createElement("tv-tickers");
        widget.setAttribute("symbols", FORECAST_TICKERS_SYMBOLS);
        widget.setAttribute("hide-chart", "");
        widget.setAttribute("show-hover", "");
        containerRef.current.appendChild(widget);
      })
      .catch(() => {
        /* Widget failed to load — leave container empty */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className ?? "forecast-tickers-container mb-6"}>
      <div
        ref={containerRef}
        className="min-h-[3rem] w-full"
        aria-label="Live market tickers"
      />
    </div>
  );
}
