import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import {
  getEducationGuide,
  getEducationGuides,
} from "@/lib/data/education";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";

type EducationArticleProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return getEducationGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: EducationArticleProps): Promise<Metadata> {
  const guide = getEducationGuide(params.slug);
  if (!guide) return buildMetadata({ title: "Guide Not Found", noIndex: true });

  return buildMetadata({
    title: guide.title,
    description: guide.excerpt,
    path: `/education/${guide.slug}`,
  });
}

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mb-3 mt-6 text-xl font-bold">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.match(/^\d+\./)) {
      const items = block.split("\n");
      return (
        <ol key={i} className="mb-4 list-decimal space-y-1 pl-6">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^\d+\.\s*/, "")}</li>
          ))}
        </ol>
      );
    }
    if (block.startsWith("*") && block.endsWith("*")) {
      return (
        <p key={i} className="mt-6 text-sm italic text-muted-foreground">
          {block.replace(/^\*|\*$/g, "")}
        </p>
      );
    }
    return (
      <p key={i} className="mb-3 leading-relaxed">
        {block}
      </p>
    );
  });
}

export default function EducationArticlePage({ params }: EducationArticleProps) {
  const guide = getEducationGuide(params.slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "Education", url: "https://trading100.com/education" },
          {
            name: guide.title,
            url: `https://trading100.com/education/${guide.slug}`,
          },
        ])}
      />
      {guide.faqs && <JsonLd data={faqJsonLd(guide.faqs)} />}

      <article className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
        <Link href="/education" className="text-sm text-brand hover:underline">
          ← All Guides
        </Link>

        <header className="mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="education">{guide.level}</Badge>
            <span className="text-sm text-muted-foreground">{guide.readTime} read</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{guide.title}</h1>
          <p className="mt-2 text-muted-foreground">{guide.excerpt}</p>
        </header>

        <div className="mt-8">{renderContent(guide.content)}</div>

        {guide.faqs && guide.faqs.length > 0 && (
          <section className="mt-10" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-bold">
              Frequently Asked Questions
            </h2>
            <dl className="mt-4 space-y-4">
              {guide.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-semibold">{faq.question}</dt>
                  <dd className="mt-1 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <DisclaimerBanner compact />
      </article>
    </>
  );
}
