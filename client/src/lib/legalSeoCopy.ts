import { translations } from "@/lib/i18n";

type LegalSeoCopy = {
  privacyDescription: string;
  termsDescription: string;
  cookiesDescription: string;
  contactDescription: string;
};

export const legalSeoCopy: Record<keyof typeof translations, LegalSeoCopy> = {
  en: {
    privacyDescription: "Information about personal data processing on Tatik.space.",
    termsDescription: "Terms and conditions for using Tatik.space services.",
    cookiesDescription: "Information about cookies and consent preferences on Tatik.space.",
    contactDescription: "Contact Tatik.space for support, collaborations, or information.",
  },
  it: {
    privacyDescription: "Informazioni sul trattamento dei dati personali su Tatik.space.",
    termsDescription: "Termini e condizioni per l’utilizzo dei servizi Tatik.space.",
    cookiesDescription: "Informazioni sui cookie e sulle preferenze di consenso di Tatik.space.",
    contactDescription: "Contatta Tatik.space per assistenza, collaborazioni o informazioni.",
  },
  es: {
    privacyDescription: "Información sobre el tratamiento de datos personales en Tatik.space.",
    termsDescription: "Términos y condiciones para usar los servicios de Tatik.space.",
    cookiesDescription: "Información sobre cookies y preferencias de consentimiento de Tatik.space.",
    contactDescription: "Contacta con Tatik.space para obtener asistencia, colaborar o solicitar información.",
  },
  fr: {
    privacyDescription: "Informations sur le traitement des données personnelles sur Tatik.space.",
    termsDescription: "Conditions d’utilisation des services de Tatik.space.",
    cookiesDescription: "Informations sur les cookies et les préférences de consentement de Tatik.space.",
    contactDescription: "Contactez Tatik.space pour obtenir de l’aide, collaborer ou demander des informations.",
  },
  de: {
    privacyDescription: "Informationen zur Verarbeitung personenbezogener Daten auf Tatik.space.",
    termsDescription: "Nutzungsbedingungen für die Dienste von Tatik.space.",
    cookiesDescription: "Informationen zu Cookies und Einwilligungseinstellungen auf Tatik.space.",
    contactDescription: "Kontaktiere Tatik.space bei Supportanfragen, Kooperationen oder Informationsbedarf.",
  },
  pt: {
    privacyDescription: "Informações sobre o tratamento de dados pessoais no Tatik.space.",
    termsDescription: "Termos e condições de uso dos serviços do Tatik.space.",
    cookiesDescription: "Informações sobre cookies e preferências de consentimento do Tatik.space.",
    contactDescription: "Entre em contato com o Tatik.space para suporte, parcerias ou informações.",
  },
  ru: {
    privacyDescription: "Информация об обработке персональных данных на Tatik.space.",
    termsDescription: "Условия использования сервисов Tatik.space.",
    cookiesDescription: "Информация о файлах cookie и настройках согласия на Tatik.space.",
    contactDescription: "Свяжитесь с Tatik.space по вопросам поддержки, сотрудничества или получения информации.",
  },
  zh: {
    privacyDescription: "了解 Tatik.space 如何处理个人数据。",
    termsDescription: "Tatik.space 服务的使用条款与条件。",
    cookiesDescription: "了解 Tatik.space 的 Cookie 和同意偏好设置。",
    contactDescription: "联系 Tatik.space 获取支持、洽谈合作或咨询信息。",
  },
  ja: {
    privacyDescription: "Tatik.space における個人データの取り扱いについて説明します。",
    termsDescription: "Tatik.space サービスの利用規約と条件です。",
    cookiesDescription: "Tatik.space の Cookie と同意設定について説明します。",
    contactDescription: "サポート、協業、各種情報について Tatik.space へお問い合わせください。",
  },
  ko: {
    privacyDescription: "Tatik.space의 개인정보 처리에 관한 안내입니다.",
    termsDescription: "Tatik.space 서비스 이용 약관입니다.",
    cookiesDescription: "Tatik.space의 쿠키 및 동의 설정에 관한 안내입니다.",
    contactDescription: "지원, 협업 또는 정보 문의를 위해 Tatik.space에 연락하세요.",
  },
  ar: {
    privacyDescription: "معلومات حول معالجة البيانات الشخصية على Tatik.space.",
    termsDescription: "الشروط والأحكام الخاصة باستخدام خدمات Tatik.space.",
    cookiesDescription: "معلومات حول ملفات تعريف الارتباط وتفضيلات الموافقة على Tatik.space.",
    contactDescription: "تواصل مع Tatik.space للحصول على الدعم أو التعاون أو المعلومات.",
  },
  hi: {
    privacyDescription: "Tatik.space पर व्यक्तिगत डेटा के प्रसंस्करण की जानकारी।",
    termsDescription: "Tatik.space सेवाओं के उपयोग के नियम और शर्तें।",
    cookiesDescription: "Tatik.space पर कुकीज़ और सहमति प्राथमिकताओं की जानकारी।",
    contactDescription: "सहायता, सहयोग या जानकारी के लिए Tatik.space से संपर्क करें।",
  },
  pl: {
    privacyDescription: "Informacje o przetwarzaniu danych osobowych w serwisie Tatik.space.",
    termsDescription: "Warunki korzystania z usług Tatik.space.",
    cookiesDescription: "Informacje o plikach cookie i preferencjach zgody w Tatik.space.",
    contactDescription: "Skontaktuj się z Tatik.space w sprawie pomocy, współpracy lub informacji.",
  },
  nl: {
    privacyDescription: "Informatie over de verwerking van persoonsgegevens op Tatik.space.",
    termsDescription: "Voorwaarden voor het gebruik van de diensten van Tatik.space.",
    cookiesDescription: "Informatie over cookies en toestemmingsvoorkeuren op Tatik.space.",
    contactDescription: "Neem contact op met Tatik.space voor ondersteuning, samenwerking of informatie.",
  },
  tr: {
    privacyDescription: "Tatik.space üzerindeki kişisel verilerin işlenmesi hakkında bilgi.",
    termsDescription: "Tatik.space hizmetlerinin kullanım koşulları.",
    cookiesDescription: "Tatik.space çerezleri ve izin tercihleri hakkında bilgi.",
    contactDescription: "Destek, iş birliği veya bilgi için Tatik.space ile iletişime geçin.",
  },
  sv: {
    privacyDescription: "Information om behandling av personuppgifter på Tatik.space.",
    termsDescription: "Villkor för användning av Tatik.spaces tjänster.",
    cookiesDescription: "Information om cookies och samtyckesinställningar på Tatik.space.",
    contactDescription: "Kontakta Tatik.space för support, samarbeten eller information.",
  },
  da: {
    privacyDescription: "Information om behandling af personoplysninger på Tatik.space.",
    termsDescription: "Vilkår og betingelser for brug af Tatik.spaces tjenester.",
    cookiesDescription: "Information om cookies og samtykkeindstillinger på Tatik.space.",
    contactDescription: "Kontakt Tatik.space om support, samarbejde eller information.",
  },
  no: {
    privacyDescription: "Informasjon om behandling av personopplysninger på Tatik.space.",
    termsDescription: "Vilkår for bruk av tjenestene til Tatik.space.",
    cookiesDescription: "Informasjon om informasjonskapsler og samtykkevalg på Tatik.space.",
    contactDescription: "Kontakt Tatik.space for brukerstøtte, samarbeid eller informasjon.",
  },
  fi: {
    privacyDescription: "Tietoa henkilötietojen käsittelystä Tatik.spacessa.",
    termsDescription: "Tatik.space-palveluiden käyttöehdot.",
    cookiesDescription: "Tietoa Tatik.spacen evästeistä ja suostumusasetuksista.",
    contactDescription: "Ota yhteyttä Tatik.spaceen tuen, yhteistyön tai lisätietojen vuoksi.",
  },
  uk: {
    privacyDescription: "Інформація про обробку персональних даних на Tatik.space.",
    termsDescription: "Умови використання сервісів Tatik.space.",
    cookiesDescription: "Інформація про файли cookie та налаштування згоди на Tatik.space.",
    contactDescription: "Зверніться до Tatik.space по підтримку, співпрацю або інформацію.",
  },
  cs: {
    privacyDescription: "Informace o zpracování osobních údajů na Tatik.space.",
    termsDescription: "Podmínky používání služeb Tatik.space.",
    cookiesDescription: "Informace o souborech cookie a nastavení souhlasu na Tatik.space.",
    contactDescription: "Kontaktujte Tatik.space s žádostí o podporu, spolupráci nebo informace.",
  },
};
