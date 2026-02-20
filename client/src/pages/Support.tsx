import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Support() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Supporto</h1>
            <Link href="/">
              <Button variant="outline">Torna alla Home</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Centro Assistenza</h2>
          <p className="text-muted-foreground mb-8">Trova risposte alle tue domande o contatta il nostro team</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Documentazione</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Trova guide dettagliate e tutorial per utilizzare al meglio Tatik.space Pro.
              </p>
              <Link href="/documentation">
                <Button variant="outline">Vai alla Documentazione</Button>
              </Link>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Tutorial Interattivi</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Segui i nostri tutorial guidati passo‑passo direttamente nell'app per apprendere le funzioni principali.
              </p>
              <Link href="/tutorials">
                <Button variant="outline">Apri Tutorial</Button>
              </Link>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Forum della Comunità</h3>
              <p className="text-sm text-muted-foreground mb-4">
                In arrivo: potrai presto confrontarti con altri utenti e condividere suggerimenti.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Contatto Diretto</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Parla con un membro del nostro team di supporto tecnico.
              </p>
              <Link href="/contact">
                <Button>Contatta il Supporto</Button>
              </Link>
            </Card>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Domande Frequenti</h3>
            <div className="space-y-4">
              <details className="border border-border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">Come posso recuperare la mia password?</summary>
                <div className="mt-2 text-muted-foreground">
                  Puoi recuperare la password cliccando su 'Password dimenticata' nella pagina di login. Ti invieremo un'email con un link per reimpostare la password.
                </div>
              </details>
              <details className="border border-border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">Come posso aggiornare il mio piano?</summary>
                <div className="mt-2 text-muted-foreground">
                  Vai alla sezione 'Account' e seleziona 'Piano' per vedere le opzioni disponibili e aggiornare il tuo abbonamento.
                </div>
              </details>
              <details className="border border-border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">Come posso esportare i miei progetti?</summary>
                <div className="mt-2 text-muted-foreground">
                  Hai due modi per esportare i tuoi progetti: (1) Scarica singoli file direttamente dall'editor usando il pulsante "Scarica" nella toolbar, oppure (2) Crea un backup completo del tuo progetto tramite il sistema di backup integrato, che salva uno snapshot JSON di tutti i file e le cartelle.
                </div>
              </details>
              <details className="border border-border rounded-lg p-4">
                <summary className="font-medium cursor-pointer">Come funziona la cronologia delle versioni?</summary>
                <div className="mt-2 text-muted-foreground">
                  Questa funzione è ancora in sviluppo: al momento la cronologia vera e propria non è disponibile. Presto potrai visualizzare e ripristinare vecchie versioni direttamente dall'editor.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
