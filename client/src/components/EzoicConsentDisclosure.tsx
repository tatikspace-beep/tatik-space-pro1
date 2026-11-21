import { useEffect } from 'react';

const disclosureLabels: Record<string, string> = {
  de: 'Datenschutzhinweise',
  en: 'Privacy details',
  es: 'Información de privacidad',
  fr: 'Informations sur la confidentialité',
  it: 'Informativa sulla privacy',
  pt: 'Informações de privacidade',
};

function getDisclosureLabel() {
  const language = document.documentElement.lang.toLowerCase().split('-')[0];
  return disclosureLabels[language] ?? disclosureLabels.en;
}

export function EzoicConsentDisclosure() {
  useEffect(() => {
    const compactDisclosure = () => {
      const paragraph = document.querySelector<HTMLParagraphElement>(
        '#ez-cookie-dialog #main-ezcmp p',
      );
      if (!paragraph || paragraph.closest('[data-tatik-consent-disclosure]')) {
        return;
      }

      const details = document.createElement('details');
      details.className = 'tatik-ezoic-consent-disclosure';
      details.dataset.tatikConsentDisclosure = 'true';

      const summary = document.createElement('summary');
      summary.textContent = getDisclosureLabel();

      const fullNotice = document.createElement('p');
      fullNotice.textContent = paragraph.textContent ?? '';

      details.append(summary, fullNotice);
      paragraph.replaceWith(details);
    };

    compactDisclosure();
    const observer = new MutationObserver(compactDisclosure);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
