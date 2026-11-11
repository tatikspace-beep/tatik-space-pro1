export interface ApprovedAgentExample {
  id: string;
  task: string;
  response: string;
  createdAt: number;
}

export const MAX_APPROVED_AGENT_EXAMPLES = 10;
export const MAX_APPROVED_AGENT_EXAMPLE_TASK_LENGTH = 1_000;
export const MAX_APPROVED_AGENT_EXAMPLE_RESPONSE_LENGTH = 6_000;
export const MAX_RETRIEVED_AGENT_EXAMPLES = 3;

export function agentMemoryStorageKey(userId: string | number, projectId: number) {
  return `tatik.agent.examples.v1.${encodeURIComponent(String(userId))}.${projectId}`;
}

export function parseApprovedAgentExamples(serialized: string | null): ApprovedAgentExample[] {
  if (!serialized) return [];
  let value: unknown;
  try {
    value = JSON.parse(serialized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("La memoria locale dell'Agente non è leggibile.");
    }
    throw error;
  }
  if (!Array.isArray(value)) {
    throw new Error("La memoria locale dell'Agente ha un formato non valido.");
  }
  return value
    .filter((example): example is ApprovedAgentExample =>
      Boolean(example)
      && typeof example === "object"
      && typeof example.id === "string"
      && typeof example.task === "string"
      && typeof example.response === "string"
      && typeof example.createdAt === "number"
      && example.task.trim().length > 0
      && example.task.length <= MAX_APPROVED_AGENT_EXAMPLE_TASK_LENGTH
      && example.response.trim().length > 0
      && example.response.length <= MAX_APPROVED_AGENT_EXAMPLE_RESPONSE_LENGTH,
    )
    .slice(0, MAX_APPROVED_AGENT_EXAMPLES);
}

export function addApprovedAgentExample(
  examples: ApprovedAgentExample[],
  task: string,
  response: string,
  createdAt = Date.now(),
) {
  const cleanTask = task.trim();
  const cleanResponse = response.trim();
  if (!cleanTask || !cleanResponse) {
    throw new Error("Richiesta e risposta devono essere entrambe presenti.");
  }
  if (cleanTask.length > MAX_APPROVED_AGENT_EXAMPLE_TASK_LENGTH
    || cleanResponse.length > MAX_APPROVED_AGENT_EXAMPLE_RESPONSE_LENGTH) {
    throw new Error("Questo risultato è troppo lungo per essere salvato come esempio.");
  }
  const example = {
    id: `${createdAt}-${Math.random().toString(36).slice(2, 10)}`,
    task: cleanTask,
    response: cleanResponse,
    createdAt,
  };
  const withoutDuplicate = examples.filter(item =>
    item.task !== cleanTask || item.response !== cleanResponse,
  );
  return [example, ...withoutDuplicate].slice(0, MAX_APPROVED_AGENT_EXAMPLES);
}

function taskTerms(task: string) {
  return new Set(task.toLocaleLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []);
}

export function selectRelevantAgentExamples(
  examples: ApprovedAgentExample[],
  task: string,
  limit = MAX_RETRIEVED_AGENT_EXAMPLES,
) {
  const terms = taskTerms(task);
  if (terms.size === 0) return [];

  return examples
    .map(example => {
      const exampleTerms = taskTerms(example.task);
      const overlap = [...terms].filter(term => exampleTerms.has(term)).length;
      return { example, score: overlap / terms.size };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.example.createdAt - a.example.createdAt)
    .slice(0, limit)
    .map(({ example }) => ({ task: example.task, response: example.response }));
}
