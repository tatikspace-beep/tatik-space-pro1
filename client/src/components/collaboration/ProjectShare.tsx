// client/src/components/collaboration/ProjectShare.tsx
import React from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CollaborationPageCopy } from '@/lib/collaborationPageCopy';

interface ProjectShareProps {
    project?: { id: string; name: string; shareToken?: string } | null;
    copy: CollaborationPageCopy;
}

export function ProjectShare({ project, copy }: ProjectShareProps) {
    const shareUrl = project?.shareToken ? `${window.location.origin}/join/${project.shareToken}` : '';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Link2 className="h-5 w-5 text-primary" /></div>
                <div>
                    <h3 className="font-semibold">{copy.projectShare}</h3>
                    <p className="text-xs text-muted-foreground">{copy.shareLinkDescription}</p>
                </div>
            </div>

            <div className="p-3 bg-muted rounded">
                {shareUrl ? (
                    <div className="flex items-center justify-between">
                        <div className="text-xs truncate mr-4">{shareUrl}</div>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>{copy.copy}</Button>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground">{copy.linkUnavailable}</div>
                )}
            </div>
        </div>
    );
}
