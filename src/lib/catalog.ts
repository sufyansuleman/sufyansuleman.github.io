import { loadYaml } from './data';
import catalogRaw from '../data/catalog.yml?raw';
import reposJson from '../data/generated/repos.json';

export type Category = 'tool' | 'course' | 'app' | 'dataset';

export interface RepoInfo {
  description: string | null;
  language: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  topics: string[];
  html_url: string;
  archived: boolean;
  private: boolean;
}

interface CatalogLinks {
  site?: string;
  docs?: string;
  github?: string;
  launch?: string;
  doi?: string;
  slides?: string;
  exercises?: string;
}

interface CatalogCourse {
  level: string;
  duration?: string;
  audience: string;
  format: string;
}

interface CatalogManual {
  description?: string;
  language?: string;
  topics?: string[];
  note?: string;
}

export type CoverMotif = 'r' | 'stats' | 'cdisc' | 'trial' | 'heartbeat' | 'curves' | 'islet' | 'scatter' | 'archive';

export interface CatalogCover {
  what: string;
  audience: string;
  keyword: string;
  motif: CoverMotif;
}

interface RawCatalogItem {
  slug: string;
  category?: Category;
  categories?: Category[];
  title: string;
  tagline: string;
  icon: string;
  featured?: boolean;
  tags?: string[];
  links?: CatalogLinks;
  manual?: CatalogManual;
  subcategory?: string;
  course?: CatalogCourse;
  cover?: CatalogCover;
  cta?: { question?: string; detail?: string };
  label?: string;
}

interface RawCatalog {
  items: RawCatalogItem[];
}

export interface CatalogItem {
  slug: string;
  urlSlug: string;
  categories: Category[];
  title: string;
  tagline: string;
  icon: string;
  featured: boolean;
  tags: string[];
  links: CatalogLinks;
  manual?: CatalogManual;
  subcategory?: string;
  course?: CatalogCourse;
  cover?: CatalogCover;
  cta?: { question?: string; detail?: string };
  label?: string;
  repo?: RepoInfo;
  description: string;
  updated?: string;
}

const catalog = loadYaml<RawCatalog>(catalogRaw);
const repos = (reposJson as { repos: Record<string, RepoInfo> }).repos;

function normaliseCategories(raw: RawCatalogItem): Category[] {
  if (raw.categories && raw.categories.length > 0) return raw.categories;
  if (raw.category) return [raw.category];
  return [];
}

const items: CatalogItem[] = catalog.items.map((raw) => {
  const repo = repos[raw.slug];
  const description = raw.manual?.description ?? repo?.description ?? raw.tagline;
  return {
    slug: raw.slug,
    urlSlug: raw.slug.toLowerCase(),
    categories: normaliseCategories(raw),
    title: raw.title,
    tagline: raw.tagline,
    icon: raw.icon,
    featured: raw.featured ?? false,
    tags: raw.tags ?? [],
    links: raw.links ?? {},
    manual: raw.manual,
    subcategory: raw.subcategory,
    course: raw.course,
    cover: raw.cover,
    cta: raw.cta,
    label: raw.label,
    repo,
    description,
    updated: repo?.pushed_at
  };
});

export function getItems(category: Category): CatalogItem[] {
  return items.filter((item) => item.categories.includes(category));
}

export function getItem(slug: string): CatalogItem | undefined {
  const lower = slug.toLowerCase();
  return items.find((item) => item.urlSlug === lower);
}

export function featured(): CatalogItem[] {
  return items.filter((item) => item.featured);
}

export function counts() {
  return {
    tools: getItems('tool').length,
    courses: getItems('course').length,
    apps: getItems('app').length,
    datasets: getItems('dataset').length
  };
}

export function allItems(): CatalogItem[] {
  return items;
}
