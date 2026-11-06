import { z } from "zod";

export const agentPlanSchema = z.object({
  plan: z.string().min(1).max(4000),
  tasks: z.array(z.object({
    role: z.enum(["architect", "frontend", "backend", "qa"]),
    task: z.string().min(1).max(800),
  })).length(2),
});

const FILE_CREATION_REQUEST = /\b(?:create|build|generate|implement|write|develop|add|fix|update)\b|crea|costru|genera|implement|scriv|svilupp|aggiung|corregg|aggiorn/i;

export function validateAgentFinalResponse(response: string, task: string) {
  const content = response.trim();
  if (!content) {
    throw new Error("La revisione finale dell'Agente è vuota.");
  }

  const fences = content.match(/```/g) || [];
  if (fences.length % 2 !== 0) {
    throw new Error("La revisione finale contiene un blocco di codice non chiuso.");
  }

  const codeBlocks = Array.from(content.matchAll(/```([^\n`]*)\r?\n([\s\S]*?)```/g));
  if (codeBlocks.some(block => !block[2].trim())) {
    throw new Error("La revisione finale contiene un blocco di codice vuoto.");
  }

  if (FILE_CREATION_REQUEST.test(task)) {
    const hasNamedFile = codeBlocks.some(block => {
      if (/(?:filename|file|path)\s*=\s*["']?[^"'`\s]+\.[a-z0-9]+/i.test(block[1])) return true;
      const beforeBlock = content.slice(0, block.index ?? 0).trimEnd().split(/\r?\n/).slice(-6);
      return beforeBlock.some(line => {
        const heading = line.trim()
          .replace(/^#{1,6}\s+/, "")
          .replace(/^\*\*(.*?)\*\*$/, "$1")
          .replace(/^`(.*?)`$/, "$1")
          .trim();
        return /\.[a-z0-9]+$/i.test(heading);
      });
    });
    if (!hasNamedFile) {
      throw new Error("La revisione finale non contiene file completi con percorsi riconoscibili.");
    }
  }

  return content;
}

export function isAgentOutputLimitError(error: unknown) {
  return error instanceof Error
    && /interrotto la risposta al limite di output|troncata.*limite di output|MAX_TOKENS|finish_reason:\s*length/i.test(error.message);
}

export function parseAgentPlan(response: string) {
  const jsonCandidate = response.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonCandidate) throw new Error("L'agente pianificatore non ha restituito un piano valido. Riprova con una richiesta più specifica.");

  let value: unknown;
  try {
    value = JSON.parse(jsonCandidate);
  } catch {
    throw new Error("Il piano dell'Agente non è JSON valido. Riprova con una richiesta più specifica.");
  }

  const plan = agentPlanSchema.safeParse(value);
  if (!plan.success) {
    throw new Error("Il piano dell'Agente non rispetta il formato previsto. Riprova con una richiesta più specifica.");
  }
  return plan.data;
}
