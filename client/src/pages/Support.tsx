import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supportPageCopy } from '@/lib/supportPageCopy';

export default function Support() {
  const { language } = useLanguage();
  const copy = supportPageCopy[language] ?? supportPageCopy.en;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <Link href="/">
              <Button variant="outline">{copy.home}</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">{copy.heading}</h2>
          <p className="text-muted-foreground mb-8">{copy.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">{copy.documentation}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {copy.documentationDescription}
              </p>
              <Link href="/documentation">
                <Button variant="outline">{copy.documentationLink}</Button>
              </Link>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">{copy.guides}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {copy.guidesDescription}
              </p>
              <Link href="/tutorials">
                <Button variant="outline">{copy.guidesLink}</Button>
              </Link>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">{copy.forum}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {copy.forumDescription}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">{copy.contact}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {copy.contactDescription}
              </p>
              <Link href="/contact">
                <Button>{copy.contactLink}</Button>
              </Link>
            </Card>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{copy.faq}</h3>
            <div className="space-y-4">
              {copy.faqs.map(([question, answer]) => (
                <details key={question} className="border border-border rounded-lg p-4">
                  <summary className="font-medium cursor-pointer">{question}</summary>
                  <div className="mt-2 text-muted-foreground">{answer}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
