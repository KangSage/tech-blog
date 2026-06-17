import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const base = "/tech-blog";

export default defineConfig({
  site: "https://kangsage.github.io",
  base,
  trailingSlash: "always",
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "ja", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.endsWith(`${base}/`) && !page.includes(`${base}/ko/security/`),
    }),
  ],
});
