import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { CONTACT_KEYWORDS } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";

export const metadata: Metadata = buildMetadata({
  title: "Contact Trading 100 — Editorial & Partnership Inquiries",
  description:
    "Get in touch with the Trading 100 editorial team for questions, corrections, or partnership inquiries.",
  path: "/contact",
  keywords: CONTACT_KEYWORDS,
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <PageHeroBanner
          title="Contact Us"
          description="Have a question, correction, or partnership inquiry? We'd love to hear from you."
          eyebrow="Get in Touch"
          variant="contact"
          className="mb-10"
        />

        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border bg-card p-6">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">General inquiries</dt>
                <dd className="mt-1">
                  <a href="mailto:hello@trading100.com" className="text-brand hover:underline">
                    hello@trading100.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Editorial & corrections</dt>
                <dd className="mt-1">
                  <a href="mailto:editorial@trading100.com" className="text-brand hover:underline">
                    editorial@trading100.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Partnerships</dt>
                <dd className="mt-1">
                  <a href="mailto:partners@trading100.com" className="text-brand hover:underline">
                    partners@trading100.com
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
