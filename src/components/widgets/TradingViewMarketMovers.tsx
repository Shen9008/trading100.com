"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-market-overview.js";

function loadMarketOverviewScript(): Promise<void> {
  if (customElements.get("tv-market-overview")) {
    return Promise.resolve();
  }

  const existing = document.querySelector(
    `script[src="${SCRIPT_SRC}"]`
  ) as HTMLScriptElement | null;

  if (existing) {
    return customElements.whenDefined("tv-market-overview").then(() => undefined);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      customElements
        .whenDefined("tv-market-overview")
        .then(() => resolve())
        .catch(reject);
    };
    script.onerror = () =>
      reject(new Error("Failed to load TradingView market overview widget"));
    document.head.appendChild(script);
  });
}

export function TradingViewMarketMovers() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadMarketOverviewScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const widget = document.createElement("tv-market-overview");
        widget.setAttribute("mode", "market-movers");
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
    <div className="tv-widget-container min-h-[420px] w-full overflow-hidden rounded-xl">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
