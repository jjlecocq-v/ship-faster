# Demo timing

Measured against `ship-faster-web` on team `se-apac-playground-vtest314`.

## Push → Ready

| Event | Time (UTC) | Notes |
|---|---|---|
| `git push origin feature/hero-update` (utils-only) | 2026-08-13 10:00:23Z | commit `20778c7` |
| Deployment created | 2026-08-13 10:00:25Z | `dpl_6xBY9mG8u7FVYZn49khbtVkTutAq` |
| Ready | ~2026-08-13 10:00:41Z | Vercel duration **16s** |

**Push → Ready: 18 seconds.** Presenter does not need to talk over the build.

## Dry-runs (Phase 7)

| Beat | Target | Actual dry-run 1/2/3 |
|---|---|---|
| Push hero → Ready | measure, do not assume 60s | 18s (utils-only Git preview, 13 Aug 2026) / / |
| Click preview, headline visible | <15s after Ready | |
| Utils push → ui HIT in logs | first try | first try (`@ship/ui:build: cache hit`) |
| Gateway overview + failover detail | no search | |
| Agent prepared run | no search | |
| RR config + rollback UI | <30s | |

## Cache-hit proof

- Deployment: https://vercel.com/se-apac-playground-vtest314/ship-faster-web/6xBY9mG8u7FVYZn49khbtVkTutAq
- `@ship/utils#build` miss
- `@ship/web#build` miss
- `@ship/ui#build` **HIT**
- Screenshot: `demo/turbo-cache-hit.png`
