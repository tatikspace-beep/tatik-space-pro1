import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BrainCircuit, ChartNoAxesCombined, Code2, Satellite, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicHomeCopy } from "@/lib/publicHomeCopy";
// PromoBox is rendered globally via App.tsx

export default function Home() {
  const { language } = useLanguage();
  const copy = publicHomeCopy[language] ?? publicHomeCopy.en;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>{copy.badge}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            {copy.headline} <br />
            <span className="text-primary">
              {copy.highlight}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {copy.description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/editor">
              <Button size="lg" className="h-12 px-8 text-lg font-semibold glow-primary">
                {copy.editorCta} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg font-semibold">
                {copy.marketplaceCta}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="home-feature-grid grid grid-cols-1 md:grid-cols-3">
            <div className="home-feature-card rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.editorTitle}</h3>
              <p className="text-muted-foreground">{copy.editorDescription}</p>
            </div>
            <div className="home-feature-card rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.assistantTitle}</h3>
              <p className="text-muted-foreground">{copy.assistantDescription}</p>
            </div>
            <div className="home-feature-card rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.backupTitle}</h3>
              <p className="text-muted-foreground">{copy.backupDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {language === "it" ? "Nuovi strumenti per l’analisi" : "New tools for data analysis"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {language === "it"
                ? "Accanto agli strumenti per sviluppare sul web, trovi funzioni per esplorare dati, immagini satellitari e modelli di machine learning."
                : "Alongside web development tools, explore data, satellite imagery, and machine-learning models."}
            </p>
          </div>
          <div className="home-feature-grid grid grid-cols-1 md:grid-cols-3">
            <Link href="/analysis/remote-sensing" className="home-feature-card rounded-2xl bg-card border border-border transition-colors hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Satellite className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {language === "it" ? "Telerilevamento Sentinel-2" : "Sentinel-2 remote sensing"}
              </h3>
              <p className="text-muted-foreground">
                {language === "it"
                  ? "Analizza immagini satellitari e scarica mappe e rapporti tecnici."
                  : "Analyze satellite imagery and download maps and technical reports."}
              </p>
            </Link>
            <Link href="/analysis/portals" className="home-feature-card rounded-2xl bg-card border border-border transition-colors hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ChartNoAxesCombined className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                {language === "it" ? "Analisi dati" : "Data analysis"}
              </h3>
              <p className="text-muted-foreground">
                {language === "it"
                  ? "Esplora serie storiche, importa dataset e applica metodi statistici."
                  : "Explore time series, import datasets, and apply statistical methods."}
              </p>
            </Link>
            <Link href="/analysis/ml-studio" className="home-feature-card rounded-2xl bg-card border border-border transition-colors hover:border-primary/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">ML Studio</h3>
              <p className="text-muted-foreground">
                {language === "it"
                  ? "Addestra e confronta modelli di machine learning su dataset."
                  : "Train and compare machine-learning models on datasets."}
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}
