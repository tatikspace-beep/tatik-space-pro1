import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';
import { ChevronDown } from 'lucide-react';

export default function Tutorials() {
  const { t } = useLanguage();
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);

  const toggleTutorial = (tutorialId: string) => {
    setExpandedTutorial(expandedTutorial === tutorialId ? null : tutorialId);
  };

  const tutorials = [
    {
      id: 'intro',
      titleKey: 'introToTatikPro',
      descKey: 'learnBasicsPlatform',
      steps: [
        { titleKey: 'introStep1Title', contentKey: 'introStep1Content' },
        { titleKey: 'introStep2Title', contentKey: 'introStep2Content' },
        { titleKey: 'introStep3Title', contentKey: 'introStep3Content' },
      ],
      resourceLinks: ['extReactDocs', 'extVercelDocs'],
    },
    {
      id: 'editor',
      titleKey: 'useEditor',
      descKey: 'discoverEditorFeatures',
      steps: [
        { titleKey: 'editorStep1Title', contentKey: 'editorStep1Content' },
        { titleKey: 'editorStep2Title', contentKey: 'editorStep2Content' },
        { titleKey: 'editorStep3Title', contentKey: 'editorStep3Content' },
      ],
      resourceLinks: ['extMonacoDocs', 'extTsconfig'],
    },
    {
      id: 'ai',
      titleKey: 'howToUseAI',
      descKey: 'howToUseAI',
      steps: [
        { titleKey: 'aiStep1Title', contentKey: 'aiStep1Content' },
        { titleKey: 'aiStep2Title', contentKey: 'aiStep2Content' },
        { titleKey: 'aiStep3Title', contentKey: 'aiStep3Content' },
      ],
      resourceLinks: ['extAnthropicDocs', 'extOpenAIDocs'],
    },
    {
      id: 'collab',
      titleKey: 'realTimeCollab',
      descKey: 'learnWorkWithDev',
      steps: [
        { titleKey: 'collabStep1Title', contentKey: 'collabStep1Content' },
        { titleKey: 'collabStep2Title', contentKey: 'collabStep2Content' },
        { titleKey: 'collabStep3Title', contentKey: 'collabStep3Content' },
      ],
      resourceLinks: ['extSocketDocs', 'extWsDocs'],
    },
    {
      id: 'files',
      titleKey: 'fileProjectManagement',
      descKey: 'organizeFilesEfficiently',
      steps: [
        { titleKey: 'filesStep1Title', contentKey: 'filesStep1Content' },
        { titleKey: 'filesStep2Title', contentKey: 'filesStep2Content' },
        { titleKey: 'filesStep3Title', contentKey: 'filesStep3Content' },
      ],
      resourceLinks: ['extNpmDocs', 'extTsconfig'],
    },
    {
      id: 'deploy',
      titleKey: 'projectDeploy',
      descKey: 'howToPublishSite',
      steps: [
        { titleKey: 'deployStep1Title', contentKey: 'deployStep1Content' },
        { titleKey: 'deployStep2Title', contentKey: 'deployStep2Content' },
        { titleKey: 'deployStep3Title', contentKey: 'deployStep3Content' },
      ],
      resourceLinks: ['extVercelDocs', 'extNetlifyDocs'],
    },
  ];

  const getTValue = (key: string): string => {
    return (t as Record<string, string>)[key] || key;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t.tutorials}</h1>
            <Link href="/">
              <Button variant="outline">{t.backToHome}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">{t.tutorials} & {t.guides}</h2>
            <p className="text-muted-foreground">
              {getTValue('tutorialsPageDesc')}
            </p>
          </div>

          <div className="space-y-4">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleTutorial(tutorial.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-accent/50 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">{getTValue(tutorial.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <AITranslationWrapper>{getTValue(tutorial.descKey)}</AITranslationWrapper>
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedTutorial === tutorial.id ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedTutorial === tutorial.id && (
                  <div className="border-t border-border bg-muted/30 p-6 space-y-6">
                    {/* Steps */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        {tutorial.steps.length} {getTValue('tutorialSteps')}
                      </h4>
                      {tutorial.steps.map((step, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-4">
                          <h5 className="font-semibold text-sm mb-2">
                            {idx + 1}. {getTValue(step.titleKey)}
                          </h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {getTValue(step.contentKey)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* External Resources */}
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold mb-3">{getTValue('tutorialExtLinks')}</p>
                      <div className="flex flex-wrap gap-2">
                        {tutorial.resourceLinks.map((linkKey) => (
                          <Button
                            key={linkKey}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            asChild
                          >
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              {getTValue(linkKey)}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <Button className="w-full" variant="default">
                        {getTValue('startTutorial')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}