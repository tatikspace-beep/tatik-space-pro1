import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const { t } = useLanguage();

  const accessCodeMutation = trpc.auth.requestAccessCode.useMutation({
    onSuccess: () => toast.success('Se l’e-mail è registrata, riceverai un link valido per 10 minuti.'),
    onError: (error) => toast.error(error.message || t.error),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    accessCodeMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.login}</CardTitle>
          <CardDescription>
            Inserisci la tua e-mail per ricevere un link di accesso.
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

            <p className="text-sm text-muted-foreground">Il link scade automaticamente dopo 10 minuti.</p>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={accessCodeMutation.isPending}
            >
              {accessCodeMutation.isPending ? t.loading : 'Invia link di accesso'}
            </Button>

            <div className="mt-4 text-center text-sm">
              {t.dontHaveAccount}{' '}
              <Link to="/register" className="text-primary hover:underline">
                {t.register}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}