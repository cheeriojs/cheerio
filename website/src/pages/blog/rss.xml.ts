import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { marked } from 'marked';
import { byNewest, getPostDate } from '@/lib/blog';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  if (!context.site) {
    throw new Error('Site URL is required for RSS feed generation');
  }

  const sortedPosts = posts.toSorted(byNewest);

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
        pubDate: getPostDate(post),
        link: `/blog/${post.id}/`,
        ...(content && { content }),
      };
    }),
  });
}
