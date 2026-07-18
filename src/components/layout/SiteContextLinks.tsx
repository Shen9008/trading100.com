"use client";

import { usePathname } from "next/navigation";
import { RelatedLinksPanel } from "@/components/content/RelatedLinksPanel";
import { getLinksForPath } from "@/lib/seo/site-links";

export function SiteContextLinks() {
  const pathname = usePathname() ?? "/";
  const { internal, external } = getLinksForPath(pathname);

  return <RelatedLinksPanel internal={internal} external={external} />;
}
