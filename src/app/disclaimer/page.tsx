import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer",
  description: "Legal disclaimer and risk disclosure for Trading 100.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>DRAFT — Have reviewed by a lawyer before launch.</strong>
      </div>

      <h1 className="text-3xl font-bold">Disclaimer</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>
          The information provided on Trading 100 (trading100.com) is for general
          informational and educational purposes only. Nothing on this website
          constitutes financial advice, investment advice, trading advice, or any
          other sort of advice, and you should not treat any of the website&apos;s
          content as such.
        </p>
        <h2 className="text-lg font-semibold">No fiduciary relationship</h2>
        <p>
          Trading 100 does not recommend that any financial instrument should be
          bought, sold, or held by you. Do conduct your own due diligence and consult
          your financial advisor before making any investment decisions.
        </p>
        <h2 className="text-lg font-semibold">Market data accuracy</h2>
        <p>
          Prices, quotes, and market data displayed on Trading 100 may be delayed,
          approximate, or sourced from third-party providers. We do not guarantee the
          accuracy, completeness, or timeliness of any data. Trading 100 shall not be
          liable for any losses arising from reliance on information published on this site.
        </p>
        <h2 className="text-lg font-semibold">Risk warning</h2>
        <p>
          Trading foreign exchange, contracts for difference (CFDs), cryptocurrencies,
          and other leveraged products carries a high level of risk and may not be suitable
          for all investors. You could lose some or all of your invested capital. Past
          performance is not indicative of future results.
        </p>
        <h2 className="text-lg font-semibold">Third-party content</h2>
        <p>
          News headlines and links may point to external publishers. Trading 100 does not
          control or endorse third-party content and is not responsible for its accuracy
          or availability.
        </p>
        <h2 className="text-lg font-semibold">Affiliate disclosure</h2>
        <p>
          Trading 100 may earn compensation through affiliate partnerships with brokers
          or financial service providers. Such relationships do not influence our editorial
          content, which remains independently produced.
        </p>
      </div>
      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
