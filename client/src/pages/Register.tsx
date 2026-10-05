import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { safeReturnPath } from '@shared/authRedirect';
import { authFlowCopy, localizedAuthError } from '@/lib/authFlowCopy';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { language, t } = useLanguage();
  const copy = authFlowCopy[language];
  const returnTo = safeReturnPath(new URLSearchParams(window.location.search).get('next'));

  const requestRegistrationMutation = trpc.auth.requestRegistration.useMutation({
    onSuccess: () => {
      toast.success(copy.registrationLinkSent);
    },
    onError: (error) => {
      toast.error(localizedAuthError(error.message || t.registrationError, copy));
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    requestRegistrationMutation.mutate({ email: email.trim(), name: name.trim(), redirectTo: returnTo });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.createAccount}</CardTitle>
          <CardDescription>
            {t.enterYourDataToRegister}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.firstName}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t.firstName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="text-sm text-muted-foreground">{copy.registrationLinkExplanation}</p>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={requestRegistrationMutation.isPending}
            >
              {requestRegistrationMutation.isPending ? t.loading : t.register}
            </Button>

            <div className="mt-4 text-center text-sm">
              {t.alreadyHaveAccount}{' '}
              <Link to={`/login?next=${encodeURIComponent(returnTo)}`} className="text-primary hover:underline">
                {t.login}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}