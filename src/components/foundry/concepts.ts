export type Layer = "sec" | "data" | "onto" | "logic" | "app" | "ops";

export const layerLabels: Record<Layer, string> = {
  sec: "권한·보안",
  data: "데이터",
  onto: "온톨로지",
  logic: "로직",
  app: "앱",
  ops: "운영",
};

export interface Concept {
  id: string;
  n: string;
  layer: Layer;
  title: string;
  lead: string;
  analogy: string;
  points: string[];
  warn?: string;
  doc: string;
  related: { label: string; href: string }[];
}

const D = "https://www.palantir.com/docs/foundry/";

export const concepts: Concept[] = [
  {
    id: "project", n: "1", layer: "sec", title: "Project · Role · Marking",
    lead: "Project = 작업 상자이자 권한 경계. 접근 = Role 있음 AND 마킹 전부 통과.",
    analogy: "Role = RBAC 권한(열쇠). Marking = 그 앞에서 먼저 막는 필수 미들웨어(자물쇠).",
    points: [
      "Role(Owner·Editor·Viewer) = 프로젝트 단위 GRANT. 뭘 할 수 있나 정함.",
      "Marking = all-or-nothing. 하나라도 못 넘으면 Role 무관 접근 0.",
      "Marking은 파생 데이터까지 따라감. 막는 용도지 권한 주는 용도 아님.",
    ],
    warn: "Editor여도 PII 마킹 멤버 아니면 아무것도 못 함.",
    doc: D + "security/projects-and-roles",
    related: [{ label: "Markings", href: D + "security/markings" }],
  },
  {
    id: "dataset", n: "2", layer: "data", title: "Dataset · 트랜잭션",
    lead: "파일 묶음(보통 Parquet) + 스키마. 변경 단위 = 트랜잭션.",
    analogy: "겉은 테이블, 속은 Git repo. 트랜잭션 = 커밋.",
    points: [
      "SNAPSHOT: 통째 교체 (TRUNCATE + INSERT)",
      "APPEND: 새 파일 추가만. 증분 파이프라인 기반",
      "UPDATE: 추가 + 덮어쓰기. 덮어쓰면 하류 증분 깨짐",
      "DELETE: 파일 삭제. 과거 view엔 남음",
    ],
    warn: "롤백 가능(Data Lineage → History → Rollback to transaction). 데이터만 되돌림, 로직은 그대로.",
    doc: D + "data-integration/datasets",
    related: [{ label: "롤백", href: D + "data-lineage/dataset-rollback" }],
  },
  {
    id: "transform", n: "3", layer: "data", title: "Code Repositories · Python transform",
    lead: "Input 데이터셋 읽어 Output 데이터셋 쓰는 배치 코드. build 때 실행.",
    analogy: "API 핸들러 아님, cron 배치 잡. Code Repositories = 웹 IDE + Git 저장소.",
    points: [
      "pandas: 1GB·100만 행 미만",
      "Polars·DuckDB: 1~50GB·2억 행까지",
      "PySpark: 50GB·2억 행 초과. 시작 오버헤드 큼",
    ],
    warn: "엑셀 업로드(시트당 최대 약 105만 행)는 거의 확실히 lightweight 구간.",
    doc: D + "transforms-python/compute-engines",
    related: [{ label: "transform 기본", href: D + "transforms-python/transforms-pipelines" }],
  },
  {
    id: "onto", n: "4", layer: "onto", title: "Ontology",
    lead: "데이터셋 위에 얹는 업무 의미 계층. 앱은 이걸 보고 씀.",
    analogy: "ORM 모델 층. Object type = 테이블 · Object = 행 · Property = 컬럼 · Link type = 조인/FK · Object set = WHERE 결과.",
    points: [
      "Object 값은 backing datasource(원본 데이터셋)에서 옴",
      "Link type: 1:1, 1:N, N:M 가능",
      "Object set 예: 상태가 '지연'인 항공편 전체",
    ],
    doc: D + "ontology/core-concepts",
    related: [],
  },
  {
    id: "funnel", n: "5", layer: "onto", title: "Funnel 인덱싱 · Materialization",
    lead: "Funnel이 데이터셋을 객체 DB(OSv2)로 인덱싱. Action 편집은 인덱스에 즉시.",
    analogy: "원본 DB → Elasticsearch 동기화. Materialization = materialized view(쿼리 결과를 테이블로 저장).",
    points: [
      "데이터셋 build 끝나도 앱 반영은 Funnel 파이프라인 뒤라 약간 늦음",
      "Action 편집: 인덱스 즉시 + Funnel 관리 데이터셋에 주기 저장. 원본 backing 데이터셋은 그대로",
      "Materialization = 원본 + 편집 합친 데이터셋. OSv2에선 선택. 하류 파이프라인·대량 다운로드용",
    ],
    doc: D + "object-indexing/overview",
    related: [{ label: "Materializations", href: D + "object-edits/materializations" }],
  },
  {
    id: "action", n: "6", layer: "logic", title: "Action type · Submission criteria",
    lead: "오브젝트 수정 방법 정의. 실행 1번 = 트랜잭션 1개.",
    analogy: "서버 쪽 쓰기 API(POST) + 서버 측 validation.",
    points: [
      "Parameters = 요청 body",
      "Rules = 뭘 바꿀지 (생성·수정·삭제·링크)",
      "Submission criteria = 제출해도 되나. 그룹·파라미터·오브젝트 상태 조합",
    ],
    warn: "'보인다/안 보인다'는 Object security policy, '제출 가능'은 submission criteria.",
    doc: D + "action-types/submission-criteria",
    related: [{ label: "Action 권한", href: D + "action-types/permissions" }],
  },
  {
    id: "function", n: "7", layer: "logic", title: "Function (TypeScript · Python)",
    lead: "요청 때 바로 도는 서버 코드. 온톨로지 읽기·링크 따라가기·편집 계산.",
    analogy: "AWS Lambda / Next.js API route. Transform = 배치, Function = 요청 즉시.",
    points: [
      "Query = 읽기 전용 함수 (GET 같은 것)",
      "Edit function = 편집 계산만. Function-backed action으로 실행해야 저장",
      "TypeScript v2 권장 (OSDK 기반)",
    ],
    warn: "helper에서 돌리거나 직접 호출해도 반영 안 됨. 저장은 Action 실행 때만.",
    doc: D + "functions/overview",
    related: [{ label: "Ontology edits", href: D + "functions/edits-overview" }],
  },
  {
    id: "media", n: "8", layer: "data", title: "Media set · media reference",
    lead: "파일 전용 저장소 + 그 파일 가리키는 포인터.",
    analogy: "S3 버킷(버전 관리 켬) + DB 컬럼에 저장한 S3 key.",
    points: [
      "같은 경로 재업로드 = 새 media item. 옛 reference는 옛 파일 계속 봄",
      "object type Capabilities 탭에서 media source 지정해야 연결",
      "reference 갱신: Action 폼 업로드 / Function-backed action / Transform",
    ],
    warn: "media set 권한은 오브젝트 정책과 별개. 따로 잠가야 함.",
    doc: D + "media-sets-advanced-formats/media-overview",
    related: [{ label: "권한 분리", href: D + "object-permissioning/managing-object-security" }],
  },
  {
    id: "osdk", n: "9", layer: "app", title: "OSDK · Developer Console",
    lead: "온톨로지로 생성되는 타입 붙은 클라이언트 + 커스텀 앱 관리 콘솔.",
    analogy: "OpenAPI codegen 클라이언트 + Firebase 콘솔.",
    points: [
      "토큰 접근 = 사용자 권한 ∩ 앱 최대 scope ∩ 요청 scope",
      "웹 호스팅 = 정적 SPA만. 서버 코드 불가 → 서버 로직은 Function·Action",
      "앱당 리소스 기본 1000개",
    ],
    warn: "scope는 앱 단위 상한. 사용자별 차등도, '앱으로만 접근' 강제도 못 함.",
    doc: D + "developer-console/overview",
    related: [
      { label: "Scopes", href: D + "ontology-sdk/third_party_app_scopes" },
      { label: "웹 호스팅", href: D + "developer-console/deploy-custom-application-on-foundry" },
    ],
  },
  {
    id: "oauth", n: "10", layer: "sec", title: "OAuth: 사용자 로그인 vs 서비스 유저",
    lead: "Authorization code = 사용자 대신 동작. Client credentials = 서비스 유저(앱 전용 로봇 계정)로 동작.",
    analogy: "'Google로 로그인' vs 서버 간 API 키.",
    points: [
      "브라우저 SPA = public client. PKCE 필수, client credentials 불가",
      "PKCE = 로그인마다 새 verifier 만들어 교환권 탈취 막는 장치",
      "서비스 유저 = 모두 같은 권한 → 사용자별 구분은 앱 로직 몫",
    ],
    warn: "secret을 React 코드에 넣으면 브라우저에서 다 보임.",
    doc: D + "platform-security-third-party/writing-oauth2-clients",
    related: [{ label: "클라이언트 등록", href: D + "platform-security-third-party/register-3pa" }],
  },
  {
    id: "osp", n: "11", layer: "sec", title: "Object security policy",
    lead: "오브젝트 행 단위 보기 권한. property security policy와 합쳐 셀 단위.",
    analogy: "Postgres RLS. MySQL로 치면 모든 SELECT에 DB가 알아서 WHERE를 붙이는 것.",
    points: [
      "조건 = granular policy: 사용자 속성(그룹 ID 등) ↔ property 값. 이름 말고 ID",
      "데이터셋 권한과 양방향 분리. 데이터셋 권한 없어도 보이고, 있어도 안 보일 수 있음",
      "변경 거의 즉시. Restricted view(데이터셋용 RLS)는 재빌드 필요",
    ],
    warn: "온톨로지 안에서만 작동. 원본 데이터셋은 따로 잠가야 함. 옛 datasource-derived 권한 모델 환경이면 데이터셋 권한 여전히 필요.",
    doc: D + "object-permissioning/object-security-policies",
    related: [
      { label: "Restricted view", href: D + "security/restricted-views" },
      { label: "Granular policy", href: D + "platform-security-management/manage-granular-policies" },
    ],
  },
  {
    id: "cm", n: "12", layer: "logic", title: "Compute module",
    lead: "내 Docker 컨테이너를 Foundry 안에서 실행.",
    analogy: "Cloud Run / 큐 워커. HTTP 서버 아니고 처리할 이벤트를 폴링.",
    points: [
      "Function mode: 함수로 등록 → Workshop·OSDK에서 호출",
      "Pipeline mode: 입력 → 출력 처리. job token은 입출력에만",
      "Application permissions: 딸린 서비스 유저 권한. 누가 불러도 동일",
    ],
    warn: "Function으로 되면 Function이 더 간단. 언어·라이브러리·무거운 작업일 때 선택.",
    doc: D + "compute-modules/overview",
    related: [{ label: "실행 모드", href: D + "compute-modules/execution-modes" }],
  },
  {
    id: "workshop", n: "13", layer: "app", title: "Workshop",
    lead: "온톨로지 위에서 앱 조립하는 로우코드 빌더.",
    analogy: "Retool. Layout = JSX 구조 · Widget = 컴포넌트 · Variable = useState · Event = 핸들러.",
    points: [
      "쓰기는 Action, 복잡한 계산은 Function 연결",
      "부족하면 Custom widget으로 직접 짠 프론트 코드 끼움",
      "React(OSDK)와 차이: 빠르고 코드 적음 vs 완전 자유",
    ],
    doc: D + "app-building/overview",
    related: [],
  },
  {
    id: "pb", n: "+1", layer: "data", title: "Pipeline Builder",
    lead: "클릭으로 파이프라인. 백엔드가 transform 코드 생성 + build 전 스키마 검사.",
    analogy: "엑셀 Power Query. 단계 쌓으면 뒤에서 코드 생성.",
    points: [
      "Expression = 컬럼 → 컬럼 / Transform = 테이블 → 테이블",
      "엔진: Spark(배치 중심), Flink(스트리밍 중심)",
      "출력: 데이터셋·media set·오브젝트. 브랜치·버전관리 있음",
    ],
    warn: "생성 코드를 Code Repositories로 꺼내 편집할 수 있는지는 확인 필요.",
    doc: D + "pipeline-builder/overview",
    related: [],
  },
  {
    id: "oma", n: "+2", layer: "ops", title: "Ontology Manager",
    lead: "object type·Action type 만들고 관리하는 앱.",
    analogy: "MySQL Workbench의 스키마 편집 + 관리 콘솔.",
    points: [
      "생성 순서: datasource → property → primary key·title key → Action → 저장 위치 → 보안 정책",
      "Action으로만 채울 object type은 datasource 없이 생성 가능",
      "보호된 리소스는 브랜치 저장 + proposal 필요",
    ],
    warn: "SuperRepo(Ontology-as-code)는 2026년 8월 베타. 사용 중인 환경에서 제공되는지는 관리자에게 확인 필요.",
    doc: D + "ontology-manager/overview",
    related: [
      { label: "object type 만들기", href: D + "object-link-types/create-object-type" },
      { label: "SuperRepo", href: D + "superrepo/overview" },
    ],
  },
  {
    id: "branch", n: "+3", layer: "ops", title: "Global Branching",
    lead: "여러 앱 변경을 브랜치 하나로 묶어 테스트한 뒤 Main에 병합. 2026년 5월 GA.",
    analogy: "Git feature branch + PR. 코드뿐 아니라 파이프라인·온톨로지·화면까지.",
    points: [
      "지원: transform·TS v1 function 저장소, Pipeline Builder, Ontology, Workshop, AIP Logic, Object Views",
      "Proposal = PR. 리소스별 승인 → merge check → Merge",
      "Ontology Manager 리소스는 branch protection 기본 켜짐",
    ],
    warn: "브랜치에서 만든 오브젝트 인스턴스는 Main에 안 합쳐짐(커뮤니티 답변). OSDK 앱·Developer Console 연동은 확인 필요.",
    doc: D + "foundry-branching/branching-lifecycle-usage",
    related: [{ label: "온톨로지 브랜치", href: D + "ontologies/branching-ontology" }],
  },
  {
    id: "market", n: "+4", layer: "ops", title: "Marketplace · Foundry DevOps",
    lead: "리소스를 product로 묶어 버전 관리하고 환경별로 설치.",
    analogy: "Helm chart + 앱스토어.",
    points: [
      "Product: Input(연결할 의존 리소스) → Output(설치로 생기는 리소스)",
      "Store = product 모음. 저장된 프로젝트 권한 상속",
      "DEV·TEST·PROD 설치, release channel, 자동 업그레이드",
    ],
    doc: D + "devops/core-concepts",
    related: [{ label: "설치하기", href: D + "marketplace/install-product" }],
  },
];
