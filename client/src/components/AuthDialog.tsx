import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
    const { login } = useAuth();

    // FUNZIONE MAGICA PER TESTARE COME ADMIN
    const handleAdminBypass = () => {
        const mockAdmin = {
            id: "admin-" + Math.random().toString(36).substr(2, 9),
            name: "Admin Tester",
            email: "admin@test.local",
            role: "ADMIN",           // Assicurati che il tuo sistema legga "ADMIN"
            isAdmin: true,
            emailVerified: new Date(),
            app_session_id: "test-session-" + Date.now(), // Il tuo ID sessione casuale
        };

        login(mockAdmin); // Inietta l'utente nella cache tRPC e nel localStorage
        toast.success("Accesso Admin Effettuato (Modalità Test)");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-2 border-yellow-500">
                <DialogHeader>
                    <DialogTitle>Accesso Sviluppatore</DialogTitle>
                    <DialogDescription>
                        Usa il tasto qui sotto per entrare nell'Editor come Admin senza autorizzazione email.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Button
                        type="button"
                        variant="default"
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold h-16 text-lg"
                        onClick={handleAdminBypass}
                    >
                        🧪 ENTRA COME ADMIN (TEST)
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Questa opzione è visibile solo in modalità sviluppo.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button variant="ghost" onClick={onClose}>Chiudi</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}


