import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Share2, Lock, Wifi, WifiOff, Loader2 } from 'lucide-react';

// Sub-componenti
import { TeamManagement } from '@/components/collaboration/TeamManagement';
import { CollabChat } from '@/components/collaboration/CollabChat';
import { ProjectShare } from '@/components/collaboration/ProjectShare';

// Hook WebSocket
import { useCollaboration } from '@/hooks/useCollaboration';

const CURRENT_USER = {
  id: 'user_' + Math.random().toString(36).slice(2, 8),
  name: 'Utente Demo',
};

export default function Collaboration() {
  const PROJECT_ID = 'proj_demo';

  const [useOffline, setUseOffline] = useState(false);

  const {
    status, project, messages, onlineUserIds, error,
    myRole, can,
    sendMessage, inviteMember, changeRole, removeMember, clearError,
  } = useCollaboration({ projectId: PROJECT_ID, userId: CURRENT_USER.id, userName: CURRENT_USER.name, offline: useOffline });

  const [activeTab, setActiveTab] = useState<'team' | 'chat' | 'share' | 'security'>('team');

  if (status === 'connecting' && !project) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Connessione al server di collaborazione...</p>
      </div>
    </div>
  );

  if (status === 'error' && !project) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <WifiOff className="h-12 w-12 text-destructive/50" />
        <p className="font-semibold">Impossibile connettersi</p>
        <p className="text-sm text-muted-foreground">Verifica che il server sia in esecuzione</p>
        <Button onClick={() => window.location.reload()}>Riprova</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold">Collaborazione in Tempo Reale</h2>
              <StatusBadge status={status} />
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                className={`text-sm px-3 py-1 rounded ${useOffline ? 'bg-amber-500 text-white' : 'bg-secondary/60'}`}
                onClick={() => setUseOffline((v) => !v)}
              >
                {useOffline ? 'Modalità Offline' : 'Usa modalità Offline'}
              </button>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Lavora insieme ad altri sviluppatori sui tuoi progetti in modo semplice e sicuro</p>
            {project && (
              <p className="text-sm text-muted-foreground">Progetto: <strong className="text-foreground">{project.name}</strong>
                {myRole && <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{myRole}</span>}
                <span className="ml-3"><span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1" /> {onlineUserIds.length} online</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Users, title: 'Team Management', desc: 'Invita membri, assegna ruoli e gestisci le autorizzazioni', stat: project ? `${project.members.length} membri` : '—', tab: 'team' as const, color: 'text-blue-500' },
              { icon: MessageSquare, title: 'Chat in Tempo Reale', desc: 'Comunica con il team direttamente nell\'editor', stat: `${messages.filter(m => m.type === 'text').length} messaggi`, tab: 'chat' as const, color: 'text-green-500' },
              { icon: Share2, title: 'Condivisione Progetti', desc: 'Condividi facilmente con colleghi e clienti', stat: project?.shareToken ? 'Link attivo' : '—', tab: 'share' as const, color: 'text-orange-500' },
              { icon: Lock, title: 'Sicurezza Avanzata', desc: 'Controllo degli accessi e crittografia end-to-end', stat: 'TLS 1.3', tab: 'security' as const, color: 'text-purple-500' },
            ].map(({ icon: Icon, title, desc, stat, tab, color }) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`p-5 bg-secondary rounded-lg text-left transition-all hover:bg-secondary/80 hover:shadow-md ${activeTab === tab ? 'ring-2 ring-primary shadow-sm' : ''}`}>
                <div className="flex items-start gap-4">
                  <Icon className={`h-8 w-8 mt-0.5 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                    <p className={`text-xs mt-2 font-medium ${color}`}>{stat}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full rounded-none border-b h-12 bg-transparent justify-start px-4 gap-4">
                  <TabsTrigger value="team" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3"><Users className="h-4 w-4 mr-1.5" /> Team</TabsTrigger>
                  <TabsTrigger value="chat" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3"><MessageSquare className="h-4 w-4 mr-1.5" /> Chat</TabsTrigger>
                  <TabsTrigger value="share" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3"><Share2 className="h-4 w-4 mr-1.5" /> Condivisione</TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-3"><Lock className="h-4 w-4 mr-1.5" /> Sicurezza</TabsTrigger>
                </TabsList>

                <TabsContent value="team" className="p-6 focus-visible:outline-none">
                  {project ? (
                    <TeamManagement
                      members={project.members}
                      onlineUserIds={onlineUserIds}
                      currentUserId={CURRENT_USER.id}
                      canManage={can.manage}
                      canInvite={can.invite}
                      onInvite={inviteMember}
                      onChangeRole={changeRole}
                      onRemove={removeMember}
                      error={error}
                      onClearError={clearError}
                    />
                  ) : (
                    <PlaceholderCard icon={Users} text="Connessione in corso..." />
                  )}
                </TabsContent>

                <TabsContent value="chat" className="focus-visible:outline-none">
                  <div className="h-[480px]"><CollabChat messages={messages} onSend={sendMessage} userId={CURRENT_USER.id} /></div>
                </TabsContent>

                <TabsContent value="share" className="p-6 focus-visible:outline-none">
                  {project ? <ProjectShare project={project} /> : <PlaceholderCard icon={Share2} text="Caricamento progetto..." />}
                </TabsContent>

                <TabsContent value="security" className="p-6 focus-visible:outline-none"><SecurityPanel /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Inizio rapido</h3>
            <p className="text-muted-foreground mb-4 text-sm">Per iniziare a collaborare, crea un nuovo progetto nell'editor e invita i membri del tuo team.</p>
            <Link href="/editor"><Button size="lg">Vai all'Editor</Button></Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Collaborazione</h1>
          <Link href="/"><Button variant="outline">Torna alla Home</Button></Link>
        </div>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    connected: { icon: Wifi, color: 'text-green-500', label: 'Connesso' },
    connecting: { icon: Loader2, color: 'text-yellow-500', label: 'Connessione...' },
    disconnected: { icon: WifiOff, color: 'text-gray-400', label: 'Disconnesso' },
    error: { icon: WifiOff, color: 'text-red-500', label: 'Errore' },
  } as const;
  const cfg = configs[status as keyof typeof configs] ?? configs.connecting;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 text-sm font-normal ${cfg.color}`}>
      <Icon className={`h-4 w-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {cfg.label}
    </span>
  );
}

function PlaceholderCard({ icon: Icon, text }: { icon: React.FC<any>; text: string }) {
  return (
    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
      <Icon className="h-10 w-10 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SecurityPanel() {
  const items = [
    { title: 'Crittografia end-to-end', desc: 'Tutti i messaggi e i file sono cifrati in transito con TLS 1.3 e a riposo con AES-256.', status: 'Attivo' },
    { title: 'Autenticazione a due fattori', desc: 'Protezione aggiuntiva per ogni account. Abilita 2FA nelle impostazioni del profilo.', status: 'Raccomandato' },
    { title: 'Log delle attività', desc: 'Ogni accesso, modifica e condivisione viene registrato con timestamp e IP.', status: 'Attivo' },
    { title: 'Controllo accessi granulare', desc: 'Assegna permessi precisi: Owner, Editor, Viewer. Revoca l\'accesso in qualsiasi momento.', status: 'Attivo' },
    { title: 'Token di sessione sicuri', desc: 'Le sessioni scadono automaticamente dopo inattività. I link di condivisione sono revocabili.', status: 'Attivo' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
        <div>
          <h3 className="font-semibold text-base">Sicurezza Avanzata</h3>
          <p className="text-xs text-muted-foreground">Protezione completa per i tuoi dati</p>
        </div>
      </div>
      <div className="divide-y divide-border rounded-lg border overflow-hidden">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4 p-4 bg-background hover:bg-muted/20 transition-colors">
            <div className="mt-0.5"><Lock className="h-4 w-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
            <span className={`text-xs rounded-full px-2 py-1 flex-shrink-0 font-medium ${item.status === 'Attivo'
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
              }`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}