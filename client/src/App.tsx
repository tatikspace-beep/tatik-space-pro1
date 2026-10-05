import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsent } from "./components/CookieConsent";
import Home from "./pages/Home";
import EditorApp from "./pages/EditorApp";
import Files from "./pages/Files";
import Documentation from "./pages/Documentation";
import Tutorials from "./pages/Tutorials";
import Blog from "./pages/Blog";
import Support from "./pages/Support";
import Pricing from "./pages/Pricing";
import Templates from "./pages/Templates";
import Collaboration from "./pages/Collaboration";
import Deployment from "./pages/Deployment";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompleteRegistration from "./pages/CompleteRegistration";
import AccessLink from "./pages/AccessLink";
import { PrivacyPolicy, TermsOfService, CookiePolicy, ContactPage } from "./pages/LegalPages";
import ProfilePage from "./pages/ProfilePage";
import TemplateMarketplace from "./pages/TemplateMarketplace";
import DeveloperMarketplace from "./pages/DeveloperMarketplace";
import SchoolProgram from "./pages/SchoolProgram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import { useState, useEffect } from "react";
import superjson from 'superjson';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { GlobalNavbar } from "@/components/GlobalNavbar";
import { AppFooter } from "@/components/AppFooter";
import { PromoBox } from '@/components/PromoBox';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicHomeCopy } from '@/lib/publicHomeCopy';
import { siteShellCopy } from '@/lib/siteShellCopy';
import { translations } from '@/lib/i18n';
import { BetaNotice } from '@/components/BetaNotice';
import { PUBLIC_SEO, Seo } from "@/components/Seo";

// Initialize i18n
import './lib/i18n';

function Router() {
  const [location] = useLocation();
  const { language } = useLanguage();
  const seoKey = location.startsWith("/pricing/") ? "/pricing" : location;
  const seo = PUBLIC_SEO[seoKey];
  const homeCopy = publicHomeCopy[language] ?? publicHomeCopy.en;
  const isPrivate = ["/editor", "/dashboard", "/profile", "/files", "/login", "/register", "/access", "/complete-registration", "/marketplace/developer", "/marketplace/demo"].some(path => location === path || location.startsWith(`${path}/`));
  const currentTranslations = translations[language] ?? translations.en;
  const currentShellCopy = siteShellCopy[language] ?? siteShellCopy.en;
  const routeTitle = location.startsWith("/editor") ? currentTranslations.editor
    : location.startsWith("/dashboard") ? currentTranslations.dashboard
      : location.startsWith("/profile") ? currentTranslations.profile
        : location.startsWith("/files") ? currentTranslations.files
          : location.startsWith("/login") || location.startsWith("/access") ? currentTranslations.login
            : location.startsWith("/register") || location.startsWith("/complete-registration") ? currentTranslations.register
              : location.startsWith("/marketplace/developer") || location.startsWith("/marketplace/demo") ? currentTranslations.templateMarketplace
                : currentShellCopy.notFoundTitle;
  const fallbackSeo = {
    title: `${routeTitle} | Tatik.space`,
    description: isPrivate ? currentTranslations.mustBeAuthenticatedToAccess : currentShellCopy.notFoundMessage,
    noIndex: true,
  };
  const shouldNoIndex = isPrivate || !seo || Boolean(seo.noIndex);
  return (
    <>
      <Seo
        {...(seo ?? fallbackSeo)}
        {...(seoKey === "/" ? { title: homeCopy.seoTitle, description: homeCopy.seoDescription } : {})}
        path={location}
        language={language}
        noIndex={shouldNoIndex}
      />
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/editor"} component={EditorApp} />
      <Route path={"/dashboard"} component={EditorApp} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/complete-registration"} component={CompleteRegistration} />
      <Route path={"/access"} component={AccessLink} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/marketplace"} component={TemplateMarketplace} />
      <Route path={"/schools"} component={SchoolProgram} />
      <Route path={"/marketplace/developer"} component={DeveloperMarketplace} />
      <Route path={"/files"} component={Files} />
      <Route path={"/templates"} component={Templates} />
      <Route path={"/collaboration"} component={Collaboration} />
      <Route path={"/deployment"} component={Deployment} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/tutorials"} component={Tutorials} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/support"} component={Support} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/pricing/free"} component={Pricing} />
      <Route path={"/pricing/pro"} component={Pricing} />
      <Route path={"/pricing/enterprise"} component={Pricing} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/cookies"} component={CookiePolicy} />
      <Route path={"/contact"} component={ContactPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function BetaNoticeWrapper() {
  const [location] = useLocation();
  if (location.startsWith('/editor') || location.startsWith('/dashboard')) {
    return null;
  }
  return <BetaNotice />;
}

function PromoPlacement() {
  const [location] = useLocation();
  const targets = ['/documentation', '/tutorials', '/blog', '/support'];

  if (!targets.includes(location)) return null;

  return (
    <div className="w-full">
      <PromoBox trialDaysLeft={60} />
    </div>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    // Determine primary API URL based on environment
    let primaryUrl: string;
    let fallbackUrl: string = '/api/trpc'; // Always have fallback to relative path

    if (typeof window !== 'undefined') {
      // Use relative path for all production deployments (Vercel, etc.)
      // In development/localhost, use relative path for Vite proxy
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        primaryUrl = '/api/trpc'; // Vite dev server proxy
        fallbackUrl = primaryUrl;
      } else {
        // Production: use relative path (works with Vercel, custom domains, etc.)
        primaryUrl = '/api/trpc';
        fallbackUrl = primaryUrl;
      }
    } else {
      primaryUrl = '/api/trpc';
      fallbackUrl = primaryUrl;
    }

    // Custom fetch handler
    const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();

      if (!url) {
        throw new Error('[tRPC] No URL provided to fetch');
      }

      console.log('[tRPC] Fetching:', url);

      const response = await fetch(input, {
        ...init,
        credentials: 'include',
      });

      console.log('[tRPC] Response:', url, response.status);

      // Guard against empty / non-JSON responses which cause
      // `Unexpected end of JSON input` in downstream parsers.
      // Read the text body and return a new Response ensuring
      // there's always a JSON body (fallback to `{}`) so tRPC's
      // `response.json()` does not throw on empty bodies.
      let text = '';
      try {
        text = await response.text();
      } catch (err) {
        console.warn('[tRPC] Failed to read response text:', err);
        text = '';
      }

      if (!text || text.trim().length === 0) {
        const headers = new Headers(response.headers as any);
        if (!headers.has('content-type')) headers.set('content-type', 'application/json');
        return new Response('{}', {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as any,
      });
    };

    const batchOptions: any = {
      url: primaryUrl,
      transformer: superjson,
      fetch: customFetch,
      // Ensure queries use GET so the server treats them as read-only queries
      // and doesn't reject POST requests for query procedures.
      useGETForQueries: true,
    };

    return trpc.createClient({
      links: [httpBatchLink(batchOptions as any)],
    });
  });

  // Load theme preference from localStorage on app mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    const html = document.documentElement;

    console.log('[App Mount] storedTheme from localStorage:', storedTheme);

    if (storedTheme === 'light') {
      html.classList.remove('dark');
      console.log('[App Mount] Applied light theme');
    } else if (storedTheme === 'dark') {
      html.classList.add('dark');
      console.log('[App Mount] Applied dark theme');
    } else {
      // Default to dark if no preference stored
      html.classList.add('dark');
      console.log('[App Mount] Applied default dark theme');
    }
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider
            defaultTheme="dark"
          >
            <LanguageProvider>
              <ProjectProvider>
                <TooltipProvider>
                  <Toaster />
                  <GlobalNavbar />
                  <div className="pt-16 min-h-screen">
                    <Router />
                    {/* show beta banner on all pages except editor/dashboard */}
                    <BetaNoticeWrapper />
                  </div>

                  {/* Promo banner placed above the global footer for selected pages */}
                  <PromoPlacement />

                  <AppFooter />
                  <CookieConsent />
                </TooltipProvider>
              </ProjectProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
