import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { safeReturnPath } from '@shared/authRedirect';

export default function AccessLink() {
    const [, navigate] = useLocation();
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const returnTo = safeReturnPath(params.get('next'));
    const mutation = trpc.auth.verifyAccessCode.useMutation({
        onSuccess: () => { toast.success('Accesso completato'); navigate(returnTo); },
        onError: (error) => { toast.error(error.message); navigate(`/login?next=${encodeURIComponent(returnTo)}`); },
    });

    useEffect(() => { if (token) mutation.mutate({ token }); }, [token]);
    return <div className="min-h-screen flex items-center justify-center bg-background"><p>Verifica del link di accesso...</p></div>;
}
