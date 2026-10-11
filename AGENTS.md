# Working instructions

- This checkout is the FinalCheat website source. Keep one maintained local checkout.
- Prepare changes locally for review. Do not commit, push, rename the remote repository, modify Pages settings, or deploy until the user approves.
- Keep the site compatible with static GitHub Pages hosting from the repository root. No runtime API tokens, framework CDN, or server-side rendering are required.
- Site identity is FinalCheat. VitaCheat Overlay is the current project; preserve the original PSVITACHEAT Z06 download URLs.
- English is the default site language. Maintain complete English and Chinese content in content/locales/, content/guide.en.json, and content/guide.json. Keep opcode syntax and examples identical between languages.
- Run npm run build to generate the English and Chinese home/reference pages; do not manually edit generated pages. Language switching must preserve the current page and chapter.
- Cite the original code manual and distinguish Z04 definitions, Z06 changes, and Overlay behavior. Keep opcode examples and field meanings accurate.
- Keep local review screenshots/reports under .local/ and exclude them from Git. Check desktop/mobile layout, keyboard navigation, and links before review.
