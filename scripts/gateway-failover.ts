import { writeFileSync } from "node:fs";
import { generateText, gateway } from "ai";

function requestIdFrom(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const gatewayMeta = (meta as { gateway?: Record<string, unknown> }).gateway;
  if (!gatewayMeta) return null;
  for (const key of ["generationId", "requestId", "request_id", "id"]) {
    const value = gatewayMeta[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function attemptCount(meta: unknown): number {
  if (!meta || typeof meta !== "object") return 0;
  const routing = (meta as { gateway?: { routing?: { modelAttemptCount?: number; totalProviderAttemptCount?: number } } })
    .gateway?.routing;
  return Math.max(
    routing?.modelAttemptCount ?? 0,
    routing?.totalProviderAttemptCount ?? 0,
  );
}

function failedThenSucceeded(meta: unknown): boolean {
  if (!meta || typeof meta !== "object") return false;
  const routing = (
    meta as {
      gateway?: {
        routing?: {
          modelAttempts?: Array<{
            success?: boolean;
            providerAttempts?: Array<{ success?: boolean }>;
          }>;
        };
      };
    }
  ).gateway?.routing;
  const attempts = routing?.modelAttempts ?? [];
  const anyFail = attempts.some(
    (m) =>
      m.success === false ||
      (m.providerAttempts ?? []).some((p) => p.success === false),
  );
  const anySuccess = attempts.some(
    (m) =>
      m.success === true ||
      (m.providerAttempts ?? []).some((p) => p.success === true),
  );
  return anyFail && anySuccess;
}

const prompt = `SHIPFASTER-FAILOVER ${new Date().toISOString()} Reply with pong.`;

type Strategy = {
  name: string;
  run: () => Promise<Awaited<ReturnType<typeof generateText>>>;
};

const strategies: Strategy[] = [
  {
    name: "invalid-primary-then-openai",
    run: () =>
      generateText({
        model: gateway("this-org/this-model-does-not-exist"),
        prompt,
        maxOutputTokens: 16,
        providerOptions: {
          gateway: {
            tags: ["shipfaster", "failover"],
            models: ["openai/gpt-5.5"],
          },
        },
      }),
  },
  {
    name: "claude-on-openai-then-gpt",
    run: () =>
      generateText({
        model: gateway("anthropic/claude-sonnet-4.6"),
        prompt,
        maxOutputTokens: 16,
        providerOptions: {
          gateway: {
            tags: ["shipfaster", "failover"],
            only: ["openai"],
            models: ["openai/gpt-5.5"],
          },
        },
      }),
  },
  {
    name: "gpt-order-anthropic-then-openai",
    run: () =>
      generateText({
        model: gateway("openai/gpt-5.5"),
        prompt,
        maxOutputTokens: 16,
        providerOptions: {
          gateway: {
            tags: ["shipfaster", "failover"],
            order: ["anthropic", "openai"],
          },
        },
      }),
  },
  {
    name: "gpt-order-groq-then-openai",
    run: () =>
      generateText({
        model: gateway("openai/gpt-5.5"),
        prompt,
        maxOutputTokens: 16,
        providerOptions: {
          gateway: {
            tags: ["shipfaster", "failover"],
            order: ["groq", "openai"],
          },
        },
      }),
  },
];

async function main() {
  let winner: { name: string; result: Awaited<ReturnType<typeof generateText>> } | null =
    null;

  for (const strategy of strategies) {
    try {
      const result = await strategy.run();
      const meta = result.providerMetadata ?? {};
      const ok = failedThenSucceeded(meta) || attemptCount(meta) > 1;
      console.log(
        JSON.stringify({
          strategy: strategy.name,
          ok,
          attempts: attemptCount(meta),
          generationId: requestIdFrom(meta),
        }),
      );
      console.log(JSON.stringify(meta, null, 2));
      if (ok) {
        winner = { name: strategy.name, result };
        break;
      }
    } catch (error) {
      console.error(
        strategy.name,
        "threw:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  if (!winner) {
    throw new Error("No strategy produced a failed-then-success Fallback Path");
  }

  const meta = winner.result.providerMetadata ?? {};
  const id = requestIdFrom(meta);
  if (!id) {
    throw new Error("Missing generationId");
  }
  writeFileSync(
    "demo/FAILOVER_REQUEST_ID.txt",
    `${id}\nhttps://vercel.com/se-apac-playground-vtest314/~/ai-gateway/logs?q=${id}\nstrategy=${winner.name}\n`,
  );
  console.log("saved demo/FAILOVER_REQUEST_ID.txt");
  console.log("text:", winner.result.text);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
