"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://widgets.tradingview-widget.com/w/en/tv-market-data.js";

const MARKET_DATA_SYMBOL_SECTORS = JSON.stringify([
  {
    sectionName: "Indices",
    symbols: [
      "FOREXCOM:SPXUSD",
      "FOREXCOM:NSXUSD",
      "FOREXCOM:DJI",
      "INDEX:NKY",
      "INDEX:DEU40",
      "FOREXCOM:UKXGBP",
      "NASDAQ:NDX",
      "TVC:DXY",
      "TVC:NI225",
      "KRX:KOSPI",
      "CAPITALCOM:HK50",
      "OANDA:CN50USD",
    ],
  },
  {
    sectionName: "Commodities",
    symbols: [
      "OANDA:XAUUSD",
      "OANDA:XAGUSD",
      "BLACKBULL:BRENT",
      "BLACKBULL:WTI",
      "FOREXCOM:NATURALGAS",
    ],
  },
  {
    sectionName: "Stocks",
    symbols: [
      "NASDAQ:AAPL",
      "NASDAQ:NVDA",
      "NASDAQ:TSLA",
      "NASDAQ:SPCX",
      "NASDAQ:MU",
      "NASDAQ:MSFT",
      "NASDAQ:META",
      "NASDAQ:AMZN",
      "NASDAQ:AMD",
      "NASDAQ:SNDK",
      "NASDAQ:INTC",
      "NASDAQ:AVGO",
      "NASDAQ:MRVL",
      "NYSE:TSM",
      "NYSE:IBM",
      "NYSE:UNH",
      "NASDAQ:WDC",
      "NASDAQ:WMT",
    ],
  },
  {
    sectionName: "Forex",
    symbols: [
      "FX:EURUSD",
      "FX:GBPUSD",
      "FX:USDJPY",
      "FX:USDCHF",
      "FX:AUDUSD",
      "FX:USDCAD",
    ],
  },
]);

function loadMarketDataScript(): Promise<void> {
  if (customElements.get("tv-market-data")) {
    return Promise.resolve();
  }

  const existing = document.querySelector(
    `script[src="${SCRIPT_SRC}"]`
  ) as HTMLScriptElement | null;

  if (existing) {
    return customElements.whenDefined("tv-market-data").then(() => undefined);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      customElements
        .whenDefined("tv-market-data")
        .then(() => resolve())
        .catch(reject);
    };
    script.onerror = () =>
      reject(new Error("Failed to load TradingView market data widget"));
    document.head.appendChild(script);
  });
}

export function TradingViewMarketData() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadMarketDataScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const widget = document.createElement("tv-market-data");
        widget.setAttribute("symbol-sectors", MARKET_DATA_SYMBOL_SECTORS);
        widget.setAttribute("view", "performance");
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
    <div className="tv-widget-container min-h-[480px] w-full overflow-hidden rounded-xl">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
