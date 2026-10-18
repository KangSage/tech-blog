// giscus 댓글 설정. 댓글은 이 저장소의 GitHub Discussions에 저장된다 (https://giscus.app)
// repoId·categoryId는 Discussions를 켜고 giscus 앱을 설치한 뒤 https://giscus.app 설정 화면에서 받는다.
// categoryId가 비어 있으면 글 페이지에 댓글 영역을 그리지 않는다
export const giscus = {
  repo: "KangSage/tech-blog",
  repoId: "R_kgDOS9d-JA",
  category: "Announcements",
  categoryId: "",
};

export const commentsEnabled = Boolean(giscus.repoId && giscus.categoryId);
