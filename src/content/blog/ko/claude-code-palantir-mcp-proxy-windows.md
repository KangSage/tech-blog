---
title: "프록시 환경 Windows에서 Claude Code + Palantir MCP 연결하기 (삽질 기록)"
description: "HTTP 프록시를 거쳐야 하는 Windows 환경에서 Claude Code에 Palantir MCP를 연결하며 겪은 증상과 원인, 해결 방법을 순서대로 정리합니다."
publishedAt: "2026-10-12"
updatedAt: "2026-10-22"
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
   켜는 옵션도 있지만 `NO_PROXY`를 따르므로 이 글에서는 [undici](https://github.com/nodejs/undici)로 프록시를 강제했습니다.
2. `NO_PROXY`에 Foundry 도메인이 걸리면 Node가 프록시를 건너뛰어서 **타임아웃**이 납니다.\
   → MCP 서버에만 프록시를 강제합니다.
3. Foundry 저장소를 clone한 **폴더 안에서** Claude Code를 실행합니다.
4. 토큰을 재발급하면 **환경변수도 같이** 바꿉니다. (npm 인증에 `FOUNDRY_TOKEN`을 쓰는 환경이면 `npm E401`)
5. 다시 끊기면 **폴더, 토큰, local 설정** 순서로 봅니다. (5장)

---

## 1. 프록시 환경변수 확인

```powershell
$env:HTTPS_PROXY
$env:HTTP_PROXY
$env:NO_PROXY
$env:NODE_EXTRA_CA_CERTS   # 프록시가 TLS를 검사하면 필요
```

> 프록시 주소에 계정과 비밀번호가 들어 있을 수 있습니다.\
> 이 출력은 캡처해서 공유하지 않습니다.

값이 비어 있으면 사용자 환경변수로 저장합니다.\
스크립트 실행이 막힌 PC에서도 동작합니다.

```powershell
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", "http://<프록시>:<포트>", "User")
```

> 참고: 제 환경에서는 Windows PowerShell 5.1의 `irm`과 `winget`도 `HTTPS_PROXY`를 따르지 않았습니다.\
> 이 둘은 [`-Proxy`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-restmethod?view=powershell-5.1#-proxy) / [`--proxy`](https://learn.microsoft.com/en-us/windows/package-manager/winget/install#options) 옵션으로 직접 지정해야 합니다.\
> `winget`의 `--proxy`는 관리자 정책으로 허용해야 쓸 수 있습니다([winget 정책](https://github.com/microsoft/winget-cli/blob/master/doc/admx/en-US/DesktopAppInstaller.adml)).

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

Node의 [`fetch`는 undici로 만들어져 있고](https://nodejs.org/api/globals.html#custom-dispatcher) 따로 설치한 undici의 `setGlobalDispatcher()`가 Node의 `fetch`에도 적용됩니다.\
설치하는 undici는 Node에 들어 있는 undici와 메이저 버전을 맞춥니다.\
최신 undici는 최신 Node를 요구할 수 있습니다.

```powershell
node -p process.versions.undici   # 예: 7.x.x 이면 아래에 undici@7
npm install -g undici@<메이저 버전>
$root = (npm root -g) -replace '\\','/'
$f = "$env:USERPROFILE\palantir-proxy.js"
@"
const u = require('$root/undici');
const p = process.env.HTTPS_PROXY || process.env.https_proxy;
if (p) u.setGlobalDispatcher(new u.ProxyAgent(p));
"@ | Set-Content $f -Encoding utf8
```

> 함정: `NODE_OPTIONS`에 `$HOME`이나 `%USERPROFILE%`을 글자 그대로 넣으면 안 됩니다.\
> Node는 이걸 실제 경로로 바꾸지 않습니다.\
> 반드시 `C:/Users/...` 같은 실제 경로를 넣습니다.\
> 경로에 공백이 있으면 [`NODE_OPTIONS`](https://nodejs.org/api/cli.html#node_optionsoptions)에서 큰따옴표로 감싸야 합니다.\
> `HTTPS_PROXY`가 비어 있으면 위 파일은 프록시를 걸지 않습니다.

## 3. Foundry 저장소 폴더에서 실행하기

개인 토큰으로 어디서나 실행하면 토큰 관련 오류가 났습니다.\
Foundry 저장소를 clone한 폴더 안에서 실행하니 인증이 됐습니다.

그런데 그 폴더에는 이미 `.mcp.json`이 있습니다.\
[설치 문서](https://www.palantir.com/docs/foundry/palantir-mcp/installation)대로 `--scope project`로 같은 이름을 추가하면 `already exists in .mcp.json` 오류가 납니다.\
공유 파일은 건드리지 말고 **같은 이름으로 `--scope local`(내 PC 전용) 설정을 추가해서 덮어씁니다**.\
아래는 `.mcp.json`의 설정을 복사하고 프록시만 더하는 스크립트입니다.

```powershell
# Foundry 저장소 폴더에서 실행
$s = (Get-Content .mcp.json -Raw | ConvertFrom-Json).mcpServers.'palantir-mcp'
if (-not $s) { throw '.mcp.json에 palantir-mcp 항목이 없습니다' }
$p = (Resolve-Path "$env:USERPROFILE\palantir-proxy.js").Path -replace '\\','/'
$e = @(); foreach ($k in $s.env.PSObject.Properties) {
  $v = if ($k.Name -eq 'FOUNDRY_TOKEN') { '${FOUNDRY_TOKEN}' } else { $k.Value }
  $e += '-e'; $e += "$($k.Name)=$v"
}
claude mcp add palantir-mcp --scope local @e -e "NODE_OPTIONS=--require=$p" -- cmd /c $s.command @($s.args)
```

- `.mcp.json`의 `env`에 토큰이 글자 그대로 들어 있는 경우가 있습니다.\
  그대로 복사하면 토큰이 내 설정 파일에도 글자로 남습니다.\
  그래서 스크립트는 `FOUNDRY_TOKEN` 값을 `${FOUNDRY_TOKEN}`으로 바꿔서 넣습니다.\
  Claude Code는 실행할 때 이 자리를 같은 이름의 환경변수 값으로 바꿉니다([Environment variable expansion](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcp-json)).
- `${FOUNDRY_TOKEN}`은 작은따옴표 안에 씁니다.\
  큰따옴표 안에서는 PowerShell이 `$`로 시작하는 부분을 먼저 값으로 바꿉니다.
- 제 환경에서는 `npx`를 `cmd /c`로 감싸야 실행됐습니다.
- 첫 실행 때는 npx 다운로드 때문에 느릴 수 있습니다.\
  시간 초과가 나면 [`MCP_TIMEOUT`](https://code.claude.com/docs/en/mcp)을 늘립니다.

```powershell
[Environment]::SetEnvironmentVariable("MCP_TIMEOUT", "60000", "User")
```

> 토큰이 들어간 `.mcp.json`을 커밋한 적이 있으면 토큰을 재발급합니다.

### `Conflicting scopes` 경고

같은 이름의 서버가 `.mcp.json`과 local 두 곳에 서로 다른 내용으로 있어서 `claude mcp list`와 `/mcp`에 경고가 나옵니다([Configuration warnings](https://code.claude.com/docs/en/mcp#configuration-warnings)).\
[Scope hierarchy and precedence](https://code.claude.com/docs/en/mcp#scope-hierarchy-and-precedence)에 따르면 같은 이름이 여러 범위에 있을 때 local, project(`.mcp.json`), user 순으로 우선합니다.\
항목을 섞지 않고 우선하는 쪽의 설정 전체를 씁니다.\
그래서 프록시를 넣은 local 설정이 적용됩니다.\
경고는 둘 중 하나를 `claude mcp remove`로 지우라고 안내합니다.\
하지만 project 쪽을 지우면 저장소에 함께 쓰는 `.mcp.json`이 바뀝니다([Project scope](https://code.claude.com/docs/en/mcp#project-scope)).\
그래서 저는 경고를 그대로 두고 local 설정을 씁니다.

## 4. `npm error code E401`

며칠 쉬고 와서 토큰을 재발급했는데 다시 안 됐습니다.\
서버를 직접 실행해 보니 `npm error code E401`이 나왔습니다.\
MCP 문제가 아니라 **npx가 패키지를 받는 단계**에서 npm 레지스트리 로그인이 실패한 것입니다.

제 환경에서는 npm 레지스트리 인증에 환경변수 `FOUNDRY_TOKEN`을 쓰고 있었습니다.\
그런데 그 환경변수에는 **옛 토큰**이 그대로 남아 있었습니다.\
환경변수를 새 토큰으로 바꾸니 해결됐습니다.

```powershell
$t = (Get-Content "<토큰 파일>" -Raw).Trim()   # .Trim(): 끝 줄바꿈 제거. 이게 남으면 인증 실패
$t.Length   # 0이면 토큰 파일 경로를 다시 확인
if ($t.Length -gt 0) { [Environment]::SetEnvironmentVariable("FOUNDRY_TOKEN", $t, "User") }
Remove-Variable t
```

> Windows PowerShell 5.1(.NET Framework)에서는 빈 값을 저장하면 변수가 지워집니다([`SetEnvironmentVariable`](https://learn.microsoft.com/en-us/dotnet/api/system.environment.setenvironmentvariable)).\
> 그래서 저장하기 전에 길이부터 확인합니다.

> `npm config get registry`가 "protected" 오류를 내면 `npm config list`를 씁니다.\
> 비밀값은 `(protected)`로 가려져서 나옵니다.\
> 레지스트리 주소에 비밀값이 들어 있다는 뜻이니 `npm config` 출력과 `.npmrc`는 공유하지 않습니다.

## 5. 다시 연결이 끊겼을 때 점검 순서

설정을 마치고 며칠 뒤 `Connection closed`와 `Failed to connect`가 다시 났습니다.\
원인이 세 가지 겹쳐 있었고 아래 순서로 보니 금방 좁혀졌습니다.

1. **Foundry 저장소 폴더에서 실행했는지 봅니다.**\
   local 설정은 프로젝트 경로별로 저장되므로 다른 폴더에서는 보이지 않습니다([Local scope](https://code.claude.com/docs/en/mcp#local-scope)).\
   저장소 밖에서 `claude mcp list`를 하면 서버가 목록에 아예 없습니다.
2. **지금 터미널이 토큰을 읽는지 봅니다.**

   ```powershell
   $env:FOUNDRY_TOKEN.Length   # 지금 창이 읽은 값의 길이
   ([Environment]::GetEnvironmentVariable("FOUNDRY_TOKEN","User")).Length   # 저장된 값의 길이
   ```

   변수가 비어 있으면 Claude Code는 `${FOUNDRY_TOKEN}` 글자를 그대로 넘기므로 인증이 안 됩니다([Unset variables](https://code.claude.com/docs/en/mcp#unset-variables-without-a-default)).\
   사용자 환경변수는 저장한 뒤에 탐색기에서 새로 실행한 프로그램이 물려받습니다([`SetEnvironmentVariable`](https://learn.microsoft.com/en-us/dotnet/api/system.environment.setenvironmentvariable)).\
   저장된 값은 있는데 지금 창이 0이면 터미널 프로그램을 완전히 껐다 켜거나 지금 창에 불러옵니다.

   ```powershell
   $env:FOUNDRY_TOKEN = [Environment]::GetEnvironmentVariable("FOUNDRY_TOKEN","User")
   ```

3. **local 설정이 적용됐는지 봅니다.**\
   `claude mcp get palantir-mcp`에서 Scope가 Project로 나오면 프록시가 없는 `.mcp.json` 설정으로 실행된 것입니다.\
   3장 스크립트를 다시 실행해서 local 설정을 만들고 Scope가 Local인지와 `NODE_OPTIONS`가 들어 있는지 확인합니다.\
   이 출력에는 설정값이 그대로 나올 수 있으니 캡처해서 공유하지 않습니다.
4. **그래도 안 되면 서버를 직접 실행합니다.**

   ```powershell
   $env:NODE_OPTIONS = "--require=C:/Users/<사용자>/palantir-proxy.js"
   npx -y palantir-mcp --foundry-api-url https://<foundry 호스트>
   # 확인이 끝나면 Ctrl+C로 끄고 아래를 실행
   Remove-Item Env:NODE_OPTIONS
   ```

   `--foundry-api-url`에는 경로 없이 `https://` 뒤에 호스트 이름만 씁니다([설치 문서](https://www.palantir.com/docs/foundry/palantir-mcp/installation)).\
   제 경우 `DEP0190` 경고만 나오고 그대로 멈춰 있었습니다.\
   서버가 뜬 상태라서 문제는 Claude 쪽 설정이었고 위 3단계로 해결됐습니다.

---

## 증상별 정리

| 증상 | 원인 | 해결 |
|---|---|---|
| `irm`, `winget` 설치 실패 | `HTTPS_PROXY`를 따르지 않음(제 환경) | `-Proxy`, `--proxy` 옵션으로 직접 지정 |
| `UND_ERR_CONNECT_TIMEOUT` | `NO_PROXY` 때문에 프록시를 건너뜀 | MCP 전용 `ProxyAgent` 파일 |
| `Cannot find module` (프록시 파일) | `NODE_OPTIONS`에 `$HOME`이 글자 그대로 들어감 | 실제 경로로 저장 |
| 토큰 오류 | 저장소 폴더 밖에서 실행함 | clone한 폴더에서 실행 |
| `already exists in .mcp.json` | 저장소에 같은 이름 설정이 이미 있음 | `--scope local`로 덮어쓰기 |
| `Conflicting scopes` 경고 | 같은 이름이 `.mcp.json`과 local에 있음 | local 설정이 우선 적용됨 |
| `.mcp.json`에 토큰이 글자로 있음 | 설정에 값이 직접 들어감 | 3장 스크립트가 `${FOUNDRY_TOKEN}`으로 바꿔 넣음 |
| 첫 실행 시간 초과 | npx 다운로드가 느림 | `MCP_TIMEOUT` 늘리기 |
| `npm error code E401` | npm 인증용 환경변수에 옛 토큰이 남아 있음 | 환경변수 업데이트 |
| `claude mcp list`에 서버가 안 보임 | 저장소 폴더 밖에서 실행함 | 저장소 폴더에서 실행 |
| `Connection closed`, 토큰 길이 0 | 지금 터미널이 사용자 환경변수를 못 읽음 | 터미널 프로그램 재시작 또는 현재 창에 불러오기 |
| Scope가 Project이고 `Connection closed` | 프록시를 넣은 local 설정이 없음 | 3장 스크립트 다시 실행 |
| `DEP0190` 경고 | Node의 사용 중단 경고 | 연결 문제와는 무관 |

## 교훈

- **추측하지 말고 에러 원문부터 봅니다.**\
  MCP 서버를 Claude 밖에서 직접 실행하면 진짜 에러가 보입니다.
- `NODE_TLS_REJECT_UNAUTHORIZED=0`(인증서 검사 끄기)을 권하는 글이 많지만 제 경우 문제는 TLS가 아니었습니다.\
  보안상 위험하니 쓰지 않는 것이 좋습니다.\
  프록시가 TLS를 검사하는 환경이면 회사 인증서를 [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile)로 추가합니다.
- 토큰을 재발급하면 **파일과 환경변수를 둘 다** 바꿉니다.
- 환경변수를 바꾼 뒤에는 **터미널 프로그램을 완전히 껐다 켠 뒤** 확인합니다.
- 토큰이나 설정값이 보이는 출력은 **캡처해서 공유하지 않습니다**.
