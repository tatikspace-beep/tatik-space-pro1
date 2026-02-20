// server/_core/collaboration.ts
// Node.js WebSocket server per collaborazione in tempo reale
// Dipendenze: npm install ws uuid

import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';

export type Role = 'owner' | 'editor' | 'viewer';

export interface TeamMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string;
    joinedAt: Date;
    online: boolean;
}

export interface ChatMessage {
    id: string;
    projectId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'system';
}

export interface Project {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    shareToken: string;
    sharePermission: Role;
    members: TeamMember[];
    messages: ChatMessage[];
    createdAt: Date;
}

interface WSClient {
    ws: any;
    userId: string;
    userName: string;
    projectId: string;
}

type WSMessage =
    | { type: 'join'; projectId: string; userId: string; userName: string }
    | { type: 'chat'; projectId: string; content: string }
    | { type: 'invite'; projectId: string; email: string; role: Role }
    | { type: 'role'; projectId: string; targetUserId: string; role: Role }
    | { type: 'remove'; projectId: string; targetUserId: string }
    | { type: 'ping' };

// In-memory store (replace with DB for production)
const projects = new Map<string, Project>();
const clients = new Map<string, WSClient>();

// Demo project
const DEMO_PROJECT_ID = 'proj_demo';
projects.set(DEMO_PROJECT_ID, {
    id: DEMO_PROJECT_ID,
    name: 'Progetto Demo',
    description: 'Un progetto di esempio per testare la collaborazione',
    ownerId: 'user_owner',
    shareToken: 'share_' + randomUUID().replace(/-/g, '').slice(0, 16),
    sharePermission: 'editor',
    members: [
        {
            id: randomUUID(),
            userId: 'user_owner',
            name: 'Mario Rossi',
            email: 'mario@esempio.it',
            role: 'owner',
            joinedAt: new Date(),
            online: false,
        },
    ],
    messages: [
        {
            id: randomUUID(),
            projectId: DEMO_PROJECT_ID,
            userId: 'system',
            userName: 'Sistema',
            content: 'Progetto creato. Benvenuti nella collaborazione!',
            timestamp: new Date(),
            type: 'system',
        },
    ],
    createdAt: new Date(),
});

function broadcast(projectId: string, payload: object, excludeClientId?: string) {
    const data = JSON.stringify(payload);
    for (const [clientId, client] of clients) {
        if (client.projectId === projectId && clientId !== excludeClientId) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        }
    }
}

function getOnlineUserIds(projectId: string): string[] {
    const online: string[] = [];
    for (const client of clients.values()) {
        if (client.projectId === projectId) online.push(client.userId);
    }
    return [...new Set(online)];
}

function hasPermission(project: Project, userId: string, minRole: Role): boolean {
    const order: Role[] = ['viewer', 'editor', 'owner'];
    const member = project.members.find(m => m.userId === userId);
    if (!member) return false;
    return order.indexOf(member.role) >= order.indexOf(minRole);
}

export async function attachCollaborationWS(server: any) {
    let WebSocketServer: any;
    let WebSocket: any;
    try {
        const mod = await import('ws');
        WebSocketServer = mod.WebSocketServer ?? mod.default?.WebSocketServer ?? mod.default;
        WebSocket = mod.WebSocket ?? mod.default?.WebSocket ?? mod.default;
    } catch (err) {
        console.warn('[WS] `ws` package not installed - skipping collaboration WebSocket server');
        return;
    }

    const wss = new WebSocketServer({ server, path: '/ws/collaboration' });

    wss.on('connection', (ws: any, req: IncomingMessage) => {
        const clientId = randomUUID();

        ws.on('message', (raw) => {
            let msg: WSMessage;
            try { msg = JSON.parse(raw.toString()); }
            catch { return; }

            if (msg.type === 'join') {
                const project = projects.get(msg.projectId);
                if (!project) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Progetto non trovato' }));
                    return;
                }

                clients.set(clientId, {
                    ws, userId: msg.userId, userName: msg.userName, projectId: msg.projectId,
                });

                if (!project.members.find(m => m.userId === msg.userId)) {
                    const sharePermission = project.sharePermission;
                    project.members.push({
                        id: randomUUID(),
                        userId: msg.userId,
                        name: msg.userName,
                        email: '',
                        role: sharePermission,
                        joinedAt: new Date(),
                        online: true,
                    });
                }

                ws.send(JSON.stringify({
                    type: 'init',
                    project: {
                        ...project,
                        onlineUserIds: getOnlineUserIds(msg.projectId),
                    },
                    messages: project.messages.slice(-50),
                }));

                broadcast(msg.projectId, {
                    type: 'user_online',
                    userId: msg.userId,
                    userName: msg.userName,
                }, clientId);

                const sysMsg: ChatMessage = {
                    id: randomUUID(),
                    projectId: msg.projectId,
                    userId: 'system',
                    userName: 'Sistema',
                    content: `${msg.userName} si è unito alla sessione`,
                    timestamp: new Date(),
                    type: 'system',
                };
                project.messages.push(sysMsg);
                broadcast(msg.projectId, { type: 'chat_message', message: sysMsg });
                return;
            }

            const client = clients.get(clientId);
            if (!client) return;

            if (msg.type === 'chat') {
                const project = projects.get(msg.projectId);
                if (!project) return;
                if (!hasPermission(project, client.userId, 'viewer')) return;

                const chatMsg: ChatMessage = {
                    id: randomUUID(),
                    projectId: msg.projectId,
                    userId: client.userId,
                    userName: client.userName,
                    content: msg.content.slice(0, 2000),
                    timestamp: new Date(),
                    type: 'text',
                };
                project.messages.push(chatMsg);

                const payload = JSON.stringify({ type: 'chat_message', message: chatMsg });
                for (const c of clients.values()) {
                    if (c.projectId === msg.projectId && c.ws.readyState === WebSocket.OPEN) {
                        c.ws.send(payload);
                    }
                }
                return;
            }

            if (msg.type === 'invite') {
                const project = projects.get(msg.projectId);
                if (!project) return;
                if (!hasPermission(project, client.userId, 'editor')) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Permessi insufficienti' }));
                    return;
                }
                if (project.members.find(m => m.email === msg.email)) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Membro già presente' }));
                    return;
                }

                const newMember: TeamMember = {
                    id: randomUUID(),
                    userId: 'pending_' + randomUUID(),
                    name: msg.email.split('@')[0],
                    email: msg.email,
                    role: msg.role,
                    joinedAt: new Date(),
                    online: false,
                };
                project.members.push(newMember);

                broadcast(msg.projectId, {
                    type: 'member_added',
                    member: newMember,
                });

                ws.send(JSON.stringify({
                    type: 'invite_sent',
                    email: msg.email,
                    shareLink: `${process.env.APP_URL || 'http://localhost:5000'}/join/${project.shareToken}`,
                }));
                return;
            }

            if (msg.type === 'role') {
                const project = projects.get(msg.projectId);
                if (!project) return;
                if (!hasPermission(project, client.userId, 'owner')) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Solo il proprietario può cambiare i ruoli' }));
                    return;
                }

                const member = project.members.find(m => m.userId === msg.targetUserId);
                if (!member) return;
                if (member.role === 'owner') {
                    ws.send(JSON.stringify({ type: 'error', message: 'Non puoi modificare il proprietario' }));
                    return;
                }

                member.role = msg.role;
                broadcast(msg.projectId, {
                    type: 'member_role_changed',
                    userId: msg.targetUserId,
                    role: msg.role,
                });
                return;
            }

            if (msg.type === 'remove') {
                const project = projects.get(msg.projectId);
                if (!project) return;
                if (!hasPermission(project, client.userId, 'owner')) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Solo il proprietario può rimuovere membri' }));
                    return;
                }

                project.members = project.members.filter(m => m.userId !== msg.targetUserId);
                broadcast(msg.projectId, {
                    type: 'member_removed',
                    userId: msg.targetUserId,
                });
                return;
            }

            if (msg.type === 'ping') {
                ws.send(JSON.stringify({ type: 'pong' }));
            }
        });

        ws.on('close', () => {
            const client = clients.get(clientId);
            if (client) {
                broadcast(client.projectId, {
                    type: 'user_offline',
                    userId: client.userId,
                });
                clients.delete(clientId);
            }
        });

        ws.on('error', (err) => {
            console.error('[WS] Errore:', (err as Error).message);
            clients.delete(clientId);
        });
    });

    console.log('[WS] Server collaborazione attivo su /ws/collaboration');
    return wss;
}

export function getProjectByToken(shareToken: string): Project | undefined {
    for (const p of projects.values()) {
        if (p.shareToken === shareToken) return p;
    }
    return undefined;
}

export function createProject(ownerId: string, ownerName: string, name: string, desc: string): Project {
    const id = 'proj_' + randomUUID().slice(0, 8);
    const project: Project = {
        id, name, description: desc, ownerId,
        shareToken: 'share_' + randomUUID().replace(/-/g, '').slice(0, 16),
        sharePermission: 'editor',
        members: [{
            id: randomUUID(), userId: ownerId, name: ownerName,
            email: '', role: 'owner', joinedAt: new Date(), online: false,
        }],
        messages: [{
            id: randomUUID(), projectId: id, userId: 'system', userName: 'Sistema',
            content: `Progetto "${name}" creato da ${ownerName}`,
            timestamp: new Date(), type: 'system',
        }],
        createdAt: new Date(),
    };
    projects.set(id, project);
    return project;
}

export { projects };
