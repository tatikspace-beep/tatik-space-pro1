import { Helmet } from "react-helmet-async";
import { publicHomeCopy } from "@/lib/publicHomeCopy";
import { commercialSeoCopy } from "@/lib/commercialSeoCopy";
import { supportPageCopy } from "@/lib/supportPageCopy";
import { documentationPageCopy } from "@/lib/documentationPageCopy";
import { tutorialsCopy } from "@/pages/Tutorials";
import { schoolProgramCopy } from "@/lib/schoolProgramCopy";
import { legalSeoCopy } from "@/lib/legalSeoCopy";
import { translations } from "@/lib/i18n";
import { contactPageTitles } from "@/lib/contactFormTranslations";
import { blogPageCopy } from "@/lib/blogPageCopy";
import { deploymentPageCopy } from "@/lib/deploymentPageCopy";
import { collaborationPageCopy } from "@/lib/collaborationPageCopy";

const SITE_URL = "https://www.tatik.space";
const OPEN_GRAPH_LOCALES: Record<string, string> = {
  en: "en_US",
  it: "it_IT",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
  ru: "ru_RU",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  ar: "ar_SA",
  hi: "hi_IN",
  pl: "pl_PL",
  nl: "nl_NL",
  tr: "tr_TR",
  sv: "sv_SE",
  da: "da_DK",
  no: "no_NO",
  fi: "fi_FI",
  uk: "uk_UA",
  cs: "cs_CZ",
};

type SeoProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function Seo({ title, description, path, noIndex = false, type = "website", language = "it" }: SeoProps & { language?: string }) {
  const locale = (publicHomeCopy[language] ? language : "en") as keyof typeof translations;
  const seoPath = path.startsWith("/pricing/") ? "/pricing" : path;
  const localizedHome = path === "/" ? publicHomeCopy[locale] : undefined;
  const localizedCommercial = commercialSeoCopy[locale];
  const localizedSupport = supportPageCopy[locale] ?? supportPageCopy.en;
  const localizedDocumentation = documentationPageCopy[locale] ?? documentationPageCopy.en;
  const localizedTutorials = tutorialsCopy[locale] ?? tutorialsCopy.en;
  const localizedSchools = schoolProgramCopy[locale] ?? schoolProgramCopy.en;
  const localizedDeployment = deploymentPageCopy[locale] ?? deploymentPageCopy.en;
  const localizedCollaboration = collaborationPageCopy[locale] ?? collaborationPageCopy.en;
  const localizedSeo = seoPath === "/marketplace"
    ? { title: localizedCommercial.marketplaceTitle, description: localizedCommercial.marketplaceDescription }
    : seoPath === "/pricing"
      ? { title: localizedCommercial.pricingTitle, description: localizedCommercial.pricingDescription }
      : seoPath === "/schools"
        ? { title: localizedSchools.seoTitle, description: localizedSchools.seoDescription }
        : seoPath === "/deployment"
          ? { title: localizedDeployment.seoTitle, description: localizedDeployment.seoDescription }
          : seoPath === "/collaboration"
            ? {
                title: `${localizedCollaboration.title} | Tatik.space`,
                description: localizedCollaboration.tagline,
              }
        : seoPath === "/support"
          ? { title: localizedSupport.seoTitle, description: localizedSupport.seoDescription }
          : seoPath === "/documentation"
            ? { title: localizedDocumentation.seoTitle, description: localizedDocumentation.seoDescription }
            : seoPath === "/tutorials"
              ? { title: localizedTutorials.seoTitle, description: localizedTutorials.seoDescription }
              : seoPath === "/blog"
                ? {
                    title: `${blogPageCopy[locale].title} | Tatik.space`,
                    description: `${blogPageCopy[locale].heading}: ${blogPageCopy[locale].intro}.`,
                  }
                : seoPath === "/privacy"
                  ? { title: `${translations[locale].privacyPolicy} | Tatik.space`, description: legalSeoCopy[locale].privacyDescription }
                  : seoPath === "/terms"
                    ? { title: `${translations[locale].termsOfService} | Tatik.space`, description: legalSeoCopy[locale].termsDescription }
                    : seoPath === "/cookies"
                      ? { title: `${translations[locale].cookiePolicy} | Tatik.space`, description: legalSeoCopy[locale].cookiesDescription }
                      : seoPath === "/contact"
                        ? { title: `${contactPageTitles[locale] ?? (locale === "it" ? "Contatti" : "Contact")} | Tatik.space`, description: legalSeoCopy[locale].contactDescription }
                        : undefined;
  const pageTitle = localizedHome?.seoTitle ?? localizedSeo?.title ?? title;
  const pageDescription = localizedHome?.seoDescription ?? localizedSeo?.description ?? description;
  const canonical = `${SITE_URL}${seoPath === "/" ? "/" : seoPath}`;
  return (
    <Helmet>
      <html lang={locale} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content="Tatik.space" />
      <meta property="og:locale" content={OPEN_GRAPH_LOCALES[locale] ?? "en_US"} />
      <meta property="og:image" content={`${SITE_URL}/logo.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${SITE_URL}/logo.png`} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebPage",
          name: pageTitle,
          description: pageDescription,
          url: canonical,
          isPartOf: { "@type": "WebSite", name: "Tatik.space", url: SITE_URL },
        })}
      </script>
    </Helmet>
  );
}

export const PUBLIC_SEO: Record<string, Omit<SeoProps, "path">> = {
  "/": {
    title: "Tatik.space Pro | Editor di codice online con AI",
    description: publicHomeCopy.it.seoDescription,
  },
  "/marketplace": {
    title: "Marketplace di template web | Tatik.space Pro",
    description: "Esplora template gratuiti e premium per progetti web e acquista template premium tramite checkout. Gli sviluppatori possono candidare listing, soggetti a revisione.",
  },
  "/documentation": {
    title: "Documentazione Tatik.space | Guida all'IDE cloud",
    description: "Consulta le guide verificate per editor, file, anteprima e backup Tatik.space Pro, oltre alle procedure e ai limiti del marketplace e del programma scuole.",
  },
  "/tutorials": {
    title: "Guide pratiche per l’editor | Tatik.space Pro",
    description: "Guide per usare l’editor Tatik.space Pro, salvare e ripristinare backup e pubblicare i file con provider esterni. Il deploy diretto Tatik non è disponibile.",
  },
  "/blog": {
    title: "Blog sviluppo web e AI | Tatik.space",
    description: "Guide, aggiornamenti e consigli per sviluppatori su web development, AI e strumenti cloud.",
  },
  "/pricing": {
    title: "Prezzi Tatik.space | Piano gratuito e Pro",
    description: "Confronta piano gratuito, trial di 60 giorni e Tatik Pro per usare tutte le funzioni dell'IDE cloud.",
  },
  "/support": {
    title: "Supporto Tatik.space",
    description: "Trova risposte su accesso tramite link email, editor, backup, acquisti di template e programma scuole Tatik.space Pro.",
  },
  "/schools": {
    title: "Programma scuole | Tatik.space Pro",
    description: "Le scuole possono richiedere un corso di 30 giorni per un massimo di 30 studenti. L’attivazione richiede l’approvazione Tatik; gli inviti sono gestiti tramite token.",
  },
  "/deployment": {
    title: "Pubblicazione con provider esterni | Tatik.space Pro",
    description: "Tatik.space Pro non offre il deploy diretto né hosting di produzione. Scopri come salvare o scaricare un progetto e pubblicarlo con un provider esterno.",
  },
  "/collaboration": {
    title: "Collaborazione | Tatik.space",
    description: "Esplora una demo isolata di team, chat e condivisione. Non è collegata ai progetti reali e non va usata con dati personali o di produzione.",
  },
  "/privacy": { title: "Privacy Policy | Tatik.space", description: "Informativa privacy di Tatik.space." },
  "/terms": { title: "Termini di servizio | Tatik.space", description: "Termini e condizioni di utilizzo di Tatik.space." },
  "/cookies": { title: "Cookie Policy | Tatik.space", description: "Informativa sui cookie e sulle preferenze di consenso di Tatik.space." },
  "/contact": { title: "Contatti | Tatik.space", description: "Contatta il team Tatik.space per supporto, collaborazioni e informazioni." },
};
