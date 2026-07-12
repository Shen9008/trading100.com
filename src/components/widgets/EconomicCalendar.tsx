"use client";

import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-media-query";

type EconomicCalendarWidgetProps = {
  height?: number;
  mobileHeight?: number;
  importanceFilter?: "-1,0,1" | "1" | "0,1";
};

export function EconomicCalendarWidget({
  height,
  mobileHeight,
  importanceFilter = "0,1",
}: EconomicCalendarWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const resolvedHeight = isMobile
    ? (mobileHeight ?? (height !== undefined ? Math.min(height, 420) : 360))
    : (height ?? 450);

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
      height: resolvedHeight,
      locale: "en",
      importanceFilter,
      countryFilter: "us,eu,gb,jp,cn,au,ca",
    });
    containerRef.current.appendChild(script);
  }, [resolvedHeight, importanceFilter]);

  return (
    <div className="tv-widget-container" style={{ height: resolvedHeight }}>
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  );
}
