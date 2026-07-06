import type { Locale } from "./i18n";

export const categories = ["tech", "lab", "notes", "hobby"] as const;
export type Category = (typeof categories)[number];

export const categoryLabels: Record<Category, Record<Locale, string>> = {
  tech: {
    ko: "기술",
    ja: "技術",
    en: "Tech",
  },
  lab: {
    ko: "실험실",
    ja: "実験室",
    en: "Lab",
  },
  notes: {
    ko: "노트",
    ja: "ノート",
    en: "Notes",
  },
  hobby: {
    ko: "취미",
    ja: "趣味",
    en: "Hobby",
  },
};

export const categoryDescriptions: Record<Category, Record<Locale, string>> = {
  tech: {
    ko: "웹, 보안, 운영을 오래 굴러가게 만드는 엔지니어링 기록.",
    ja: "Web、セキュリティ、運用を長く保つためのエンジニアリング記録。",
    en: "Engineering notes for web, security, and durable operations.",
  },
  lab: {
    ko: "AI 도구, 자동화, 개발 흐름을 작게 실험하는 공간.",
    ja: "AIツール、自動化、開発フローを小さく試す場所。",
    en: "Small experiments with AI tools, automation, and development workflows.",
  },
  notes: {
    ko: "아직 글이 되기 전의 생각, 읽은 것, 결정의 씨앗.",
    ja: "まだ記事になる前の考え、読んだもの、判断の種。",
    en: "Seeds of thoughts, readings, and decisions before they become essays.",
  },
  hobby: {
    ko: "기술 밖에서 손과 시간을 쓰며 가꾸는 취미 기록.",
    ja: "技術の外で手と時間を使って育てる趣味の記録。",
    en: "Hobby notes grown with time and hands outside pure engineering.",
  },
};
