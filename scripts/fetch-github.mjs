// Fetch repo metadata for each catalog slug from the GitHub REST API.
// Node >=22, no deps. Usage: node scripts/fetch-github.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'js-yaml';

const CATALOG = new URL('../src/data/catalog.yml', import.meta.url);
const OUT_DIR = new URL('../src/data/generated/', import.meta.url);
const OUT_FILE = new URL('../src/data/generated/repos.json', import.meta.url);
const OWNER = 'sufyansuleman';

const token = process.env.GH_PAT || process.env.GITHUB_TOKEN;

const catalogRaw = await readFile(CATALOG, 'utf8');
const catalog = load(catalogRaw);
const slugs = [...new Set(catalog.items.map((i) => i.slug))].sort((a, b) => a.localeCompare(b));

let previous = { repos: {} };
try {
  previous = JSON.parse(await readFile(OUT_FILE, 'utf8'));
} catch {
  // no previous file yet, fine on first run
}

const repos = {};

for (const slug of slugs) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'sufyansuleman-site'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${OWNER}/${slug}`, { headers });

  if (res.status === 404 || res.status === 403) {
    console.warn(`warning: ${slug} → HTTP ${res.status} (private or rate-limited); keeping previous entry if any`);
    if (previous.repos?.[slug]) repos[slug] = previous.repos[slug];
    continue;
  }

  if (!res.ok) {
    console.warn(`warning: ${slug} → HTTP ${res.status}; keeping previous entry if any`);
    if (previous.repos?.[slug]) repos[slug] = previous.repos[slug];
    continue;
  }

  const data = await res.json();
  repos[slug] = {
    description: data.description,
    language: data.language,
    homepage: data.homepage,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    pushed_at: data.pushed_at,
    topics: data.topics ?? [],
    html_url: data.html_url,
    archived: data.archived,
    private: false
  };
}

const sorted = Object.fromEntries(Object.keys(repos).sort((a, b) => a.localeCompare(b)).map((k) => [k, repos[k]]));

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  JSON.stringify({ fetched_at: new Date().toISOString(), repos: sorted }, null, 2) + '\n'
);

console.log(`wrote ${Object.keys(sorted).length} repos → src/data/generated/repos.json`);
