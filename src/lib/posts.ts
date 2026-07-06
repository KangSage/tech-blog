import { getCollection, type CollectionEntry } from "astro:content";
import { assertLocale, blogPath, type Locale } from "./i18n";
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
