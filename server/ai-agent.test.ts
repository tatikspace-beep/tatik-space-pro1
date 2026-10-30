import { describe, expect, it } from "vitest";
import { parseAgentPlan } from "./ai-agent";

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
});
