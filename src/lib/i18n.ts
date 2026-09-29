export const SITE = {
  name: "Sage Garden",
  description: "A personal garden for engineering notes, tool experiments, quiet ideas, and hobbies.",
  origin: "https://kangsage.github.io",
  base: "/tech-blog",
} as const;

export const locales = ["ko", "ja", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  ja: "日本語",
  en: "English",
};

export const localeNames: Record<Locale, string> = {
  ko: "ko-KR",
  ja: "ja-JP",
  en: "en-US",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function assertLocale(value: string | undefined): Locale {
  if (isLocale(value)) return value;
  throw new Error(`Unsupported locale: ${value ?? "(missing)"}`);
}

export function withBase(path: string): string {
  const cleanBase = import.meta.env.BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export function absoluteUrl(path: string): string {
  return new URL(withBase(path), SITE.origin).toString();
}

export function localeHome(locale: Locale): string {
  return `/${locale}/`;
}

export function blogPath(locale: Locale, slug: string): string {
  return `/${locale}/blog/${slug}/`;
}

export function categoryPath(locale: Locale, category: string): string {
  return `/${locale}/category/${category}/`;
}

export function tagsPath(locale: Locale): string {
  return `/${locale}/tags/`;
}

export function tagPath(locale: Locale, tag: string): string {
  return `/${locale}/tags/${encodeURIComponent(tag)}/`;
}

// base 경로를 붙인 사이트 내부 링크 (예: /tech-blog/ko/tags/)
export function href(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "") + path;
}
