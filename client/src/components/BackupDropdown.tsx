import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorOutsideCopy } from '@/lib/editorOutsideCopy';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { FileCode, Plus, Clock } from 'lucide-react';

interface BackupDropdownProps {
  onNewBackup: () => void;
  onShowHistory: () => void;
}

export function BackupDropdown({ onNewBackup, onShowHistory }: BackupDropdownProps) {
  const { language } = useLanguage();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <FileCode className="h-4 w-4" />
          {getEditorOutsideCopy(language, 'backupButton')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onNewBackup} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          {getEditorOutsideCopy(language, 'newBackup')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShowHistory} className="gap-2 cursor-pointer">
          <Clock className="h-4 w-4" />
          {getEditorOutsideCopy(language, 'backupHistory')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
