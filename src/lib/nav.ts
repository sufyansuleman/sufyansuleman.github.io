export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Research', href: '/research/' },
  { label: 'Software', href: '/tools/' },
  { label: 'Teaching', href: '/courses/' },
  { label: 'Outputs', href: '/outputs/' },
  { label: 'Writing', href: '/writing/' },
  { label: 'About', href: '/about/' }
];
