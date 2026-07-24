import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for Trading 100 — how we collect, use, and protect your information when you visit our financial markets platform.",
  path: "/privacy-policy",
  keywords: ["privacy policy", "Trading 100 privacy", "data protection"],
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Privacy Policy", path: "/privacy-policy" },
          ])
        )}
      />
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
      <PageHeroBanner
        title="Privacy Policy"
        description="Last updated: July 9, 2026"
        eyebrow="Legal"
        variant="legal"
        compact
        className="mb-8"
      />

      <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>DRAFT — Have reviewed by a lawyer before launch.</strong>
      </div>

      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Trading 100 (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This policy
          describes how we collect, use, and protect information when you visit trading100.com.
        </p>
        <h2 className="text-lg font-semibold">Information we collect</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Usage data (pages visited, browser type, device type) via analytics</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Information you voluntarily submit (e.g., contact form emails)</li>
        </ul>
        <h2 className="text-lg font-semibold">How we use information</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>To operate and improve the website</li>
          <li>To analyze traffic and user behavior</li>
          <li>To respond to inquiries</li>
          <li>To comply with legal obligations</li>
        </ul>
        <h2 className="text-lg font-semibold">Third-party services</h2>
        <p>
          We use third-party services including TradingView (market widgets), analytics
          providers, and content delivery networks. These services may collect data according
          to their own privacy policies.
        </p>
        <h2 className="text-lg font-semibold">Your rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, or delete
          your personal data. Contact us at privacy@trading100.com to exercise these rights.
        </p>
        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:privacy@trading100.com" className="text-brand hover:underline">
            privacy@trading100.com
          </a>
        </p>
      </div>
      </div>
    </div>
    </>
  );
}
