import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { Code2, Zap, Shield, Sparkles, Layout, ArrowRight, Globe } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { useLanguage } from "@/contexts/LanguageContext";
// PromoBox is rendered globally via App.tsx

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Tatik logo" className="w-10 h-10 object-contain" onError={(e: any) => (e.currentTarget.src = '/assets/logo.png')} />
            <span className="text-xl font-bold tracking-tight">Tatik.Space</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md shadow-lg pro-badge">
              PRO
            </span>
          </div>

          {/* Main Menu for Home Page - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm">
                  <span>{t.solutions}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link href="/editor" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                      {t.editorOnline}
                    </Link>
                    <Link href="/templates" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
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
                <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm">
                  <span>{t.resources}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm">
                  <span>{t.pricing}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link href="/pricing/free" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                      {t.freePlan}
                    </Link>
                    <Link href="/pricing/pro" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                      {t.proPlan}
                    </Link>
                    <Link href="/pricing/enterprise" className="block px-3 py-2 rounded-md hover:bg-accent text-sm">
                      {t.enterprisePlan}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector when not authenticated */}
            {!isAuthenticated && (
              <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                <SelectTrigger className="w-12 h-10 p-0">
                  <SelectValue>
                    <Globe className="w-4 h-4" />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[
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
                  ].map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={() => {
                window.location.href = '/__admin_login';
              }}
              className="h-8 px-3 bg-red-500 text-white hover:bg-red-600 font-bold text-sm"
              title="Admin direct access"
            >
              🔴 ADMIN
            </Button>
            <Link href="/contact">
              <Button variant="ghost" className="text-sm font-medium">{t.contactUs}</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/editor">
                <Button className="glow-primary">{t.dashboard}</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="glow-primary">{t.login}</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>{t.newFeature}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            {t.createWebsites} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              {t.inSeconds}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t.tagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/editor">
              <Button size="lg" className="h-12 px-8 text-lg font-semibold glow-primary">
                {t.startFree} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-semibold">
                {t.browseTemplates}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.advancedEditor}</h3>
              <p className="text-muted-foreground">{t.editorDescription}</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.aiCopilot}</h3>
              <p className="text-muted-foreground">{t.aiDescription}</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t.securityPro}</h3>
              <p className="text-muted-foreground">{t.securityDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}
