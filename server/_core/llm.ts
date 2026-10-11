import { ENV } from "./env";

export type Role = "system" | "user" | "assistant";
export type Message = { role: Role; content: string };
export type InvokeParams = { messages: Message[]; maxTokens?: number; temperature?: number };
export type InvokeResult = {
  choices: Array<{ message: { role: Role; content: string } }>;
};

const DEFAULT_HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3";

export async function invokeLLM(params: InvokeParams & { model?: string }): Promise<InvokeResult> {
  if (!ENV.hfApiKey) throw new Error("HF_API_KEY is not configured");
  const { messages, maxTokens = 2048, temperature = 0.2, model = DEFAULT_HF_MODEL } = params;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.hfApiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });
    const payload = await response.json().catch(() => null) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: string;
    } | null;
    if (!response.ok) {
      throw new Error(`Hugging Face API failed (${response.status}): ${payload?.error || response.statusText}`);
    }
    const content = payload?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Il provider AI ha restituito una risposta vuota");
    return { choices: [{ message: { role: "assistant", content } }] };
  } finally {
    clearTimeout(timeout);
  }
}
