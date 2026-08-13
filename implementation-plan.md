# Implementation Plan: Ship Faster Demo

**Status:** Phase 2 in progress — Git connected; native lint/typecheck still not visible on deployment detail  
**Version:** 2.1  
**Date:** 13 August 2026  
**Owner:** JJ Lecocq  
**Builder:** Engineer (this document is the spec)  
**Source script:** [demo-1-ship-faster.md](./demo-1-ship-faster.md) v1.1  
**Audience of the live demo:** VPs Engineering, CTOs, Dev leads  

Do not invent extra product surfaces. Do not restore items in **Out of scope**. If a step is ambiguous, stop and ask — the original v1 script was the ambiguous one; this file replaces it.

**Phase 0 confirmed 13 August 2026 (JJ):** dedicated Pro demo team; Agent Runs enabled; Rolling Releases slot reserved for `ship-faster-web`. Engineer starts at Phase 1. If Agent Runs is missing after the first Eve deploy, stop — do not substitute Workflows.

---

## 1. What we are building

A **demo environment**, not a product. Two Vercel projects in one GitHub repo, plus scripts that make the dashboards look real.

Live demo length is ~12 minutes. The environment must make these four moments reliable:

| Act | On-screen proof | Live vs prepared |
|---|---|---|
| 1 | Slide only (JJ) | N/A |
| 2 | `git push` → preview URL on the GitHub PR; then a second push whose **build logs** show `packages/ui:build` as a cache hit | Live push. Pre-warm cache. Timed. |
| 3 | AI Gateway overview with traffic; Logs detail with a **Fallback Path** | Dashboard live. Failover request **pre-staged** with a saved ID. Coding-agent setup **already done**. |
| 4 | Eve chat trigger + **Observability → Agent Runs** of a completed run (sandbox + model call). Then Rolling Releases **config** and Instant Rollback | Trigger live if it starts in <15s; walk a **prepared run** for the trace. No live feature-write. |

---

## 2. Frozen decisions

Do not reopen these during the build.

| Decision | Choice | Why |
|---|---|---|
| Template | **Custom Turborepo**, not next-forge, not Robin | next-forge is too slow to build. Robin is not a usable starter. |
| Repo | One public GitHub repo, pnpm workspaces, Turbo 2.x | Matches the talking point. |
| Apps / packages | 5 workspaces: `apps/web`, `apps/docs`, `apps/admin`, `packages/ui`, `packages/utils` | Enough graph for a cache-hit screenshot, thin enough to build fast. |
| Vercel projects | **Two**: `ship-faster-web` and `ship-faster-agent` | Web needs Next.js build logs. Eve needs Agent Runs. Do not merge them. |
| Web project model | Root Directory `apps/web`. Build command `turbo run build` (Vercel infers `--filter=web`). Ignored Build Step `npx turbo-ignore --fallback=HEAD^1` | Standard Vercel + Turbo. |
| Turbo money shot | Change `packages/utils` → `utils` miss, `web` miss, **`ui` hit**. Docs/admin will **not** appear in this project's log. Talking point must match. | One project cannot print five packages. |
| Eve v1 | Chat UI + sandbox write/run test + Gateway model. **No live git push / preview from the agent.** | A feature write + preview will not finish inside Act 4. |
| Act 4 trace surface | **Observability → Agent Runs**, not Workflows | Enabled on the demo team (JJ, 13 Aug 2026). If the tab is missing after first Eve deploy, stop. |
| Quality gate | **Native Deployment Checks** (lint + typecheck on `apps/web`). Not Conformance. | Conformance is Enterprise + private npm + CI CLI. It does not show on the deployment page. |
| Rolling Releases | Configure 10% / 50% / 100%, **manual** advancement. Show the settings page. Do not run a live split. Closer is **Instant Rollback**. | No production traffic. Abort is not automatic. |
| Coding agents CLI | Pre-run `vercel ai-gateway coding-agents setup --agent claude-code`. Do not run it live. | Interactive, mutates `~/.claude/settings.json`, can log Claude Code out. |
| Preview access | **Deployment Protection off** for Preview on both demo projects | The presenter must click the URL in the room. |
| Named customers | No Expedia. No “evaluating this right now.” | Not cleared for this script. |
| Stats in-room | Use only Messaging Framework + Vercel docs numbers. Drop 85%/13% unless JJ supplies a dated Vercel source. | LinkedIn is not a live-demo source. |

---

## 3. Entitlements

Confirmed **13 August 2026**. Do not use a customer team or a Hobby account.

| Need | Status | Notes |
|---|---|---|
| Dedicated Pro demo team | **Done** | Not Hobby, not a customer team |
| Agent Runs | **Done** | Enabled on the team. After first Eve deploy: if the tab is missing, **stop**. Do not fake it with Workflows. |
| Rolling Releases | **Done (reserved)** | Pro one-project slot → `ship-faster-web` only. Do not enable it on `ship-faster-agent`. |
| AI Gateway | Engineer verifies in Phase 3 | Anthropic + OpenAI must both serve traffic |
| CLI | Engineer on day 1 | `vercel login` to this team; `npm i -g vercel@latest` |
| GitHub repo | Engineer in Phase 1 | Public repo, name `ship-faster` unless the org requires a prefix |

---

## 4. Target architecture

```
ship-faster/                          GitHub repo
├── apps/
│   ├── web/                          Next.js App Router  ← Vercel project ship-faster-web
│   ├── docs/                         Next.js, one page
│   ├── admin/                        Next.js, one page
│   └── agent/                        eve app             ← Vercel project ship-faster-agent
├── packages/
│   ├── ui/                           Button + Hero (no dependency on utils)
│   └── utils/                        format.ts (leaf)
├── scripts/
│   ├── seed-deployments.sh
│   ├── gateway-traffic.ts
│   └── gateway-failover.ts
├── demo/
│   ├── FAILOVER_REQUEST_ID.txt       filled after Phase 3
│   ├── PREPARED_AGENT_RUN.txt        filled after Phase 4
│   └── TIMING.md                     filled after Phase 7
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

### Package graph (this is the Act 2 screenshot)

```
packages/utils          (leaf)
packages/ui             (leaf — does NOT import utils)
apps/web                → ui, utils
apps/docs               → ui only
apps/admin              → ui only
apps/agent              independent (own Vercel project)
```

`apps/web` is the only app the Turbo demo cares about. After a utils change, the `ship-faster-web` build log **must** show:

- `web#build` — MISS (or cache miss)
- `@repo/utils#build` (or the package name you chose) — MISS
- `@repo/ui#build` — **HIT**

If `ui` is a miss, the graph or `turbo.json` outputs are wrong. Fix before continuing.

---

## 5. Non-negotiable UX for the live app (`apps/web`)

Keep it small. Builds must be fast.

- Home page with a **hero** whose copy lives in `apps/web/lib/copy.ts` as `heroHeadline` (this is the Act 2 Step 1 edit).
- The hero component is imported from `packages/ui`.
- Home page also calls `formatDate` from `packages/utils` so the utils import is real, not a fake dependency.
- `/settings` exists (placeholder page). Do not build dark mode. It is not in v1.
- `package.json` scripts: `build`, `lint`, `typecheck`. Lint and typecheck must succeed on `main`.
- Visual: dark, minimal, obviously “a real Next app,” not a create-next-app default. One screen is enough.

`apps/docs` and `apps/admin`: single page each, import a `Button` from `packages/ui`, no utils import.

---

## 6. Phases

Estimate: **4 engineer days** after entitlements, plus **24h of Gateway traffic** before the first live dry-run.

### Phase 0 — Access — **complete (13 August 2026)**

- [x] Dedicated Pro demo team exists (not Hobby, not a customer team)
- [x] Agent Runs enabled on that team
- [x] Rolling Releases one-project slot reserved for `ship-faster-web`
- [x] Engineer: `npm i -g vercel@latest` and `vercel login` on this team
- [x] Engineer: can create projects on the team (active team `se-apac-playground-vtest314`; `vercel whoami` prints user `jjlecocq-8187`)
- [x] Engineer: create public GitHub repo `ship-faster` (https://github.com/jjlecocq-v/ship-faster)

**Exit to Phase 1:** `vercel whoami` shows the demo team. Then start the monorepo.

### Phase 1 — Monorepo + web project (day 1, morning)

Scaffold with pnpm + turbo. Do not use `create-turbo` if it pulls extra apps you then have to delete — a clean workspace is fine.

**Root `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Root `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {},
    "typecheck": {}
  }
}
```

**Package names:** `@ship/web`, `@ship/docs`, `@ship/admin`, `@ship/ui`, `@ship/utils`, `@ship/agent`.

**`packages/utils/src/format.ts`**

```ts
export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
```

Export a `package.json` `"main"` / `"types"` that `apps/web` can import. Keep the utils build as `tsc` to `dist/` so Turbo has a real `dist/**` output.

**`packages/ui`:** `Hero` and `Button` as React components. No import from `@ship/utils`.

**Vercel project `ship-faster-web`**

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Build Command | leave default (`turbo run build`) |
| Install | default (pnpm) |
| Ignored Build Step | `npx turbo-ignore --fallback=HEAD^1` |
| Node | 24 |
| Preview Deployment Protection | Off |
| Production Deployment Protection | On is fine |
| Skew Protection | Off for this demo project (keeps Turbo hashes stable) |
| Native Deployment Checks | Enable lint + typecheck, Preview + Production |

Connect GitHub. Push `main`. First production deploy must go green.

**Local cache (optional but useful):** from repo root, `npx turbo login` and `npx turbo link` against the same team.

**Exit checks (all required):**

- [x] `pnpm turbo run build --filter=@ship/web` succeeds locally
- [x] Production deploy of `main` is Ready (`https://ship-faster-web.vercel.app`, Git production `dpl_EQBd7b9zUesQXXS12WdMRZgR5ZBc`)
- [x] Preview URL for a throwaway branch opens **without** auth (`preview/protection-check`, HTTP 200)
- [ ] Deployment detail shows lint + typecheck checks (not Conformance) — project checks exist; no runs on Git deploys yet

### Phase 2 — Seed history + Act 2 branches (day 1, afternoon)

**`scripts/seed-deployments.sh`**

- Run from `main`
- Make 10 tiny commits that each change a comment in `apps/web/lib/copy.ts` (not utils, not ui)
- Push after each commit **or** push once with 10 commits — either is fine
- Do not wait interactively for every build; let Vercel queue them
- Goal: **≥10 deployments** on the project Deployments page

**Act 2 Step 1 branch**

- Branch: `feature/hero-update`
- Open a PR into `main` **before** the demo, with a first commit that does not yet change the headline (empty/docs commit is fine) so the PR and the Vercel bot comment already exist
- Locally, leave this change **unstaged** for the presenter:

```ts
// apps/web/lib/copy.ts
export const heroHeadline = "Ship the work, not the pipeline.";
```

During the demo they change it to something obviously different, e.g. `"Preview every agent commit."`

**Act 2 Step 2** is a second commit on the same PR: append a comment to `packages/utils/src/format.ts`. Presenter can type it live; engineer should also have the exact command in the runbook.

**Warm the cache**

After seed deploys are Ready, run one more production or preview build that compiles `ui` and `utils` with **no** source change to those packages. Then verify a subsequent utils-only change:

1. Change only `packages/utils/src/format.ts`
2. Push
3. Open Build Logs
4. Confirm `@ship/ui#build` (or `ui#build`) is a **cache hit**
5. Screenshot that log into `demo/turbo-cache-hit.png`

If ui is not a hit: check that ui does not import utils, that `outputs` match, and that the ui task actually ran on the previous deployment (a package that never ran cannot hit).

**Exit checks:**

- [x] ≥10 deployments visible
- [x] PR `feature/hero-update` open, Vercel comment present (https://github.com/jjlecocq-v/ship-faster/pull/2)
- [x] `demo/turbo-cache-hit.png` exists and clearly shows a HIT on ui
- [x] Time `git push` → Ready → PR comment URL clickable. Write the number of seconds in `demo/TIMING.md`. If it is >90s, the presenter talks over the build; do not pretend it is 60s.

### Phase 3 — AI Gateway (day 2, morning + 24h soak)

On the **team** AI Gateway (not only the project):

- [ ] Anthropic and OpenAI both serve at least one request
- [ ] No provider-specific keys in the repo. Use `AI_GATEWAY_API_KEY` in `.env.local` (gitignored) or `vercel env pull`

**`scripts/gateway-traffic.ts`**

- `pnpm add -D ai`
- Use `generateText` from `ai` with `provider/model` strings (Gateway default). Do **not** import `@ai-sdk/anthropic` or `@ai-sdk/openai`.
- Send **≥80** requests, mixed across at least:

  - `anthropic/claude-sonnet-4.6` (or the current Sonnet slug on the Gateway model list)
  - `openai/gpt-5.5`
  - one third model (e.g. `google/gemini-3.1-flash` if enabled; otherwise a second Anthropic slug)

- Unique prompts so logs are not identical. Include a prefix `SHIPFASTER-TRAFFIC`.
- Concurrency 3–5. Sleep enough to avoid rate limits.
- Run once, then schedule a cron or a second run **the next morning** so Overview charts are not a flat spike. If the demo is <24h after the first run, still ship — charts may be thin; Logs will still work.

**`scripts/gateway-failover.ts`**

Force a visible Fallback Path. Do not wait for an organic 500.

```ts
import { generateText } from "ai";

const result = await generateText({
  model: "openai/gpt-5.5",
  prompt: `SHIPFASTER-FAILOVER ${new Date().toISOString()} Reply with pong.`,
  providerOptions: {
    gateway: {
      models: ["this-org/this-model-does-not-exist", "openai/gpt-5.5"],
    },
  },
});

console.log(JSON.stringify(result.providerMetadata, null, 2));
```

If that shape 404s the whole request instead of falling through, switch to a real model with `order` that tries a provider you do not have, then OpenAI — whatever produces a Log row whose detail panel shows **Fallback Path** with a failed attempt then a success.

Save:

- Request id (from `providerMetadata` or the Logs URL) → `demo/FAILOVER_REQUEST_ID.txt`
- Screenshot of the Fallback Path panel → `demo/failover.png`

**Coding agent (JJ’s demo laptop, not the repo)**

```bash
npm i -g vercel@latest
vercel ai-gateway coding-agents setup --agent claude-code
```

Show `~/.claude/settings.json` (or the path the CLI reports) with the Gateway base URL. Screenshot → `demo/claude-gateway-config.png`.

**Exit checks:**

- [ ] Gateway Overview shows both providers
- [ ] Logs show provider, model, tokens, TTFT, status
- [ ] Opening the saved request id shows Fallback Path without searching
- [ ] Claude Code on the demo machine is already pointed at Gateway

### Phase 4 — Eve agent (day 2 afternoon – day 3)

Do **not** clone `samrosenbaum/robin`.

From `apps/agent`:

```bash
npx eve@latest init .
```

Then read `node_modules/eve/docs/README.md` for the installed version and follow that layout. Do not improvise a different framework.

**v1 agent contract**

| Input | Output |
|---|---|
| Chat message: `Write src/hello.ts that exports hello() returning "hello world", write src/hello.test.ts, run the test in the sandbox, report pass/fail.` | Sandbox files exist. Test ran. Reply states pass/fail. |

**Required:**

- Model via Gateway, e.g. `anthropic/claude-sonnet-4.6` in `agent/agent.ts` (use the slug from installed eve docs)
- Sandbox enabled (Vercel Sandbox on deploy; default backend is fine)
- Chat UI (`useEveAgent` or the scaffold’s client) deployed on `ship-faster-agent`
- Agent Runs visible under the **agent** project: Observability → Agent Runs

**Explicitly out of v1:** GitHub write, opening PRs, `vercel deploy` from the agent, dark mode, settings-page edits.

**Vercel project `ship-faster-agent`**

| Setting | Value |
|---|---|
| Root Directory | `apps/agent` |
| Preview Protection | Off |
| Production Protection | Off for the demo URL the presenter will use (password is fine if JJ has it cached; SSO is not) |

**Prepared run (this is what Act 4 walks)**

1. Send the hello-task once on production
2. Wait until Agent Runs shows the session with: user input, at least one model call, sandbox/tool calls, test result
3. Copy the Agent Runs URL → `demo/PREPARED_AGENT_RUN.txt`
4. Screenshot the run → `demo/agent-run.png`

If Agent Runs is missing: stop and get the tab enabled. Do not substitute Workflows.

**Live trigger:** same hello-task is allowed if it **starts** quickly. The presenter still opens the **prepared** run for the walkthrough. Do not wait for a new run to finish in the 90s window.

**Exit checks:**

- [ ] Production agent URL loads
- [ ] Hello-task succeeds at least 3 times in a row
- [ ] Prepared run URL opens to a finished trace with sandbox + model call
- [ ] Gateway Logs show the agent’s model requests (filter by project `ship-faster-agent`)

### Phase 5 — Rolling Releases + rollback (day 3, short)

On `ship-faster-web` only (the one Pro Rolling Releases slot):

- Settings → Build & Deployment → Rolling Releases
- Enable
- Stages: 10% / 50% / 100%
- Advancement: **manual-approval** (do not auto-advance during a demo)
- Do not start a live canary unless JJ asks later

Confirm Instant Rollback is available on a previous production deployment (the UI exists; you do not have to click it in production if you are nervous — note the click path in the runbook).

**Talking point the presenter is allowed to use:** “You stage traffic. Observability compares canary vs current. You abort or roll back.”  
**Talking point they must not use:** “Observability auto-aborts.”

**Exit checks:**

- [ ] Rolling Releases settings page shows 10 / 50 / 100
- [ ] Engineer can describe Instant Rollback in one sentence from the Deployments page

### Phase 6 — Presenter machine + tabs (day 3)

Pre-open, in order, on the **demo** browser profile:

1. `ship-faster-web` → Overview (deployments list)
2. `ship-faster-web` → Deployments
3. GitHub PR `feature/hero-update`
4. Latest web deployment → Build Logs (a cache-hit one, as backup)
5. Team → Usage → Artifacts (Remote Cache time saved) — **not** a “Turborepo” project tab
6. Team → AI Gateway → Overview
7. Team → AI Gateway → Logs, with the failover request **already opened**
8. `ship-faster-agent` → Observability → Agent Runs, with the prepared run **already opened**
9. `ship-faster-web` → Settings → Build & Deployment (Rolling Releases section)
10. `ship-faster-web` → Deployments (rollback target visible)

Terminal: repo on `feature/hero-update`, dirty or ready to edit `copy.ts`, `vercel` logged in.

**Exit:** JJ can click through all 10 without searching.

### Phase 7 — Dry-run and backup (day 4)

Run the presenter script in [demo-1-ship-faster.md](./demo-1-ship-faster.md) v1.1 **three times**.

Each dry-run, record in `demo/TIMING.md`:

| Beat | Target | Actual dry-run 1/2/3 |
|---|---|---|
| Push hero → Ready | measure, do not assume 60s | |
| Click preview, headline visible | <15s after Ready | |
| Utils push → ui HIT in logs | first try | |
| Gateway overview + failover detail | no search | |
| Agent prepared run | no search | |
| RR config + rollback UI | <30s | |

**Backup video (JJ or engineer):** one take of Act 2 cache-hit logs, Act 3 failover, Act 4 Agent Runs. Store the file URL in `demo/BACKUP.txt`.

**Pass rule:** 3/3 dry-runs complete without opening a tab that was not in the list above. Cache hit visible at least 2/3 times (Remote Cache can still miss; keep the screenshot as fallback).

---

## 7. Scripts the engineer must leave in the repo

Minimal viable versions. Adjust imports to the workspace.

**`scripts/gateway-traffic.ts`** — see Phase 3. Add a `package.json` script:

```json
"gateway:traffic": "pnpm --filter @ship/web exec tsx ../../scripts/gateway-traffic.ts"
```

Put `tsx` where it is easiest; root `devDependency` is fine.

**`scripts/seed-deployments.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
# 10 comment-only commits on main to populate Deployments.
# Run only on a throwaway demo repo.
```

Implement it. Do not run it against any non-demo remote.

---

## 8. Definition of done

The environment is done when **all** of these are true:

1. `ship-faster-web` production is Ready; Preview URLs open with no login.
2. Open PR `feature/hero-update` with an existing Vercel bot comment.
3. `demo/turbo-cache-hit.png` shows `@ship/ui` (or equivalent) **HIT** after a utils-only change.
4. `demo/TIMING.md` has at least one measured push-to-Ready time.
5. `demo/FAILOVER_REQUEST_ID.txt` opens a Log with Fallback Path.
6. `demo/PREPARED_AGENT_RUN.txt` opens a finished Agent Run with sandbox + model call.
7. Rolling Releases is configured 10/50/100 manual on `ship-faster-web`.
8. Native lint + typecheck checks appear on a web deployment.
9. Three dry-runs recorded; backup video URL in `demo/BACKUP.txt`.
10. Nothing in **Out of scope** was built “just in case.”

---

## 9. Out of scope (do not build)

- Conformance / `@vercel-private/conformance` / Code Owners
- Live Eve feature implementation (dark mode, settings, PR, preview URL from the agent)
- Live Rolling Release traffic split or auto-abort
- Live `vercel ai-gateway coding-agents setup` during the talk
- next-forge, Robin, Slack channel for the agent
- Skew Protection, Claim Deployments, Deployment Protection SSO
- A fifth/sixth Next app to make “10 packages”
- Showing docs/admin as CACHE HIT in the **web** build log (they will not be in that graph)
- Expedia or other uncleared customer names

---

## 10. Risks and what to do

| Risk | Mitigation |
|---|---|
| Push-to-Ready > 90s | Presenter narrates over the build; click a **previous** Ready preview if needed. Do not add more apps. |
| ui cache miss on demo day | Use `demo/turbo-cache-hit.png` and the saved Build Logs tab. Re-warm with a no-op ui rebuild the morning of. |
| Agent Runs tab missing | Hard stop. JJ enables it. Do not demo Workflows as a substitute. |
| Failover script does not create Fallback Path | Iterate the `providerOptions` until Logs show it. Do not ship Phase 3 without the screenshot. |
| Gateway charts empty | Logs + failover still carry Act 3. Run traffic the day before. |
| Preview behind SSO | Protection off on Preview. Re-check the morning of. |
| Skew Protection slipped on | Web hashes always miss; ui hit may still work. Turn Skew off on this project. |

---

## 11. Presenter talking-point constraints (engineer should flag drift)

If JJ’s deck disagrees with this file, **this file wins** for what is on screen.

- Turbo: “This app rebuilds. The unrelated UI package is a cache hit. Same work is not done twice.” Not “three packages cache hit” and not “not all 10.”
- Gateway setup: “One command. We already ran it. Here is Claude Code on Gateway.”
- Failover: “Primary failed, fallback served. Here is the path.” Optional recovery % only if JJ has a dated Vercel source.
- Eve: “Tests run inside the agent loop, in a sandbox, models through Gateway. Preview is the same git-push path you just saw.” Do not claim the live chat produced the preview URL.
- Rolling Releases: config + rollback. No auto-abort.
- Quality: “Lint and typecheck run as Deployment Checks on every push.” Do not say Conformance.

---

## 12. Handoff checklist for JJ

Engineer sends a single message when Phase 7 passes:

- Repo URL
- `ship-faster-web` project URL
- `ship-faster-agent` production URL
- PR URL
- Paths: `demo/TIMING.md`, `demo/FAILOVER_REQUEST_ID.txt`, `demo/PREPARED_AGENT_RUN.txt`, `demo/BACKUP.txt`
- Confirm Preview Protection is off
- Confirm Agent Runs tab is visible on JJ’s user
