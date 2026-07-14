import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { BRAND_LOGO } from "@/lib/constants/brand";
import { seoUrl } from "@/lib/seo/urls";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: seoUrl(BRAND_LOGO),
    description:
      "Live market data, financial news, forecasts, and trading education for forex, crypto, commodities, indices, and stocks.",
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Live forex, crypto, commodities, and stock market data with news, forecasts, and trading education.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function articleJsonLd(
  article: {
    title: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    image: string;
    slug: string;
    category?: string;
  },
  path?: string
) {
  const articlePath = path ?? `/news/${article.slug}`;
  const isForecast = articlePath.startsWith("/forecasts/");

  return {
    "@context": "https://schema.org",
    "@type": isForecast ? "Article" : "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    image: article.image,
    url: seoUrl(articlePath),
    mainEntityOfPage: seoUrl(articlePath),
    articleSection: article.category,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: seoUrl(BRAND_LOGO),
      },
    },
  };
}

export function learningResourceJsonLd(guide: {
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  publishedAt: string;
  level: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: guide.title,
    description: guide.excerpt,
    url: seoUrl(`/education/${guide.slug}`),
    image: guide.image,
    datePublished: guide.publishedAt,
    educationalLevel: guide.level,
    learningResourceType: "Guide",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function financialProductJsonLd(product: {
  name: string;
  symbol: string;
  url: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: product.name,
    description: `Live ${product.name} (${product.symbol}) price chart and market data.`,
    url: product.url,
    category: product.category,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : seoUrl(item.url),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Build breadcrumb items using SITE_URL */
export function breadcrumbs(
  items: { name: string; path: string }[]
): { name: string; url: string }[] {
  return items.map((item) => ({
    name: item.name,
    url: seoUrl(item.path),
  }));
}
