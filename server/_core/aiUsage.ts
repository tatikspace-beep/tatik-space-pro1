import { TRPCError } from "@trpc/server";

export const AI_DAILY_LIMIT = 10;

const aiDailyUsage = new Map<string, { date: string; count: number }>();

export function checkAiDailyLimit(userId: string, unlimited = false) {
  const date = new Date().toISOString().slice(0, 10);
  const current = aiDailyUsage.get(userId);
  const usage = current?.date === date ? current : { date, count: 0 };

  if (unlimited) {
    return { used: usage.count, limit: AI_DAILY_LIMIT, unlimited: true };
  }
  if (usage.count >= AI_DAILY_LIMIT) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Limite giornaliero AI raggiunto (${AI_DAILY_LIMIT} richieste). Riprova domani.`,
    });
  }

  usage.count += 1;
  aiDailyUsage.set(userId, usage);
  return { used: usage.count, limit: AI_DAILY_LIMIT };
}

export function releaseAiDailyUsage(userId: string, unlimited = false) {
  if (unlimited) return;

  const date = new Date().toISOString().slice(0, 10);
  const current = aiDailyUsage.get(userId);
  if (current?.date === date && current.count > 0) {
    current.count -= 1;
  }
}
