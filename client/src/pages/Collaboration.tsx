import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Share2, Lock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { useLanguage } from '@/contexts/LanguageContext';
import { collaborationPageCopy, type CollaborationPageCopy } from '@/lib/collaborationPageCopy';
import { TeamManagement } from '@/components/collaboration/TeamManagement';
import { CollabChat } from '@/components/collaboration/CollabChat';
import { ProjectShare } from '@/components/collaboration/ProjectShare';
import { useCollaboration } from '@/hooks/useCollaboration';

const DEMO_PROJECT_ID = 'proj_demo';
const DEMO_USER_ID = `user_${Math.random().toString(36).slice(2, 8)}`;
type Tab = 'team' | 'chat' | 'share' | 'security';

export default function Collaboration() {
  const { language } = useLanguage();
  const copy = collaborationPageCopy[language] ?? collaborationPageCopy.en;
  const [useOffline, setUseOffline] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('team');
  const {
    status, project, messages, onlineUserIds, error, can,
    sendMessage, inviteMember, changeRole, removeMember, clearError,
  } = useCollaboration({
    projectId: DEMO_PROJECT_ID,
    userId: DEMO_USER_ID,
    userName: copy.demoTitle,
    offline: useOffline,
    offlineProjectName: copy.offlineProjectName,
    offlineSystemMessage: copy.offlineSystemMessage,
  });

  const pageTitle = `${copy.title} — ${copy.demoTitle} | Tatik.space Pro`;
  const description = copy.demoNotice;

  return (
    <div className="min-h-screen bg-background">
      <Seo title={pageTitle} description={description} path="/collaboration" language={language} noIndex />
      <Header copy={copy} />
      {status === 'connecting' && !project ? (
        <main className="container min-h-[60vh] px-4 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">{copy.connectingMessage}</p>
          <DemoNotice text={copy.demoNotice} />
        </main>
      ) : status === 'error' && !project ? (
        <main className="container min-h-[60vh] px-4 flex flex-col items-center justify-center gap-4">
          <WifiOff className="h-12 w-12 text-destructive/50" />
          <p className="font-semibold">{copy.connectionFailed}</p>
          <p className="text-sm text-muted-foreground">{copy.checkServer}</p>
          <DemoNotice text={copy.demoNotice} />
          <Button onClick={() => window.location.reload()}>{copy.retry}</Button>
        </main>
      ) : (
        <main className="container px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <DemoNotice text={copy.demoNotice} />
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-3xl font-bold">{copy.demoTitle}</h2>
                <StatusBadge status={status} copy={copy} />
              </div>
              <button
                className={`text-sm px-3 py-1 rounded ${useOffline ? 'bg-amber-500 text-white' : 'bg-secondary/60'}`}
                onClick={() => setUseOffline((value) => !value)}
              >
                {useOffline ? copy.offline : copy.useOffline}
              </button>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">{copy.tagline}</p>
              {project && (
                <p className="text-sm text-muted-foreground">
                  {copy.project}: <strong className="text-foreground">{useOffline ? copy.offlineProjectName : copy.demoTitle}</strong>
                  <span className="ml-3">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1" />
                    {onlineUserIds.length} {copy.online}
                  </span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Users, title: copy.team, desc: copy.teamDescription, stat: project ? `${project.members.length} ${copy.members}` : '—', tab: 'team' as const, color: 'text-blue-500' },
                { icon: MessageSquare, title: copy.chat, desc: copy.chatDescription, stat: `${messages.filter((message) => message.type === 'text').length} ${copy.messages}`, tab: 'chat' as const, color: 'text-green-500' },
                { icon: Share2, title: copy.sharing, desc: copy.sharingDescription, stat: project?.shareToken ? copy.linkActive : '—', tab: 'share' as const, color: 'text-orange-500' },
                { icon: Lock, title: copy.security, desc: copy.securityDescription, stat: copy.securityTab, tab: 'security' as const, color: 'text-purple-500' },
              ].map(({ icon: Icon, title, desc, stat, tab, color }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`p-5 bg-secondary rounded-lg text-left transition-all hover:bg-secondary/80 hover:shadow-md ${activeTab === tab ? 'ring-2 ring-primary shadow-sm' : ''}`}
                >
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
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    if (value === 'team' || value === 'chat' || value === 'share' || value === 'security') setActiveTab(value);
                  }}
                >
                  <TabsList className="w-full rounded-none border-b h-12 bg-transparent justify-start px-4 gap-4">
                    <TabsTrigger value="team"><Users className="h-4 w-4 mr-1.5" />{copy.teamTab}</TabsTrigger>
                    <TabsTrigger value="chat"><MessageSquare className="h-4 w-4 mr-1.5" />{copy.chatTab}</TabsTrigger>
                    <TabsTrigger value="share"><Share2 className="h-4 w-4 mr-1.5" />{copy.shareTab}</TabsTrigger>
                    <TabsTrigger value="security"><Lock className="h-4 w-4 mr-1.5" />{copy.securityTab}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="team" className="p-6 focus-visible:outline-none">
                    {project ? (
                      <TeamManagement
                        members={project.members}
                        onlineUserIds={onlineUserIds}
                        currentUserId={DEMO_USER_ID}
                        canManage={can.manage}
                        canInvite={can.invite}
                        onInvite={inviteMember}
                        onChangeRole={changeRole}
                        onRemove={removeMember}
                        error={error}
                        onClearError={clearError}
                        copy={copy}
                      />
                    ) : <PlaceholderCard icon={Users} text={copy.connectingMessage} />}
                  </TabsContent>
                  <TabsContent value="chat" className="focus-visible:outline-none">
                    <div className="h-[480px]">
                      <CollabChat messages={messages} onSend={sendMessage} userId={DEMO_USER_ID} copy={copy} language={language} />
                    </div>
                  </TabsContent>
                  <TabsContent value="share" className="p-6 focus-visible:outline-none">
                    {project ? <ProjectShare project={project} copy={copy} /> : <PlaceholderCard icon={Share2} text={copy.loadingProject} />}
                  </TabsContent>
                  <TabsContent value="security" className="p-6 focus-visible:outline-none">
                    <SecurityPanel copy={copy} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">{copy.quickStart}</h3>
              <p className="text-muted-foreground mb-4 text-sm">{copy.quickStartDescription}</p>
              <Link href="/editor"><Button size="lg">{copy.openEditor}</Button></Link>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function DemoNotice({ text }: { text: string }) {
  return <div role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-muted-foreground">{text}</div>;
}

function Header({ copy }: { copy: CollaborationPageCopy }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
      <div className="container px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{copy.title}</h1>
        <Link href="/"><Button variant="outline">{copy.backHome}</Button></Link>
      </div>
    </header>
  );
}

function StatusBadge({ status, copy }: { status: string; copy: CollaborationPageCopy }) {
  const configs = {
    connected: { icon: Wifi, color: 'text-green-500', label: copy.connected },
    connecting: { icon: Loader2, color: 'text-yellow-500', label: copy.connecting },
    disconnected: { icon: WifiOff, color: 'text-gray-400', label: copy.disconnected },
    error: { icon: WifiOff, color: 'text-red-500', label: copy.connectionError },
  } as const;
  const config = configs[status as keyof typeof configs] ?? configs.connecting;
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 text-sm font-normal ${config.color}`}>
      <Icon className={`h-4 w-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}

function PlaceholderCard({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-3">
      <Icon className="h-10 w-10 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SecurityPanel({ copy }: { copy: CollaborationPageCopy }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
        <h3 className="font-semibold text-base">{copy.securityTitle}</h3>
      </div>
      <p role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        {copy.securityNotice}
      </p>
    </div>
  );
}
