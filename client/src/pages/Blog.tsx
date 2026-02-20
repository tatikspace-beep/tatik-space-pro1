import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';

export default function Blog() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t.blog}</h1>
            <Link href="/">
              <Button variant="outline">{t.backToHome}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">{t.updates} & {t.news}</h2>
          <p className="text-muted-foreground mb-8"><AITranslationWrapper>{t.platformNewsDevWorld}</AITranslationWrapper></p>

          <div className="space-y-8">
            <article className="border-b border-border pb-8">
              <h3 className="text-xl font-semibold mb-2"><AITranslationWrapper>{t.newAIFeaturesInEditor}</AITranslationWrapper></h3>
              <p className="text-sm text-muted-foreground mb-2"><AITranslationWrapper>{t.publishedOnJan152026}</AITranslationWrapper></p>
              <p className="text-muted-foreground mb-4">
                <AITranslationWrapper>{t.aiAssistanceAdded}</AITranslationWrapper>
              </p>
              <Button variant="outline" size="sm"><AITranslationWrapper>{t.readArticle}</AITranslationWrapper></Button>
            </article>

            <article className="border-b border-border pb-8">
              <h3 className="text-xl font-semibold mb-2"><AITranslationWrapper>{t.bestPracticesProjectMgmt}</AITranslationWrapper></h3>
              <p className="text-sm text-muted-foreground mb-2"><AITranslationWrapper>{t.publishedOnJan82026}</AITranslationWrapper></p>
              <p className="text-muted-foreground mb-4">
                <AITranslationWrapper>{t.howToOrganizeProjects}</AITranslationWrapper>
              </p>
              <Button variant="outline" size="sm"><AITranslationWrapper>{t.readArticle}</AITranslationWrapper></Button>
            </article>

            <article className="border-b border-border pb-8">
              <h3 className="text-xl font-semibold mb-2"><AITranslationWrapper>{t.performanceOptimizationGuide}</AITranslationWrapper></h3>
              <p className="text-sm text-muted-foreground mb-2"><AITranslationWrapper>{t.publishedOnJan12026}</AITranslationWrapper></p>
              <p className="text-muted-foreground mb-4">
                <AITranslationWrapper>{t.advancedTechniquesPerformance}</AITranslationWrapper>
              </p>
              <Button variant="outline" size="sm"><AITranslationWrapper>{t.readArticle}</AITranslationWrapper></Button>
            </article>

            <article className="border-b border-border pb-8">
              <h3 className="text-xl font-semibold mb-2"><AITranslationWrapper>{t.realTimeCollabNews2026}</AITranslationWrapper></h3>
              <p className="text-sm text-muted-foreground mb-2"><AITranslationWrapper>{t.publishedOnDec202025}</AITranslationWrapper></p>
              <p className="text-muted-foreground mb-4">
                <AITranslationWrapper>{t.newCollabFeaturesTeamwork}</AITranslationWrapper>
              </p>
              <Button variant="outline" size="sm"><AITranslationWrapper>{t.readArticle}</AITranslationWrapper></Button>
            </article>
          </div>
        </div>
      </div>
      {/* PromoBox moved to global placement above footer for consistency */}
    </div>
  );
}