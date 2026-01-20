import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { marked } from 'marked';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  // Sort posts by date (newest first)
  const sortedPosts = posts.toSorted((a, b) => {
    const dateA = new Date(a.id.split('-').slice(0, 3).join('-'));
    const dateB = new Date(b.id.split('-').slice(0, 3).join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  if (!context.site) {
    throw new Error('Site URL is required for RSS feed generation');
  }

  return rss({
    title: 'Cheerio Blog',
    description: 'Updates and announcements from the Cheerio team.',
    site: context.site,
    items: sortedPosts.map((post) => {
      const datePart = post.id.split('-').slice(0, 3).join('-');
      const slug = post.id.replace('.md', '').replace('.mdx', '');

      // Render markdown body to HTML
      const content = post.body ? marked.parse(post.body) : '';

      return {
        title: post.data.title,
        pubDate: new Date(datePart),
        link: `/blog/${slug}/`,
        content: content as string,
      };
    }),
  });
}
