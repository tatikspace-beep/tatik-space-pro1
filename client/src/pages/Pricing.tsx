import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';
import { commercialSeoCopy } from '@/lib/commercialSeoCopy';
import { pricingPageCopy } from '@/lib/pricingPageCopy';
import { pricingUiLabels } from '@/lib/pricingUiLabels';
import { pricingDetailsCopy } from '@/lib/pricingDetailsCopy';

export default function Pricing() {
    const { language } = useLanguage();
    const copy = commercialSeoCopy[language] ?? commercialSeoCopy.en;
    const pageCopy = pricingPageCopy[language] ?? pricingPageCopy.en;
    const labels = pricingUiLabels[language] ?? pricingUiLabels.en;
    const details = pricingDetailsCopy[language] ?? pricingDetailsCopy.en;
    const formatEuro = (amount: number) =>
        new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(amount);
    const { data: pricingStatus, isLoading } = trpc.pricing.getPricingStatus.useQuery(undefined, {
        retry: 1,
        refetchInterval: 60000,
    });

    const startSubMutation = trpc.pricing.startProSubscription.useMutation();

    const [, setLocation] = useLocation();

    const handleStartPro = async () => {
        try {
            const res = await startSubMutation.mutateAsync();
            if (res?.success) {
                // Redirect user to account/billing page (or refresh)
                setLocation('/account');
            } else {
                console.error('Failed to start subscription:', res?.reason);
                // fallback: notify user
                alert(pageCopy.paymentError);
            }
        } catch (e) {
            console.error('Error starting subscription:', e);
            alert('Errore nell\'attivazione dell\'abbonamento');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
                <div className="container px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">{labels.pageTitle}</h1>
                        <Link href="/">
                            <Button variant="outline">{labels.backToHome}</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-2">{copy.pricingHeading}</h2>
                    <p className="text-muted-foreground text-center mb-12">
                        {copy.pricingIntro}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Trial - 60 giorni */}
                        <Card className="p-6 border-2 border-blue-500/30 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {isLoading
                                    ? labels.loading
                                    : pricingStatus?.inTrial
                                        ? labels.trialActive
                                        : pricingStatus?.status === 'school_access'
                                            ? pageCopy.schoolStatus
                                            : pricingStatus?.subscriptionTier === 'pro'
                                                ? pageCopy.subscriptionStatus
                                                : labels.trialEnded}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{labels.trialPlanTitle}</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold">{formatEuro(0)}</span>
                                <span className="text-muted-foreground">{labels.trialPriceUnit}</span>
                            </div>

                            {!isLoading && pricingStatus?.inTrial && (
                                <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-700 dark:text-blue-300">
                                    ⏱️ {labels.daysLeft.replace('{days}', String(pricingStatus.trialDaysRemaining))}
                                </div>
                            )}

                            <ul className="space-y-3 mb-6 text-sm">
                                {details.trialHighlights.map((item) => (
                                    <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{item}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-muted-foreground">{pageCopy.trialDetails}</p>
                            <Button className="w-full mt-4" variant="outline" disabled>
                                {labels.startFree}
                            </Button>
                        </Card>

                        {/* Pro - €5.99 primo mese, poi €7.99 */}
                        <Card className="p-6 border-2 border-primary relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                {labels.recommended}
                            </div>
                            <h3 className="text-xl font-bold mb-2">Pro</h3>
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{formatEuro(5.99)}</span>
                                    <span className="text-sm text-muted-foreground">{labels.firstMonthUnit}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {labels.thenLabel} <span className="font-semibold">{formatEuro(7.99)}/{labels.month}</span>
                                </div>
                            </div>

                            {!isLoading && pricingStatus?.status === 'school_access' && (
                                <div className="mb-4 p-2 bg-primary/10 border border-primary/30 rounded text-sm text-primary">
                                    ✓ {pageCopy.schoolStatus}
                                </div>
                            )}
                            {!isLoading && pricingStatus?.subscriptionTier === 'pro' && pricingStatus?.status !== 'school_access' && (
                                <div className="mb-4 p-2 bg-primary/10 border border-primary/30 rounded text-sm text-primary">
                                    ✓ {pageCopy.subscriptionStatus}
                                </div>
                            )}

                            <ul className="space-y-3 mb-6 text-sm">
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{labels.advancedEditor}</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{labels.prioritySupport}</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{labels.usageSavings}</li>
                                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{labels.advancedAnalytics}</li>
                                <li className="text-xs text-muted-foreground">{pageCopy.bonusCap}</li>
                            </ul>

                            {!isLoading && (
                                <>
                                    {pricingStatus?.inTrial ? (
                                        <Button
                                            className="w-full"
                                            onClick={handleStartPro}
                                            disabled={startSubMutation.isPending}
                                        >
                                            {startSubMutation.isPending ? labels.loading : labels.stripeButton}
                                        </Button>
                                    ) : pricingStatus?.status === 'school_access' ? (
                                        <Link href="/schools">
                                            <Button className="w-full" variant="outline">{pageCopy.schoolStatus}</Button>
                                        </Link>
                                    ) : pricingStatus?.subscriptionTier === 'pro' ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            Già abbonato
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={handleStartPro}
                                            disabled={startSubMutation.isPending}
                                        >
                                            {startSubMutation.isPending ? labels.loading : labels.stripeButton}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Card>

                        {/* Free plan after the trial */}
                        <Card className="p-6 border-2 border-border opacity-75">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {labels.afterTrial}
                            </div>
                            <h3 className="text-xl font-bold mb-2 mt-2">Free (Limitato)</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold">{formatEuro(0)}</span>
                                <span className="text-muted-foreground">/{labels.month}</span>
                            </div>

                            <div className="mb-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>{pageCopy.freeAfterTrial}</span>
                            </div>
                            <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-muted-foreground/50" />
                                    <span>✓ Backup locale solamente</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="opacity-50">✗ Assistente AI disabilitato</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="opacity-50">✗ Collaborazione disabilitata</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="opacity-50">✗ Backup online bloccato</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="opacity-50">✗ Features premium bloccate</span>
                                </li>
                            </ul>
                            <Button className="w-full" variant="outline" disabled>{labels.freePlanButton}</Button>
                        </Card>
                    </div>

                    <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            ⭐ {pageCopy.bonusHeading}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">{pageCopy.bonusExplanation}</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">{details.bonusHowToTitle}</h4>
                                <ul className="space-y-2 text-sm">
                                    {details.bonusSteps.map((step, index) => (
                                        <li key={step} className="flex gap-2">
                                            <span className="text-blue-600 font-bold">{index + 1}.</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 italic">📌 {pageCopy.bonusCap}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">{details.subscriptionExampleTitle}</h4>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded border border-blue-200 dark:border-blue-800 text-sm space-y-2 font-mono">
                                    {details.bonusExample.map((step, index) => (
                                        <p
                                            key={step}
                                            className={index === 1 || index === 3 ? "text-blue-600" : index === 4 ? "font-bold text-green-600" : ""}
                                        >
                                            {step}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-gradient-to-r from-green-100/90 to-emerald-100/90 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-500/80 dark:border-green-500/60 rounded-lg p-4 shadow-lg">
                            <p className="text-base font-bold text-green-900 dark:text-green-50 flex items-center gap-2">
                                ⚡ <span>{details.bonusTagline}</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-secondary/30 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">📋 {details.allTrialFeaturesTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {details.allTrialFeatures.map((feature, index) => (
                                <div key={feature} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${index < 3 ? "bg-blue-500" : index < 6 ? "bg-purple-500" : index < 9 ? "bg-green-500" : "bg-primary"}`} />
                                    <span>✓ {feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <h3 className="text-lg font-semibold mb-4">{labels.contactTitle}</h3>
                        <p className="text-muted-foreground mb-6">
                            {pageCopy.contactIntro}
                        </p>
                        <Link href="/contact">
                            <Button>{labels.contactTitle}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
