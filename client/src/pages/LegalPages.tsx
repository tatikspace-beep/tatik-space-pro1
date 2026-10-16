import React from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { AITranslationWrapper } from '@/components/AITranslationWrapper';
import { contactPageFallbacks, contactPageTitles } from '@/lib/contactFormTranslations';
import { legalSupplementalCopy } from '@/lib/legalSupplementalCopy';
import { legalComplianceCopy } from '@/lib/legalComplianceCopy';
import { controllerPrivacyCopy } from '@/lib/controllerPrivacyCopy';
import { AITransparencySection } from '@/components/AITransparencySection';

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
  const { language, t } = useLanguage();
  const supplementalCopy = legalSupplementalCopy[language];
  const complianceCopy = legalComplianceCopy[language];
  const controllerCopy = controllerPrivacyCopy[language];
  
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
          <h2 className="text-xl font-semibold mb-3">{controllerCopy.title}</h2>
          <p>{controllerCopy.identity}</p>
          <p className="mt-3 rounded-md border border-border bg-secondary/40 p-3 text-left">
            {controllerCopy.pseudonymNote}
          </p>
          <p className="mt-3">
            <Link href="/contact" className="text-primary hover:underline">{t.privacyPolicyRightsContact}</Link>.
          </p>
          <p className="mt-3">{controllerCopy.contactIntro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-left">
            {[
              'tatik.space@outlook.com',
              'tatik.space1@outlook.com',
              'tatik.space2@outlook.com',
              'tatik.space3@outlook.com',
            ].map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="text-primary underline underline-offset-2">
                  {email}
                </a>
              </li>
            ))}
          </ul>
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
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString(language)}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{supplementalCopy.privacyTitle}</h2>
          <p className="text-sm text-muted-foreground">{supplementalCopy.italianTextNotice}</p>
          <p>
            Per il marketplace vengono trattati i dati necessari al profilo venditore, alla pubblicazione dei listing,
            alla revisione, agli acquisti, ai rimborsi, alle contestazioni e alla contabilizzazione del saldo.
            I file dei venditori sono conservati in storage privato e non vengono resi disponibili prima
            dell&apos;autorizzazione prevista dal flusso di acquisto.
          </p>
          <p className="mt-3">
            Per il programma scuole vengono trattati i dati dell&apos;istituto, del referente, degli inviti e dei membri
            necessari a controllare approvazione, durata, limite di 30 studenti per corso, revoche e audit. Gli inviti usano token
            temporanei associati all&apos;email indicata dalla scuola. La scuola è responsabile della correttezza degli
            indirizzi e delle autorizzazioni necessarie per invitare gli studenti.
          </p>
        </section>

        <AITransparencySection />
        <section className="rounded-lg border border-border bg-secondary/40 p-4 text-left">
          <h2 className="mb-3 text-xl font-semibold">{complianceCopy.privacyAiTitle}</h2>
          <p>{complianceCopy.privacyAi}</p>
          <p className="mt-3 text-sm text-muted-foreground">{controllerCopy.providerUpdateNotice}</p>
        </section>
        <section className="rounded-lg border border-border bg-secondary/40 p-4 text-left">
          <h2 className="mb-3 text-xl font-semibold">{complianceCopy.aiLegalTitle}</h2>
          <p>{complianceCopy.aiLegalContext}</p>
          <h3 className="mt-4 mb-2 font-semibold">{complianceCopy.officialSources}</h3>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.gdprSource}
              </a>
            </li>
            <li>
              <a href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.gdprRightsSource}
              </a>
            </li>
            <li>
              <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.aiActSource}
              </a>
            </li>
            <li>
              <a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.commissionAiActSource}
              </a>
            </li>
            <li>
              <a href="https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2025-09-23;132" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.italianLawSource}
              </a>
            </li>
          </ul>
          <h3 className="mt-4 mb-2 font-semibold">{complianceCopy.moreInfo}</h3>
          <p className="mb-2 text-sm text-muted-foreground">{complianceCopy.thirdPartySourcesNote}</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <a href="https://aipia.it/normativa-ai/decreto-attuativo-ia-italia-legge-132-2025-cosa-cambia/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.italianArticleSource}
              </a>
            </li>
            <li>
              <a href="https://go.nis2.org.ua/eu-ai-act/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                {complianceCopy.aiGuideSource}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </LegalLayout>
  );
}

export function TermsOfService() {
  const { language, t } = useLanguage();
  const supplementalCopy = legalSupplementalCopy[language];
  const complianceCopy = legalComplianceCopy[language];
  
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
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString(language)}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{supplementalCopy.termsTitle}</h2>
          <p className="text-sm text-muted-foreground">{supplementalCopy.italianTextNotice}</p>
          <p>
            Il venditore è responsabile del template e dei materiali caricati, dei diritti di utilizzo, della descrizione,
            della qualità e sicurezza del prodotto, delle licenze e degli obblighi verso gli acquirenti previsti dalla legge.
            Deve caricare esclusivamente contenuti leciti, sicuri e di cui possiede i diritti. Tatik può rifiutare,
            sospendere o rimuovere un listing durante la revisione o in presenza di violazioni; la revisione non equivale
            a una garanzia o certificazione del prodotto.
            La commissione applicata alle vendite è pari al 15%; il saldo può restare sospeso per verifiche,
            periodo anti-frode, rimborsi o contestazioni. Il venditore riceve l'85% del prezzo prima delle commissioni
            del provider di pagamento. I payout richiedono Stripe Connect e la verifica KYC. Le recensioni sono
            consentite agli acquirenti con un ordine pagato e non rimborsato.
          </p>
          <p className="mt-3">
            La registrazione di un istituto scolastico diventa attiva solo dopo l&apos;approvazione di admin o collaboratori
            Tatik. Gli inviti agli studenti sono creati e approvati dalla scuola, sono temporanei e non trasferibili.
            L&apos;accesso dura 30 giorni dall&apos;approvazione dell&apos;istituto, è limitato a 30 studenti per corso e può essere revocato
            in caso di abuso, violazione o dati non verificabili.
          </p>
        </section>

        <section id="ai-use" className="scroll-mt-6 text-left">
          <h2 className="text-xl font-semibold mb-3">{complianceCopy.aiTermsTitle}</h2>
          <p>{complianceCopy.aiTerms}</p>
        </section>

        <section id="affiliate-disclosure" className="scroll-mt-6 text-left">
          <h2 className="text-xl font-semibold mb-3">{complianceCopy.affiliateTitle}</h2>
          <p>{complianceCopy.affiliateDisclosure}</p>
        </section>
      </div>
    </LegalLayout>
  );
}

export function CookiePolicy() {
  const { language, t } = useLanguage();
  
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
            <AITranslationWrapper>{t.lastUpdated}</AITranslationWrapper>: {new Date().toLocaleDateString(language)}
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
  const { language, t } = useLanguage();
  const contactCopy = {
    ...t,
    ...contactPageFallbacks[language],
    contact: contactPageTitles[language] ?? t.contact,
  };
  
  return (
    <LegalLayout title={contactCopy.contact}>
      <div className="space-y-6">
        <section>
          <p className="text-lg mb-6">
            <AITranslationWrapper>{contactCopy.contactIntro}</AITranslationWrapper>
          </p>
        </section>

        <ContactForm />

        <section>
          <h2 className="text-xl font-semibold mb-4"><AITranslationWrapper>{contactCopy.contactPrivacyRequests}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{contactCopy.contactGDPRInfo}</AITranslationWrapper>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4"><AITranslationWrapper>{contactCopy.contactReportsFeedback}</AITranslationWrapper></h2>
          <p>
            <AITranslationWrapper>{contactCopy.contactFeedbackInfo}</AITranslationWrapper>
          </p>
        </section>

      </div>
    </LegalLayout>
  );
}
