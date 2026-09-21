// ============================================================
// Wandora — cliente ZAI (z-ai-web-dev-sdk) server-side
// Singleton preguiçoso com cache em globalThis (sobrevive ao
// hot-reload do dev) + helpers de chamada com timeout e
// extração robusta de JSON (o LLM às vezes cerca com markdown).
// ATENÇÃO: usar SOMENTE em API routes / server-side.
// ============================================================

import ZAI from "z-ai-web-dev-sdk";

type ZAIInstance = Awaited<ReturnType<typeof ZAI.create>>;

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const globalForZai = globalThis as unknown as {
  __wandoraZai?: Promise<ZAIInstance>;
};

/** Instância única do ZAI, criada sob demanda e reutilizada. */
export function getZAI(): Promise<ZAIInstance> {
  if (!globalForZai.__wandoraZai) {
    const creating = ZAI.create().catch((error: unknown) => {
      // não deixa uma promise rejeitada cacheada para sempre:
      // a próxima chamada tenta criar de novo
      globalForZai.__wandoraZai = undefined;
      throw error;
    });
    globalForZai.__wandoraZai = creating;
    return creating;
  }
  return globalForZai.__wandoraZai;
}

/** Corre uma promise com timeout; limpa o timer ao terminar. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("LLM_TIMEOUT")), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

interface ChatCompletionLike {
  choices?: Array<{ message?: { content?: unknown } }>;
}

/**
 * Chama o LLM com `thinking: disabled` e timeout.
 * Retorna o texto da resposta, ou `null` em caso de erro/timeout/
 * resposta vazia — quem chama decide o fallback.
 */
export async function llmChat(
  messages: LlmMessage[],
  timeoutMs = 20_000
): Promise<string | null> {
  try {
    const zai = await getZAI();
    const completion = (await withTimeout(
      zai.chat.completions.create({
        messages,
        thinking: { type: "disabled" },
      }),
      timeoutMs
    )) as ChatCompletionLike | null;

    const content = completion?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      return null;
    }
    return content;
  } catch {
    // erro, timeout ou SDK indisponível — silencia: o chamador tem fallback
    return null;
  }
}

/**
 * Extrai um objeto JSON de uma resposta de LLM:
 * 1) parse direto; 2) remove cerca de código markdown;
 * 3) recorta do primeiro "{" ao último "}".
 * Retorna `null` se não conseguir um JSON válido.
 */
export function extractJSON<T>(raw: string): T | null {
  const attempt = (s: string): T | null => {
    try {
      return JSON.parse(s) as T;
    } catch {
      return null;
    }
  };

  const trimmed = raw.trim();

  const direct = attempt(trimmed);
  if (direct !== null) return direct;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) {
    const inner = attempt(fence[1].trim());
    if (inner !== null) return inner;
  }

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) {
    const sliced = attempt(trimmed.slice(first, last + 1));
    if (sliced !== null) return sliced;
  }

  return null;
}
