# Website editing guidance

This repository publishes Kaihuang Chen's academic website at https://chenkaihuang.github.io/.
GitHub Pages serves `index.html` and `assets/` from the root of `main`.

## Content and layout preferences

- Keep the homepage a simple personal landing page: name, a short introduction, and location.
- The homepage can include one interactive optimization figure reflecting the owner's research.
  Keep its controls compact and its visible labels functional; do not add commentary around it.
- Put detailed research, publications, software, and education on separate pages, accessible through
  a single Menu button in the top-right corner. Do not turn the homepage back into a CV or a list of
  academic sections.
- Use plain headings and a clear reading order on detail pages.
- Do not add slogans, taglines, decorative captions, section teasers, or small commentary sentences
  above or below topic headings. The owner explicitly requested their removal and does not want
  them added in future edits.
- Keep substantive biography, research interests, publication metadata, software facts, and education.
  Factual information is content; a sentence selling or commenting on a section is not.
- Do not use "reproducible" in website copy.
- Do not restore publication/solver count blocks, the programming-language skills block, or a
  promotional "Full profile" / CV callout section.
- Keep typography restrained; use the person's name as the main heading.
- Base personal and publication claims on the supplied CV, bibliography, or verified primary sources.

## Maintenance

- Homepage: `index.html`; details: `research.html`, `publications.html`, `software.html`, `education.html`.
- Styling: `assets/styles.css`; menu behavior and old section-link redirects: `assets/site.js`.
- Interactive quadratic optimization figure and its mathematical model: `assets/optimization.mjs`.
- Preserve `.vscode/` and other unrelated user files.
- Preview at desktop and mobile widths when changing layout. Check internal links and the CV asset.
