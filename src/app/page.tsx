import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { FeaturedArticleCard } from "@/components/articles/FeaturedArticleCard";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { MarketDataTable } from "@/components/market/MarketDataTable";
import { HeroStrip } from "@/components/layout/HeroStrip";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { GlassCard } from "@/components/layout/GlassCard";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { HOME_KEYWORDS } from "@/lib/seo/page-seo";
import { fetchCryptoMarkets } from "@/lib/api/coingecko";
import {
  getFeaturedArticles,
  getMergedLatestArticles,
} from "@/lib/data/articles";
import { getEducationTeasers } from "@/lib/data/education";
import { getLatestForecasts } from "@/lib/data/forecasts";
import { getWireHeadlines } from "@/lib/api/wire-news";
import { WireHeadlines } from "@/components/news/WireHeadlines";
import { BookOpen } from "lucide-react";

const EconomicCalendarWidget = dynamic(
  () =>
    import("@/components/widgets/EconomicCalendar").then(
      (m) => m.EconomicCalendarWidget
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] animate-pulse rounded-xl bg-white/[0.03]" />
    ),
  }
);

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} — Live Market Data, News & Trading Education`,
  description: SITE_DESCRIPTION,
  path: "/",
  keywords: HOME_KEYWORDS,
});

export default async function HomePage() {
  let cryptoData: Awaited<ReturnType<typeof fetchCryptoMarkets>> = [];
  try {
    cryptoData = await fetchCryptoMarkets();
  } catch {
    /* CoinGecko fallback */
  }

  const featured = getFeaturedArticles();
  const [latest, todayForecasts, wireHeadlines] = await Promise.all([
    getMergedLatestArticles(8),
    getLatestForecasts(5),
    getWireHeadlines(8),
  ]);
  const education = getEducationTeasers(4);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <HeroStrip />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12 lg:px-6 lg:py-16">
        {/* Featured */}
        <section aria-labelledby="featured-heading" className="animate-fade-up">
          <SectionHeader
            id="featured-heading"
            title="Featured Analysis"
            subtitle="In-depth coverage of the stories moving markets today"
            eyebrow="Editorial"
            href="/news"
            linkLabel="All news"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeaturedArticleCard article={featured[0]} featured />
            {featured.slice(1).map((article) => (
              <FeaturedArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="mt-0" aria-labelledby="wire-heading">
          <SectionHeader
            id="wire-heading"
            title="Market Wire"
            subtitle="Live headlines from trusted financial news sources"
            eyebrow="Wire"
            href="/news"
            linkLabel="Full newsroom"
          />
          <WireHeadlines items={wireHeadlines} limit={8} compact />
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2" aria-labelledby="latest-heading">
            <SectionHeader
              id="latest-heading"
              title="Latest Headlines"
              subtitle="Fresh analysis and market-moving stories"
              eyebrow="News Feed"
              href="/news"
            />
            <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </GlassCard>
          </section>

          <section aria-labelledby="calendar-heading">
            <SectionHeader
              id="calendar-heading"
              title="Economic Calendar"
              subtitle="High-impact events ahead"
              eyebrow="Events"
              href="/tools/economic-calendar"
              linkLabel="Full calendar"
            />
            <GlassCard padding={false} className="overflow-hidden">
              <EconomicCalendarWidget height={320} importanceFilter="1" />
            </GlassCard>
          </section>
        </div>

        <section aria-labelledby="markets-heading">
          <SectionHeader
            id="markets-heading"
            title="Across the Market"
            subtitle="Real-time quotes across every major asset class"
            eyebrow="Market Data"
            href="/markets"
            linkLabel="All markets"
          />
          <GlassCard>
            <MarketDataTable cryptoData={cryptoData} />
          </GlassCard>
        </section>

        <section aria-labelledby="forecasts-heading">
          <SectionHeader
            id="forecasts-heading"
            title="Today's Market Forecasts"
            subtitle="Editorial outlooks plus auto-generated daily drafts from live market data"
            eyebrow="Outlook"
            href="/forecasts"
            linkLabel="All forecasts"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {todayForecasts.map((forecast) => (
              <FeaturedArticleCard
                key={forecast.slug}
                article={forecast}
                href={`/news/${forecast.slug}`}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="education-heading">
          <SectionHeader
            id="education-heading"
            title="Guides & Education"
            subtitle="Master the fundamentals of trading and technical analysis"
            eyebrow="Academy"
            href="/education"
            linkLabel="All guides"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {education.map((guide) => (
              <Link
                key={guide.slug}
                href={`/education/${guide.slug}`}
                className="glass-panel-hover group cursor-pointer rounded-2xl p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand/20 bg-gradient-to-br from-brand/15 to-transparent transition-all group-hover:border-brand/35">
                  <BookOpen className="h-4 w-4 text-brand" />
                </div>
                <span className="eyebrow">{guide.level}</span>
                <h3 className="mt-2 font-display text-base font-bold leading-snug transition-colors group-hover:text-brand">
                  {guide.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {guide.excerpt}
                </p>
                <p className="mt-4 font-mono text-[11px] text-muted-foreground/70">
                  {guide.readTime} read
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
