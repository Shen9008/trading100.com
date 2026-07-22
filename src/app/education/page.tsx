import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getEducationGuides } from "@/lib/data/education";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { EDUCATION_KEYWORDS } from "@/lib/seo/page-seo";
import { TradingViewTickers } from "@/components/widgets/TradingViewTickers";

export const metadata: Metadata = buildMetadata({
  title: "Trading Education — Free Guides & Tutorials",
  description:
    "14+ free trading guides on moving averages, MACD, gold trading, forex position sizing, crypto, economic calendar, fibonacci, and trading psychology.",
  path: "/education",
  keywords: EDUCATION_KEYWORDS,
});

export default function EducationPage() {
  const guides = getEducationGuides();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Education", path: "/education" },
          ])
        )}
      />

      <PageShell
        title="Trading Education"
        description="Learn forex fundamentals, technical analysis, and risk management with our in-house guides."
        eyebrow="Academy"
        variant="education"
      >
        <TradingViewTickers />
        <div className="grid gap-4 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/education/${guide.slug}`}
              className="glass-panel-hover group cursor-pointer p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 transition-colors group-hover:border-brand/40">
                <BookOpen className="h-4 w-4 text-brand" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="education">{guide.level}</Badge>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {guide.readTime}
                </span>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold transition-colors group-hover:text-brand">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{guide.excerpt}</p>
            </Link>
          ))}
        </div>
      </PageShell>
    </>
  );
}
