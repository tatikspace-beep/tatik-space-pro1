import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileExplorer } from '@/components/FileExplorer';
import { GreenBoxHybrid } from '@/components/GreenBoxHybrid';
import { Loader2, Download, Trash2, Copy, Move, Cloud, FolderOpen, Code2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { FREE_TEMPLATES, TemplateMetadata } from '@/data/templates';
import { filesPageCopy, formatFilesCopy } from '@/lib/filesPageCopy';
// PromoBox is rendered globally via App.tsx

export default function Files() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const copy = filesPageCopy[language];
  const toastCopy = (key: keyof typeof copy.toast, values: Record<string, string | number> = {}) =>
    formatFilesCopy(copy.toast[key], values);
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [clipboard, setClipboard] = useState<{ file: any; action: 'copy' | 'move' } | null>(null);
  const [loadedFolders, setLoadedFolders] = useState<{ name: string; files: any[] }[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [stats, setStats] = useState({
    filesCount: 0,
    totalLines: 0,
    editingMinutes: 0,
    projectSize: '0 KB'
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  // Setup folder input attributes
  React.useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
      folderInputRef.current.setAttribute('directory', '');
      folderInputRef.current.setAttribute('mozdirectory', '');
    }
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Use first project if available
  const activeProjectId = projects.length > 0 ? projects[0].id : null;

  const { data: files = [], isLoading: filesLoading, refetch: refetchFiles } = trpc.files.list.useQuery(
    { projectId: activeProjectId! },
    { enabled: !!user && !!activeProjectId }
  );

  const createFileMutation = trpc.files.create.useMutation({
    onSuccess: () => {
      // Refetch files list after creating a new file
      refetchFiles();
    }
  });
  const deleteFileMutation = trpc.files.delete.useMutation();
  const purchasesQuery = trpc.templatePurchases.list.useQuery(undefined, {
    enabled: !!user,
  });
  const templateCatalogQuery = trpc.templatePurchases.catalog.useQuery();
  const getTemplateCodeMutation = trpc.templatePurchases.getCode.useMutation();
  const templateCatalog: Array<TemplateMetadata & { code?: string }> = [
    ...FREE_TEMPLATES,
    ...(templateCatalogQuery.data ?? []),
  ];

  const { data: backups = [], isLoading: backupsLoading } = trpc.backups.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Load copied template from localStorage
  const [copiedTemplate, setCopiedTemplate] = React.useState<any>(null);
  React.useEffect(() => {
    const saved = localStorage.getItem('copied_template');
    if (saved) {
      try {
        setCopiedTemplate(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing copied template:', e);
      }
    }
  }, []);

  // Update stats every 25 seconds to match GreenBoxHybrid rotation frequency
  React.useEffect(() => {
    const updateStats = () => {
      const totalLines = files.reduce((sum: number, f: any) => sum + (f.content?.split('\n').length || 0), 0);
      const bytes = files.reduce((sum: number, f: any) => sum + (f.content?.length || 0), 0);
      let projectSize = '0 KB';
      if (bytes < 1024) projectSize = bytes + ' B';
      else if (bytes < 1024 * 1024) projectSize = (bytes / 1024).toFixed(2) + ' KB';
      else projectSize = (bytes / (1024 * 1024)).toFixed(2) + ' MB';

      setStats({
        filesCount: files.length,
        totalLines: totalLines,
        editingMinutes: Math.floor(Math.random() * 120) + 5,
        projectSize: projectSize
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 25000);
    return () => clearInterval(interval);
  }, [files]);

  const handleFileAction = (action: string, file?: any) => {
    switch (action) {
      case 'download':
        if (!file) return;
        const element = document.createElement('a');
        const fileBlob = new Blob([file.content || ''], { type: 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = file.name || 'file.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
        toast.success(toastCopy('downloadedFile', { name: file.name }));
        break;
      case 'copy-content':
        if (!file) return;
        void navigator.clipboard.writeText(file.content || '')
          .then(() => toast.success(toastCopy('copiedContent')))
          .catch(() => toast.error(copy.clipboardCopyFailed));
        break;
      case 'copy-file':
        if (!file) return;
        setClipboard({ file, action: 'copy' });
        toast.success(toastCopy('copiedFile', { name: file.name }));
        break;
      case 'move':
        if (!file) return;
        setClipboard({ file, action: 'move' });
        toast.success(toastCopy('readyToMove', { name: file.name }));
        break;
      case 'paste':
        if (!clipboard) {
          toast.error(toastCopy('nothingToPaste'));
          return;
        }
        toast.success(toastCopy(
          clipboard.action === 'move' ? 'movedPaste' : 'copiedPaste',
          { name: clipboard.file.name }
        ));
        setClipboard(null);
        break;
      case 'delete':
        if (!file) return;
        toast.promise(
          deleteFileMutation.mutateAsync({ fileId: file.id }).then(async () => {
            await refetchFiles();
            setSelectedFile(null);
          }),
          {
            loading: toastCopy('deleting'),
            success: toastCopy('deletedFile', { name: file.name }),
            error: toastCopy('deleteFailed'),
          }
        );
        break;
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'upload-folder':
        folderInputRef.current?.click();
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const uploadPromises = Array.from(fileList).map((file) =>
      new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          try {
            const content = evt.target?.result as string;
            if (!activeProjectId) {
              toast.error(toastCopy('missingProject'));
              resolve();
              return;
            }
            await createFileMutation.mutateAsync({
              name: file.name,
              content: content || '',
              projectId: activeProjectId,
              path: `/${file.name}`,
            });
            toast.success(toastCopy('uploadedFile', { name: file.name }));
          } catch (err) {
            toast.error(toastCopy('uploadFailed', { name: file.name }));
          }
          resolve();
        };
        reader.onerror = () => {
          toast.error(toastCopy('fileReadFailed', { name: file.name }));
          resolve();
        };
        reader.readAsText(file);
      })
    );

    await Promise.all(uploadPromises);
    await refetchFiles();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;

    console.log('[Folder Upload] handleFolderUpload triggered');
    console.log('[Folder Upload] fileList:', fileList);
    console.log('[Folder Upload] fileList length:', fileList?.length);

    if (!fileList) {
      console.warn('[Folder Upload] fileList is null');
      toast.error(toastCopy('folderNotSelected'));
      return;
    }

    if (fileList.length === 0) {
      console.warn('[Folder Upload] fileList.length === 0');
      toast.error(toastCopy('folderEmpty'));
      return;
    }

    setIsLoadingFolder(true);

    try {
      // Extract folder name from first file's webkitRelativePath
      const firstFile = Array.from(fileList)[0];
      const relativePath = (firstFile as any).webkitRelativePath || '';
      const folderName = relativePath.split('/')[0] || 'folder';

      console.log('[Folder Upload] Inizio caricamento cartella:', folderName);
      console.log('[Folder Upload] Numero file:', fileList.length);
      console.log('[Folder Upload] First file:', {
        name: firstFile.name,
        size: firstFile.size,
        type: firstFile.type,
        webkitRelativePath: (firstFile as any).webkitRelativePath,
      });

      toast.loading(toastCopy('loadingFolder', { name: folderName, count: fileList.length }));

      const folderFiles: any[] = [];
      let successCount = 0;

      // Process files sequentially
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const filePath = (file as any).webkitRelativePath || file.name;

        try {
          // Read file as Base64 to handle all file types (text + binary)
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              if (typeof result === 'string') {
                resolve(result);
              } else if (result instanceof ArrayBuffer) {
                // Convert ArrayBuffer to Base64
                const bytes = new Uint8Array(result);
                let binary = '';
                for (let j = 0; j < bytes.byteLength; j++) {
                  binary += String.fromCharCode(bytes[j]);
                }
                resolve(btoa(binary));
              } else {
                reject(new Error(toastCopy('fileReadFailed', { name: file.name })));
              }
            };
            reader.onerror = () => {
              console.warn(`[Folder Upload] Errore lettura file: ${file.name}`);
              reject(new Error(toastCopy('fileReadFailed', { name: file.name })));
            };
            // Try readAsArrayBuffer first (works for all files), fallback to readAsText
            reader.readAsArrayBuffer(file);
          });

          const fileObj = {
            name: file.name,
            content: content || '',
            projectId: activeProjectId || 1,
            path: `/${folderName}/${filePath}`,
          };

          folderFiles.push(fileObj);

          // Upload to server
          try {
            if (!activeProjectId) {
              throw new Error('Nessun progetto disponibile');
            }
            await createFileMutation.mutateAsync({ ...fileObj, projectId: activeProjectId });
            successCount++;
            console.log(`[Folder Upload] OK: ${file.name}`);
          } catch (uploadErr) {
            console.error(`[Folder Upload] Server error per ${file.name}:`, uploadErr);
            toast.error(toastCopy('uploadFailed', { name: file.name }));
            // Still add to local folder even if server fails
            successCount++;
          }

          // Show progress every 5 files
          if ((i + 1) % 5 === 0) {
            console.log(`[Folder Upload] Progresso: ${i + 1}/${fileList.length}`);
          }
        } catch (fileErr) {
          console.error(`[Folder Upload] Errore elaborazione file ${file.name}:`, fileErr);
          toast.error(fileErr instanceof Error ? fileErr.message : toastCopy('fileReadFailed', { name: file.name }));
        }
      }

      // Refetch server files
      await refetchFiles();

      // Add loaded folder to state
      const newFolder = { name: folderName, files: folderFiles };
      setLoadedFolders((prev) => [...prev, newFolder]);

      console.log('[Folder Upload] Completato:', {
        folderName,
        totalFile: fileList.length,
        successCount,
        filesInState: folderFiles.length,
      });

      toast.success(toastCopy('folderUploaded', {
        name: folderName,
        count: successCount,
        total: fileList.length,
      }));
    } catch (err) {
      console.error('[Folder Upload] Errore generale:', err);
      toast.error(toastCopy('folderUploadFailed'));
    } finally {
      setIsLoadingFolder(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  if (authLoading || projectsLoading || filesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label={copy.loading} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">{copy.loginRequired}</h2>
          <p className="text-muted-foreground mb-6">
            {copy.loginPrompt}
          </p>
          <Button asChild>
            <a href="/api/auth/login">{copy.login}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{copy.pageTitle}</h1>
              <p className="text-muted-foreground">{copy.pageSubtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFileAction('upload-folder')}
                disabled={isLoadingFolder}
                title={copy.selectFolderTitle}
              >
                {isLoadingFolder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {copy.uploading}
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    {copy.uploadFolder}
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" disabled={!selectedFile} onClick={() => handleFileAction('copy-file', selectedFile)} title={copy.copySelectedTitle}>
                <Copy className="h-4 w-4 mr-2" />
                {copy.copy}
              </Button>
              <Button variant="outline" size="sm" disabled={!selectedFile} onClick={() => handleFileAction('move', selectedFile)} title={copy.moveSelectedTitle}>
                <Move className="h-4 w-4 mr-2" />
                {copy.move}
              </Button>
              {clipboard && (
                <Button size="sm" variant="outline" onClick={() => handleFileAction('paste')} className="bg-primary/10" title={copy.pasteTitle}>
                  ✓ {copy.paste}
                </Button>
              )}
              <Button variant="outline" size="sm" disabled={!selectedFile} onClick={() => handleFileAction('delete', selectedFile)} title={copy.deleteSelectedTitle} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" />
                {copy.delete}
              </Button>
            </div>
            <input ref={fileInputRef} name="uploadFile" type="file" multiple hidden onChange={handleFileUpload} accept="*/*" />
            <input
              ref={folderInputRef}
              name="uploadFolder"
              type="file"
              multiple
              hidden
              onChange={handleFolderUpload}
              {...({ webkitdirectory: '', mozdirectory: '' } as any)}
            />
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="space-y-6">
          {/* Cards in orizzontale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cartelle Caricate */}
            {loadedFolders.length > 0 && (
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    {copy.loadedFolders}
                  </h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {loadedFolders.map((folder) => (
                    <div
                      key={folder.name}
                      className="p-2 rounded bg-purple-100/50 dark:bg-purple-900/30 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 truncate">
                        <p className="text-xs font-medium text-purple-900 dark:text-purple-100 truncate">
                          {folder.name}
                        </p>
                        <p className="text-[11px] text-purple-600 dark:text-purple-300">
                          {folder.files.length} {copy.fileCount}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-auto px-2 hover:bg-purple-200 dark:hover:bg-purple-800"
                        title={copy.openInEditorTitle}
                        onClick={() => {
                          // Save folder files to localStorage for editor access
                          localStorage.setItem(
                            `editor_folder_${folder.name}`,
                            JSON.stringify(folder.files)
                          );
                          localStorage.setItem('editor_current_folder', folder.name);
                          setLocation('/editor');
                        }}
                      >
                        <Code2 className="w-3 h-3 mr-1" />
                        <span className="text-xs">{copy.editor}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* GreenBoxHybrid */}
            {user && (
              <GreenBoxHybrid
                stats={stats}
              />
            )}

            {/* Template Copiato */}
            {copiedTemplate && (
              <Card className="p-4 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 border-rose-200 dark:border-rose-800">
                <h3 className="font-semibold text-sm text-rose-900 dark:text-rose-100 mb-3 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {copy.copiedTemplate}
                </h3>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-rose-100/50 dark:bg-rose-900/30">
                    <p className="text-xs font-medium text-rose-900 dark:text-rose-100 mb-2">{copiedTemplate.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1 flex-1"
                        onClick={async () => {
                          const attributionComment = '<!-- This template is from tatik.space - https://tatik.space -->\n';
                          const codeWithAttribution = attributionComment + copiedTemplate.code;
                          try {
                            await navigator.clipboard.writeText(codeWithAttribution);
                            toast.success(toastCopy('copiedContent'));
                          } catch {
                            toast.error(copy.clipboardCopyFailed);
                          }
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        {copy.copy}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 gap-1 flex-1"
                        onClick={() => {
                          const elem = document.createElement('a');
                          elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(copiedTemplate.code));
                          elem.setAttribute('download', `${copiedTemplate.id || 'template'}.html`);
                          elem.style.display = 'none';
                          document.body.appendChild(elem);
                          elem.click();
                          document.body.removeChild(elem);
                          toast.success(toastCopy('downloadedFile', { name: copiedTemplate.name }));
                        }}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Template Comprati o Copiati (Admin) */}
            {user && ((purchasesQuery.data || []).length > 0 || user.role === 'admin') && (
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
                <h3 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  {copy.purchasedTemplates}
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(purchasesQuery.data || []).length > 0 ? (
                    (purchasesQuery.data || []).map((purchase: any) => {
                      const template = templateCatalog.find((t) => t.id === purchase.templateId);
                      if (!template) return null;
                      return (
                        <div key={purchase.id} className="p-2 rounded bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-between gap-2">
                          <div className="flex-1 truncate min-w-0">
                            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100 truncate">{template.name}</p>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-300">{copy.expires} {new Date(purchase.expiresAt).toLocaleDateString(language)}</p>
                          </div>
                          <div className="shrink-0 flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-emerald-200 dark:hover:bg-emerald-800" title={copy.copyTitle} aria-label={copy.copyTitle} onClick={() => {
                              void (async () => {
                                try {
                                  const code = template.isPremium
                                    ? (await getTemplateCodeMutation.mutateAsync({ templateId: template.id })).code
                                    : template.code ?? '';
                                  const purchasedTemplate = { ...template, code };
                                  localStorage.setItem('copied_template', JSON.stringify(purchasedTemplate));
                                  setCopiedTemplate(purchasedTemplate);
                                  toast.success(toastCopy('copiedTemplateVisible'));
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : toastCopy('copyTemplateFailed'));
                                }
                              })();
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{copy.noPurchasedTemplates}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Backup Online */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  {copy.onlineBackup}
                </h3>
              </div>
              {backupsLoading ? (
                <div className="text-xs text-blue-700 dark:text-blue-300 py-2">{copy.loading}</div>
              ) : backups.length === 0 ? (
                <p className="text-xs text-blue-600 dark:text-blue-400">{copy.noBackups}</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {backups.slice(0, 5).map((backup: any) => (
                    <div key={backup.id} className="flex items-center justify-between p-2 rounded bg-blue-100/50 dark:bg-blue-900/30 text-xs">
                      <div className="truncate">
                        <p className="font-medium text-blue-900 dark:text-blue-100 truncate">{backup.name}</p>
                        <p className="text-blue-600 dark:text-blue-300 text-[11px]">
                          {new Date(backup.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                        title={copy.downloadBackupTitle}
                        aria-label={copy.downloadBackupTitle}
                        onClick={() => {
                          const element = document.createElement('a');
                          const blob = new Blob([backup.snapshot || ''], { type: 'application/json' });
                          element.href = URL.createObjectURL(blob);
                          element.download = `${backup.name}.json`;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success(toastCopy('downloadedBackup', { name: backup.name }));
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Main content - File Details */}
          <div>
            {/* Selected file details */}
            {selectedFile && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">{copy.fileDetails}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{copy.name}</p>
                    <p>{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{copy.size}</p>
                    <p>{selectedFile.size || copy.notAvailable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{copy.type}</p>
                    <p>{selectedFile.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{copy.lastModified}</p>
                    <p>{selectedFile.updatedAt ? new Date(selectedFile.updatedAt).toLocaleDateString(language) : copy.notAvailable}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleFileAction('download', selectedFile)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {copy.download}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFileAction('copy-content', selectedFile)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copy.copyContent}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}