import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/constants";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description: `Learn about ${SITE_NAME} — live market data, analysis, and trading education.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "About", url: "https://trading100.com/about" },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <h1 className="text-3xl font-bold">About Trading 100</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
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
