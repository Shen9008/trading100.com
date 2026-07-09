import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Get in touch with the Trading 100 editorial team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Contact", url: "https://trading100.com/contact" },
        ])}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="mt-4 text-muted-foreground">
          Have a question, correction, or partnership inquiry? We&apos;d love to hear from you.
        </p>

        <div className="mt-8 rounded-lg border bg-card p-6">
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
              <dt className="text-sm font-medium text-muted-foreground">Editorial</dt>
              <dd className="mt-1">
                <a href="mailto:editorial@trading100.com" className="text-brand hover:underline">
                  editorial@trading100.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Press</dt>
              <dd className="mt-1">
                <a href="mailto:press@trading100.com" className="text-brand hover:underline">
                  press@trading100.com
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          We typically respond within 2–3 business days. For urgent market data issues,
          please include the symbol and timestamp in your message.
        </p>
      </div>
    </>
  );
}
