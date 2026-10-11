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
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "rate limit" }), { status: 429 }))
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
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("api.groq.com");
    expect(fetchMock.mock.calls[1][0]).toContain("openrouter.ai");
  });

  it("uses Hugging Face as a fallback when only HF_API_KEY is configured", async () => {
    process.env.HF_API_KEY = "test-hf-key";

    const result = await generateAssistantResponse("qwen", [
      { role: "user", content: "Ciao" },
    ]);

    expect(result).toEqual({
      content: "Risposta Hugging Face",
      provider: "Hugging Face",
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
    });
    expect(invokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
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
    ]);

    expect(result.provider).toBe("Gemini");
    expect(result.model).toBe("gemini-2.5-flash");
    expect(fetchMock.mock.calls[0][0]).toContain("gemini-2.5-flash");
  });
});
