# Presenter handoff

Team: `se-apac-playground-vtest314`. Repo: https://github.com/jjlecocq-v/ship-faster

## Still to do on the demo machine

1. **Rolling Releases** on `ship-faster-web` is **enabled** (10% / 50% / 100%, manual). `vercel rolling-release fetch` is `null` until a canary is started — do **not** run `vercel rr start`. Do **not** enable it on `ship-faster-agent`. Settings: https://vercel.com/se-apac-playground-vtest314/ship-faster-web/settings/build-and-deployment

   Enabling RR turned **Skew Protection** on (`skewProtectionMaxAge` 86400). Spec wanted Skew off on web; turn it off from that same settings page if the Turbo cache-hit beat needs it.

2. **Claude Code → Gateway** (Phase 3, this laptop): `vercel ai-gateway coding-agents setup --agent claude-code`. Do not run it during the talk.

3. **Commit + git-connect the agent** when you want Git deploys of `apps/agent`. Production is already live from a CLI deploy: https://ship-faster-agent.vercel.app

4. **Native lint + typecheck** on web deployment detail is still missing (Phase 1). Add from Build & Deployment → Deployment Checks if you need that beat.

## Instant Rollback (do not click in production)

Deployments → previous Ready production row → **Instant Rollback**. One sentence: “Pick the last good production deployment and restore it immediately.”

## Tabs to pre-open (Phase 6)

1. https://vercel.com/se-apac-playground-vtest314/ship-faster-web
2. https://vercel.com/se-apac-playground-vtest314/ship-faster-web/deployments
3. https://github.com/jjlecocq-v/ship-faster/pull/2
4. https://vercel.com/se-apac-playground-vtest314/ship-faster-web/6xBY9mG8u7FVYZn49khbtVkTutAq (cache-hit Build Logs)
5. Team → Usage → Artifacts (Remote Cache)
6. https://vercel.com/se-apac-playground-vtest314/~/ai-gateway
7. https://vercel.com/se-apac-playground-vtest314/~/ai-gateway/logs?q=gen_01KZXBAPAGW30F60MRJXYSPYR3
8. https://vercel.com/se-apac-playground-vtest314/ship-faster-agent/observability/agent-runs?runId=wrun_41KZYH1DDZ0GZAD5HXV599ANXP
9. https://vercel.com/se-apac-playground-vtest314/ship-faster-web/settings/build-and-deployment
10. https://vercel.com/se-apac-playground-vtest314/ship-faster-web/deployments (rollback target)

Terminal: `feature/hero-update`, ready to edit `apps/web/lib/copy.ts`.

## Live URLs

- Web prod: https://ship-faster-web.vercel.app
- Agent prod: https://ship-faster-agent.vercel.app
