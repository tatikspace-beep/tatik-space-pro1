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
import { PrivacyPolicy, TermsOfService, CookiePolicy, ContactPage } from "./pages/LegalPages";
import ProfilePage from "./pages/ProfilePage";
import TemplateMarketplace from "./pages/TemplateMarketplace";
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
import { BetaNotice } from '@/components/BetaNotice';

// Initialize i18n
import './lib/i18n';

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/editor"} component={EditorApp} />
      <Route path={"/dashboard"} component={EditorApp} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/marketplace"} component={TemplateMarketplace} />
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
    // Determine API URL based on environment
    let apiUrl: string;
    
    if (typeof window !== 'undefined') {
      // In production (tatik.space), use Render API
      // In development/localhost, use relative path for Vite proxy
      if (window.location.hostname.includes('tatik.space')) {
        apiUrl = 'https://tatik-space-pro1.onrender.com/api/trpc';
      } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = '/api/trpc'; // Vite dev server proxy
      } else {
        // Fallback: relative path
        apiUrl = '/api/trpc';
      }
    } else {
      apiUrl = '/api/trpc';
    }

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: apiUrl,
              ...options,
              credentials: 'include',
            });
          },
        }),
      ],
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
