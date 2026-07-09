"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

type MarketOverviewProps = {
  tab?: "forex" | "crypto" | "commodities" | "indices" | "stocks";
  height?: number;
};

const TAB_CONFIG: Record<
  NonNullable<MarketOverviewProps["tab"]>,
  { tabName: string; symbols: { s: string; d: string }[] }
> = {
  forex: {
    tabName: "Forex",
    symbols: [
      { s: "FX:EURUSD", d: "EUR/USD" },
      { s: "FX:GBPUSD", d: "GBP/USD" },
      { s: "FX:USDJPY", d: "USD/JPY" },
      { s: "FX:AUDUSD", d: "AUD/USD" },
      { s: "FX:USDCAD", d: "USD/CAD" },
      { s: "FX:USDCHF", d: "USD/CHF" },
    ],
  },
  crypto: {
    tabName: "Crypto",
    symbols: [
      { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
      { s: "BINANCE:ETHUSDT", d: "Ethereum" },
      { s: "BINANCE:SOLUSDT", d: "Solana" },
      { s: "BINANCE:XRPUSDT", d: "XRP" },
      { s: "BINANCE:BNBUSDT", d: "BNB" },
      { s: "BINANCE:ADAUSDT", d: "Cardano" },
    ],
  },
  commodities: {
    tabName: "Commodities",
    symbols: [
      { s: "TVC:GOLD", d: "Gold" },
      { s: "TVC:SILVER", d: "Silver" },
      { s: "TVC:USOIL", d: "WTI Oil" },
      { s: "TVC:UKOIL", d: "Brent Oil" },
      { s: "TVC:NATURALGAS", d: "Natural Gas" },
      { s: "TVC:COPPER", d: "Copper" },
    ],
  },
  indices: {
    tabName: "Indices",
    symbols: [
      { s: "SP:SPX", d: "S&P 500" },
      { s: "NASDAQ:NDX", d: "Nasdaq 100" },
      { s: "DJ:DJI", d: "Dow Jones" },
      { s: "XETR:DAX", d: "DAX" },
      { s: "TVC:UKX", d: "FTSE 100" },
      { s: "TVC:NI225", d: "Nikkei 225" },
    ],
  },
  stocks: {
    tabName: "Stocks",
    symbols: [
      { s: "NASDAQ:AAPL", d: "Apple" },
      { s: "NASDAQ:MSFT", d: "Microsoft" },
      { s: "NASDAQ:GOOGL", d: "Alphabet" },
      { s: "NASDAQ:AMZN", d: "Amazon" },
      { s: "NASDAQ:NVDA", d: "NVIDIA" },
      { s: "NASDAQ:TSLA", d: "Tesla" },
    ],
  },
};

export function MarketOverviewWidget({
  tab = "forex",
  height = 400,
}: MarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = TAB_CONFIG[tab];
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "1D",
      showChart: true,
      locale: "en",
      width: "100%",
      height,
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(22, 163, 74, 1)",
      plotLineColorFalling: "rgba(220, 38, 38, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(120, 123, 134, 1)",
      belowLineFillColorGrowing: "rgba(22, 163, 74, 0.12)",
      belowLineFillColorFalling: "rgba(220, 38, 38, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(22, 163, 74, 0)",
      belowLineFillColorFallingBottom: "rgba(220, 38, 38, 0)",
      symbolActiveColor: "rgba(245, 158, 11, 0.12)",
      tabs: [
        {
          title: config.tabName,
          symbols: config.symbols,
          originalTitle: config.tabName,
        },
      ],
    });
    containerRef.current.appendChild(script);
  }, [tab, height]);

  return (
    <div className="tv-widget-container">
      <div ref={containerRef} className="tradingview-widget-container w-full" />
    </div>
  );
}
