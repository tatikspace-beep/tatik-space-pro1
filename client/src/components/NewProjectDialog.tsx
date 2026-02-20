import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FolderPlus, FileCode } from 'lucide-react';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, files?: File[]) => void;
}

export function NewProjectDialog({ isOpen, onClose, onCreateProject }: NewProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'name' | 'files'>('name');

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error('Inserisci un nome per il progetto');
      return;
    }

    if (projectName.length > 50) {
      toast.error('Il nome del progetto non può superare 50 caratteri');
      return;
    }

    // Crea il progetto con i file
    onCreateProject(projectName, selectedFiles.length > 0 ? selectedFiles : undefined);

    // Reset
    setProjectName('');
    setSelectedFiles([]);
    setStep('name');
    onClose();
    toast.success(`Progetto "${projectName}" creato con successo!`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filtra solo file di codice
    const validFiles = files.filter(file => {
      const validExtensions = ['.html', '.css', '.js', '.json', '.xml', '.txt', '.md'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      return hasValidExtension;
    });

    if (validFiles.length !== files.length) {
      toast.warning(`${files.length - validFiles.length} file non supportati (solo .html, .css, .js, .json, .xml, .txt, .md)`);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-slate-700');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-slate-700');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-slate-700');

    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(file => {
      const validExtensions = ['.html', '.css', '.js', '.json', '.xml', '.txt', '.md'];
      return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Nuovo Progetto
          </DialogTitle>
          <DialogDescription>
            {step === 'name'
              ? 'Crea un nuovo progetto e inizia a codificare'
              : 'Aggiungi file al tuo progetto (opzionale)'}
          </DialogDescription>
        </DialogHeader>

        {step === 'name' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Nome Progetto *
              </label>
              <Input
                id="projectName"
                placeholder="Es: My Web App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && projectName.trim()) {
                    setStep('files');
                  }
                }}
              />
              <p className="text-xs text-slate-400">
                {projectName.length}/50 caratteri
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Opzioni</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setStep('files')}
                >
                  <Upload className="h-4 w-4" />
                  Aggiungi File (Opzionale)
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={!projectName.trim()}
              >
                Crea Progetto
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-slate-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm font-medium mb-1">
                Trascina i file qui o clicca
              </p>
              <p className="text-xs text-slate-400">
                Supportati: HTML, CSS, JS, JSON, XML, TXT, MD
              </p>
              <input
                ref={fileInputRef}
                name="project-files"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".html,.css,.js,.json,.xml,.txt,.md"
              />
            </div>

            {selectedFiles.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    File Selezionati ({selectedFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-800 rounded text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileCode className="h-4 w-4 flex-shrink-0 text-blue-400" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('name')}
              >
                Indietro
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Aggiungi File
              </Button>
              <Button onClick={handleCreateProject}>
                Crea Progetto
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
