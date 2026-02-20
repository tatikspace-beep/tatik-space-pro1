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

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      toast.success(`${t.register} ${t.completed}! ${t.please} ${t.login} ${t.toAccess}.`);
      
      // After successful registration, try to log the user in automatically
      // If the registration response includes user data, we can use it
      if (data.user) {
        // Set the user in the auth state directly using the registration response
        login(data.user);
        
        // Wait briefly for auth state to sync before redirecting
        setTimeout(() => {
          window.location.href = '/editor';
        }, 500);
      } else {
        // Otherwise, redirect to login page
        window.location.href = '/login';
      }
    },
    onError: (error) => {
      toast.error(error.message || t.registrationError);
    }
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error(t.passwordsDontMatch || 'Le password non coincidono');
      return;
    }

    if (password.length < 8) {
      toast.error(t.passwordMinLength || 'La password deve essere lunga almeno 8 caratteri');
      return;
    }

    registerMutation.mutate({
      email: email,
      password: password,
      name: name
    });
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
                placeholder={t.yourNamePlaceholder || "Il tuo nome"}
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
              <p className="text-xs text-muted-foreground">{t.passwordMinLength || "Minimo 8 caratteri"}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t.loading : t.register}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              {t.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t.login}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}