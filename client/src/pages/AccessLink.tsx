import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function AccessLink() {
    const [, navigate] = useLocation();
    const token = new URLSearchParams(window.location.search).get('token') || '';
    const mutation = trpc.auth.verifyAccessCode.useMutation({
        onSuccess: () => { toast.success('Accesso completato'); navigate('/editor'); },
        onError: (error) => { toast.error(error.message); navigate('/login'); },
    });

    useEffect(() => { if (token) mutation.mutate({ token }); }, [token]);
    return <div className="min-h-screen flex items-center justify-center bg-background"><p>Verifica del link di accesso...</p></div>;
}
