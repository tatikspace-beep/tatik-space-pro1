import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { safeReturnPath } from '@shared/authRedirect';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function CompleteRegistration() {
    const [, navigate] = useLocation();
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const returnTo = safeReturnPath(params.get('next'));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const mutation = trpc.auth.completeRegistration.useMutation({
        onSuccess: () => { toast.success('Registrazione completata'); navigate(returnTo); },
        onError: (error) => toast.error(error.message),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (password !== confirmPassword) { toast.error('Le password non coincidono'); return; }
        mutation.mutate({ token, password });
    };

    return <div className="min-h-screen flex items-center justify-center bg-background"><Card className="w-full max-w-md"><CardHeader><CardTitle>Completa registrazione</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div><Label htmlFor="password">Nuova password</Label><Input id="password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div><Label htmlFor="confirm-password">Conferma password</Label><Input id="confirm-password" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div><Button className="w-full" disabled={!token || mutation.isPending}>{mutation.isPending ? 'Attendi...' : 'Completa registrazione'}</Button></form></CardContent></Card></div>;
}
