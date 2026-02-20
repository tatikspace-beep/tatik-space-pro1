import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.requires2fa) {
        // Handle 2FA flow
        toast.info(t.twoFactorAuth);
      } else {
        // Since the login response already has the user info we need, we can use it directly
        // If user data is in the response, set it in auth state
        if (data.user) {
          login(data.user);
          window.location.href = '/editor';
        } else {
          // Otherwise just redirect and let the app refetch user data
          window.location.href = '/editor';
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || t.error);
    }
  });

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      if (data.link) {
        toast.success('Link generato (sviluppo): ' + data.link);
      } else {
        toast.success('Se hai un account ti abbiamo inviato il link via email');
      }
      setForgotMode(false);
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotMode) {
      requestResetMutation.mutate({ email });
    } else {
      loginMutation.mutate({
        email: email,
        password: password
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.login}</CardTitle>
          <CardDescription>
            {forgotMode ? t.resetEmailPrompt : t.enterCredentials}
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

            {!forgotMode && (
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="text-right text-sm">
              {!forgotMode ? (
                <button type="button" className="text-primary hover:underline" onClick={() => setForgotMode(true)}>
                  {t.forgotPassword}
                </button>
              ) : (
                <button type="button" className="text-primary hover:underline" onClick={() => setForgotMode(false)}>
                  ← {t.back}
                </button>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || requestResetMutation.isPending}
            >
              {forgotMode
                ? requestResetMutation.isPending ? t.loading : t.send
                : loginMutation.isPending ? t.loading : t.login}
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