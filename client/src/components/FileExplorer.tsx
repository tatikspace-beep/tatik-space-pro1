import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronRight, ChevronDown, File, Folder, Edit2, Trash2, Save, RefreshCw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FileNode {
  id: number;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
}

interface RawFile {
  id: number;
  name: string;
  type: 'file';
  path: string;
  content?: string;
}

interface FileExplorerProps {
  files: RawFile[]; // Raw flat files from the API
  onSelectFile: (file: FileNode) => void;
  selectedPath?: string;
  onRefreshFile?: (path: string) => void;
  onCloseFile?: (path: string) => void;
  onMoveFile?: (sourcePath: string, destinationFolderPath: string) => void;
  onRenameFile?: (oldPath: string, newName: string) => void;
  onDeleteFile?: (path: string) => void;
  onSaveFile?: (path: string, content: string) => void;
  openedFolderName?: string | null; // Name of the root open folder
  onCloseFolder?: () => void; // Close the opened folder
}

export function FileExplorer({ files, onSelectFile, selectedPath, onRefreshFile, onCloseFile, onMoveFile, onRenameFile, onDeleteFile, onSaveFile, openedFolderName, onCloseFolder }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [draggedFilePath, setDraggedFilePath] = useState<string | null>(null);
  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirmPath, setDeleteConfirmPath] = useState<string | null>(null);
  const { t } = useLanguage();

  // Helper function to generate a hash for folder IDs
  const generateHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Return positive hash
  };

  // Transform flat files into hierarchical structure
  const hierarchicalFiles = useMemo(() => {
    const rootNodes: FileNode[] = [];
    const nodeMap = new Map<string, FileNode>();

    // First, create all folder nodes
    const folders = new Set<string>();
    files.forEach(file => {
      const pathParts = file.path.split('/').filter(part => part !== '');
      let currentPath = '';

      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
        folders.add(currentPath);
      }
    });

    // Create folder nodes
    folders.forEach(folderPath => {
      const pathParts = folderPath.split('/');
      const folderName = pathParts[pathParts.length - 1];

      const folderNode: FileNode = {
        id: -(generateHash(folderPath) + 1000000), // Use negative number to distinguish from file IDs, offset by 1M to avoid conflicts
        name: folderName,
        type: 'folder',
        path: folderPath,
        children: []
      };

      nodeMap.set(folderPath, folderNode);
    });

    // Create file nodes
    files.forEach(file => {
      const fileNode: FileNode = {
        ...file,
        type: 'file'
      };

      nodeMap.set(file.path, fileNode);
    });

    // Build hierarchy
    nodeMap.forEach(node => {
      if (node.type === 'file') {
        // Find parent folder
        const pathParts = node.path.split('/').filter(part => part !== '');
        if (pathParts.length > 1) {
          pathParts.pop(); // Remove file name to get parent path
          const parentPath = pathParts.join('/');

          const parent = nodeMap.get(parentPath);
          if (parent && parent.type === 'folder') {
            parent.children = parent.children || [];
            parent.children.push(node);
          } else {
            // If no parent found, add to root
            rootNodes.push(node);
          }
        } else {
          // If at root level, add to root
          rootNodes.push(node);
        }
      }
    });

    // Add folders to root or parent folders
    nodeMap.forEach(node => {
      if (node.type === 'folder') {
        const pathParts = node.path.split('/');
        if (pathParts.length > 1) {
          pathParts.pop(); // Remove current folder name to get parent path
          const parentPath = pathParts.join('/');

          const parent = nodeMap.get(parentPath);
          if (parent && parent.type === 'folder') {
            parent.children = parent.children || [];
            parent.children.push(node);
          } else {
            // If no parent found, add to root
            rootNodes.push(node);
          }
        } else {
          // If at root level, add to root
          rootNodes.push(node);
        }
      }
    });

    // Sort nodes: folders first, then files, both alphabetically
    const sortNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.sort((a, b) => {
        // Folders come first
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        // Then alphabetical
        return a.name.localeCompare(b.name);
      }).map(node => {
        if (node.type === 'folder' && node.children) {
          return { ...node, children: sortNodes(node.children) };
        }
        return node;
      });
    };

    return sortNodes(rootNodes);
  }, [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleDragStart = (e: React.DragEvent, filePath: string) => {
    setDraggedFilePath(filePath);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', filePath);
  };

  const handleDragEnd = () => {
    setDraggedFilePath(null);
    setDragOverFolderPath(null);
  };

  const handleDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderPath(folderPath);
  };

  const handleDragLeave = () => {
    setDragOverFolderPath(null);
  };

  const handleDrop = (e: React.DragEvent, destinationFolderPath: string) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');

    if (sourcePath && sourcePath !== destinationFolderPath && onMoveFile) {
      onMoveFile(sourcePath, destinationFolderPath);
    }

    setDraggedFilePath(null);
    setDragOverFolderPath(null);
  };

  const handleRename = () => {
    if (renamingPath && newName.trim()) {
      onRenameFile?.(renamingPath, newName.trim());
      setRenamingPath(null);
      setNewName('');
      toast.success('File rinominato!');
    }
  };

  const handleDelete = (path: string) => {
    onDeleteFile?.(path);
    setDeleteConfirmPath(null);
    toast.success('File eliminato!');
  };

  const handleSave = (node: FileNode) => {
    if (node.type === 'file' && node.content !== undefined) {
      onSaveFile?.(node.path, node.content);
      toast.success('File salvato!');
    }
  };

  const renderNode = (node: FileNode, level = 0) => (
    <div
      key={`${node.id}-${node.path}`}
      draggable={node.type === 'file'}
      onDragStart={(e) => node.type === 'file' && handleDragStart(e, node.path)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => node.type === 'folder' && handleDragOver(e, node.path)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => node.type === 'folder' && handleDrop(e, node.path)}
      className={`group ${node.type === 'folder' && dragOverFolderPath === node.path ? 'bg-blue-500/20' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : onSelectFile(node)}
          className={`flex-1 text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${draggedFilePath === node.path ? 'opacity-50' : ''
            } ${node.type === 'folder' && dragOverFolderPath === node.path ? 'bg-blue-500/30 hover:bg-blue-500/40' : 'hover:bg-slate-700/50'
            } ${node.type === 'file' ? 'text-slate-300 cursor-move' : 'text-slate-200'
            } ${node.type === 'file' && node.path === selectedPath ? 'bg-slate-700' : ''}`}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {node.type === 'folder' && (
            expandedFolders[node.path] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-400" />
          ) : (
            <File className="h-4 w-4 text-slate-400" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {/* Action buttons - visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2 pointer-events-auto z-10">
          {node.type === 'file' && (
            <>
              <button
                onClick={() => handleSave(node)}
                className="p-1 hover:bg-green-500/30 rounded text-green-400 transition-colors"
                title="Salva file"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setRenamingPath(node.path);
                  setNewName(node.name);
                }}
                className="p-1 hover:bg-blue-500/30 rounded text-blue-400 transition-colors"
                title="Rinomina file"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {/* Aggiorna and Chiudi buttons - visible for selected file */}
              {node.path === selectedPath && (
                <>
                  <button
                    onClick={() => onRefreshFile?.(node.path)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                    title="Aggiorna anteprima"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onCloseFile?.(node.path)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                    title="Chiudi file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setDeleteConfirmPath(node.path)}
                className="p-1 hover:bg-red-500/30 rounded text-red-400 transition-colors"
                title="Elimina file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          {node.type === 'folder' && (
            <>
              {openedFolderName && (node.path === openedFolderName || node.path.startsWith(openedFolderName + '/')) ? (
                <>
                  {node.path === openedFolderName ? (
                    <>
                      <button
                        onClick={() => {
                          files.forEach(file => {
                            if (file.path.startsWith(node.path)) {
                              onSaveFile?.(file.path, file.content || '');
                            }
                          });
                          toast.success('Cartella salvata!');
                        }}
                        className="p-1 hover:bg-green-500/30 rounded text-green-400 transition-colors"
                        title="Salva cartella"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onCloseFolder?.()}
                        className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                        title="Chiudi cartella"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        files.forEach(file => {
                          if (file.path.startsWith(node.path)) {
                            onSaveFile?.(file.path, file.content || '');
                          }
                        });
                        toast.success('Cartella salvata!');
                      }}
                      className="p-1 hover:bg-green-500/30 rounded text-green-400 transition-colors"
                      title="Salva cartella"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setDeleteConfirmPath(node.path)}
                  className="p-1 hover:bg-red-500/30 rounded text-red-400 transition-colors"
                  title="Elimina cartella"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {node.type === 'folder' && expandedFolders[node.path] && node.children?.map(child =>
        renderNode(child, level + 1)
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-1">
        {hierarchicalFiles.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            {t.manageFiles}
          </p>
        ) : (
          hierarchicalFiles.map(node => renderNode(node, 0))
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingPath} onOpenChange={(open) => !open && setRenamingPath(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rinomina</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nuovo nome"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setRenamingPath(null);
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingPath(null)}>Annulla</Button>
            <Button onClick={handleRename}>Rinomina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmPath} onOpenChange={(open) => !open && setDeleteConfirmPath(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300">
            Sei sicuro di voler eliminare <strong>{deleteConfirmPath?.split('/').pop()}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmPath(null)}>Annulla</Button>
            <Button variant="destructive" onClick={() => deleteConfirmPath && handleDelete(deleteConfirmPath)}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
