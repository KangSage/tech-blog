<!-- OMX:AGENTS-INIT:MANAGED -->
<!-- AUTONOMY DIRECTIVE — DO NOT REMOVE -->
YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION.
DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROCEED. DO NOT WAIT FOR CONFIRMATION ON OBVIOUS NEXT STEPS.
IF BLOCKED, TRY AN ALTERNATIVE APPROACH. ONLY ASK WHEN TRULY AMBIGUOUS OR DESTRUCTIVE.
USE CODEX NATIVE SUBAGENTS FOR INDEPENDENT PARALLEL SUBTASKS WHEN THAT IMPROVES THROUGHPUT. THIS IS COMPLEMENTARY TO OMX TEAM MODE.
<!-- END AUTONOMY DIRECTIVE -->

# oh-my-codex - Intelligent Multi-Agent Orchestration

You are running with oh-my-codex (OMX), a coordination layer for Codex CLI.
This AGENTS.md is the top-level operating contract for the workspace.
Role prompts under `prompts/*.md` are narrower execution surfaces. They must follow this file, not override it.
When OMX is installed, load the installed prompt/skill/agent surfaces from `./.codex/prompts`, `./.codex/skills`, and `./.codex/agents` (or the project-local `./.codex/...` equivalents when project scope is active).

<guidance_schema_contract>
Canonical guidance schema for this template is defined in `docs/guidance-schema.md`.
Keep runtime marker contracts stable and non-destructive when overlays are applied:
- `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`
- `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`
</guidance_schema_contract>

<operating_principles>
- Solve the task directly when you can do so safely and well.
- Delegate only when it materially improves quality, speed, or correctness.
- Keep progress short, concrete, and useful.
- Prefer evidence over assumption; verify before claiming completion.
- Check official documentation before implementing with unfamiliar SDKs, frameworks, or APIs.
- Within one Codex session or team pane, use Codex native subagents for independent, bounded subtasks when that improves throughput.
<!-- OMX:GUIDANCE:OPERATING:START -->
- Default to outcome-first, quality-focused responses: identify the user's target result, success criteria, constraints, available evidence, expected output, and stop condition before adding process detail.
- Keep collaboration style short and direct. Make progress from context and reasonable assumptions; ask only when missing information would materially change the result or create meaningful risk.
- Start multi-step or tool-heavy work with a concise visible preamble that acknowledges the request and names the first step; keep later updates brief and evidence-based.
- Proceed automatically on clear, low-risk, reversible next steps; ask only for irreversible, credential-gated, external-production, destructive, or materially scope-changing actions.
- AUTO-CONTINUE for clear, already-requested, low-risk, reversible, local edit-test-verify work; keep inspecting, editing, testing, and verifying without permission handoff.
- ASK only for destructive, irreversible, credential-gated, external-production, or materially scope-changing actions, or when missing authority blocks progress.
- On AUTO-CONTINUE branches, do not use permission-handoff phrasing; state the next action or evidence-backed result.
- Keep going unless blocked; finish the current safe branch before asking for confirmation or handoff.
- Ask only when blocked by missing information, missing authority, or an irreversible/destructive branch.
- Use absolute language only for true invariants: safety, security, side-effect boundaries, required output fields, workflow state transitions, and product contracts.
- Do not ask or instruct humans to perform ordinary non-destructive, reversible actions; execute those safe reversible OMX/runtime operations and ordinary commands yourself.
- Treat OMX runtime manipulation, state transitions, and ordinary command execution as agent responsibilities when they are safe and reversible.
- Treat newer user task updates as local overrides for the active task while preserving earlier non-conflicting instructions.
- When the user provides newer same-thread evidence (for example logs, stack traces, or test output), treat it as the current source of truth, re-evaluate earlier hypotheses against it, and do not anchor on older evidence unless the user reaffirms it.
- Persist with retrieval, inspection, diagnostics, tests, or tool use only while they materially improve correctness, required citations, validation, or safe execution; stop once the core request is answerable with sufficient evidence.
- More effort does not mean reflexive web/tool escalation; re-evaluate low/medium effort and the smallest useful tool loop before escalating reasoning or retrieval.
<!-- OMX:GUIDANCE:OPERATING:END -->
</operating_principles>

## Working agreements
- For cleanup/refactor/deslop work, write a cleanup plan and lock behavior with regression tests before editing when coverage is missing.
- Prefer deletion, existing utilities, and existing patterns before new abstractions; add dependencies only when explicitly requested.
- Keep diffs small, reviewable, and reversible.
- Verify with lint, typecheck, tests, and static analysis after changes; final reports include changed files, simplifications, and remaining risks.


<delegation_rules>
Default posture: work directly.

Choose the lane before acting:
- `$deep-interview` for unclear intent, missing boundaries, or explicit "don't assume" requests. It clarifies and hands off; it does not implement.
- `$ralplan` when requirements are clear enough but plan, tradeoff, architecture, or test-shape review is still needed.
- `$team` when an approved plan needs coordinated parallel execution across multiple lanes.
- `$ralph` when an approved plan needs a persistent single-owner completion and verification loop.
- Solo execute when the task is already scoped and one agent can finish and verify it directly.
- Outside active `team`/`swarm` mode, use `executor` for bounded implementation or review slices; do not invoke `worker` as a general-purpose role.
- Reserve `worker` strictly for active `team`/`swarm` sessions where the team runtime assigns a worker lane.
- `worker` is a team-runtime surface, not a general-purpose child role.


Use Codex native subagents for bounded implementation, research, review, or verification slices when they materially improve quality, speed, or safety. Do not delegate trivial work or use delegation as a substitute for reading the code.
</delegation_rules>

<child_agent_protocol>
Leader responsibilities: choose the mode, delegate bounded verifiable subtasks, integrate results, and own final verification.
Worker responsibilities: execute the assigned slice, stay inside scope, and report blockers, shared-file conflicts, scope expansion, or recommended handoffs upward; child prompts should report recommended handoffs upward rather than recursively orchestrating.
Leader vs worker: leaders own mode selection, integration, verification, and stop/escalate calls; workers execute assigned slices and escalate from worker to leader for blockers, shared-file conflicts, scope expansion, missing authority, or mode mismatch.
Rules: max 6 concurrent child agents; child prompts remain under AGENTS.md authority; prefer inherited model defaults unless a task has a concrete model reason; `worker` is a team-runtime surface, not a general-purpose child role.
</child_agent_protocol>


<invocation_conventions>
- `$name` — invoke a workflow skill.
- `/skills` — browse available skills.
- Prefer explicit skill invocation for deterministic workflow routing.
</invocation_conventions>

<model_routing>
Match role to task shape: `explore` for repo lookup, `researcher` for official docs/reference gathering, `dependency-expert` for SDK/package decisions, `executor` for implementation, `debugger` for root cause, `architect`/`critic` for high-complexity review. Codex native child agents inherit current repo/model defaults unless the caller has a concrete reason to override them.
</model_routing>

<specialist_routing>
Leader/workflow routing contract:
<!-- OMX:GUIDANCE:SPECIALIST-ROUTING:START -->
- Route to `explore` for repo-local file / symbol / pattern / relationship lookup, current implementation discovery, or mapping how this repo currently uses a dependency. `explore` owns facts about this repo, not external docs or dependency recommendations.
- Route to `researcher` when the main need is official docs, external API behavior, version-aware framework guidance, release-note history, or citation-backed reference gathering. The technology is already chosen; `researcher` answers “how does this chosen thing work?” and is not the default dependency-comparison role.
- Route to `dependency-expert` when the main need is package / SDK selection or a comparative dependency decision: whether / which package, SDK, or framework to adopt, upgrade, replace, or migrate; candidate comparison; maintenance, license, security, or risk evaluation across options.
- Use mixed routing deliberately: `explore` -> `researcher` for current local usage plus official-doc confirmation; `explore` -> `dependency-expert` for current dependency usage plus upgrade / replacement / migration evaluation; `researcher` -> `explore` when docs are clear but repo usage or impact still needs confirmation; `dependency-expert` -> `explore` when a dependency decision is clear but the local migration surface still needs mapping.
- Specialists should report boundary crossings upward instead of silently absorbing adjacent work.
- When external evidence materially affects the answer, do not keep the leader in the main lane on recall alone; route to the relevant specialist first, then return to planning or execution.
<!-- OMX:GUIDANCE:SPECIALIST-ROUTING:END -->
</specialist_routing>

<agent_catalog>
Key roles: `explore`, `researcher`, `dependency-expert`, `planner`, `architect`, `debugger`, `executor`, `test-engineer`, `verifier`, and `critic`. Use the installed role catalog for full descriptions.
</agent_catalog>

<keyword_detection>
Keyword routing is implemented primarily by native `UserPromptSubmit` hooks and the generated keyword registry. Treat hook-injected routing context as authoritative for the current turn, then load the named `SKILL.md` or prompt file as instructed.

Fallback behavior when hook context is unavailable:
- Explicit `$name` invocations run left-to-right and override implicit keywords.
- Bare skill names do not activate skills by themselves; skill-name activation requires explicit `$skill` invocation. Natural-language routing phrases may still map to a workflow. Examples: `analyze` / `investigate` → `$analyze` for read-only deep analysis with ranked synthesis, explicit confidence, and concrete file references; `deep interview`, `interview`, `don't assume`, or `ouroboros` → `$deep-interview` for Socratic deep interview requirements clarification.
- Keep the detailed keyword list in `src/hooks/keyword-registry.ts`; do not duplicate it here.

Runtime workflows such as `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `team`/`swarm`, and `ecomode` require OMX CLI runtime support. In Codex App, outside-tmux, or plain Codex sessions without OMX tmux runtime, explain that those workflows are not directly available there and continue with the nearest App-safe surface unless the user explicitly wants to launch OMX CLI from shell first.
- When deep-interview is active in attached-tmux OMX CLI/runtime, ask each interview round via `omx question`; after launching `omx question` in a background terminal, wait for that terminal to finish and read the JSON answer before continuing; preserve the leader pane with `OMX_QUESTION_RETURN_PANE=$TMUX_PANE` when invoking it through Bash/tool paths. Outside tmux or native surfaces that cannot render `omx question` should use the native structured question path when available; otherwise ask exactly one concise plain-text question and wait for the answer.

</keyword_detection>

<skills>
Skills are workflow commands. Always load the relevant installed `SKILL.md` before following a skill-specific process. Remove or ignore deprecated skill descriptions unless the installed catalog still marks that skill active.
</skills>

<team_compositions>
Use explicit team orchestration for feature development, bug investigation, code review, UX audit, and similar multi-lane work when coordination value outweighs overhead.
</team_compositions>

<team_pipeline>
Team mode is the structured multi-agent surface. Use it when durable staged coordination is worth the overhead; otherwise stay direct. Terminal states: `complete`, `failed`, `cancelled`.
</team_pipeline>

<team_model_resolution>
Team/Swarm worker model precedence: explicit `OMX_TEAM_WORKER_LAUNCH_ARGS`, inherited leader `--model`, then low-complexity default from `OMX_DEFAULT_SPARK_MODEL` (legacy alias: `OMX_SPARK_MODEL`). Normalize model flags to one canonical `--model <value>` entry and use `OMX_DEFAULT_FRONTIER_MODEL` / `OMX_DEFAULT_SPARK_MODEL` rather than guessing defaults.
</team_model_resolution>

<!-- OMX:MODELS:START -->
## Model Capability Table

Auto-generated by `omx setup` from the current `config.toml` plus OMX model overrides.

| Role | Model | Reasoning Effort | Use Case |
| --- | --- | --- | --- |
| Frontier (leader) | `gpt-5.6-sol` | high | Primary leader/orchestrator for planning, coordination, and frontier-class reasoning. |
| Spark (explorer/fast) | `gpt-5.6-luna` | low | Fast triage, explore, lightweight synthesis, and low-latency routing. |
| Standard (subagent default) | `gpt-5.6-sol` | high | Default standard-capability model for installable specialists and secondary worker lanes unless a role is explicitly frontier or spark. |
| `explore` | `gpt-5.6-luna` | low | Fast codebase search and file/symbol mapping (fast-lane, fast) |
| `analyst` | `gpt-5.6-sol` | medium | Requirements clarity, acceptance criteria, hidden constraints (frontier-orchestrator, frontier) |
| `planner` | `gpt-5.6-sol` | medium | Task sequencing, execution plans, risk flags (frontier-orchestrator, frontier) |
| `architect` | `gpt-5.6-sol` | xhigh | System design, boundaries, interfaces, long-horizon tradeoffs (frontier-orchestrator, frontier) |
| `debugger` | `gpt-5.6-sol` | high | Root-cause analysis, regression isolation, failure diagnosis (deep-worker, standard) |
| `executor` | `gpt-5.6-sol` | medium | Code implementation, refactoring, feature work (deep-worker, standard) |
| `team-executor` | `gpt-5.6-sol` | medium | Supervised team execution for conservative delivery lanes (deep-worker, frontier) |
| `verifier` | `gpt-5.6-sol` | high | Completion evidence, claim validation, test adequacy (frontier-orchestrator, standard) |
| `code-reviewer` | `gpt-5.6-sol` | high | Comprehensive review across all concerns (frontier-orchestrator, frontier) |
| `dependency-expert` | `gpt-5.6-sol` | high | External SDK/API/package evaluation (frontier-orchestrator, standard) |
| `test-engineer` | `gpt-5.6-sol` | medium | Test strategy, coverage, flaky-test hardening (deep-worker, frontier) |
| `designer` | `gpt-5.6-sol` | high | UX/UI architecture, interaction design (deep-worker, standard) |
| `writer` | `gpt-5.6-sol` | high | Documentation, migration notes, user guidance (fast-lane, standard) |
| `git-master` | `gpt-5.6-sol` | high | Commit strategy, history hygiene, rebasing (deep-worker, standard) |
| `code-simplifier` | `gpt-5.6-sol` | high | Simplifies recently modified code for clarity and consistency without changing behavior (deep-worker, frontier) |
| `researcher` | `gpt-5.6-terra` | high | External documentation and reference research (fast-lane, standard) |
| `prometheus-strict-metis` | `gpt-5.6-sol` | high | Prometheus Strict requirements interviewer and ambiguity mapper (frontier-orchestrator, frontier) |
| `prometheus-strict-momus` | `gpt-5.6-sol` | high | Prometheus Strict adversarial plan critic and risk challenger (frontier-orchestrator, frontier) |
| `prometheus-strict-oracle` | `gpt-5.6-sol` | high | Prometheus Strict implementation readiness verifier and handoff judge (frontier-orchestrator, standard) |
| `critic` | `gpt-5.6-sol` | high | Plan/design critical challenge and review (frontier-orchestrator, frontier) |
| `scholastic` | `gpt-5.6-sol` | high | Ontology-first reasoning reviewer: category mistakes, hidden assumptions, modality separation, scholastic critique, and minimal-repair proposals (frontier-orchestrator, frontier) |
| `vision` | `gpt-5.6-sol` | low | Image/screenshot/diagram analysis (fast-lane, frontier) |
<!-- OMX:MODELS:END -->

<verification>
Verify before claiming completion.
<!-- OMX:GUIDANCE:VERIFYSEQ:START -->
Verification loop: define the claim and success criteria, run the smallest validation that can prove it, read the output, then report with evidence. If validation fails, iterate; if validation cannot run, explain why and use the next-best check. Keep evidence summaries concise but sufficient.

- Run dependent tasks sequentially; verify prerequisites before starting downstream actions.
- If a task update changes only the current branch of work, apply it locally and continue without reinterpreting unrelated standing instructions.
- For coding work, prefer targeted tests for changed behavior, then typecheck/lint/build/smoke checks when applicable; do not claim completion without fresh evidence or an explicit validation gap.
- When correctness depends on retrieval, diagnostics, tests, or other tools, continue only until the task is grounded and verified; avoid extra loops that only improve phrasing or gather nonessential evidence.
<!-- OMX:GUIDANCE:VERIFYSEQ:END -->
</verification>

<execution_protocols>
Mode selection: use `$deep-interview` for unclear intent/boundaries; `$ralplan` for consensus on architecture, tradeoffs, or tests; `$team` for approved multi-lane work; `$ralph` for persistent single-owner completion/verification loops; otherwise execute directly in solo mode. Switch modes only when evidence shows the current lane is mismatched or blocked.

Command routing: use normal Codex repository inspection tools/subagents as the default surface for simple read-only repository lookup tasks; use `omx sparkshell` only for explicit shell-native read-only evidence or bounded verification.
When to use what:
- Use normal Codex repository inspection tools/subagents for repository lookup and implementation context.
- Use `omx sparkshell --tmux-pane` only as an explicit opt-in operator aid for shell-native tmux evidence or bounded verification; it does not replace raw evidence capture.

Supervisor tmux handoff safety:
- Never paste from tmux's implicit/current buffer. Load handoff text into a fresh named buffer with `tmux set-buffer -b <name> -- "$message"` or a temp-file-backed `tmux load-buffer -b <name> <file>`; never use `tmux load-buffer -- <message>`.
- Verify the named buffer with `tmux show-buffer -b <name>` before any paste. A failed load or mismatched buffer is a blocker; do not run `paste-buffer` or submit keys after it.
- Clear the pane composer with `tmux send-keys -t <pane> C-u` immediately before paste, then use bracketed paste (`tmux paste-buffer -t <pane> -b <name> -p -d`) and submit intentionally.
- Recapture the pane after paste/Enter and verify the intended turn was accepted rather than leaving stale draft text visible.

Leader vs worker: leaders choose mode, delegate bounded work, integrate, and own verification; workers execute their slice and escalate blockers, scope expansion, shared-file conflicts, or mode mismatch upward. Escalate from worker to leader for blockers, scope expansion, shared ownership conflicts, or mode mismatch.

Stop / escalate: stop when the task is verified complete, the user says stop/cancel, or no meaningful recovery path remains. Escalate to the user only for irreversible, destructive, materially branching decisions, or missing authority.

Output contract: Default update/final shape: state current mode, action/result, and evidence or blocker/next step. Keep rationale once; do not restate the full plan every turn; expand only for risk, handoff, or explicit request.

Anti-slop workflow:
- Cleanup/refactor/deslop work still follows the same `$deep-interview` -> `$ralplan` -> `$team`/`$ralph` path; use `$ai-slop-cleaner` as a bounded helper inside the chosen execution lane, not as a competing top-level workflow.
- Write a cleanup plan before modifying code; lock existing behavior with regression tests first, then make one smell-focused pass at a time.
- Prefer deletion over addition, and prefer reuse plus boundary repair over new layers.
- No new dependencies without explicit request.
- Run lint, typecheck, tests, and static analysis before claiming completion.
- Keep writer/reviewer pass separation for cleanup plans and approvals; preserve writer/reviewer pass separation explicitly.

Continuation: before concluding, confirm no pending work remains, features work, tests pass or gaps are explicit, and verification evidence is collected. If not, continue.
</execution_protocols>

<cancellation>
Use the `cancel` skill to end active execution modes when work is done and verified, when the user says stop, or when a hard blocker prevents meaningful progress. Do not cancel while recoverable work remains.
</cancellation>

<state_management>
Hooks own normal skill-active and workflow-state persistence under `.omx/state/`. OMX runtime state lives under `.omx/`; do not manually duplicate hook-owned activation state unless recovering from missing or stale state.
</state_management>

## Setup

Execute `omx setup` to install all components. Execute `omx doctor` to verify installation.

<!-- OMX:AGENTS-INIT:MANUAL:START -->
## Local Notes
- Add repo-specific architecture notes, workflow conventions, and verification commands here.
- This block is preserved by `omx agents-init` refreshes.

### Blog workflow
- Verify with `mise exec -- pnpm build` (runs `astro check` + build). The repo is public: commit locally and ask before pushing, merging, or deploying.
- Deploys run on push to `main` (GitHub Pages). `main` is the default branch: branch from `origin/main` and open PRs against it, so merging a PR deploys.
- Post dates: `publishedAt` is written by hand; the updated date is not. `getUpdatedAt` in `src/lib/posts.ts` reads the last git commit that touched the post file (`git log --format=%cI`), shows it as a Korea-time date and hides it while the only commit is the one that added the post or when it falls on the publish date; it also feeds JSON-LD `dateModified`. So any committed edit to the post file (even a typo fix) moves the date, and edits only to components a post uses do not. The deploy checkout needs `fetch-depth: 0`; with a shallow clone no post would show an updated date.
- Posts have a "읽어 주기" button (`src/components/ReadAloud.astro`, browser Web Speech API, no server). It reads `.post-body` by semantic tags: `h2`–`h4` headings, paragraphs, list items, `summary`, `dt` and `dd` (any other element is not read itself, only the elements inside it, so `h5`/`h6` are never read and a list item's own text is skipped when the item also holds a nested list, paragraph or table: in a tight nested list `- A` / `  - B`, "A" is not read; add a blank line or avoid nesting; the elements in `SKIP` in `ReadAloud.astro` (`aside`, `nav`, `button`, `svg`, `figcaption`, `[hidden]`, `[aria-hidden="true"]`, `[data-read-skip]`) are skipped with everything inside them, except inside table header cells, which are read by their full text; elements without a box (`display: none`/`contents`) are skipped with everything inside them only outside the elements read as a whole, so inside a heading, paragraph, list item, `summary`, `dt`, `dd` or table cell CSS-hidden text is still read (the route steps' hidden `<br class="step-break">` relies on this to read the name and note separately) and UI-only text there needs `data-read-skip` or `hidden`; never put readable content in a `SKIP` element or a boxless wrapper, and an inline `svg` is read only when it sits inside a `<figure>` and itself has both `role` and `aria-label`; the `<figure>`'s own `aria-label` is never read), table rows as "header: value", figures by the `aria-label` of the first element inside them that has both `role` and `aria-label` (otherwise the `<img>` `alt`), and nothing else inside a `<figure>` (keep readable content such as the concept map's route panels outside it); a closed `<details>` is skipped entirely (read only when the reader has opened it). The component is rendered at the end of `.post-body` as a dock pinned with `position: sticky; bottom`: a small start button at the bottom right while idle, a full control bar while playing. Since each hides the other, starting moves keyboard focus from the start button to the pause button, and stopping (the stop button, Esc, 다음 in the last section, or reading past the last sentence) moves it from the control bar back to the start button; focus anywhere else is left alone, so focus is never dropped to `<body>`. Esc pressed inside an open `<dialog>` (the figure lightbox) only closes that dialog and does not stop reading. It stays inside the body column (never over the sidebar), ends up after the last paragraph, and lets clicks through outside its buttons. It also gives focus targets in `.post-body` outside the dock and the concept bar (links, buttons, `summary`, form controls, `iframe`, `video`/`audio` with controls, `[contenteditable]`, `[tabindex]`, and `table`/`pre`, which the browser makes focusable when they scroll sideways with nothing focusable inside) a `scroll-margin-bottom` of 64px, or 112px while the control bar shows, so keyboard focus at the bottom of the screen scrolls them clear of the dock; add any new kind of focus target to both rules in `ReadAloud.astro` (the 64px rule and the 112px `html:has(.ra-bar:not([hidden]))` rule) and to the two `--fcm-bar` `scroll-margin-top` rules after the map in `FoundryConceptMap.astro` (which also cover direct children of `.post-body`, such as tables); if it can appear inside the map or the concept bar, also add it to `.fcm :is(a[href], button)` and to the bar's three `#post-aside` `scroll-margin-bottom` rules (64px, 112px and the expanded bar's 48px). General rule: on a scroll container that holds sticky controls (`html`, the expanded card bar, the expanded concept list), keep `scroll-padding` within the gap between the container edge and where those controls rest (today 4px), since a wider band makes tabbing between those controls jump the content; give any larger clearance to the focus targets as `scroll-margin` instead. Below 1180px the `#post-aside` slot has `margin-bottom: 124px` (the concept map offsets it with `#post-aside + .fcm { margin-top: -100px }`), so the sticky bar stops before the dock at the end of the body instead of overlapping it; any other component that fills the slot must offset that margin the same way. The map also marks the bar `data-stuck` only while it is stuck at the top: it is drawn above the body (z-index 10) only then or while keyboard focus is inside it, so on its way up from the bottom of the screen it passes under the dock like any other content, and its links and buttons get the same `scroll-margin-bottom` as body focus targets (64px, or 112px while the control bar shows). Inside the expanded bar, which scrolls itself and sits above the dock while keyboard focus is inside it (a mouse click or tap does not raise it), they get only 48px to clear its pinned button row, and the row itself gets none (a margin on the row's buttons, or a `scroll-padding-bottom` on the expanded bar larger than the row's 4px bottom padding, makes tabbing along the row scroll the card; keep the bar's 4px `scroll-padding-block`). Whenever a bar control changes the bar's height (펼치기/접기, 자세히/간단히, tapping the collapsed card, chips, analogy tabs; 이전/다음 are hidden on narrow screens), `keepPressedInView` keeps the pressed control visible the same way with or without scroll anchoring (browsers with it, Chrome, Firefox and Safari 27 or later, scroll the page during the layout that the code's own measuring triggers, so that scroll is already there when it measures: measured in Chrome, and per source in Firefox (Gecko's `PresShell::ProcessReflowCommands`) and Safari (WebKit's post-layout tasks); Safari 26 and earlier have no scroll anchoring; WebKit defers that adjustment when layout runs from style resolution for container queries or anchor positioning, so recheck these clicks in Safari if the page starts using either): for analogy tabs and chips it undoes the scroll anchoring made when that scroll also moved the bar, so the pressed control stays in place; for the other controls, when the bar ends up pushed above the screen at the end of the body, it scrolls the bar's top back to the top of the screen; and while the bar is not stuck it scrolls the pressed button above whichever dock element is visible (start button or control bar). A plain `scrollIntoView` would leave the pinned row under the dock for mouse users. Test these with scroll anchoring both on and off (`html, body { overflow-anchor: none }`). `BaseLayout.astro` gives every page `html { scroll-padding-block: 4px }` so focus rings at the screen edges are not clipped. Components inside a post must mark UI-only text (legends, gesture hints) with `data-read-skip`, and keep real content in semantic tags so it is read in order.
- Post page layout (`src/pages/[lang]/blog/[...slug].astro`, `src/components/PostToc.astro`). Breakpoints: below 1180px one column; at 1180px body 760px plus either a left TOC (220px) or the right panel `#post-aside` (360px); at 1440px left TOC, body and right panel together. The TOC (h2·h3) is a sticky left column when there is room, otherwise a collapsed "목차" `<details>` under the post header; it marks the current section and is a `nav`, so read-aloud skips it.
  - `#post-aside` is an empty slot that a component in the post fills by script (today only the concept map's card panel). Below 1180px it is a sticky bar at the top of the screen: the concept map collapses it to one line and moves the slot to just above the map, so it does not sit between the TOC and the intro; it opens when a concept is picked from the map, the list or a `#concept-<id>` link, or when the bar is tapped, and moves back to the side column on wide screens. TOC jumps reserve the bar's height only for headings that come after it (`--toc-offset`). Keyboard focus does the same for links and buttons in and after the map: the map sets `--fcm-bar` on `.post-body` and uses it as their `scroll-margin-top` (the read-aloud dock is excluded).
    - Collapsed, the bar is the open card itself cut down to one row: the same card box (padding, left color band, rounded corners), layer badge and title (ellipsized when long), with "펼치기 ▾" beside it at the open bar's button height. The summary, the chip row and the details appear only when open, so the bar stays about 65px tall.
    - Whenever the bar opens or the concept changes, the chip row scrolls sideways (only its `scrollLeft`, never the page) to center the current chip; while collapsed the row has no width, so it is re-centered after opening.
    - Open-bar buttons each say what they do, so no two read the same: "지도에서 보기" (no arrow, since the map can be above or beside the card) scrolls to the map, and below 1180px it first folds the bar and leaves room for it so the bar never covers the top of the map or, up to 591px, the sideways-scroll hint above it (a `#concept-<id>` address on load also scrolls below the bar); the map keeps the docked bar's height in `--fcm-bar` (updated when the bar folds, expands, switches card or analogy tab, or the width changes) so keyboard focus on a map box or route step scrolls it below the bar, and a dimmed box shows at full opacity while it has keyboard focus; "자세히 ▾" / "간단히 ▴" opens and closes only the card details; "접기 ▴" folds the whole bar back to one row. With details open the bar scrolls inside 65vh and its button row stays pinned to the bottom. Below 1180px a click that opens a card keeps what was clicked in view: the page first follows however far the clicked item actually moved (the bar's height change, with or without scroll anchoring) so it stays in place; then `keepBelowBar` scrolls vertically only when the clicked item is under the grown bar or runs past the bottom of the screen. The item is the clicked box (the permission frame uses its name tag, or the clicked point when its line is clicked), the route buttons and question, or a clicked `#concept-` link in or after the map (not one inside the bar; a link before the map gets no adjustment, see the concept-link check below); clicks never move the drawing sideways. `aria-expanded` on each button follows what that button opens.
  - Tables: cells use `word-break: keep-all` so Korean wraps by word; a table wider than the body scrolls inside itself, and a small "좌우로 밀어서" hint (marked `data-read-skip`) is shown above it only while it overflows. Links and code in cells may break anywhere so long strings do not widen a table.
  - Code blocks: the post page script wraps every `.post-body pre` in `.code-block` and adds a copy icon button at the top right (shown on hover or keyboard focus with a mouse, always shown on touch screens; labels from `src/lib/ui.ts`, marked `data-read-skip`). On success only the icon turns into a check and "복사됨" is announced to screen readers; a visible "복사 실패" toast appears only on failure. It copies the code text, falls back to select-and-copy when the Clipboard API is missing or refused (a hidden textarea takes focus for the selection, then focus goes back to the copy button), and does not scroll with wide code. Every code block gets it, so do not add copy buttons by hand. Code colors come from Shiki's `github-dark-default` theme (`markdown.shikiConfig` in `astro.config.mjs`, which MDX inherits): Astro's default `github-dark` gives comments only 3.05:1 against its background, while every token color of `github-dark-default` reaches at least 6.15:1 against `#0d1117`. Shiki writes the background into each `<pre>` as an inline style, which overrides the site's `--code-bg`, so check a new theme's own token colors against its own background (4.5:1 or better).
  - Comments: `src/components/Comments.astro` adds a giscus section (GitHub Discussions of this repo, settings in `src/lib/comments.ts`, allowed origins in `giscus.json`) after `.post-grid`, outside `.post-body` so read-aloud never reads it; with the left TOC it gets the same 248px indent as the post header. It renders nothing while `categoryId` is empty. `client.js` is injected only when the section comes within 600px of the viewport, and theme changes (header toggle or system) are sent to the iframe with `postMessage` `setConfig`, so the iframe is not reloaded. Threads map by `pathname` with strict matching, so each language has its own thread.
  - The blog home has a sticky left finder (search, categories, tags) from 1180px.
  - A script that hides or removes the element that has keyboard focus must move focus to a visible control (read-aloud start/pause, the code-copy fallback, "지도에서 보기" focusing the map, the home finder's "필터 지우기" focusing the "전체" chip, the concept map refocusing the same bar control, or "펼치기/접기" / the current chip when that control is hidden at the new width, after a width change across 1180px, then, for keyboard (`:focus-visible`) focus, scrolling it into view with `scrollIntoView({ block: "nearest", inline: "nearest" })` inside whichever of the panel's own scroll areas holds it (the chip row or the expanded bar below 1180px; the open list or, with the list open, the whole card from 1180px; moving the panel resets them to the start) and putting back any page scroll that call made, and the TOC moving focus between the left column and the inline "목차" when a width change swaps them and, for keyboard focus, scrolling the link into view inside the column, page scroll put back). Moving an element that holds focus to another place in the DOM drops focus the same way, and an element hidden by CSS at a new width loses focus too. Chrome has been measured blurring it both before and after the `resize` and media-query `change` events (the HTML spec's rendering steps fire those events first and blur afterwards), so the map's `place()` refocuses after it moves the panel, and the map and the TOC also watch `focusout` with no `relatedTarget` on an element that is no longer rendered, and refocus on the next task while focus is still on `<body>` (a click elsewhere or Tab away is left alone). They try their candidates in order and stop where `document.activeElement` actually changed, since a link inside a closed `<details>` still has client rects in Chrome but cannot take focus; in Chrome, moving the panel while focus is inside it also makes scroll anchoring scroll the page by about the panel's height (measured in Chrome 152 when widening from 1000px to 1366px; not when focus is elsewhere or with `overflow-anchor: none`; anchoring prefers a focused element only when it is editable, so the focused button is not the anchor), so the map restores `scrollY` after moving the panel while focus is inside it. Otherwise focus falls back to `<body>` and the focus ring and the screen reader's place are lost; in Chrome the next Tab still continues from where the element was (from the header only when it sat at the end of `body`, like the copy fallback's textarea), so check `document.activeElement` rather than where Tab goes.
  - Sticky columns that scroll inside (the TOC column, `#post-aside` from 1180px, the home finder) keep `padding: 4px` offset by `margin: -4px` (with `top: 12px`) and `scroll-padding-block: 4px`, so focus rings at their edges are not clipped while the content position and visible height stay the same; do the same for any new inner-scrolling area.
  - After any layout change check 375–390px (no page overflow, bar position, TOC jumps above and below the map, table hint) and 1366px (the concept-map sidebar check below), in light and dark. If new scoped CSS (especially `:has()`/`:global()`) seems missing in `pnpm dev`, restart the dev server before debugging; it can serve stale page CSS.
- Colors come from theme tokens only. Site tokens (`--bg`, `--surface`, `--text`, `--muted`, `--border`, `--accent`, `--accent-soft`, `--warning`, `--code-*`, `--notice-*`) are defined once as `light`/`dark` objects in `src/layouts/BaseLayout.astro`; dark applies when the system is dark and the reader has not chosen light, or when the header toggle chose dark (`:root[data-theme]`, remembered in `localStorage`). A component with its own palette (e.g. the concept map's layer colors) must define dark values for both cases: `@media (prefers-color-scheme: dark) { :global(:root:not([data-theme="light"])) … }` and `:global(:root[data-theme="dark"]) …`. Check new UI in both modes and keep text contrast at WCAG AA (4.5:1) or better.
- Post content must only state what the linked official docs (or source code) say. When asked to "check/review", report findings without editing.

### Article writing rules (Korean posts) — must follow for every article
- Write in 합니다체. Put each sentence on its own line: end prose lines with `\` (hard break), use `<br />` inside table cells; component/card text is split on sentence ends automatically.
- Commas: do not put a comma after a connective ending (-고, -며, -지만, -면, -므로, -어서/-아서, -거나, -라, -듯, -뒤, -때, -뿐, -와/-과, -도, and -로 when it is not a parallel list). Keep commas only for noun enumerations ("수집과 가공, 업무 모델링, 권한 관리"), parallel pairs ("Contour는 Dataset, Quiver는 Object"), and numbers ("1,000개").
- State only facts the linked official docs (or source code) support, and cite them. Analogies are fine but must not contradict the docs.
- Use one name per concept everywhere (card title, index, map, body text). Escape `~` as `\~` in MDX, since GFM turns `~a~` into strikethrough.
- Tags: pair each English tag with a Korean tag written without spaces (e.g. `ontology`, `온톨로지`).
- After writing, grep the prose for `[가-힣] ?(고|며|지만|면|므로|서|거나|듯|뒤|때|뿐|와|과|도|달리|처럼|아니라), ` to catch leftover connective commas (the optional space catches forms like "할 뿐," and "과 달리,"), then review each hit by hand.
- Bold that ends in a quote or a parenthesis right before Korean text (`**"…"**는`, `**…(…)**로`) does not render in MDX; write `<strong>…</strong>` there and check the rendered page for leftover `**`.

### Hands-on (실습) posts — format for posts readers can follow in their own environment
- Lead with the conclusion: the body starts with a `## TL;DR` section right after the collapsed notes (what was done, what it gained, the pitfalls, the costs, when to use it). Keep every TL;DR line as scoped as the body ("이 환경에서") and do not repeat the TL;DR in the closing section.
- Right under the "이 글을 쓰게 된 이유" `<details class="post-note">`, add a second collapsed `<details class="post-note">` with an example prompt for a coding AI (e.g. `<summary>따라 해 보려는 분들을 위한 코딩 AI 예제 프롬프트</summary>`). Being a closed `<details>`, read-aloud skips it.
- Address the coding AI in general terms, not one product: for Foundry posts, the AI in the terminal of a VS Code workspace opened on the repo (that environment had Codex and opencode installed; cite the official doc or announcement for anything stated about it).
- Before the prompt, say in a few sentences where to run it, that the prompt is an example built from the post and was not tested as is (unless it was), to replace the `<...>` placeholders, and to review the AI's plan and changes. Also tell readers to confirm outbound network access and security approval before using a coding AI in a work environment (Foundry workspaces may show `Active (restricted outputs)`).
- Put the prompt in a ```` ```text ```` block wrapped in `<div class="prompt-block">` (blank lines around the fence) so it wraps instead of scrolling sideways. Like every code block, it gets a copy button automatically.
- Prompt structure: what the repo is and the goal; read the repo and show a plan before changing code; list the steps the reader must do by hand in Foundry UIs; no commit, tag or push without the reader's confirmation; mark uncertainty instead of guessing and name the official doc pages. Then `[현재 환경]`, `[목표]`, `[진행 순서와 주의할 점]` (the post's pitfalls turned into instructions or questions).
- Use placeholders, never real names, IDs, hosts or paths from the author's environment, and keep every statement in the prompt consistent with the post body.
- Screenshots: commit only masked copies under `src/assets/blog/<slug>/` and insert them with `src/components/PostFigure.astro`. It shows a body-width webp with a `srcset` (480/760/1140/1520px, never above the original) so pages stay light, and a click opens the full-size webp in an in-page lightbox instead of leaving the post: close button, Esc, outside click and the browser back button close it (opening pushes one history entry, closing removes it), and clicking the image toggles fit and actual size. Middle or Cmd/Ctrl click still opens the file in a new tab. `sharp` is a direct dependency for this.

### Concept map posts (`src/components/foundry/`) — checklist for adding or renaming a concept
Recurring mistakes here were names drifting between the card, the index chip, and the map box, and map text/labels overlapping after layout changes.
- Box names, list chips and route step names show `short` from `concepts.ts` (boxes use `mapLines` when set), while card headings and the `aria-label` of map boxes, chips and the permission frame come from `title` (keep the two consistent, see the next item), so never type a concept name into a box: add a `mapNodes` entry in `FoundryConceptMap.astro` (`x`/`y`, `w`/`h`, optional `rx`, text class `cls`, subtitle `sub`, and `edges` for a box that meets its partner without a drawn line, like Interfaces and Object security policy inside Ontology). Entries are drawn in order, so a box inside another box must come after it or it is covered and cannot be clicked. Names are still plain text in the SVG `aria-label` (the figure description read-aloud and screen readers use), the Materialization and media ref labels and `aria-label`s, the map legend, other cards, route notes and the posts: when renaming, grep `src/components/foundry/` and `src/content/blog/` for the old name and fix every hit. The build fails if a concept has no map node or `mapLines` does not join to `short`.
- Card `title` is the concept name, or "A · B" only when the card really covers two separate features. Keep it consistent with `short`. When it does, `doc` is a list with one `{ label, href }` per feature so each gets its own "공식 문서" button at the same level (the build checks that the labels join to the title); `related` is only for supporting pages.
- Run `mise exec -- pnpm dev`, open the post, and check the browser console: `[concept-map] 배치 점검 통과` must appear. It warns when text inside a concept box is closer than 4px to that box's edge, when a free label (`text.lab` outside a node) overlaps or comes within 4px sideways of a concept box or crosses a vertical or horizontal line, and about unknown ids and undrawn route edges. It does not check boxes against each other or anything inside the Materialization and media ref links (the Materialized Dataset box and their labels), so check those by eye after moving boxes. Box text positions are derived from box height, so change `h` rather than hand-placing text.
- The dev check only measures geometry; still look at the rendered map once, since it cannot judge odd-looking arrows or wording.
- Then check by hand, since these are not automated:
  - at 1366×900 and 1366×657 (a 768px-tall laptop screen), with the sidebar stuck, cycle through every card with the index both collapsed and expanded ("전체 목록"), and in both analogy tabs: the sidebar must not overflow (collapsed: only the card body scrolls; expanded: only the whole card scrolls, never the card body as well; on short screens the expanded list also scrolls inside itself so the card keeps at least 180px, with the current chip scrolled into view and the "접기 ▴" toggle pinned at its top). Click only concept chips while measuring, since the index toggle and analogy tabs change the state mid-loop;
  - selecting each new concept highlights only its real partners (concepts in `CROSS_CUTTING`, today Project · Role · Marking, Marketplace and Data Lineage · Workflow Lineage, dim nothing when selected; their pairs still highlight from the other end, and a new concept that spans every layer belongs there). Every line/label carries `data-edges="a:b c:d"` pairs (a shared line lists every pair it carries); relations with no drawn line go in `EXTRA_EDGES` and are shown with a dashed box outline (explained in the map legend), not as solid highlights. Only add pairs the official docs support; the dev check warns about unknown ids in pairs (both drawn `data-edges` and `EXTRA_EDGES`);
  - at 375px, no horizontal page overflow; the card bar starts just above the map and stays one line until a concept is picked. Up to 591px (where the body gets narrower than the drawing) the drawing keeps a fixed 560px width inside `.map-scroll`, so only the drawing scrolls sideways (the legend stays put) under a "그림을 좌우로 밀어서 볼 수 있습니다." hint (`data-read-skip`); keyboard focus on a box scrolls `.map-scroll` just enough to show the whole box (a box wider than the area, Ontology at 375px, is centered), mouse clicks never do. In route mode the drawing (`svg.map.route`) also picks up the route panel's `.route` frame (padding and border), so it is sized with `border-box` (at most 734px wide, and 594px at 591px and below) to fit the same widths. With the bar stuck, also Tab through a sideways-scrolled drawing and click boxes, the frame's line and name tag, route buttons and step names;
  - new links in the post body use `#concept-<id>` and switch the card without jumping to the map; below 1180px the page moves only to keep the clicked link in place and clear of the bar (it first follows however far the link moved, then `keepBelowBar`; see `#post-aside` above). Only links in or after the map get that adjustment; a link before the map does not (the bar sits below it there), so prefer putting concept links after the map.
- Routes ("관점으로 보기") live in `routes.ts`: each route answers one focus question, steps point at concept ids (names come from `short`), and `edges` copy drawn `data-edges` pairs in the same direction (Funnel → Ontology indexing and the Ontology → Funnel Materialization output are different lines) with both ends in the steps. Every step note must be backed by the route's `sources`. The build checks ids, edge ends and sources; the dev check warns when a route edge is not a drawn line. After moving boxes or lines, click through every route at 1366px and 375px, since a step badge sits on each box's top-left corner. `#route-<id>` opens the map with that route on (for linking from series posts). Picking a route (button or `#route-…` change) moves the card to the route's first step, unless the current card was picked by the reader (a concept click or `#concept-…` address, not a card a route moved to) and is one of its steps; on page load a `#concept-<id>` address keeps its card. The chosen route's question, step names, notes and sources are article content and must stay readable by read-aloud: only the route buttons and the hint carry `data-read-skip`, step names are `#concept-<id>` links (read-aloud skips `button`), and no wrapper around them may use `display: contents` (read-aloud skips elements without a box).
- Route series posts (one post per route): embed the same map with `<FoundryConceptMap route="<id>" />` so it opens with that route on (a `#route-…` address still wins), and link back to the hub with `#route-<id>`. Once a series post is published, set that route's `article` in `routes.ts` to its Korean slug: the hub's route panel then shows "이 노선을 자세히 다룬 글" (hidden on the post itself). The build stops if `article` is not a published Korean post, so add it in the same change that publishes the post, not while it is a draft.
- New or changed facts need an official Palantir doc link in the card's `doc`/`related`.
<!-- OMX:AGENTS-INIT:MANUAL:END -->

<!-- OMX:AGENTS:START -->
<!-- AUTONOMY DIRECTIVE — DO NOT REMOVE -->
YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION.
DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROCEED. DO NOT WAIT FOR CONFIRMATION ON OBVIOUS NEXT STEPS.
IF BLOCKED, TRY AN ALTERNATIVE APPROACH. ONLY ASK WHEN TRULY AMBIGUOUS OR DESTRUCTIVE.
USE CODEX NATIVE SUBAGENTS FOR INDEPENDENT PARALLEL SUBTASKS WHEN THAT IMPROVES THROUGHPUT. THIS IS COMPLEMENTARY TO OMX TEAM MODE.
<!-- END AUTONOMY DIRECTIVE -->
<!-- omx:generated:agents-md -->

# oh-my-codex - Intelligent Multi-Agent Orchestration

You are running with oh-my-codex (OMX), a coordination layer for Codex CLI.
This AGENTS.md is the top-level operating contract for the workspace.
Role prompts under `prompts/*.md` are narrower execution surfaces. They must follow this file, not override it.
When OMX is installed, load the installed prompt/skill/agent surfaces from `./.codex/prompts`, `./.codex/skills`, and `./.codex/agents` (or the project-local `./.codex/...` equivalents when project scope is active).

<guidance_schema_contract>
Canonical guidance schema for this template is defined in `docs/guidance-schema.md`.
Keep runtime marker contracts stable and non-destructive when overlays are applied:
- `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`
- `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`
</guidance_schema_contract>

<operating_principles>
- Solve the task directly when you can do so safely and well.
- Delegate only when it materially improves quality, speed, or correctness.
- Keep progress short, concrete, and useful.
- Prefer evidence over assumption; verify before claiming completion.
- Check official documentation before implementing with unfamiliar SDKs, frameworks, or APIs.
- Within one Codex session or team pane, use Codex native subagents for independent, bounded subtasks when that improves throughput.
<!-- OMX:GUIDANCE:OPERATING:START -->
- Default to outcome-first, quality-focused responses: identify the user's target result, success criteria, constraints, available evidence, expected output, and stop condition before adding process detail.
- Keep collaboration style short and direct. Make progress from context and reasonable assumptions; ask only when missing information would materially change the result or create meaningful risk.
- Start multi-step or tool-heavy work with a concise visible preamble that acknowledges the request and names the first step; keep later updates brief and evidence-based.
- Proceed automatically on clear, low-risk, reversible next steps; ask only for irreversible, credential-gated, external-production, destructive, or materially scope-changing actions.
- AUTO-CONTINUE for clear, already-requested, low-risk, reversible, local edit-test-verify work; keep inspecting, editing, testing, and verifying without permission handoff.
- ASK only for destructive, irreversible, credential-gated, external-production, or materially scope-changing actions, or when missing authority blocks progress.
- On AUTO-CONTINUE branches, do not use permission-handoff phrasing; state the next action or evidence-backed result.
- Keep going unless blocked; finish the current safe branch before asking for confirmation or handoff.
- Ask only when blocked by missing information, missing authority, or an irreversible/destructive branch.
- Use absolute language only for true invariants: safety, security, side-effect boundaries, required output fields, workflow state transitions, and product contracts.
- Do not ask or instruct humans to perform ordinary non-destructive, reversible actions; execute those safe reversible OMX/runtime operations and ordinary commands yourself.
- Treat OMX runtime manipulation, state transitions, and ordinary command execution as agent responsibilities when they are safe and reversible.
- Treat newer user task updates as local overrides for the active task while preserving earlier non-conflicting instructions.
- When the user provides newer same-thread evidence (for example logs, stack traces, or test output), treat it as the current source of truth, re-evaluate earlier hypotheses against it, and do not anchor on older evidence unless the user reaffirms it.
- Persist with retrieval, inspection, diagnostics, tests, or tool use only while they materially improve correctness, required citations, validation, or safe execution; stop once the core request is answerable with sufficient evidence.
- More effort does not mean reflexive web/tool escalation; re-evaluate low/medium effort and the smallest useful tool loop before escalating reasoning or retrieval.
<!-- OMX:GUIDANCE:OPERATING:END -->
</operating_principles>

## Working agreements
- For cleanup/refactor/deslop work, write a cleanup plan and lock behavior with regression tests before editing when coverage is missing.
- Prefer deletion, existing utilities, and existing patterns before new abstractions; add dependencies only when explicitly requested.
- Keep diffs small, reviewable, and reversible.
- Verify with lint, typecheck, tests, and static analysis after changes; final reports include changed files, simplifications, and remaining risks.


<delegation_rules>
Default posture: work directly.

Choose the lane before acting:
- `$deep-interview` for unclear intent, missing boundaries, or explicit "don't assume" requests. It clarifies and hands off; it does not implement.
- `$ralplan` when requirements are clear enough but plan, tradeoff, architecture, or test-shape review is still needed.
- `$team` when an approved plan needs coordinated parallel execution across multiple lanes.
- `$ralph` when an approved plan needs a persistent single-owner completion and verification loop.
- Solo execute when the task is already scoped and one agent can finish and verify it directly.
- Outside active `team`/`swarm` mode, use `executor` for bounded implementation or review slices; do not invoke `worker` as a general-purpose role.
- Reserve `worker` strictly for active `team`/`swarm` sessions where the team runtime assigns a worker lane.
- `worker` is a team-runtime surface, not a general-purpose child role.


Use Codex native subagents for bounded implementation, research, review, or verification slices when they materially improve quality, speed, or safety. Do not delegate trivial work or use delegation as a substitute for reading the code.
</delegation_rules>

<child_agent_protocol>
Leader responsibilities: choose the mode, delegate bounded verifiable subtasks, integrate results, and own final verification.
Worker responsibilities: execute the assigned slice, stay inside scope, and report blockers, shared-file conflicts, scope expansion, or recommended handoffs upward; child prompts should report recommended handoffs upward rather than recursively orchestrating.
Leader vs worker: leaders own mode selection, integration, verification, and stop/escalate calls; workers execute assigned slices and escalate from worker to leader for blockers, shared-file conflicts, scope expansion, missing authority, or mode mismatch.
Rules: max 6 concurrent child agents; child prompts remain under AGENTS.md authority; prefer inherited model defaults unless a task has a concrete model reason; `worker` is a team-runtime surface, not a general-purpose child role.
</child_agent_protocol>


<invocation_conventions>
- `$name` — invoke a workflow skill.
- `/skills` — browse available skills.
- Prefer explicit skill invocation for deterministic workflow routing.
</invocation_conventions>

<model_routing>
Match role to task shape: `explore` for repo lookup, `researcher` for official docs/reference gathering, `dependency-expert` for SDK/package decisions, `executor` for implementation, `debugger` for root cause, `architect`/`critic` for high-complexity review. Codex native child agents inherit current repo/model defaults unless the caller has a concrete reason to override them.
</model_routing>

<specialist_routing>
Leader/workflow routing contract:
<!-- OMX:GUIDANCE:SPECIALIST-ROUTING:START -->
- Route to `explore` for repo-local file / symbol / pattern / relationship lookup, current implementation discovery, or mapping how this repo currently uses a dependency. `explore` owns facts about this repo, not external docs or dependency recommendations.
- Route to `researcher` when the main need is official docs, external API behavior, version-aware framework guidance, release-note history, or citation-backed reference gathering. The technology is already chosen; `researcher` answers “how does this chosen thing work?” and is not the default dependency-comparison role.
- Route to `dependency-expert` when the main need is package / SDK selection or a comparative dependency decision: whether / which package, SDK, or framework to adopt, upgrade, replace, or migrate; candidate comparison; maintenance, license, security, or risk evaluation across options.
- Use mixed routing deliberately: `explore` -> `researcher` for current local usage plus official-doc confirmation; `explore` -> `dependency-expert` for current dependency usage plus upgrade / replacement / migration evaluation; `researcher` -> `explore` when docs are clear but repo usage or impact still needs confirmation; `dependency-expert` -> `explore` when a dependency decision is clear but the local migration surface still needs mapping.
- Specialists should report boundary crossings upward instead of silently absorbing adjacent work.
- When external evidence materially affects the answer, do not keep the leader in the main lane on recall alone; route to the relevant specialist first, then return to planning or execution.
<!-- OMX:GUIDANCE:SPECIALIST-ROUTING:END -->
</specialist_routing>

<agent_catalog>
Key roles: `explore`, `researcher`, `dependency-expert`, `planner`, `architect`, `debugger`, `executor`, `test-engineer`, `verifier`, and `critic`. Use the installed role catalog for full descriptions.
</agent_catalog>

<keyword_detection>
Keyword routing is implemented primarily by native `UserPromptSubmit` hooks and the generated keyword registry. Treat hook-injected routing context as authoritative for the current turn, then load the named `SKILL.md` or prompt file as instructed.

Fallback behavior when hook context is unavailable:
- Explicit `$name` invocations run left-to-right and override implicit keywords.
- Bare skill names do not activate skills by themselves; skill-name activation requires explicit `$skill` invocation. Natural-language routing phrases may still map to a workflow. Examples: `analyze` / `investigate` → `$analyze` for read-only deep analysis with ranked synthesis, explicit confidence, and concrete file references; `deep interview`, `interview`, `don't assume`, or `ouroboros` → `$deep-interview` for Socratic deep interview requirements clarification.
- Keep the detailed keyword list in `src/hooks/keyword-registry.ts`; do not duplicate it here.

Runtime workflows such as `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `team`/`swarm`, and `ecomode` require OMX CLI runtime support. In Codex App, outside-tmux, or plain Codex sessions without OMX tmux runtime, explain that those workflows are not directly available there and continue with the nearest App-safe surface unless the user explicitly wants to launch OMX CLI from shell first.
- When deep-interview is active in attached-tmux OMX CLI/runtime, ask each interview round via `omx question`; after launching `omx question` in a background terminal, wait for that terminal to finish and read the JSON answer before continuing; preserve the leader pane with `OMX_QUESTION_RETURN_PANE=$TMUX_PANE` when invoking it through Bash/tool paths. Outside tmux or native surfaces that cannot render `omx question` should use the native structured question path when available; otherwise ask exactly one concise plain-text question and wait for the answer.

</keyword_detection>

<skills>
Skills are workflow commands. Always load the relevant installed `SKILL.md` before following a skill-specific process. Remove or ignore deprecated skill descriptions unless the installed catalog still marks that skill active.
</skills>

<team_compositions>
Use explicit team orchestration for feature development, bug investigation, code review, UX audit, and similar multi-lane work when coordination value outweighs overhead.
</team_compositions>

<team_pipeline>
Team mode is the structured multi-agent surface. Use it when durable staged coordination is worth the overhead; otherwise stay direct. Terminal states: `complete`, `failed`, `cancelled`.
</team_pipeline>

<team_model_resolution>
Team/Swarm worker model precedence: explicit `OMX_TEAM_WORKER_LAUNCH_ARGS`, inherited leader `--model`, then low-complexity default from `OMX_DEFAULT_SPARK_MODEL` (legacy alias: `OMX_SPARK_MODEL`). Normalize model flags to one canonical `--model <value>` entry and use `OMX_DEFAULT_FRONTIER_MODEL` / `OMX_DEFAULT_SPARK_MODEL` rather than guessing defaults.
</team_model_resolution>

<!-- OMX:MODELS:START -->
## Model Capability Table

Auto-generated by `omx setup` from the current `config.toml` plus OMX model overrides.

| Role | Model | Reasoning Effort | Use Case |
| --- | --- | --- | --- |
| Frontier (leader) | `gpt-5.5` | high | Primary leader/orchestrator for planning, coordination, and frontier-class reasoning. |
| Spark (explorer/fast) | `gpt-5.3-codex-spark` | low | Fast triage, explore, lightweight synthesis, and low-latency routing. |
| Standard (subagent default) | `gpt-5.5` | high | Default standard-capability model for installable specialists and secondary worker lanes unless a role is explicitly frontier or spark. |
| `explore` | `gpt-5.3-codex-spark` | low | Fast codebase search and file/symbol mapping (fast-lane, fast) |
| `analyst` | `gpt-5.5` | medium | Requirements clarity, acceptance criteria, hidden constraints (frontier-orchestrator, frontier) |
| `planner` | `gpt-5.5` | medium | Task sequencing, execution plans, risk flags (frontier-orchestrator, frontier) |
| `architect` | `gpt-5.5` | xhigh | System design, boundaries, interfaces, long-horizon tradeoffs (frontier-orchestrator, frontier) |
| `debugger` | `gpt-5.5` | high | Root-cause analysis, regression isolation, failure diagnosis (deep-worker, standard) |
| `executor` | `gpt-5.5` | medium | Code implementation, refactoring, feature work (deep-worker, standard) |
| `team-executor` | `gpt-5.5` | medium | Supervised team execution for conservative delivery lanes (deep-worker, frontier) |
| `verifier` | `gpt-5.5` | high | Completion evidence, claim validation, test adequacy (frontier-orchestrator, standard) |
| `code-reviewer` | `gpt-5.5` | high | Comprehensive review across all concerns (frontier-orchestrator, frontier) |
| `dependency-expert` | `gpt-5.5` | high | External SDK/API/package evaluation (frontier-orchestrator, standard) |
| `test-engineer` | `gpt-5.5` | medium | Test strategy, coverage, flaky-test hardening (deep-worker, frontier) |
| `designer` | `gpt-5.5` | high | UX/UI architecture, interaction design (deep-worker, standard) |
| `writer` | `gpt-5.5` | high | Documentation, migration notes, user guidance (fast-lane, standard) |
| `git-master` | `gpt-5.5` | high | Commit strategy, history hygiene, rebasing (deep-worker, standard) |
| `code-simplifier` | `gpt-5.5` | high | Simplifies recently modified code for clarity and consistency without changing behavior (deep-worker, frontier) |
| `researcher` | `gpt-5.4-mini` | high | External documentation and reference research (fast-lane, standard) |
| `prometheus-strict-metis` | `gpt-5.5` | high | Prometheus Strict requirements interviewer and ambiguity mapper (frontier-orchestrator, frontier) |
| `prometheus-strict-momus` | `gpt-5.5` | high | Prometheus Strict adversarial plan critic and risk challenger (frontier-orchestrator, frontier) |
| `prometheus-strict-oracle` | `gpt-5.5` | high | Prometheus Strict implementation readiness verifier and handoff judge (frontier-orchestrator, standard) |
| `critic` | `gpt-5.5` | high | Plan/design critical challenge and review (frontier-orchestrator, frontier) |
| `scholastic` | `gpt-5.5` | high | Ontology-first reasoning reviewer: category mistakes, hidden assumptions, modality separation, scholastic critique, and minimal-repair proposals (frontier-orchestrator, frontier) |
| `vision` | `gpt-5.5` | low | Image/screenshot/diagram analysis (fast-lane, frontier) |
<!-- OMX:MODELS:END -->

<verification>
Verify before claiming completion.
<!-- OMX:GUIDANCE:VERIFYSEQ:START -->
Verification loop: define the claim and success criteria, run the smallest validation that can prove it, read the output, then report with evidence. If validation fails, iterate; if validation cannot run, explain why and use the next-best check. Keep evidence summaries concise but sufficient.

- Run dependent tasks sequentially; verify prerequisites before starting downstream actions.
- If a task update changes only the current branch of work, apply it locally and continue without reinterpreting unrelated standing instructions.
- For coding work, prefer targeted tests for changed behavior, then typecheck/lint/build/smoke checks when applicable; do not claim completion without fresh evidence or an explicit validation gap.
- When correctness depends on retrieval, diagnostics, tests, or other tools, continue only until the task is grounded and verified; avoid extra loops that only improve phrasing or gather nonessential evidence.
<!-- OMX:GUIDANCE:VERIFYSEQ:END -->
</verification>

<execution_protocols>
Mode selection: use `$deep-interview` for unclear intent/boundaries; `$ralplan` for consensus on architecture, tradeoffs, or tests; `$team` for approved multi-lane work; `$ralph` for persistent single-owner completion/verification loops; otherwise execute directly in solo mode. Switch modes only when evidence shows the current lane is mismatched or blocked.

Command routing: use normal Codex repository inspection tools/subagents as the default surface for simple read-only repository lookup tasks; use `omx sparkshell` only for explicit shell-native read-only evidence or bounded verification.
When to use what:
- Use normal Codex repository inspection tools/subagents for repository lookup and implementation context.
- Use `omx sparkshell --tmux-pane` only as an explicit opt-in operator aid for shell-native tmux evidence or bounded verification; it does not replace raw evidence capture.

Supervisor tmux handoff safety:
- Never paste from tmux's implicit/current buffer. Load handoff text into a fresh named buffer with `tmux set-buffer -b <name> -- "$message"` or a temp-file-backed `tmux load-buffer -b <name> <file>`; never use `tmux load-buffer -- <message>`.
- Verify the named buffer with `tmux show-buffer -b <name>` before any paste. A failed load or mismatched buffer is a blocker; do not run `paste-buffer` or submit keys after it.
- Clear the pane composer with `tmux send-keys -t <pane> C-u` immediately before paste, then use bracketed paste (`tmux paste-buffer -t <pane> -b <name> -p -d`) and submit intentionally.
- Recapture the pane after paste/Enter and verify the intended turn was accepted rather than leaving stale draft text visible.

Leader vs worker: leaders choose mode, delegate bounded work, integrate, and own verification; workers execute their slice and escalate blockers, scope expansion, shared-file conflicts, or mode mismatch upward. Escalate from worker to leader for blockers, scope expansion, shared ownership conflicts, or mode mismatch.

Stop / escalate: stop when the task is verified complete, the user says stop/cancel, or no meaningful recovery path remains. Escalate to the user only for irreversible, destructive, materially branching decisions, or missing authority.

Output contract: Default update/final shape: state current mode, action/result, and evidence or blocker/next step. Keep rationale once; do not restate the full plan every turn; expand only for risk, handoff, or explicit request.

Anti-slop workflow:
- Cleanup/refactor/deslop work still follows the same `$deep-interview` -> `$ralplan` -> `$team`/`$ralph` path; use `$ai-slop-cleaner` as a bounded helper inside the chosen execution lane, not as a competing top-level workflow.
- Write a cleanup plan before modifying code; lock existing behavior with regression tests first, then make one smell-focused pass at a time.
- Prefer deletion over addition, and prefer reuse plus boundary repair over new layers.
- No new dependencies without explicit request.
- Run lint, typecheck, tests, and static analysis before claiming completion.
- Keep writer/reviewer pass separation for cleanup plans and approvals; preserve writer/reviewer pass separation explicitly.

Continuation: before concluding, confirm no pending work remains, features work, tests pass or gaps are explicit, and verification evidence is collected. If not, continue.
</execution_protocols>

<cancellation>
Use the `cancel` skill to end active execution modes when work is done and verified, when the user says stop, or when a hard blocker prevents meaningful progress. Do not cancel while recoverable work remains.
</cancellation>

<state_management>
Hooks own normal skill-active and workflow-state persistence under `.omx/state/`. OMX runtime state lives under `.omx/`; do not manually duplicate hook-owned activation state unless recovering from missing or stale state.
</state_management>

## Setup

Execute `omx setup` to install all components. Execute `omx doctor` to verify installation.
<!-- OMX:AGENTS:END -->
