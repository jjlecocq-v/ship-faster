# Agent kickoff prompt — Ship Faster demo build

Copy everything below the line into a new agent chat in this repo (or the GitHub repo once it exists). Do not add extra product scope.

---

You are implementing the **Ship Faster** demo environment. This is a demo to build, not a product to design.

## Source of truth

Read and follow, in this order:

1. `implementation-plan.md` (v2.1) — **the spec**. Frozen decisions, phases, exit checks, out of scope.
2. `demo-1-ship-faster.md` (v1.1) — presenter script. Only so you know what must appear on screen.

If those files disagree, **the implementation plan wins**. Do not restore anything from an older demo script (no Robin, no Conformance on the deployment page, no live Eve feature-write, no live Rolling Release split, no Expedia).

## Already done (do not wait)

- Dedicated **Pro** demo team (not Hobby, not a customer team)
- **Agent Runs** enabled on that team
- Rolling Releases **one-project slot reserved for `ship-faster-web` only**

## Start here

1. `npm i -g vercel@latest`
2. `vercel login` onto the Pro demo team
3. Confirm `vercel whoami` shows that team. If it does not, **stop**.
4. Create a public GitHub repo named `ship-faster` (or the org-prefixed equivalent) if it does not exist.
5. Execute **Phase 1**, then **Phase 2**, then continue in order through Phase 7.

Do not skip a phase. Do not start Phase 3 until Phase 2 exit checks pass. Do not start Phase 4 until Phase 3 exit checks pass.

## Hard constraints (do not reopen)

- Custom pnpm + Turborepo 2.x. **Not** next-forge. **Not** `samrosenbaum/robin`.
- Workspaces: `apps/web`, `apps/docs`, `apps/admin`, `apps/agent`, `packages/ui`, `packages/utils`. Package names `@ship/*`.
- **Two** Vercel projects: `ship-faster-web` (Root Directory `apps/web`) and `ship-faster-agent` (Root Directory `apps/agent`). Do not merge them.
- Package graph: `ui` does **not** import `utils`. `web` imports both. `docs` and `admin` import `ui` only.
- Turbo money shot: utils-only change → `@ship/utils` miss, `@ship/web` miss, **`@ship/ui` HIT**. Docs/admin will not appear in the web project build log. If ui misses, fix the graph before continuing.
- `apps/web`: hero copy in `apps/web/lib/copy.ts` as `heroHeadline`; Hero from `@ship/ui`; `formatDate` from `@ship/utils`; `/settings` placeholder only — **no dark mode**.
- Preview **Deployment Protection off** on both projects. Skew Protection **off** on `ship-faster-web`.
- Native Deployment Checks: lint + typecheck on `apps/web`. **Not** Conformance.
- Eve v1: `npx eve@latest init` in `apps/agent`, then read `node_modules/eve/docs/README.md` for the installed version before writing agent code. Chat + sandbox + unit test + Gateway model. **No** git write, PR, or preview deploy from the agent.
- Act 4 surface is **Observability → Agent Runs**. After the first Eve deploy, if that tab is missing, **stop**. Do not substitute Workflows.
- Rolling Releases: enable **only** on `ship-faster-web`, stages 10/50/100, **manual** advancement. Do not run a live traffic split. Closer is Instant Rollback.
- Gateway: `generateText` from `ai` with `provider/model` strings. No `@ai-sdk/anthropic` or `@ai-sdk/openai`. No provider API keys in the repo. Force a failover and save the request id to `demo/FAILOVER_REQUEST_ID.txt`.
- Coding-agents CLI: do not run `vercel ai-gateway coding-agents setup` as part of the app build. Leave that for the presenter laptop (plan Phase 3, JJ machine).

## Out of scope (do not build)

Conformance, live Eve dark-mode/settings/PR/preview loop, live Rolling Release canary, live coding-agents setup, Slack channel, Claim Deployments, extra apps to fake “10 packages”, uncleared customer names.

## Skills / docs

Use Vercel project skills where relevant: deployments/CI, AI Gateway, AI SDK, eve, Sandbox. For eve, installed `node_modules/eve/docs/` is the version source of truth after scaffold.

## Done looks like

Phase 7 definition of done in `implementation-plan.md` section 8: both projects Ready, PR open, `demo/` artifacts filled (`TIMING.md`, `turbo-cache-hit.png`, `FAILOVER_REQUEST_ID.txt`, `PREPARED_AGENT_RUN.txt`, `BACKUP.txt`), three dry-runs, Rolling Releases configured on web only.

When a phase’s **exit checks** pass, check them off in `implementation-plan.md` and continue. When you hit a hard stop, report what you saw and wait.

Start now with `vercel whoami` and Phase 1.
