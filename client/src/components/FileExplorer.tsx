import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { filesPageCopy, formatFilesCopy } from '@/lib/filesPageCopy';
import { ChevronRight, ChevronDown, File, Folder, Edit2, Save, RefreshCw, X } from 'lucide-react';
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
  language?: string;
  children?: FileNode[];
}

interface RawFile {
  id: number;
  name: string;
  type: 'file';
  path: string;
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  files: RawFile[]; // Raw flat files from the API
  onSelectFile: (file: FileNode) => void;
  selectedPath?: string;
  onRefreshFile?: (path: string) => void;
  onCloseFile?: (path: string) => void;
  onMoveFile?: (sourcePath: string, destinationFolderPath: string) => void | Promise<void>;
  onRenameFile?: (oldPath: string, newName: string) => void | Promise<void>;
  onRenameFolder?: (folderPath: string, newName: string) => void | Promise<void>;
  onSaveFile?: (path: string, content: string) => void | Promise<void>;
  onCloseFolder?: (path: string) => void;
}

export function FileExplorer({ files, onSelectFile, selectedPath, onRefreshFile, onCloseFile, onMoveFile, onRenameFile, onRenameFolder, onSaveFile, onCloseFolder }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [draggedFilePath, setDraggedFilePath] = useState<string | null>(null);
  const [dragOverFolderPath, setDragOverFolderPath] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [newName, setNewName] = useState('');
  const { language } = useLanguage();
  const copy = filesPageCopy[language];
  const explorerCopy = copy.explorer;
  const toastCopy = (key: keyof typeof copy.toast) => copy.toast[key];
  const isRootPath = (path: string) => path.split('/').filter(Boolean).length === 1;

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

  const handleDrop = async (e: React.DragEvent, destinationFolderPath: string) => {
    e.preventDefault();
    const sourcePath = e.dataTransfer.getData('text/plain');

    if (sourcePath && sourcePath !== destinationFolderPath && onMoveFile) {
      try {
        await onMoveFile(sourcePath, destinationFolderPath);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to move file');
      }
    }

    setDraggedFilePath(null);
    setDragOverFolderPath(null);
  };

  const handleRename = async () => {
    if (renamingPath && newName.trim()) {
      try {
        if (renamingFolder) {
          await onRenameFolder?.(renamingPath, newName.trim());
          toast.success(`${explorerCopy.renameDialog}: ${newName.trim()}`);
        } else {
          await onRenameFile?.(renamingPath, newName.trim());
          toast.success(toastCopy('renamedFile'));
        }
        setRenamingPath(null);
        setNewName('');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to rename file');
      }
    }
  };

  const handleSave = async (node: FileNode) => {
    if (node.type === 'file' && node.content !== undefined) {
      try {
        await onSaveFile?.(node.path, node.content);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to save file');
      }
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
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : onSelectFile(node)}
          aria-label={node.type === 'folder'
            ? formatFilesCopy(expandedFolders[node.path] ? explorerCopy.collapseFolder : explorerCopy.expandFolder, { name: node.name })
            : undefined}
          aria-expanded={node.type === 'folder' ? !!expandedFolders[node.path] : undefined}
          className={`min-w-0 flex-1 text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${draggedFilePath === node.path ? 'opacity-50' : ''
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

        <div className="flex shrink-0 gap-1 pr-2">
          {node.type === 'file' && (
            <>
              <button
                onClick={() => handleSave(node)}
                className="p-1 hover:bg-green-500/30 rounded text-green-400 transition-colors"
                title={explorerCopy.saveFile}
                aria-label={explorerCopy.saveFile}
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setRenamingPath(node.path);
                  setRenamingFolder(false);
                  setNewName(node.name);
                }}
                className="p-1 hover:bg-blue-500/30 rounded text-blue-400 transition-colors"
                title={explorerCopy.renameFile}
                aria-label={explorerCopy.renameFile}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {/* Refresh is only relevant to the selected file. */}
              {node.path === selectedPath && (
                <button
                  onClick={() => onRefreshFile?.(node.path)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  title={explorerCopy.refreshPreview}
                  aria-label={explorerCopy.refreshPreview}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              {isRootPath(node.path) && (
                <button
                  onClick={() => onCloseFile?.(node.path)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  title={explorerCopy.closeFile}
                  aria-label={explorerCopy.closeFile}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </>
          )}
          {node.type === 'folder' && (
            <>
              <button
                onClick={() => {
                  setRenamingPath(node.path);
                  setRenamingFolder(true);
                  setNewName(node.name);
                }}
                className="p-1 hover:bg-blue-500/30 rounded text-blue-400 transition-colors"
                title={explorerCopy.renameDialog}
                aria-label={`${explorerCopy.renameDialog}: ${node.name}`}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {isRootPath(node.path) && (
                <button
                  onClick={() => onCloseFolder?.(node.path)}
                  className="p-1 hover:bg-slate-700 rounded text-slate-200 transition-colors"
                  title={formatFilesCopy(explorerCopy.closeFolderNamed, { name: node.name })}
                  aria-label={formatFilesCopy(explorerCopy.closeFolderNamed, { name: node.name })}
                >
                  <X className="h-4 w-4" />
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
            {explorerCopy.empty}
          </p>
        ) : (
          hierarchicalFiles.map(node => renderNode(node, 0))
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingPath} onOpenChange={(open) => !open && setRenamingPath(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{explorerCopy.renameDialog}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={explorerCopy.newName}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setRenamingPath(null);
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenamingPath(null)}>{explorerCopy.cancel}</Button>
            <Button onClick={handleRename}>{explorerCopy.renameDialog}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}
