import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";
import { JsonLd, breadcrumbJsonLd, breadcrumbs, webApplicationJsonLd } from "@/components/seo/JsonLd";
import { TOOLS_CONVERTER_KEYWORDS } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";

export const metadata: Metadata = buildMetadata({
  title: "Free Currency Converter — Live Exchange Rates",
  description:
    "Free currency converter using ECB reference exchange rates. Convert USD, EUR, GBP, JPY, and 30+ major world currencies instantly.",
  path: "/tools/currency-converter",
  keywords: TOOLS_CONVERTER_KEYWORDS,
});

export default function CurrencyConverterPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Currency Converter", path: "/tools/currency-converter" },
          ])
        )}
      />

      <JsonLd
        data={webApplicationJsonLd({
          name: "Currency Converter",
          description:
            "Free currency converter using ECB reference exchange rates. Convert USD, EUR, GBP, JPY, and 30+ major world currencies instantly.",
          url: "/tools/currency-converter",
        })}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <PageHeroBanner
          title="Currency Converter"
          description="Convert between major world currencies using European Central Bank reference rates."
          eyebrow="Tools"
          variant="converter"
          className="mb-10"
        />

        <CurrencyConverter />
      </div>
    </>
  );
}
