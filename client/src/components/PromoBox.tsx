import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface PromoBoxProps {
    trialDaysLeft?: number;
}

export function PromoBox({ trialDaysLeft = 60 }: PromoBoxProps) {
    const { t } = useTranslation();

    return (
        <div className="w-full h-20 md:h-24 lg:h-28 flex items-center justify-between border-t border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6">
            <div className="flex items-center gap-6">
                <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">{t('freeTrialLabel')}</span>

                <div className="flex items-center gap-2">
                    <span style={{ color: '#60a5fa' }} className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">{trialDaysLeft}</span>
                    <span className="text-sm md:text-base text-white">{t('days')}</span>
                </div>

                <span className="text-sm md:text-lg font-semibold text-slate-100">{t('plan')}</span>
            </div>

            <div className="flex items-center">
                <Button
                    size="sm"
                    className="h-10 md:h-12 px-5 md:px-6 text-sm md:text-base font-semibold shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        color: 'white',
                        border: 'none'
                    }}
                    onClick={() => toast.info('Upgrade in sviluppo...')}
                >
                    {t('upgradeToPro')}
                </Button>
            </div>
        </div>
    );
}
