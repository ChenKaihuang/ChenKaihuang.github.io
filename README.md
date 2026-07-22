# Kaihuang Chen — Personal Website

A dependency-free academic website based on the CV in this repository. GitHub Pages publishes the
static site directly from the repository root.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy on GitHub Pages

The site is published at <https://chenkaihuang.github.io/>. GitHub Pages deploys automatically after
every push to `main`.

## Update the site

- Website content: `index.html`
- Visual design: `assets/styles.css`
- Publication source records: `publications.bib`
- CV source: `kaihuang_cv.tex`
- Downloadable CV: `assets/kaihuang-chen-cv.pdf`

After rebuilding the LaTeX CV, copy the new PDF into `assets/kaihuang-chen-cv.pdf` before pushing.
