import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { filesPageCopy } from '@/lib/filesPageCopy';
import { BarChart3, Lightbulb, Zap, X } from 'lucide-react';

interface GreenBoxContent {
    type: 'stats' | 'tips' | 'affiliate';
    weight: number;
}

interface Stats {
    filesCount: number;
    totalLines: number;
    editingMinutes: number;
    projectSize: string;
}

const affiliateDeals = [
    {
        id: 'deal-1',
        title: '🔒 Snyk Pro',
        originalPrice: '€89',
        discountedPrice: '€29',
        affiliate: 'snyk',
        discount: '66%'
    },
    {
        id: 'deal-2',
        title: '💻 Postman Pro',
        originalPrice: '€99',
        discountedPrice: '€25',
        affiliate: 'postman',
        discount: '75%'
    },
    {
        id: 'deal-3',
        title: '⚡ Vercel Analytics',
        originalPrice: '€149',
        discountedPrice: '€49',
        affiliate: 'vercel',
        discount: '67%'
    }
];

interface GreenBoxHybridProps {
    stats?: Stats;
}

export function GreenBoxHybrid({ stats }: GreenBoxHybridProps) {
    const { language } = useLanguage();
    const copy = filesPageCopy[language].green;
    const [currentType, setCurrentType] = useState<'stats' | 'tips' | 'affiliate'>('stats');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const contentWeights: GreenBoxContent[] = [
        { type: 'stats', weight: 0.15 },
        { type: 'tips', weight: 0.60 },
        { type: 'affiliate', weight: 0.25 }
    ];

    // Scegli content basato su weight
    const getRandomContentType = () => {
        const rand = Math.random();
        let accumulated = 0;

        for (const content of contentWeights) {
            accumulated += content.weight;
            if (rand <= accumulated) {
                return content.type;
            }
        }
        return 'tips';
    };

    // Rotazione ogni 25 secondi
    useEffect(() => {
        const interval = setInterval(() => {
            setFadeOut(true);
            setTimeout(() => {
                const newType = getRandomContentType();
                setCurrentType(newType);

                if (newType === 'tips') {
                    setCurrentIndex(Math.floor(Math.random() * copy.tips.length));
                } else if (newType === 'affiliate') {
                    setCurrentIndex(Math.floor(Math.random() * affiliateDeals.length));
                }
                setFadeOut(false);
            }, 300);
        }, 25000);

        return () => clearInterval(interval);
    }, []);

    const trackInteraction = (action: string) => {
        try {
            fetch('/api/analytics/greenbox-interact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: currentType,
                    action,
                    timestamp: new Date().toISOString()
                })
            }).catch((error) => {
                console.warn('Could not record Files panel interaction:', error);
            });
        } catch (error) {
            console.warn('Could not record Files panel interaction:', error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`bg-slate-700 border border-slate-600 rounded-lg p-4 transition-opacity duration-300 ${fadeOut ? 'opacity-50' : 'opacity-100'}`}>
            {currentType === 'stats' && stats && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 text-slate-300" />
                        <h3 className="text-sm font-semibold text-slate-100">{copy.projectStats}</h3>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between">
                            <span>{copy.filesLabel}</span>
                            <span className="font-medium text-slate-100">{stats.filesCount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{copy.linesLabel}</span>
                            <span className="font-medium text-slate-100">{stats.totalLines}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{copy.editingLabel}</span>
                            <span className="font-medium text-slate-100">{stats.editingMinutes} {copy.minutes}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{copy.sizeLabel}</span>
                            <span className="font-medium text-slate-100">{stats.projectSize}</span>
                        </div>
                    </div>
                </div>
            )}

            {currentType === 'tips' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-slate-100">{copy.tipHeading}</h3>
                    </div>

                    <div className="bg-slate-600/50 rounded p-2.5 border border-slate-500/30">
                        <p className="text-xs font-medium text-slate-50 mb-1">
                            {copy.tips[currentIndex][0]}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            {copy.tips[currentIndex][1]}
                        </p>
                    </div>
                </div>
            )}

            {currentType === 'affiliate' && (
                <div
                    className="space-y-2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                        trackInteraction('click');
                        const deal = affiliateDeals[currentIndex];
                        window.open(
                            `https://${deal.affiliate}.io/?utm_source=tatik-green-box&utm_campaign=${deal.id}`,
                            '_blank',
                            'noopener,noreferrer'
                        );
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-emerald-400" />
                        <h3 className="text-sm font-semibold text-slate-100">{copy.offerHeading}</h3>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/30 to-slate-600/50 rounded p-2.5 border border-emerald-500/30">
                        <p className="text-xs font-semibold text-emerald-300 mb-1">
                            {affiliateDeals[currentIndex].title}
                        </p>
                        <p className="text-xs text-slate-300 mb-2">
                            {copy.dealDescriptions[currentIndex]}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 items-center">
                                <span className="text-xs line-through text-slate-400">
                                    {affiliateDeals[currentIndex].originalPrice}{copy.pricePeriod}
                                </span>
                                <span className="text-sm font-bold text-emerald-300">
                                    {affiliateDeals[currentIndex].discountedPrice}{copy.pricePeriod}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                                {affiliateDeals[currentIndex].discount}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{copy.seeMore}</p>
                    </div>
                </div>
            )}

            {/* Close button */}
            <button
                onClick={() => {
                    setIsVisible(false);
                    trackInteraction('close');
                }}
                className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors"
                title={copy.close}
                aria-label={copy.close}
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
