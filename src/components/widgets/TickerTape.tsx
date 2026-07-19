"use client";

import { useEffect, useRef } from "react";
import { TICKER_TAPE_SYMBOLS } from "@/lib/constants";

const SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";

function loadTickerTapeScript(): Promise<void> {
  if (customElements.get("tv-ticker-tape")) {
    return Promise.resolve();
  }

  const existing = document.querySelector(
    `script[src="${SCRIPT_SRC}"]`
  ) as HTMLScriptElement | null;

  if (existing) {
    return customElements.whenDefined("tv-ticker-tape").then(() => undefined);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      customElements
        .whenDefined("tv-ticker-tape")
        .then(() => resolve())
        .catch(reject);
    };
    script.onerror = () =>
      reject(new Error("Failed to load TradingView ticker tape widget"));
    document.head.appendChild(script);
  });
}

export function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadTickerTapeScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const widget = document.createElement("tv-ticker-tape");
        widget.setAttribute("symbols", TICKER_TAPE_SYMBOLS);
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
    <div className="ticker-tape-container">
      <div
        ref={containerRef}
        className="h-12 w-full"
        aria-label="Live market ticker"
      />
    </div>
  );
}
