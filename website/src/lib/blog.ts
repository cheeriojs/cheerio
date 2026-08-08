import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'blog'>;

/**
 * Read a post's date out of its filename, e.g.
 * `src/content/blog/2024-08-07-version-1.md`. Posts carry no `date` in
 * frontmatter, so the filename is the only source.
 *
 * @param post - The blog post.
 * @returns The post's publication date.
 */
export function getPostDate(post: Post): Date {
  /*
   * Collection entries only have a `filePath` when their loader is file-backed.
   * The blog always is, so an absent path means something is badly wrong.
   */
  const filename = post.filePath?.split('/').pop();
  if (!filename) {
    throw new Error(
      `Blog post "${post.id}" has no file path to take a date from.`,
    );
  }
  return new Date(filename.split('-').slice(0, 3).join('-'));
}

/**
 * Comparator ordering posts newest first.
 *
 * @param a - The first post.
 * @param b - The second post.
 * @returns A negative number if `a` is newer than `b`.
 */
export function byNewest(a: Post, b: Post): number {
  return getPostDate(b).getTime() - getPostDate(a).getTime();
}

/**
 * Format a date for display.
 *
 * @param date - The date to format.
 * @returns The date as a long-form string, e.g. "August 7, 2024".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    /*
     * Filenames are parsed as UTC midnight, so formatting in the build
     * machine's zone renders the previous day anywhere west of UTC.
     */
    timeZone: 'UTC',
  });
}

/**
 * Format a post's date for display.
 *
 * @param post - The blog post.
 * @returns The date as a long-form string, e.g. "August 7, 2024".
 */
export function formatPostDate(post: Post): string {
  return formatDate(getPostDate(post));
}
