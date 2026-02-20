import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseAutosaveOptions {
  content: string;
  fileId?: number;
  onSave: (content: string) => Promise<void>;
  interval?: number; // milliseconds
}

export function useAutosave({
  content,
  fileId,
  onSave,
  interval = 30000, // 30 seconds default
}: UseAutosaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>(content);
  const isSavingRef = useRef(false);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only autosave if content has changed and we have a fileId
    if (!fileId || content === lastSavedRef.current || isSavingRef.current) {
      return;
    }

    // Set new timeout for autosave
    timeoutRef.current = setTimeout(async () => {
      if (content === lastSavedRef.current) {
        return; // No changes since last save
      }

      try {
        isSavingRef.current = true;
        await onSave(content);
        lastSavedRef.current = content;
        toast.success('Autosalvataggio completato', {
          duration: 2000,
        });
      } catch (error) {
        toast.error('Errore durante l\'autosalvataggio');
        console.error('Autosave error:', error);
      } finally {
        isSavingRef.current = false;
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, fileId, onSave, interval]);
}
