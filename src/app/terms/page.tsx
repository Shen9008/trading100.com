import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms of service for Trading 100.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>DRAFT — Have reviewed by a lawyer before launch.</strong>
      </div>

      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: July 9, 2026</p>

      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <p>
          By accessing or using Trading 100 (trading100.com), you agree to these Terms of
          Service. If you do not agree, please do not use the site.
        </p>
        <h2 className="text-lg font-semibold">Use of the service</h2>
        <p>
          Trading 100 provides market data, news, analysis, and educational content for
          informational purposes. You may not reproduce, scrape, or redistribute our content
          without written permission.
        </p>
        <h2 className="text-lg font-semibold">Intellectual property</h2>
        <p>
          All original content, branding, and design on Trading 100 are owned by Trading 100
          or its licensors. Third-party trademarks and data remain the property of their
          respective owners.
        </p>
        <h2 className="text-lg font-semibold">Limitation of liability</h2>
        <p>
          Trading 100 is provided &quot;as is&quot; without warranties of any kind. We shall not be
          liable for any direct, indirect, incidental, or consequential damages arising from
          your use of the site or reliance on its content.
        </p>
        <h2 className="text-lg font-semibold">Changes</h2>
        <p>
          We may update these terms at any time. Continued use of the site after changes
          constitutes acceptance of the revised terms.
        </p>
        <h2 className="text-lg font-semibold">Governing law</h2>
        <p>
          These terms shall be governed by applicable laws in the jurisdiction where Trading
          100 operates, without regard to conflict of law principles.
        </p>
      </div>
    </div>
  );
}
