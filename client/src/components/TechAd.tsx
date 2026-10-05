import { useState, useEffect } from 'react';
import { X, Shield, Code2, Zap, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getComponentCopy, type TechAdId } from '@/lib/assistantUiCopy';

interface Ad {
    id: TechAdId;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    affiliateUrl?: string;
    category: 'affiliate' | 'adnetwork' | 'internal';
}

function hasMarketingConsent() {
    try {
        const value = localStorage.getItem('tatik-cookie-consent-details');
        return value ? JSON.parse(value).marketing === true : false;
    } catch {
        return false;
    }
}

const techAds: Ad[] = [
    {
        id: 'security-1',
        title: '🔒 Sicurezza',
        description: 'Vulnerabilità nel codice',
        icon: <Shield className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://snyk.io/?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=code-security',
        category: 'affiliate'
    },
    {
        id: 'security-2',
        title: '🛡️ Protezione',
        description: 'Backup con crittografia',
        icon: <Lock className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://1password.com/?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=encryption',
        category: 'affiliate'
    },
    {
        id: 'dev-tools-1',
        title: '⚡ Performance',
        description: 'Analisi velocità',
        icon: <Zap className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://vercel.com/analytics?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=performance',
        category: 'affiliate'
    },
    {
        id: 'dev-tools-2',
        title: '💻 API Testing',
        description: 'Test REST API',
        icon: <Code2 className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://www.postman.com/?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=api-testing',
        category: 'affiliate'
    },
    {
        id: 'alert-1',
        title: '🚨 Errori',
        description: 'Monitoraggio real-time',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://sentry.io/?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=error-tracking',
        category: 'affiliate'
    },
    {
        id: 'code-quality',
        title: '✨ Qualità',
        description: 'Suggerimenti codice',
        icon: <Code2 className="h-4 w-4" />,
        color: 'text-slate-300',
        bgColor: 'bg-slate-700 dark:bg-slate-700',
        affiliateUrl: 'https://www.github.com/features/copilot?utm_source=tatik-space&utm_medium=floating-ad&utm_campaign=code-quality',
        category: 'affiliate'
    }
];

export function TechAd() {
    const { language } = useLanguage();
    const copy = getComponentCopy(language).techAd;
    const [currentAd, setCurrentAd] = useState<Ad | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [showAnimation, setShowAnimation] = useState(false);

    // Track ad impression
    const trackImpression = (ad: Ad) => {
        if (!hasMarketingConsent()) return;
        try {
            // Google Analytics 4
            if ((window as any).gtag) {
                (window as any).gtag('event', 'ad_impression', {
                    ad_id: ad.id,
                    ad_category: ad.category,
                    ad_title: ad.title
                });
            }
            // Fallback: send to analytics endpoint
            fetch('/api/analytics/ad-impression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adId: ad.id,
                    category: ad.category,
                    timestamp: new Date().toISOString()
                })
            }).catch(e => console.log('[Ad] Impression tracked'));
        } catch (e) {
            // Silent fail
        }
    };

    // Track ad click
    const trackClick = (ad: Ad) => {
        if (!hasMarketingConsent()) return;
        try {
            if ((window as any).gtag) {
                (window as any).gtag('event', 'ad_click', {
                    ad_id: ad.id,
                    ad_category: ad.category,
                    ad_title: ad.title
                });
            }
            fetch('/api/analytics/ad-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adId: ad.id,
                    category: ad.category,
                    timestamp: new Date().toISOString()
                })
            }).catch(e => console.log('[Ad] Click tracked'));
        } catch (e) {
            // Silent fail
        }
    };

    // Mostra un annuncio casuale al mounting
    useEffect(() => {
        const randomAd = techAds[Math.floor(Math.random() * techAds.length)];
        setCurrentAd(randomAd);
        setShowAnimation(true);
        if (randomAd) trackImpression(randomAd);
    }, []);

    // Cambia annuncio ogni 25 secondi
    useEffect(() => {
        if (!isVisible) return;

        const rotationInterval = setInterval(() => {
            const randomAd = techAds[Math.floor(Math.random() * techAds.length)];
            setShowAnimation(false);
            setTimeout(() => {
                setCurrentAd(randomAd);
                setShowAnimation(true);
                if (randomAd) trackImpression(randomAd);
            }, 300);
        }, 25000);

        return () => clearInterval(rotationInterval);
    }, [isVisible]);

    const handleAdClick = () => {
        if (currentAd) {
            trackClick(currentAd);
            if (currentAd.affiliateUrl) {
                window.open(currentAd.affiliateUrl, '_blank', 'noopener,noreferrer');
            }
        }
    };

    if (!isVisible || !currentAd) return null;
    const localizedAd = copy.items[currentAd.id] ?? copy.items['security-1'];

    return (
        <button
            onClick={handleAdClick}
            className={`w-full ${currentAd.bgColor} border border-slate-600 rounded p-2.5 transition-all duration-300 hover:border-slate-500 hover:bg-slate-600 text-left ${showAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                } focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1`}
            rel="nofollow noopener noreferrer"
            title={currentAd.category === 'affiliate' ? copy.affiliateTitle : copy.sponsoredTitle}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={`${currentAd.color} mt-0.5 flex-shrink-0`}>{currentAd.icon}</div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-xs ${currentAd.color}`}>
                            {localizedAd.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {localizedAd.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            {currentAd.category === 'affiliate' ? copy.affiliateLabel : copy.sponsoredLabel}
                        </p>
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
                    title={copy.close}
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </button>
    );
}
