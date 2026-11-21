import { Compass, Database, Satellite, Search } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { DataInsightSources } from "@/components/DataInsightSources";
import { OfficialDataAnalysis, OfficialDataCatalogs } from "@/components/OfficialDataAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";

const copy = {
  it: {
    title: "Analisi dati",
    description: "Analizza serie storiche ufficiali, importa dataset e confronta dati con metodi statistici.",
    label: "Analisi statistica dei dati",
    intro: "Confronta serie storiche e fonti ufficiali, importa i tuoi dataset e calcola correlazioni, verifiche storiche e proiezioni esplorative.",
    method: "Il servizio esamina un massimo di 5 pagine HTML pubbliche per URL, segue solo collegamenti della stessa origine e non aggira login o protezioni. Le risorse non vengono scaricate automaticamente.",
    other: "Per classificazione satellitare e mappe tematiche usa l'assistente dedicato.",
    otherLink: "Vai al telerilevamento",
    source: "Fonti pubbliche, risultati verificabili",
  },
  en: {
    title: "Data analysis",
    description: "Analyze official time series, import datasets and compare data with statistical methods.",
    label: "Statistical data analysis",
    intro: "Compare official time series, import datasets, and calculate correlations, backtests, and exploratory projections.",
    method: "The service scans up to 5 public HTML pages per URL, follows same-origin links only, and does not bypass logins or protections. Resources are not downloaded automatically.",
    other: "For satellite classification and thematic maps, use the dedicated assistant.",
    otherLink: "Open remote sensing",
    source: "Public sources, verifiable results",
  },
};

export default function PortalExplorer() {
  const { language } = useLanguage();
  const text = copy[language === "it" ? "it" : "en"];
  return (
    <main className="min-h-screen bg-background">
      <Seo title={`${text.title} | Tatik.space`} description={text.description} path="/analysis/portals" language={language} />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <Compass className="h-4 w-4 text-primary" /> {text.label}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{text.intro}</p>
          <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>{text.method}</p>
          </div>
        </div>
      </section>
      <section className="container max-w-6xl space-y-8 px-4 py-10">
        <OfficialDataAnalysis />
        <DataInsightSources language={language} />
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <Satellite className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{text.other}</p>
              <p className="text-sm text-muted-foreground">{text.source}</p>
            </div>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/analysis/remote-sensing">
            <Search className="h-4 w-4" />{text.otherLink}
          </Link>
        </div>
        <OfficialDataCatalogs />
      </section>
    </main>
  );
}
