import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink } from 'lucide-react';
import { deploymentPageCopy } from '@/lib/deploymentPageCopy';
import { Seo } from '@/components/Seo';

export default function Deployment() {
  const { language } = useLanguage();
  const copy = deploymentPageCopy[language] ?? deploymentPageCopy.en;

  return (
    <div className="min-h-screen bg-background">
      <Seo title={copy.seoTitle} description={copy.seoDescription} path="/deployment" language={language} />
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <Link href="/">
              <Button variant="outline">{copy.backHome}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-6">
            <h2 className="text-2xl font-bold mb-3">
              {copy.warningTitle}
            </h2>
            <p className="text-muted-foreground">{copy.warningText}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{copy.stepsTitle}</h2>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
              <li>{copy.stepOne}</li>
              <li>{copy.stepTwo}</li>
              <li>{copy.stepThree}</li>
            </ol>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-between" asChild>
              <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">
                Vercel <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" className="justify-between" asChild>
              <a href="https://docs.netlify.com/" target="_blank" rel="noopener noreferrer">
                Netlify <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </section>

          <div className="border-t border-border pt-6">
            <Link href="/editor">
              <Button size="lg">{copy.openEditor}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
