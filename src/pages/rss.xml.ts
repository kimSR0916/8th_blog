import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl, url } from '../lib/blog';
import { SITE } from '../site';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: new URL(url(), context.site),
    customData: '<language>ko</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postUrl(post),
      categories: post.data.tags,
    })),
  });
}
