// client/src/components/collaboration/TeamManagement.tsx
import React, { useState } from 'react';
import { Users, UserPlus, Trash2, ChevronDown, Crown, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TeamMember, Role } from '@/hooks/useCollaboration';

const ROLE_META: Record<Role, { label: string; icon: React.FC<any>; color: string }> = {
    owner: { label: 'Owner', icon: Crown, color: 'text-yellow-500' },
    editor: { label: 'Editor', icon: Pencil, color: 'text-blue-500' },
    viewer: { label: 'Viewer', icon: Eye, color: 'text-gray-400' },
};

function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface TeamManagementProps {
    members: TeamMember[];
    onlineUserIds: string[];
    currentUserId: string;
    canManage: boolean;   // owner
    canInvite: boolean;   // owner | editor
    onInvite: (email: string, role: Role) => void;
    onChangeRole: (userId: string, role: Role) => void;
    onRemove: (userId: string) => void;
    error: string | null;
    onClearError: () => void;
}

export function TeamManagement({
    members, onlineUserIds, currentUserId,
    canManage, canInvite,
    onInvite, onChangeRole, onRemove,
    error, onClearError,
}: TeamManagementProps) {

    const [email, setEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<Role>('editor');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) return;
        setLoading(true);
        onInvite(email.trim(), inviteRole);
        setSuccess(`Invito inviato a ${email}`);
        setEmail('');
        setLoading(false);
        setTimeout(() => setSuccess(''), 4000);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-base">Team Management</h3>
                    <p className="text-xs text-muted-foreground">{members.length} membri · {onlineUserIds.length} online</p>
                </div>
            </div>

            {canInvite && (
                <form onSubmit={handleInvite} className="flex items-center gap-2">
                    <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} placeholder="Email da invitare" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">Ruolo</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setInviteRole('editor')}>Editor</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setInviteRole('viewer')}>Viewer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button type="submit" disabled={loading}>{loading ? 'Invio...' : 'Invita'}</Button>
                </form>
            )}

            {success && <div className="text-green-600 text-sm">{success}</div>}

            <div className="space-y-2">
                {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>{initials(m.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-medium">{m.name}</div>
                                <div className="text-xs text-muted-foreground">{m.email || m.userId}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{m.role}</span>
                            {canManage && currentUserId !== m.userId && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost">⋯</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => onChangeRole(m.userId, 'viewer')}>Set Viewer</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onChangeRole(m.userId, 'editor')}>Set Editor</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onRemove(m.userId)} className="text-destructive">Rimuovi</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="text-sm text-destructive">
                    {error} <Button variant="link" onClick={onClearError}>Chiudi</Button>
                </div>
            )}
        </div>
    );
}
