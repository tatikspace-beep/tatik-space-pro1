import { translations } from "@/lib/i18n";

type SchoolTermsLanguage = keyof typeof translations;

type SchoolTermsCopy = {
  version: string;
  translatedTerms: string[];
  italianOriginal: string;
  translationUnavailable: string;
};

export const schoolProgramTermsCopy: Record<SchoolTermsLanguage, SchoolTermsCopy> = {
  en: {
    version: "2026-09-15",
    translatedTerms: [
      "The school program grants one-time access for one month from the date of approval.",
      "Each institution may activate a maximum of 30 students.",
      "The school is responsible for verifying invited students and obtaining the relevant consent.",
      "Invitations are temporary, personal, and non-transferable.",
      "Tatik may revoke access in cases of abuse, violations, or information that cannot be verified.",
    ],
    italianOriginal: "Official terms in Italian",
    translationUnavailable: "A translation for this version is not available. The official Italian text is shown below.",
  },
  it: {
    version: "2026-09-15",
    translatedTerms: [
      "Il programma scuola concede accesso una tantum per un mese dalla data di approvazione.",
      "Ogni istituto può attivare al massimo 30 studenti.",
      "La scuola è responsabile della verifica degli studenti invitati e dei relativi consensi.",
      "Gli inviti sono temporanei, personali e non trasferibili.",
      "Tatik può revocare l'accesso in caso di abuso, violazione o dati non verificabili.",
    ],
    italianOriginal: "Testo ufficiale in italiano",
    translationUnavailable: "La traduzione di questa versione non è disponibile. Di seguito è mostrato il testo ufficiale in italiano.",
  },
  es: {
    version: "2026-09-15",
    translatedTerms: [
      "El programa escolar concede acceso por única vez durante un mes desde la fecha de aprobación.",
      "Cada institución puede activar un máximo de 30 estudiantes.",
      "La escuela es responsable de verificar a los estudiantes invitados y obtener los consentimientos correspondientes.",
      "Las invitaciones son temporales, personales e intransferibles.",
      "Tatik puede revocar el acceso en caso de abuso, incumplimiento o datos que no se puedan verificar.",
    ],
    italianOriginal: "Texto oficial en italiano",
    translationUnavailable: "No hay una traducción disponible para esta versión. A continuación se muestra el texto oficial en italiano.",
  },
  fr: {
    version: "2026-09-15",
    translatedTerms: [
      "Le programme scolaire accorde un accès unique pendant un mois à compter de la date d’approbation.",
      "Chaque établissement peut activer l’accès pour 30 élèves au maximum.",
      "L’établissement est responsable de vérifier les élèves invités et d’obtenir les consentements correspondants.",
      "Les invitations sont temporaires, personnelles et incessibles.",
      "Tatik peut révoquer l’accès en cas d’abus, de violation ou de données invérifiables.",
    ],
    italianOriginal: "Texte officiel en italien",
    translationUnavailable: "La traduction de cette version n’est pas disponible. Le texte officiel en italien est affiché ci-dessous.",
  },
  de: {
    version: "2026-09-15",
    translatedTerms: [
      "Das Schulprogramm gewährt einmaligen Zugang für einen Monat ab dem Datum der Genehmigung.",
      "Jede Einrichtung kann höchstens 30 Lernende freischalten.",
      "Die Schule ist dafür verantwortlich, eingeladene Lernende zu überprüfen und die erforderlichen Einwilligungen einzuholen.",
      "Einladungen sind zeitlich begrenzt, persönlich und nicht übertragbar.",
      "Tatik kann den Zugang bei Missbrauch, Verstößen oder nicht überprüfbaren Angaben widerrufen.",
    ],
    italianOriginal: "Offizieller Text auf Italienisch",
    translationUnavailable: "Für diese Version ist keine Übersetzung verfügbar. Unten wird der offizielle italienische Text angezeigt.",
  },
  pt: {
    version: "2026-09-15",
    translatedTerms: [
      "O programa escolar concede acesso único durante um mês a partir da data de aprovação.",
      "Cada instituição pode ativar o acesso para, no máximo, 30 estudantes.",
      "A escola é responsável por verificar os estudantes convidados e obter os consentimentos necessários.",
      "Os convites são temporários, pessoais e intransmissíveis.",
      "A Tatik pode revogar o acesso em caso de abuso, infração ou dados que não possam ser verificados.",
    ],
    italianOriginal: "Texto oficial em italiano",
    translationUnavailable: "Não há tradução disponível para esta versão. O texto oficial em italiano é apresentado abaixo.",
  },
  ru: {
    version: "2026-09-15",
    translatedTerms: [
      "Школьная программа предоставляет однократный доступ на один месяц с даты одобрения.",
      "Каждое учреждение может активировать доступ не более чем для 30 учащихся.",
      "Школа отвечает за проверку приглашённых учащихся и получение соответствующих согласий.",
      "Приглашения временные, персональные и не подлежат передаче.",
      "Tatik может отозвать доступ в случае злоупотребления, нарушения правил или невозможности проверить данные.",
    ],
    italianOriginal: "Официальный текст на итальянском языке",
    translationUnavailable: "Перевод этой версии недоступен. Ниже приводится официальный текст на итальянском языке.",
  },
  zh: {
    version: "2026-09-15",
    translatedTerms: [
      "学校计划自获批之日起提供为期一个月的一次性访问权限。",
      "每家机构最多可为 30 名学生开通访问权限。",
      "学校负责核实受邀学生身份并取得相关同意。",
      "邀请具有时效性、仅限本人使用且不可转让。",
      "如发生滥用、违规或信息无法核实的情况，Tatik 可撤销访问权限。",
    ],
    italianOriginal: "意大利语官方原文",
    translationUnavailable: "此版本暂无译文。下方显示意大利语官方原文。",
  },
  ja: {
    version: "2026-09-15",
    translatedTerms: [
      "スクールプログラムでは、承認日から1か月間のアクセスを一度限り提供します。",
      "各機関がアクセスを有効化できる学生は最大30名です。",
      "招待した学生の確認および必要な同意の取得は、学校の責任で行ってください。",
      "招待は期間限定で、本人のみ有効であり、譲渡できません。",
      "不正利用、規約違反、または確認できない情報がある場合、Tatikはアクセスを取り消すことがあります。",
    ],
    italianOriginal: "イタリア語の公式原文",
    translationUnavailable: "このバージョンの翻訳はありません。以下にイタリア語の公式原文を表示します。",
  },
  ko: {
    version: "2026-09-15",
    translatedTerms: [
      "학교 프로그램은 승인일로부터 한 달 동안 1회성 액세스를 제공합니다.",
      "각 기관은 최대 30명의 학생에게 액세스를 활성화할 수 있습니다.",
      "학교는 초대된 학생을 확인하고 관련 동의를 받는 책임이 있습니다.",
      "초대는 기간 한정이며 개인에게만 유효하고 양도할 수 없습니다.",
      "남용, 규정 위반 또는 확인할 수 없는 정보가 있는 경우 Tatik은 액세스를 취소할 수 있습니다.",
    ],
    italianOriginal: "이탈리아어 공식 원문",
    translationUnavailable: "이 버전의 번역은 제공되지 않습니다. 아래에 이탈리아어 공식 원문이 표시됩니다.",
  },
  ar: {
    version: "2026-09-15",
    translatedTerms: [
      "يمنح البرنامج المدرسي إمكانية الوصول لمرة واحدة لمدة شهر اعتبارًا من تاريخ الموافقة.",
      "يمكن لكل مؤسسة تفعيل الوصول لما لا يزيد على 30 طالبًا.",
      "تتحمل المدرسة مسؤولية التحقق من الطلاب المدعوين والحصول على الموافقات اللازمة.",
      "الدعوات مؤقتة وشخصية وغير قابلة للتحويل.",
      "يجوز لـ Tatik إلغاء الوصول في حالات إساءة الاستخدام أو المخالفة أو تعذّر التحقق من البيانات.",
    ],
    italianOriginal: "النص الرسمي باللغة الإيطالية",
    translationUnavailable: "لا تتوفر ترجمة لهذا الإصدار. يظهر أدناه النص الرسمي باللغة الإيطالية.",
  },
  hi: {
    version: "2026-09-15",
    translatedTerms: [
      "स्कूल कार्यक्रम स्वीकृति की तारीख से एक महीने के लिए एक बार की पहुँच देता है।",
      "प्रत्येक संस्था अधिकतम 30 विद्यार्थियों के लिए पहुँच सक्रिय कर सकती है।",
      "आमंत्रित विद्यार्थियों की पुष्टि करना और आवश्यक सहमति प्राप्त करना स्कूल की जिम्मेदारी है।",
      "आमंत्रण अस्थायी, व्यक्तिगत और अहस्तांतरणीय हैं।",
      "दुरुपयोग, उल्लंघन या सत्यापित न हो सकने वाली जानकारी की स्थिति में Tatik पहुँच रद्द कर सकता है।",
    ],
    italianOriginal: "इतालवी में आधिकारिक मूल पाठ",
    translationUnavailable: "इस संस्करण का अनुवाद उपलब्ध नहीं है। नीचे इतालवी में आधिकारिक मूल पाठ दिया गया है।",
  },
  pl: {
    version: "2026-09-15",
    translatedTerms: [
      "Program szkolny przyznaje jednorazowy dostęp na miesiąc od daty zatwierdzenia.",
      "Każda placówka może aktywować dostęp dla maksymalnie 30 uczniów.",
      "Szkoła odpowiada za weryfikację zaproszonych uczniów i uzyskanie wymaganych zgód.",
      "Zaproszenia są tymczasowe, imienne i nie mogą być przekazywane innym osobom.",
      "Tatik może cofnąć dostęp w przypadku nadużycia, naruszenia zasad lub danych, których nie można zweryfikować.",
    ],
    italianOriginal: "Oficjalny tekst w języku włoskim",
    translationUnavailable: "Tłumaczenie tej wersji jest niedostępne. Poniżej znajduje się oficjalny tekst w języku włoskim.",
  },
  nl: {
    version: "2026-09-15",
    translatedTerms: [
      "Het schoolprogramma verleent eenmalig toegang voor één maand vanaf de goedkeuringsdatum.",
      "Elke instelling kan toegang activeren voor maximaal 30 leerlingen.",
      "De school is verantwoordelijk voor het controleren van uitgenodigde leerlingen en het verkrijgen van de vereiste toestemmingen.",
      "Uitnodigingen zijn tijdelijk, persoonlijk en niet overdraagbaar.",
      "Tatik kan de toegang intrekken bij misbruik, overtredingen of gegevens die niet kunnen worden geverifieerd.",
    ],
    italianOriginal: "Officiële tekst in het Italiaans",
    translationUnavailable: "Er is geen vertaling beschikbaar voor deze versie. Hieronder staat de officiële Italiaanse tekst.",
  },
  tr: {
    version: "2026-09-15",
    translatedTerms: [
      "Okul programı, onay tarihinden itibaren bir ay boyunca tek seferlik erişim sağlar.",
      "Her kurum en fazla 30 öğrenci için erişimi etkinleştirebilir.",
      "Davet edilen öğrencileri doğrulamak ve gerekli izinleri almak okulun sorumluluğundadır.",
      "Davetler geçicidir, kişiye özeldir ve devredilemez.",
      "Kötüye kullanım, ihlal veya doğrulanamayan bilgiler durumunda Tatik erişimi iptal edebilir.",
    ],
    italianOriginal: "İtalyanca resmî metin",
    translationUnavailable: "Bu sürümün çevirisi mevcut değil. Resmî İtalyanca metin aşağıda gösterilmektedir.",
  },
  sv: {
    version: "2026-09-15",
    translatedTerms: [
      "Skolprogrammet ger engångsåtkomst i en månad från godkännandedatumet.",
      "Varje institution kan aktivera åtkomst för högst 30 elever.",
      "Skolan ansvarar för att kontrollera inbjudna elever och inhämta relevanta samtycken.",
      "Inbjudningar är tillfälliga, personliga och får inte överlåtas.",
      "Tatik kan återkalla åtkomsten vid missbruk, regelbrott eller uppgifter som inte kan verifieras.",
    ],
    italianOriginal: "Officiell text på italienska",
    translationUnavailable: "Det finns ingen översättning av den här versionen. Den officiella italienska texten visas nedan.",
  },
  da: {
    version: "2026-09-15",
    translatedTerms: [
      "Skoleprogrammet giver engangsadgang i én måned fra godkendelsesdatoen.",
      "Hver institution kan aktivere adgang for højst 30 elever.",
      "Skolen er ansvarlig for at kontrollere inviterede elever og indhente de nødvendige samtykker.",
      "Invitationer er midlertidige, personlige og må ikke overdrages.",
      "Tatik kan tilbagekalde adgangen ved misbrug, overtrædelser eller oplysninger, der ikke kan verificeres.",
    ],
    italianOriginal: "Officiel tekst på italiensk",
    translationUnavailable: "Der findes ingen oversættelse af denne version. Den officielle italienske tekst vises nedenfor.",
  },
  no: {
    version: "2026-09-15",
    translatedTerms: [
      "Skoleprogrammet gir engangstilgang i én måned fra godkjenningsdatoen.",
      "Hver institusjon kan aktivere tilgang for maksimalt 30 elever.",
      "Skolen er ansvarlig for å kontrollere inviterte elever og innhente nødvendige samtykker.",
      "Invitasjoner er midlertidige, personlige og kan ikke overføres.",
      "Tatik kan tilbakekalle tilgangen ved misbruk, regelbrudd eller opplysninger som ikke kan verifiseres.",
    ],
    italianOriginal: "Offisiell tekst på italiensk",
    translationUnavailable: "Det finnes ingen oversettelse av denne versjonen. Den offisielle italienske teksten vises nedenfor.",
  },
  fi: {
    version: "2026-09-15",
    translatedTerms: [
      "Kouluohjelma myöntää kertaluonteisen käyttöoikeuden kuukaudeksi hyväksymispäivästä alkaen.",
      "Kukin oppilaitos voi aktivoida käyttöoikeuden enintään 30 opiskelijalle.",
      "Koulu vastaa kutsuttujen opiskelijoiden henkilöllisyyden tarkistamisesta ja tarvittavien suostumusten hankkimisesta.",
      "Kutsut ovat määräaikaisia, henkilökohtaisia eikä niitä voi siirtää toiselle.",
      "Tatik voi peruuttaa käyttöoikeuden väärinkäytösten, rikkomusten tai vahvistamattomien tietojen vuoksi.",
    ],
    italianOriginal: "Virallinen italiankielinen teksti",
    translationUnavailable: "Tätä versiota ei ole käännetty. Virallinen italiankielinen teksti näkyy alla.",
  },
  uk: {
    version: "2026-09-15",
    translatedTerms: [
      "Шкільна програма надає одноразовий доступ на один місяць від дати схвалення.",
      "Кожен заклад може активувати доступ не більш ніж для 30 учнів.",
      "Школа відповідає за перевірку запрошених учнів і отримання відповідних згод.",
      "Запрошення тимчасові, персональні та не підлягають передачі.",
      "Tatik може відкликати доступ у разі зловживання, порушення правил або неможливості перевірити дані.",
    ],
    italianOriginal: "Офіційний текст італійською мовою",
    translationUnavailable: "Переклад цієї версії недоступний. Нижче наведено офіційний текст італійською мовою.",
  },
  cs: {
    version: "2026-09-15",
    translatedTerms: [
      "Školní program poskytuje jednorázový přístup na jeden měsíc ode dne schválení.",
      "Každá instituce může aktivovat přístup nejvýše pro 30 studentů.",
      "Škola odpovídá za ověření pozvaných studentů a získání příslušných souhlasů.",
      "Pozvánky jsou dočasné, osobní a nepřenosné.",
      "Tatik může přístup odebrat v případě zneužití, porušení pravidel nebo neověřitelných údajů.",
    ],
    italianOriginal: "Oficiální text v italštině",
    translationUnavailable: "Překlad této verze není k dispozici. Níže je uveden oficiální italský text.",
  },
};
