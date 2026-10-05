import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { safeReturnPath } from '@shared/authRedirect';
import { useLanguage } from '@/contexts/LanguageContext';
import { authFlowCopy, localizedAuthError } from '@/lib/authFlowCopy';

export default function CompleteRegistration() {
    const [, navigate] = useLocation();
    const { language } = useLanguage();
    const copy = authFlowCopy[language];
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const returnTo = safeReturnPath(params.get('next'));
    const mutation = trpc.auth.completeRegistration.useMutation({
        onSuccess: () => { toast.success(copy.registrationSuccess); navigate(returnTo); },
        onError: (error) => toast.error(localizedAuthError(error.message, copy)),
    });

    useEffect(() => {
        if (token) mutation.mutate({ token });
    }, [token]);

    return <div className="min-h-screen flex items-center justify-center bg-background"><p>{token ? copy.completingRegistration : copy.missingRegistrationLink}</p></div>;
}
