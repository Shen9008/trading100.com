export type MarkdownSection = {
  id: string;
  title: string;
  body: string;
};

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** Strip duplicate H1 when the page hero already shows the title. */
export function stripLeadingH1(content: string): string {
  return content.replace(/^#\s+.+\n\n?/, "");
}

/** Split forecast/article markdown into intro + H2 sections. */
export function parseMarkdownSections(content: string): {
  intro: string;
  sections: MarkdownSection[];
} {
  const normalized = stripLeadingH1(content.trim());
  const parts = normalized.split(/\n(?=## )/);
  const intro = parts[0]?.startsWith("## ") ? "" : (parts.shift() ?? "").trim();

  const sections: MarkdownSection[] = [];
  for (const part of parts) {
    const match = part.match(/^## (.+)\n([\s\S]*)$/);
    if (!match) continue;
    const title = match[1].trim();
    sections.push({
      id: slugifyHeading(title),
      title,
      body: match[2].trim(),
    });
  }

  return { intro, sections };
}

export function extractFaqItems(body: string): { question: string; answer: string }[] {
  return body
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => block.startsWith("**") && block.includes("**"))
    .map((block) => {
      const match = block.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
      if (!match) return null;
      return { question: match[1].trim(), answer: match[2].trim() };
    })
    .filter((item): item is { question: string; answer: string } => item !== null);
}

export function extractKeyLevels(body: string): string[] {
  return body
    .split("\n")
    .filter((line) => line.match(/^[-*]\s/))
    .map((line) => line.replace(/^[-*]\s*/, "").trim());
}

export function extractOutlookScenarios(body: string): {
  label: string;
  text: string;
}[] {
  return body
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => /^\*\*.+\*\*:/.test(block))
    .map((block) => {
      const match = block.match(/^\*\*(.+?)\*\*:\s*([\s\S]*)$/);
      if (!match) return null;
      return { label: match[1].trim(), text: match[2].trim() };
    })
    .filter((item): item is { label: string; text: string } => item !== null);
}
