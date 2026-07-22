import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import {
  FORECAST_ARTICLES,
  getForecastBySlug,
  getForecasts,
} from "@/lib/data/forecasts";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { ForecastArticleContent } from "@/components/forecasts/ForecastArticleContent";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  breadcrumbs,
  faqJsonLd,
} from "@/components/seo/JsonLd";
import { formatRelativeTime } from "@/lib/utils";
import { getArticleKeywords } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import { extractFaqItems, parseMarkdownSections } from "@/lib/markdown/parse-sections";
import type { HeroVariant } from "@/lib/hero/variants";
import type { ArticleCategory } from "@/lib/data/articles";
import { TradingViewTickers } from "@/components/widgets/TradingViewTickers";

type ForecastPageProps = {
  params: { slug: string };
};

function categoryToHeroVariant(category: ArticleCategory): HeroVariant {
  const map: Partial<Record<ArticleCategory, HeroVariant>> = {
    forex: "forex",
    crypto: "crypto",
    commodities: "commodities",
    indices: "indices",
    stocks: "stocks",
    forecast: "forecasts",
  };
  return map[category] ?? "forecasts";
}

export async function generateStaticParams() {
  const dynamic = await getForecasts("all");
  const slugs = new Set([
    ...FORECAST_ARTICLES.map((f) => f.slug),
    ...dynamic.map((f) => f.slug),
  ]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ForecastPageProps): Promise<Metadata> {
  const forecast = await getForecastBySlug(params.slug);
  if (!forecast) {
    return buildMetadata({ title: "Forecast Not Found", noIndex: true });
  }

  return buildMetadata({
    title: forecast.title,
    description: forecast.excerpt,
    path: `/forecasts/${forecast.slug}`,
    ogImage: forecast.image,
    keywords: getArticleKeywords(forecast.category, forecast.title),
    ogType: "article",
    publishedTime: forecast.publishedAt,
    modifiedTime: forecast.publishedAt,
    authors: [forecast.author],
    section: forecast.category,
  });
}

export default async function ForecastArticlePage({ params }: ForecastPageProps) {
  const forecast = await getForecastBySlug(params.slug);
  if (!forecast) notFound();

  const { sections } = parseMarkdownSections(forecast.content);
  const faqSection = sections.find((s) => /^faq$/i.test(s.title.trim()));
  const faqs = faqSection ? extractFaqItems(faqSection.body) : [];

  return (
    <>
      <JsonLd data={articleJsonLd(forecast, `/forecasts/${forecast.slug}`)} />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Forecasts", path: "/forecasts" },
            { name: forecast.title, path: `/forecasts/${forecast.slug}` },
          ])
        )}
      />
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}

      <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <TradingViewTickers />
        <Link href="/forecasts" className="text-sm text-brand hover:underline">
          ← All Forecasts
        </Link>

        <PageHeroBanner
          title={forecast.title}
          description={`By ${forecast.author} · ${formatRelativeTime(forecast.publishedAt)} · Educational outlook only`}
          eyebrow={forecast.category}
          variant={categoryToHeroVariant(forecast.category)}
          image={forecast.image}
          className="mt-4"
        />

        <div className="mt-8">
          <ForecastArticleContent content={forecast.content} />
        </div>

        <DisclaimerBanner compact />
      </article>
    </>
  );
}
