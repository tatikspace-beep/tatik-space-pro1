import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdBannerProps {
  position?: 'sidebar' | 'footer' | 'subtle' | 'marketplace';
  dismissible?: boolean;
}

export function AdBanner({ position = 'subtle', dismissible = true }: AdBannerProps) {
  const [visible, setVisible] = useState(true);
  const { t } = useLanguage();
  const sessionId = typeof window === 'undefined'
    ? undefined
    : window.localStorage.getItem('tatik-banner-session') || (() => {
      const id = crypto.randomUUID();
      window.localStorage.setItem('tatik-banner-session', id);
      return id;
    })();
  const consentQuery = trpc.cookieConsent.get.useQuery({ sessionId }, { enabled: Boolean(sessionId) });
  const campaignQuery = trpc.banners.active.useQuery(
    { placement: position === 'subtle' ? 'editor' : position },
    { enabled: consentQuery.data?.marketing === true, refetchInterval: 300000 },
  );
  const trackMutation = trpc.banners.track.useMutation();
  const campaign = campaignQuery.data?.[0];

  useEffect(() => {
    if (campaign && consentQuery.data?.marketing === true) {
      trackMutation.mutate({ campaignId: campaign.id, eventType: 'impression', placement: campaign.placement as 'editor' | 'marketplace' | 'footer' | 'sidebar', sessionId });
    }
  }, [campaign?.id, consentQuery.data?.marketing]);

  if (!visible || !campaign || consentQuery.data?.marketing !== true) return null;

  const styles = {
    sidebar: "p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm",
    footer: "bg-slate-900/30 border-t border-slate-800 p-4 text-center",
    marketplace: "p-4 bg-amber-900/10 rounded-lg border border-amber-800/20 text-sm",
    subtle: "px-4 py-1 bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-800/20 rounded text-xs w-max"
  };

  return (
    <div className={`relative ${styles[position]} ${dismissible ? 'pr-12' : ''}`}>
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 h-11 w-11 p-0"
          onClick={() => setVisible(false)}
          aria-label={t.close}
          title={t.close}
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-200">{campaign.title}</p>
          <span className="text-slate-400">•</span>
          <p className="text-slate-400">{campaign.description}</p>
        </div>
        <a
          href={campaign.destinationUrl}
          onClick={() => trackMutation.mutate({ campaignId: campaign.id, eventType: 'click', placement: campaign.placement as 'editor' | 'marketplace' | 'footer' | 'sidebar', sessionId })}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Scopri →
        </a>
      </div>
    </div>
  );
}
