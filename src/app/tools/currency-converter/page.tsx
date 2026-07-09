import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Currency Converter",
  description:
    "Free currency converter using ECB reference exchange rates.",
  path: "/tools/currency-converter",
});

export default function CurrencyConverterPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          {
            name: "Currency Converter",
            url: "https://trading100.com/tools/currency-converter",
          },
        ])}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <h1 className="text-center text-3xl font-bold">Currency Converter</h1>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          Convert between major world currencies using European Central Bank reference rates.
        </p>

        <div className="mt-8">
          <CurrencyConverter />
        </div>
      </div>
    </>
  );
}
