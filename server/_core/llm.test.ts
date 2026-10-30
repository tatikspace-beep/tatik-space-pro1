import { afterEach, describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./llm";

vi.mock("./env", () => ({
  ENV: { hfApiKey: "test-hf-key" },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("invokeLLM", () => {
  it("uses the current Hugging Face router chat-completions endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: "Risposta Hugging Face" } }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await invokeLLM({
      model: "Qwen/Qwen2.5-Coder-32B-Instruct",
      messages: [{ role: "user", content: "Ciao" }],
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://router.huggingface.co/v1/chat/completions");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe("Qwen/Qwen2.5-Coder-32B-Instruct");
    expect(result.choices[0].message.content).toBe("Risposta Hugging Face");
  });
});
