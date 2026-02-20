import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const COOKIE_CONSENT_KEY = 'tatik-cookie-consent-v2';
const COOKIE_CONSENT_DETAILS = 'tatik-cookie-details';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  expiresAt: string;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
    timestamp: '',
    expiresAt: ''
  });

  const saveConsentMutation = trpc.cookieConsent.save.useMutation();

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Check if consent has expired
      const details = localStorage.getItem(COOKIE_CONSENT_DETAILS);
      if (details) {
        try {
          const parsedDetails = JSON.parse(details) as CookiePreferences;
          const now = new Date();
          const expiresDate = new Date(parsedDetails.expiresAt);
          if (now > expiresDate) {
            // Consent expired, show banner again
            localStorage.removeItem(COOKIE_CONSENT_KEY);
            localStorage.removeItem(COOKIE_CONSENT_DETAILS);
            const timer = setTimeout(() => {
              setShowBanner(true);
            }, 1000);
            return () => clearTimeout(timer);
          }
        } catch (e) {
          console.error('Error parsing cookie consent details:', e);
        }
      }
    }
  }, []);

  const saveConsentToBackend = (data: CookiePreferences) => {
    saveConsentMutation.mutate({
      necessary: data.necessary,
      functional: data.functional,
      analytics: data.analytics,
      marketing: data.marketing,
      consentGivenAt: data.timestamp,
      expiresAt: data.expiresAt,
      sessionId: localStorage.getItem('sessionId') || undefined
    });
  };

  const handleAccept = () => {
    const consentData = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    localStorage.setItem(COOKIE_CONSENT_DETAILS, JSON.stringify(consentData));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
    saveConsentToBackend(consentData);
  };

  const handleNecessaryOnly = () => {
    const consentData = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    localStorage.setItem(COOKIE_CONSENT_DETAILS, JSON.stringify(consentData));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'necessary-only');
    setShowBanner(false);
    saveConsentToBackend(consentData);
  };

  const handleCustomize = () => {
    setShowCustomizeModal(true);
  };

  const handleSaveCustomPreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    localStorage.setItem(COOKIE_CONSENT_DETAILS, JSON.stringify(consentData));
    localStorage.setItem(COOKIE_CONSENT_KEY, 'customized');
    setShowBanner(false);
    setShowCustomizeModal(false);
    saveConsentToBackend(consentData);
  };

  const handlePreferenceChange = (type: keyof Omit<CookiePreferences, 'timestamp' | 'expiresAt'>) => {
    if (type === 'necessary') return; // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
        <Card className="max-w-4xl mx-auto shadow-lg border-2">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Utilizzo dei Cookie</h3>
                
                {/* Cookie Types Description */}
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Dettagli sui cookie
                  </button>
                  
                  {showDetails && (
                    <div className="space-y-2 ml-4 pt-2 border-l-2 border-border pl-2">
                      <p>
                        <strong>Cookie Necessari:</strong> Essenziali per il funzionamento del sito (autenticazione, sicurezza).
                      </p>
                      <p>
                        <strong>Cookie Funzionali:</strong> Memorizzano le tue preferenze (lingua, tema).
                      </p>
                      <p>
                        <strong>Cookie Analitici:</strong> Ci aiutano a capire come utilizzi il sito.
                      </p>
                      <p>
                        <strong>Cookie Marketing:</strong> Personalizzano i contenuti pubblicitari.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Consulta la nostra{' '}
                  <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
                  {' '}e{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  Il consenso è valido per 12 mesi.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleAccept} size="sm">
                    Accetta tutti
                  </Button>
                  <Button onClick={handleNecessaryOnly} variant="outline" size="sm">
                    Solo necessari
                  </Button>
                  <Button onClick={handleCustomize} variant="outline" size="sm">
                    Personalizza
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Customization Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferenze Cookie</DialogTitle>
            <DialogDescription>
              Seleziona quali categorie di cookie vuoi accettare.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="necessary" 
                  checked={preferences.necessary}
                  disabled
                />
                <Label htmlFor="necessary">Cookie Necessari</Label>
              </div>
              <span className="text-xs text-muted-foreground">(obbligatorio)</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="functional" 
                  checked={preferences.functional}
                  onCheckedChange={() => handlePreferenceChange('functional')}
                />
                <Label htmlFor="functional">Cookie Funzionali</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="analytics" 
                  checked={preferences.analytics}
                  onCheckedChange={() => handlePreferenceChange('analytics')}
                />
                <Label htmlFor="analytics">Cookie Analitici</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="marketing" 
                  checked={preferences.marketing}
                  onCheckedChange={() => handlePreferenceChange('marketing')}
                />
                <Label htmlFor="marketing">Cookie Marketing</Label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSaveCustomPreferences} className="flex-1">
              Salva Preferenze
            </Button>
            <Button 
              onClick={handleNecessaryOnly} 
              variant="outline" 
              className="flex-1"
            >
              Solo Necessari
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
