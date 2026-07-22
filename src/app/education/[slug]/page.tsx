import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import {
  getEducationGuide,
  getEducationGuides,
} from "@/lib/data/education";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, breadcrumbs, learningResourceJsonLd } from "@/components/seo/JsonLd";
import { EducationContent } from "@/components/education/EducationContent";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import { getEducationKeywords } from "@/lib/seo/page-seo";
import { TradingViewTickers } from "@/components/widgets/TradingViewTickers";

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
    ogImage: guide.image,
    keywords: getEducationKeywords(guide.slug),
    ogType: "article",
    publishedTime: guide.publishedAt,
    section: "Trading Education",
  });
}

export default function EducationArticlePage({ params }: EducationArticleProps) {
  const guide = getEducationGuide(params.slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Education", path: "/education" },
            { name: guide.title, path: `/education/${guide.slug}` },
          ])
        )}
      />
      <JsonLd
        data={learningResourceJsonLd({
          title: guide.title,
          excerpt: guide.excerpt,
          slug: guide.slug,
          image: guide.image,
          publishedAt: guide.publishedAt,
          level: guide.level,
        })}
      />
      {guide.faqs && <JsonLd data={faqJsonLd(guide.faqs)} />}

      <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <TradingViewTickers />
        <Link href="/education" className="text-sm text-brand hover:underline">
          ← All Guides
        </Link>

        <PageHeroBanner
          title={guide.title}
          description={`${guide.level} · ${guide.readTime} read — ${guide.excerpt}`}
          eyebrow="Trading Academy"
          variant="education"
          image={guide.image}
          className="mt-4"
        />

        <div className="mt-8">
          <EducationContent content={guide.content} />
        </div>

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
