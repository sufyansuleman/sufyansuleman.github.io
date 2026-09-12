// Fetch the ORCID works list, enrich each DOI via OpenAlex, and write
// src/data/generated/works.json. Node >=22, no deps.
// Usage: node scripts/fetch-publications.mjs
import { mkdir, writeFile } from 'node:fs/promises';

const ORCID_ID = '0000-0001-6612-6915';
const OUT_DIR = new URL('../src/data/generated/', import.meta.url);
const OUT_FILE = new URL('../src/data/generated/works.json', import.meta.url);
const MAILTO = 'sufyansuleman@hotmail.com';
const DELAY_MS = 150;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function selfNameMatch(name) {
  if (!name) return false;
  return /suleman/i.test(name) && (/sufyan/i.test(name) || /\bs\.?\s*suleman\b/i.test(name) || /suleman[,\s]+s\.?\b/i.test(name));
}

function rebuildAbstract(invertedIndex) {
  if (!invertedIndex) return null;
  const positions = [];
  for (const [word, idxs] of Object.entries(invertedIndex)) {
    for (const idx of idxs) positions.push([idx, word]);
  }
  positions.sort((a, b) => a[0] - b[0]);
  return positions.map(([, word]) => word).join(' ');
}

async function fetchOrcidWorks() {
  const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`ORCID works fetch failed: HTTP ${res.status}`);
  const data = await res.json();
  return data.group ?? [];
}

async function fetchOpenAlex(doi) {
  const url = `https://api.openalex.org/works/https://doi.org/${doi}?mailto=${MAILTO}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`warning: OpenAlex ${res.status} for doi ${doi}`);
    return null;
  }
  return res.json();
}

function extractOrcidSummary(group) {
  const summary = group['work-summary']?.[0];
  if (!summary) return null;
  const externalIds = group['external-ids']?.['external-id'] ?? [];
  const doiEntry = externalIds.find((e) => e['external-id-type'] === 'doi');
  const doi = doiEntry?.['external-id-value']?.toLowerCase().replace(/^https?:\/\/doi\.org\//, '') ?? null;
  return {
    doi,
    title: summary.title?.title?.value ?? '(untitled)',
    type: summary.type ?? 'other',
    year: summary['publication-date']?.year?.value ? Number(summary['publication-date'].year.value) : null,
    journal: summary['journal-title']?.value ?? null,
    putCode: summary['put-code'] ?? null
  };
}

function buildAuthors(openAlexWork) {
  const authorships = openAlexWork?.authorships ?? [];
  return authorships.map((a) => {
    const name = a.author?.display_name ?? a.raw_author_name ?? 'Unknown';
    return { name, is_self: selfNameMatch(name) };
  });
}

const groups = await fetchOrcidWorks();
console.log(`fetched ${groups.length} ORCID work groups`);

const publications = [];
const archives = [];
let enrichedCount = 0;
let notFoundCount = 0;

for (const group of groups) {
  const summary = extractOrcidSummary(group);
  if (!summary) continue;

  let openAlexWork = null;
  if (summary.doi) {
    openAlexWork = await fetchOpenAlex(summary.doi);
    if (openAlexWork) enrichedCount += 1;
    else notFoundCount += 1;
    await sleep(DELAY_MS);
  }

  const abstract = rebuildAbstract(openAlexWork?.abstract_inverted_index);

  const entry = {
    id: summary.doi ?? `orcid:${summary.putCode}`,
    doi: summary.doi,
    title: openAlexWork?.title ?? summary.title,
    type: summary.type,
    year: openAlexWork?.publication_year ?? summary.year,
    journal: openAlexWork?.primary_location?.source?.display_name ?? summary.journal,
    authors: buildAuthors(openAlexWork),
    abstract,
    cited_by_count: openAlexWork?.cited_by_count ?? 0,
    is_oa: openAlexWork?.open_access?.is_oa ?? false,
    oa_url: openAlexWork?.open_access?.oa_url ?? null,
    volume: openAlexWork?.biblio?.volume ?? null,
    issue: openAlexWork?.biblio?.issue ?? null,
    pages: openAlexWork?.biblio?.first_page ?? null,
    openalex_id: openAlexWork?.id ?? null
  };

  if (summary.doi?.startsWith('10.5281/zenodo')) {
    archives.push(entry);
  } else {
    publications.push(entry);
  }
}

publications.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
archives.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  JSON.stringify(
    {
      fetched_at: new Date().toISOString(),
      source: 'orcid+openalex',
      publications,
      archives
    },
    null,
    2
  ) + '\n'
);

console.log(
  `wrote ${publications.length} publications + ${archives.length} archives → src/data/generated/works.json ` +
    `(OpenAlex enriched: ${enrichedCount}, not found: ${notFoundCount})`
);
