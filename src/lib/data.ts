import { load } from 'js-yaml';
import profileRaw from '../data/profile.yml?raw';
import cvRaw from '../data/cv.yml?raw';
import projectsRaw from '../data/projects.yml?raw';

// Vite inlines `?raw` imports at build time, so this survives bundling
// (a runtime fs.readFileSync path does not, since dist/ moves relative to src/).
export function loadYaml<T>(raw: string): T {
  return load(raw) as T;
}

export interface ResearchTheme {
  name: string;
  blurb: string;
}

export interface Language {
  language: string;
  level: string;
}

export interface Profile {
  name: string;
  title: string;
  affiliation: string;
  affiliation_secondary?: string;
  location: string;
  tagline: string;
  subheadline: string;
  roles: string[];
  interests: string[];
  socials: {
    github: string;
    orcid: string;
    linkedin: string;
    scholar: string;
    email: string;
  };
  bio_short: string;
  bio_long: string;
  analytics?: { goatcounter?: string; since?: string };
  research_themes: ResearchTheme[];
  languages: Language[];
}

export const profile = loadYaml<Profile>(profileRaw);

export interface CvPosition {
  title: string;
  org: string;
  dept?: string;
  location: string;
  start: string;
  end: string;
  summary?: string;
  highlights?: string[];
}

export interface CvEducation {
  degree: string;
  field: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  thesis?: string;
  funding?: string;
}

export interface CvTeaching {
  title: string;
  role: string;
  org: string;
  period: string;
  url?: string;
  doi?: string;
  note?: string;
}

export interface CvSupervision {
  count: number;
  level: string;
  org: string;
  period: string;
}

export interface CvSoftware {
  name: string;
  role: string;
  platform?: string;
  url?: string;
  doi?: string;
  note?: string;
}

export interface CvConsortium {
  name: string;
  role: string;
  period: string;
  outcome?: string;
}

export interface CvTalk {
  title: string;
  venue: string;
  year: number;
  type: string;
}

export interface CvManuscript {
  title: string;
  role: string;
  year: number;
}

export interface CvAward {
  title: string;
  org: string;
  period: string;
}

export interface CvMembership {
  name: string;
  since: string;
}

export interface CvCertification {
  name: string;
  issuer: string;
  year?: number;
}

export interface CvTraining {
  name: string;
  org: string;
  year: number;
}

export interface Cv {
  positions: CvPosition[];
  education: CvEducation[];
  teaching: CvTeaching[];
  supervision: CvSupervision[];
  software: CvSoftware[];
  consortia: CvConsortium[];
  talks: CvTalk[];
  manuscripts_in_preparation: CvManuscript[];
  awards: CvAward[];
  memberships: CvMembership[];
  certifications: CvCertification[];
  training: CvTraining[];
  skills: Record<string, string[]>;
  languages: Language[];
}

export const cv = loadYaml<Cv>(cvRaw);

export interface ProjectPeriod {
  start: string;
  end?: string;
}

export interface ProjectMilestone {
  date: string;
  label: string;
}

export interface ProjectRelated {
  publications: string[];
  tools: string[];
  courses: string[];
}

export interface Project {
  slug: string;
  title: string;
  status: 'active' | 'in-preparation' | 'completed';
  period: ProjectPeriod;
  summary: string;
  role: string;
  methods: string[];
  outcomes: string[];
  related: ProjectRelated;
  milestones?: ProjectMilestone[];
}

export const projects = loadYaml<{ projects: Project[] }>(projectsRaw).projects;

export { nav } from './nav';
