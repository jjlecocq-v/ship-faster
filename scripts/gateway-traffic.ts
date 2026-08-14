import { generateText, gateway } from "ai";

const MODELS = [
  "anthropic/claude-sonnet-4.6",
  "openai/gpt-5.5",
  "google/gemini-3.1-flash-lite",
] as const;

const TOTAL = 84;
const CONCURRENCY = 4;

function promptFor(index: number, model: string): string {
  return `SHIPFASTER-TRAFFIC ${index + 1}/${TOTAL} model=${model} nonce=${crypto.randomUUID()} Reply with one word: pong.`;
}

async function one(index: number): Promise<void> {
  const model = MODELS[index % MODELS.length];
  const result = await generateText({
    model: gateway(model),
    prompt: promptFor(index, model),
    maxOutputTokens: 16,
    providerOptions: {
      gateway: {
        tags: ["shipfaster", "traffic"],
      },
    },
  });
  const meta = result.providerMetadata?.gateway as
    | { generationId?: string; requestId?: string }
    | undefined;
  console.log(
    JSON.stringify({
      index: index + 1,
      model,
      requestId: meta?.generationId ?? meta?.requestId ?? null,
      text: result.text.slice(0, 40),
    }),
  );
}

async function pool(count: number, limit: number): Promise<void> {
  let next = 0;
  let failures = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (next < count) {
      const i = next++;
      try {
        await one(i);
      } catch (error) {
        failures += 1;
        console.error(
          JSON.stringify({
            index: i + 1,
            error: error instanceof Error ? error.message : String(error),
          }),
        );
        await new Promise((r) => setTimeout(r, 750));
      }
    }
  });
  await Promise.all(workers);
  if (failures > 0) {
    throw new Error(`gateway traffic finished with ${failures} failures`);
  }
}

async function main() {
  await pool(TOTAL, CONCURRENCY);
  console.log(`sent ${TOTAL} SHIPFASTER-TRAFFIC requests`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
