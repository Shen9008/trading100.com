#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function parseFrontmatter(raw) {
  const result = {};
  let currentKey = null;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.replace(/\r$/, "");
    const listMatch = trimmed.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentKey) {
      const val = listMatch[1].replace(/^["']|["']$/g, "");
      result[currentKey] = result[currentKey] || [];
      result[currentKey].push(val);
      continue;
    }

    const kvMatch = trimmed.match(/^([\w]+):\s*(.*)$/);
    if (!kvMatch) continue;

    currentKey = kvMatch[1];
    const val = kvMatch[2].trim();
    if (val === "") continue;

    if (val.startsWith("[")) {
      try {
        result[currentKey] = JSON.parse(val);
      } catch {
        result[currentKey] = val.replace(/^["']|["']$/g, "");
      }
    } else {
      result[currentKey] = val.replace(/^["']|["']$/g, "");
    }
  }

  return result;
}

export function parseMdxFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid MDX frontmatter in ${filePath}`);
  }

  return {
    frontmatter: parseFrontmatter(match[1]),
    body: match[2].trim(),
  };
}
