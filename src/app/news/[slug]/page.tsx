import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/metadata";
import {
  ORIGINAL_ARTICLES,
  resolveArticleBySlug,
  type Article,
  type ArticleCategory,
} from "@/lib/data/articles";
import { FORECAST_ARTICLES, getForecastBySlug } from "@/lib/data/forecasts";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { JsonLd, articleJsonLd, breadcrumbJsonLd, breadcrumbs } from "@/components/seo/JsonLd";
import { formatRelativeTime } from "@/lib/utils";
import { getArticleKeywords } from "@/lib/seo/page-seo";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import type { HeroVariant } from "@/lib/hero/variants";

type ArticlePageProps = {
  params: { slug: string };
};

async function getContentBySlug(slug: string): Promise<Article | undefined> {
  return (await resolveArticleBySlug(slug)) ?? (await getForecastBySlug(slug));
}

export async function generateStaticParams() {
  return [...ORIGINAL_ARTICLES, ...FORECAST_ARTICLES].map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await getContentBySlug(params.slug);
  if (!article) return buildMetadata({ title: "Article Not Found", noIndex: true });

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    ogImage: article.image,
    keywords: getArticleKeywords(article.category, article.title),
    ogType: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.publishedAt,
    authors: [article.author],
    section: article.category,
  });
}

function renderMarkdown(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mb-3 mt-6 text-xl font-bold">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("**") && block.includes("**:")) {
      const [bold, ...rest] = block.split(":");
      return (
        <p key={i} className="mb-3 leading-relaxed">
          <strong>{bold.replace(/\*\*/g, "")}:</strong>
          {rest.join(":")}
        </p>
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
      <p key={i} className="mb-3 leading-relaxed text-foreground/90">
        {block}
      </p>
    );
  });
}

function categoryToHeroVariant(category: ArticleCategory): HeroVariant {
  const map: Partial<Record<ArticleCategory, HeroVariant>> = {
    forex: "forex",
    crypto: "crypto",
    commodities: "commodities",
    indices: "indices",
    stocks: "stocks",
    forecast: "forecasts",
    education: "education",
  };
  return map[category] ?? "news";
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getContentBySlug(params.slug);
  if (!article) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <JsonLd
        data={breadcrumbJsonLd(
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.title, path: `/news/${article.slug}` },
          ])
        )}
      />

      <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
        <Link href="/news" className="text-sm text-brand hover:underline">
          ← Back to News
        </Link>

        <PageHeroBanner
          title={article.title}
          description={`By ${article.author} · ${formatRelativeTime(article.publishedAt)}${!article.isOriginal && article.sourceName ? ` · Syndicated from ${article.sourceName}` : ""}`}
          eyebrow={article.category}
          variant={categoryToHeroVariant(article.category)}
          image={article.image}
          className="mt-4"
        />

        <div className="prose prose-slate mt-8 max-w-none">
          {renderMarkdown(article.content)}
        </div>

        {!article.isOriginal && article.sourceUrl && (
          <p className="mt-6">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand hover:underline"
            >
              Read full article at {article.sourceName ?? "source"} →
            </a>
          </p>
        )}

        <DisclaimerBanner compact />
      </article>
    </>
  );
}
