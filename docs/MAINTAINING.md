# Maintaining the site

Personal academic website for Sufyan Suleman: research tools, scientific apps, courses,
publications, projects, CV and contact. Built with Astro 7 and Tailwind v4, deployed to
GitHub Pages by GitHub Actions.

## Commands

```sh
npm install
npm run dev          # local server at http://localhost:4321
npm run build        # static build to ./dist
npm run preview      # serve the production build
npm run fetch        # refresh GitHub repo metadata and ORCID/OpenAlex publications
npm run cv:pdf       # build a local CV PDF from src/data/cv.yml (needs Quarto; not published on the site)
npm run og           # regenerate public/og.png (share image) from profile.yml
npm run screenshots  # capture documentation-site thumbnails for tools and courses
```

On Windows Git Bash, prefix commands with `export PATH="/c/Program Files/nodejs:$PATH"` if
`npm` is not found.

## House rules

- No em dashes or en dashes anywhere. Use commas, colons, full stops, or a hyphen in ranges.
- Page headlines are plain nouns ("Courses", "Research Tools"). No slogans.
- British spelling. Plain wording, no marketing language.
- Contact is email only. No forms.

## How to add or change things

**A new paper.** Add it to your ORCID record. Then run `npm run fetch:pubs` and commit
`src/data/generated/works.json`. To assign topics or add Supplementary/Code/App buttons, add an
entry keyed by DOI in `src/data/publications.yml`. To hide a work, add its id to `exclude`.
The weekly deploy also refreshes publications automatically.

**A new tool or course.** Add an item to `src/data/catalog.yml` (this file decides what
appears on the site and in which category; a repo not listed here never appears). Give it a
`cover:` block (`what`, `audience`, `keyword`, `motif`) for the generated card graphic, then create
`src/content/<tools|courses>/<slug>.mdx` with the long-form text (frontmatter `slug` must be
the lower-case slug). Run `npm run fetch:github` to pull description and dates. Set `featured: true`
on at most three tools to show them on the Home page.

**A hand-made banner for a detail page.** Drop `public/covers/<slug>.jpg` (16:9, under 300 KB).
It replaces the generated cover on that item's detail page only.

**CV and About timeline.** Both come from `src/data/cv.yml`. `npm run cv:pdf` builds a PDF locally if one is needed; it is not linked from the site.

**Bio, interests, research themes, socials, analytics code.** `src/data/profile.yml`.

**Projects page.** `src/data/projects.yml`.

**Academic journey article.** `src/content/pages/journey.mdx`.

**Visitor counter.** Set `analytics.goatcounter` in `profile.yml` to your GoatCounter site code.
The Home page block and the tracking script stay hidden until it is set.

## Layout of the code

- `src/pages/` one file per route; `[slug].astro` files build the detail pages.
- `src/components/` Nav, Footer, Hero, Card, Cover (generated SVG card graphics), PubItem,
  Timeline, CallToAction, VisitorCount.
- `src/lib/` loaders: `data.ts` (profile, cv, projects), `catalog.ts`, `publications.ts`.
- `src/styles/global.css` colour and font tokens, dark-mode overrides.
- `scripts/` fetchers, screenshots, cover optimiser, `cv.typ` (Typst CV), `og-image.mjs`,
  `shoot.mjs` (QA screenshots of the built site into `qa/`, ignored by git).
- `.github/workflows/deploy.yml` builds and deploys on push to `main`, on manual dispatch, and
  every Monday (which refreshes publications).

## Checks before publishing

```sh
npm run build
grep -rE "—|–" src scripts README.md --exclude-dir=generated   # must print nothing
MSYS_NO_PATHCONV=1 node scripts/shoot.mjs                     # no OVERFLOW warnings
```
