import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";

const EconomicCalendarWidget = dynamic(
  () =>
    import("@/components/widgets/EconomicCalendar").then(
      (m) => m.EconomicCalendarWidget
    ),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse rounded-lg bg-muted" /> }
);

export const metadata: Metadata = buildMetadata({
  title: "Economic Calendar",
  description:
    "Upcoming economic events, central bank decisions, and high-impact data releases.",
  path: "/tools/economic-calendar",
});

export default function EconomicCalendarPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Economic Calendar", url: "https://trading100.com/tools/economic-calendar" },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <h1 className="text-3xl font-bold">Economic Calendar</h1>
        <p className="mt-2 text-muted-foreground">
          Track high-impact economic events that move forex, indices, and commodities.
        </p>

        <div className="mt-8">
          <EconomicCalendarWidget height={600} importanceFilter="0,1" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Calendar data provided by TradingView. Times shown in your local timezone.
        </p>
      </div>
    </>
  );
}
