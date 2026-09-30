export interface NavItem {
  label: string;
  href: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Capabilities', href: '/capabilities/' },
  { label: 'About', href: '/about/' },
  { label: 'Essays', href: '/essays/' },
  { label: 'Books', href: '/books/' },
  { label: 'Contact', href: '/contact/' }
];
