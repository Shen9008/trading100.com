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

type ArticleCardProps = {
  article: Article;
  href?: string;
};

export function ArticleCard({ article, href }: ArticleCardProps) {
  const link = href ?? `/news/${article.slug}`;

  return (
    <article className="group flex cursor-pointer gap-4 border-b border-white/[0.06] py-5 last:border-0">
      <Link
        href={link}
        className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-lg sm:block"
      >
        <Image
          src={article.image}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="112px"
        />
        <div className="absolute inset-0 bg-brand/0 transition-colors group-hover:bg-brand/10" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Badge variant={CATEGORY_VARIANT[article.category]}>
            {article.category}
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatRelativeTime(article.publishedAt)}
          </span>
        </div>
        <Link href={link}>
          <h3 className="flex items-start gap-1 font-semibold leading-snug transition-colors group-hover:text-brand">
            {article.title}
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:opacity-100" />
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">By {article.author}</p>
      </div>
    </article>
  );
}
