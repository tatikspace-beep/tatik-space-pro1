import React from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';

function LegalLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 mx-auto">
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>
        <Card className="mx-auto max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert mx-auto text-center">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <LegalLayout title={t.privacyPolicy}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection1}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.privacyPolicySection1Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection2}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.privacyPolicySection2Content}</AITranslationWrapper>{' '}
            <Link href="/contact" className="text-primary hover:underline">{t.contact}</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection3}</AITranslationWrapper></h2>
          <p><AITranslationWrapper>{t.privacyPolicySection3Content}</AITranslationWrapper></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><AITranslationWrapper>{t.privacyPolicyData1}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyData2}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyData3}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyData4}</AITranslationWrapper></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection4}</AITranslationWrapper></h2>
          <p><AITranslationWrapper>{t.privacyPolicySection4Content}</AITranslationWrapper></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><AITranslationWrapper>{t.privacyPolicyPurpose1}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyPurpose2}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyPurpose3}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyPurpose4}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyPurpose5}</AITranslationWrapper></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection5}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.privacyPolicySection5Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection6}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.privacyPolicySection6Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection7}</AITranslationWrapper></h2>
          <p><AITranslationWrapper>{t.privacyPolicySection7Content}</AITranslationWrapper></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><AITranslationWrapper>{t.privacyPolicyRights1}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights2}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights3}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights4}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights5}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights6}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.privacyPolicyRights7}</AITranslationWrapper></li>
          </ul>
          <p className="mt-3">
            <AITranslationWrapper>{t.privacyPolicyRightsContact}</AITranslationWrapper>{' '}
            <Link href="/contact" className="text-primary hover:underline">{t.contact}</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.privacyPolicySection8}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.privacyPolicySection8Content}</AITranslationWrapper>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString('it-IT')}
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function TermsOfService() {
  const { t } = useLanguage();
  
  return (
    <LegalLayout title={t.termsOfService}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection1}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection1Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection2}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection2Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection3}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection3Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection4}</AITranslationWrapper></h2>
          <p><AITranslationWrapper>{t.tosSection4Content}</AITranslationWrapper></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><AITranslationWrapper>{t.tosAcceptableUse1}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.tosAcceptableUse2}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.tosAcceptableUse3}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.tosAcceptableUse4}</AITranslationWrapper></li>
            <li><AITranslationWrapper>{t.tosAcceptableUse5}</AITranslationWrapper></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection5}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection5Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection6}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection6Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection7}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection7Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection8}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection8Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection9}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection9Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.tosSection10}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.tosSection10Content}</AITranslationWrapper>{' '}
            <Link href="/contact" className="text-primary hover:underline">{t.contact}</Link>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString('it-IT')}
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function CookiePolicy() {
  const { t } = useLanguage();
  
  return (
    <LegalLayout title={t.cookiePolicy}>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection1}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.cookiePolicySection1Content}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection2}</AITranslationWrapper></h2>
          
          <h3 className="text-lg font-semibold mt-4 mb-2"><AITranslationWrapper>{t.cookiePolicyTechnicalCookies}</AITranslationWrapper></h3>
          <p>
            <AITranslationWrapper>{t.cookiePolicyTechnicalContent}</AITranslationWrapper>
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong><AITranslationWrapper>{t.cookiePolicySessionLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicySessionContent}</AITranslationWrapper></li>
            <li><strong><AITranslationWrapper>{t.cookiePolicySecurityLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicySecurityContent}</AITranslationWrapper></li>
            <li><strong><AITranslationWrapper>{t.cookiePolicyPreferencesLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicyPreferencesContent}</AITranslationWrapper></li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2"><AITranslationWrapper>{t.cookiePolicyAnalytics}</AITranslationWrapper></h3>
          <p>
            <AITranslationWrapper>{t.cookiePolicyAnalyticsContent}</AITranslationWrapper>
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Google Analytics:</strong> <AITranslationWrapper>{t.cookiePolicyGAContent}</AITranslationWrapper></li>
            <li><strong><AITranslationWrapper>{t.cookiePolicyStatsLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicyStatsContent}</AITranslationWrapper></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection3}</AITranslationWrapper></h2>
          <p><AITranslationWrapper>{t.cookiePolicyDurationContent}</AITranslationWrapper></p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong><AITranslationWrapper>{t.cookiePolicySessionLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicySessionDuration}</AITranslationWrapper>
            </li>
            <li>
              <strong><AITranslationWrapper>{t.cookiePolicyPersistentLabel}</AITranslationWrapper>:</strong> <AITranslationWrapper>{t.cookiePolicyPersistentContent}</AITranslationWrapper>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection4}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.cookiePolicyManageContent}</AITranslationWrapper>
          </p>
          <p className="mt-3">
            <AITranslationWrapper>{t.cookiePolicyBrowserManage}</AITranslationWrapper>
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection5}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.cookiePolicyThirdPartyContent}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection6}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.cookiePolicyUpdatesContent}</AITranslationWrapper>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString('it-IT')}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3"><AITranslationWrapper>{t.cookiePolicySection7}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.cookiePolicyContactContent}</AITranslationWrapper>{' '}
            <Link href="/contact" className="text-primary hover:underline">{t.contact}</Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function ContactPage() {
  const { t } = useLanguage();
  
  return (
    <LegalLayout title={t.contact}>
      <div className="space-y-6">
        <section>
          <p className="text-lg mb-6">
            <AITranslationWrapper>{t.contactIntro}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4"><AITranslationWrapper>{t.contactDirect}</AITranslationWrapper></h2>
          <p className="text-sm text-muted-foreground mb-4">
            <AITranslationWrapper>{t.contactFormInfo}</AITranslationWrapper>
          </p>
        </section>



        <section>
          <h2 className="text-xl font-semibold mb-4"><AITranslationWrapper>{t.contactPrivacyRequests}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.contactGDPRInfo}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4"><AITranslationWrapper>{t.contactReportsFeedback}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{t.contactFeedbackInfo}</AITranslationWrapper>
          </p>
        </section>

        <ContactForm />
      </div>
    </LegalLayout>
  );
}
