import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { siteSurfaceCopy } from '@/lib/siteSurfaceCopy';

export function AppFooter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { language, t } = useLanguage();
  const copy = siteSurfaceCopy[language];
  const isDark = variant === 'dark';

  return (
    <footer className={`py-6 border-t ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-border'}`}>
      <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" aria-label={copy.navbar.home} className="flex shrink-0 items-center gap-2 font-bold hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt={copy.navbar.logo} className="h-8 w-8 object-contain" />
            <span>Tatik.space Pro</span>
          </Link>

          <nav aria-label={copy.footer.navigation} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:gap-x-6">
            <Link href="/privacy" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t.privacyPolicy}
            </Link>
            <Link href="/terms" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t.termsOfService}
            </Link>
            <Link href="/cookies" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t.cookiePolicy}
            </Link>
            <Link href="/contact" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {t.contactUs}
            </Link>
            <Link href="/schools" className={`hover:${isDark ? 'text-blue-400' : 'text-foreground'} ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {copy.footer.schools}
            </Link>
          </nav>

          <div className="flex flex-col items-center gap-1">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
              © 2026 Tatik.space. {copy.footer.copyright}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-muted-foreground/60'}`}>
              {copy.footer.authorCredit}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
