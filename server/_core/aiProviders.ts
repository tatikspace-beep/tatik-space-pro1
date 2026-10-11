export type AssistantModel = "qwen" | "deepseek" | "gemini";
export type AssistantMessage = { role: "user" | "assistant"; content: string };

type ChatResult = {
  content: string;
  provider: string;
  model: string;
};

const SYSTEM_PROMPT = `You are an expert web developer, UI/UX designer, and SEO specialist integrated into Tatik.space Pro code editor.
Respond in the same language as the user. Always wrap code in triple backticks with a language identifier.
Be direct and practical. For bugs identify the root cause and provide the fix. Suggest accessibility and performance improvements when relevant.`;

const HF_MODELS: Record<Exclude<AssistantModel, "gemini">, string> = {
  qwen: "Qwen/Qwen2.5-Coder-32B-Instruct",
  deepseek: "deepseek-ai/DeepSeek-Coder-V2-Instruct",
};

function providerErrorMessage(
  payload: {
    error?: string | { message?: string };
    message?: string;
  } | null,
  status: number,
) {
  const message = typeof payload?.error === "string"
    ? payload.error
    : payload?.error?.message || payload?.message;
  return message || `HTTP ${status}`;
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  provider: string,
  extraHeaders: Record<string, string> = {},
): Promise<ChatResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2048,
        temperature: 0.3,
        stream: false,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null) as {
      choices?: Array<{ message?: { content?: unknown } }>;
      error?: string | { message?: string };
      message?: string;
    } | null;
    if (!response.ok) {
      throw new Error(providerErrorMessage(payload, response.status));
    }
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error(`${provider} ha restituito una risposta vuota o non valida`);
    }
    return { content: content.trim(), provider, model };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGemini(messages: AssistantMessage[]): Promise<ChatResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");
  const model = "gemini-2.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages.map(message => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
        }),
        signal: controller.signal,
      },
    );
    const payload = await response.json().catch(() => null) as {
      error?: string | { message?: string };
      message?: string;
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    } | null;
    if (!response.ok) {
      throw new Error(providerErrorMessage(payload, response.status));
    }
    const content = payload?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();
    if (!content) throw new Error("Gemini ha restituito una risposta vuota");
    return { content, provider: "Gemini", model };
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateAssistantResponse(
  selectedModel: AssistantModel,
  history: AssistantMessage[],
): Promise<ChatResult> {
  const messages = [{ role: "system" as const, content: SYSTEM_PROMPT }, ...history];
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  const providers: Array<{ name: string; run: () => Promise<ChatResult> }> = [];
  const addGemini = () => {
    if (process.env.GEMINI_API_KEY) {
      providers.push({ name: "Gemini", run: () => callGemini(history) });
    }
  };
  const addGroq = () => {
    if (groqKey) {
      providers.push({
        name: "Groq",
        run: () => callOpenAICompatible(
          "https://api.groq.com/openai/v1/chat/completions",
          groqKey,
          groqModel,
          messages,
          "Groq",
        ),
      });
    }
  };
  const addOpenRouter = () => {
    if (openRouterKey) {
      providers.push({
        name: "OpenRouter",
        run: () => callOpenAICompatible(
          "https://openrouter.ai/api/v1/chat/completions",
          openRouterKey,
          "openrouter/free",
          messages,
          "OpenRouter",
          {
            "HTTP-Referer": "https://www.tatik.space",
            "X-Title": "Tatik.space",
          },
        ),
      });
    }
  };

  if (selectedModel === "gemini") {
    addGemini();
    addGroq();
    addOpenRouter();
  } else {
    addGroq();
    addOpenRouter();
    addGemini();
  }

  const allowPaidHuggingFace = process.env.HF_ENABLE_PAID_FALLBACK === "true";
  if (allowPaidHuggingFace && process.env.HF_API_KEY && selectedModel !== "gemini") {
    providers.push({
      name: "Hugging Face",
      run: async () => {
        const { invokeLLM } = await import("./llm");
        const result = await invokeLLM({
          model: HF_MODELS[selectedModel],
          messages,
          maxTokens: 2048,
          temperature: 0.3,
        });
        const content = result.choices[0]?.message.content.trim();
        if (!content) throw new Error("Hugging Face ha restituito una risposta vuota");
        return { content, provider: "Hugging Face", model: HF_MODELS[selectedModel] };
      },
    });
  }

  if (providers.length === 0) {
    throw new Error("Nessun provider AI configurato. Imposta GEMINI_API_KEY, GROQ_API_KEY o OPENROUTER_API_KEY.");
  }

  const failures: string[] = [];
  for (const provider of providers) {
    try {
      return await provider.run();
    } catch (error) {
      const reason = error instanceof Error ? error.message : "errore sconosciuto";
      failures.push(`${provider.name}: ${reason}`);
      console.warn(`[AI chat] ${provider.name} non disponibile: ${reason}`);
    }
  }
  throw new Error(`Nessun provider AI disponibile. ${failures.join(" | ")}`);
}
