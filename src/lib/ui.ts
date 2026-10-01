import type { Locale } from "./i18n";

// 사이트 공통 UI 문구. 글 본문이 아닌 메뉴·목록·검색 화면에서 쓴다.
export const ui = {
  navPosts: { ko: "글 목록", ja: "記事一覧", en: "Posts" },
  navTags: { ko: "태그", ja: "タグ", en: "Tags" },
  homeTitle: {
    ko: "기술과 생각을 기르는 개인 정원",
    ja: "技術と思考を育てる個人の庭",
    en: "A personal garden for technology and thought",
  },
  homeDescription: {
    ko: "개발, 도구, 보안, 취미를 작게 심고 오래 관찰하며 남기는 기록.",
    ja: "開発、ツール、セキュリティ、趣味を小さく植え、長く観察して残す記録。",
    en: "Notes on development, tooling, security, and hobbies, planted small and tended over time.",
  },
  searchLabel: { ko: "글 검색", ja: "記事を検索", en: "Search posts" },
  searchPlaceholder: {
    ko: "제목·설명·태그로 검색",
    ja: "タイトル・説明・タグで検索",
    en: "Search titles, descriptions, and tags",
  },
  all: { ko: "전체", ja: "すべて", en: "All" },
  categoriesLabel: { ko: "카테고리", ja: "カテゴリー", en: "Categories" },
  tagsLabel: { ko: "태그", ja: "タグ", en: "Tags" },
  postCount: { ko: "글 {n}개", ja: "記事 {n}件", en: "{n} posts" },
  noPosts: {
    ko: "이 언어로 공개된 글은 아직 없습니다.",
    ja: "この言語で公開された記事はまだありません。",
    en: "No posts have been published in this language yet.",
  },
  noResults: {
    ko: "조건에 맞는 글이 없습니다.",
    ja: "条件に合う記事はありません。",
    en: "No posts match these filters.",
  },
  clearFilters: { ko: "필터 지우기", ja: "フィルターを解除", en: "Clear filters" },
  tagsDescription: {
    ko: "글에 붙은 태그 전체입니다. 태그를 누르면 해당 글만 모아 봅니다.",
    ja: "記事に付いたすべてのタグです。タグを選ぶとその記事だけを表示します。",
    en: "Every tag used on posts. Pick a tag to see only those posts.",
  },
  tagPageDescription: {
    ko: "'{tag}' 태그가 붙은 글입니다.",
    ja: "「{tag}」タグの付いた記事です。",
    en: "Posts tagged '{tag}'.",
  },
  security: { ko: "의존성 보안 현황", ja: "依存関係のセキュリティ", en: "Dependency security" },
  updated: { ko: "수정", ja: "更新", en: "Updated" },
  readAloud: { ko: "읽어 주기", ja: "読み上げ", en: "Read aloud" },
  readPause: { ko: "일시정지", ja: "一時停止", en: "Pause" },
  readResume: { ko: "계속 읽기", ja: "再開", en: "Resume" },
  readPrev: { ko: "이전 절", ja: "前の節", en: "Previous section" },
  readNext: { ko: "다음 절", ja: "次の節", en: "Next section" },
  readStop: { ko: "정지", ja: "停止", en: "Stop" },
  readRate: { ko: "읽기 속도", ja: "読み上げ速度", en: "Reading speed" },
  readNoVoice: {
    ko: "이 기기에는 한국어 음성이 없어 읽어 줄 수 없습니다.",
    ja: "この端末には日本語の音声がないため読み上げできません。",
    en: "This device has no English voice to read with.",
  },
  readFigure: { ko: "그림", ja: "図", en: "Figure" },
  tocTitle: { ko: "목차", ja: "目次", en: "Contents" },
  themeToDark: { ko: "다크 모드로 전환", ja: "ダークモードに切り替え", en: "Switch to dark mode" },
  themeToLight: { ko: "라이트 모드로 전환", ja: "ライトモードに切り替え", en: "Switch to light mode" },
} satisfies Record<string, Record<Locale, string>>;

export function t(key: keyof typeof ui, locale: Locale, values: Record<string, string | number> = {}): string {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, String(value)),
    ui[key][locale],
  );
}
