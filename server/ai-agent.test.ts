import { describe, expect, it } from "vitest";
import { isInformationalAgentRequest, parseAgentPlan, validateAgentFinalResponse } from "./ai-agent";

describe("AI agent request intent", () => {
  it("recognizes explanation requests so they are not turned into file changes", () => {
    expect(isInformationalAgentRequest("Spiega in due punti cosa significa fare un test funzionale")).toBe(true);
    expect(isInformationalAgentRequest("Explain why functional tests matter")).toBe(true);
    expect(isInformationalAgentRequest("Rispondi in due punti, senza creare file")).toBe(true);
    expect(isInformationalAgentRequest("Implementa un test funzionale")).toBe(false);
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

  it("parses JSON fences and ignores explanatory braces and nested object braces", () => {
    expect(parseAgentPlan([
      "Ecco il piano richiesto (il formato è {piano, attività}):",
      "```json",
      '{"plan":"Aggiornare la pagina {home}","tasks":[{"role":"frontend","task":"Integrare {header}"},{"role":"qa","task":"Verificare il flusso"}]}',
      "```",
      "Fine.",
    ].join("\n"))).toEqual({
      plan: "Aggiornare la pagina {home}",
      tasks: [
        { role: "frontend", task: "Integrare {header}" },
        { role: "qa", task: "Verificare il flusso" },
      ],
    });
  });

  it("skips malformed JSON candidates before a valid plan", () => {
    expect(parseAgentPlan([
      "Esempio non valido: {not JSON}",
      '{"plan":"Piano valido","tasks":[{"role":"backend","task":"Verificare API"},{"role":"qa","task":"Provare flusso"}]}',
    ].join("\n")).plan).toBe("Piano valido");
  });

  it("rejects malformed or oversized delegation plans", () => {
    expect(() => parseAgentPlan("nessun json")).toThrow(/piano valido/i);
    expect(() => parseAgentPlan("{broken}")).toThrow(/JSON valido/i);
    expect(() => parseAgentPlan('{"plan":"ok","tasks":[{"role":"attacker","task":"x"}]}')).toThrow(/formato previsto/i);
    expect(() => parseAgentPlan('{"plan":"ok","tasks":[{"role":"qa","task":"x"}]}')).toThrow(/formato previsto/i);
    expect(() => parseAgentPlan('{"plan":"ok","tasks":[{"role":"qa","task":"1"},{"role":"qa","task":"2"},{"role":"qa","task":"3"}]}')).toThrow(/formato previsto/i);
  });

  it("accepts a complete named file for a file-creation task", () => {
    expect(validateAgentFinalResponse(
      "### `index.html`\n```html\n<!doctype html><html></html>\n```",
      "Crea una pagina monopagina",
    )).toContain("<!doctype html>");
  });

  it("rejects empty, unclosed, or unnamed file output", () => {
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
    expect(validateAgentFinalResponse(
      "1. Un test funzionale verifica il comportamento visibile richiesto.\n2. Prima del rilascio aiuta a trovare regressioni.",
      "Rispondi in due punti, senza creare file",
    )).toContain("Un test funzionale");
  });
});
