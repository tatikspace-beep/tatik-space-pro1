import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Cloud, Upload, Server, Zap } from 'lucide-react';

export default function Deployment() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Deployment</h1>
            <Link href="/">
              <Button variant="outline">Torna alla Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Pubblica i tuoi progetti in pochi click</h2>
          <p className="text-xl text-muted-foreground mb-8">
            La pubblicazione diretta dei progetti è una funzionalità attualmente in fase di sviluppo.
            Nel frattempo puoi esportare il codice dal menu file dell'editor e caricarlo su qualsiasi
            fornitore di hosting esterno (Vercel, Netlify, ecc.).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-secondary rounded-lg">
              <Cloud className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Hosting Cloud (prossimamente)</h3>
              <p className="text-muted-foreground">
                Presto potrai pubblicare direttamente i tuoi progetti su una nostra piattaforma cloud
                con CDN e SSL automatico.
              </p>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Deploy Automatico (prossimamente)</h3>
              <p className="text-muted-foreground">
                Un wizard faciliterà la connessione al tuo repository Git per deployment continui.
              </p>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <Server className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Ambienti Multipli (in arrivo)</h3>
              <p className="text-muted-foreground">
                Sarà possibile creare ambienti distinti per dev, staging e produzione.
              </p>
            </div>

            <div className="p-6 bg-secondary rounded-lg">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Performance Ottimizzate (futura)</h3>
              <p className="text-muted-foreground">
                Le build includeranno minificazione, caching e supporto SEO avanzato.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Pubblica ora</h3>
            <p className="text-muted-foreground mb-4">
              Per pubblicare un progetto, vai all'editor, apri un progetto e usa il pulsante "Deploy".
            </p>
            <Link href="/editor">
              <Button size="lg">Vai all'Editor</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}