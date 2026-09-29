import { getCollection, type CollectionEntry } from "astro:content";
import { assertLocale, blogPath, locales, type Locale } from "./i18n";
import type { Category } from "./categories";

export type BlogPost = CollectionEntry<"blog">;

export function slugFromId(id: string): string {
  const [, ...slugParts] = id.split("/");
  return slugParts.join("/").replace(/\.(md|mdx)$/, "");
}

export function localeFromId(id: string): Locale {
  return assertLocale(id.split("/")[0]);
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export async function getPostsByLocale(locale: Locale): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.lang === localeFromId(post.id) && post.data.lang === locale);
}

export async function getPostsByCategory(locale: Locale, category: Category): Promise<BlogPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter((post) => post.data.category === category);
}

export async function getAlternates(translationKey: string) {
  const posts = await getPublishedPosts();
  return posts
    .filter((post) => post.data.translationKey === translationKey)
    .map((post) => {
      const locale = localeFromId(post.id);
      return {
        locale,
        path: blogPath(locale, slugFromId(post.id)),
      };
    });
}

// 날짜는 언어와 관계없이 2026-09-29 형식으로 표시한다
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getLocalesWithPosts(): Promise<Locale[]> {
  const posts = await getPublishedPosts();
  const found = new Set(posts.map((post) => localeFromId(post.id)));
  return locales.filter((locale) => found.has(locale));
}

export async function getTagCounts(locale: Locale): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const post of await getPostsByLocale(locale)) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPostsByTag(locale: Locale, tag: string): Promise<BlogPost[]> {
  const posts = await getPostsByLocale(locale);
  return posts.filter((post) => post.data.tags.includes(tag));
}
