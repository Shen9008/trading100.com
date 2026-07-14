import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./constants";
import { DEFAULT_OG_IMAGE } from "./seo/page-seo";

type PageMeta = {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
  /** When noIndex is true, allow crawlers to follow outbound links (e.g. syndicated news). */
  noIndexFollow?: boolean;
  keywords?: string[];
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
};

function resolveOgImage(ogImage?: string): string {
  const src = ogImage ?? DEFAULT_OG_IMAGE;
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  ogImage,
  noIndex = false,
  noIndexFollow = false,
  keywords,
  ogType = "website",
  publishedTime,
  modifiedTime,
  authors,
  section,
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const imageUrl = resolveOgImage(ogImage);

  const openGraphBase = {
    title: fullTitle,
    description,
    url,
    siteName: SITE_NAME,
    type: ogType,
    locale: "en_US" as const,
    images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    ...(ogType === "article"
      ? {
          publishedTime,
          modifiedTime,
          authors,
          section,
        }
      : {}),
  };

  const canonicalPath = (path ?? "").split("?")[0];
  const canonical = canonicalPath
    ? `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`
    : SITE_URL;

  return {
    title: fullTitle,
    description,
    keywords: keywords?.length ? keywords : undefined,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    openGraph: openGraphBase,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: noIndexFollow }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/** Canonical URL without query params for paginated/filtered views */
export function buildMetadataWithCanonical(
  meta: PageMeta & { canonicalPath?: string }
): Metadata {
  const base = buildMetadata(meta);
  const canonical = `${SITE_URL}${meta.canonicalPath ?? meta.path ?? ""}`.split("?")[0];
  return {
    ...base,
    alternates: { canonical },
  };
}
