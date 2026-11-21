import { describe, expect, it } from "vitest";
import {
  addApprovedAgentExample,
  agentMemoryStorageKey,
  parseApprovedAgentExamples,
  selectRelevantAgentExamples,
} from "./agentMemory";

describe("approved agent memory", () => {
  it("isolates browser memory by user and project", () => {
    expect(agentMemoryStorageKey(7, 42)).not.toBe(agentMemoryStorageKey(8, 42));
    expect(agentMemoryStorageKey(7, 42)).not.toBe(agentMemoryStorageKey(7, 43));
  });

  it("stores bounded examples, removes duplicates, and keeps the newest first", () => {
    const first = addApprovedAgentExample([], "Allinea le card", "Soluzione", 1);
    const updated = addApprovedAgentExample(first, "Allinea le card", "Soluzione", 2);

    expect(updated).toHaveLength(1);
    expect(updated[0].createdAt).toBe(2);
    expect(parseApprovedAgentExamples(JSON.stringify(updated))).toEqual(updated);
  });

  it("rejects empty or oversized examples instead of storing partial content", () => {
    expect(() => addApprovedAgentExample([], " ", "response")).toThrow(/presenti/i);
    expect(() => addApprovedAgentExample([], "task", "x".repeat(6001))).toThrow(/troppo lungo/i);
    expect(() => parseApprovedAgentExamples("{broken")).toThrow(/non è leggibile/i);
  });

  it("retrieves only examples relevant to the task", () => {
    const examples = [
      { id: "1", task: "Allinea le card recensioni", response: "Esempio card", createdAt: 1 },
      { id: "2", task: "Crea una pagina contatti", response: "Esempio contatti", createdAt: 2 },
    ];

    expect(selectRelevantAgentExamples(examples, "Allinea le valutazioni delle card")).toEqual([
      { task: "Allinea le card recensioni", response: "Esempio card" },
    ]);
    expect(selectRelevantAgentExamples(examples, "Aggiorna il webhook")).toEqual([]);
  });
});
