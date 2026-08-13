# Demo 1: "Ship Faster" — CI/CD for the Agentic Era

**Version:** 1.1 (aligned to implementation-plan.md v2.0)  
**Date:** 13 August 2026  
**Owner:** JJ Lecocq, APAC Sales  
**Duration:** ~12 minutes  
**Audience:** VPs Engineering, CTOs, Dev leads evaluating developer productivity  

This script matches what the engineer is building. If it conflicts with [implementation-plan.md](./implementation-plan.md), the plan wins for what appears on screen.

---

## Purpose

Show how Vercel replaces the traditional CI/CD pipeline bottleneck for teams where AI agents now produce most of the code. Four acts. Every product act has a live dashboard view that has already been pre-opened.

---

## Pre-Demo Setup Checklist

Use the engineer handoff (repo, project URLs, `demo/` files). Do not improvise tabs.

### 1. Repository and projects

- Public GitHub repo from the engineer (Turborepo: `apps/web`, `apps/docs`, `apps/admin`, `packages/ui`, `packages/utils`, `apps/agent`)
- Vercel project **`ship-faster-web`** — Preview Deployments on, Preview Protection **off**
- Vercel project **`ship-faster-agent`** — Eve chat + Agent Runs
- ≥10 deployments on `ship-faster-web`
- PR `feature/hero-update` already open, Vercel bot comment already present
- `demo/TIMING.md` has a measured push-to-Ready time — use that, do not assume 60 seconds

### 2. AI Gateway

- Team Gateway has Anthropic + OpenAI traffic
- Claude Code on **this laptop** already configured (`vercel ai-gateway coding-agents setup` was run beforehand)
- Failover request id in `demo/FAILOVER_REQUEST_ID.txt` — that Logs page should already be open
- Do **not** run coding-agents setup live

### 3. Eve

- Production URL for `ship-faster-agent`
- Prepared run URL in `demo/PREPARED_AGENT_RUN.txt` — already open
- Live chat may be triggered; the walkthrough is the **prepared** run
- Surface is **Observability → Agent Runs**, not Workflows

### 4. Dashboard tabs (pre-open in this order)

1. `ship-faster-web` → Overview
2. `ship-faster-web` → Deployments
3. GitHub PR `feature/hero-update` (not a Vercel “Git” tab)
4. A previous web deployment → Build Logs (cache-hit backup)
5. Team → **Usage → Artifacts** (Remote Cache time saved)
6. Team → AI Gateway → Overview
7. Team → AI Gateway → Logs (failover request already open)
8. `ship-faster-agent` → Observability → **Agent Runs** (prepared run already open)
9. `ship-faster-web` → Settings → Build & Deployment → Rolling Releases
10. `ship-faster-web` → Deployments (rollback target visible)

### 5. Terminal

- Repo cloned, on `feature/hero-update`
- Ready to edit `apps/web/lib/copy.ts`
- `vercel` CLI authenticated to the demo team

---

## Act 1: The Problem — "The Flood"

**Duration:** 2 minutes  
**Products shown:** None (narrative only)  
**Dashboard view:** None yet  

### Talking Points

Open with the data. Do not show any product yet.

1. "One of our customers went from 12 PRs per day to 103 in one year. Same team size. The difference is coding agents."

2. "Over 30% of Vercel deployments are now initiated by coding agents. That's up 1,000% in six months."  
   — Source: CI/CD Messaging Framework, Notion

3. "Traditional CI/CD was designed for humans submitting 1-2 PRs per week, with predictable patterns and warm local caches. Agents create thousands of short-lived branches. Merging them all has become, in the words of one CEO, 'really impossible.'"  
   — Source: Hugo Santos (Namespace CEO), "CI/CD is dead" webinar

4. "Teams using intent-based agent loops report 4x faster delivery than traditional PR workflows."  
   — Source: Hugo Santos / NEA webinar

5. Bumper sticker: **"A pipeline designed for humans is the slowest thing in your agentic stack."**

### Engineer Notes

- No build required
- Slide with 12 → 103 and 30% agent-initiated
- Optional: Copilot Metrics chart if you have one

---

## Act 2: Push Code, Get a URL — "Preview Deployments + Turborepo"

**Duration:** 3 minutes  
**Products shown:** Git Integration, Preview Deployments, Turborepo Remote Cache  

If `demo/TIMING.md` says push-to-Ready is over 90 seconds, narrate over the build and click the URL when Ready. Do not stall in silence.

### Live Demo Steps

**Step 1 — Push a commit and show the preview URL**

Edit `apps/web/lib/copy.ts` so `heroHeadline` is obviously different, then:

```bash
git add apps/web/lib/copy.ts
git commit -m "Update hero section copy"
git push origin feature/hero-update
```

- Switch to **Vercel → Deployments** — building → ready
- Switch to the **GitHub PR** — bot comment with the preview URL
- Click the preview URL — new headline on the live site (no SSO prompt)

**Talking point:** "Every push gets a preview URL. No staging server. No environment config. Reviewers and agents validate against a real, production-identical surface before anything merges."

**Step 2 — Show Turborepo cache hit**

```bash
echo "// perf improvement" >> packages/utils/src/format.ts
git add packages/utils/src/format.ts
git commit -m "Optimise format utility"
git push origin feature/hero-update
```

- New deployment → **Build Logs**
- Point at `@ship/utils` (or equivalent) **miss** and `@ship/ui` **HIT**
- If this build misses ui, switch to the pre-opened cache-hit Build Logs tab / `demo/turbo-cache-hit.png`
- Optional: Team → Usage → Artifacts for time saved

**Talking point:** "A change in a shared utility rebuilds the utility and the app that imports it. The unrelated UI package is a cache hit — that work is not done twice. Remote Cache keys outputs to input hashes. We document up to 85% CI time reduction."

Do **not** say “the other three packages cache hit” or “not all 10.” Those packages are not in this project’s task graph.

---

## Act 3: One API, Every Model — "AI Gateway"

**Duration:** 3 minutes  
**Products shown:** AI Gateway (setup already done)  

### Live Demo Steps

**Step 1 — Show the coding agent config (do not run setup)**

- Open the screenshot or `~/.claude/settings.json` with the Gateway URL
- Optional: terminal scrollback of the prior `vercel ai-gateway coding-agents setup` run

**Talking point:** "One command. Any coding agent — Claude Code, Codex, OpenCode, Pi — can use any model through AI Gateway. You can run GPT-5.5 in Claude Code or Claude models in Codex CLI."

**Step 2 — AI Gateway dashboard**

Pre-opened Overview:

- Requests, success rate, TTFT, tokens, cost
- Provider split
- Model latency if visible

**Talking point:** "One dashboard. Every model, every provider. Spend, latency, which provider is winning."

**Step 3 — Failover (use the pre-opened log)**

- Do not search. The Fallback Path request is already open.
- Failed attempt, then success, total latency

**Talking point:** "Primary failed. Gateway served from fallback. Zero markup on tokens — versus OpenRouter’s 5.5% cut."

Do **not** quote 85% / 13% unless you have a dated Vercel source in front of you.

**Step 4 — Skip named current evaluations**

Do not mention Expedia. If you want a customer proof, use a cleared, dated one only.

---

## Act 4: Intent to Ship — "The Full Loop"

**Duration:** 4 minutes  
**Products shown:** Eve (Agent Runs), Sandbox, AI Gateway, Preview (already shown), Deployment Checks, Rolling Releases config, Instant Rollback  

### Live Demo Steps

**Step 1 — Trigger Eve (optional, 15 seconds)**

On the agent production URL, send:

```
Write src/hello.ts that exports hello() returning "hello world", write a test, run it in the sandbox, report pass/fail.
```

If the UI is slow, skip and go straight to the prepared run.

**Step 2 — Walk the prepared Agent Run (90 seconds)**

Pre-opened **Observability → Agent Runs**:

1. User input
2. Model call (Gateway)
3. Sandbox / tool calls
4. Test result

Optional: Gateway Logs filtered to `ship-faster-agent` for the same call.

**Talking point:** "The agent writes code and runs tests inside the loop, in a sandbox, with models on AI Gateway — not a CI job that starts after the PR. The preview URL is the same git-push path you just saw. When the agent is wired to git, that is the ship surface."

Do **not** claim this live chat created the preview deployment.

**Step 3 — Deployment Checks (20 seconds)**

On a `ship-faster-web` deployment detail: lint + typecheck as Native Deployment Checks.

**Talking point:** "Lint and typecheck run as Deployment Checks on every push, before production. It catches what a tired review misses."

Do **not** say Conformance.

**Step 4 — Rolling Releases config + Instant Rollback (40 seconds)**

- Settings → Rolling Releases: 10% → 50% → 100%, manual advance
- Deployments: Instant Rollback on a previous production deployment (point at the control; do not have to click it)

**Talking point:** "You stage traffic. Observability compares canary versus current. You abort or roll back. Bad deploys do not have to reach everyone."

Do **not** say Observability auto-aborts.

**Step 5 — Close (30 seconds)**

"This is what Guillermo calls 'intent to ship.' Everything is an intent to ship. Agent review is always on. Humans get called in as needed. Reverts are instant. In a world where code is free, the most valuable thing is the confidence to ship."

---

## Fallback Plan

| Failure | Recovery |
|---|---|
| Git push doesn't trigger build | Pre-opened Ready deployment + existing PR comment |
| Turbo ui miss | `demo/turbo-cache-hit.png` and backup Build Logs tab |
| Gateway overview thin | Stay on Logs + failover request |
| Eve chat hangs | Prepared Agent Run only; play `demo/BACKUP.txt` video if needed |
| Agent Runs missing | Do not use Workflows. Skip to rollback. Flag to AE after. |
| Preview URL asks for login | Do not fight SSO on stage. Use a screenshot. Fix Protection after. |
| Rolling Releases missing | Instant Rollback only |

---

## Take-Home Actions for the Audience

```
1. vercel ai-gateway coding-agents setup
   Connect your coding agent to AI Gateway. Any model, any agent. Zero markup.

2. git push to a Vercel-connected repo
   Get a preview URL. No staging server.
```

---

## Key Stats to Memorise

| Stat | Source | Use live? |
|---|---|---|
| 12 → 103 PRs/day in one year | MJH (Katie Giacobbi account) | Yes |
| 30% of Vercel deployments are agent-initiated | CI/CD Messaging Framework | Yes |
| 1,000% increase in agent-initiated deploys in 6 months | CI/CD Messaging Framework | Yes |
| Up to 85% CI time reduction with Remote Cache | Vercel documentation | Yes |
| 0% token markup (vs. OpenRouter 5.5%) | AI Gateway pricing | Yes |
| 4x faster delivery with intent-based agent loops | Hugo Santos / NEA webinar | Yes |
| 2.7M daily deployments on Vercel | CI/CD Messaging Framework | Yes |
| 85% first-try / 13% recovered | MJH CTO LinkedIn | **No**, unless a dated Vercel source is added |

---

## Reference Materials

| Resource | Link |
|---|---|
| Implementation plan (engineer) | [implementation-plan.md](./implementation-plan.md) |
| CI/CD Messaging Framework | [Notion](https://app.notion.com/p/351e06b059c480d2ab2efa511705aa9e) |
| "CI/CD is dead" webinar notes | [Notion](https://app.notion.com/p/36ce06b059c4804ba43dc379e0869cfe) |
| Guillermo — anti-fragile infrastructure | [Slack](https://vercel.slack.com/archives/C06BR9ZH14H/p1770513184731419) |
| Guillermo — intent to ship | [Slack](https://vercel.slack.com/archives/C06BR9ZH14H/p1786123302498779) |
| Mike Curtis — "the outcome IS the deploy" | [Slack](https://vercel.slack.com/archives/C06BR9ZH14H/p1775283000200409) |
| AI Gateway coding agents setup | [Slack](https://vercel.slack.com/archives/C04EP0UV4KE) |
| John Harrison AI primitives demo | [Demo](https://workflow-sandbox-demo.playground-vercel.tools) |
