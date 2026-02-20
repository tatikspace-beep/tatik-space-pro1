import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface AdBannerProps {
  position?: 'sidebar' | 'footer' | 'subtle';
  dismissible?: boolean;
}

export function AdBanner({ position = 'subtle', dismissible = true }: AdBannerProps) {
  const [visible, setVisible] = useState(true);
  const [adContent, setAdContent] = useState<{
    title: string;
    description: string;
    link: string;
    sponsor: string;
  } | null>(null);

  useEffect(() => {
    // Simulazione caricamento ads da backend
    setAdContent({
      title: "Potenzia il tuo workflow",
      description: "Scopri strumenti premium per sviluppatori",
      link: "https://example.com",
      sponsor: "Partner Ufficiale"
    });
  }, []);

  if (!visible || !adContent) return null;

  const styles = {
    sidebar: "p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm",
    footer: "bg-slate-900/30 border-t border-slate-800 p-4 text-center",
    subtle: "px-4 py-1 bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-800/20 rounded text-xs w-max"
  };

  return (
    <div className={`relative ${styles[position]}`}>
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-1 h-5 w-5 p-0"
          onClick={() => setVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-200">{adContent.title}</p>
          <span className="text-slate-400">•</span>
          <p className="text-slate-400">{adContent.description}</p>
        </div>
        <a
          href={adContent.link}
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
