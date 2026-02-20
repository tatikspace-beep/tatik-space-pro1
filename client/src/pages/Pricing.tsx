import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Pricing() {
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
                alert(res?.reason || 'Errore nell\'attivazione dell\'abbonamento');
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
                        <h1 className="text-2xl font-bold">Pricing</h1>
                        <Link href="/">
                            <Button variant="outline">Torna alla Home</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-2">Scegli il tuo piano</h2>
                    <p className="text-muted-foreground text-center mb-12">
                        Inizia gratuitamente con 60 giorni completi. Nessuna carta di credito richiesta.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Trial - 60 giorni */}
                        <Card className="p-6 border-2 border-blue-500/30 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {pricingStatus?.inTrial ? 'ATTUALMENTE ATTIVO' : 'SCADUTO'}
                            </div>
                            <h3 className="text-xl font-bold mb-2">Free Trial</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold">€0</span>
                                <span className="text-muted-foreground">/mese per 60 giorni</span>
                            </div>

                            {!isLoading && pricingStatus?.inTrial && (
                                <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-700 dark:text-blue-300">
                                    ⏱️ {pricingStatus.trialDaysRemaining} giorni rimasti
                                </div>
                            )}

                            <ul className="space-y-3 mb-6 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Tutto completo senza restrizioni</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Backup online illimitato</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Assistente AI completo</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Collaborazione in tempo reale</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Editor avanzato</span>
                                </li>
                            </ul>
                            <Button className="w-full" variant="outline" disabled>
                                Goditi il Trial Gratuito
                            </Button>
                        </Card>

                        {/* Pro - €5.99 primo mese, poi €7.99 */}
                        <Card className="p-6 border-2 border-primary relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                                CONSIGLIATO
                            </div>
                            <h3 className="text-xl font-bold mb-2">Pro</h3>
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">€5.99</span>
                                    <span className="text-muted-foreground text-sm">/mese (1° mese)</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    poi <span className="font-semibold">€7.99/mese</span>
                                </div>
                            </div>

                            {!isLoading && pricingStatus?.subscriptionTier === 'pro' && (
                                <div className="mb-4 p-2 bg-primary/10 border border-primary/30 rounded text-sm text-primary">
                                    ✓ Abbonamento attivo
                                </div>
                            )}

                            <ul className="space-y-3 mb-6 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Tutte le features del trial</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Supporto prioritario</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Bonus sconto per attività costante</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>Analytics avanzate</span>
                                </li>
                                <li className="text-xs text-muted-foreground italic">
                                    Massimo 2 bonus per mese di calendario (30 giorni)
                                </li>
                            </ul>

                            {!isLoading && (
                                <>
                                    {pricingStatus?.inTrial ? (
                                        <Button
                                            className="w-full"
                                            onClick={handleStartPro}
                                            disabled={startSubMutation.isPending}
                                        >
                                            {startSubMutation.isPending ? 'Attivazione...' : 'Passa a Pro (€5.99/mese)'}
                                        </Button>
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
                                            {startSubMutation.isPending ? 'Attivazione...' : 'Attiva Pro'}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Card>

                        {/* Free (Post-Trial Gratuito) */}
                        <Card className="p-6 border-2 border-border opacity-75">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                DOPO TRIAL
                            </div>
                            <h3 className="text-xl font-bold mb-2 mt-2">Free (Limitato)</h3>
                            <div className="mb-4">
                                <span className="text-3xl font-bold">€0</span>
                                <span className="text-muted-foreground">/mese</span>
                            </div>

                            <div className="mb-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>Automatico dopo i 60 giorni di trial</span>
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
                            <Button className="w-full" variant="outline" disabled>
                                Piano Automatico
                            </Button>
                        </Card>
                    </div>

                    {/* Bonus per Costanza e Attività */}
                    <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            ⭐ Bonus per Attività: Sblocca Sconto
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Come guadagni il bonus:</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 font-bold">1.</span>
                                        <span>Usa la piattaforma con <strong>costanza</strong></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 font-bold">2.</span>
                                        <span>Accumula attività e partecipazione</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 font-bold">3.</span>
                                        <span>Quando raggiungi il <strong>100%</strong> = ricevi <strong>€2 di sconto</strong></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 font-bold">4.</span>
                                        <span>Automaticamente applicato al rinnovo mensile</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 italic">
                                    📌 Massimo 2 bonus per mese di calendario (30 giorni)
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Esempio di abbonamento:</h4>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded border border-blue-200 dark:border-blue-800 text-sm space-y-2 font-mono">
                                    <p><span className="text-amber-600">Primo Mese:</span> €5.99</p>
                                    <p className="text-blue-600">✓ Raggiungi il 100% di attività</p>
                                    <p><span className="text-amber-600">Mese Successivo:</span> €5.99 <span className="text-gray-500">(€7.99 - €2 bonus)</span></p>
                                    <p className="text-blue-600">✓ Raggiungi ulteriori 100% di attività</p>
                                    <p><span className="text-green-600 font-bold">→ €3.99</span> <span className="text-gray-500">(€7.99 - €2×2 bonus)</span></p>
                                    <p className="text-xs text-muted-foreground mt-2">Ciclo mensile ricomincia</p>
                                    <p><span className="text-amber-600">Mese Successivo:</span> €7.99 (se non raggiungi il 100%)</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-gradient-to-r from-green-100/90 to-emerald-100/90 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-500/80 dark:border-green-500/60 rounded-lg p-4 shadow-lg">
                            <p className="text-base font-bold text-green-900 dark:text-green-50 flex items-center gap-2">
                                ⚡ <span>Attività premiata: <strong>più usi = più risparmi</strong>. Non lasciarlo sfuggire!</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-secondary/30 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">📋 Tutte le features incluse nel Trial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>✓ Editor Avanzato (CodeMirror)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>✓ Syntax highlighting 50+ linguaggi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>✓ Anteprima real-time</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>✓ AI Co-pilot (genera codice)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>✓ Correzione bug con AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>✓ Ottimizzazione progetti</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>✓ Backup locali e online</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>✓ Cronologia versioni completa (in sviluppo)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>✓ 2FA e sicurezza avanzata</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span>✓ Gestione file e cartelle</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span>✓ Temi personalizzabili (in sviluppo)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <span>✓ Esportazione progetti</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <h3 className="text-lg font-semibold mb-4">Domande sul pricing?</h3>
                        <p className="text-muted-foreground mb-6">
                            Contattaci per informazioni su piani enterprise, pricing bulk, o esigenze specifiche.
                        </p>
                        <Link href="/contact">
                            <Button>Contatta il Team Vendite</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
