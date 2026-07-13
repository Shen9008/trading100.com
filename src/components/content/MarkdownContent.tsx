import Image from "next/image";
import { isOptimizedImageHost } from "@/lib/constants/images";
import { renderInline } from "@/lib/markdown/render-inline";

function MarkdownTable({ rows }: { rows: string[][] }) {
  if (rows.length < 2) return null;
  const [header, ...body] = rows;

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {renderInline(cell.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-t border-border">
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-muted-foreground">
                  {renderInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartBlock({ description }: { description: string }) {
  return (
    <div className="my-6 rounded-xl border border-brand/20 bg-brand/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        Chart placeholder
      </p>
      <p className="mt-2 font-mono text-sm leading-relaxed text-foreground/90">
        {description}
      </p>
    </div>
  );
}

function ContentImage({ alt, src }: { alt: string; src: string }) {
  const optimized = isOptimizedImageHost(src);
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border">
      {optimized ? (
        <Image
          src={src}
          alt={alt}
          width={800}
          height={450}
          className="h-auto w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-auto w-full object-cover" />
      )}
      {alt && (
        <figcaption className="px-4 py-2 text-center text-xs text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

type MarkdownContentProps = {
  content: string;
  className?: string;
  skipH1?: boolean;
};

function renderBlock(block: string, i: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
    return (
      <h1 key={i} className="mb-4 text-2xl font-bold tracking-tight">
        {renderInline(trimmed.replace(/^#\s+/, ""))}
      </h1>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={i} className="mb-3 mt-8 text-xl font-bold tracking-tight">
        {renderInline(trimmed.replace(/^##\s+/, ""))}
      </h2>
    );
  }

  if (trimmed.startsWith("### ")) {
    return (
      <h3 key={i} className="mb-2 mt-6 text-lg font-semibold">
        {renderInline(trimmed.replace(/^###\s+/, ""))}
      </h3>
    );
  }

  const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (imageMatch) {
    return <ContentImage key={i} alt={imageMatch[1]} src={imageMatch[2]} />;
  }

  const chartInlineMatch = trimmed.match(/^\[CHART:\s*(.+)\]$/);
  if (chartInlineMatch) {
    return <ChartBlock key={i} description={chartInlineMatch[1]} />;
  }

  if (trimmed.startsWith("[CHART]")) {
    const lines = trimmed
      .replace(/^\[CHART\]\n?/, "")
      .replace(/\[\/CHART\]$/, "")
      .split("\n");
    return <ChartBlock key={i} description={lines.join("\n")} />;
  }

  if (trimmed.includes("\n|") || trimmed.startsWith("|")) {
    const rows = trimmed
      .split("\n")
      .filter((line) => line.includes("|"))
      .map((line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim())
      )
      .filter((row) => !row.every((c) => /^-+$/.test(c)));
    if (rows.length > 0) {
      return <MarkdownTable key={i} rows={rows} />;
    }
  }

  if (trimmed.match(/^\d+\./)) {
    const items = trimmed.split("\n");
    return (
      <ol key={i} className="mb-4 list-decimal space-y-2 pl-6">
        {items.map((item, j) => (
          <li key={j} className="leading-relaxed text-muted-foreground">
            {renderInline(item.replace(/^\d+\.\s*/, ""))}
          </li>
        ))}
      </ol>
    );
  }

  if (trimmed.match(/^[-*]\s/m)) {
    const items = trimmed.split("\n").filter((l) => l.match(/^[-*]\s/));
    return (
      <ul key={i} className="mb-4 list-disc space-y-2 pl-6">
        {items.map((item, j) => (
          <li key={j} className="leading-relaxed text-muted-foreground">
            {renderInline(item.replace(/^[-*]\s*/, ""))}
          </li>
        ))}
      </ul>
    );
  }

  if (/^\*\*.+\*\*:/.test(trimmed)) {
    const match = trimmed.match(/^\*\*(.+?)\*\*:\s*([\s\S]*)$/);
    if (match) {
      return (
        <p key={i} className="mb-3 leading-relaxed text-muted-foreground">
          <strong className="font-semibold text-foreground">{match[1]}:</strong>{" "}
          {renderInline(match[2])}
        </p>
      );
    }
  }

  if (
    trimmed.startsWith("*") &&
    trimmed.endsWith("*") &&
    !trimmed.startsWith("**")
  ) {
    return (
      <p key={i} className="mt-6 text-sm italic text-muted-foreground">
        {trimmed.replace(/^\*|\*$/g, "")}
      </p>
    );
  }

  return (
    <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
      {renderInline(trimmed)}
    </p>
  );
}

export function MarkdownContent({
  content,
  className = "prose-content",
  skipH1 = false,
}: MarkdownContentProps) {
  const blocks = content.split("\n\n");

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (skipH1 && trimmed.startsWith("# ") && !trimmed.startsWith("## ")) {
          return null;
        }
        return renderBlock(block, i);
      })}
    </div>
  );
}

/** Render a section body without repeating its H2 heading. */
export function MarkdownBody({ content }: { content: string }) {
  const blocks = content.split("\n\n");
  return (
    <>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed.startsWith("## ")) return null;
        if (trimmed.startsWith("### Key Levels") || trimmed.startsWith("### Key Support")) return null;
        return renderBlock(block, i);
      })}
    </>
  );
}
