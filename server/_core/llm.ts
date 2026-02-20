import { ENV } from "./env";

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
};

export type InvokeResult = {
  choices: Array<{
    message: {
      role: Role;
      content: string;
    };
  }>;
};

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"; // Modello consigliato per Hugging Face Inference API

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.hfApiKey) {
    throw new Error("HF_API_KEY is not configured");
  }

  const { messages, maxTokens = 1024 } = params;

  // Hugging Face Inference API utilizza un formato leggermente diverso ma supporta lo standard OpenAI-like per molti modelli
  const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.hfApiKey}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Hugging Face API failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
