# FinalCheat

The FinalCheat website introduces VitaCheat Overlay, preserves PSVITACHEAT Z06 downloads, and provides a readable code-format reference based on the original manual.

## Structure

```text
content/site.json     Project identity, versions, and source/download URLs
content/locales/      Complete English and Chinese website/interface strings
content/guide.en.json English code documentation, tables, and example explanations
content/guide.json    Chinese reference; opcode examples stay identical in both
scripts/build.mjs    Generates the home page and documentation page
assets/              Styles, browser interactions, screenshots, and original PDF
index.html           Generated English landing page (default)
guide/index.html     Generated English code reference
zh/index.html        Generated Chinese landing page
zh/guide/index.html  Generated Chinese code reference
```

The pages use native HTML, CSS, and JavaScript. All essential content is rendered into HTML; no build dependencies, framework CDN, or runtime GitHub API access are required.

## Local preview

```sh
npm run build
npm run check
npm run dev
```

Open `http://127.0.0.1:4173/` for the home page and `/guide/` for the reference. Update content files rather than generated HTML. Browser-review artifacts belong under `.local/`.

The site defaults to English. The header's **EN / 中文** selector switches the same page and retains its chapter anchor. Chinese pages use `/zh/`; internal links and refreshes retain the selected language without depending on browser storage. Both languages remain fully readable without JavaScript.

## Hosting and project naming

The site identity and package name are **FinalCheat** and **finalcheat-site**. The public site remains `https://finalcheat.github.io/`.

The remote repository is [Finalcheat/finalcheat.github.io](https://github.com/Finalcheat/finalcheat.github.io). Its name follows GitHub Pages' user-site convention, so the site is published at the root address above. The local checkout remains `finalcheat-site`.

GitHub Pages can serve the generated files directly from the root of the existing `master` branch. `.nojekyll` keeps the output as static files. Run the build and check scripts before committing approved changes.

## Documentation sources

The reference is organized from the official 20-page Chinese code manual dated 2017-09-10. B2 module addressing and UTF-8 behavior are supplemented from the original Z06 site. The downloadable PDF remains intact; its public reading password is listed on the guide page.

Original download URLs and source attribution are preserved. Known example inconsistencies are called out in the version notes instead of silently reinterpreting the format.
