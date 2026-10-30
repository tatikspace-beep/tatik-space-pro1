import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const partnerLinks = [
  {
    name: 'NordVPN DE',
    region: 'Germany',
    href: 'https://www.awin1.com/awclick.php?gid=323861&mid=9399&awinaffid=3125172&linkid=2052032&clickref=',
  },
  {
    name: 'NordVPN PL',
    region: 'Poland',
    href: 'https://www.awin1.com/awclick.php?gid=436993&mid=30093&awinaffid=3125172&linkid=3137738&clickref=',
  },
  {
    name: 'The Great Courses',
    region: 'Online learning',
    href: 'https://www.awin1.com/cread.php?awinmid=25597&awinaffid=3125172',
  },
  {
    name: 'Surfshark VPN',
    region: 'DE / AT',
    href: 'https://www.awin1.com/cread.php?awinmid=21749&awinaffid=3125172',
  },
  {
    name: 'G DATA Security',
    region: 'DE',
    href: 'https://www.awin1.com/awclick.php?gid=375521&mid=14693&awinaffid=3125172&linkid=2505072&clickref=',
  },
];

const disclosureCopy: Record<string, { title: string; disclosure: string; link: string }> = {
  en: {
    title: 'Tools for your digital workspace',
    disclosure: 'Affiliate disclosure: Tatik.space may earn a commission if you purchase through these links.',
    link: 'View partner',
  },
  it: {
    title: 'Strumenti per il tuo spazio di lavoro digitale',
    disclosure: 'Trasparenza: Tatik.space può ricevere una commissione se acquisti tramite questi link.',
    link: 'Scopri il partner',
  },
  de: {
    title: 'Tools für deinen digitalen Arbeitsbereich',
    disclosure: 'Transparenz: Tatik.space kann eine Provision erhalten, wenn du über diese Links einkaufst.',
    link: 'Partner ansehen',
  },
  fr: {
    title: 'Des outils pour votre espace de travail numérique',
    disclosure: 'Transparence : Tatik.space peut recevoir une commission si vous achetez via ces liens.',
    link: 'Voir le partenaire',
  },
  es: {
    title: 'Herramientas para tu espacio de trabajo digital',
    disclosure: 'Transparencia: Tatik.space puede recibir una comisión si compras a través de estos enlaces.',
    link: 'Ver socio',
  },
  pt: {
    title: 'Ferramentas para seu espaço de trabalho digital',
    disclosure: 'Transparência: a Tatik.space pode receber uma comissão se você comprar por estes links.',
    link: 'Ver parceiro',
  },
};

export function AffiliatePartnerStrip() {
  const { language } = useLanguage();
  const copy = disclosureCopy[language] ?? disclosureCopy.en;
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    let expiryTimer: number | undefined;
    const updateConsent = () => {
      if (expiryTimer !== undefined) {
        window.clearTimeout(expiryTimer);
      }
      const details = window.localStorage.getItem('tatik-cookie-details');
      if (!details) {
        setMarketingConsent(false);
        return;
      }
      try {
        const preferences = JSON.parse(details) as { marketing?: boolean; expiresAt?: string };
        const expiresAt = typeof preferences.expiresAt === 'string'
          ? new Date(preferences.expiresAt).getTime()
          : Number.NaN;
        const isValid = preferences.marketing === true && expiresAt > Date.now();
        setMarketingConsent(
          isValid,
        );
        if (isValid) {
          expiryTimer = window.setTimeout(
            updateConsent,
            Math.min(expiresAt - Date.now(), 2_147_000_000),
          );
        }
      } catch (error) {
        console.error('Failed to read affiliate marketing consent:', error);
        setMarketingConsent(false);
      }
    };

    updateConsent();
    window.addEventListener('tatik:consent-updated', updateConsent);
    window.addEventListener('storage', updateConsent);
    return () => {
      if (expiryTimer !== undefined) {
        window.clearTimeout(expiryTimer);
      }
      window.removeEventListener('tatik:consent-updated', updateConsent);
      window.removeEventListener('storage', updateConsent);
    };
  }, []);

  if (!marketingConsent) return null;

  return (
    <aside className="border-t border-slate-800 bg-slate-950/70 px-4 py-6" aria-label={copy.title}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-sm font-semibold text-slate-200">{copy.title}</h2>
        <p className="mt-1 text-xs text-slate-400">{copy.disclosure}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {partnerLinks.map((partner) => (
            <li key={partner.name} className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div>
                <p className="font-medium text-slate-100">{partner.name}</p>
                <p className="text-xs text-slate-400">{partner.region}</p>
              </div>
              <a
                href={partner.href}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                {copy.link} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
