# Kaihuang Chen — Personal Website

A dependency-free academic website based on the CV in this repository. The deployed site is in
[`site/`](site/), and GitHub Actions publishes that directory to GitHub Pages.

## Preview locally

From the repository root, run:

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.

## Deploy on GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch. For the shortest default
   URL, name the repository `<your-github-username>.github.io`.
2. Open **Settings → Pages** in the repository.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open the **Actions** tab and confirm that “Deploy website to GitHub Pages” succeeds.

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) deploys automatically
after every push to `main`.

## Update the site

- Website content: `site/index.html`
- Visual design: `site/assets/styles.css`
- Publication source records: `publications.bib`
- CV source: `kaihuang_cv.tex`
- Downloadable CV: `site/assets/kaihuang-chen-cv.pdf`

After rebuilding the LaTeX CV, copy the new PDF into `site/assets/kaihuang-chen-cv.pdf` before pushing.
