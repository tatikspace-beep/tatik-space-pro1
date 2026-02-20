import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';

export function AppFooter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { t } = useTranslation();
  const isDark = variant === 'dark';

  return (
    <footer className={`py-6 border-t ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-border'}`}>
      <div className="container px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Tatik Logo" className="w-6 h-6 object-contain" onError={(e: any) => (e.currentTarget.src = '/assets/logo.png')} />
            <span className="font-bold">Tatik.space Pro</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t('privacyPolicyLink')}
            </Link>
            <Link href="/terms" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t('termsConditions')}
            </Link>
            <Link href="/cookies" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t('cookiePolicyLink')}
            </Link>
            <Link href="/contact" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t('contact')}
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              © 2026 Tatik.space. {t('allRightsReserved')}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-muted-foreground/60'}`}>
              {t('developedBy')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
