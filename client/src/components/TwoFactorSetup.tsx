import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Shield, Copy, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorAppCopy } from '@/lib/editorAppCopy';
import { getEditorOutsideCopy } from '@/lib/editorOutsideCopy';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
}

export function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const { language } = useLanguage();
  const copy = (key: Parameters<typeof getEditorOutsideCopy>[1], values: Record<string, string | number> = {}) =>
    getEditorOutsideCopy(language, key, values);
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
      toast.success(copy('twoFactorEnabled'));
      utils.auth.me.invalidate();
      setStep('backup');
    },
    onError: (error) => {
      toast.error(copy('twoFactorError', { error: error.message }));
    },
  });

  const handleEnable = () => {
    if (!generateSecretMutation.data || !verificationCode) {
      toast.error(copy('codeRequired'));
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
        {copy('configureTwoFactor')}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          {step === 'generate' && !generateSecretMutation.data && (
            <div className="space-y-3">
              {generateSecretMutation.isLoading ? (
                <p role="status" className="text-sm text-muted-foreground">{copy('loadingSecret')}</p>
              ) : generateSecretMutation.isError ? (
                <div className="space-y-3">
                  <p role="alert" className="text-sm text-destructive">{copy('secretLoadError')}</p>
                  <Button variant="outline" onClick={() => generateSecretMutation.refetch()}>
                    {copy('retry')}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
          {step === 'generate' && generateSecretMutation.data && (
            <>
              <DialogHeader>
                <DialogTitle>{copy('twoFactorTitle')}</DialogTitle>
                <DialogDescription>
                  {copy('scanQrDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center">
                  <img
                    src={generateSecretMutation.data.qrCode}
                    alt={copy('qrCode')}
                    className="w-48 h-48 border-2 border-border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{copy('secretLabel')}</label>
                  <div className="flex gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                      {generateSecretMutation.data.secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(generateSecretMutation.data.secret)}
                      title={copy('copyCode')}
                      aria-label={copy('copyCode')}
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
                    {copy('saveSecret')}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    {copy('codeLabel')}
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
                  {getEditorAppCopy(language, 'cancel')}
                </Button>
                <Button
                  onClick={handleEnable}
                  disabled={verificationCode.length !== 6 || enableTwoFactorMutation.isPending}
                >
                  {enableTwoFactorMutation.isPending ? copy('verifying') : copy('verifyEnable')}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'backup' && generateSecretMutation.data && (
            <>
              <DialogHeader>
                <DialogTitle>{copy('backupCodesTitle')}</DialogTitle>
                <DialogDescription>
                  {copy('backupCodesDescription')}
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
                        title={copy('copyCode')}
                        aria-label={copy('copyCode')}
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
                  {copy('codesSaved')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
