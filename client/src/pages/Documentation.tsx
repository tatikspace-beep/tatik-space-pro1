import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentationPageCopy, supportedExtensions } from '@/lib/documentationPageCopy';

export default function Documentation() {
  const { language } = useLanguage();
  const copy = documentationPageCopy[language] ?? documentationPageCopy.en;

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
          <h2 className="text-3xl font-bold mb-6">{copy.title} Tatik.space Pro</h2>

          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.introHeading}</h3>
              <p className="text-muted-foreground">{copy.intro}</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.editorHeading}</h3>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                {copy.editorSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.featuresHeading}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {copy.features.map(([title, description]) => (
                  <div key={title} className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
              <h3 className="text-xl font-semibold mb-4">{copy.availabilityHeading}</h3>
              <p className="text-muted-foreground mb-3">{copy.deployment}</p>
              <p className="text-muted-foreground">{copy.collaboration}</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.formatsHeading}</h3>
              <p className="text-muted-foreground mb-4">{copy.formatsIntro}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {copy.formatGroups.map((group, index) => (
                  <div key={group} className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">{group}</h4>
                    <p className="text-muted-foreground">{supportedExtensions[index]}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.apiHeading}</h3>
              <p className="text-muted-foreground">{copy.api}</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.marketplaceHeading}</h3>
              <p className="text-muted-foreground mb-4">{copy.marketplaceIntro}</p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                {copy.marketplaceRules.map((rule) => <li key={rule}>{rule}</li>)}
              </ol>
              <p className="text-sm text-muted-foreground mt-4">{copy.marketplaceWarning}</p>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{copy.schoolsHeading}</h3>
              <p className="text-muted-foreground mb-4">{copy.schoolsIntro}</p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                {copy.schoolsRules.map((rule) => <li key={rule}>{rule}</li>)}
              </ol>
              <p className="text-sm text-muted-foreground mt-4">{copy.schoolsWarning}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
