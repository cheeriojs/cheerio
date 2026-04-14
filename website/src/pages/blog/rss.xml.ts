import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { marked } from 'marked';

/**
 * Extract the date from a blog post's file path (e.g.
 * "src/content/blog/2024-08-07-version-1.md").
 *
 * @param filePath - The file path of the blog post.
 */
function getPostDate(filePath: string): Date {
  const filename = filePath.split('/').pop()!;
  const datePart = filename.split('-').slice(0, 3).join('-');
  return new Date(datePart);
}

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  // Sort posts by date (newest first)
  const sortedPosts = posts.toSorted(
    (a, b) =>
      getPostDate(b.filePath).getTime() - getPostDate(a.filePath).getTime(),
  );

  if (!context.site) {
    throw new Error('Site URL is required for RSS feed generation');
  }

  return rss({
    title: 'Cheerio Blog',
    description: 'Updates and announcements from the Cheerio team.',
    site: context.site,
    items: sortedPosts.map((post) => {
      // Render markdown body to HTML
      const content = post.body
        ? (marked.parse(post.body) as string)
        : undefined;

      return {
        title: post.data.title,
        pubDate: getPostDate(post.filePath),
        link: `/blog/${post.id}/`,
        ...(content ? { content } : {}),
      };
    }),
  });
}
