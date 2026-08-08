export interface SidebarItem {
  label: string;
  href: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

/**
 * The hand-written docs, in reading order.
 *
 * This is the single source for both the sidebar and the prev/next pager, so
 * the two can't drift apart when a page is added, moved, or renamed.
 */
export const sidebar: SidebarSection[] = [
  {
    title: 'Getting Started',
    items: [{ label: 'Introduction', href: '/docs/intro/' }],
  },
  {
    title: 'Basics',
    items: [
      { label: 'Loading Documents', href: '/docs/basics/loading/' },
      { label: 'Selecting Elements', href: '/docs/basics/selecting/' },
      { label: 'Traversing the DOM', href: '/docs/basics/traversing/' },
      { label: 'Manipulating Elements', href: '/docs/basics/manipulation/' },
      { label: 'Extracting Data', href: '/docs/basics/extract/' },
      { label: 'Troubleshooting', href: '/docs/basics/troubleshooting/' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      {
        label: 'Configuring Cheerio',
        href: '/docs/advanced/configuring-cheerio/',
      },
      { label: 'Security', href: '/docs/advanced/security/' },
      { label: 'Extending Cheerio', href: '/docs/advanced/extending-cheerio/' },
    ],
  },
];

/** Every doc page in reading order, for prev/next navigation. */
export const allPages: SidebarItem[] = [
  ...sidebar.flatMap((section) => section.items),
  { label: 'API Documentation', href: '/docs/api/' },
];
