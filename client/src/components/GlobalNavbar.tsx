import React from 'react';
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
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import ProfileBadge from '@/components/ProfileBadge';

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
  const { currentProject } = useProject();
  const [location, setLocation] = useLocation();

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
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section - Logo and PRO badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogoClick}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="Tatik logo"
              className="w-10 h-10 object-contain"
              onError={(e: any) => (e.currentTarget.src = '/assets/logo.png')}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">{displayName}</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md shadow-lg pro-badge">
              PRO
            </span>
          </div>
        </div>

        {/* Center section - Main Navigation Menu */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors">
              <span className="font-medium">{t.solutions}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <Link href="/editor" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.editorOnline}
                </Link>
                <Link href="/marketplace" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                  {t.templateMarketplace}
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
            <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors">
              <span className="font-medium">{t.resources}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
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
            <div className="flex items-center gap-2 text-sm">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{t.freeTrialExpires}</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {t.trialDaysLeft}
              </Badge>
            </div>
          )}
        </div>

        {/* Right section - Language selector, Auth, Settings */}
        <div className="flex items-center gap-3">
          {/* Language Selector - always visible */}
          <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
            <SelectTrigger className="w-12 h-10 p-0">
              <SelectValue>
                <Globe className="w-4 h-4" />
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Admin-only: Direct admin login button */}
          <Button
            onClick={() => {
              window.location.href = '/__admin_login';
            }}
            className="h-8 px-3 bg-red-500 text-white hover:bg-red-600 font-bold"
            title="Direct admin login - Click to access admin"
          >
            🔴 ADMIN
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
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
                <Button className="glow-primary" size="sm">
                  {t.login}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}





/*// Dentro Navbar.tsx
const { login } = useAuth();

return (
  <nav>
    <button 
      onClick={() => login({ id: "1", name: "Admin", role: "ADMIN" })}
      style={{ background: 'red', color: 'white', padding: '10px' }}
    >
       LOGIN RAPIDO ADMIN
    </button>
  </nav>
);*/