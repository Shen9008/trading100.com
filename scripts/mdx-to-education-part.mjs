import fs from "fs";

const mdxPath = process.argv[2];
const outPath = process.argv[3];
const metaPath = process.argv[4];
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

if (!mdxPath || !outPath || !meta.slug) {
  console.error("Usage: node mdx-to-education-part.mjs <mdx> <out.ts> <meta-json>");
  process.exit(1);
}

let body = fs.readFileSync(mdxPath, "utf8").replace(/^---[\s\S]*?---\r?\n/, "");
body = body.replace(/^# .+\r?\n\r?\n/, "");
body = body.replace(/\r?\n## FAQ[\s\S]*?(?=\r?\n## Key Takeaways)/, "");
body = body.replace(/\r?\n---\r?\n\r?\n\*\*Disclaimer:[\s\S]*$/, "");
body = body.trim();

const escaped = body
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const faqs = meta.faqs
  .map(
    (f) => `      {
        question: ${JSON.stringify(f.question)},
        answer: ${JSON.stringify(f.answer)},
      }`
  )
  .join(",\n");

const out = `import { STOCK_IMAGES } from "@/lib/constants/images";
import type { EducationGuide } from "./education-types";

export const EDUCATION_GUIDES_PART3: EducationGuide[] = [
  {
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
  },
];
`;

fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (${escaped.length} chars)`);
