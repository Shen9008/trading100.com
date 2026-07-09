import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getLatestArticles } from "@/lib/data/articles";
import { fetchFinnhubNews } from "@/lib/api/finnhub";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Financial News",
  description: "Latest financial news covering forex, crypto, commodities, stocks, and global markets.",
  path: "/news",
});

export const revalidate = 300;

type NewsPageProps = {
  searchParams: { page?: string; category?: string };
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const perPage = 10;

  const originalArticles = getLatestArticles(50);
  const externalNews = await fetchFinnhubNews("general");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "https://trading100.com" },
          { name: "News", url: "https://trading100.com/news" },
        ])}
      />

      <PageShell
        title="Financial News"
        description="Original analysis from Trading 100 plus headlines from trusted sources."
        eyebrow="Newsroom"
      >
        <section aria-labelledby="original-news">
          <SectionHeader
            id="original-news"
            title="Trading 100 Analysis"
            eyebrow="Original"
          />
          <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
            {originalArticles
              .slice((page - 1) * perPage, page * perPage)
              .map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
          </GlassCard>

          {originalArticles.length > page * perPage && (
            <div className="mt-4 text-center">
              <Link
                href={`/news?page=${page + 1}`}
                className="cursor-pointer text-sm font-medium text-brand transition-colors hover:text-amber-200"
              >
                Load more →
              </Link>
            </div>
          )}
        </section>

        {externalNews.length > 0 && (
          <section className="mt-10" aria-labelledby="external-headlines">
            <SectionHeader
              id="external-headlines"
              title="Market Headlines"
              subtitle="Headlines from third-party providers — click through to read at the original publisher."
              eyebrow="Wire"
            />
            <div className="space-y-3">
              {externalNews.slice(0, 15).map((item) => (
                <article
                  key={item.id}
                  className="glass-panel-hover cursor-pointer p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{item.source}</span>
                    <span>·</span>
                    <time dateTime={new Date(item.datetime * 1000).toISOString()}>
                      {formatRelativeTime(new Date(item.datetime * 1000).toISOString())}
                    </time>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-semibold hover:text-brand"
                  >
                    {item.headline}
                  </a>
                  {item.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {!process.env.FINNHUB_API_KEY && externalNews.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
            Add <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-brand">FINNHUB_API_KEY</code> to enable external market headlines.
          </p>
        )}
      </PageShell>
    </>
  );
}
