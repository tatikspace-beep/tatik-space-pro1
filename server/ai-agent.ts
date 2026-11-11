import { z } from "zod";

export const agentPlanSchema = z.object({
  plan: z.string().min(1).max(4000),
  tasks: z.array(z.object({
    role: z.enum(["architect", "frontend", "backend", "qa"]),
    task: z.string().min(1).max(800),
  })).length(2),
});

const FILE_CREATION_REQUEST = /\b(?:create|build|generate|implement|write|develop|add|fix|update)\b|crea|costru|genera|implement|scriv|svilupp|aggiung|corregg|aggiorn/i;
const NO_IMPLEMENTATION_REQUEST = /\b(?:do not|don't|never)\s+(?:create|build|generate|implement|write|develop|add|fix|update)\b|(?:non|senza)\s+(?:creare|costruire|generare|implementare|scrivere|sviluppare|aggiungere|correggere|aggiornare)\b/i;
const INFORMATIONAL_AGENT_REQUEST = /^(?:please\s+)?(?:explain|what is|why|how does|describe|define|compare|summarize|translate|answer|tell me)\b|^(?:spiega|rispondi|dimmi|cos[’']?è|perché|come funziona|descrivi|definisci|confronta|riassumi|traduci)\b/i;

export function isInformationalAgentRequest(task: string) {
  const requestsImplementation = FILE_CREATION_REQUEST.test(task) && !NO_IMPLEMENTATION_REQUEST.test(task);
  return INFORMATIONAL_AGENT_REQUEST.test(task.trim()) && !requestsImplementation;
}

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

  if (!isInformationalAgentRequest(task) && FILE_CREATION_REQUEST.test(task)) {
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

export function parseAgentPlan(response: string) {
  const candidates: string[] = [];
  const fencedBlocks = Array.from(response.matchAll(/```(?:json)?\s*\r?\n([\s\S]*?)```/gi));
  const sources = fencedBlocks.length > 0 ? fencedBlocks.map(block => block[1]) : [response];

  for (const source of sources) {
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
      } else if (character === "{") {
        if (depth === 0) start = index;
        depth += 1;
      } else if (character === "}" && depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          candidates.push(source.slice(start, index + 1));
          start = -1;
        }
      }
    }
  }

  let validJsonFound = false;
  for (const candidate of candidates) {
    let value: unknown;
    try {
      value = JSON.parse(candidate);
    } catch (error) {
      if (error instanceof SyntaxError) continue;
      throw error;
    }
    validJsonFound = true;
    const plan = agentPlanSchema.safeParse(value);
    if (plan.success) return plan.data;
  }

  if (validJsonFound) {
    throw new Error("Il piano dell'Agente non rispetta il formato previsto. Riprova con una richiesta più specifica.");
  }
  if (candidates.length > 0) {
    throw new Error("Il piano dell'Agente non è JSON valido. Riprova con una richiesta più specifica.");
  }
  throw new Error("L'agente pianificatore non ha restituito un piano valido. Riprova con una richiesta più specifica.");
}
