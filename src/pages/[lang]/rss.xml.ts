import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE, assertLocale, blogPath, localeHome, locales } from "@/lib/i18n";
import { getPostsByLocale, slugFromId } from "@/lib/posts";

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = assertLocale(context.params.lang);
  const posts = await getPostsByLocale(lang);
  const site = new URL(import.meta.env.BASE_URL, context.site ?? SITE.origin).toString();

  return rss({
    title: `${SITE.name} (${lang})`,
    description: SITE.description,
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: blogPath(lang, slugFromId(post.id)).replace(/^\//, ""),
    })),
    customData: `<language>${lang}</language><link>${localeHome(lang)}</link>`,
  });
}
