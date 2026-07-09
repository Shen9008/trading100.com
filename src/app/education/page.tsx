import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getEducationGuides } from "@/lib/data/education";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Trading Education",
  description:
    "Free trading guides and tutorials on forex, technical analysis, risk management, and more.",
  path: "/education",
});

export default function EducationPage() {
  const guides = getEducationGuides();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Education", url: "https://trading100.com/education" },
        ])}
      />

      <PageShell
        title="Trading Education"
        description="Learn forex fundamentals, technical analysis, and risk management with our in-house guides."
        eyebrow="Academy"
      >
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
