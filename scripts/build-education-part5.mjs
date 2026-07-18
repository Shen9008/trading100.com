import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const GUIDES = ["how-to-trade-brent-crude-oil-guide"];

function stripMdxBody(raw) {
  let body = raw.replace(/^---[\s\S]*?---\r?\n/, "");
  body = body.replace(/^# .+\r?\n\r?\n/, "");
  body = body.replace(/\r?\n## FAQ[\s\S]*?(?=\r?\n## Key Takeaways)/, "");
  body = body.replace(/\r?\n---\r?\n\r?\n\*\*Disclaimer:[\s\S]*$/, "");
  return body.trim();
}

function escapeContent(body) {
  return body.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildGuideEntry(slug) {
  const mdxPath = path.join(ROOT, "content/guides", `${slug}.mdx`);
  const metaPath = path.join(ROOT, "content/guides", `${slug}.meta.json`);
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const escaped = escapeContent(stripMdxBody(fs.readFileSync(mdxPath, "utf8")));

  const faqs = meta.faqs
    .map(
      (f) => `      {
        question: ${JSON.stringify(f.question)},
        answer: ${JSON.stringify(f.answer)},
      }`
    )
    .join(",\n");

  return `  {
    slug: ${JSON.stringify(meta.slug)},
    title: ${JSON.stringify(meta.title)},
    excerpt: ${JSON.stringify(meta.excerpt)},
    readTime: ${JSON.stringify(meta.readTime)},
    level: ${JSON.stringify(meta.level)},
    publishedAt: ${JSON.stringify(meta.publishedAt)},
    image: STOCK_IMAGES.${meta.imageKey},
    content: \`${escaped}\`,
    faqs: [
${faqs}
    ],
  }`;
}

const entries = GUIDES.map(buildGuideEntry).join(",\n");

const out = `import { STOCK_IMAGES } from "@/lib/constants/images";
import type { EducationGuide } from "./education-types";

export const EDUCATION_GUIDES_PART5: EducationGuide[] = [
${entries},
];
`;

const outPath = path.join(ROOT, "src/lib/data/education-guides-part5.ts");
fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (${GUIDES.length} guides)`);
