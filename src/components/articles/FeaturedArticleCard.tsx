import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Article, ArticleCategory } from "@/lib/data/articles";
import { ArrowUpRight } from "lucide-react";

const CATEGORY_VARIANT: Record<
  ArticleCategory,
  "forex" | "crypto" | "commodities" | "indices" | "stocks" | "education" | "forecast"
> = {
  forex: "forex",
  crypto: "crypto",
  commodities: "commodities",
  indices: "indices",
  stocks: "stocks",
  education: "education",
  forecast: "forecast",
};

type FeaturedArticleCardProps = {
  article: Article;
  href?: string;
  featured?: boolean;
};

export function FeaturedArticleCard({
  article,
  href,
  featured = false,
}: FeaturedArticleCardProps) {
  const link = href ?? `/news/${article.slug}`;

  return (
    <article
      className={`group glass-panel-hover cursor-pointer overflow-hidden ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <Link href={link} className="block">
        <div
          className={`relative w-full overflow-hidden ${
            featured ? "aspect-[16/10]" : "aspect-video"
          }`}
        >
          <Image
            src={article.image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            priority={featured}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={CATEGORY_VARIANT[article.category]}>
                {article.category}
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatRelativeTime(article.publishedAt)}
              </span>
            </div>
            <h3
              className={`font-display font-bold leading-tight text-foreground transition-colors group-hover:text-brand ${
                featured ? "text-xl sm:text-2xl" : "text-base"
              }`}
            >
              {article.title}
            </h3>
            {featured && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {article.excerpt}
              </p>
            )}
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              By {article.author}
              <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:opacity-100" />
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
