export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Research Tools', href: '/tools/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'CV', href: '/cv/' },
  { label: 'Contact', href: '/contact/' }
];
