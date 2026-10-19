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
  markdown: {
    // 코드 블록 색. 기본값 github-dark는 주석 색(#6a737d)이 배경(#24292e)과 3.05:1이라 WCAG AA(4.5:1)에 못 미친다.
    // github-dark-default는 주석 #8b949e가 배경 #0d1117과 6.15:1이다. MDX도 이 설정을 이어받는다
    shikiConfig: { theme: "github-dark-default" },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.endsWith(`${base}/`) && !page.includes(`${base}/ko/security/`),
    }),
  ],
});
