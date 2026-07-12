import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { TOOLS_CALENDAR_KEYWORDS } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";

const EconomicCalendarWidget = dynamic(
  () =>
    import("@/components/widgets/EconomicCalendar").then(
      (m) => m.EconomicCalendarWidget
    ),
  { ssr: false, loading: () => <div className="h-[600px] animate-pulse rounded-lg bg-muted" /> }
);

export const metadata: Metadata = buildMetadata({
  title: "Economic Calendar — Forex & Market Events",
  description:
    "Upcoming economic events, central bank decisions, NFP, CPI, and high-impact data releases that move forex and stock markets.",
  path: "/tools/economic-calendar",
  keywords: TOOLS_CALENDAR_KEYWORDS,
});

export default function EconomicCalendarPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Economic Calendar", path: "/tools/economic-calendar" },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <PageHeroBanner
          title="Economic Calendar"
          description="Track high-impact economic events that move forex, indices, and commodities."
          eyebrow="Tools"
          variant="calendar"
          className="mb-10"
        />

        <EconomicCalendarWidget height={600} importanceFilter="0,1" />

        <p className="mt-4 text-xs text-muted-foreground">
          Calendar data provided by TradingView. Times shown in your local timezone.
        </p>
      </div>
    </>
  );
}
