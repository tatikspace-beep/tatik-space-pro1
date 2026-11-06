import { describe, expect, it } from "vitest";
import { isAgentOutputLimitError, parseAgentPlan, validateAgentFinalResponse } from "./ai-agent";

describe("AI agent output recovery", () => {
  it("recognizes provider output truncation for a concise retry", () => {
    expect(isAgentOutputLimitError(new Error(
      "Nessun provider AI disponibile. Groq: Groq ha interrotto la risposta al limite di output.",
    ))).toBe(true);
    expect(isAgentOutputLimitError(new Error("Gemini è temporaneamente occupato."))).toBe(false);
  });
});

describe("AI agent planner output", () => {
  it("parses a bounded plan with specialist tasks", () => {
    expect(parseAgentPlan('{"plan":"Aggiornare la pagina","tasks":[{"role":"frontend","task":"Integrare il flusso"},{"role":"qa","task":"Verificare il flusso"}]}'))
      .toEqual({
        plan: "Aggiornare la pagina",
        tasks: [
          { role: "frontend", task: "Integrare il flusso" },
          { role: "qa", task: "Verificare il flusso" },
        ],
      });
  });

  it("rejects malformed or oversized delegation plans", () => {
    expect(() => parseAgentPlan("nessun json")).toThrow(/piano valido/i);
    expect(() => parseAgentPlan('{"plan":"ok","tasks":[{"role":"attacker","task":"x"},{"role":"qa","task":"y"}]}')).toThrow(/formato previsto/i);
    expect(() => parseAgentPlan('{"plan":"ok","tasks":[{"role":"qa","task":"x"}]}')).toThrow(/formato previsto/i);
  });

  it("accepts a complete named file for a file-creation task", () => {
    expect(validateAgentFinalResponse(
      "### `index.html`\n```html\n<!doctype html><html></html>\n```",
      "Crea una pagina monopagina",
    )).toContain("<!doctype html>");
  });

  it("rejects empty, unclosed, or unnamed file output instead of reporting success", () => {
    expect(() => validateAgentFinalResponse(
      "### index.html\n```html\n```",
      "Crea una pagina monopagina",
    )).toThrow(/blocco di codice vuoto/i);
    expect(() => validateAgentFinalResponse(
      "### index.html\n```html\n<h1>Test</h1>",
      "Crea una pagina monopagina",
    )).toThrow(/non chiuso/i);
    expect(() => validateAgentFinalResponse(
      "Ecco la soluzione.",
      "Crea una pagina monopagina",
    )).toThrow(/file completi/i);
  });

  it("allows a complete non-code answer to an informational task", () => {
    expect(validateAgentFinalResponse("Il problema dipende dal percorso.", "Spiega il problema"))
      .toBe("Il problema dipende dal percorso.");
  });
});
