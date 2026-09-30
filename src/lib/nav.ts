export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Research', href: '/research/' },
  { label: 'Writing', href: '/writing/' },
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'About', href: '/about/' }
];
