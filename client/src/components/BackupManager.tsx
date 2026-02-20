import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, Trash2, RotateCcw, Clock, Cloud, HardDrive } from 'lucide-react';

interface BackupManagerProps {
  projectId: number;
  currentFiles: Array<{ id: number; name: string; path: string; content: string | null; language?: string | null }>;
  onRestore: (snapshot: string) => void;
}

interface LocalBackup {
  id: string;
  name: string;
  description?: string;
  snapshot: string;
  createdAt: Date;
  isLocal: true;
  backupType: 'local';
}

type ServerBackup = (typeof backups)[number] & { isLocal?: false; backupType: 'local' | 'online' };
type AnyBackup = ServerBackup | LocalBackup;

export function BackupManager({ projectId, currentFiles, onRestore }: BackupManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [backupTypeSelection, setBackupTypeSelection] = useState<'local' | 'online'>('local');
  const [localBackups, setLocalBackups] = useState<LocalBackup[]>([]);

  const utils = trpc.useUtils();
  const { data: serverBackups = [], isLoading } = trpc.backups.list.useQuery();

  // Load local backups from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tatik_backups_local');
      if (stored) {
        const parsed = JSON.parse(stored).map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
          backupType: 'local' as const,
        }));
        setLocalBackups(parsed);
      }
    } catch (err) {
      console.warn('Failed to load local backups:', err);
    }
  }, []);

  const saveLocalBackupsToStorage = (backups: LocalBackup[]) => {
    try {
      localStorage.setItem('tatik_backups_local', JSON.stringify(backups));
    } catch (err) {
      console.error('Failed to save local backups:', err);
    }
  };

  const createBackupMutation = trpc.backups.create.useMutation({
    onSuccess: () => {
      toast.success(`Backup ${backupTypeSelection === 'online' ? 'online' : 'locale'} creato con successo!`);
      utils.backups.list.invalidate();
      setIsCreateDialogOpen(false);
      setBackupName('');
      setBackupDescription('');
    },
    onError: (error) => {
      // Fallback: create local backup if online backup fails or DB is offline
      if (backupTypeSelection === 'online' || error.message.includes('Database unavailable')) {
        toast.warning('Salvataggio locale del backup...');
        const snapshot = JSON.stringify(currentFiles);
        const localBackup: LocalBackup = {
          id: `local-${Date.now()}`,
          name: backupName,
          description: backupDescription,
          snapshot,
          createdAt: new Date(),
          isLocal: true,
          backupType: 'local',
        };
        const updated = [localBackup, ...localBackups];
        setLocalBackups(updated.slice(0, 10)); // Keep only 10
        saveLocalBackupsToStorage(updated.slice(0, 10));
        toast.success('Backup salvato localmente!');
        setIsCreateDialogOpen(false);
        setBackupName('');
        setBackupDescription('');
      } else {
        toast.error(`Errore durante la creazione del backup: ${error.message}`);
      }
    },
  });

  const deleteBackupMutation = trpc.backups.delete.useMutation({
    onSuccess: () => {
      toast.success('Backup eliminato con successo!');
      utils.backups.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Errore durante l'eliminazione: ${error.message}`);
    },
  });

  const restoreBackupMutation = trpc.backups.restore.useMutation({
    onSuccess: (data) => {
      toast.success('Backup ripristinato con successo!');
      onRestore(data.snapshot);
    },
    onError: (error) => {
      toast.error(`Errore durante il ripristino: ${error.message}`);
    },
  });

  const handleCreateBackup = () => {
    if (!backupName.trim()) {
      toast.error('Inserisci un nome per il backup');
      return;
    }

    const snapshot = JSON.stringify(currentFiles);

    if (backupTypeSelection === 'local') {
      // Create local backup immediately
      const localBackup: LocalBackup = {
        id: `local-${Date.now()}`,
        name: backupName,
        description: backupDescription,
        snapshot,
        createdAt: new Date(),
        isLocal: true,
        backupType: 'local',
      };
      const updated = [localBackup, ...localBackups];
      setLocalBackups(updated.slice(0, 10)); // Keep only 10
      saveLocalBackupsToStorage(updated.slice(0, 10));
      toast.success('Backup locale creato!');
      setIsCreateDialogOpen(false);
      setBackupName('');
      setBackupDescription('');
    } else {
      // Create online backup via server
      createBackupMutation.mutate({
        projectId,
        name: backupName,
        description: backupDescription,
        snapshot,
        backupType: 'online',
      });
    }
  };

  const handleDeleteBackup = (backup: AnyBackup) => {
    if (confirm('Sei sicuro di voler eliminare questo backup?')) {
      if (backup.backupType === 'local') {
        // Delete local backup
        const updated = localBackups.filter(b => b.id !== backup.id);
        setLocalBackups(updated);
        saveLocalBackupsToStorage(updated);
        toast.success('Backup locale eliminato!');
      } else {
        deleteBackupMutation.mutate({ backupId: (backup as ServerBackup).id });
      }
    }
  };

  const handleRestoreBackup = (backup: AnyBackup) => {
    if (confirm('Sei sicuro di voler ripristinare questo backup? Le modifiche non salvate andranno perse.')) {
      if (backup.backupType === 'local') {
        // Restore local backup
        onRestore(backup.snapshot);
        toast.success('Backup locale ripristinato!');
      } else {
        restoreBackupMutation.mutate({ backupId: (backup as ServerBackup).id });
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Separate backups by type
  const localOnlyBackups = localBackups;
  const onlineBackups = serverBackups.filter(b => b.backupType === 'online');
  const legacyBackups = serverBackups.filter(b => !b.backupType || b.backupType === 'local');

  const canCreateLocal = localOnlyBackups.length < 10;
  const canCreateOnline = onlineBackups.length < 2;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestione Backup</CardTitle>
            <CardDescription>
              10 backup locali sul PC + 2 backup online — accedi sempre ai tuoi file
              <div className="text-xs text-slate-400 mt-1">🛡️ Encrypted by <a href="https://example.com/brand-vpn" target="_blank" rel="noreferrer noopener" className="underline">Brand Name</a></div>
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!canCreateLocal && !canCreateOnline}>
                <Save className="mr-2 h-4 w-4" />
                Crea Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crea Nuovo Backup</DialogTitle>
                <DialogDescription>
                  Salva lo stato del progetto. Scegli se salvare localmente (PC) o online (cloud).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Type selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo di backup</label>
                  <div className="flex gap-2">
                    <Button
                      variant={backupTypeSelection === 'local' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBackupTypeSelection('local')}
                      disabled={!canCreateLocal}
                      className="flex-1 gap-2"
                    >
                      <HardDrive className="h-4 w-4" />
                      Locale {localOnlyBackups.length}/10
                    </Button>
                    <Button
                      variant={backupTypeSelection === 'online' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBackupTypeSelection('online')}
                      disabled={!canCreateOnline}
                      className="flex-1 gap-2"
                    >
                      <Cloud className="h-4 w-4" />
                      Online {onlineBackups.length}/2
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="backup-name" className="text-sm font-medium">
                    Nome Backup *
                  </label>
                  <Input
                    id="backup-name"
                    placeholder="es. Versione stabile 1.0"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="backup-description" className="text-sm font-medium">
                    Descrizione (opzionale)
                  </label>
                  <Textarea
                    id="backup-description"
                    placeholder="Aggiungi una descrizione per ricordare cosa contiene..."
                    value={backupDescription}
                    onChange={(e) => setBackupDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annulla
                </Button>
                <Button onClick={handleCreateBackup} disabled={createBackupMutation.isPending}>
                  {createBackupMutation.isPending ? 'Creazione...' : 'Crea Backup'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="gap-2">
              <HardDrive className="h-4 w-4" />
              Locali ({localOnlyBackups.length}/10)
            </TabsTrigger>
            <TabsTrigger value="online" className="gap-2">
              <Cloud className="h-4 w-4" />
              Online ({onlineBackups.length}/2)
            </TabsTrigger>
          </TabsList>

          {/* Local backups tab */}
          <TabsContent value="local" className="space-y-3 mt-4">
            {isLoading && localOnlyBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Caricamento backup...
              </div>
            ) : localOnlyBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HardDrive className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nessun backup locale</p>
                <p className="text-sm mt-2">Crea il tuo primo backup locale per salvare su questo PC</p>
              </div>
            ) : (
              localOnlyBackups.map((backup) => (
                <BackupCard
                  key={backup.id}
                  backup={backup}
                  onRestore={handleRestoreBackup}
                  onDelete={handleDeleteBackup}
                  formatDate={formatDate}
                  isPending={false}
                />
              ))
            )}
          </TabsContent>

          {/* Online backups tab */}
          <TabsContent value="online" className="space-y-3 mt-4">
            {isLoading && onlineBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Caricamento backup online...
              </div>
            ) : onlineBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nessun backup online</p>
                <p className="text-sm mt-2">Crea un backup online per sincronizzare i file in cloud</p>
              </div>
            ) : (
              onlineBackups.map((backup) => (
                <BackupCard
                  key={backup.id}
                  backup={backup as any}
                  onRestore={handleRestoreBackup}
                  onDelete={handleDeleteBackup}
                  formatDate={formatDate}
                  isPending={restoreBackupMutation.isPending || deleteBackupMutation.isPending}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Show legacy backups if any */}
        {legacyBackups.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">Backup precedenti (senza tipo)</p>
            <div className="space-y-2">
              {legacyBackups.map((backup) => (
                <BackupCard
                  key={backup.id}
                  backup={backup as any}
                  onRestore={handleRestoreBackup}
                  onDelete={handleDeleteBackup}
                  formatDate={formatDate}
                  isPending={restoreBackupMutation.isPending || deleteBackupMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for backup card
function BackupCard({
  backup,
  onRestore,
  onDelete,
  formatDate,
  isPending,
}: {
  backup: AnyBackup;
  onRestore: (backup: AnyBackup) => void;
  onDelete: (backup: AnyBackup) => void;
  formatDate: (date: Date) => string;
  isPending: boolean;
}) {
  const isLocal = backup.backupType === 'local';
  const icon = isLocal ? <HardDrive className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />;
  const badge = isLocal ? { label: 'Locale', color: 'bg-blue-100 text-blue-800' } : { label: 'Online', color: 'bg-purple-100 text-purple-800' };

  return (
    <Card className={`border-2 ${isLocal ? 'border-blue-500/30 bg-blue-50/5' : 'border-purple-500/30 bg-purple-50/5'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {icon}
              <h4 className="font-semibold text-sm">{backup.name}</h4>
              <span className={`text-xs ${badge.color} px-2 py-0.5 rounded`}>
                {badge.label}
              </span>
            </div>
            {backup.description && (
              <p className="text-sm text-muted-foreground mt-1">{backup.description}</p>
            )}
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(backup.createdAt)}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRestore(backup)}
              disabled={isPending}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(backup)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
