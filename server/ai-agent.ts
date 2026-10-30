import { z } from "zod";

export const agentPlanSchema = z.object({
  plan: z.string().min(1).max(4000),
  tasks: z.array(z.object({
    role: z.enum(["architect", "frontend", "backend", "qa"]),
    task: z.string().min(1).max(800),
  })).length(2),
});

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
