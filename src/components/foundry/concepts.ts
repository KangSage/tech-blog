export type Layer = "sec" | "data" | "onto" | "logic" | "app" | "ops";

// 데이터 흐름 순서. 권한·보안과 운영은 모든 층에 걸치므로 마지막
export const layerLabels: Record<Layer, string> = {
  data: "데이터",
  onto: "온톨로지",
  logic: "로직",
  app: "앱",
  sec: "권한·보안",
  ops: "운영",
};

export interface Concept {
  id: string;
  /** 개념 목록 버튼에 쓰는 짧은 이름 */
  short: string;
  layer: Layer;
  title: string;
  lead: string;
  /** 개발자용 비유 (웹·DB 개념 기준) */
  analogy: string;
  /** 비개발자용 비유 (일상·업무 장면 기준) */
  everyday: string;
  points: string[];
  warn?: string;
  doc: string;
  related: { label: string; href: string }[];
}

const D = "https://www.palantir.com/docs/foundry/";

export const concepts: Concept[] = [
  {
    id: "transform", short: "Python transform", layer: "data", title: "Code Repositories · Python transform",
    lead: "입력 Dataset을 읽어 출력 Dataset을 쓰는 배치 코드입니다. build가 실행될 때 동작합니다.",
    analogy: "API 핸들러가 아니라 cron 배치 잡에 가깝습니다. Code Repositories는 웹 IDE와 Git 저장소를 합친 도구입니다.",
    everyday: "매일 밤 정해진 시간에 재료를 한꺼번에 손질해 두는 주방의 밑준비와 같습니다. 주문이 들어올 때마다 요리하는 것이 아니라, 미리 처리해 둔 결과를 다음 단계가 가져다 씁니다.",
    points: [
      "pandas: 1GB·100만 행 미만",
      "Polars·DuckDB: 1~50GB, 2억 행까지",
      "PySpark: 50GB·2억 행 초과. 시작 오버헤드가 큽니다.",
    ],
    warn: "엑셀 업로드 데이터(시트당 최대 약 105만 행)는 대부분 경량 엔진 구간에 들어갑니다.",
    doc: D + "transforms-python/compute-engines",
    related: [{ label: "transform 기본", href: D + "transforms-python/transforms-pipelines" }],
  },
  {
    id: "pb", short: "Pipeline Builder", layer: "data", title: "Pipeline Builder",
    lead: "클릭으로 파이프라인을 구성하는 도구입니다. 백엔드가 transform 코드를 생성하고 build 전에 스키마를 검사합니다.",
    analogy: "Zapier나 n8n처럼 블록을 선으로 이어 흐름을 만드는 노코드 도구와 비슷합니다. 다만 이어 붙이는 블록이 필터·조인·그룹화 같은 SQL 연산이고, 뒤에서 그 연산을 수행하는 transform 코드가 자동으로 만들어집니다.",
    everyday: "블록을 끼워 맞추듯 '거르기 → 합치기 → 묶기' 같은 단계를 화면에서 이어 붙이는 도구입니다. 단계를 다 이으면, 그 작업을 실제로 수행하는 프로그램이 자동으로 만들어집니다.",
    points: [
      "Expression은 컬럼 → 컬럼, Transform은 테이블 → 테이블 변환입니다.",
      "엔진은 Spark(배치 중심)와 Flink(스트리밍 중심)를 지원합니다.",
      "Dataset·Media set·Object로 출력할 수 있고, 브랜치와 버전 관리를 지원합니다.",
    ],
    warn: "생성 코드는 기존 Java transforms 저장소로만 내보낼 수 있습니다(PySpark 불가, 기본 배치 파이프라인만). 대상 브랜치의 기존 코드는 삭제되고, 되돌릴 수 없는 단방향 작업입니다. UDF·LLM 호출·미디어 연산 등은 TODO로 남으며 결과가 원래 파이프라인과 다를 수 있습니다.",
    doc: D + "pipeline-builder/overview",
    related: [{ label: "코드 내보내기", href: D + "pipeline-builder/export-pipeline" }],
  },
  {
    id: "dataset", short: "Dataset", layer: "data", title: "Dataset · 트랜잭션",
    lead: "Dataset은 파일 묶음(보통 Parquet)과 스키마로 구성되며, 변경은 트랜잭션 단위로 기록됩니다.",
    analogy: "겉모습은 테이블이지만 내부 동작은 Git 저장소에 가깝습니다. 트랜잭션 하나가 커밋 하나에 해당합니다.",
    everyday: "수정할 때마다 저장 버전이 남는 엑셀 파일과 같습니다. 구글 문서의 버전 기록처럼 예전 시점의 내용으로 되돌릴 수 있습니다.",
    points: [
      "SNAPSHOT: 전체를 교체합니다(TRUNCATE + INSERT).",
      "APPEND: 새 파일만 추가합니다. 증분 파이프라인의 기반입니다.",
      "UPDATE: 파일을 추가하거나 덮어씁니다. 덮어쓰면 하류의 증분 처리가 깨집니다.",
      "DELETE: 파일을 삭제합니다. 과거 시점의 view에는 남아 있습니다.",
    ],
    warn: "Data Lineage → History → Rollback to transaction으로 롤백할 수 있지만, 되돌아가는 것은 데이터뿐이며 로직은 그대로입니다. 보존 정책(retention)으로 삭제된 트랜잭션으로는 롤백할 수 없습니다. 보존 정책은 삭제 표시 후 보통 7일 뒤 실제로 지우며, 그 이후에는 복구할 수 없습니다.",
    doc: D + "data-integration/datasets",
    related: [
      { label: "롤백", href: D + "data-lineage/dataset-rollback" },
      { label: "보존 정책 실행", href: D + "retention/policy-execution" },
    ],
  },
  {
    id: "media", short: "Media set", layer: "data", title: "Media set · media reference",
    lead: "Media set은 파일 전용 저장소이고, media reference는 그 파일을 가리키는 포인터입니다.",
    analogy: "버전 관리를 켠 S3 버킷과, DB 컬럼에 저장한 S3 key의 관계와 같습니다.",
    everyday: "사진·문서를 보관하는 창고와, 장부에 적어 둔 '창고 몇 번 선반' 메모의 관계와 같습니다. 같은 선반에 새 파일을 넣어도 옛 파일은 치워지지 않고, 옛 메모는 계속 옛 파일을 가리킵니다.",
    points: [
      "같은 경로에 다시 업로드하면 경고 없이 새 media item으로 덮어씁니다. 기존 reference는 계속 이전 파일을 가리킵니다.",
      "덮어써진 item은 기본적으로 삭제되지 않고 버전 이력에 남으며 build에서도 처리될 수 있습니다. 정리하려면 '덮어쓰거나 삭제된 뒤 N일 후 영구 삭제' 보존 정책을 설정합니다.",
      "Object type의 Capabilities 탭에서 media source를 지정해야 연결됩니다.",
      "reference는 Action 폼 업로드, Function-backed action, Transform으로 갱신할 수 있습니다.",
    ],
    warn: "Media set 권한은 Object 정책과 별개입니다. 파일을 보호하려면 Media set을 따로 잠가야 합니다. 보존 기간을 줄이면 기간이 지난 item은 즉시 접근할 수 없게 되고, 다시 늘려도 복구되지 않습니다.",
    doc: D + "media-sets-advanced-formats/media-overview",
    related: [
      { label: "덮어쓰기와 버전 이력", href: D + "media-sets-advanced-formats/importing-media" },
      { label: "보존 정책", href: D + "media-sets-advanced-formats/media-set-settings" },
      { label: "권한 분리", href: D + "object-permissioning/managing-object-security" },
    ],
  },
  {
    id: "funnel", short: "Funnel", layer: "onto", title: "Funnel 인덱싱 · Materialization",
    lead: "Funnel은 Dataset을 객체 저장소(OSv2)로 인덱싱합니다. Action으로 만든 편집은 인덱스에 즉시 반영됩니다.",
    analogy: "MySQL 원본을 검색용 Elasticsearch 인덱스로 동기화하고, 앱은 인덱스만 조회하는 구조와 비슷합니다. Materialization은 원본과 편집을 합쳐 다시 테이블로 저장하는 materialized view에 해당합니다.",
    everyday: "도서관 책으로 검색용 목록(색인)을 만들어 두고, 사람들은 그 목록으로 책을 찾는 것과 같습니다. Materialization은 목록에 반영된 수정 사항까지 합쳐 책을 새로 인쇄해 두는 것에 해당합니다.",
    points: [
      "Dataset build가 끝나도 Funnel 파이프라인을 거쳐야 하므로 앱 반영은 조금 늦습니다.",
      "Action 편집은 인덱스에 즉시 반영되고 Funnel이 관리하는 Dataset에 주기적으로 저장됩니다. 원본 backing Dataset은 바뀌지 않습니다.",
      "Materialization은 원본과 편집을 합친 Dataset입니다. OSv2에서는 선택 사항이며, 하류 파이프라인이나 대량 다운로드에 씁니다.",
    ],
    doc: D + "object-indexing/overview",
    related: [{ label: "Materializations", href: D + "object-edits/materializations" }],
  },
  {
    id: "onto", short: "Ontology", layer: "onto", title: "Ontology",
    lead: "Dataset 위에 업무 의미를 부여하는 계층입니다. 앱은 Dataset이 아니라 Ontology를 읽고 씁니다.",
    analogy: "ORM 모델 계층에 해당합니다. Object type = 테이블, Object = 행, Property = 컬럼, Link type = 조인/FK, Object set = WHERE 결과입니다.",
    everyday: "엑셀 표를 '고객', '주문'처럼 실제 업무에서 쓰는 말로 정리한 명부와 같습니다. 한 줄은 고객 한 명, 칸은 이름·연락처 같은 항목이고, Link는 '이 고객의 주문 목록' 같은 연결입니다.",
    points: [
      "Object의 값은 backing datasource(원본 Dataset)에서 옵니다.",
      "Link type은 1:1, 1:N, N:M 관계를 모두 표현할 수 있습니다.",
      "Object set의 예: 상태가 '지연'인 항공편 전체",
    ],
    doc: D + "ontology/core-concepts",
    related: [],
  },
  {
    id: "action", short: "Action", layer: "logic", title: "Action type · Submission criteria",
    lead: "Object를 수정하는 방법을 정의합니다. Action 한 번 실행이 트랜잭션 하나입니다.",
    analogy: "서버 측 쓰기 API(POST)와 서버 측 validation을 합친 것입니다.",
    everyday: "정해진 양식의 신청서와 같습니다. 양식대로 작성하고 결재 조건을 통과해야만 내용이 실제로 반영됩니다.",
    points: [
      "Parameters: 요청 body에 해당합니다.",
      "Rules: 무엇을 바꿀지 정합니다(생성·수정·삭제·링크).",
      "Submission criteria: 제출 가능 여부를 정합니다. 사용자 그룹·파라미터·Object 상태를 조합해 조건을 만듭니다.",
    ],
    warn: "Object가 보이는지는 Object security policy가, 제출할 수 있는지는 Submission criteria가 결정합니다.",
    doc: D + "action-types/submission-criteria",
    related: [{ label: "Action 권한", href: D + "action-types/permissions" }],
  },
  {
    id: "function", short: "Function", layer: "logic", title: "Function (TypeScript · Python)",
    lead: "요청 시점에 실행되는 서버 코드입니다. Ontology 조회, 링크 탐색, 편집 계산을 담당합니다.",
    analogy: "AWS Lambda나 Next.js API route에 가깝습니다. Transform이 배치라면 Function은 요청 즉시 실행됩니다.",
    everyday: "물어볼 때마다 바로 답을 계산해 주는 계산기와 같습니다. 밤새 미리 만들어 두는 transform과 달리, 요청이 들어온 순간 계산합니다.",
    points: [
      "Query: 읽기 전용 함수입니다(GET에 해당).",
      "Edit function: 편집 내용을 계산만 합니다. Function-backed action으로 실행해야 저장됩니다.",
      "TypeScript v2(OSDK 기반)가 권장됩니다.",
    ],
    warn: "Edit function을 helper에서 실행하거나 직접 호출해도 결과는 저장되지 않습니다. 저장은 Action이 실행될 때만 일어납니다.",
    doc: D + "functions/overview",
    related: [{ label: "Ontology edits", href: D + "functions/edits-overview" }],
  },
  {
    id: "cm", short: "Compute module", layer: "logic", title: "Compute module",
    lead: "직접 만든 Docker 컨테이너를 Foundry 안에서 실행합니다.",
    analogy: "Docker 이미지로 배포하는 큐 워커에 가깝습니다. 요청을 받는 HTTP 서버가 아니라, 처리할 작업을 직접 가져와(폴링) 처리합니다.",
    everyday: "회사 밖 전문 업체에 맡기는 외주 작업과 같습니다. 쌓인 일감을 업체가 직접 가져가 처리하고, 누가 맡겼든 업체 자신의 출입 권한으로 일합니다.",
    points: [
      "Function mode: 함수로 등록해 Workshop·OSDK에서 호출합니다.",
      "Pipeline mode: 입력을 받아 출력으로 처리합니다. job token은 입출력에만 쓸 수 있습니다.",
      "Application permissions: 연결된 서비스 유저의 권한으로 동작하므로 호출자와 관계없이 결과가 같습니다.",
    ],
    warn: "Function으로 해결되면 Function이 더 단순합니다. 특정 언어·라이브러리가 필요하거나 무거운 작업일 때 Compute module을 선택합니다.",
    doc: D + "compute-modules/overview",
    related: [{ label: "실행 모드", href: D + "compute-modules/execution-modes" }],
  },
  {
    id: "workshop", short: "Workshop", layer: "app", title: "Workshop",
    lead: "Ontology 위에서 앱을 조립하는 로우코드 빌더입니다.",
    analogy: "Retool과 비슷합니다. Layout = JSX 구조, Widget = 컴포넌트, Variable = useState, Event = 이벤트 핸들러입니다.",
    everyday: "파워포인트에서 도형을 끌어다 놓듯, 표·차트·버튼을 배치해 업무 화면을 만드는 도구입니다. 버튼을 누르면 신청서(Action)가 제출되는 식으로 연결됩니다.",
    points: [
      "쓰기는 Action, 복잡한 계산은 Function에 연결합니다.",
      "기본 위젯으로 부족하면 Custom widget으로 직접 작성한 프론트엔드 코드를 넣을 수 있습니다.",
      "React(OSDK)와 비교하면 빠르고 코드가 적은 대신 자유도가 낮습니다.",
    ],
    doc: D + "app-building/overview",
    related: [],
  },
  {
    id: "osdk", short: "OSDK", layer: "app", title: "OSDK · Developer Console",
    lead: "OSDK는 Ontology에서 생성되는 타입 있는 클라이언트이고, Developer Console은 커스텀 앱을 관리하는 콘솔입니다.",
    analogy: "Prisma Client처럼 스키마(Ontology)에서 생성되는 타입 있는 클라이언트입니다. Developer Console은 GitHub의 OAuth App 설정처럼 앱을 등록하고 허용 범위(scope)를 관리하는 곳입니다.",
    everyday: "Foundry 데이터를 회사가 직접 만든 앱에서 쓸 수 있게 해 주는 전용 연결 도구입니다. Developer Console은 그 앱을 등록하고 어떤 데이터까지 쓸 수 있는지 정하는 관리 창구입니다.",
    points: [
      "토큰의 접근 범위 = 사용자 권한 ∩ 앱 최대 scope ∩ 요청 scope",
      "웹 호스팅은 정적 SPA만 지원합니다. 서버 로직은 Function과 Action으로 구현합니다.",
      "앱당 리소스는 기본 1,000개입니다.",
    ],
    warn: "scope는 앱 단위의 상한입니다. 사용자별로 차등을 두거나 '앱을 통해서만 접근'하도록 강제할 수는 없습니다.",
    doc: D + "developer-console/overview",
    related: [
      { label: "Scopes", href: D + "ontology-sdk/third_party_app_scopes" },
      { label: "웹 호스팅", href: D + "developer-console/deploy-custom-application-on-foundry" },
    ],
  },
  {
    id: "project", short: "Project · Role · Marking", layer: "sec", title: "Project · Role · Marking",
    lead: "Project는 리소스를 묶는 작업 단위이자 권한 경계입니다. 리소스에 접근하려면 Role이 있어야 하고, 적용된 Marking도 모두 통과해야 합니다.",
    analogy: "Role은 MySQL의 GRANT처럼 무엇을 할 수 있는지 정합니다. Marking은 모든 요청 앞에 붙는 필수 검사 미들웨어와 같아서, 하나라도 통과하지 못하면 GRANT와 관계없이 차단됩니다.",
    everyday: "Role은 사무실 출입증의 등급(보기만 가능, 편집 가능 등)과 같습니다. Marking은 '기밀' 표시가 붙은 서류실의 추가 잠금이라, 출입증 등급이 높아도 기밀 허가가 없으면 들어갈 수 없습니다.",
    points: [
      "Role(Owner·Editor·Viewer)은 프로젝트 단위의 GRANT로, 무엇을 할 수 있는지를 정합니다.",
      "Marking은 all-or-nothing입니다. 하나라도 통과하지 못하면 Role과 관계없이 접근할 수 없습니다.",
      "Marking은 파생 데이터에도 전파됩니다. 접근을 막는 장치이며 권한을 부여하지는 않습니다.",
    ],
    warn: "Editor Role이 있어도 PII Marking의 멤버가 아니면 해당 데이터에 접근할 수 없습니다.",
    doc: D + "security/projects-and-roles",
    related: [{ label: "Markings", href: D + "security/markings" }],
  },
  {
    id: "osp", short: "Object security policy", layer: "sec", title: "Object security policy",
    lead: "Object의 행 단위 조회 권한입니다. Property security policy와 함께 쓰면 셀 단위까지 제어할 수 있습니다.",
    analogy: "Postgres RLS에 해당합니다. 모든 SELECT에 DB가 자동으로 WHERE 조건을 붙이는 것과 같습니다.",
    everyday: "같은 명부를 열어도 사람마다 자기 담당 고객의 줄만 보이도록 나머지를 자동으로 가려 주는 것과 같습니다.",
    points: [
      "조건은 granular policy로 작성합니다. 사용자 속성(그룹 ID 등)과 property 값을 비교하며, 이름이 아니라 ID를 씁니다.",
      "Dataset 권한과는 양방향으로 분리됩니다. Dataset 권한이 없어도 Object가 보일 수 있고, 있어도 안 보일 수 있습니다.",
      "변경은 거의 즉시 반영됩니다. 반면 Restricted view(Dataset용 RLS)는 재빌드가 필요합니다.",
    ],
    warn: "Ontology 안에서만 동작하므로 원본 Dataset은 따로 잠가야 합니다. 이전 datasource-derived 권한 모델을 쓰는 환경에서는 Dataset 권한도 여전히 필요합니다.",
    doc: D + "object-permissioning/object-security-policies",
    related: [
      { label: "Restricted view", href: D + "security/restricted-views" },
      { label: "Granular policy", href: D + "platform-security-management/manage-granular-policies" },
    ],
  },
  {
    id: "oauth", short: "OAuth", layer: "sec", title: "OAuth: 사용자 로그인 vs 서비스 유저",
    lead: "Authorization code 방식은 사용자를 대신해 동작하고, Client credentials 방식은 서비스 유저(앱 전용 계정)로 동작합니다.",
    analogy: "'Google로 로그인'과 서버 간 API 키의 차이와 같습니다.",
    everyday: "'카카오로 로그인'처럼 각자 자기 계정으로 앱에 들어가는 방식과, 회사 공용 계정 하나로 모두가 같이 쓰는 방식의 차이입니다.",
    points: [
      "브라우저 SPA는 public client입니다. PKCE가 필수이고 Client credentials는 쓸 수 없습니다.",
      "PKCE는 로그인마다 새 verifier를 만들어 인가 코드 탈취를 막는 장치입니다. OSDK의 @osdk/oauth(createPublicOauthClient)가 verifier 생성과 S256 challenge를 자동으로 처리합니다.",
      "서비스 유저로 호출하면 모든 요청이 같은 권한을 가지므로, 사용자별 구분은 앱 로직이 맡아야 합니다.",
    ],
    warn: "client secret을 React 코드에 넣으면 브라우저에서 그대로 노출됩니다.",
    doc: D + "platform-security-third-party/writing-oauth2-clients",
    related: [
      { label: "클라이언트 등록", href: D + "platform-security-third-party/register-3pa" },
      { label: "@osdk/oauth 소스", href: "https://github.com/palantir/osdk-ts/blob/main/packages/oauth/src/createPublicOauthClient.ts" },
    ],
  },
  {
    id: "oma", short: "Ontology Manager", layer: "ops", title: "Ontology Manager",
    lead: "Object type과 Action type을 만들고 관리하는 앱입니다.",
    analogy: "MySQL Workbench의 스키마 편집 기능과 관리 콘솔을 합친 것에 가깝습니다.",
    everyday: "명부에 어떤 칸을 둘지 정하고, 신청서 양식을 설계하는 관리자 화면입니다.",
    points: [
      "생성 순서: datasource → property → primary key·title key → Action → 저장 위치 → 보안 정책",
      "Action으로만 데이터를 채울 Object type은 datasource 없이 만들 수 있습니다.",
      "보호된 리소스는 브랜치에 저장하고 proposal을 거쳐야 합니다.",
    ],
    warn: "SuperRepo(Ontology-as-code)는 베타 단계이며, 공식 문서에 따르면 환경(enrollment)에 따라 제공되지 않을 수 있습니다.",
    doc: D + "ontology-manager/overview",
    related: [
      { label: "Object type 만들기", href: D + "object-link-types/create-object-type" },
      { label: "SuperRepo", href: D + "superrepo/overview" },
    ],
  },
  {
    id: "branch", short: "Global Branching", layer: "ops", title: "Global Branching",
    lead: "여러 앱에 걸친 변경을 브랜치 하나로 묶어 테스트한 뒤 Main에 병합합니다. 2026년 5월에 GA가 되었습니다.",
    analogy: "Git feature branch와 PR에 해당합니다. 다만 코드뿐 아니라 파이프라인·Ontology·화면까지 함께 다룹니다.",
    everyday: "원본을 바로 고치지 않고 사본에서 먼저 고쳐 본 뒤, 검토를 받아 원본에 반영하는 방식입니다. 구글 문서의 '제안 모드'와 비슷합니다.",
    points: [
      "지원 대상: Code Repositories, Pipeline Builder, Ontology(Action·Materialization 포함), Workshop, AIP Logic, Automate, Object Views, Restricted Views, TypeScript function 등. TS v2 function은 로컬 OSDK를 쓸 때만 브랜치에서 수정할 수 있고, Python function은 수정할 수 없습니다.",
      "Proposal이 PR 역할을 합니다. 리소스별 승인 → merge check → Merge 순서로 진행되며, 일부만 실패한 병합은 되돌릴 수 없습니다.",
      "Ontology Manager 리소스에는 branch protection이 기본으로 켜져 있습니다.",
      "기본값으로 35일 동안 쓰지 않은 브랜치는 비활성화되고, 그 7일 뒤 브랜치 데이터가 삭제됩니다.",
    ],
    warn: "브랜치에서 Action으로 만든 편집은 테스트용이며 Main에 병합되지 않습니다. 또한 Ontology SDK(OSDK)는 현재 브랜치를 지원하지 않고, Developer Console도 지원 대상에 없습니다.",
    doc: D + "foundry-branching/branching-lifecycle-usage",
    related: [
      { label: "지원 범위", href: D + "foundry-branching/supported-functionality" },
      { label: "GA 공지", href: D + "announcements/2026-05" },
      { label: "브랜치에서 Action 실행", href: D + "action-types/branching-action-types" },
      { label: "Ontology 브랜치", href: D + "ontologies/branching-ontology" },
    ],
  },
  {
    id: "market", short: "Marketplace", layer: "ops", title: "Marketplace · Foundry DevOps",
    lead: "리소스를 product로 묶어 버전을 관리하고 환경별로 설치합니다.",
    analogy: "npm 패키지처럼 리소스 묶음에 버전을 붙여 배포하고, DEV·TEST·PROD 환경마다 설치·업그레이드하는 구조입니다.",
    everyday: "만들어 둔 업무 도구 묶음을 앱스토어의 앱처럼 버전별로 올려 두고, 부서(환경)마다 설치하고 업데이트하는 구조입니다.",
    points: [
      "Product는 Input(연결할 의존 리소스)과 Output(설치로 생성되는 리소스)으로 구성됩니다.",
      "Store는 product 모음이며, 저장된 프로젝트의 권한을 상속합니다.",
      "DEV·TEST·PROD 환경별 설치, release channel, 자동 업그레이드를 지원합니다.",
    ],
    doc: D + "devops/core-concepts",
    related: [{ label: "설치하기", href: D + "marketplace/install-product" }],
  },
];
