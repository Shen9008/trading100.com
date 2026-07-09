"use client";

import { useEffect, useRef } from "react";

type EconomicCalendarWidgetProps = {
  height?: number;
  importanceFilter?: "-1,0,1" | "1" | "0,1";
};

export function EconomicCalendarWidget({
  height = 450,
  importanceFilter = "0,1",
}: EconomicCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: false,
      width: "100%",
      height,
      locale: "en",
      importanceFilter,
      countryFilter: "us,eu,gb,jp,cn,au,ca",
    });
    containerRef.current.appendChild(script);
  }, [height, importanceFilter]);

  return (
    <div className="tv-widget-container" style={{ height }}>
      <div ref={containerRef} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}
