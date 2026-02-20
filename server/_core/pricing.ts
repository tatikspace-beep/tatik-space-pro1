// server/_core/pricing.ts
// Nuova logica di pricing: 60 giorni gratuiti, poi abbonamento con sistema reward attività

export const PRICING = {
    FREE_TRIAL_DAYS: 60,
    FIRST_MONTH_PRICE: 5.99, // €5.99 primo mese
    REGULAR_PRICE: 7.99, // €7.99 dal secondo mese
    ACTIVITY_BONUS: 2.00, // €2 di sconto per raggiungere 100% attività
    ACTIVITY_GOAL: 6.00, // Soglia interna di attività (non mostrata all'utente)
    MAX_BONUSES_PER_CALENDAR_MONTH: 2, // Max 2 bonus per mese di calendario (30 giorni)
};

/**
 * Verifica se l'utente è in trial gratuito
 */
export function isUserInFreeTrial(trialStartedAt: Date | null): boolean {
    if (!trialStartedAt) return true; // Nuovo utente = in trial
    const trialEndDate = new Date(trialStartedAt);
    trialEndDate.setDate(trialEndDate.getDate() + PRICING.FREE_TRIAL_DAYS);
    return new Date() < trialEndDate;
}

/**
 * Calcola il prezzo corrente per la sottoscrizione
 * - Se è il primo mese: €5.99
 * - Altrimenti: €7.99
 * - Se ha bonus applicato: sottrai €2.00
 */
export function calculateMonthlyPrice(
    isFirstMonth: boolean,
    hasDiscount: boolean = false
): number {
    const basePrice = isFirstMonth ? PRICING.FIRST_MONTH_PRICE : PRICING.REGULAR_PRICE;
    const discount = hasDiscount ? PRICING.ACTIVITY_BONUS : 0;
    return Math.max(0, basePrice - discount);
}

/**
 * Calcola la percentuale di attività raggiunta (0-100%)
 * earnings / ACTIVITY_GOAL * 100, capped a 100
 */
export function calculateMonetizationPercentage(earnings: number): number {
    const percentage = Math.round((earnings / PRICING.ACTIVITY_GOAL) * 100);
    return Math.min(percentage, 100);
}

/**
 * Determina se l'utente ha raggiunto il 100% e merita un bonus
 */
export function hasReachedMonetizationGoal(earnings: number): boolean {
    return earnings >= PRICING.ACTIVITY_GOAL;
}

/**
 * Determina se l'utente può applicare un bonus nel ciclo corrente
 * (max 2 bonus per 30 giorni di calendario)
 */
export function canApplyDiscount(
    bonusesAppliedInCurrentWindow: number
): boolean {
    return bonusesAppliedInCurrentWindow < PRICING.MAX_BONUSES_PER_CALENDAR_MONTH;
}

/**
 * Calcola i limiti della finestra di 30 giorni per i bonus
 */
export function getDiscountWindowBounds(referenceDate: Date = new Date()): {
    windowStart: Date;
    windowEnd: Date;
} {
    const windowStart = new Date(referenceDate);
    windowStart.setDate(windowStart.getDate() - 30);

    const windowEnd = new Date(referenceDate);
    windowEnd.setDate(windowEnd.getDate() + 30);

    return { windowStart, windowEnd };
}

/**
 * Formatta il prezzo con simbolo €
 */
export function formatPrice(price: number): string {
    return `€${price.toFixed(2)}`;
}

/**
 * Determina la visibilità delle feature in base allo stato dell'utente
 */
export function getFeatureVisibility(userTier: "free" | "pro", isInTrial: boolean) {
    if (isInTrial) {
        // Durante i 60 giorni: TUTTO completo
        return {
            backupOnline: true,
            aiAssistant: true,
            collaboration: true,
            advancedEditor: true,
        };
    }

    if (userTier === "free") {
        // Dopo trial scaduto, senza abbonamento: solo backup locale
        return {
            backupOnline: false,
            aiAssistant: false,
            collaboration: false,
            advancedEditor: false,
        };
    }

    if (userTier === "pro") {
        // Con abbonamento: TUTTO abilitato
        return {
            backupOnline: true,
            aiAssistant: true,
            collaboration: true,
            advancedEditor: true,
        };
    }

    return {
        backupOnline: false,
        aiAssistant: false,
        collaboration: false,
        advancedEditor: false,
    };
}

/**
 * Determina lo stato attuale dell'utente per debugging/log
 */
export function getUserPricingStatus(
    trialStartedAt: Date | null,
    subscriptionTier: string,
    currentPrice: number,
    appliedBonuses: number
): string {
    const inTrial = isUserInFreeTrial(trialStartedAt);

    if (inTrial) {
        const trialEnd = new Date(trialStartedAt || new Date());
        trialEnd.setDate(trialEnd.getDate() + PRICING.FREE_TRIAL_DAYS);
        const daysLeft = Math.ceil(
            (trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return `[Trial] ${daysLeft} giorni rimasti`;
    }

    if (subscriptionTier === "pro") {
        return `[Pro] €${currentPrice.toFixed(2)}/mese (bonus applicati: ${appliedBonuses})`;
    }

    return "[Free] Non abbonato (backup solo locale)";
}
