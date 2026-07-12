import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { ABOUT_KEYWORDS } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";

export const metadata: Metadata = buildMetadata({
  title: "About Trading 100 — Market Data & Trading Education",
  description: `Learn about ${SITE_NAME} — independent financial markets media with live data, news, forecasts, and trading education for forex, crypto, and stocks.`,
  path: "/about",
  keywords: ABOUT_KEYWORDS,
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <PageHeroBanner
          title="About Trading 100"
          description="Independent financial markets media for traders who want clarity, data, and education — without the noise."
          eyebrow="Our Story"
          variant="about"
          className="mb-10"
        />

        <div className="mx-auto max-w-3xl space-y-4 leading-relaxed text-foreground/90">
          <p>
            Trading 100 is an independent financial markets media platform built for
            traders and investors who want clear data, thoughtful analysis, and
            practical education — without the noise.
          </p>
          <p>
            We cover forex, cryptocurrencies, commodities, indices, and equities with
            live market data, original forecasts, and beginner-friendly guides. Our
            mission is to help you understand markets better so you can make more
            informed decisions.
          </p>
          <h2 className="pt-4 text-xl font-semibold">What we offer</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Real-time market quotes via trusted third-party data providers</li>
            <li>Original editorial analysis and market forecasts</li>
            <li>Curated financial news headlines with links to source publishers</li>
            <li>Free trading education and glossary-style guides</li>
            <li>Economic calendar and currency conversion tools</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Trading 100 is not a broker, investment advisor, or financial institution.
            We do not execute trades or manage client funds.
          </p>
        </div>
      </div>
    </>
  );
}
