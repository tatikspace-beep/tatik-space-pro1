import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';
import { blogPageCopy } from '@/lib/blogPageCopy';

export default function Blog() {
  const { language } = useLanguage();
  const copy = blogPageCopy[language];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <Link href="/">
              <Button variant="outline">{copy.backToHome}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">{copy.heading}</h2>
          <p className="text-muted-foreground mb-8"><AITranslationWrapper>{copy.intro}</AITranslationWrapper></p>

          <div className="space-y-8">
            {copy.articles.map((article) => (
              <article key={article.title} className="border-b border-border pb-8">
                <h3 className="text-xl font-semibold mb-2"><AITranslationWrapper>{article.title}</AITranslationWrapper></h3>
                <p className="text-sm text-muted-foreground mb-2"><AITranslationWrapper>{article.date}</AITranslationWrapper></p>
                <p className="text-muted-foreground mb-4">
                  <AITranslationWrapper>{article.description}</AITranslationWrapper>
                </p>
                <Button variant="outline" size="sm"><AITranslationWrapper>{copy.readArticle}</AITranslationWrapper></Button>
              </article>
            ))}
          </div>
        </div>
      </div>
      {/* PromoBox moved to global placement above footer for consistency */}
    </div>
  );
}