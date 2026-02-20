// client/src/components/collaboration/ProjectShare.tsx
import React from 'react';
import { Link2, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectShareProps {
    project?: { id: string; name: string; shareToken?: string } | null;
}

export function ProjectShare({ project }: ProjectShareProps) {
    const shareUrl = project?.shareToken ? `${window.location.origin}/join/${project.shareToken}` : '';

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Link2 className="h-5 w-5 text-primary" /></div>
                <div>
                    <h3 className="font-semibold">Project Share</h3>
                    <p className="text-xs text-muted-foreground">Condividi l'accesso al progetto tramite link</p>
                </div>
            </div>

            <div className="p-3 bg-muted rounded">
                {shareUrl ? (
                    <div className="flex items-center justify-between">
                        <div className="text-xs truncate mr-4">{shareUrl}</div>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copia</Button>
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground">Link non disponibile</div>
                )}
            </div>
        </div>
    );
}
