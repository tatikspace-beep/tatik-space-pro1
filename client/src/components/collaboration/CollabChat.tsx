// client/src/components/collaboration/CollabChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatMessage } from '@/hooks/useCollaboration';

interface CollabChatProps {
    messages: ChatMessage[];
    onSend: (content: string) => void;
    userId: string;
}

export function CollabChat({ messages, onSend, userId }: CollabChatProps) {
    const [text, setText] = useState('');
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><MessageSquare className="h-5 w-5 text-primary" /></div>
                <div>
                    <h3 className="font-semibold">Chat</h3>
                    <p className="text-xs text-muted-foreground">Comunicazione in tempo reale</p>
                </div>
            </div>

            <div className="h-56 overflow-y-auto p-2 bg-muted rounded">
                {messages.map((m) => (
                    <div key={m.id} className={`mb-2 p-2 rounded ${m.userId === userId ? 'bg-primary/10 self-end' : 'bg-white/50'}`}>
                        <div className="text-xs text-muted-foreground">{m.userName} · {new Date(m.timestamp).toLocaleTimeString()}</div>
                        <div className="text-sm">{m.content}</div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            <div className="flex items-center gap-2">
                <Input value={text} onChange={(e) => setText((e.target as HTMLInputElement).value)} placeholder="Scrivi un messaggio..." />
                <Button onClick={handleSend}><Send className="w-4 h-4" /></Button>
            </div>
        </div>
    );
}
