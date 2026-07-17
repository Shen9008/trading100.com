import Link from "next/link";
import type { ReactNode } from "react";

const LINK_CLASS =
  "cursor-pointer text-brand underline underline-offset-2 hover:text-amber-200 break-words";

const URL_REGEX = /(https?:\/\/[^\s<>\]\)\"']+)/g;
const HTML_ANCHOR_REGEX =
  /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

function normalizeHtmlAnchors(text: string): string {
  return text.replace(HTML_ANCHOR_REGEX, "[$2]($1)");
}

function renderHref(href: string, label: string, key: string | number): ReactNode {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (isInternal) {
    return (
      <Link key={key} href={href} className={LINK_CLASS}>
        {label}
      </Link>
    );
  }
  return (
    <a
      key={key}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK_CLASS}
    >
      {label}
    </a>
  );
}

function autoLinkPlainText(text: string, keyPrefix: string): ReactNode[] {
  const segments = text.split(URL_REGEX);
  return segments
    .map((segment, j) => {
      if (!segment) return null;
      if (/^https?:\/\//.test(segment)) {
        return renderHref(segment, segment, `${keyPrefix}-url-${j}`);
      }
      return segment;
    })
    .filter((node): node is ReactNode => node !== null);
}

export function renderInline(text: string): ReactNode[] {
  const normalized = normalizeHtmlAnchors(text);
  const parts = normalized.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  const nodes: ReactNode[] = [];

  parts.forEach((part, i) => {
    if (!part) return;

    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
      return;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      nodes.push(renderHref(href, label, i));
      return;
    }

    nodes.push(...autoLinkPlainText(part, String(i)));
  });

  return nodes;
}
