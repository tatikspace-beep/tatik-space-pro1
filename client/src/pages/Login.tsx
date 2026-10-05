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

export default function Login() {
  const [email, setEmail] = useState('');
  const { language, t } = useLanguage();
  const copy = authFlowCopy[language];
  const returnTo = safeReturnPath(new URLSearchParams(window.location.search).get('next'));

  const accessCodeMutation = trpc.auth.requestAccessCode.useMutation({
    onSuccess: () => toast.success(copy.accessLinkSent),
    onError: (error) => toast.error(localizedAuthError(error.message || t.error, copy)),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    accessCodeMutation.mutate({ email: email.trim(), redirectTo: returnTo });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.login}</CardTitle>
          <CardDescription>
            {copy.loginDescription}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
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

            <p className="text-sm text-muted-foreground">{copy.linkExpiry}</p>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={accessCodeMutation.isPending}
            >
              {accessCodeMutation.isPending ? t.loading : copy.sendAccessLink}
            </Button>

            <div className="mt-4 text-center text-sm">
              {t.dontHaveAccount}{' '}
              <Link to={`/register?next=${encodeURIComponent(returnTo)}`} className="text-primary hover:underline">
                {t.register}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}