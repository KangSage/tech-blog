---
title: "프록시 환경 Windows에서 Claude Code + Palantir MCP 연결하기 (삽질 기록)"
description: "HTTP 프록시를 거쳐야 하는 Windows 환경에서 Claude Code에 Palantir MCP를 연결하며 겪은 증상과 원인, 해결 방법을 순서대로 정리합니다."
publishedAt: "2026-10-12"
lang: "ko"
translationKey: "claude-code-palantir-mcp-proxy-windows"
category: "tech"
tags: ["claude-code", "mcp", "palantir", "proxy", "windows", "클로드코드", "팔란티어", "프록시", "윈도우"]
draft: false
---

Palantir Foundry 개발자 티어를 쓰면서 Claude Code에 [Palantir MCP](https://www.palantir.com/docs/foundry/palantir-mcp/overview)를 붙여봤습니다.\
문서대로 하면 금방 될 줄 알았는데 **HTTP 프록시를 거쳐야 하는 Windows 환경**이라 시간이 좀 걸렸습니다.\
같은 곳에서 막힐 분들을 위해 증상, 원인, 해결을 순서대로 정리합니다.

> 환경: Windows, PowerShell, Node.js, Claude Code(네이티브 설치), Palantir MCP(`palantir-mcp` npm 패키지), HTTP 프록시 필수 네트워크

---

## TL;DR

1. Node의 `fetch`는 기본값으로는 [`HTTPS_PROXY` 환경변수](https://nodejs.org/api/cli.html#node_use_env_proxy1)를 **무시합니다**.\
   [undici](https://github.com/nodejs/undici)로 프록시를 직접 지정해야 합니다.
2. `NO_PROXY`에 Foundry 도메인이 걸리면 Node가 프록시를 건너뛰어서 **타임아웃**이 납니다.\
   → MCP 서버에만 프록시를 강제합니다.
3. Foundry 저장소를 clone한 **폴더 안에서** Claude Code를 실행합니다.
4. 토큰을 재발급하면 **환경변수도 같이** 바꿉니다. (안 그러면 `npm E401`)

---

## 1. 프록시 환경변수 확인

```powershell
$env:HTTPS_PROXY
$env:HTTP_PROXY
$env:NO_PROXY
$env:NODE_EXTRA_CA_CERTS   # 프록시가 TLS를 검사하면 필요
```

값이 비어 있으면 사용자 환경변수로 저장합니다.\
스크립트 실행이 막힌 PC에서도 동작합니다.

```powershell
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://<프록시>:<포트>", "User")
```

> 참고: Windows PowerShell 5.1의 `irm`과 `winget`도 `HTTPS_PROXY`를 무시합니다.\
> 이 둘은 [`-Proxy`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-restmethod?view=powershell-5.1#-proxy) / [`--proxy`](https://learn.microsoft.com/en-us/windows/package-manager/winget/install#options) 옵션으로 직접 지정해야 합니다.

## 2. Palantir MCP 전용 프록시 파일 만들기

핵심은 이 부분입니다.\
처음에는 [`EnvHttpProxyAgent`](https://github.com/nodejs/undici/blob/main/docs/docs/api/EnvHttpProxyAgent.md)(환경변수를 따르는 방식)로 모든 Node 프로세스에 프록시를 걸었습니다.\
그런데 `UND_ERR_CONNECT_TIMEOUT`이 계속 났습니다.

**원인**: `NO_PROXY`에 Foundry 주소와 겹치는 도메인이 있었습니다.\
그래서 Node가 "프록시 없이 직접 연결"을 시도했고 직접 연결은 막혀 있었습니다.

**판별 방법**:

```powershell
# 프록시를 직접 지정 → 응답 옴(307)
curl.exe -I --proxy $env:HTTPS_PROXY "https://<foundry 주소>"
# 프록시 없이 → 실패
curl.exe -I --noproxy "*" "https://<foundry 주소>"
```

`NO_PROXY`를 통째로 고치면 다른 사이트가 깨질 수 있습니다.\
그래서 **Palantir MCP에만** 프록시를 강제하는 파일을 따로 만들었습니다([`ProxyAgent`](https://github.com/nodejs/undici/blob/main/docs/docs/api/ProxyAgent.md) 사용).

```powershell
npm install -g undici
$root = (npm root -g) -replace '\\','/'
$f = "$env:USERPROFILE\palantir-proxy.js"
@"
const u = require('$root/undici');
u.setGlobalDispatcher(new u.ProxyAgent(process.env.HTTPS_PROXY));
"@ | Set-Content $f -Encoding utf8
```

> 함정: `NODE_OPTIONS`에 `$HOME`이나 `%USERPROFILE%`을 글자 그대로 넣으면 안 됩니다.\
> Node는 이걸 실제 경로로 바꾸지 않습니다.\
> 반드시 `C:/Users/...` 같은 실제 경로를 넣습니다.

## 3. Foundry 저장소 폴더에서 실행하기

개인 토큰으로 어디서나 실행하면 토큰 관련 오류가 났습니다.\
Foundry 저장소를 clone한 폴더 안에서 실행하면 저장소용 토큰으로 인증됩니다.

그런데 그 폴더에는 이미 `.mcp.json`이 있습니다.\
그래서 `claude mcp add`를 하면 `already exists in .mcp.json` 오류가 납니다.\
공유 파일은 건드리지 말고 **같은 이름으로 `--scope local`(내 PC 전용) 설정을 추가해서 덮어씁니다**.\
아래는 `.mcp.json`의 설정을 그대로 복사하고 프록시만 더하는 스크립트입니다.

```powershell
# Foundry 저장소 폴더에서 실행
$s = (Get-Content .mcp.json -Raw | ConvertFrom-Json).mcpServers.'palantir-mcp'
$p = (Resolve-Path "$env:USERPROFILE\palantir-proxy.js").Path -replace '\\','/'
$e = @(); foreach ($k in $s.env.PSObject.Properties) { $e += '-e'; $e += "$($k.Name)=$($k.Value)" }
claude mcp add palantir-mcp --scope local @e -e "NODE_OPTIONS=--require=$p" -- cmd /c $s.command @($s.args)
```

- Windows에서 `npx`는 `cmd /c`를 거쳐야 실행됩니다.
- 첫 실행 때는 npx 다운로드 때문에 느릴 수 있습니다.\
  시간 초과가 나면 `MCP_TIMEOUT`을 늘립니다.

```powershell
[Environment]::SetEnvironmentVariable("MCP_TIMEOUT", "60000", "User")
```

### `.mcp.json`에 토큰이 글자 그대로 들어 있을 때

제 `.mcp.json`에는 토큰이 글자 그대로 들어 있었습니다.\
위 스크립트는 `env` 값을 그대로 복사하므로 토큰도 local 설정에 글자 그대로 복사됩니다.

Claude Code는 `.mcp.json`에서 `${VAR}` 형식의 환경변수 확장을 지원합니다([Environment variable expansion in `.mcp.json`](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcp-json)).\
그래서 토큰 자리를 환경변수 이름으로 바꾸고 실제 값은 사용자 환경변수에만 두었습니다.

```json
"env": { "FOUNDRY_TOKEN": "${FOUNDRY_TOKEN}" }
```

- `${...}` 안의 이름은 환경변수 이름과 글자가 똑같아야 합니다.
- PowerShell에서 직접 입력할 때는 작은따옴표로 감쌉니다.\
  큰따옴표 안에서는 PowerShell이 `$`로 시작하는 부분을 먼저 값으로 바꿉니다.
- 토큰이 들어간 채로 커밋한 적이 있으면 토큰을 재발급합니다.

### `Conflicting scopes` 경고

같은 이름의 서버를 `.mcp.json`과 local 두 곳에 넣었기 때문에 `claude mcp list`와 `/mcp`에 경고가 나옵니다([Configuration warnings](https://code.claude.com/docs/en/mcp#configuration-warnings)).\
[Scope hierarchy and precedence](https://code.claude.com/docs/en/mcp#scope-hierarchy-and-precedence)에 따르면 같은 이름이 여러 범위에 있을 때 local, project(`.mcp.json`), user 순으로 우선합니다.\
항목을 섞지 않고 우선하는 쪽의 설정 전체를 씁니다.\
그래서 프록시를 넣은 local 설정이 적용됩니다.

## 4. `npm error code E401`

며칠 쉬고 와서 토큰을 재발급했는데 다시 안 됐습니다.\
서버를 직접 실행해 보니 `npm error code E401`이 나왔습니다.\
MCP 문제가 아니라 **npx가 패키지를 받는 단계**에서 npm 레지스트리 로그인이 실패한 것입니다.

제 환경에서는 npm 레지스트리 인증에 환경변수 `FOUNDRY_TOKEN`을 쓰고 있었습니다.\
그런데 그 환경변수에는 **옛 토큰**이 그대로 남아 있었습니다.\
환경변수를 새 토큰으로 바꾸니 해결됐습니다.

```powershell
$t = (Get-Content "<토큰 파일>" -Raw).Trim()   # .Trim(): 끝 줄바꿈 제거. 이게 남으면 인증 실패
[Environment]::SetEnvironmentVariable("FOUNDRY_TOKEN", $t, "User")
Remove-Variable t
```

> `npm config get registry`가 "protected" 오류를 내면 `npm config list`를 씁니다.\
> 비밀값은 `(protected)`로 가려져서 나옵니다.

---

## 증상별 정리

| 증상 | 원인 | 해결 |
|---|---|---|
| `irm`, `winget` 설치 실패 | `HTTPS_PROXY`를 무시함 | `-Proxy`, `--proxy` 옵션으로 직접 지정 |
| `UND_ERR_CONNECT_TIMEOUT` | `NO_PROXY` 때문에 프록시를 건너뜀 | MCP 전용 `ProxyAgent` 파일 |
| `Cannot find module ...proxy-bootstrap.js` | `NODE_OPTIONS`에 `$HOME`이 글자 그대로 들어감 | 실제 경로로 저장 |
| 토큰 오류 | 저장소 폴더 밖에서 실행함 | clone한 폴더에서 실행 |
| `already exists in .mcp.json` | 저장소에 설정이 이미 있음 | `--scope local`로 덮어쓰기 |
| `Conflicting scopes` 경고 | 같은 이름이 `.mcp.json`과 local에 있음 | local 설정이 우선 적용됨 |
| `.mcp.json`에 토큰이 글자로 있음 | 설정에 값이 직접 들어감 | `${FOUNDRY_TOKEN}`으로 바꾸기 |
| `npm error code E401` | 환경변수에 옛 토큰이 남아 있음 | 환경변수 업데이트 |
| `DEP0190` 경고 | Node 경고일 뿐 | 무시 |

## 교훈

- **추측하지 말고 에러 원문부터 봅니다.**\
  MCP 서버를 Claude 밖에서 직접 실행하면 진짜 에러가 보입니다.
- `NODE_TLS_REJECT_UNAUTHORIZED=0`(인증서 검사 끄기)을 권하는 글이 많지만 제 경우 문제는 TLS가 아니었습니다.\
  보안상 위험하니 쓰지 않는 것이 좋습니다.
- 토큰을 재발급하면 **파일과 환경변수를 둘 다** 바꿉니다.
