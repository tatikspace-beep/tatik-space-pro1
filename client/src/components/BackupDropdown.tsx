import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <FileCode className="h-4 w-4" />
          Backup
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onNewBackup} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" />
          Nuovo Backup
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onShowHistory} className="gap-2 cursor-pointer">
          <Clock className="h-4 w-4" />
          Cronologia Backup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
