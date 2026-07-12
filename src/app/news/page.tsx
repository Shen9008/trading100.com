import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadataWithCanonical } from "@/lib/metadata";
import { getAutoPostedNews, getWireHeadlines } from "@/lib/api/wire-news";
import { getLatestArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { formatRelativeTime } from "@/lib/utils";
import { getNewsCategorySeo } from "@/lib/seo/page-seo";

export const revalidate = 300;

type NewsPageProps = {
  searchParams: { page?: string; category?: string };
};

export async function generateMetadata({
  searchParams,
}: NewsPageProps): Promise<Metadata> {
  const category = searchParams.category;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const seo = getNewsCategorySeo(category);

  const title =
    page > 1 ? `${seo.title} — Page ${page}` : seo.title;

  const path =
    page > 1
      ? `${seo.path}${seo.path.includes("?") ? "&" : "?"}page=${page}`
      : seo.path;

  return buildMetadataWithCanonical({
    title,
    description: seo.description,
    path,
    canonicalPath: seo.path.split("?")[0],
    keywords: seo.keywords,
  });
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const perPage = 10;

  const [autoNews, editorialArticles, wireHeadlines] = await Promise.all([
    getAutoPostedNews(20),
    Promise.resolve(getLatestArticles(50)),
    getWireHeadlines(15),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
          ])
        )}
      />

      <PageShell
        title="Financial News"
        description="Auto-syndicated market news plus original analysis from Trading 100."
        eyebrow="Newsroom"
        variant="news"
        live
      >
        <section aria-labelledby="auto-news">
          <SectionHeader
            id="auto-news"
            title="Latest Market News"
            subtitle="Auto-syndicated headlines refreshed every few minutes from NewsAPI"
            eyebrow="Live Wire"
          />
          <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
            {autoNews
              .slice((page - 1) * perPage, page * perPage)
              .map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
          </GlassCard>

          {autoNews.length > page * perPage && (
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

        <section className="mt-10" aria-labelledby="original-news">
          <SectionHeader
            id="original-news"
            title="Trading 100 Analysis"
            eyebrow="Original"
          />
          <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
            {editorialArticles.slice(0, perPage).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </GlassCard>
        </section>

        {wireHeadlines.length > 0 && (
          <section className="mt-10" aria-labelledby="external-headlines">
            <SectionHeader
              id="external-headlines"
              title="More Headlines"
              subtitle="Additional wire stories — click through to read at the original publisher."
              eyebrow="Wire"
            />
            <div className="space-y-3">
              {wireHeadlines.slice(0, 15).map((item) => (
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

        {!process.env.NEWSAPI_API_KEY &&
          !process.env.MARKETAUX_API_KEY &&
          autoNews.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
            Add <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-brand">NEWSAPI_API_KEY</code> to enable auto-posted market news.
          </p>
        )}
      </PageShell>
    </>
  );
}
