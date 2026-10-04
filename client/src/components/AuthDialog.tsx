import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Accesso</DialogTitle>
                    <DialogDescription>Accedi tramite il link inviato alla tua e-mail.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Button type="button" className="w-full" onClick={onClose}>Chiudi</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

