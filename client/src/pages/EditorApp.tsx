import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useProject } from '@/contexts/ProjectContext';
import { trpc } from '@/lib/trpc';
import { suggestExtension, detectLanguage, getExtensionByLanguage } from '@/lib/fileTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BackupManager } from '@/components/BackupManager';
import { BackupDropdown } from '@/components/BackupDropdown';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { PerfCheck } from '@/components/PerfCheck';
import { AIAssistant } from '@/components/AIAssistant';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';
import { VersionHistory } from '@/components/VersionHistory';
import { TemplateMarketplace } from '@/components/TemplateMarketplace';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { AppFooter } from '@/components/AppFooter';
import { AdBanner } from '@/components/AdBanner';
import { TechAd } from '@/components/TechAd';
import { FileExplorer } from '@/components/FileExplorer';
import SearchResultsPanel from '@/components/SearchResultsPanel';
import { GreenBoxHybrid } from '@/components/GreenBoxHybrid';
import { useAutosave } from '@/hooks/useAutosave';
import { getLoginUrl } from '@/const';
import { Loader2, Save, Play, Bot, FolderOpen, FileCode, Search, Menu, X, LogOut, Download, Upload, FolderUp, FilePlus, FolderPlus, Monitor, Smartphone, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '@/components/ui/dropdown-menu';
import { Helmet } from "react-helmet-async";

export default function EditorApp() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { t: i18nT } = useTranslation();
  const { setCurrentProject: setContextProject } = useProject();
  const [currentProject, setCurrentProject] = useState<number | null>(null);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [editorContent, setEditorContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [jsContent, setJsContent] = useState('');
  const [externalPreviewUrl, setExternalPreviewUrl] = useState<string | null>(null);
  const [isCheckingDevServer, setIsCheckingDevServer] = useState(false);
  const [detectedViteProject, setDetectedViteProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [jumpToLine, setJumpToLine] = useState<number | null>(null);
  const [editorHighlights, setEditorHighlights] = useState<{ from: number; to: number }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<'plaintext' | 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'xml' | 'json' | 'markdown' | 'sql'>('plaintext');
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(60);
  const [isPromoCollapsed, setIsPromoCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('editor_promo_collapsed') === '1';
    } catch (e) {
      return false;
    }
  });
  const [versions, setVersions] = useState<any[]>([]);
  const [localFiles, setLocalFiles] = useState<any[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [openedFolderName, setOpenedFolderName] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [savingFilePath, setSavingFilePath] = useState<string | null>(null);
  const [savingFileName, setSavingFileName] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [customSavePath, setCustomSavePath] = useState('');
  const [savingFileContent, setSavingFileContent] = useState<string>('');
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [suggestedExtension, setSuggestedExtension] = useState('');
  const [suggestedLanguage, setSuggestedLanguage] = useState('');
  const [detectedLanguageLabel, setDetectedLanguageLabel] = useState('');
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openFiles, setOpenFiles] = useState<any[]>([]);
  const [confirmCloseDialogOpen, setConfirmCloseDialogOpen] = useState(false);
  const [pendingClosePath, setPendingClosePath] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(256); // default 16rem (64 * 4)
  const [editorWidth, setEditorWidth] = useState(150); // Initial min width
  const [previewWidth, setPreviewWidth] = useState(200); // Preview panel width
  const [isResizing, setIsResizing] = useState<'sidebar' | 'editor' | 'preview' | null>(null);

  // Use refs to keep track of current state for event listeners
  const isResizingRef = useRef<'sidebar' | 'editor' | 'preview' | null>(null);
  const resizeStartRef = useRef<any>({});
  const sidebarWidthRef = useRef(256);
  const editorWidthRef = useRef(150);
  const previewWidthRef = useRef(200);
  const projectSetupAttemptedRef = useRef(false);

  // Update refs whenever state changes
  useEffect(() => {
    isResizingRef.current = isResizing;
  }, [isResizing]);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  useEffect(() => {
    editorWidthRef.current = editorWidth;
  }, [editorWidth]);

  useEffect(() => {
    previewWidthRef.current = previewWidth;
  }, [previewWidth]);



  // Update global project context when folder is opened
  useEffect(() => {
    if (openedFolderName) {
      setContextProject(1, openedFolderName); // Use folder name as project name
    }
    // Don't reset the context when folder is closed - keep it so user can navigate back
  }, [openedFolderName, setContextProject]);

  // Load folder from localStorage when navigating from Files page
  useEffect(() => {
    try {
      const folderName = localStorage.getItem('editor_current_folder');
      if (folderName) {
        const folderFilesJson = localStorage.getItem(`editor_folder_${folderName}`);
        if (folderFilesJson) {
          const folderFiles = JSON.parse(folderFilesJson);
          setOpenedFolderName(folderName);
          setLocalFiles(folderFiles);
          // Clean up localStorage
          localStorage.removeItem('editor_current_folder');
          localStorage.removeItem(`editor_folder_${folderName}`);
          toast.success(`Cartella "${folderName}" caricata dall'editor!`);
        }
      }
    } catch (err) {
      console.error('Error loading folder from localStorage:', err);
    }
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const utils = trpc.useContext();

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      console.log('[EditorApp] Project created:', data.projectId);
      // Auto-select the newly created project
      setCurrentProject(data.projectId);
      utils.projects.list.invalidate();
    },
  });

  // Auto-select first project when list is loaded, or create one if list is empty
  useEffect(() => {
    if (projectSetupAttemptedRef.current) return; // Already attempted setup
    if (!user) return; // Not authenticated yet
    if (projectsLoading) return; // Still loading projects

    projectSetupAttemptedRef.current = true;

    if (projects.length === 0) {
      console.log('[EditorApp] No projects found, creating default project');
      createProjectMutation.mutate({
        name: 'Il mio Progetto',
        description: 'Progetto predefinito',
      });
    } else if (projects.length > 0 && !currentProject) {
      console.log('[EditorApp] Auto-selecting first project:', projects[0].id);
      setCurrentProject(projects[0].id);
    }
  }, [projects, projectsLoading, user, createProjectMutation]);

  const { data: files = [], isLoading: filesLoading } = trpc.files.list.useQuery(
    { projectId: currentProject! },
    { enabled: !!currentProject }
  );
  const createFileMutation = trpc.files.create.useMutation({
    onSuccess: (res) => {
      console.log('[DEBUG] createFileMutation onSuccess:', res);
      toast.success('File creato sul server');
      // Invalidate server files list so it refreshes
      if (currentProject) {
        utils.files.list.invalidate({ projectId: currentProject });
      }
    },
    onError: (err) => {
      toast.error(`Errore creazione file: ${err.message}`);
    },
  });

  // copied template helper
  const [copiedTemplate, setCopiedTemplate] = useState<{ code: string; name: string } | null>(null);
  const [templateToOpen, setTemplateToOpen] = useState<{ code: string; name: string; fileName: string } | null>(null);
  const [fileToOpenId, setFileToOpenId] = useState<string | null>(null);
  const openAttemptedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem('copied_template');
    if (stored) {
      try {
        setCopiedTemplate(JSON.parse(stored));
      } catch { }
    }

    // Check if we need to open a template from localStorage
    const storedTemplate = localStorage.getItem('template_to_open');
    if (storedTemplate) {
      try {
        const templateData = JSON.parse(storedTemplate);
        console.log('[EditorApp] Found template_to_open in localStorage:', templateData.fileName);
        setTemplateToOpen(templateData);
      } catch (err) {
        console.error('[EditorApp] Failed to parse template_to_open:', err);
      }
    }

    // Check if we need to open a file from localStorage
    const fileId = localStorage.getItem('to_open_file_id');
    if (fileId) {
      setFileToOpenId(fileId);
    }
  }, []);

  // Auto-open file when navigating from Files page
  useEffect(() => {
    if (fileToOpenId && files.length > 0 && !openAttemptedRef.current) {
      const foundFile = files.find((f: any) => f.id === parseInt(fileToOpenId));
      if (foundFile) {
        setCurrentFile(foundFile);
        setEditorContent(foundFile.content || '');
        // Detect language from filename
        const ext = foundFile.name?.split('.').pop()?.toLowerCase() || 'html';
        const langMap: any = { html: 'html', css: 'css', js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', json: 'json', py: 'python', java: 'java', rb: 'ruby', php: 'php', xml: 'xml', sql: 'sql' };
        setCurrentLanguage(langMap[ext] || 'html');
        localStorage.removeItem('to_open_file_id');
        setFileToOpenId(null);
        openAttemptedRef.current = true;
        toast.success(`File "${foundFile.name}" aperto!`);
      }
    }
  }, [files, fileToOpenId]);

  const handleOpenCopiedTemplate = async () => {
    if (!copiedTemplate) return;
    try {
      const fileName = `${copiedTemplate.name.replace(/\s+/g, '_')}.html`;
      const fileResult = await createFileMutation.mutateAsync({
        name: fileName,
        content: copiedTemplate.code,
        projectId: currentProject!,
        path: `/${fileName}`,
      });

      // Reload files list to get the new file
      await new Promise(r => setTimeout(r, 500));

      // Find and select the newly created file
      const newFile = {
        id: fileResult.fileId,
        name: fileName,
        content: copiedTemplate.code,
        path: `/${fileName}`,
        projectId: currentProject,
      };

      setCurrentFile(newFile);
      setEditorContent(copiedTemplate.code);
      setCurrentLanguage('html');
      toast.success(`Template "${copiedTemplate.name}" caricato in editor!`);

      localStorage.removeItem('copied_template');
      setCopiedTemplate(null);
    } catch (error) {
      toast.error('Errore apertura template copiato');
    }
  };

  // Auto-open template if coming from purchase
  useEffect(() => {
    const openTemplateFromPurchaseAsync = async () => {
      console.log('[EditorApp] Template opening check:', { templateToOpen: !!templateToOpen, currentProject });

      if (!templateToOpen) {
        console.log('[EditorApp] No template to open');
        return;
      }

      if (!currentProject) {
        console.log('[EditorApp] Waiting for currentProject to be set...');
        return;
      }

      try {
        console.log('[EditorApp] Opening template:', templateToOpen.fileName);
        const fileResult = await createFileMutation.mutateAsync({
          name: templateToOpen.fileName,
          content: templateToOpen.code,
          projectId: currentProject,
          path: `/${templateToOpen.fileName}`,
        });

        // Reload files list to get the new file
        await new Promise(r => setTimeout(r, 500));

        // Find and select the newly created file
        const newFile = {
          id: fileResult.fileId,
          name: templateToOpen.fileName,
          content: templateToOpen.code,
          path: `/${templateToOpen.fileName}`,
          projectId: currentProject,
        };

        setCurrentFile(newFile);
        setEditorContent(templateToOpen.code);
        setCurrentLanguage('html');
        toast.success(`Template "${templateToOpen.name}" caricato in editor!`);

        localStorage.removeItem('template_to_open');
        setTemplateToOpen(null);
      } catch (error) {
        console.error('[EditorApp] Error opening template from purchase:', error);
        toast.error('Errore apertura template');
      }
    };

    openTemplateFromPurchaseAsync();
  }, [templateToOpen, currentProject]);

  const updateFileMutation = trpc.files.update.useMutation({
    onSuccess: () => {
      toast.success('File salvato con successo!');
    },
    onError: (error) => {
      toast.error(`Errore durante il salvataggio: ${error.message}`);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  // Load panel sizes from localStorage
  useEffect(() => {
    try {
      const total = window.innerWidth;
      const sidebar = 256;
      const remaining = total - sidebar - 16; // 16 = space for dividers
      const editor = Math.floor(remaining * 0.5);
      const preview = remaining - editor;
      setSidebarWidth(sidebar);
      setEditorWidth(Math.max(200, editor));
      setPreviewWidth(Math.max(200, preview));
    } catch (err) {
      console.warn('Failed to reset panel sizes:', err);
    }
  }, []);

  // Initialize session start time for editing metrics
  useEffect(() => {
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', new Date().toISOString());
    }
  }, []);

  // Calculate editor width on mount if not set
  useEffect(() => {
    const calculateEditorWidth = () => {
      const mainElement = document.querySelector('main');
      if (mainElement && editorWidth <= 150) { // Only calculate if still at default
        const mainWidth = mainElement.getBoundingClientRect().width;
        if (mainWidth > 0) {
          const calculated = Math.max(300, mainWidth * 0.6);
          setEditorWidth(calculated);
        }
      }
    };

    // Try immediately and also after a small delay
    calculateEditorWidth();
    const timer = setTimeout(calculateEditorWidth, 200);

    return () => clearTimeout(timer);
  }, []);

  // Save panel sizes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tatik_panel_sizes', JSON.stringify({ sidebarWidth, editorWidth, previewWidth }));
    } catch (err) {
      console.warn('Failed to save panel sizes:', err);
    }
  }, [sidebarWidth, editorWidth, previewWidth]);

  // Handle global mouse move for resizing SIDEBAR-EDITOR divisor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingRef.current !== 'sidebar') return;

      const delta = e.clientX - resizeStartRef.current.x;
      const minSidebar = 150;
      const maxSidebar = 400;
      const newSidebarWidth = Math.max(minSidebar, Math.min(maxSidebar, resizeStartRef.current.width + delta));
      const sidebarDelta = newSidebarWidth - resizeStartRef.current.width;
      const newEditorWidth = Math.max(200, (resizeStartRef.current as any).editorWidth - sidebarDelta);

      setSidebarWidth(newSidebarWidth);
      setEditorWidth(newEditorWidth);
      // Update refs immediately
      sidebarWidthRef.current = newSidebarWidth;
      editorWidthRef.current = newEditorWidth;
    };

    const handleMouseUp = () => {
      if (isResizingRef.current === 'sidebar') {
        isResizingRef.current = null;
        document.body.style.userSelect = '';
        setIsResizing(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, false);
      window.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, []);

  // Handle global mouse move for resizing EDITOR-PREVIEW divisor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingRef.current !== 'editor') return;

      const delta = e.clientX - resizeStartRef.current.x;
      const minEditorWidth = 200;
      const newEditorWidth = Math.max(minEditorWidth, resizeStartRef.current.width + delta);
      const editorDelta = newEditorWidth - resizeStartRef.current.width;
      const newPreviewWidth = Math.max(200, (resizeStartRef.current as any).previewWidth - editorDelta);

      setEditorWidth(newEditorWidth);
      setPreviewWidth(newPreviewWidth);
      // Update refs immediately
      editorWidthRef.current = newEditorWidth;
      previewWidthRef.current = newPreviewWidth;
    };

    const handleMouseUp = () => {
      if (isResizingRef.current === 'editor') {
        isResizingRef.current = null;
        document.body.style.userSelect = '';
        setIsResizing(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, false);
      window.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, []);

  // Update preview content in real-time based on selected language and editor content
  // SINGLE effect that handles all preview updates
  useEffect(() => {
    console.log('[Preview Effect] Triggered:', {
      currentFile: currentFile?.name,
      editorContentLength: editorContent.length,
      filesCount: files.length,
      localFilesCount: localFiles.length,
      openedFolderName: openedFolderName
    });

    // Check if file explorer is empty - reset preview
    const totalFiles = files.length + localFiles.length;
    if (totalFiles === 0 && !currentFile) {
      console.log('[Preview Effect] No files available - resetting preview');
      setHtmlContent('');
      setCssContent('');
      setJsContent('');
      return;
    }

    // If a folder is opened, ALWAYS load the complete project (all files together)
    // Don't show individual files - show the whole project preview
    if (openedFolderName) {
      console.log('[Preview Effect] Folder opened - loading complete project');
      const allFiles = localFiles.length > 0 ? localFiles : [...files, ...localFiles];
      if (allFiles.length > 0) {
        let indexHtmlContent = '';
        let cssContent = '';
        let jsContent = '';

        // Find index.html or first HTML file
        for (const f of allFiles) {
          const fileName = (f.path || f.name).toLowerCase();
          if (fileName.includes('index.html')) {
            indexHtmlContent = f.content || '';
            console.log('[Preview] Found index.html:', indexHtmlContent.length, 'bytes');
            break;
          }
        }

        // If no index.html, use first HTML file
        if (!indexHtmlContent) {
          for (const f of allFiles) {
            const fileName = (f.path || f.name).toLowerCase();
            if (fileName.endsWith('.html')) {
              indexHtmlContent = f.content || '';
              console.log('[Preview] Found first HTML file:', fileName, indexHtmlContent.length, 'bytes');
              break;
            }
          }
        }

        // Collect all CSS and JS files
        for (const f of allFiles) {
          const fileName = (f.path || f.name).toLowerCase();
          if (fileName.endsWith('.css')) {
            cssContent += (f.content || '') + '\n';
          } else if ((fileName.endsWith('.js') || fileName.endsWith('.ts')) && !fileName.includes('package.json')) {
            jsContent += (f.content || '') + '\n';
          }
        }

        console.log('[Preview] Loading project - HTML:', indexHtmlContent.length, 'bytes, CSS:', cssContent.length, 'bytes, JS:', jsContent.length, 'bytes');

        // Update preview with project files
        if (indexHtmlContent) {
          setHtmlContent(indexHtmlContent);
          setCssContent(cssContent);
          setJsContent(jsContent);
        }
      }
      return;
    }

    // If editing a file (and no folder is opened), show its content with related files
    if (currentFile) {
      const fileName = (currentFile.name || currentFile.path).toLowerCase();
      const fileContent = editorContent || currentFile.content || '';

      console.log('[Preview Effect] Has currentFile:', { fileName, fileContentLength: fileContent.length });

      // Get all available files for finding related content
      // Always include localFiles even if no folder is opened (single files get added to localFiles)
      const allFiles = localFiles.length > 0 ? localFiles : [...files, ...localFiles];

      // Show HTML files directly
      if (fileName.endsWith('.html')) {
        console.log('[Preview] ✅ Showing HTML file:', fileName, 'Content length:', fileContent.length);
        setHtmlContent(fileContent);
        // Collect related CSS and JS files
        let relatedCss = '';
        let relatedJs = '';
        for (const f of allFiles) {
          const fname = (f.path || f.name).toLowerCase();
          if (fname.endsWith('.css')) {
            relatedCss += (f.content || '') + '\n';
          } else if ((fname.endsWith('.js') || fname.endsWith('.ts')) && !fname.includes('package.json')) {
            relatedJs += (f.content || '') + '\n';
          }
        }
        setCssContent(relatedCss);
        setJsContent(relatedJs);
        return;
      }
      // Show CSS in preview with related HTML and JS
      else if (fileName.endsWith('.css')) {
        console.log('[Preview] ✅ Showing CSS file:', fileName);

        // Find HTML file or create basic one
        let htmlContent = '';
        for (const f of allFiles) {
          const fname = (f.path || f.name).toLowerCase();
          if (fname.endsWith('.html')) {
            htmlContent = f.content || '';
            break;
          }
        }
        // If no HTML found, create basic structure
        if (!htmlContent) {
          htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
  <style></style>
</head>
<body>
  <h1>Anteprima CSS</h1>
  <p>Collegamento CSS attivo</p>
</body>
</html>`;
        }

        // Collect all other CSS and JS files
        let allCss = fileContent + '\n';
        let allJs = '';
        for (const f of allFiles) {
          const fname = (f.path || f.name).toLowerCase();
          if (fname.endsWith('.css') && fname !== fileName) {
            allCss += (f.content || '') + '\n';
          } else if ((fname.endsWith('.js') || fname.endsWith('.ts')) && !fname.includes('package.json')) {
            allJs += (f.content || '') + '\n';
          }
        }

        setHtmlContent(htmlContent);
        setCssContent(allCss);
        setJsContent(allJs);
        return;
      }
      // Show JS in preview with related HTML and CSS
      else if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
        console.log('[Preview] ✅ Showing JS/TS file:', fileName);

        // Find HTML file or create basic one
        let htmlContent = '';
        for (const f of allFiles) {
          const fname = (f.path || f.name).toLowerCase();
          if (fname.endsWith('.html')) {
            htmlContent = f.content || '';
            break;
          }
        }
        // If no HTML found, create basic structure
        if (!htmlContent) {
          const isTypeScript = fileName.endsWith('.ts');
          const langLabel = isTypeScript ? 'TypeScript' : 'JavaScript';
          htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Preview</title>
</head>
<body>
  <h1>Anteprima ${langLabel}</h1>
  <p id="output">Esecuzione ${langLabel}...</p>
  <script></script>
</body>
</html>`;
        }

        // Collect all CSS files and other JS files
        let allCss = '';
        let allJs = fileContent + '\n';
        for (const f of allFiles) {
          const fname = (f.path || f.name).toLowerCase();
          if (fname.endsWith('.css')) {
            allCss += (f.content || '') + '\n';
          } else if ((fname.endsWith('.js') || fname.endsWith('.ts')) && fname !== fileName && !fname.includes('package.json')) {
            allJs += (f.content || '') + '\n';
          }
        }

        setHtmlContent(htmlContent);
        setCssContent(allCss);
        setJsContent(allJs);
        return;
      }
    }

    // If no file being edited, build complete project from files
    // Always use localFiles if available (includes single uploaded files)
    // Otherwise, combine server files and local files
    const allFiles = localFiles.length > 0 ? localFiles : [...files, ...localFiles];
    if (allFiles.length > 0) {
      console.log('[Preview Effect] Building project from all files, count:', allFiles.length, 'openedFolder:', openedFolderName);
      let indexHtmlContent = '';
      let cssContent = '';
      let jsContent = '';

      // Find index.html or first HTML file
      for (const f of allFiles) {
        const fileName = (f.path || f.name).toLowerCase();
        if (fileName.includes('index.html')) {
          indexHtmlContent = f.content || '';
          console.log('[Preview] Found index.html:', indexHtmlContent.length, 'bytes');
          break;
        }
      }

      // If no index.html, use first HTML file
      if (!indexHtmlContent) {
        for (const f of allFiles) {
          const fileName = (f.path || f.name).toLowerCase();
          if (fileName.endsWith('.html')) {
            indexHtmlContent = f.content || '';
            console.log('[Preview] Found first HTML file:', fileName, indexHtmlContent.length, 'bytes');
            break;
          }
        }
      }

      // Collect all CSS and JS files
      for (const f of allFiles) {
        const fileName = (f.path || f.name).toLowerCase();
        if (fileName.endsWith('.css')) {
          cssContent += (f.content || '') + '\n';
        } else if ((fileName.endsWith('.js') || fileName.endsWith('.ts')) && !fileName.includes('package.json')) {
          jsContent += (f.content || '') + '\n';
        }
      }

      console.log('[Preview] Loading project - HTML:', indexHtmlContent.length, 'bytes, CSS:', cssContent.length, 'bytes, JS:', jsContent.length, 'bytes');

      // Update preview with project files
      if (indexHtmlContent) {
        setHtmlContent(indexHtmlContent);
        setCssContent(cssContent);
        setJsContent(jsContent);
      }
    }
  }, [currentFile, editorContent, files, localFiles, openedFolderName]);

  // Detect Vite/React projects and try to connect to common dev server URLs
  useEffect(() => {
    const allFiles = [...files, ...localFiles];
    const names = new Set(allFiles.map(f => (f.path || f.name || '').toLowerCase()));
    const hasViteConfig = Array.from(names).some(n => n.includes('vite.config'));

    // Only detect as Vite project if vite.config is present
    const detected = hasViteConfig;
    setDetectedViteProject(detected);

    if (!detected) {
      setExternalPreviewUrl(null);
      return;
    }

    // Try common dev server ports
    const candidateUrls = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5174'];
    let cancelled = false;
    setIsCheckingDevServer(true);
    (async () => {
      for (const url of candidateUrls) {
        try {
          // Try a simple fetch with no-cors; if it resolves assume server responding
          await fetch(url, { mode: 'no-cors' as RequestMode });
          if (cancelled) return;
          console.log('[DevServer Detection] reachable:', url);
          setExternalPreviewUrl(url);
          setIsCheckingDevServer(false);
          return;
        } catch (e) {
          console.log('[DevServer Detection] not reachable:', url, e);
        }
      }
      if (!cancelled) {
        setExternalPreviewUrl(null);
        setIsCheckingDevServer(false);
      }
    })();

    return () => { cancelled = true; };
  }, [files, localFiles]);



  const handleDownloadFile = () => {
    if (!currentFile) {
      toast.error('Nessun file selezionato');
      return;
    }

    try {
      const content = currentFile.content || '';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFile.name || 'file.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('File scaricato!');
    } catch (err) {
      console.error('Errore download file:', err);
      toast.error('Errore durante il download del file');
    }
  };

  const handleLocalSave = () => {
    if (!currentFile) {
      toast.error('Nessun file selezionato');
      return;
    }

    let mimeType = 'text/plain';
    let fileName = currentFile.name || 'file.txt';

    if (fileName.endsWith('.js') || selectedLanguage === 'javascript') {
      mimeType = 'application/javascript';
      if (!fileName.endsWith('.js')) fileName += '.js';
    } else if (fileName.endsWith('.ts') || selectedLanguage === 'typescript') {
      mimeType = 'application/typescript';
      if (!fileName.endsWith('.ts')) fileName += '.ts';
    } else if (fileName.endsWith('.html') || selectedLanguage === 'html') {
      mimeType = 'text/html';
      if (!fileName.endsWith('.html')) fileName += '.html';
    } else if (fileName.endsWith('.css') || selectedLanguage === 'css') {
      mimeType = 'text/css';
      if (!fileName.endsWith('.css')) fileName += '.css';
    } else if (fileName.endsWith('.py') || selectedLanguage === 'python') {
      mimeType = 'application/x-python';
      if (!fileName.endsWith('.py')) fileName += '.py';
    } else if (fileName.endsWith('.json') || selectedLanguage === 'json') {
      mimeType = 'application/json';
      if (!fileName.endsWith('.json')) fileName += '.json';
    } else if (fileName.endsWith('.xml') || selectedLanguage === 'xml') {
      mimeType = 'application/xml';
      if (!fileName.endsWith('.xml')) fileName += '.xml';
    } else if (fileName.endsWith('.sql') || selectedLanguage === 'sql') {
      mimeType = 'application/sql';
      if (!fileName.endsWith('.sql')) fileName += '.sql';
    } else if (fileName.endsWith('.md') || selectedLanguage === 'markdown') {
      mimeType = 'text/markdown';
      if (!fileName.endsWith('.md')) fileName += '.md';
    }

    try {
      const element = document.createElement('a');
      const fileBlob = new Blob([editorContent], { type: mimeType });
      element.href = URL.createObjectURL(fileBlob);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
      toast.success(`File "${fileName}" salvato localmente!`);
    } catch (err) {
      console.error('Errore salvataggio locale:', err);
      toast.error('Errore durante il salvataggio locale');
    }
  };

  const handleMoveFile = (sourcePath: string, destinationFolderPath: string) => {
    setLocalFiles(prev => {
      const updated = prev.map(file => {
        if (file.path === sourcePath) {
          // Move the file to the new folder
          const fileName = sourcePath.split('/').pop();
          const newPath = destinationFolderPath ? `${destinationFolderPath}/${fileName}` : fileName;
          return { ...file, path: newPath };
        }
        return file;
      });
      toast.success(`File spostato in "${destinationFolderPath}"`);
      return updated;
    });
  };

  const handleRenameFile = (oldPath: string, newName: string) => {
    setLocalFiles(prev => {
      const updated = prev.map(file => {
        if (file.path === oldPath) {
          // Rename the file
          const pathParts = oldPath.split('/');
          pathParts[pathParts.length - 1] = newName;
          const newPath = pathParts.join('/');
          return { ...file, name: newName, path: newPath };
        }
        return file;
      });
      toast.success(`File rinominato a "${newName}"`);
      return updated;
    });
  };

  const handleDeleteFile = (path: string) => {
    setLocalFiles(prev => {
      const updated = prev.filter(file => file.path !== path);
      toast.success('File eliminato');
      return updated;
    });
  };

  const handleCreateNewFile = () => {
    console.log('[DEBUG] handleCreateNewFile called, openedFolderName:', openedFolderName);
    if (!newFileName.trim()) {
      toast.error('Nome file non valido');
      return;
    }

    // Get suggested extension and template
    const suggestion = suggestExtension(newFileName);
    let fileNameWithExt = newFileName;

    // Add extension if not already present
    if (!newFileName.includes('.')) {
      fileNameWithExt = `${newFileName}.${suggestion.extension}`;
    }

    const filePath = openedFolderName ? `${openedFolderName}/${fileNameWithExt}` : fileNameWithExt;
    console.log('[DEBUG] Creating file:', { name: fileNameWithExt, path: filePath, language: suggestion.language, template: suggestion.template });

    const newFile = {
      id: Math.random(),
      name: fileNameWithExt,
      type: 'file' as const,
      path: filePath,
      content: suggestion.template, // Use template as initial content
      isLocal: true,
    };

    setLocalFiles(prev => {
      const newFiles = [
        ...prev,
        newFile
      ];
      console.log('[DEBUG] Updated localFiles:', newFiles);
      return newFiles;
    });

    // Automatically select and open the newly created file
    setCurrentFile(newFile);
    setEditorContent(suggestion.template);
    setSelectedLanguage(suggestion.language as any);

    toast.success(`File "${fileNameWithExt}" creato con template ${suggestion.language}`);
    setNewFileDialogOpen(false);
    setNewFileName('');
    setSuggestedExtension('');
    setSuggestedLanguage('');
  };

  const handleCreateNewFolder = () => {
    console.log('[DEBUG] handleCreateNewFolder called, openedFolderName:', openedFolderName);
    if (!newFolderName.trim()) {
      toast.error('Nome cartella non valido');
      return;
    }
    const folderPath = openedFolderName ? `${openedFolderName}/${newFolderName}` : newFolderName;
    const gitkeepPath = `${folderPath}/.gitkeep`;
    console.log('[DEBUG] Creating folder placeholder:', { folderPath, gitkeepPath });

    setLocalFiles(prev => {
      const newFiles = [
        ...prev,
        {
          id: Math.random(),
          name: newFolderName,
          type: 'folder' as const,
          path: folderPath,
          children: [],
          isLocal: true,
        },
        {
          id: Math.random(),
          name: '.gitkeep',
          type: 'file' as const,
          path: gitkeepPath,
          content: '',
          isLocal: true,
        }
      ];
      console.log('[DEBUG] Updated localFiles (folder):', newFiles);
      return newFiles;
    });

    toast.success(`Cartella "${newFolderName}" creata`);
    setNewFolderDialogOpen(false);
    setNewFolderName('');
  };

  // Open file in tabs (adds to `openFiles` if not present)
  const openFile = (file: any) => {
    console.log('[openFile] Called with:', { name: file.name, path: file.path, contentLength: (file.content || '').length });
    const path = file.path;
    setOpenFiles(prev => {
      const exists = prev.find(f => f.path === path);
      if (exists) return prev;
      const fileObj = {
        ...file,
        content: file.content ?? '',
        savedContent: file.content ?? '',
      };
      console.log('[openFile] Adding to tabs:', { path, contentLength: (fileObj.content || '').length });
      return [...prev, fileObj];
    });
    // Set current and editor content
    console.log('[openFile] Setting currentFile and editorContent:', { name: file.name, contentLength: (file.content || '').length });
    setCurrentFile(file);
    setEditorContent(file.content || '');
  };

  const handleEditorChange = (val: string) => {
    setEditorContent(val);

    // Auto-detect language from content if plaintext
    if (selectedLanguage === 'plaintext' && val.trim().length >= 3) {
      const detected = detectLanguage(val);
      if (detected !== 'plaintext') {
        setDetectedLanguageLabel(detected);
        const extension = getExtensionByLanguage(detected);
        const newFileName = `nuovo-file.${extension}`;
        const newPath = `/nuovo-file.${extension}`;

        const newFile = {
          id: Date.now(),
          name: newFileName,
          path: newPath,
          content: val,
          type: 'file'
        };

        // Create or update - always remove old "nuovo-file.*" entries
        setCurrentFile(newFile);
        setOpenFiles(prev => {
          // Filter out all "nuovo-file" entries (regardless of extension)
          const filtered = prev.filter(f => !f.name?.startsWith('nuovo-file') && !f.path?.startsWith('/nuovo-file'));
          // Add the single new file
          return [...filtered, newFile];
        });
        setLocalFiles(prev => {
          // Filter out all "nuovo-file" entries (regardless of extension)
          const filtered = prev.filter(f => !f.name?.startsWith('nuovo-file') && !f.path?.startsWith('/nuovo-file'));
          // Add the single new file
          return [...filtered, newFile];
        });
      } else {
        setDetectedLanguageLabel('');
      }
    } else {
      setDetectedLanguageLabel('');
    }

    if (currentFile) {
      if (!(selectedLanguage === 'plaintext' && val.trim().length >= 3)) {
        setOpenFiles(prev => prev.map(f => f.path === currentFile.path ? { ...f, content: val } : f));
        setLocalFiles(prev => prev.map(f => f.path === currentFile.path ? { ...f, content: val } : f));
      }
    }
  };

  const closeFileImmediate = (path: string) => {
    setOpenFiles(prev => {
      const next = prev.filter(f => f.path !== path);
      // If no more files and no folder opened, reset preview
      if (next.length === 0 && !openedFolderName) {
        setHtmlContent('');
        setCssContent('');
        setJsContent('');
      }
      return next;
    });

    // Remove file from localFiles if no folder is open (single file mode)
    if (!openedFolderName) {
      setLocalFiles((prev: any[]) => prev.filter(f => f.path !== path));
    }

    setCurrentFile((prev: any) => {
      if (!prev) return null;
      if (prev.path === path) {
        // set to last open file
        const remaining = openFiles.filter(f => f.path !== path);
        if (remaining.length > 0) {
          const last = remaining[remaining.length - 1];
          setEditorContent(last.content || '');
          return last as any;
        }
        setEditorContent('');
        return null;
      }
      return prev;
    });
  };

  const attemptCloseFile = (path: string) => {
    const f = openFiles.find(x => x.path === path);
    if (!f) return;
    const saved = f.savedContent ?? '';
    const current = f.content ?? '';
    if (current !== saved) {
      setPendingClosePath(path);
      setConfirmCloseDialogOpen(true);
    } else {
      closeFileImmediate(path);
    }
  };

  const handleConfirmCloseSave = async () => {
    setConfirmCloseDialogOpen(false);
    if (!pendingClosePath) return;
    const fileToClose = openFiles.find(f => f.path === pendingClosePath);
    if (!fileToClose) {
      setPendingClosePath(null);
      return;
    }
    // bring file to current so save uses correct currentFile
    setCurrentFile(fileToClose as any);
    setEditorContent(fileToClose.content || '');
    try {
      await handleSaveFile();
    } catch (err) {
      console.error('Errore salvataggio durante chiusura:', err);
    }
    // remove after save
    setOpenFiles((prev: any[]) => prev.filter(f => f.path !== pendingClosePath));
    // switch current
    setCurrentFile((prev: any) => {
      if (prev && prev.path === pendingClosePath) {
        const remaining = openFiles.filter(f => f.path !== pendingClosePath);
        if (remaining.length > 0) {
          setEditorContent(remaining[remaining.length - 1].content || '');
          return remaining[remaining.length - 1] as any;
        }
        setEditorContent('');
        return null;
      }
      return prev;
    });
    setPendingClosePath(null);
  };

  const handleConfirmCloseDiscard = () => {
    setConfirmCloseDialogOpen(false);
    if (!pendingClosePath) return;
    setOpenFiles((prev: any[]) => prev.filter(f => f.path !== pendingClosePath));
    setCurrentFile((prev: any) => {
      if (prev && prev.path === pendingClosePath) {
        const remaining = openFiles.filter(f => f.path !== pendingClosePath);
        if (remaining.length > 0) {
          setEditorContent(remaining[remaining.length - 1].content || '');
          return remaining[remaining.length - 1] as any;
        }
        setEditorContent('');
        return null;
      }
      return prev;
    });
    setPendingClosePath(null);
  };

  const handleSaveFile = async () => {
    if (!currentFile) {
      toast.error('Nessun file selezionato');
      return;
    }

    console.log('[DEBUG] handleSaveFile called', {
      currentFile: { name: currentFile.name, path: currentFile.path, isLocal: (currentFile as any).isLocal },
      editorContent: { length: editorContent.length },
      selectedLanguage,
      currentProject
    });

    // If this is a local-only file (created in the client), it will have `isLocal: true`.
    // If there is a current project, create the file on the server and remove the local placeholder.
    if ((currentFile as any).isLocal) {
      console.log('[DEBUG] File is LOCAL - checking if project exists...');
      if (currentProject) {
        try {
          console.log('[DEBUG] HasProject - creating on server...');
          const payload = {
            projectId: currentProject,
            name: currentFile.name,
            path: currentFile.path,
            content: editorContent,
            language: selectedLanguage,
          } as const;

          console.log('[DEBUG] createFile payload:', payload);

          const res = await createFileMutation.mutateAsync(payload as any);

          // Remove local placeholder and set currentFile to server file
          setLocalFiles(prev => prev.filter(f => f.path !== currentFile.path));
          const newServerFile = {
            id: res.fileId,
            name: currentFile.name,
            type: 'file' as const,
            path: currentFile.path,
            content: editorContent,
          };
          setCurrentFile(newServerFile as any);
          // Invalidate server list handled by mutation onSuccess; optionally refetch now
          if (currentProject) utils.files.list.invalidate({ projectId: currentProject });
          // Update openFiles savedContent so tab reflects saved state
          setOpenFiles(prev => {
            const exists = prev.some(f => f.path === newServerFile.path);
            if (exists) {
              return prev.map(f => f.path === newServerFile.path ? { ...f, content: editorContent, savedContent: editorContent } : f);
            }
            return [...prev, { ...newServerFile, savedContent: editorContent }];
          });
          toast.success('File salvato sul server!');
        } catch (err: any) {
          console.error('Errore durante la creazione file sul server:', err);
          toast.error('Errore durante la creazione del file sul server');
        }
      } else {
        // No project open: prompt user to save to local filesystem
        console.log('[DEBUG] No project - exporting to filesystem...');
        handleExportFile(currentFile.path, editorContent);
      }
    } else {
      // Existing DB file: update via RPC
      console.log('[DEBUG] File is SERVER file - updating...');
      updateFileMutation.mutate({
        fileId: currentFile.id,
        content: editorContent,
      });
      // Optimistically mark as saved in open tabs
      setOpenFiles(prev => prev.map(f => f.path === currentFile.path ? { ...f, content: editorContent, savedContent: editorContent } : f));
    }

    // Save version history locally
    setVersions(prev => [
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        content: editorContent,
        label: `Salvataggio manuale - ${new Date().toLocaleTimeString('it-IT')}`,
      },
      ...prev.slice(0, 19),
    ]);
  };

  const handleExportFile = (path: string, content: string) => {
    // Stores file info for save dialog
    const fileName = path.split('/').pop() || 'file.txt';
    setSavingFilePath(path);
    setSavingFileName(fileName);
    setSavingFileContent(content);
    setCustomSavePath(path);
    setSaveDialogOpen(true);
  };

  const handleCloseFolder = () => {
    setLocalFiles([]);
    setOpenedFolderName(null);
    setCurrentFile(null);
    setEditorContent('');
    setOpenFiles([]);
    setHtmlContent('');
    setCssContent('');
    setJsContent('');
    setContextProject(null); // Reset the global project context
    toast.success('Cartella chiusa');
  };

  const handleLinkClick = (href: string) => {
    if (!openedFolderName) {
      console.log('[EditorApp] No folder open, ignoring link click');
      return;
    }

    console.log('[EditorApp] Link clicked:', href, 'in folder:', openedFolderName);

    // Normalize the href (remove leading ./, /,  etc.)
    let normalizedHref = href.replace(/^\.\/?/, '').replace(/^\//, '');

    // Search for the file in localFiles
    let foundFile = localFiles.find(f => {
      const filePath = (f.path || f.name).toLowerCase();
      return filePath.includes(normalizedHref.toLowerCase());
    });

    // If not found, try exact match
    if (!foundFile) {
      foundFile = localFiles.find(f => {
        const fileName = (f.name || f.path).toLowerCase();
        return fileName === normalizedHref.toLowerCase();
      });
    }

    if (foundFile) {
      console.log('[EditorApp] Found file for link:', foundFile.name);
      setCurrentFile(foundFile);
      setEditorContent(foundFile.content || '');

      // Detect file type and set language
      const fileName = (foundFile.name || foundFile.path).toLowerCase();
      if (fileName.endsWith('.html')) {
        setSelectedLanguage('html');
      } else if (fileName.endsWith('.css')) {
        setSelectedLanguage('css');
      } else if (fileName.endsWith('.js')) {
        setSelectedLanguage('javascript');
      } else if (fileName.endsWith('.ts')) {
        setSelectedLanguage('typescript');
      }
    } else {
      console.log('[EditorApp] File not found for link:', href);
      toast.info(`File non trovato: ${href}`);
    }
  };
  const handleSaveLocal = async (fileName: string) => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(savingFileContent);
      await writable.close();
      setSaveDialogOpen(false);
      toast.success(`File "${fileName}" salvato in cartella!`);
      // Update localFiles state so FileExplorer reflects new content
      const savedPath = openedFolderName ? `${openedFolderName}/${fileName}` : fileName;
      setLocalFiles(prev => {
        const exists = prev.some(f => f.path === savedPath);
        if (exists) {
          return prev.map(f => f.path === savedPath ? { ...f, content: savingFileContent } : f);
        }
        return [
          ...prev,
          {
            id: Math.random(),
            name: fileName,
            type: 'file' as const,
            path: savedPath,
            content: savingFileContent,
            isLocal: true,
          }
        ];
      });
      // Set current file to the saved file
      const newCurrent = { id: Math.random(), name: fileName, type: 'file', path: openedFolderName ? `${openedFolderName}/${fileName}` : fileName, content: savingFileContent };
      setCurrentFile(newCurrent as any);
      setEditorContent(savingFileContent);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Errore salvataggio:', err);
        toast.error('Errore nel salvataggio del file');
      }
    }
  };

  const handleSaveToOriginalFolder = async () => {
    if (openedFolderName) {
      // Se una cartella è aperta, salva direttamente lì per mantenere la struttura
      const fileName = savingFileName || 'file.txt';
      const pathParts = (savingFilePath || '').split('/');
      const relativePath = pathParts.slice(1).join('/');

      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        const targetPath = relativePath.split('/');
        let currentDir = dirHandle;

        // Naviga/crea le cartelle
        for (let i = 0; i < targetPath.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(targetPath[i], { create: true });
        }

        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(savingFileContent);
        await writable.close();
        setSaveDialogOpen(false);
        toast.success(`File "${fileName}" salvato mantenendo la struttura!`);
        // Update localFiles with saved content
        const savedPath = savingFilePath || (openedFolderName ? `${openedFolderName}/${fileName}` : fileName);
        setLocalFiles(prev => {
          const exists = prev.some(f => f.path === savedPath);
          if (exists) {
            return prev.map(f => f.path === savedPath ? { ...f, content: savingFileContent } : f);
          }
          return [
            ...prev,
            {
              id: Math.random(),
              name: fileName,
              type: 'file' as const,
              path: savedPath,
              content: savingFileContent,
              isLocal: true,
            }
          ];
        });
        const newCurrent = { id: Math.random(), name: fileName, type: 'file', path: savedPath, content: savingFileContent };
        setCurrentFile(newCurrent as any);
        setEditorContent(savingFileContent);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Errore salvataggio:', err);
          toast.error('Errore nel salvataggio del file');
        }
      }
    } else {
      handleSaveLocal(savingFileName || 'file.txt');
    }
  };

  const handleSaveAs = async () => {
    if (customSavePath.trim()) {
      const fileName = customSavePath.trim().split('/').pop() || 'file.txt';
      await handleSaveLocal(fileName);
    } else {
      toast.error('Inserisci un percorso valido');
    }
  };

  const handleSaveToCloud = () => {
    toast.info('Salvataggio su cloud in sviluppo');
    setSaveDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Create a local file entry and open it so explorer and tabs reflect the file
        const fileObj = {
          id: Math.random(),
          name: file.name,
          type: 'file' as const,
          path: file.webkitRelativePath && file.webkitRelativePath.length > 0 ? file.webkitRelativePath : file.name,
          content: content,
          isLocal: true,
        };

        setLocalFiles(prev => [fileObj, ...prev]);
        // Open in editor (adds to tabs and sets currentFile)
        openFile(fileObj as any);
        toast.success(`File "${file.name}" caricato e aperto!`);
      };
      reader.readAsText(file);
    });
  };

  // Recursively process dropped items from drag-and-drop
  const processDroppedItems = async (dataTransferItems: DataTransferItemList): Promise<any[]> => {
    const items: any[] = [];

    const processItem = async (item: any, path: string = ''): Promise<any[]> => {
      const results: any[] = [];

      if (item.isFile) {
        const file: File = await new Promise((resolve) => item.file(resolve));
        const reader = new FileReader();

        return new Promise((resolve) => {
          reader.onload = (event) => {
            try {
              const content = event.target?.result as string;
              const filePath = path ? `${path}/${file.name}` : file.name;

              results.push({
                id: Math.random(),
                name: file.name,
                type: 'file' as const,
                path: filePath,
                content: content
              });
              resolve(results);
            } catch {
              resolve(results);
            }
          };

          reader.onerror = () => {
            console.error(`Errore lettura: ${file.name}`);
            resolve(results);
          };

          try {
            reader.readAsText(file);
          } catch {
            resolve(results);
          }
        });
      } else if (item.isDirectory) {
        const dirPath = path ? `${path}/${item.name}` : item.name;
        const dirReader = item.createReader();

        return new Promise((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            for (const entry of entries) {
              const entryResults = await processItem(entry, dirPath);
              results.push(...entryResults);
            }
            resolve(results);
          });
        });
      }

      return results;
    };

    for (let i = 0; i < dataTransferItems.length; i++) {
      const item = dataTransferItems[i].webkitGetAsEntry();
      if (item) {
        const itemResults = await processItem(item);
        items.push(...itemResults);
      }
    }

    return items;
  };

  const handleDirectoryPicker = async () => {
    try {
      const dirHandle = await (window as any).showDirectoryPicker();
      setIsLoadingFolder(true);

      const files: any[] = [];

      const walkDirectory = async (handle: any, path: string = '') => {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            const file = await entry.getFile();
            const fullPath = path ? `${path}/${file.name}` : file.name;

            const content = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result && result.length > 0) {
                  console.log('[handleDirectoryPicker] ✅ File letto:', file.name, 'bytes:', result.length);
                } else {
                  console.log('[handleDirectoryPicker] ⚠️ File vuoto:', file.name);
                }
                resolve(result);
              };
              reader.onerror = () => {
                console.log('[handleDirectoryPicker] ❌ Errore FileReader:', file.name);
                resolve('');
              };
              try {
                reader.readAsText(file);
              } catch (e) {
                console.log('[handleDirectoryPicker] ❌ Errore readAsText:', file.name, e);
                resolve('');
              }
            });

            files.push({
              id: Math.random(),
              name: file.name,
              type: 'file' as const,
              path: fullPath,
              content,
              isLocal: true  // Mark as local file so savemechanism works
            });
          } else if (entry.kind === 'directory') {
            const subPath = path ? `${path}/${entry.name}` : entry.name;
            await walkDirectory(entry, subPath);
          }
        }
      };

      const rootFolderName = dirHandle.name;
      await walkDirectory(dirHandle, rootFolderName);

      if (files.length > 0) {
        console.log('[handleDirectoryPicker] ✅ Directory loaded:', {
          folderName: rootFolderName,
          filesCount: files.length,
          filesWithContent: files.filter(f => f.content && f.content.length > 0).length
        });
        // Reset open files and preview when loading new project
        setOpenFiles([]);
        setCurrentFile(null);
        setEditorContent('');
        setHtmlContent('');
        setCssContent('');
        setJsContent('');
        // Replace localFiles completely (don't merge with old ones)
        setLocalFiles(files);
        setOpenedFolderName(dirHandle.name);
        toast.success(`${files.length} file caricati dalla cartella "${dirHandle.name}"!`);
      } else {
        console.log('[handleDirectoryPicker] ⚠️ Nessun file trovato');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Errore showDirectoryPicker:', err);
        toast.error('Errore nel caricamento della cartella. Assicurati di usare Chrome/Edge 86+');
      }
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleDragAndDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (!items) return;

    setIsLoadingFolder(true);

    try {
      const droppedFiles = await processDroppedItems(items);

      if (droppedFiles.length > 0) {
        setLocalFiles(prev => {
          const pathMap = new Map(prev.map(f => [f.path, f]));
          droppedFiles.forEach(f => pathMap.set(f.path, f));
          return Array.from(pathMap.values());
        });
        toast.success(`${droppedFiles.length} file caricati dalla cartella!`);
      }
    } catch (err) {
      console.error('Errore drag-drop:', err);
      toast.error('Errore nel caricamento');
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoadingFolder(true);
    const uploadPromises = Array.from(files).map((file) => {
      return new Promise<any>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const filePath = (file as any).webkitRelativePath || file.name;

          resolve({
            id: Math.random(),
            name: file.name,
            type: 'file' as const,
            path: filePath,
            content: content
          });
        };
        reader.onerror = () => {
          console.error(`Errore: ${file.name}`);
          resolve(null);
        };

        try {
          reader.readAsText(file);
        } catch {
          reader.readAsText(file);
        }
      });
    });

    Promise.all(uploadPromises).then((uploadedFilesRaw) => {
      const uploadedFiles = uploadedFilesRaw.filter(f => f !== null);

      if (uploadedFiles.length > 0) {
        setLocalFiles(prev => {
          const pathMap = new Map(prev.map(f => [f.path, f]));
          uploadedFiles.forEach(f => pathMap.set(f.path, f));
          return Array.from(pathMap.values());
        });
        toast.success(`${uploadedFiles.length} file caricati dalla cartella!`);
      }
      setIsLoadingFolder(false);
    }).catch((err) => {
      console.error('Errore upload cartella:', err);
      toast.error('Errore nel caricamento');
      setIsLoadingFolder(false);
    });
  };

  const handleTemplateInsert = (code: string, language: string) => {
    setEditorContent(code);

    // Map language to selectedLanguage type
    const langMap: Record<string, any> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'plaintext',
      'java': 'plaintext',
      'json': 'json',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
    };

    const selectedLang = langMap[language.toLowerCase()] || 'plaintext';
    setSelectedLanguage(selectedLang);

    const extension = getExtensionByLanguage(language);
    const newFileName = `nuovo-file.${extension}`;
    const newPath = `/nuovo-file.${extension}`;

    const newFile = {
      id: Date.now(),
      name: newFileName,
      path: newPath,
      content: code,
      type: 'file'
    };

    setCurrentFile(newFile);
    setOpenFiles(prev => {
      const filtered = prev.filter(f => !f.name?.startsWith('nuovo-file') && !f.path?.startsWith('/nuovo-file'));
      return [...filtered, newFile];
    });
    setLocalFiles(prev => {
      const filtered = prev.filter(f => !f.name?.startsWith('nuovo-file') && !f.path?.startsWith('/nuovo-file'));
      return [...filtered, newFile];
    });

    setDetectedLanguageLabel(language.toUpperCase());

    // Auto-run preview for HTML templates
    if (language.toLowerCase() === 'html') {
      setHtmlContent(code);
      setJsContent('');
      setCssContent('');
      toast.success(`Template ${language} inserito e in anteprima!`);
    } else if (language.toLowerCase() === 'css') {
      setCssContent(code);
      setHtmlContent('');
      setJsContent('');
      toast.success(`Template ${language} inserito!`);
    } else if (language.toLowerCase() === 'javascript') {
      setJsContent(code);
      setHtmlContent('');
      setCssContent('');
      toast.success(`Template ${language} inserito!`);
    }
  };

  const handleRunCode = () => {
    if (selectedLanguage === 'html') {
      setHtmlContent(editorContent);
      setJsContent('');
      setCssContent('');
    } else if (selectedLanguage === 'css') {
      setCssContent(editorContent);
    } else if (selectedLanguage === 'javascript') {
      setJsContent(editorContent);
    }
    toast.success('Codice eseguito!');
  };

  const handleRestoreBackup = (snapshot: string) => {
    try {
      const restoredFiles = JSON.parse(snapshot);

      // Update localFiles with restored files
      setLocalFiles(restoredFiles);

      // Close all currently open files
      setOpenFiles([]);

      // Clear the editor
      setEditorContent('');
      setCurrentFile(null);

      // If there are restored files, open the first one
      if (restoredFiles.length > 0) {
        const firstFile = restoredFiles[0];
        setCurrentFile(firstFile);
        setEditorContent(firstFile.content || '');

        // Add to open files
        setOpenFiles([{
          ...firstFile,
          savedContent: firstFile.content || ''
        }]);

        // Detect language from file extension
        const fileName = firstFile.name.toLowerCase();
        if (fileName.endsWith('.html')) {
          setSelectedLanguage('html');
          setHtmlContent(firstFile.content || '');
          setCssContent('');
          setJsContent('');
        } else if (fileName.endsWith('.css')) {
          setSelectedLanguage('css');
          setHtmlContent('');
          setCssContent(firstFile.content || '');
          setJsContent('');
        } else if (fileName.endsWith('.js') || fileName.endsWith('.javascript')) {
          setSelectedLanguage('javascript');
          setHtmlContent('');
          setCssContent('');
          setJsContent(firstFile.content || '');
        } else if (fileName.endsWith('.ts') || fileName.endsWith('.typescript')) {
          setSelectedLanguage('typescript');
          setHtmlContent('');
          setCssContent('');
          setJsContent(firstFile.content || '');
        } else {
          setSelectedLanguage('plaintext');
          setHtmlContent('');
          setCssContent('');
          setJsContent('');
        }
      }

      toast.success(`Backup ripristinato: ${restoredFiles.length} file caricati`);
    } catch (error) {
      console.error('Errore durante il ripristino del backup:', error);
      toast.error('Errore durante il ripristino del backup');
    }
  };

  const handleRestoreVersion = (version: any) => {
    setEditorContent(version.content);
    toast.success('Versione ripristinata');
  };

  // Live highlight matches in the currently open file as the user types in search
  useEffect(() => {
    if (!searchQuery) {
      setEditorHighlights([]);
      setJumpToLine(null);
      return;
    }

    const q = searchQuery;
    if (!currentFile) return;

    const content = (currentFile.content ?? editorContent) || '';
    const lower = content.toLowerCase();
    const ql = q.toLowerCase();
    const ranges: { from: number; to: number }[] = [];
    let idx = 0;
    while (true) {
      const found = lower.indexOf(ql, idx);
      if (found === -1) break;
      ranges.push({ from: found, to: found + q.length });
      idx = found + q.length;
    }

    setEditorHighlights(ranges);
    if (ranges.length > 0) {
      const first = ranges[0];
      const line = content.slice(0, first.from).split(/\r?\n/).length;
      setJumpToLine(line);
    } else {
      setJumpToLine(null);
    }
  }, [searchQuery, currentFile, editorContent]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Accesso Richiesto</h2>
          <p className="text-muted-foreground mb-6">
            {t.please} {t.login} {t.toAccess} Tatik.space Pro
          </p>
          <Button asChild>
            <a href="/login">{t.login}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-20 py-0 flex items-center justify-between" style={{ height: '50px' }}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-slate-700"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-bold">
            Tatik.space Pro Editor
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <AdBanner />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {isSidebarOpen && (
          <aside
            className="bg-slate-800 border-r border-slate-700 flex flex-col hidden md:flex"
            style={{ width: `${sidebarWidth}px`, minWidth: '150px', maxWidth: '400px', position: 'relative' }}
          >
            {/* Search Results Panel - Positioned absolutely within sidebar */}
            {searchQuery && searchPanelOpen && (
              <div
                className="z-50 overflow-auto flex flex-col bg-slate-900 border border-slate-700 p-0.5 text-xs"
                style={{
                  position: 'absolute',
                  left: '0px',
                  top: '90px',
                  width: '100%',
                  height: 'calc(100% - 90px)',
                  boxSizing: 'border-box'
                }}
              >
                <div className="flex items-center justify-between mb-0 flex-shrink-0">
                  <div className="text-xs font-semibold">Risultati ricerca</div>
                  <button onClick={() => setSearchPanelOpen(false)} className="text-xs text-slate-400 px-1.5 py-0.5 border border-slate-700 rounded bg-slate-800 hover:bg-slate-700 flex-shrink-0">Nascondi</button>
                </div>
                {/* In-Search Premium Result (sponsored) */}
                {searchQuery && searchQuery.trim().length > 0 && (
                  <div className="mb-0.5 p-1 rounded border border-slate-700 bg-gradient-to-r from-indigo-900/60 to-slate-900/40 w-full min-w-0">
                    <div className="flex items-start justify-between gap-1 w-full min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-indigo-200 font-semibold">[Sponsored] Best React Component Library (Open Source)</div>
                        <div className="text-[9px] text-slate-300 truncate">Libreria UI ottimizzata per performance e accessibilità — componenti pronti, theming, e supporto enterprise.</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a href="https://example.com/best-react-library" target="_blank" rel="noreferrer noopener" className="text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white px-1.5 py-0.5 rounded">Scopri</a>
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-400 mt-0.5">CPA/CPC — risultato sponsorizzato, mostrato in posizione privilegiata</div>
                  </div>
                )}

                <div className="overflow-auto flex-1 min-h-0">
                  <SearchResultsPanel
                    query={searchQuery}
                    localFiles={localFiles}
                    onOpenMatch={(file: any, line: any, from: any, to: any) => {
                      // open file and highlight
                      setCurrentFile(file as any);
                      setEditorContent(file.content || '');
                      setSelectedLanguage(file.name?.endsWith('.html') ? 'html' : file.name?.endsWith('.css') ? 'css' : file.name?.endsWith('.js') ? 'javascript' : 'plaintext');
                      setJumpToLine(line);
                      setEditorHighlights([{ from, to }]);
                      setSearchPanelOpen(false);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2 h-10">
              <h2 className="text-sm font-semibold text-slate-300">{i18nT('fileExplorer')}</h2>
              {openedFolderName && (
                <div className="flex items-center justify-between gap-2 ml-auto">
                  <p className="text-xs text-blue-400">
                    📁 {openedFolderName}
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleCloseFolder}
                    title={`Chiudi: ${openedFolderName}`}
                  >
                    Chiudi
                  </Button>
                </div>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 border-2 border-dashed border-slate-600 hover:border-slate-400 transition-colors rounded min-h-0 h-full"
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('bg-slate-700');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-slate-700');
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('bg-slate-700');
                handleDragAndDrop(e as any);
              }}
            >
              {isLoadingFolder && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}
              {!isLoadingFolder && (
                <FileExplorer
                  files={[
                    ...files.map(f => ({
                      id: f.id,
                      name: f.name,
                      type: 'file' as const,
                      path: f.path,
                      content: f.content || undefined
                    })),
                    ...localFiles
                  ]}
                  selectedPath={currentFile?.path}
                  openedFolderName={openedFolderName}
                  onSelectFile={(file) => {
                    if (file.type === 'file') {
                      console.log('[FileExplorer Click]', {
                        fileName: file.name,
                        path: file.path,
                        contentLength: (file.content || '').length,
                        hasContent: !!file.content
                      });

                      // Open file in editor tabs
                      openFile(file);

                      // Detect language and update preview based on file extension
                      const fileName = (file.name || file.path || '').toLowerCase();
                      const detectedLang = detectLanguage(file.content || '');

                      setSelectedLanguage(detectedLang as 'plaintext' | 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'xml' | 'json' | 'markdown' | 'sql');

                      if (fileName.endsWith('.html')) {
                        console.log('[FileExplorer] Setting HTML preview, content length:', (file.content || '').length);
                        setHtmlContent(file.content || '');
                        setCssContent('');
                        setJsContent('');
                      } else if (fileName.endsWith('.css')) {
                        console.log('[FileExplorer] Setting CSS preview, content length:', (file.content || '').length);
                        setHtmlContent('');
                        setCssContent(file.content || '');
                        setJsContent('');
                      } else if (fileName.endsWith('.js') || fileName.endsWith('.javascript')) {
                        console.log('[FileExplorer] Setting JS preview, content length:', (file.content || '').length);
                        setHtmlContent('');
                        setCssContent('');
                        setJsContent(file.content || '');
                      } else if (fileName.endsWith('.ts') || fileName.endsWith('.typescript')) {
                        console.log('[FileExplorer] Setting TS preview, content length:', (file.content || '').length);
                        setHtmlContent('');
                        setCssContent('');
                        setJsContent(file.content || '');
                      } else {
                        console.log('[FileExplorer] Setting plaintext preview');
                        setHtmlContent('');
                        setCssContent('');
                        setJsContent('');
                      }
                    }
                  }}
                  onRefreshFile={(path) => { console.log('[FileExplorer] refresh requested for', path); setPreviewKey(k => k + 1); }}
                  onCloseFile={(path) => { attemptCloseFile(path); }}
                  onCloseFolder={handleCloseFolder}
                  onMoveFile={handleMoveFile}
                  onRenameFile={handleRenameFile}
                  onDeleteFile={handleDeleteFile}
                  onSaveFile={handleExportFile}
                />
              )}
            </div>

            {/* Sidebar promo (editor) - vertical layout, collapsible with arrow */}
            <div className="px-3 mt-3">
              <div
                className="w-full overflow-hidden transition-all duration-300"
                style={{ height: isPromoCollapsed ? 0 : 'auto' }}
              >
                <div className="w-full flex flex-col items-center justify-center gap-1 border-t border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-3 py-2 rounded">
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">{i18nT('freeTrialLabel')}</span>

                  <span style={{ color: '#60a5fa' }} className="text-lg font-extrabold leading-tight">
                    {trialDaysLeft}
                  </span>

                  <span className="text-xs text-white">{i18nT('days')}</span>

                  <span className="text-xs font-semibold text-slate-100">{i18nT('plan')}</span>

                  <Button
                    className="h-7 px-3 text-xs font-semibold shadow-lg mt-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={() => toast.info('Upgrade in sviluppo...')}
                  >
                    {i18nT('upgradeToPro')}
                  </Button>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 mt-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => {
                  const next = !isPromoCollapsed;
                  try {
                    localStorage.setItem('editor_promo_collapsed', next ? '1' : '0');
                  } catch (e) {
                    // ignore
                  }
                  setIsPromoCollapsed(next);
                }}
              >
                {isPromoCollapsed ? (
                  <>
                    <ChevronDown size={16} />
                    <span>{i18nT('expandPromo')}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="rotate-180" />
                    <span>{i18nT('collapsePromo')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 border-t border-slate-700" style={{ position: 'relative' }}>
              <GreenBoxHybrid
                stats={{
                  filesCount: localFiles.length + files.length,
                  totalLines: Math.floor(
                    ([...localFiles, ...files]
                      .reduce((sum, f) => sum + (f.content || '').split('\n').length, 0))
                  ),
                  editingMinutes: Math.floor(
                    (Date.now() - (new Date(sessionStorage.getItem('sessionStart') || Date.now()).getTime())) / 60000
                  ),
                  projectSize: (() => {
                    const bytes = [...localFiles, ...files].reduce((sum, f) => sum + (f.content || '').length, 0);
                    if (bytes < 1024) return bytes + ' B';
                    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
                    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                  })(),
                }}
              />
            </div>
          </aside>
        )}


        {/* DIVIDER 1: Sidebar ↔ Editor (positioned between sidebar and main) */}
        {isSidebarOpen && (
          <div
            className="hidden md:block cursor-col-resize hover:bg-slate-600/50 transition-colors"
            style={{
              position: 'relative',
              width: 8,
              height: '100%',
              zIndex: 40,
              backgroundColor: 'rgba(100, 116, 139, 0.3)'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              isResizingRef.current = 'sidebar';
              // Save all three initial widths for mirror compensation
              resizeStartRef.current = {
                x: e.clientX,
                width: sidebarWidthRef.current,
                editorWidth: editorWidthRef.current,
                previewWidth: previewWidthRef.current
              };
              document.body.style.userSelect = 'none';
              setIsResizing('sidebar');
            }}
          >
            <div style={{ width: 3, height: '100%', margin: '0 auto', background: 'rgba(148,163,184,0.5)', borderRadius: 1.5 }} />
          </div>
        )}

        <main className="flex-1 flex flex-col">
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-3 overflow-x-auto h-10">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cerca nel codice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchPanelOpen(true)}
                className="max-w-[220px] bg-slate-900 border-slate-700 text-white"
              />
              <button
                onClick={() => setSearchPanelOpen(!searchPanelOpen)}
                title={searchPanelOpen ? 'Nascondi risultati ricerca' : 'Mostra risultati ricerca'}
                className={`text-xs px-1.5 py-0.5 border rounded flex-shrink-0 transition-colors ${searchPanelOpen ? 'border-indigo-600 bg-indigo-600/20 text-indigo-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                {searchPanelOpen ? '▼' : '▶'}
              </button>
            </div>

            {/* Buttons immediately after search - compact, no space between */}
            <div className="flex items-center gap-1 flex-nowrap flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 px-2 py-1">
                    <FileCode className="h-4 w-4" />
                    File
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {i18nT('uploadFile')}
                  </DropdownMenuItem>
                  {templateToOpen && (
                    <>
                      <DropdownMenuItem onClick={handleOpenTemplateFromPurchase}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        {i18nT('openPurchasedTemplate')}
                      </DropdownMenuItem>
                      <div className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleDirectoryPicker}>
                    <FolderUp className="mr-2 h-4 w-4" />
                    {i18nT('uploadFolder')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewFileDialogOpen(true)}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    {i18nT('newFile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewFolderDialogOpen(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {i18nT('newFolder')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <input
                id="folder-upload"
                name="folder-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFolderUpload}
                disabled={isLoadingFolder}
                {...({ directory: true, webkitdirectory: true, mozdirectory: true } as any)}
              />

              <TemplateMarketplace onInsert={setEditorContent} onInsertWithLanguage={handleTemplateInsert} />
              <Button size="sm" className="flex-shrink-0 px-1 py-0.5" onClick={() => setShowBackupDialog(true)} variant="outline">
                <FileCode className="mr-1 h-3.5 w-3.5" />
                Backup
              </Button>
              <VersionHistory versions={versions} onRestore={handleRestoreVersion} />
              <AIAssistant />
            </div>
          </div>

          {/* Search results panel */}

          <div className="flex-1 flex overflow-auto gap-0 relative">
            {/* EDITOR PANEL */}
            <div
              className="border-r border-slate-700 flex flex-col"
              style={{
                flex: `0 0 ${Math.round(editorWidth)}px`,
                minWidth: '200px',
                overflowX: 'auto',
                overflowY: 'hidden'
              }}
            >
              {/* Tabs for open files */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-700 overflow-hidden flex-shrink-0 min-w-0">
                {openFiles.length === 0 ? (
                  currentFile ? (
                    <button
                      className={`flex items-center gap-2 px-4 py-3 rounded ${currentFile ? 'bg-slate-700' : ''}`}
                      onClick={() => {
                        // keep focus on currentFile
                      }}
                    >
                      <span className="text-sm">{currentFile?.name}</span>
                    </button>
                  ) : (
                    <div className="text-sm text-slate-400 px-4 py-3">{i18nT('noFileOpen')}</div>
                  )
                ) : (
                  openFiles.map((f) => (
                    <button
                      key={f.path}
                      onClick={() => {
                        setCurrentFile(f);
                        setEditorContent(f.content || '');
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded ${currentFile?.path === f.path ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
                    >
                      <span className="text-sm">{f.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); attemptCloseFile(f.path); }} className="ml-1 text-slate-400 hover:text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>
              <div className="flex-1 flex flex-col min-h-0 h-full" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Language detection — subtle pill (non-intrusive) */}
                {detectedLanguageLabel && detectedLanguageLabel !== 'plaintext' && (
                  <div className="flex items-center gap-3 px-3 py-1 mb-2">
                    <div className="text-[11px] text-slate-400">Linguaggio</div>
                    <div className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[12px] font-medium">
                      {detectedLanguageLabel}
                    </div>
                    {currentFile && (
                      <div className="ml-auto text-[12px] text-slate-400 truncate max-w-[40%]">
                        {currentFile.name || 'nuovo-file.js'}
                      </div>
                    )}
                  </div>
                )}
                <CodeEditor
                  value={editorContent}
                  onChange={handleEditorChange}
                  language={selectedLanguage}
                  height="100%"
                  highlightRanges={editorHighlights}
                  jumpToLine={jumpToLine}
                  autoDetectLanguage={selectedLanguage === 'plaintext'}
                />
              </div>
            </div>

            {/* DIVIDER 2: Editor ↔ Preview */}
            <div
              className="hidden md:block cursor-col-resize hover:bg-slate-600/50 transition-colors"
              style={{
                position: 'relative',
                width: 8,
                height: '100%',
                backgroundColor: 'rgba(100, 116, 139, 0.3)'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                isResizingRef.current = 'editor';
                resizeStartRef.current = {
                  x: e.clientX,
                  width: editorWidthRef.current,
                  previewWidth: previewWidthRef.current
                };
                document.body.style.userSelect = 'none';
                setIsResizing('editor');
              }}
            >
              <div style={{ width: 3, height: '100%', margin: '0 auto', background: 'rgba(148,163,184,0.5)', borderRadius: 1.5 }} />
            </div>

            {/* PREVIEW PANEL */}
            <div
              className="bg-white flex flex-col min-h-0 h-full"
              style={{
                flex: `1 1 0`,
                overflow: 'hidden'
              }}
            >
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-white text-sm font-semibold flex-shrink-0 flex items-center justify-between gap-4">
                {/* Left: ANTEPRIMA + Aggiorna button */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs font-medium">{i18nT('preview')}</div>
                  <Button size="sm" className="flex-shrink-0 px-2 py-1" onClick={() => setPreviewKey(k => k + 1)} variant="outline">
                    {i18nT('refreshPreview')}
                  </Button>
                </div>

                {/* Center: PerfCheck */}
                <div className="flex-1 flex justify-center px-4">
                  <PerfCheck />
                </div>

                {/* Right: Device buttons */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Button size="sm" className={previewDevice === 'desktop' ? 'bg-slate-700 text-white' : ''} onClick={() => setPreviewDevice('desktop')} aria-pressed={previewDevice === 'desktop'} title="Desktop">
                      <Monitor size={14} />
                    </Button>
                    <Button size="sm" className={previewDevice === 'mobile' ? 'bg-slate-700 text-white' : ''} onClick={() => setPreviewDevice('mobile')} aria-pressed={previewDevice === 'mobile'} title="Mobile">
                      <Smartphone size={14} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative min-h-0 w-full p-4" style={{ height: '100%', overflow: 'auto' }}>
                {detectedViteProject && !externalPreviewUrl ? (
                  <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold mb-2">Progetto Vite/React rilevato</h3>
                    <p className="text-sm text-slate-500 mb-4">Non è stato trovato un dev server attivo.</p>
                    <div className="text-sm text-left max-w-md">
                      <p className="mb-2">Per vedere correttamente l'anteprima esegui il server dev del progetto nella cartella del progetto:</p>
                      <pre className="bg-slate-900 p-3 rounded text-xs text-white">pnpm install
                        pnpm run dev</pre>
                      <p className="mt-3">Poi apri <span className="font-medium">http://localhost:5173</span> (o la porta mostrata dal server) oppure clicca il pulsante qui sotto per aprire l'URL nella nuova scheda.</p>
                    </div>
                    <div className="mt-4">
                      <Button asChild>
                        <a href="http://localhost:5173" target="_blank" rel="noreferrer">Apri dev server</a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-start justify-center overflow-hidden">
                    <div
                      style={{
                        width: previewDevice === 'desktop' ? '100%' : 375,
                        maxWidth: '100%',
                        height: '100%',
                        overflow: 'auto',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(148,163,184,0.12)',
                        borderRadius: 8,
                        background: '#ffffff',
                        margin: 16
                      }}
                    >
                      <PreviewPanel
                        htmlContent={htmlContent}
                        cssContent={cssContent}
                        jsContent={jsContent}
                        externalUrl={externalPreviewUrl}
                        localFiles={localFiles}
                        openedFolderName={openedFolderName}
                        onLinkClick={handleLinkClick}
                        key={previewKey}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{i18nT('backupManagement')}</DialogTitle>
            <DialogDescription>
              {i18nT('createManageBackup')}
            </DialogDescription>
          </DialogHeader>
          <BackupManager
            projectId={currentProject ?? 0}
            currentFiles={[...files, ...localFiles]}
            onRestore={handleRestoreBackup}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm close dialog for unsaved files */}
      <Dialog open={confirmCloseDialogOpen} onOpenChange={setConfirmCloseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chiudere il file?</DialogTitle>
            <DialogDescription>
              {`Vuoi salvare le modifiche a "${openFiles.find(f => f.path === pendingClosePath)?.name || pendingClosePath}" prima di chiudere?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleConfirmCloseSave}>Salva</Button>
            <Button variant="destructive" onClick={handleConfirmCloseDiscard}>Non salvare</Button>
            <Button variant="outline" onClick={() => setConfirmCloseDialogOpen(false)}>Annulla</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save File Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salva: {savingFileName}</DialogTitle>
            <DialogDescription>
              Scegli la cartella di destinazione. Si aprirà un dialog per selezionarla.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Option 1: Save to original folder */}
            <Button
              onClick={() => handleSaveToOriginalFolder()}
              className="w-full justify-start"
              variant="outline"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Salva in cartella scelta
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Mantiene la struttura di cartelle originale
            </p>

            {/* Option 2: Save As */}
            <div className="space-y-2 pt-2">
              <div>
                <label className="text-sm font-medium">Nome file personalizzato:</label>
                <Input
                  placeholder="es: file_modificato.txt"
                  value={customSavePath}
                  onChange={(e) => setCustomSavePath(e.target.value)}
                  className="text-sm mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAs();
                  }}
                />
              </div>
              <Button
                onClick={() => handleSaveAs()}
                className="w-full justify-start"
                variant="outline"
              >
                <FileCode className="mr-2 h-4 w-4" />
                Salva con nome
              </Button>
            </div>

            {/* Option 3: Save to Cloud */}
            <Button
              onClick={handleSaveToCloud}
              className="w-full justify-start"
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Salva su cloud (In sviluppo)
            </Button>
          </div>

          <DialogFooter>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400">[Cloud-Vault] Safe Copy — partner storage</div>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Annulla
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewProjectDialog
        isOpen={newProjectDialogOpen}
        onClose={() => setNewProjectDialogOpen(false)}
        onCreateProject={(name, files) => {
          toast.success(`Progetto "${name}" creato!`);
          setNewProjectDialogOpen(false);
        }}
      />

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuovo File</DialogTitle>
            <DialogDescription>Inserisci il nome del file - l'estensione verrà aggiunta automaticamente</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              id="newFileName"
              name="newFileName"
              placeholder="es: script, index, config"
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
                if (e.target.value.trim()) {
                  const suggestion = suggestExtension(e.target.value);
                  setSuggestedExtension(suggestion.extension);
                  setSuggestedLanguage(suggestion.language);
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNewFile(); }}
              autoFocus
            />
            {suggestedExtension && (
              <div className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                <span className="text-gray-300">Estensione suggerita:</span>
                <span className="font-mono bg-slate-600 px-2 py-1 rounded text-blue-400">
                  .{suggestedExtension}
                </span>
              </div>
            )}
            {suggestedLanguage && suggestedLanguage !== 'plaintext' && (
              <div className="flex items-center justify-between p-2 bg-slate-700 rounded text-sm">
                <span className="text-gray-300">Linguaggio:</span>
                <span className="font-semibold text-green-400 capitalize">
                  {suggestedLanguage}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFileDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleCreateNewFile} disabled={!newFileName.trim()}>Crea File</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Nuova Cartella</DialogTitle>
            <DialogDescription>Inserisci il nome della cartella</DialogDescription>
          </DialogHeader>
          <Input id="newFolderName" name="newFolderName" placeholder="es: components" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNewFolder(); }} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleCreateNewFolder}>Crea Cartella</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Tech Ad */}
      <div className="fixed bottom-4 right-4 w-72 z-50">
        <TechAd />
      </div>
    </div>
  );
}
