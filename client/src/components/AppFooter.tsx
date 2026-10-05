import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { siteSurfaceCopy } from '@/lib/siteSurfaceCopy';

export function AppFooter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { language, t } = useLanguage();
  const copy = siteSurfaceCopy[language];
  const isDark = variant === 'dark';

  return (
    <footer className={`py-6 border-t ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'border-border'}`}>
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex w-full flex-col items-center gap-3 text-sm md:flex-row md:justify-center md:gap-5">
            <Link href="/" aria-label={copy.navbar.home} className="shrink-0 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt={copy.navbar.logo} className="h-8 w-8 object-contain" />
            </Link>
            <nav aria-label={copy.footer.navigation} className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
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
          </div>

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
