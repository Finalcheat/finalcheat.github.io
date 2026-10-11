import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, relative } from "node:path/posix";
const root = new URL("../", import.meta.url);
const readJson = async (name) =>
  JSON.parse(await readFile(new URL(name, root), "utf8"));
const site = await readJson("content/site.json");
const locales = {
  en: {
    ui: await readJson("content/locales/en.json"),
    guide: await readJson("content/guide.en.json"),
    home: "index.html",
    doc: "guide/index.html",
  },
  "zh-CN": {
    ui: await readJson("content/locales/zh-CN.json"),
    guide: await readJson("content/guide.json"),
    home: "zh/index.html",
    doc: "zh/guide/index.html",
  },
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const inline = (value) =>
  String(value)
    .split("`")
    .map((s, i) => (i % 2 ? `<code>${escape(s)}</code>` : escape(s)))
    .join("");
const lines = (value) =>
  inline(value).replaceAll("\n", '<br class="desktop-break"> ');
const route = (file) => file.replace(/index\.html$/, "");
const arrow =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const outward =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const mark =
  '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="9"/><path d="M11 23V9h12M11 16h9"/></svg>';

function context(lang, doc) {
  const locale = locales[lang];
  const file = doc ? locale.doc : locale.home;
  const path = (target) => relative(dirname(file), target) || ".";
  const page = (target) =>
    (relative(dirname(file), dirname(target)) || ".") + "/";
  return {
    lang,
    doc,
    file,
    ui: locale.ui,
    sections: locale.guide.sections,
    path,
    page,
    home: page(locale.home),
    guide: page(locale.doc),
  };
}
function header(c) {
  const t = c.ui.common;
  return `<a class="skip-link" href="#main">${escape(t.skip)}</a>
  <header class="site-header"><div class="header-inner"><a class="brand" href="${c.home}" aria-label="${escape(t.home)}">${mark}<span>FinalCheat<span class="brand-dot">.</span></span></a>
  <nav class="main-nav" aria-label="${escape(t.nav)}"><a href="${c.doc ? c.home : ""}#overlay"${c.doc ? "" : ' aria-current="page"'}>Overlay</a><a href="${c.guide}"${c.doc ? ' aria-current="page"' : ""}>${escape(t.reference)}</a><a href="${c.doc ? c.home : ""}#z06">${escape(t.downloads)}</a></nav>
  <div class="header-actions"><div class="language-switch" role="group" aria-label="${escape(t.language)}">${Object.entries(
    locales,
  )
    .map(
      ([lang, locale]) =>
        `<a href="${c.page(c.doc ? locale.doc : locale.home)}" lang="${lang}" hreflang="${lang}" data-language-link${lang === c.lang ? ' aria-current="page"' : ""}>${lang === "en" ? "EN" : "中文"}</a>`,
    )
    .join("")}</div>
  <button class="theme-toggle" type="button" aria-label="${escape(t.dark)}" aria-pressed="false" title="${escape(t.appearance)}"><svg class="moon-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 13A8.9 8.9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg><svg class="sun-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></button>
  <a class="header-github" href="${site.project}" target="_blank" rel="noopener noreferrer">GitHub ${outward}</a></div></div></header>`;
}
function footer(c) {
  return `<footer class="site-footer"><div class="footer-inner"><a class="brand footer-brand" href="${c.home}">${mark}<span>FinalCheat.</span></a><p>${escape(c.ui.common.footer)}</p><div><a href="${site.project}" target="_blank" rel="noopener noreferrer">VitaCheat Overlay ${outward}</a><span>© 2026 FinalCheat</span></div></div></footer>`;
}
function document(c, body) {
  const t = c.doc ? c.ui.guide : c.ui.home;
  const canonical = site.url + route(c.file);
  const messages = JSON.stringify({
    common: c.ui.common,
    home: c.ui.home,
    messages: c.ui.messages,
  }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="${c.lang}" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(t.title)}</title><meta name="description" content="${escape(t.description)}"><meta name="theme-color" content="#f7f8f5"><meta name="color-scheme" content="light dark"><link rel="canonical" href="${canonical}">
${Object.entries(locales)
  .map(
    ([lang, l]) =>
      `<link rel="alternate" hreflang="${lang}" href="${site.url + route(c.doc ? l.doc : l.home)}">`,
  )
  .join("\n")}
<link rel="alternate" hreflang="x-default" href="${site.url + route(c.doc ? locales.en.doc : locales.en.home)}"><meta property="og:type" content="website"><meta property="og:site_name" content="FinalCheat"><meta property="og:title" content="${escape(t.title)}"><meta property="og:description" content="${escape(t.description)}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="${c.lang === "en" ? "en_US" : "zh_CN"}"><meta property="og:image" content="${site.url}assets/images/overlay-en.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/svg+xml" href="${c.path("assets/favicon.svg")}">
<script>try{document.documentElement.dataset.theme=localStorage.getItem('finalcheat.theme')==='dark'?'dark':'light'}catch{}</script>
<link rel="stylesheet" href="${c.path("assets/site.css")}"><script type="application/json" id="site-messages">${messages}</script><script type="module" src="${c.path("assets/site.js")}"></script></head><body class="${c.doc ? "guide-page" : "home-page"}">${header(c)}${body}${footer(c)}</body></html>\n`;
}
function home(c) {
  const t = c.ui.home,
    english = c.lang === "en";
  const first = english ? "en" : "zh",
    second = english ? "zh" : "en";
  const tab = (lang) =>
    `<button type="button" role="tab" id="shot-${lang}" aria-controls="screenshot-panel" aria-selected="${lang === first}" tabindex="${lang === first ? 0 : -1}" data-screenshot="${lang}">${lang === "en" ? "English" : "中文"}</button>`;
  return `<main id="main"><section class="hero section-shell" id="overlay" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> ${escape(t.eyebrow)}</p><h1 id="hero-title">VitaCheat<br><span>Overlay<span class="hero-period">.</span></span></h1><p class="hero-lead">${escape(t.lead)}</p><p class="hero-description">${lines(t.intro)}</p><div class="hero-buttons"><a class="button button-primary" href="${site.project}" target="_blank" rel="noopener noreferrer">${escape(t.project)} ${outward}</a><a class="button button-text" href="${c.guide}">${escape(t.read)} ${arrow}</a></div><div class="hero-meta"><span>v${site.version}</span><span>by FinalCheat</span><span>MIT</span></div></div>
  <div class="hero-visual"><div class="preview-header"><span><span class="status-dot"></span> ${escape(t.capture)}</span><div class="screenshot-tabs" role="tablist" aria-label="${escape(t.tabs)}">${tab(first)}${tab(second)}</div></div><figure class="screenshot-frame" id="screenshot-panel" role="tabpanel" aria-labelledby="shot-${first}"><img src="${c.path(`assets/images/overlay-${english ? "en" : "zh-CN"}.png`)}" width="960" height="544" alt="${escape(english ? t.screenAltEn : t.screenAltZh)}" fetchpriority="high" decoding="async" data-screenshot-image data-src-en="${c.path("assets/images/overlay-en.png")}" data-src-zh="${c.path("assets/images/overlay-zh-CN.png")}"></figure><div class="preview-footer"><span>Virtua Tennis 4</span><span>${escape(t.captureSize)}</span></div><div class="shortcut-note"><span class="shortcut-line"></span><kbd>L</kbd><span>+</span><kbd>SELECT</kbd><span>${escape(t.shortcut)}</span></div></div></section>
  <section class="feature-strip section-shell" aria-label="${escape(t.featuresLabel)}">${t.features.map(([title, text], i) => `<div><span class="feature-index">0${i + 1}</span><h2>${escape(title)}</h2><p>${inline(text)}</p></div>`).join("")}</section>
  <section class="guide-promo section-shell" aria-labelledby="reference-title"><div class="promo-copy"><p class="eyebrow">${escape(t.referenceEyebrow)}</p><h2 id="reference-title">${lines(t.referenceTitle)}</h2><p>${lines(t.referenceIntro)}</p><a class="inline-link" href="${c.guide}">${escape(t.referenceLink)} ${arrow}</a></div><div class="code-teaser"><div class="code-toolbar"><span>${escape(t.teaserLabel)}</span><span>.psv</span></div><pre><code><span class="code-comment">${escape(t.teaserComment)}</span>\n<span class="code-token">_V0</span> Max Gil After Using\n<span class="code-token">$B200</span> 00000000 00000000\n<span class="code-token">$A100</span> 001CD8C4 0000BF00</code></pre><div class="teaser-footer"><span>${escape(t.teaserModule)}</span><span>${escape(t.teaserPatch)}</span></div></div></section>
  <section class="legacy-section section-shell" id="z06" aria-labelledby="legacy-title"><div class="legacy-heading"><p class="eyebrow">${escape(t.legacyEyebrow)}</p><h2 id="legacy-title">PSVITACHEAT <span>Z06</span></h2><p>${escape(t.legacyIntro)}</p></div><div class="legacy-downloads"><a href="${site.legacy.baidu}" target="_blank" rel="noopener noreferrer"><div><span class="download-kicker">${escape(t.download1)}</span><strong>${escape(t.baidu)}</strong><span class="download-caption">${escape(t.baiduCaption)}</span></div>${outward}</a><a href="${site.legacy.drive}" target="_blank" rel="noopener noreferrer"><div><span class="download-kicker">${escape(t.download2)}</span><strong>Google Drive</strong><span class="download-caption">${escape(t.driveCaption)}</span></div>${outward}</a></div><div class="legacy-footnote"><span>${escape(t.legacyNote)}</span><a href="${c.guide}#versions">${escape(t.versionLink)} ${arrow}</a></div></section></main>`;
}
function table(c, columns, rows) {
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="${escape(columns.join(", ") + " " + c.ui.guide.tableLabel)}"><table><thead><tr>${columns.map((s) => `<th scope="col">${inline(s)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((s, i) => (i === 0 ? `<th scope="row">${inline(s)}</th>` : `<td>${inline(s)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
}
let codeNumber = 0;
function codeBlock(c, code, key = "format") {
  const id = `code-${++codeNumber}`,
    t = c.ui.guide,
    label = t[key];
  return `<div class="code-block"><div class="code-toolbar"><span>${escape(label)}</span><button type="button" class="copy-code" data-copy="${id}" aria-label="${escape(t.copyAria.replace("{label}", label))}">${escape(t.copy)} <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></svg></button></div><pre><code id="${id}">${escape(code)}</code></pre></div>`;
}
function article(c, s) {
  const t = c.ui.guide;
  return `<section class="reference-section" id="${s.id}" aria-labelledby="heading-${s.id}"><div class="section-heading"><span class="section-number">${s.number}</span><div><p class="section-signature">${escape(s.signature)}</p><h2 id="heading-${s.id}">${escape(s.title)}</h2></div><span class="source-page">${escape(s.pages)}</span></div>${s.intro.map((p) => `<p>${inline(p)}</p>`).join("")}${s.syntax ? codeBlock(c, s.syntax) : ""}${s.fields.length ? table(c, t.columns, s.fields) : ""}${s.blocks.map((b) => `<div class="reference-detail"><h3>${escape(b.title)}</h3>${b.rows ? table(c, b.columns, b.rows) : `<ol class="steps-list">${b.text.map((p) => `<li>${inline(p)}</li>`).join("")}</ol>`}</div>`).join("")}${s.examples.map((e) => `<div class="example"><h3>${escape(e.title)}</h3>${codeBlock(c, e.code, "example")}<p>${inline(e.text)}</p>${e.extra ? `<p class="example-equivalent">${escape(t.equivalentIntro)}</p>${codeBlock(c, e.extra, "equivalent")}` : ""}</div>`).join("")}${s.notes.length ? `<aside class="reference-notes" aria-label="${escape(t.notesAria.replace("{title}", s.title))}"><span class="note-label">${escape(t.notes)}</span><ul>${s.notes.map((p) => `<li>${inline(p)}</li>`).join("")}</ul></aside>` : ""}</section>`;
}
function guide(c) {
  const t = c.ui.guide,
    groups = [...new Set(c.sections.map((s) => s.group))];
  return `<div class="reading-progress" aria-hidden="true"><span data-reading-progress></span></div><main id="main" class="guide-layout section-shell"><aside class="guide-sidebar"><a class="back-link" href="${c.home}">${arrow} ${escape(t.back)}</a><div class="search-field"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" id="chapter-search" aria-label="${escape(t.searchLabel)}" placeholder="${escape(t.searchPlaceholder)}"><kbd>/</kbd></div><p class="search-message" aria-live="polite" data-search-message hidden></p><details class="mobile-toc" open><summary>${escape(t.toc)} <span>${escape(t.chapterCount)}</span></summary><nav class="chapter-nav" aria-label="${escape(t.tocLabel)}">${groups
    .map(
      (group) =>
        `<div class="nav-group"><p>${escape(group)}</p>${c.sections
          .filter((s) => s.group === group)
          .map(
            (s) =>
              `<a href="#${s.id}" data-chapter="${s.id}" data-search="${escape(s.title + " " + s.signature + " " + s.intro.join(" "))}"><span>${s.number}</span>${escape(s.title)}</a>`,
          )
          .join("")}</div>`,
    )
    .join(
      "",
    )}</nav></details><a class="sidebar-pdf" href="${c.path(site.manual.pdf)}" target="_blank" rel="noopener noreferrer">${escape(t.pdf)} ${outward}</a><span class="pdf-password">${escape(t.password)} <code>${escape(site.manual.password)}</code></span></aside>
  <article class="guide-content"><header class="guide-intro"><p class="eyebrow">${escape(t.eyebrow)}</p><h1>${escape(t.heading)}<span class="hero-period">.</span></h1><p class="guide-lead">${lines(t.intro)}</p><div class="document-meta"><span>${escape(t.chapterCount)}</span><span>${escape(t.familyCount)}</span><span>${escape(t.manualDate)} ${site.manual.date}</span></div><div class="source-banner"><span class="source-indicator">${escape(t.source)}</span><p>${escape(t.sourceBefore)} <a href="${c.path(site.manual.pdf)}" target="_blank" rel="noopener noreferrer">${escape(t.manualTitle)}</a>${escape(t.sourceSeparator)}${escape(t.sourceAfter)}</p></div></header>${c.sections.map((s) => article(c, s)).join("")}<div class="document-end"><p class="eyebrow">${escape(t.endEyebrow)}</p><h2>${escape(t.endTitle)}</h2><p>${escape(t.endIntro)}</p><a class="button button-primary" href="${site.project}" target="_blank" rel="noopener noreferrer">${escape(t.endLink)} ${outward}</a><a class="document-source" href="${site.manual.source}" target="_blank" rel="noopener noreferrer">${escape(t.sourceLink)} ${outward}</a></div></article>
  <aside class="guide-rail" aria-label="${escape(t.readingTips)}"><span class="rail-label">${escape(t.readingTips)}</span><p>${lines(t.tips)}</p><a href="#versions">${escape(t.versions)} ${arrow}</a><span class="rail-divider"></span><span class="rail-label">${escape(t.projectLabel)}</span><a class="rail-project" href="${site.project}" target="_blank" rel="noopener noreferrer">VitaCheat<br>Overlay ${outward}</a><span class="rail-version">v${site.version}</span></aside></main>`;
}
for (const lang of Object.keys(locales)) {
  for (const doc of [false, true]) {
    const c = context(lang, doc);
    codeNumber = 0;
    await mkdir(new URL(dirname(c.file) + "/", root), { recursive: true });
    await writeFile(
      new URL(c.file, root),
      document(c, doc ? guide(c) : home(c)),
    );
  }
}
console.log(
  `Built English-default and Chinese home/reference pages in ${fileURLToPath(root)}`,
);
