// client/src/hooks/useCollaboration.ts
// Hook React per gestire la connessione WebSocket e lo stato di collaborazione

import { useState, useEffect, useRef, useCallback } from 'react';

export type Role = 'owner' | 'editor' | 'viewer';

export interface TeamMember {
    id: string;
    userId: string;
    name: string;
    email?: string;
    role: Role;
    avatar?: string;
    joinedAt: string;
    online: boolean;
}

export interface ChatMessage {
    id: string;
    projectId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: string;
    type: 'text' | 'system';
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    shareToken?: string;
    sharePermission?: Role;
    members: TeamMember[];
    messages?: ChatMessage[];
    createdAt?: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface CollaborationState {
    status: ConnectionStatus;
    project: Project | null;
    messages: ChatMessage[];
    onlineUserIds: string[];
    error: string | null;
}

interface UseCollaborationOptions {
    projectId: string;
    userId: string;
    userName: string;
    wsUrl?: string; // es. ws://localhost:5000/ws/collaboration
    offline?: boolean; // se true usa una modalità mock offline (no WebSocket)
}

export function useCollaboration({ projectId, userId, userName, wsUrl, offline }: UseCollaborationOptions) {
    const [state, setState] = useState<CollaborationState>({
        status: 'connecting',
        project: null,
        messages: [],
        onlineUserIds: [],
        error: null,
    });

    const wsRef = useRef<WebSocket | null>(null);
    const pingRef = useRef<number | null>(null);
    const retryRef = useRef<number | null>(null);
    const connTimeoutRef = useRef<number | null>(null);
    const retryCount = useRef(0);
    const isOffline = Boolean(offline);

    const connect = useCallback(() => {
        // Offline mock mode: initialize local-only project state and handlers
        if (isOffline) {
            const demoProject: Project = {
                id: projectId || 'proj_demo',
                name: 'Progetto Offline',
                description: 'Modalità offline locale per test',
                ownerId: userId || 'local_owner',
                shareToken: 'offline_share',
                sharePermission: 'editor',
                members: [
                    {
                        id: 'm_' + Math.random().toString(36).slice(2, 8),
                        userId: userId,
                        name: userName,
                        email: '',
                        role: 'owner',
                        joinedAt: new Date().toISOString(),
                        online: true,
                    },
                ],
                messages: [
                    {
                        id: 'sys_' + Math.random().toString(36).slice(2, 8),
                        projectId: projectId,
                        userId: 'system',
                        userName: 'Sistema',
                        content: 'Hai aperto la modalità offline. Nessuna connessione esterna è richiesta.',
                        timestamp: new Date().toISOString(),
                        type: 'system',
                    },
                ],
                createdAt: new Date().toISOString(),
            } as unknown as Project;

            setState((s) => ({
                ...s,
                status: 'connected',
                project: demoProject,
                messages: demoProject.messages || [],
                onlineUserIds: demoProject.members.map(m => m.userId),
            }));
            return;
        }
        try {
            const url = wsUrl || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/collaboration';
            wsRef.current = new WebSocket(url);
            setState((s) => ({ ...s, status: 'connecting' }));

            wsRef.current.onopen = () => {
                retryCount.current = 0;
                // clear connection timeout
                if (connTimeoutRef.current) {
                    window.clearTimeout(connTimeoutRef.current);
                    connTimeoutRef.current = null;
                }
                setState((s) => ({ ...s, status: 'connected', error: null }));
                const joinMsg = { type: 'join', projectId, userId, userName };
                wsRef.current?.send(JSON.stringify(joinMsg));

                // Ping interval
                if (pingRef.current) window.clearInterval(pingRef.current);
                pingRef.current = window.setInterval(() => {
                    try { wsRef.current?.send(JSON.stringify({ type: 'ping' })); } catch (e) { }
                }, 25000);
            };

            wsRef.current.onmessage = (evt) => {
                try {
                    const data = JSON.parse(evt.data);
                    // Basic event handling — server may send { type: 'project', project: {...} }
                    switch (data.type) {
                        case 'project':
                            setState((s) => ({ ...s, project: data.project }));
                            break;
                        case 'message':
                            setState((s) => ({ ...s, messages: [...s.messages, data.message] }));
                            break;
                        case 'online':
                            setState((s) => ({ ...s, onlineUserIds: data.userIds }));
                            break;
                        case 'system':
                            setState((s) => ({ ...s, messages: [...s.messages, data.message] }));
                            break;
                        case 'error':
                            setState((s) => ({ ...s, error: data.error }));
                            break;
                        default:
                            // ignore
                            break;
                    }
                } catch (err) {
                    console.error('useCollaboration parse error', err);
                }
            };

            wsRef.current.onclose = () => {
                // If connection was not established, mark as error; otherwise disconnected
                setState((s) => ({ ...s, status: s.status === 'connected' ? 'disconnected' : 'error' }));
                // clear connection timeout if present
                if (connTimeoutRef.current) {
                    window.clearTimeout(connTimeoutRef.current);
                    connTimeoutRef.current = null;
                }
                // retry with backoff
                retryCount.current++;
                const timeout = Math.min(30000, 1000 * Math.pow(2, retryCount.current));
                retryRef.current = window.setTimeout(() => connect(), timeout);
            };

            wsRef.current.onerror = (err) => {
                console.error('WebSocket error', err);
                // Ensure connection timeout is cleared
                if (connTimeoutRef.current) {
                    window.clearTimeout(connTimeoutRef.current);
                    connTimeoutRef.current = null;
                }
                setState((s) => ({ ...s, status: 'error', error: 'WebSocket error' }));
                try { wsRef.current?.close(); } catch (e) { }
            };

            // Fallback: if socket doesn't open in a reasonable time, mark as error and close
            if (connTimeoutRef.current) window.clearTimeout(connTimeoutRef.current);
            connTimeoutRef.current = window.setTimeout(() => {
                if (!wsRef.current) return;
                if (wsRef.current.readyState !== WebSocket.OPEN) {
                    console.warn('WebSocket connection timeout, closing socket');
                    try { wsRef.current.close(); } catch (e) { }
                    setState((s) => ({ ...s, status: 'error', error: 'Connection timeout' }));
                }
            }, 8000);
        } catch (err) {
            console.error('useCollaboration connect error', err);
            setState((s) => ({ ...s, status: 'error', error: String(err) }));
        }
    }, [projectId, userId, userName, wsUrl, offline]);

    useEffect(() => {
        connect();
        return () => {
            if (pingRef.current) window.clearInterval(pingRef.current);
            if (retryRef.current) window.clearTimeout(retryRef.current);
            if (connTimeoutRef.current) window.clearTimeout(connTimeoutRef.current);
            try { wsRef.current?.close(); } catch (e) { }
        };
    }, [connect]);

    // Actions
    const sendMessage = useCallback((content: string) => {
        if (isOffline) {
            const msg: ChatMessage = {
                id: 'local_' + Math.random().toString(36).slice(2, 9),
                projectId,
                userId,
                userName,
                content,
                timestamp: new Date().toISOString(),
                type: 'text',
            };
            setState((s) => ({ ...s, messages: [...s.messages, msg] }));
            return true;
        }
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
        wsRef.current.send(JSON.stringify({ type: 'chat', projectId, content }));
        return true;
    }, [projectId, isOffline, userId, userName]);

    const inviteMember = useCallback((email: string, role: Role) => {
        if (isOffline) {
            const newMember: TeamMember = {
                id: 'local_m_' + Math.random().toString(36).slice(2, 8),
                userId: 'pending_' + Math.random().toString(36).slice(2, 8),
                name: email.split('@')[0],
                email,
                role,
                joinedAt: new Date().toISOString(),
                online: false,
            };
            setState((s) => ({ ...s, project: s.project ? { ...s.project, members: [...s.project.members, newMember] } : s.project }));
            return;
        }
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: 'invite', projectId, email, role }));
    }, [projectId, isOffline]);

    const changeRole = useCallback((targetUserId: string, role: Role) => {
        if (isOffline) {
            setState((s) => ({ ...s, project: s.project ? { ...s.project, members: s.project.members.map(m => m.userId === targetUserId ? { ...m, role } : m) } : s.project }));
            return;
        }
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: 'role', projectId, targetUserId, role }));
    }, [projectId, isOffline]);

    const removeMember = useCallback((targetUserId: string) => {
        if (isOffline) {
            setState((s) => ({ ...s, project: s.project ? { ...s.project, members: s.project.members.filter(m => m.userId !== targetUserId) } : s.project }));
            return;
        }
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: 'remove', projectId, targetUserId }));
    }, [projectId, isOffline]);

    const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), []);

    const myRole = state.project?.members?.find((m) => m.userId === userId)?.role || null;
    const can = {
        manage: myRole === 'owner',
        invite: myRole === 'owner' || myRole === 'editor',
    };

    return {
        ...state,
        myRole,
        can,
        sendMessage,
        inviteMember,
        changeRole,
        removeMember,
        clearError,
    };
}
