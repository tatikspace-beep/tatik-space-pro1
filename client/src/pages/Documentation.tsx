import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';

export default function Documentation() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t.documentation}</h1>
            <Link href="/">
              <Button variant="outline">{t.backToHome}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">{t.documentation} Tatik.space Pro</h2>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{t.intro}</h3>
              <p className="text-muted-foreground">
                <AITranslationWrapper>{t.docIntroText}</AITranslationWrapper>
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{t.gettingStarted}</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>{t.docCreateProject}</li>
                <li>{t.docExploreTemplates}</li>
                <li>{t.docLearnAI}</li>
                <li>{t.docDiscoverFeatures}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{t.mainFeatures}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">{t.advancedEditor}</h4>
                  <p className="text-sm text-muted-foreground">{t.editorSupport}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">{t.aiAssistant}</h4>
                  <p className="text-sm text-muted-foreground">{t.aiAssistantDesc}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">{t.fileManagement}</h4>
                  <p className="text-sm text-muted-foreground">{t.fileManagementDesc}</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-semibold mb-2">{t.automaticBackups}</h4>
                  <p className="text-sm text-muted-foreground">{t.backupProtection}</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{t.apiReference}</h3>
              <p className="text-muted-foreground">
                {t.apiReferenceDesc}
              </p>
            </section>
          </div>
        </div>
      </div>
      {/* PromoBox moved to global placement above footer for consistency */}
    </div>
  );
}