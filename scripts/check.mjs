import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const root = fileURLToPath(new URL("../", import.meta.url));
const site = JSON.parse(
  await readFile(resolve(root, "content/site.json"), "utf8"),
);
const { sections } = JSON.parse(
  await readFile(resolve(root, "content/guide.json"), "utf8"),
);
const englishGuide = JSON.parse(
  await readFile(resolve(root, "content/guide.en.json"), "utf8"),
);
const englishUi = JSON.parse(
  await readFile(resolve(root, "content/locales/en.json"), "utf8"),
);
const chineseUi = JSON.parse(
  await readFile(resolve(root, "content/locales/zh-CN.json"), "utf8"),
);
const pages = [
  "index.html",
  "guide/index.html",
  "zh/index.html",
  "zh/guide/index.html",
];
const html = Object.fromEntries(
  await Promise.all(
    pages.map(async (page) => [
      page,
      await readFile(resolve(root, page), "utf8"),
    ]),
  ),
);
const errors = [];
function check(value, message) {
  if (!value) errors.push(message);
}
for (const page of pages) {
  const text = html[page];
  check(
    text.includes(`<html lang="${page.startsWith("zh/") ? "zh-CN" : "en"}"`),
    `${page}: document language`,
  );
  check(
    text.includes('hreflang="en"') &&
      text.includes('hreflang="zh-CN"') &&
      text.includes('hreflang="x-default"'),
    `${page}: language alternatives`,
  );
  check(
    (text.match(/data-language-link/g) || []).length === 2,
    `${page}: language switch links`,
  );
  check((text.match(/<h1[ >]/g) || []).length === 1, `${page}: one h1`);
  check(
    !text.includes("orgmode.org") && !text.includes("params.json"),
    `${page}: no obsolete theme`,
  );
  const ids = [...text.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  check(ids.length === new Set(ids).size, `${page}: unique IDs`);
  for (const match of text.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|data:)/.test(target)) continue;
    const [path, anchor] = target.split("#");
    let resolved = resolve(root, dirname(page), path || page.split("/").at(-1));
    if (target.startsWith("#")) resolved = resolve(root, page);
    if (path?.endsWith("/") || path === "./" || path === "../")
      resolved = resolve(resolved, "index.html");
    try {
      await access(resolved);
      if (anchor && resolved.endsWith(".html")) {
        const contents = await readFile(resolved, "utf8");
        check(
          contents.includes(`id="${anchor}"`),
          `${page}: missing anchor ${target}`,
        );
      }
    } catch {
      errors.push(`${page}: missing target ${target}`);
    }
  }
}
check(
  html["index.html"].includes(site.legacy.baidu),
  "Original Baidu download URL",
);
check(
  html["index.html"].includes(site.legacy.drive),
  "Original Google Drive download URL",
);
check(html["index.html"].includes(site.project), "Overlay project URL");
check(
  html["index.html"].includes('src="assets/images/overlay-en.png"'),
  "English-default screenshot",
);
check(
  html["zh/index.html"].includes('src="../assets/images/overlay-zh-CN.png"'),
  "Chinese-default screenshot",
);
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shape(item)]),
    );
  return typeof value;
}
check(
  JSON.stringify(shape(englishUi)) === JSON.stringify(shape(chineseUi)),
  "Complete matching interface translation keys",
);
check(
  englishGuide.sections.length === sections.length,
  "Full English chapter coverage",
);
for (const [index, chinese] of sections.entries()) {
  const english = englishGuide.sections[index];
  check(
    chinese.id === english.id && chinese.number === english.number,
    `${chinese.id}: matching chapter identity`,
  );
  check(
    JSON.stringify(shape(chinese)) === JSON.stringify(shape(english)),
    `${chinese.id}: complete translated content structure`,
  );
  check(
    chinese.syntax === english.syntax,
    `${chinese.id}: unchanged format syntax`,
  );
  for (const [i, example] of chinese.examples.entries()) {
    check(
      example.code === english.examples[i].code &&
        example.extra === english.examples[i].extra,
      `${chinese.id}: unchanged opcode examples`,
    );
  }
  check(
    html["zh/guide/index.html"].includes(`id="${chinese.id}"`),
    `${chinese.id}: rendered Chinese chapter`,
  );
}
check(
  !/[\u4e00-\u9fff]/.test(JSON.stringify(englishGuide)),
  "No untranslated Chinese in English documentation",
);
check(
  !/[\u4e00-\u9fff]/.test(JSON.stringify(englishUi)),
  "No untranslated Chinese in English interface strings",
);
check(sections.length === 13, "Complete reference section count");
for (const id of [
  "write",
  "copy",
  "compression",
  "pointer",
  "pointer-copy",
  "pointer-compression",
  "arm",
  "module",
  "pad",
  "condition",
]) {
  check(
    sections.some((s) => s.id === id),
    `Missing code family ${id}`,
  );
}
for (const section of sections) {
  check(
    html["guide/index.html"].includes(`id="${section.id}"`),
    `Rendered chapter ${section.id}`,
  );
  for (const example of section.examples) {
    for (const line of example.code.split("\n")) {
      if (line.startsWith("$"))
        check(
          /^\$[0-9A-F]{4} [0-9A-F]{8} [0-9A-F]{8}$/.test(line),
          `Invalid example in ${section.id}: ${line}`,
        );
    }
  }
}
const pdf = await readFile(resolve(root, site.manual.pdf));
check(
  createHash("sha256").update(pdf).digest("hex") === site.manual.sha256,
  "Original PDF integrity",
);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  "Checked all four bilingual pages, complete translation coverage, identical opcode examples, local links/anchors, 13 chapters, 10 code families, original downloads, and PDF integrity.",
);
