import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadataWithCanonical } from "@/lib/metadata";
import { getAutoPostedNews, getWireHeadlines } from "@/lib/api/wire-news";
import { MAX_AUTO_NEWS_ARCHIVE } from "@/lib/services/news-sync";
import { getLatestArticles, type Article } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { JsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { PageShell } from "@/components/layout/PageShell";
import { GlassCard } from "@/components/layout/GlassCard";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { NewsFeedPagination } from "@/components/news/NewsFeedPagination";
import { formatRelativeTime } from "@/lib/utils";
import { getNewsCategorySeo } from "@/lib/seo/page-seo";

export const revalidate = 300;

const PER_PAGE = 10;

const NEWS_CATEGORIES = new Set(["forex", "crypto", "stocks", "commodities", "indices"]);

function filterByCategory(articles: Article[], category?: string): Article[] {
  if (!category || !NEWS_CATEGORIES.has(category)) return articles;
  return articles.filter((a) => a.category === category);
}

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
  const category = searchParams.category;
  const isHubPage = page === 1;

  const [autoNews, editorialArticles, wireHeadlines] = await Promise.all([
    getAutoPostedNews(MAX_AUTO_NEWS_ARCHIVE),
    Promise.resolve(getLatestArticles(50)),
    getWireHeadlines(15),
  ]);

  const filteredAutoNews = filterByCategory(autoNews, category);
  const filteredEditorial = filterByCategory(editorialArticles, category);

  const totalPages = Math.max(1, Math.ceil(filteredAutoNews.length / PER_PAGE));

  if (page > totalPages && filteredAutoNews.length > 0) {
    notFound();
  }

  const paginatedNews = filteredAutoNews.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const categorySeo = category ? getNewsCategorySeo(category) : null;

  const breadcrumbItems = breadcrumbs([
    { name: "Home", path: "/" },
    { name: "News", path: "/news" },
    ...(page > 1 ? [{ name: `Page ${page}`, path: `/news?page=${page}` }] : []),
  ]);

  const shellDescription =
    page > 1
      ? `Page ${page} of ${totalPages} — browse older auto-syndicated market headlines.`
      : categorySeo
        ? categorySeo.description
        : "Auto-syndicated market news plus original analysis from Trading 100.";

  const pageTitle =
    page > 1
      ? `Financial News — Page ${page}`
      : categorySeo
        ? categorySeo.title
        : "Financial News";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />

      <PageShell
        title={pageTitle}
        description={shellDescription}
        eyebrow="Newsroom"
        variant="news"
        live={isHubPage}
      >
        {page > 1 && (
          <div className="mb-8">
            <Link
              href="/news"
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-amber-200"
            >
              ← Back to newsroom hub
            </Link>
          </div>
        )}

        <section aria-labelledby="auto-news">
          <SectionHeader
            id="auto-news"
            title={page > 1 ? "Market News Archive" : "Latest Market News"}
            subtitle={
              page > 1
                ? `Older Finnhub syndicated headlines — page ${page} of ${totalPages}.`
                : "Auto-syndicated headlines refreshed every few minutes from Finnhub"
            }
            eyebrow="Live Wire"
          />

          {paginatedNews.length > 0 ? (
            <>
              <NewsFeedPagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredAutoNews.length}
                perPage={PER_PAGE}
                category={category}
                className="mb-4"
              />

              <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
                {paginatedNews.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </GlassCard>

              <NewsFeedPagination
                page={page}
                totalPages={totalPages}
                totalItems={filteredAutoNews.length}
                perPage={PER_PAGE}
                category={category}
                className="mt-4"
              />
            </>
          ) : (
            <GlassCard className="border-dashed border-white/10">
              <p className="text-sm text-muted-foreground">
                No syndicated headlines on this page yet.{" "}
                <Link href="/news" className="text-brand hover:underline">
                  Return to the newsroom
                </Link>
                .
              </p>
            </GlassCard>
          )}
        </section>

        {isHubPage && (
          <>
            <section className="mt-10" aria-labelledby="original-news">
              <SectionHeader
                id="original-news"
                title="Trading 100 Analysis"
                eyebrow="Original"
              />
              <GlassCard padding={false} className="overflow-hidden px-4 sm:px-6">
                {filteredEditorial.slice(0, PER_PAGE).map((article) => (
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
                        <span className="font-medium text-foreground">
                          {item.source}
                        </span>
                        <span>·</span>
                        <time dateTime={new Date(item.datetime * 1000).toISOString()}>
                          {formatRelativeTime(
                            new Date(item.datetime * 1000).toISOString()
                          )}
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
          </>
        )}

        {!process.env.FINNHUB_API_KEY && filteredAutoNews.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
            Add{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-brand">
              FINNHUB_API_KEY
            </code>{" "}
            to enable auto-posted market news.
          </p>
        )}
      </PageShell>
    </>
  );
}
