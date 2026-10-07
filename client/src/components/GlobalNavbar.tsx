import React, { useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LogOut,
  Settings,
  User,
  Globe,
  Timer,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ProfileBadge from '@/components/ProfileBadge';
import { siteSurfaceCopy } from '@/lib/siteSurfaceCopy';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
];

export function GlobalNavbar() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const copy = siteSurfaceCopy[language];
  const { currentProject } = useProject();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState<'solutions' | 'resources' | null>(null);
  const [desktopNavFits, setDesktopNavFits] = useState(false);
  const navbarRowRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const row = navbarRowRef.current;
    const brand = brandRef.current;
    const desktopNav = desktopNavRef.current;
    const controls = controlsRef.current;
    if (!row || !brand || !desktopNav || !controls) return;

    const measureFit = () => {
      const rowRect = row.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const navRect = desktopNav.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();
      const navLeft = rowRect.left + (rowRect.width - navRect.width) / 2;
      const navRight = navLeft + navRect.width;
      const gap = 16;
      const fits = navRect.width > 0
        && navLeft >= brandRect.right + gap
        && navRight + gap <= controlsRect.left;

      setDesktopNavFits((current) => current === fits ? current : fits);
    };

    measureFit();
    const observer = new ResizeObserver(measureFit);
    observer.observe(row);
    observer.observe(brand);
    observer.observe(desktopNav);
    observer.observe(controls);
    window.addEventListener('resize', measureFit);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureFit);
    };
  }, [language, isAuthenticated, user?.trialEndsAt]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Always display 'Tatik.space' in navbar
  const displayName = 'Tatik.space';

  // Handle logo click - avoid remounting EditorApp if already in editor
  const handleLogoClick = () => {
    if (currentProject.id) {
      // If on editor page already with project open, don't navigate (prevents remount)
      if (location === '/editor') return;
      // Otherwise navigate to editor
      setLocation('/editor');
    } else {
      // No project open, go to home
      setLocation('/');
    }
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1680px] px-3 xl:px-6">
        <div ref={navbarRowRef} className="relative grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {/* Left section - Logo and PRO badge */}
        <div ref={brandRef} className="flex w-fit min-w-0 max-w-full items-center gap-1.5">
          <button
            onClick={handleLogoClick}
            aria-label={copy.navbar.home}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt={copy.navbar.logo}
              className="w-10 h-10 object-contain"
              onError={(e: any) => (e.currentTarget.src = '/assets/logo.png')}
            />
          </button>
          <div className="flex items-center gap-1">
            <span className="text-base font-bold tracking-tight sm:text-xl">{displayName}</span>
            <span className="rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-1 py-0.5 text-[10px] font-bold text-white shadow-lg pro-badge sm:px-2 sm:text-xs">
              PRO
            </span>
          </div>
        </div>

        {/* Center section - Main Navigation Menu */}
        <div
          ref={desktopNavRef}
          className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 transition-opacity 2xl:gap-3 ${desktopNavFits ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`}
        >
          <div className="relative group">
            <button
              type="button"
              aria-expanded={openNavDropdown === 'solutions'}
              aria-controls="solutions-menu"
              onClick={() => setOpenNavDropdown(openNavDropdown === 'solutions' ? null : 'solutions')}
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <span className="font-medium">{t.solutions}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              id="solutions-menu"
              className={`absolute left-0 top-full z-50 w-56 pt-1 transition-all duration-200 ${openNavDropdown === 'solutions' ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'}`}
            >
              <div className="rounded-md border border-border bg-background p-2 shadow-lg">
                <Link href="/editor" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.editorOnline}
                </Link>
                <Link href="/marketplace" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.templateMarketplace}
                </Link>
                <Link href="/marketplace/developer" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {copy.navbar.developerMarketplace}
                </Link>
                <Link href="/collaboration" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.collaboration}
                </Link>
                <Link href="/deployment" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.deployment}
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              aria-expanded={openNavDropdown === 'resources'}
              aria-controls="resources-menu"
              onClick={() => setOpenNavDropdown(openNavDropdown === 'resources' ? null : 'resources')}
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <span className="font-medium">{t.resources}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              id="resources-menu"
              className={`absolute left-0 top-full z-50 w-56 pt-1 transition-all duration-200 ${openNavDropdown === 'resources' ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'}`}
            >
              <div className="rounded-md border border-border bg-background p-2 shadow-lg">
                <Link href="/documentation" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.documentation}
                </Link>
                <Link href="/tutorials" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.tutorials}
                </Link>
                <Link href="/blog" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.blog}
                </Link>
                <Link href="/support" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.support}
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className="flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors">
            <span className="font-medium">{t.pricing}</span>
          </Link>

          {/* Trial countdown - only shown when authenticated */}
          {isAuthenticated && user?.trialEndsAt && (
            <div className="hidden items-center gap-2 text-sm 2xl:flex">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{t.freeTrialExpires}</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {t.trialDaysLeft}
              </Badge>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={`hidden h-10 w-10 justify-self-center sm:col-start-2 sm:row-start-1 ${desktopNavFits ? '' : 'sm:inline-flex'}`}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? copy.navbar.closeMenu : copy.navbar.openMenu}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Right section - Language selector, Auth, Settings */}
        <div ref={controlsRef} className="col-start-2 row-start-1 flex min-w-0 items-center justify-self-end gap-1.5 sm:col-start-3">
          {/* Language Selector - always visible */}
          <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
            <SelectTrigger aria-label={t.language} className="w-12 h-10 p-0">
              <SelectValue>
                <Globe className="w-4 h-4" />
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className="max-h-[70vh] overflow-hidden"
              viewportClassName="max-h-[70vh] overflow-y-auto"
            >
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1">
              <ProfileBadge />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/contact">
                <Button variant="ghost" size="sm" className="hidden md:block">
                  {t.contactUs}
                </Button>
              </Link>
              <Link href="/login">
                <Button className="glow-primary hidden sm:inline-flex" size="sm">
                  {t.login}
                </Button>
              </Link>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? copy.navbar.closeMenu : copy.navbar.openMenu}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-background px-4 py-3 shadow-lg">
          <div className="flex flex-col gap-1">
            <span className="px-3 pt-2 text-xs font-semibold uppercase text-muted-foreground">{t.solutions}</span>
            <Link href="/editor" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.editorOnline}</Link>
            <Link href="/marketplace" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.templateMarketplace}</Link>
            <Link href="/marketplace/developer" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{copy.navbar.developerMarketplace}</Link>
            <Link href="/collaboration" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.collaboration}</Link>
            <Link href="/deployment" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.deployment}</Link>
            <span className="px-3 pt-2 text-xs font-semibold uppercase text-muted-foreground">{t.resources}</span>
            <Link href="/documentation" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.documentation}</Link>
            <Link href="/tutorials" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.tutorials}</Link>
            <Link href="/blog" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.blog}</Link>
            <Link href="/support" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>{t.support}</Link>
            <Link href="/pricing" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              {t.pricing}
            </Link>
            {!isAuthenticated && (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 hover:bg-accent sm:hidden" onClick={() => setMobileMenuOpen(false)}>
                  {t.login}
                </Link>
                <Link href="/contact" className="rounded-md px-3 py-2 hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                  {t.contactUs}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}