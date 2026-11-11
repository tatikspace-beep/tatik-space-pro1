import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./llm";
import { generateAssistantResponse } from "./aiProviders";

vi.mock("./llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Risposta Hugging Face" } }],
  }),
}));

describe("generateAssistantResponse", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.HF_API_KEY;
    delete process.env.GROQ_MODEL;
    delete process.env.OLLAMA_BASE_URL;
    delete process.env.OLLAMA_API_KEY;
    delete process.env.OLLAMA_MODEL;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("falls back from Groq to OpenRouter and reports the provider used", async () => {
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "rate limit" }), {
        status: 429,
        headers: { "retry-after": "0" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "rate limit" }), {
        status: 429,
        headers: { "retry-after": "0" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [{ message: { content: "Risposta" } }],
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ]);

    expect(result).toEqual({
      content: "Risposta",
      provider: "OpenRouter",
      model: "openrouter/free",
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toContain("api.groq.com");
    expect(fetchMock.mock.calls[2][0]).toContain("openrouter.ai");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(8192);
  });

  it("retries Groq once after the rate-limit reset and then succeeds", async () => {
    process.env.GROQ_API_KEY = "test-groq-key";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "rate limit" }), {
        status: 429,
        headers: { "retry-after": "0" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        choices: [{ message: { content: "Risposta dopo il retry" } }],
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ], undefined, 600);

    expect(result.provider).toBe("Groq");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("extracts text blocks from OpenRouter content arrays", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: [{ type: "text", text: "Risposta " }, { type: "text", text: "OpenRouter" }] } }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ], undefined, 600);

    expect(result.content).toBe("Risposta OpenRouter");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(2048);
  });

  it("includes the finish reason when a provider returns no visible content", async () => {
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: null }, finish_reason: "length" }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ])).rejects.toThrow(/finish_reason: length/);
  });

  it("uses Hugging Face as the fallback for a Gemini selection when only HF_API_KEY is configured", async () => {
    process.env.HF_API_KEY = "test-hf-key";

    const result = await generateAssistantResponse("gemini", [
      { role: "user", content: "Ciao" },
    ], undefined, 8192, [], "json");

    expect(result).toEqual({
      content: "Risposta Hugging Face",
      provider: "Hugging Face",
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
    });
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      responseFormat: "json",
    }));
  });

  it("uses the currently documented Gemini Flash model when selected", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "Risposta Gemini" }] } }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse("gemini", [
      { role: "user", content: "Ciao" },
    ], undefined, 8192, [], "json");

    expect(result.provider).toBe("Gemini");
    expect(result.model).toBe("gemini-3.8-flash");
    expect(fetchMock.mock.calls[0][0]).toContain("gemini-3.8-flash");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).generationConfig.maxOutputTokens).toBe(8192);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).generationConfig.responseMimeType).toBe("application/json");
  });

  it("uses the requested output budget across providers", async () => {
    process.env.GROQ_API_KEY = "test-groq-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "Piano" } }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ], "Coordinatore", 600, [], "json");

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).max_tokens).toBe(600);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).response_format).toEqual({ type: "json_object" });
  });

  it("uses protected Ollama as a final fallback and sends approved examples only to Ollama", async () => {
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OLLAMA_BASE_URL = "https://ollama.example.test";
    process.env.OLLAMA_API_KEY = "test-ollama-key";
    process.env.OLLAMA_MODEL = "qwen2.5-coder:14b";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "unavailable" }), { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        message: { content: "Risposta dal modello locale" },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse(
      "qwen",
      [{ role: "user", content: "Allinea le schede" }],
      "Sei un agente.",
      1200,
      [{ task: "Allinea le schede", response: "Usa flexbox e mantieni il layout." }],
      "json",
    );

    expect(result).toEqual({
      content: "Risposta dal modello locale",
      provider: "Ollama",
      model: "qwen2.5-coder:14b",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("https://ollama.example.test/api/chat");
    const cloudBody = JSON.stringify(JSON.parse(fetchMock.mock.calls[0][1].body));
    const ollamaRequest = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(cloudBody).not.toContain("Usa flexbox");
    expect(ollamaRequest.messages[0].content).toContain("Usa flexbox");
    expect(ollamaRequest.options.num_predict).toBe(1200);
    expect(ollamaRequest.format).toBe("json");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer test-ollama-key");
    expect(fetchMock.mock.calls[1][1].redirect).toBe("error");
  });

  it("uses Ollama by itself when no hosted provider key is configured", async () => {
    process.env.OLLAMA_BASE_URL = "https://ollama.example.test";
    process.env.OLLAMA_API_KEY = "test-ollama-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: { content: "Risposta Ollama" },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ]);

    expect(result.provider).toBe("Ollama");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not call an unauthenticated Ollama endpoint in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.OLLAMA_BASE_URL = "https://ollama.example.test";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ])).rejects.toThrow(/OLLAMA_API_KEY è obbligatoria/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects insecure non-local Ollama endpoints", async () => {
    process.env.OLLAMA_BASE_URL = "http://ollama.example.test";
    process.env.OLLAMA_API_KEY = "test-ollama-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ])).rejects.toThrow(/richiede HTTPS/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
