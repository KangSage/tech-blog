import { execFileSync } from "node:child_process";
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

// 날짜는 언어와 관계없이 2026-09-29 형식으로, 한국 시간 기준 날짜로 표시한다
const dateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" });
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

// 수정 날짜는 글 파일을 바꾼 마지막 git 커밋 시각이다. 글을 처음 올린 커밋 하나뿐이면 수정이 없다고 보고,
// 공개한 날과 같은 날이어도 없다고 본다. 커밋되지 않은 새 글이나 git 기록이 없는 환경에서도 없다고 본다
const lastCommitCache = new Map<string, Date | undefined>();
function lastCommitDate(filePath: string): Date | undefined {
  if (!lastCommitCache.has(filePath)) {
    let date: Date | undefined;
    try {
      const out = execFileSync("git", ["log", "--format=%cI", "--", filePath], { encoding: "utf8" }).trim().split("\n");
      if (out.length > 1) date = new Date(out[0]);
    } catch {
      // git이 없거나 저장소가 아니면 수정 날짜 없이 빌드한다
    }
    lastCommitCache.set(filePath, date);
  }
  return lastCommitCache.get(filePath);
}

export function getUpdatedAt(post: BlogPost): Date | undefined {
  const date = post.filePath ? lastCommitDate(post.filePath) : undefined;
  return date && formatDate(date) > formatDate(post.data.publishedAt) ? date : undefined;
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
