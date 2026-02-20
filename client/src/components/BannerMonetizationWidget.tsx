import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export default function BannerMonetizationWidget() {
    const [showCelebration, setShowCelebration] = useState(false);
    const { data, isLoading, error, refetch } = trpc.user.monetizationProgress.useQuery(undefined, {
        retry: 1,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });
    const { user } = useAuth();

    useEffect(() => {
        // Show celebration if just completed
        if (data?.isCompleted && data?.percentage >= 100) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 5000);
        }
    }, [data?.isCompleted, data?.percentage]);

    // Don't render if error - but still show loading state
    if (error) {
        return (
            <div className="w-full p-2 text-xs text-red-600 bg-red-500/10 rounded border border-red-500/30">
                Errore caricamento
            </div>
        );
    }

    // Show loading state
    if (isLoading || !data) {
        return (
            <div className="w-full space-y-2 p-3 border-t border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded">
                <div className="animate-pulse space-y-1.5">
                    <div className="h-2 bg-secondary rounded-full w-1/2"></div>
                    <div className="h-3 bg-secondary rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    const progressPercentage = Math.min(data.percentage, 100);

    return (
        <div className="w-full space-y-2 p-3 border-t border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded">
            {/* Progress indicator with percentage */}
            <div className="space-y-1.5">
                {/* Progress bar */}
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>

                {/* Percentage and days remaining */}
                <div className="flex items-center justify-between gap-3 px-0.5">
                    <div className="flex flex-col gap-0">
                        <span className="text-xs font-bold text-primary">
                            {Math.round(progressPercentage)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {data.daysRemaining} giorni
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-1 hover:bg-accent rounded transition-colors opacity-60 hover:opacity-100"
                            title="Aggiorna"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        {/* dev test UI removed — widget is auto-updating for admin profile only */}
                    </div>
                </div>
            </div>

            {/* Celebration Message - only visible at 100% */}
            {showCelebration && data.isCompleted && data.percentage >= 100 && (
                <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-xs font-bold text-green-500 text-center animate-pulse">
                    🎉 COMPLIMENTI! HAI SBLOCCATO LO SCONTO!
                </div>
            )}

            {/* Permanent Completion Message */}
            {data.isCompleted && data.percentage >= 100 && !showCelebration && (
                <div className="mt-2 p-2 bg-green-500/5 border border-green-500/20 rounded-lg text-xs font-bold text-green-600 text-center">
                    ✓ Sconto Sbloccato
                </div>
            )}
        </div>
    );
}
