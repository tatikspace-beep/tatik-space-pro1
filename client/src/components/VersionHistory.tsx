import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Version {
  id: string;
  timestamp: Date;
  content: string;
  label?: string;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestore: (version: Version) => void;
}

export function VersionHistory({ versions, onRestore }: VersionHistoryProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const handleRestore = (version: Version) => {
    onRestore(version);
    toast.success(`${t('versionRestored')}: ${version.label || version.timestamp.toLocaleString('it-IT')}`);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="gap-1 px-2 py-1"
      >
        <Clock className="h-4 w-4" />
        {t('versionHistory')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('versionHistory')}
            </DialogTitle>
            <DialogDescription>
              {t('viewRestorePreviousVersions')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 h-[400px]">
            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 font-semibold text-sm">
                {t('versions')} ({versions.length})
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 p-3">
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nessuna versione salvata
                    </p>
                  ) : (
                    versions.map((version, index) => (
                      <button
                        key={version.id}
                        onClick={() => setSelectedVersion(version)}
                        className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedVersion?.id === version.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <div className="font-medium">
                          {version.label || `Versione ${versions.length - index}`}
                        </div>
                        <div className="text-xs opacity-70">
                          {version.timestamp.toLocaleString('it-IT')}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 font-semibold text-sm">
                Anteprima
              </div>
              <ScrollArea className="flex-1">
                {selectedVersion ? (
                  <div className="p-3">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {selectedVersion.content.substring(0, 500)}
                      {selectedVersion.content.length > 500 && '...'}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Seleziona una versione per visualizzare l'anteprima
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <div className="flex items-center gap-3 mr-auto text-xs text-slate-500">
              <span className="font-semibold">🔄</span>
              <a href="https://example.com/infinite-history" target="_blank" rel="noreferrer noopener" className="underline">Get Infinite History</a>
            </div>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Chiudi
            </Button>
            <Button
              onClick={() => selectedVersion && handleRestore(selectedVersion)}
              disabled={!selectedVersion}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Ripristina Versione
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
