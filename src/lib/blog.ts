import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;
export type Author = CollectionEntry<'authors'>;

/** 배포 하위 경로(base)를 붙인 사이트 내부 주소를 만듭니다. */
export function url(path = ''): string {
  return import.meta.env.BASE_URL.replace(/\/*$/, '/') + path.replace(/^\//, '');
}

export const postUrl = (post: Post) => url(`posts/${post.id}/`);

/** 웹 편집기에서 이 글을 여는 주소. 로그인은 편집기가 요구합니다. */
export function editUrl(post: Post): string {
  const path = (post.filePath ?? '').replace(/^.*src\/content\/posts\//, '').replace(/\.md$/, '');
  return url(`admin/index.html#/collections/posts/entries/${encodeURI(path)}`);
}

export const tagUrl = (tag: string) => url(`tags/${encodeURIComponent(tag)}/`);
export const authorUrl = (author: Author) => url(`authors/${author.id}/`);

/** 최신순 글 목록. 초안은 개발 서버에서만 보입니다. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
}

/** 글쓴이를 찾고, 등록되지 않은 글쓴이가 있으면 빌드를 멈춥니다. */
export function getAuthors(post: Post): Promise<Author[]> {
  return Promise.all(
    post.data.authors.map(async (ref) => {
      const author = await getEntry(ref);
      if (!author) {
        throw new Error(`"${post.id}" 글의 글쓴이 "${ref.id}"가 없습니다. src/content/authors/${ref.id}.json을 추가하세요.`);
      }
      return author;
    }),
  );
}

export function getTags(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of new Set(post.data.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ko'));
}

// frontmatter의 날짜는 UTC 자정으로 해석되므로 UTC로 표시해야 하루가 밀리지 않습니다.
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll('-', '. ') + '.';
}

/** 한글은 분당 약 500자로 계산합니다. 코드 블록은 제외합니다. */
export function readingMinutes(body = ''): number {
  const chars = body.replace(/```[\s\S]*?```/g, '').replace(/\s/g, '').length;
  return Math.max(1, Math.round(chars / 500));
}
