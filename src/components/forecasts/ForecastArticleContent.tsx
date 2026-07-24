import dynamic from "next/dynamic";
import { MarkdownBody, MarkdownContent } from "@/components/content/MarkdownContent";
import { renderInline } from "@/lib/markdown/render-inline";
import {
  extractFaqItems,
  extractKeyLevels,
  extractOutlookScenarios,
  parseMarkdownSections,
} from "@/lib/markdown/parse-sections";
import type { ForecastChartConfig } from "@/lib/forecasts/chart-symbols";
import { stripChartPlaceholders } from "@/lib/forecasts/chart-symbols";
import { cn } from "@/lib/utils";

const ForecastChartEmbed = dynamic(
  () =>
    import("@/components/forecasts/ForecastChartEmbed").then(
      (module) => module.ForecastChartEmbed
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="my-6 h-[360px] animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.03] lg:h-[480px]"
        aria-hidden
      />
    ),
  }
);

function ForecastToc({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Article sections"
      className="mb-8 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand">
        In this analysis
      </p>
      <ol className="mt-3 space-y-2 text-sm">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-muted-foreground transition-colors hover:text-brand"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function KeyLevelsCard({ levels }: { levels: string[] }) {
  if (levels.length === 0) return null;

  return (
    <div className="my-4 grid gap-3 sm:grid-cols-3">
      {levels.map((level) => {
        const labelMatch = level.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
        const label = labelMatch?.[1] ?? "Level";
        const value = labelMatch?.[2] ?? level;

        return (
          <div
            key={level}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">
              {renderInline(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

const OUTLOOK_STYLES: Record<string, string> = {
  "bullish case": "border-emerald-500/30 bg-emerald-500/5",
  "bullish scenario": "border-emerald-500/30 bg-emerald-500/5",
  "bearish case": "border-red-500/30 bg-red-500/5",
  "bearish scenario": "border-red-500/30 bg-red-500/5",
  "base case": "border-brand/30 bg-brand/5",
};

function OutlookScenarios({
  scenarios,
}: {
  scenarios: { label: string; text: string }[];
}) {
  if (scenarios.length === 0) return null;

  return (
    <div className="my-4 grid gap-4 lg:grid-cols-3">
      {scenarios.map((scenario) => {
        const styleKey = scenario.label.toLowerCase();
        const style =
          OUTLOOK_STYLES[styleKey] ?? "border-white/[0.08] bg-white/[0.03]";

        return (
          <div
            key={scenario.label}
            className={cn("rounded-xl border p-4", style)}
          >
            <p className="text-sm font-semibold text-foreground">
              {scenario.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {renderInline(scenario.text)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FaqSection({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <dl className="mt-4 space-y-5">
      {items.map((item) => (
        <div
          key={item.question}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <dt className="font-semibold text-foreground">{item.question}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {renderInline(item.answer)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function isOutlookSection(title: string): boolean {
  return /outlook|forecast/i.test(title);
}

function isFaqSection(title: string): boolean {
  return /^faq$/i.test(title.trim());
}

function isTechnicalSection(title: string): boolean {
  return /technical analysis/i.test(title);
}

function splitKeyLevelsFromBody(body: string): {
  before: string;
  levels: string[];
  after: string;
} {
  const headerMatch = body.match(/\n### Key (?:Support and Resistance )?Levels[^\n]*\n/);
  if (!headerMatch) {
    return { before: stripChartPlaceholders(body), levels: [], after: "" };
  }

  const headerIndex = body.indexOf(headerMatch[0]);
  const before = body.slice(0, headerIndex).trim();
  const rest = body.slice(headerIndex + headerMatch[0].length);
  const chartMatch = rest.match(/\n(\[CHART:[^\]]+\])/);
  const levelsPart = chartMatch
    ? rest.slice(0, chartMatch.index)
    : rest.split(/\n(?=### )/)[0] ?? rest;
  const levels = extractKeyLevels(levelsPart.trim());
  const after = chartMatch
    ? rest.slice(chartMatch.index! + chartMatch[0].length).trim()
    : rest.slice(levelsPart.length).trim();

  return { before: stripChartPlaceholders(before), levels, after: stripChartPlaceholders(after) };
}

function ForecastChartSection({
  chart,
}: {
  chart: ForecastChartConfig;
}) {
  return (
    <ForecastChartEmbed
      symbol={chart.symbol}
      interval={chart.interval}
      caption={chart.caption}
    />
  );
}

function renderSectionBody(
  title: string,
  body: string,
  chart: ForecastChartConfig | null
) {
  if (isOutlookSection(title)) {
    const scenarios = extractOutlookScenarios(body);
    const remainder = body
      .split("\n\n")
      .filter((block) => !/^\*\*.+\*\*:/.test(block.trim()))
      .join("\n\n")
      .trim();

    return (
      <>
        {remainder && <MarkdownBody content={remainder} />}
        <OutlookScenarios scenarios={scenarios} />
      </>
    );
  }

  if (isFaqSection(title)) {
    const faqItems = extractFaqItems(body);
    const disclaimer = body
      .split("\n\n")
      .find(
        (block) =>
          block.startsWith("*") && block.endsWith("*") && !block.startsWith("**")
      );

    return (
      <>
        <FaqSection items={faqItems} />
        {disclaimer && (
          <MarkdownContent content={disclaimer} className="prose-content" />
        )}
      </>
    );
  }

  const { before, levels, after } = splitKeyLevelsFromBody(body);
  const showChart = chart && isTechnicalSection(title);

  return (
    <>
      {before && <MarkdownBody content={before} />}
      {levels.length > 0 && <KeyLevelsCard levels={levels} />}
      {showChart && <ForecastChartSection chart={chart} />}
      {after && <MarkdownBody content={after} />}
      {!before && levels.length === 0 && !after && !showChart && (
        <MarkdownBody content={stripChartPlaceholders(body)} />
      )}
    </>
  );
}

type ForecastArticleContentProps = {
  content: string;
  chart: ForecastChartConfig | null;
};

export function ForecastArticleContent({
  content,
  chart,
}: ForecastArticleContentProps) {
  const sanitizedContent = stripChartPlaceholders(content);
  const { intro, sections } = parseMarkdownSections(sanitizedContent);
  const tocSections = sections.filter((s) => !isFaqSection(s.title));

  return (
    <div className="forecast-article">
      {intro && (
        <div className="mb-8 rounded-xl border border-brand/15 bg-brand/5 px-5 py-4">
          <MarkdownContent content={intro} className="prose-content" skipH1 />
        </div>
      )}

      <ForecastToc sections={tocSections} />

      <div className="space-y-10">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 border-t border-white/[0.06] pt-8 first:border-t-0 first:pt-0"
          >
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {section.title}
            </h2>
            <div className="mt-4">
              {renderSectionBody(section.title, section.body, chart)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
