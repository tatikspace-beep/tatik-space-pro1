import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Code2, Zap, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { publicHomeCopy } from "@/lib/publicHomeCopy";
// PromoBox is rendered globally via App.tsx

export default function Home() {
  const { language } = useLanguage();
  const copy = publicHomeCopy[language] ?? publicHomeCopy.en;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>{copy.badge}</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
            {copy.headline} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.editorTitle}</h3>
              <p className="text-muted-foreground">{copy.editorDescription}</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.assistantTitle}</h3>
              <p className="text-muted-foreground">{copy.assistantDescription}</p>
            </div>
            <div className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{copy.backupTitle}</h3>
              <p className="text-muted-foreground">{copy.backupDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}
