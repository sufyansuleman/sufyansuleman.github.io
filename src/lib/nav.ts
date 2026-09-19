export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Writing', href: '/writing/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'CV', href: '/cv/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' }
];
