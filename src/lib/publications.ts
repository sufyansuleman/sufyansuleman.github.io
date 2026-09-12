import { loadYaml } from './data';
import publicationsRaw from '../data/publications.yml?raw';
import worksJson from '../data/generated/works.json';

export interface Author {
  name: string;
  is_self: boolean;
}

export interface PublicationLinks {
  supp?: string;
  code?: string;
  app?: string;
}

export interface Publication {
  id: string;
  doi: string | null;
  title: string;
  type: string;
  year: number | null;
  journal: string | null;
  authors: Author[];
  abstract: string | null;
  cited_by_count: number;
  is_oa: boolean;
  oa_url: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  openalex_id: string | null;
  topics: string[];
  links: PublicationLinks;
}

interface PublicationOverride {
  topics?: string[];
  links?: PublicationLinks;
  type?: string;
  journal?: string;
}

interface PublicationsYaml {
  topics: string[];
  exclude: string[];
  add: Omit<Publication, 'topics' | 'links'>[];
  entries: Record<string, PublicationOverride>;
}

interface WorksJson {
  fetched_at: string;
  source: string;
  publications: Omit<Publication, 'topics' | 'links'>[];
  archives: Omit<Publication, 'topics' | 'links'>[];
}

const overrides = loadYaml<PublicationsYaml>(publicationsRaw);
const works = worksJson as unknown as WorksJson;

const SMALL_WORDS = new Set(['of', 'and', 'the', 'for', 'in', 'on', 'a', 'an', 'to', 'with']);

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (word === '&' || word === '') return word;
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Fixes ALL-CAPS or all-lowercase author/journal names from source data;
// leaves normally mixed-case names untouched.
function normaliseCase(value: string): string {
  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  return hasLower !== hasUpper ? toTitleCase(value) : value;
}

function applyOverride(pub: Omit<Publication, 'topics' | 'links'>): Publication {
  const override = overrides.entries[pub.id];
  return {
    ...pub,
    type: override?.type ?? pub.type,
    journal: override?.journal ?? (pub.journal ? normaliseCase(pub.journal) : pub.journal),
    authors: pub.authors.map((a) => ({ ...a, name: normaliseCase(a.name) })),
    topics: override?.topics ?? [],
    links: override?.links ?? {}
  };
}

const excludeSet = new Set(overrides.exclude);

const merged: Publication[] = [
  ...works.publications.filter((p) => !excludeSet.has(p.id)).map(applyOverride),
  ...overrides.add.filter((p) => !excludeSet.has(p.id)).map(applyOverride)
].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));

const archives: Publication[] = works.archives.map(applyOverride);

export function getPublications(): Publication[] {
  return merged;
}

export function getArchives(): Publication[] {
  return archives;
}

export const topics: string[] = overrides.topics;

export function years(): number[] {
  return [...new Set(merged.map((p) => p.year).filter((y): y is number => y != null))].sort((a, b) => b - a);
}

export function latest(n: number): Publication[] {
  return merged.slice(0, n);
}

export function count(): number {
  return merged.length;
}

export const fetchedAt: string = works.fetched_at;
