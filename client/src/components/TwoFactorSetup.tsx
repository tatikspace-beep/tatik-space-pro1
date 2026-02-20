import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, Copy, CheckCircle2 } from 'lucide-react';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

export function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');

  const utils = trpc.useUtils();

  const generateSecretMutation = trpc.twoFactor.generateSecret.useQuery(undefined, {
    enabled: showDialog && step === 'generate',
  });

  const enableTwoFactorMutation = trpc.twoFactor.enable.useMutation({
    onSuccess: () => {
      toast.success('Autenticazione a due fattori abilitata!');
      utils.auth.me.invalidate();
      setStep('backup');
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleEnable = () => {
    if (!generateSecretMutation.data || !verificationCode) {
      toast.error('Inserisci il codice di verifica');
      return;
    }

    enableTwoFactorMutation.mutate({
      secret: generateSecretMutation.data.secret,
      code: verificationCode,
      backupCodes: generateSecretMutation.data.backupCodes,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClose = () => {
    setShowDialog(false);
    setStep('generate');
    setVerificationCode('');
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <Shield className="h-4 w-4" />
        Configura 2FA
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          {step === 'generate' && generateSecretMutation.data && (
            <>
              <DialogHeader>
                <DialogTitle>Configura Autenticazione a Due Fattori</DialogTitle>
                <DialogDescription>
                  Scansiona il codice QR con un'app di autenticazione come Google Authenticator
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <img
                    src={generateSecretMutation.data.qrCode}
                    alt="QR Code"
                    className="w-48 h-48 border-2 border-border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chiave segreta (backup)</label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                      {generateSecretMutation.data.secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(generateSecretMutation.data.secret)}
                    >
                      {copiedCode === generateSecretMutation.data.secret ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    Salva questa chiave in un posto sicuro. Potrai usarla per recuperare l'accesso se perdi il dispositivo.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    Inserisci il codice a 6 cifre
                  </label>
                  <Input
                    id="code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Annulla
                </Button>
                <Button
                  onClick={handleEnable}
                  disabled={verificationCode.length !== 6 || enableTwoFactorMutation.isPending}
                >
                  {enableTwoFactorMutation.isPending ? 'Verifica...' : 'Verifica e Abilita'}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'backup' && generateSecretMutation.data && (
            <>
              <DialogHeader>
                <DialogTitle>Codici di Backup</DialogTitle>
                <DialogDescription>
                  Salva questi codici in un posto sicuro. Potrai usarli per accedere se perdi il dispositivo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  {generateSecretMutation.data.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="p-2 bg-muted rounded text-sm font-mono flex items-center justify-between"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => handleCopyCode(code)}
                        className="ml-2"
                      >
                        {copiedCode === code ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 opacity-50 hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleClose} className="w-full">
                  Ho salvato i codici
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
