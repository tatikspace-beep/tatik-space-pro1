import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiTransparencyCopy } from '@/lib/aiTransparencyCopy';

export function AITransparencyNotice() {
  const { language } = useLanguage();
  const copy = aiTransparencyCopy[language];

  return (
    <div role="note" className="flex items-start gap-2 border-b bg-muted/20 px-5 py-2 text-[11px] text-muted-foreground">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <p>
        {copy.summary}{' '}
        <Link href="/privacy" className="text-primary underline underline-offset-2">
          {copy.privacyLink}
        </Link>
      </p>
    </div>
  );
}

export function AITransparencySection() {
  const { language } = useLanguage();
  const copy = aiTransparencyCopy[language];

  return (
    <section className="mb-8 rounded-lg border border-border bg-secondary/40 p-4">
      <h3 className="mb-3 text-xl font-semibold">{copy.title}</h3>
      <p className="mb-3 text-muted-foreground">{copy.summary}</p>
      <p className="text-muted-foreground">{copy.processing}</p>
    </section>
  );
}
