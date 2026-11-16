import { getCollection } from 'astro:content';
import { allItems, type CatalogItem } from './catalog';
import { getPublications, getArchives, isConference, type Publication } from './publications';
import { profile } from './data';

export type OutputType = 'Publication' | 'Software' | 'Course' | 'Dataset' | 'Essay' | 'Book' | 'Archive';

export const outputTypes: OutputType[] = ['Publication', 'Software', 'Course', 'Dataset', 'Essay', 'Book', 'Archive'];

export interface Output {
  id: string;
  type: OutputType;
  title: string;
  description: string;
  year: number | null;
  href: string;
  external: boolean;
}

// Books are listed by hand on the writing page; keep this in step with it.
const books: Output[] = [
  {
    id: 'book:mizaj-shanasi',
    type: 'Book',
    title: 'Mizaj Shanasi',
    description: 'Urdu translation of Ustad Taleqani’s Persian work on temperament in traditional medicine.',
    year: 2026,
    href: '/books/mizaj-shanasi/',
    external: false
  }
];

function publicationHref(pub: Publication): { href: string; external: boolean } {
  if (pub.doi) return { href: `https://doi.org/${pub.doi}`, external: true };
  if (pub.oa_url) return { href: pub.oa_url, external: true };
  return { href: profile.socials.orcid, external: true };
}

export function pubToOutput(pub: Publication): Output {
  const { href, external } = publicationHref(pub);
  return {
    id: `pub:${pub.id}`,
    type: 'Publication',
    title: pub.title,
    description: [pub.journal, isConference(pub) ? 'Conference paper' : null].filter(Boolean).join(', '),
    year: pub.year,
    href,
    external
  };
}

// Internal detail page where one exists, otherwise the external site.
export function itemHref(item: CatalogItem, type: OutputType): { href: string; external: boolean } {
  if (type === 'Course') return { href: `/courses/${item.urlSlug}/`, external: false };
  if (item.categories.includes('tool')) return { href: `/tools/${item.urlSlug}/`, external: false };
  const ext = item.links.site ?? item.links.launch ?? item.links.github ?? item.links.docs;
  return { href: ext ?? '/outputs/', external: Boolean(ext) };
}

function itemYear(item: CatalogItem): number | null {
  if (!item.updated) return null;
  const y = new Date(item.updated).getFullYear();
  return Number.isNaN(y) ? null : y;
}

function itemToOutput(item: CatalogItem, type: OutputType): Output {
  const { href, external } = itemHref(item, type);
  return {
    id: `item:${item.slug}:${type}`,
    type,
    title: item.title,
    description: item.tagline,
    year: itemYear(item),
    href,
    external
  };
}

export async function getOutputs(): Promise<Output[]> {
  const items = allItems();
  const catalogDois = new Set(items.filter((i) => i.links.doi).map((i) => i.links.doi!.toLowerCase()));

  const pubs = getPublications().map(pubToOutput);

  const archives: Output[] = getArchives()
    .filter((a) => !(a.doi && catalogDois.has(`https://doi.org/${a.doi}`.toLowerCase())))
    .map((a) => ({
      id: `archive:${a.id}`,
      type: 'Archive' as const,
      title: a.title,
      description: 'Zenodo archive',
      year: a.year,
      href: a.doi ? `https://doi.org/${a.doi}` : profile.socials.orcid,
      external: true
    }));

  const typeByCategory = { tool: 'Software', course: 'Course', dataset: 'Dataset' } as const;
  const catalogRows: Output[] = items.flatMap((item) =>
    item.categories
      .filter((c): c is keyof typeof typeByCategory => c in typeByCategory)
      .map((c) => itemToOutput(item, typeByCategory[c]))
  );

  const essays = (await getCollection('essays', (e) => e.data.status !== 'draft')).map<Output>((e) => ({
    id: `essay:${e.id}`,
    type: 'Essay',
    title: e.data.title,
    description: e.data.summary ?? '',
    year: Number.parseInt(e.data.date.slice(0, 4), 10) || null,
    href: `/essays/${e.id}/`,
    external: false
  }));

  // Newest first; rows with no date go after all dated rows.
  return [...pubs, ...archives, ...catalogRows, ...essays, ...books].sort((a, b) => {
    if ((a.year == null) !== (b.year == null)) return a.year == null ? 1 : -1;
    return (b.year ?? 0) - (a.year ?? 0) || a.type.localeCompare(b.type) || a.title.localeCompare(b.title);
  });
}

export function countByType(rows: Output[]): Record<OutputType, number> {
  const out = Object.fromEntries(outputTypes.map((t) => [t, 0])) as Record<OutputType, number>;
  for (const r of rows) out[r.type] += 1;
  return out;
}
