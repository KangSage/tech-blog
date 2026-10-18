import { D } from "./concepts";

// 관점(노선) 보기: 지도 전체 대신 초점 질문 하나에 답하는 개념만 순서대로 보여 준다.
// 개념 이름은 쓰지 않는다: 단계는 concepts.ts의 id로 가리키고 화면에는 short를 보여 준다.
// 단계 설명은 sources에 링크한 Palantir 공식 문서(해당 개념 카드의 doc/related 포함)로 확인한 내용만 담는다.
export interface RouteStep {
  /** 이 단계의 개념. 둘 이상이면 그중 하나를 쓰는 갈래(예: 코드 또는 클릭) */
  ids: string[];
  note: string;
}

export interface Route {
  id: string;
  label: string;
  /** 이 노선이 답하는 초점 질문 하나 */
  question: string;
  steps: RouteStep[];
  /** 지도에서 진하게 표시할 선. 그림에 그려진 선의 data-edges 쌍을 순서까지 그대로 쓰고 양 끝이 모두 steps에 있어야 한다(빌드·개발 서버에서 검사) */
  edges: [string, string][];
  sources: { label: string; href: string }[];
  /** 이 노선을 자세히 다룬 연재 글의 한국어 slug (예: "foundry-access-route"). 글이 게시된 뒤에만 적는다(게시되지 않은 글이면 빌드가 멈춘다) */
  article?: string;
}

export const routes: Route[] = [
  {
    id: "batch",
    label: "배치 데이터",
    question: "외부 시스템의 데이터는 어떻게 업무 앱 화면까지 오는가?",
    steps: [
      { ids: ["dc"], note: "Source로 외부 시스템에 연결하고 sync로 데이터를 Dataset으로 가져옵니다. 밖에서 미리 가공하지 않고 원본 그대로 가져오는 것이 원칙입니다." },
      { ids: ["transform", "pb"], note: "원본 Dataset을 입력으로 읽어 가공한 Dataset을 씁니다. 코드로 작성하면 Python transform, 클릭으로 구성하면 Pipeline Builder를 씁니다." },
      { ids: ["builds"], note: "Build가 sync와 transform job을 실행해 출력을 새로 계산하고 Schedule이 그 Build를 반복합니다." },
      { ids: ["dataset"], note: "가공한 결과는 변경이 트랜잭션 단위로 기록되는 Dataset에 저장됩니다." },
      { ids: ["funnel"], note: "Funnel이 Dataset을 객체 저장소인 Object Storage v2(OSv2)로 인덱싱합니다." },
      { ids: ["onto"], note: "Object type·Property·Link type이 데이터에 업무 의미를 붙입니다." },
      { ids: ["workshop"], note: "Workshop 앱은 Ontology를 직접 조회해 화면에 보여 줍니다." },
    ],
    edges: [
      ["dc", "transform"],
      ["dc", "pb"],
      ["dc", "dataset"],
      ["transform", "dataset"],
      ["pb", "dataset"],
      ["dataset", "funnel"],
      ["funnel", "onto"],
      ["workshop", "onto"],
    ],
    sources: [
      { label: "Data Connection 핵심 개념", href: D + "data-connection/core-concepts" },
      { label: "Python transform", href: D + "transforms-python/transforms" },
      { label: "Pipeline Builder", href: D + "pipeline-builder/overview" },
      { label: "Builds", href: D + "data-integration/builds" },
      { label: "Schedules", href: D + "data-integration/schedules" },
      { label: "Dataset", href: D + "data-integration/datasets" },
      { label: "Funnel", href: D + "object-indexing/overview" },
      { label: "Ontology", href: D + "ontology/core-concepts" },
      { label: "Workshop", href: D + "workshop/overview" },
    ],
  },
  {
    id: "edit",
    label: "사용자 편집",
    question: "사용자가 앱에서 값을 바꾸면 어디에 어떻게 저장되는가?",
    steps: [
      { ids: ["workshop", "osdk"], note: "사용자가 Workshop이나 OSDK 앱에서 Action을 제출합니다." },
      { ids: ["action"], note: "Submission criteria를 통과해야 제출되며 Action 한 번이 트랜잭션 하나입니다." },
      { ids: ["function", "aip"], note: "Function-backed action이면 Edit function이나 AIP Logic 함수가 편집 내용을 계산합니다. 계산만으로는 저장되지 않고 Action이 실행될 때 저장됩니다." },
      { ids: ["onto"], note: "Object의 값은 원본 데이터와 Action 편집을 합친 것이 됩니다." },
      { ids: ["funnel"], note: "편집은 인덱스에 즉시 반영되고 backing Dataset이 아니라 Funnel이 관리하는 Dataset에 주기적으로 저장됩니다. Materialization은 Object Storage v2(OSv2)에서 선택 사항이며 만들면 원본과 편집을 합친 각 Object의 최신 상태가 별도 출력 Dataset으로 저장됩니다." },
    ],
    edges: [
      ["workshop", "action"],
      ["osdk", "action"],
      ["action", "onto"],
      ["funnel", "onto"],
    ],
    sources: [
      { label: "Action type", href: D + "action-types/overview" },
      { label: "Submission criteria", href: D + "action-types/submission-criteria" },
      { label: "Function-backed action", href: D + "functions/use-functions" },
      { label: "Ontology edits", href: D + "functions/edits-overview" },
      { label: "AIP Logic", href: D + "logic/overview" },
      { label: "편집이 적용되는 방식", href: D + "object-edits/how-edits-applied" },
      { label: "Materialization", href: D + "object-edits/materializations" },
    ],
  },
  {
    id: "external",
    label: "외부 앱·AI",
    question: "Foundry 밖의 앱과 AI 에이전트는 어떻게 Ontology에 접근하는가?",
    steps: [
      { ids: ["osdk"], note: "Developer Console에 앱을 등록하고 앱 제한으로 접근할 리소스와 작업의 상한을 정합니다. OSDK는 Ontology에서 생성되는 타입 있는 클라이언트입니다." },
      { ids: ["oauth"], note: "앱은 OAuth로 토큰을 받습니다. Authorization code 방식은 사용자를 대신해 동작하고 Client credentials 방식은 서비스 유저로 동작합니다." },
      { ids: ["onto"], note: "토큰은 사용자(또는 서비스 유저) 권한과 앱 제한이 모두 허용하는 리소스에만 접근합니다. 제한 없는(unrestricted) 앱에는 앱 제한이 없으므로 사용자(또는 서비스 유저)가 접근할 수 있는 리소스에 모두 접근합니다." },
      { ids: ["action", "function"], note: "Object 조회는 Function 없이 OSDK로 바로 할 수 있습니다. 쓰기는 Action을 호출하고 계산 로직이 필요하면 Function을 호출합니다." },
      { ids: ["omcp"], note: "외부 AI 에이전트는 Ontology MCP로 Developer Console 앱의 Object를 읽고 Action과 query function을 도구로 호출합니다. MCP client도 같은 앱의 OAuth 설정으로 인증하며 에이전트가 실행할 수 있는 Action은 앱 제한으로 정합니다." },
    ],
    edges: [
      ["osdk", "oauth"],
      ["osdk", "onto"],
      ["osdk", "action"],
      ["osdk", "function"],
    ],
    sources: [
      { label: "Developer Console", href: D + "developer-console/overview" },
      { label: "앱 제한", href: D + "developer-console/application-restrictions" },
      { label: "OSDK", href: D + "ontology-sdk/overview" },
      { label: "OAuth 클라이언트", href: D + "platform-security-third-party/writing-oauth2-clients" },
      { label: "Ontology MCP", href: D + "ontology-mcp/overview" },
      { label: "Ontology MCP 인증", href: D + "ontology-mcp/authentication-and-authorization" },
    ],
  },
  {
    id: "access",
    article: "foundry-access-route",
    label: "권한",
    question: "누가 무엇을 보고 고칠 수 있는가?",
    steps: [
      { ids: ["project"], note: "Project Role이 할 수 있는 일을 정하고 Marking·Organization·Classification-based Access Controls(CBAC) 같은 필수 통제를 모두 통과해야 리소스에 접근할 수 있습니다." },
      { ids: ["rv"], note: "Restricted view는 Dataset에서 볼 수 있는 행만 보이게 하고 그 행으로 만든 Object에도 같은 통제가 적용됩니다. 정책을 바꾸면 다시 Build해야 반영되고 backing Dataset 권한은 따로 막아야 합니다." },
      { ids: ["osp"], note: "Object security policy는 Ontology 안에서 Object를 행 단위로 거르고 정책 변경은 거의 즉시 반영되지만 그룹 멤버십 같은 사용자 속성의 변경은 잠시 캐시됩니다. backing Dataset은 따로 잠가야 합니다." },
      { ids: ["action"], note: "Action을 제출하려면 Submission criteria를 통과하고 편집 대상 Object type·Link type과 그 datasource를 볼 수 있어야 합니다. Action은 쓰는 데이터의 보안을 로직이 정하므로 Marking이 붙은 데이터를 읽는 Action에는 read authorization(베타)을 설정하고 write authorization을 그보다 낮게 두지 않습니다." },
      { ids: ["oauth"], note: "OSDK 앱이 받는 토큰은 사용자(또는 서비스 유저) 권한과 앱 제한이 모두 허용하는 리소스에만 접근합니다. 제한 없는(unrestricted) 앱에는 앱 제한이 없으므로 사용자(또는 서비스 유저)가 접근할 수 있는 리소스에 모두 접근합니다." },
      { ids: ["approvals"], note: "권한이 없으면 Approvals로 Project 접근이나 Marking 접근을 요청합니다. request의 모든 task가 승인되면 적용되고 필수 checkpoint가 남아 있으면 그 checkpoint를 제출한 뒤에 적용됩니다. Checkpoints는 민감할 수 있는 작업에서 사유를 묻고 기록합니다." },
    ],
    edges: [],
    sources: [
      { label: "Project · Role", href: D + "security/projects-and-roles" },
      { label: "Marking", href: D + "security/markings" },
      { label: "Restricted view", href: D + "security/restricted-views" },
      { label: "Object security policy", href: D + "object-permissioning/object-security-policies" },
      { label: "정책 방식 비교", href: D + "object-permissioning/managing-object-security" },
      { label: "Action 권한", href: D + "action-types/permissions" },
      { label: "Read · write authorization", href: D + "action-types/read-write-authorizations" },
      { label: "앱 제한", href: D + "developer-console/application-restrictions" },
      { label: "Approvals", href: D + "approvals/overview" },
      { label: "Checkpoints", href: D + "checkpoints/overview" },
    ],
  },
  {
    id: "change",
    label: "변경 관리",
    question: "Ontology와 앱의 변경은 어떻게 검토하고 배포하는가?",
    steps: [
      { ids: ["oma"], note: "Ontology Manager에서 Object type·Link type·Action type 같은 Ontology 리소스를 정의합니다. 보호된 리소스는 브랜치에서 수정하고 proposal을 거쳐 병합해야 합니다." },
      { ids: ["branch"], note: "Global Branching으로 파이프라인·Ontology·Workshop 같은 여러 앱의 변경을 브랜치 하나에서 테스트합니다. Proposal의 check를 모두 통과해야 Main에 병합할 수 있습니다. 검토자는 proposal 페이지나 branch taskbar에서 지정합니다. Project의 승인 정책은 Project Owner가 Branch protection 탭에서 정하고 Code Repositories와 Pipeline Builder는 리소스 안에서 승인 정책을 정합니다." },
      { ids: ["lineage"], note: "Workflow Lineage로 바꿀 Object 컬럼을 쓰는 하류 Action과 Workshop 앱을 찾습니다. 브랜치에서 리소스를 제거해 Main 버전으로 되돌리기 전에는 다른 브랜치 리소스가 그 변경에 기대고 있지 않은지 확인합니다." },
      { ids: ["approvals"], note: "Ontology 변경이 있는 브랜치에서 Global Branching proposal을 만들면 Ontology proposal이 자동으로 생기고 함께 병합됩니다. 그 변경은 Ontology Manager의 Review changes 탭이나 Global Branching proposal 페이지에서 검토합니다. Approvals가 다루는 task 종류에도 Ontology proposal이 있으며 이 task는 Ontology Manager로 연결됩니다." },
      { ids: ["market"], note: "개발·테스트·운영처럼 환경이 여럿이면 리소스를 product로 묶어 환경마다 버전별로 설치하고 업그레이드할 수 있습니다. 릴리스 관리 문서는 이것이 릴리스 관리를 구현하는 한 가지 방법이며 Global Branching을 쓰는 방법도 있다고 설명합니다. Global Branching 문서는 둘을 서로 다른 문제를 푸는 보완 관계로 보고 브랜치에서 개발해 개발 환경에 병합한 뒤 릴리스 관리로 테스트·운영 환경에 배포하는 예를 듭니다." },
    ],
    edges: [],
    sources: [
      { label: "Ontology Manager", href: D + "ontology-manager/overview" },
      { label: "Global Branching", href: D + "global-branching/core-concepts" },
      { label: "리소스 보호", href: D + "global-branching/resource-protection-and-approval-policies" },
      { label: "Workflow Lineage", href: D + "workflow-lineage/overview" },
      { label: "Ontology proposal 검토", href: D + "ontologies/review-ontology-proposals" },
      { label: "Ontology 브랜치", href: D + "ontologies/branching-ontology" },
      { label: "proposal Changes 탭 공지", href: D + "announcements/2026-09" },
      { label: "Approvals", href: D + "approvals/overview" },
      { label: "Marketplace", href: D + "marketplace/overview" },
      { label: "릴리스 관리", href: D + "devops-release-management/use-devops-for-release-management" },
      { label: "Global Branching과 릴리스 관리", href: D + "global-branching/overview" },
    ],
  },
];
