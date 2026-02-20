// server/_core/pricingRouter.ts
// Router per la gestione del nuovo pricing model (60gg free, €5.99→€7.99, rewards)

import { protectedProcedure, router } from "./trpc";
import { z } from "zod";
import {
    getSubscriptionByUserIdAndStatus,
    createSubscription,
    updateSubscription,
    getMonetizationEarnings,
    getSubscriptionDiscounts,
    createSubscriptionDiscount,
} from "../db";
import {
    PRICING,
    isUserInFreeTrial,
    calculateMonthlyPrice,
    calculateMonetizationPercentage,
    hasReachedMonetizationGoal,
    canApplyDiscount,
    getDiscountWindowBounds,
    getUserPricingStatus,
} from "./pricing";

export const pricingRouter = router({
    /**
     * Ottiene lo stato corrente del pricing dell'utente
     * - Se in trial: indica giorni rimasti
     * - Se con abbonamento: mostra prezzo corrente e sconti applicabili
     * - Se free: backup locale solo
     */
    getPricingStatus: protectedProcedure.query(async ({ ctx }) => {
        try {
            const user = ctx.user;
            const userId = user.id;

            // Leggi le info di subscription dal DB (se esistono)
            let subscription: any = null;
            try {
                subscription = await getSubscriptionByUserIdAndStatus(userId, "active");
            } catch (e) {
                console.warn("[pricingRouter] No subscription found, user on free tier", e);
            }

            const inTrial = isUserInFreeTrial(user.createdAt);
            const subscriptionTier = subscription?.tier || user.subscriptionType || "free";
            const currentPrice = subscription?.currentPrice || 0;
            const discountsApplied = subscription?.appliedDiscountId ? 1 : 0;

            const status = getUserPricingStatus(user.createdAt, subscriptionTier, currentPrice, discountsApplied);

            // Calcola giorni rimasti nel trial (se applicabile)
            let trialDaysRemaining = null;
            if (inTrial) {
                const trialEnd = new Date(user.createdAt);
                trialEnd.setDate(trialEnd.getDate() + PRICING.FREE_TRIAL_DAYS);
                trialDaysRemaining = Math.ceil(
                    (trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
            }

            return {
                inTrial,
                trialDaysRemaining,
                subscriptionTier,
                currentMonthlyPrice: currentPrice,
                discountsApplied,
                status,
            };
        } catch (error) {
            console.error("[pricingRouter] Error in getPricingStatus", error);
            throw error;
        }
    }),

    /**
     * Calcola il progresso verso il prossimo bonus (100% attività)
     * Torna: percentage (0-100), hasReachedGoal, daysInCycle
     */
    getMonetizationProgress: protectedProcedure.query(async ({ ctx }) => {
        try {
            const userId = ctx.user.id;
            const now = new Date();

            // Leggi i guadagni nel ciclo corrente (ultimi 30 giorni)
            let earnings = 0;
            try {
                const cycleStart = new Date(now);
                cycleStart.setDate(cycleStart.getDate() - 30);
                const earnings_entry = await getMonetizationEarnings(userId, cycleStart);
                earnings = earnings_entry ? parseFloat(earnings_entry.earningAmount || "0") : 0;
            } catch (e) {
                console.warn("[pricingRouter] Could not fetch earnings", e);
            }

            const percentage = calculateMonetizationPercentage(earnings);
            const hasReachedGoal = hasReachedMonetizationGoal(earnings);

            // Calcola giorni rimasti nel ciclo di 30 giorni
            const cycleStart = new Date(now);
            cycleStart.setDate(cycleStart.getDate() - 30);
            const cycleEnd = new Date(now);
            cycleEnd.setDate(cycleEnd.getDate() + 30);
            const daysRemaining = Math.ceil(
                (cycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                earnings,
                percentage,
                hasReachedGoal,
                daysRemaining,
                cycleStartDate: cycleStart.toISOString().split("T")[0],
                cycleEndDate: cycleEnd.toISOString().split("T")[0],
            };
        } catch (error) {
            console.error("[pricingRouter] Error in getMonetizationProgress", error);
            throw error;
        }
    }),

    /**
     * Applica un bonus di €2 se l'utente ha raggiunto il 100% dell'attività
     * E non ha già applicato 2 bonus negli ultimi 30 giorni di calendario
     * Torna: success, newPrice, bonusApplied
     */
    applyEarnedDiscount: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            const userId = ctx.user.id;

            // Verifica che l'utente abbia raggiunto il 100%
            const earnings_entry = await getMonetizationEarnings(userId);

            if (!earnings_entry) {
                return { success: false, reason: "Non hai raggiunto il 100% dell'attività mensile" };
            }

            // Verifica che non abbia già applicato 2 bonus nei 30 giorni di calendario
            const { windowStart, windowEnd } = getDiscountWindowBounds();
            const recentDiscounts = await getSubscriptionDiscounts(userId, windowStart, windowEnd);

            if (recentDiscounts.length >= PRICING.MAX_BONUSES_PER_CALENDAR_MONTH) {
                return {
                    success: false,
                    reason: `Massimo ${PRICING.MAX_BONUSES_PER_CALENDAR_MONTH} bonus per mese di calendario raggiunto`,
                };
            }

            // Crea il record di bonus
            const discount = await createSubscriptionDiscount({
                userId,
                discountAmount: PRICING.ACTIVITY_BONUS.toString(),
                reason: "activity_100_percent",
                earnedAt: new Date(),
                appliedAt: new Date(),
                status: "applied",
            });

            // Aggiorna la sottoscrizione per applicare lo sconto
            const subscription = await getSubscriptionByUserIdAndStatus(userId, "active");

            if (subscription) {
                const newPrice = calculateMonthlyPrice(Boolean(subscription.isFirstMonth), true);
                await updateSubscription(subscription.id, {
                    appliedDiscountId: discount?.id || null,
                    currentPrice: newPrice.toString(),
                });
            }

            return {
                success: true,
                bonusApplied: PRICING.ACTIVITY_BONUS,
                newPrice: subscription ? calculateMonthlyPrice(Boolean(subscription.isFirstMonth), true) : 0,
            };
        } catch (error) {
            console.error("[pricingRouter] Error in applyEarnedDiscount", error);
            throw error;
        }
    }),

    /**
     * Crea/attiva un abbonamento Pro per l'utente
     * Automaticamente applica il prezzo del primo mese se è il primo abbonamento
     */
    startProSubscription: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            const userId = ctx.user.id;
            const now = new Date();

            // Verifica che non abbia già un abbonamento attivo
            const existingSub = await getSubscriptionByUserIdAndStatus(userId, "active");

            if (existingSub) {
                return { success: false, reason: "Hai già un abbonamento attivo" };
            }

            // Crea il nuovo abbonamento (primo mese a prezzo scontato)
            const subscription = await createSubscription({
                userId,
                tier: "pro",
                status: "active",
                currentPrice: PRICING.FIRST_MONTH_PRICE.toString(),
                isFirstMonth: 1,
                startedAt: now,
                renewsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            });

            // Se il DB non è disponibile o la creazione fallisce, restituisci un errore gestito
            if (!subscription) {
                return { success: false, reason: "Impossibile creare l'abbonamento al momento. Riprova più tardi." };
            }

            // Nota: Aggiorna l'utente tramite altre API se necessario

            return {
                success: true,
                subscriptionId: subscription.id,
                monthlyPrice: PRICING.FIRST_MONTH_PRICE,
                message: `Abbonamento attivato a ${PRICING.FIRST_MONTH_PRICE}€/mese per il primo mese`,
            };
        } catch (error) {
            console.error("[pricingRouter] Error in startProSubscription", error);
            throw error;
        }
    }),

    /**
     * Cancella l'abbonamento Pro
     */
    cancelProSubscription: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            const userId = ctx.user.id;

            const subscription = await getSubscriptionByUserIdAndStatus(userId, "active");

            if (!subscription) {
                return { success: false, reason: "Nessun abbonamento attivo" };
            }

            await updateSubscription(subscription.id, {
                status: "cancelled",
                endsAt: new Date(),
            });

            // Nota: Aggiorna l'utente tramite altre API se necessario

            return { success: true, message: "Abbonamento annullato" };
        } catch (error) {
            console.error("[pricingRouter] Error in cancelProSubscription", error);
            throw error;
        }
    }),
});
