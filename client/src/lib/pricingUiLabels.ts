type PricingUiLabels = {
  pageTitle: string;
  trialPlanTitle: string;
  freePlanButton: string;
  backToHome: string;
  trialActive: string;
  trialEnded: string;
  afterTrial: string;
  month: string;
  trialPriceUnit: string;
  firstMonthUnit: string;
  thenLabel: string;
  daysLeft: string;
  advancedEditor: string;
  backup: string;
  aiCopilot: string;
  projectOrganization: string;
  startFree: string;
  recommended: string;
  prioritySupport: string;
  usageSavings: string;
  advancedAnalytics: string;
  freePlanLimited: string;
  localBackupOnly: string;
  aiUnavailable: string;
  onlineBackupUnavailable: string;
  proFeaturesUnavailable: string;
  loading: string;
  stripeButton: string;
  paypalButton: string;
  contactTitle: string;
};

export const pricingUiLabels: Record<string, PricingUiLabels> = {
  en: {
    pageTitle: "Pricing", trialPlanTitle: "Free Trial", freePlanButton: "Free", backToHome: "Back to Home", trialActive: "TRIAL ACTIVE", trialEnded: "TRIAL ENDED", afterTrial: "AFTER TRIAL",
    month: "month", trialPriceUnit: "/month for 60 days", firstMonthUnit: "/month (first month)", thenLabel: "then",
    daysLeft: "{days} days left", advancedEditor: "Advanced Editor", backup: "Backup", aiCopilot: "AI Co-pilot",
    projectOrganization: "Hierarchical project organization", startFree: "Start for free", recommended: "RECOMMENDED",
    prioritySupport: "Priority support", usageSavings: "The more you use the site, the more you save", advancedAnalytics: "Advanced analytics",
    freePlanLimited: "Free (Limited)", localBackupOnly: "Local backup only", aiUnavailable: "AI assistant unavailable",
    onlineBackupUnavailable: "Online backup unavailable", proFeaturesUnavailable: "Pro features not included", loading: "Loading…",
    stripeButton: "Complete order", paypalButton: "Complete order with PayPal", contactTitle: "Questions about pricing?",
  },
  it: {
    pageTitle: "Prezzi", trialPlanTitle: "Prova gratuita", freePlanButton: "Free", backToHome: "Torna alla Home", trialActive: "PROVA ATTIVA", trialEnded: "PROVA TERMINATA", afterTrial: "DOPO LA PROVA",
    month: "mese", trialPriceUnit: "/mese per 60 giorni", firstMonthUnit: "/mese (primo mese)", thenLabel: "poi",
    daysLeft: "ancora {days} giorni", advancedEditor: "Editor avanzato", backup: "Backup", aiCopilot: "AI Co-pilot",
    projectOrganization: "Struttura gerarchica per organizzare i progetti", startFree: "Inizia gratuitamente", recommended: "CONSIGLIATO",
    prioritySupport: "Supporto prioritario", usageSavings: "Più usi il sito, più risparmi", advancedAnalytics: "Analytics avanzate",
    freePlanLimited: "Free (limitato)", localBackupOnly: "Solo backup locale", aiUnavailable: "Assistente AI non disponibile",
    onlineBackupUnavailable: "Backup online non disponibile", proFeaturesUnavailable: "Funzionalità Pro non incluse", loading: "Caricamento…",
    stripeButton: "Completa l'ordine", paypalButton: "Completa l'ordine con PayPal", contactTitle: "Domande sui prezzi?",
  },
  es: {
    pageTitle: "Precios", trialPlanTitle: "Prueba gratuita", freePlanButton: "Free", backToHome: "Volver al inicio", trialActive: "PRUEBA ACTIVA", trialEnded: "PRUEBA FINALIZADA", afterTrial: "DESPUÉS DE LA PRUEBA",
    month: "mes", trialPriceUnit: "/mes durante 60 días", firstMonthUnit: "/mes (primer mes)", thenLabel: "después",
    daysLeft: "quedan {days} días", advancedEditor: "Editor avanzado", backup: "Copias de seguridad", aiCopilot: "Copiloto de IA",
    projectOrganization: "Organización jerárquica de proyectos", startFree: "Empezar gratis", recommended: "RECOMENDADO",
    prioritySupport: "Soporte prioritario", usageSavings: "Cuanto más uses el sitio, más ahorras", advancedAnalytics: "Analítica avanzada",
    freePlanLimited: "Free (limitado)", localBackupOnly: "Solo copias de seguridad locales", aiUnavailable: "Asistente de IA no disponible",
    onlineBackupUnavailable: "Copias de seguridad en línea no disponibles", proFeaturesUnavailable: "Funciones Pro no incluidas", loading: "Cargando…",
    stripeButton: "Completar el pedido", paypalButton: "Completar el pedido con PayPal", contactTitle: "¿Tienes preguntas sobre los precios?",
  },
  fr: {
    pageTitle: "Tarifs", trialPlanTitle: "Essai gratuit", freePlanButton: "Free", backToHome: "Retour à l’accueil", trialActive: "ESSAI EN COURS", trialEnded: "ESSAI TERMINÉ", afterTrial: "APRÈS L’ESSAI",
    month: "mois", trialPriceUnit: "/mois pendant 60 jours", firstMonthUnit: "/mois (1er mois)", thenLabel: "puis",
    daysLeft: "encore {days} jours", advancedEditor: "Éditeur avancé", backup: "Sauvegarde", aiCopilot: "Assistant IA",
    projectOrganization: "Organisation hiérarchique des projets", startFree: "Commencer gratuitement", recommended: "RECOMMANDÉ",
    prioritySupport: "Assistance prioritaire", usageSavings: "Plus vous utilisez le site, plus vous économisez", advancedAnalytics: "Analyses avancées",
    freePlanLimited: "Free (limité)", localBackupOnly: "Sauvegarde locale uniquement", aiUnavailable: "Assistant IA indisponible",
    onlineBackupUnavailable: "Sauvegarde en ligne indisponible", proFeaturesUnavailable: "Fonctionnalités Pro non incluses", loading: "Chargement…",
    stripeButton: "Finaliser la commande", paypalButton: "Finaliser la commande avec PayPal", contactTitle: "Des questions sur les tarifs ?",
  },
  de: {
    pageTitle: "Preise", trialPlanTitle: "Kostenlose Testphase", freePlanButton: "Free", backToHome: "Zurück zur Startseite", trialActive: "TESTPHASE AKTIV", trialEnded: "TESTPHASE BEENDET", afterTrial: "NACH DER TESTPHASE",
    month: "Monat", trialPriceUnit: "/Monat für 60 Tage", firstMonthUnit: "/Monat (1. Monat)", thenLabel: "danach",
    daysLeft: "noch {days} Tage", advancedEditor: "Erweiterter Editor", backup: "Backup", aiCopilot: "KI-Copilot",
    projectOrganization: "Hierarchische Projektorganisation", startFree: "Kostenlos starten", recommended: "EMPFOHLEN",
    prioritySupport: "Priorisierter Support", usageSavings: "Je mehr du die Website nutzt, desto mehr sparst du", advancedAnalytics: "Erweiterte Analysen",
    freePlanLimited: "Free (eingeschränkt)", localBackupOnly: "Nur lokale Backups", aiUnavailable: "KI-Assistent nicht verfügbar",
    onlineBackupUnavailable: "Online-Backup nicht verfügbar", proFeaturesUnavailable: "Pro-Funktionen nicht enthalten", loading: "Wird geladen…",
    stripeButton: "Bestellung abschließen", paypalButton: "Bestellung mit PayPal abschließen", contactTitle: "Fragen zu den Preisen?",
  },
  pt: {
    pageTitle: "Preços", trialPlanTitle: "Período de teste gratuito", freePlanButton: "Free", backToHome: "Voltar ao início", trialActive: "PERÍODO DE TESTE ATIVO", trialEnded: "PERÍODO DE TESTE TERMINADO", afterTrial: "APÓS O TESTE",
    month: "mês", trialPriceUnit: "/mês durante 60 dias", firstMonthUnit: "/mês (1.º mês)", thenLabel: "depois",
    daysLeft: "faltam {days} dias", advancedEditor: "Editor avançado", backup: "Cópias de segurança", aiCopilot: "Copiloto de IA",
    projectOrganization: "Organização hierárquica dos projetos", startFree: "Começar gratuitamente", recommended: "RECOMENDADO",
    prioritySupport: "Suporte prioritário", usageSavings: "Quanto mais utiliza o site, mais poupa", advancedAnalytics: "Análise avançada",
    freePlanLimited: "Free (limitado)", localBackupOnly: "Apenas cópias de segurança locais", aiUnavailable: "Assistente de IA indisponível",
    onlineBackupUnavailable: "Cópias de segurança online indisponíveis", proFeaturesUnavailable: "Funcionalidades Pro não incluídas", loading: "A carregar…",
    stripeButton: "Concluir a encomenda", paypalButton: "Concluir a encomenda com PayPal", contactTitle: "Dúvidas sobre os preços?",
  },
  ru: {
    pageTitle: "Цены", trialPlanTitle: "Бесплатный пробный период", freePlanButton: "Free", backToHome: "На главную", trialActive: "ПРОБНЫЙ ПЕРИОД АКТИВЕН", trialEnded: "ПРОБНЫЙ ПЕРИОД ЗАВЕРШЁН", afterTrial: "ПОСЛЕ ПРОБНОГО ПЕРИОДА",
    month: "месяц", trialPriceUnit: "/месяц в течение 60 дней", firstMonthUnit: "/месяц (1-й месяц)", thenLabel: "далее",
    daysLeft: "осталось {days} дн.", advancedEditor: "Расширенный редактор", backup: "Резервное копирование", aiCopilot: "ИИ-помощник",
    projectOrganization: "Иерархическая организация проектов", startFree: "Начать бесплатно", recommended: "РЕКОМЕНДУЕМ",
    prioritySupport: "Приоритетная поддержка", usageSavings: "Чем чаще вы пользуетесь сайтом, тем больше экономите", advancedAnalytics: "Расширенная аналитика",
    freePlanLimited: "Free (ограниченный)", localBackupOnly: "Только локальные резервные копии", aiUnavailable: "ИИ-помощник недоступен",
    onlineBackupUnavailable: "Онлайн-копирование недоступно", proFeaturesUnavailable: "Функции Pro не включены", loading: "Загрузка…",
    stripeButton: "Завершить заказ", paypalButton: "Завершить заказ через PayPal", contactTitle: "Вопросы о тарифах?",
  },
  zh: {
    pageTitle: "价格", trialPlanTitle: "免费试用", freePlanButton: "Free", backToHome: "返回主页", trialActive: "试用进行中", trialEnded: "试用已结束", afterTrial: "试用结束后",
    month: "月", trialPriceUnit: "/月，共 60 天", firstMonthUnit: "/月（首月）", thenLabel: "之后",
    daysLeft: "还剩 {days} 天", advancedEditor: "高级编辑器", backup: "备份", aiCopilot: "AI 助手",
    projectOrganization: "项目分层管理", startFree: "免费开始", recommended: "推荐",
    prioritySupport: "优先支持", usageSavings: "使用网站越多，节省越多", advancedAnalytics: "高级分析",
    freePlanLimited: "Free（有限功能）", localBackupOnly: "仅支持本地备份", aiUnavailable: "AI 助手不可用",
    onlineBackupUnavailable: "在线备份不可用", proFeaturesUnavailable: "不包含 Pro 功能", loading: "正在加载…",
    stripeButton: "完成订单", paypalButton: "使用 PayPal 完成订单", contactTitle: "对价格有疑问？",
  },
  ja: {
    pageTitle: "料金プラン", trialPlanTitle: "無料トライアル", freePlanButton: "Free", backToHome: "ホームに戻る", trialActive: "トライアル中", trialEnded: "トライアル終了", afterTrial: "トライアル終了後",
    month: "か月", trialPriceUnit: "/月（60日間）", firstMonthUnit: "/月（初月）", thenLabel: "以降",
    daysLeft: "残り {days} 日", advancedEditor: "高度なエディター", backup: "バックアップ", aiCopilot: "AI コパイロット",
    projectOrganization: "階層型プロジェクト管理", startFree: "無料で始める", recommended: "おすすめ",
    prioritySupport: "優先サポート", usageSavings: "サイトを使うほどお得に", advancedAnalytics: "高度な分析",
    freePlanLimited: "Free（機能制限あり）", localBackupOnly: "ローカルバックアップのみ", aiUnavailable: "AI アシスタントは利用できません",
    onlineBackupUnavailable: "オンラインバックアップは利用できません", proFeaturesUnavailable: "Pro 機能は含まれません", loading: "読み込み中…",
    stripeButton: "注文を完了", paypalButton: "PayPalで注文を完了", contactTitle: "料金についてのご質問",
  },
  ko: {
    pageTitle: "요금", trialPlanTitle: "무료 체험", freePlanButton: "Free", backToHome: "홈으로 돌아가기", trialActive: "체험 진행 중", trialEnded: "체험 종료", afterTrial: "체험 종료 후",
    month: "개월", trialPriceUnit: "/월, 60일간", firstMonthUnit: "/월 (첫 달)", thenLabel: "이후",
    daysLeft: "{days}일 남음", advancedEditor: "고급 편집기", backup: "백업", aiCopilot: "AI 코파일럿",
    projectOrganization: "계층형 프로젝트 구성", startFree: "무료로 시작", recommended: "추천",
    prioritySupport: "우선 지원", usageSavings: "사이트를 많이 사용할수록 더 많이 절약", advancedAnalytics: "고급 분석",
    freePlanLimited: "Free (제한된 기능)", localBackupOnly: "로컬 백업만 가능", aiUnavailable: "AI 도우미 사용 불가",
    onlineBackupUnavailable: "온라인 백업 사용 불가", proFeaturesUnavailable: "Pro 기능 미포함", loading: "불러오는 중…",
    stripeButton: "주문 완료", paypalButton: "PayPal로 주문 완료", contactTitle: "요금에 대해 궁금하신가요?",
  },
  ar: {
    pageTitle: "الأسعار", trialPlanTitle: "فترة تجريبية مجانية", freePlanButton: "Free", backToHome: "العودة إلى الصفحة الرئيسية", trialActive: "الفترة التجريبية نشطة", trialEnded: "انتهت الفترة التجريبية", afterTrial: "بعد الفترة التجريبية",
    month: "شهر", trialPriceUnit: "/شهريًا لمدة 60 يومًا", firstMonthUnit: "/شهريًا (الشهر الأول)", thenLabel: "ثم",
    daysLeft: "متبقي {days} أيام", advancedEditor: "محرر متقدم", backup: "نسخ احتياطي", aiCopilot: "مساعد الذكاء الاصطناعي",
    projectOrganization: "تنظيم هرمي للمشاريع", startFree: "ابدأ مجانًا", recommended: "موصى به",
    prioritySupport: "دعم ذو أولوية", usageSavings: "كلما استخدمت الموقع أكثر، وفّرت أكثر", advancedAnalytics: "تحليلات متقدمة",
    freePlanLimited: "Free (محدودة)", localBackupOnly: "نسخ احتياطي محلي فقط", aiUnavailable: "مساعد الذكاء الاصطناعي غير متاح",
    onlineBackupUnavailable: "النسخ الاحتياطي عبر الإنترنت غير متاح", proFeaturesUnavailable: "ميزات Pro غير مشمولة", loading: "جارٍ التحميل…",
    stripeButton: "إكمال الطلب", paypalButton: "إكمال الطلب عبر PayPal", contactTitle: "هل لديك أسئلة عن الأسعار؟",
  },
  hi: {
    pageTitle: "मूल्य", trialPlanTitle: "मुफ़्त परीक्षण", freePlanButton: "Free", backToHome: "होम पर वापस जाएँ", trialActive: "मुफ़्त परीक्षण सक्रिय", trialEnded: "मुफ़्त परीक्षण समाप्त", afterTrial: "परीक्षण के बाद",
    month: "महीना", trialPriceUnit: "/महीना, 60 दिनों के लिए", firstMonthUnit: "/महीना (पहला महीना)", thenLabel: "इसके बाद",
    daysLeft: "{days} दिन शेष", advancedEditor: "उन्नत एडिटर", backup: "बैकअप", aiCopilot: "AI को-पायलट",
    projectOrganization: "परियोजनाओं को व्यवस्थित करने के लिए पदानुक्रम", startFree: "मुफ़्त शुरू करें", recommended: "अनुशंसित",
    prioritySupport: "प्राथमिकता सहायता", usageSavings: "साइट का अधिक उपयोग करें, अधिक बचत करें", advancedAnalytics: "उन्नत विश्लेषण",
    freePlanLimited: "Free (सीमित)", localBackupOnly: "केवल स्थानीय बैकअप", aiUnavailable: "AI सहायक उपलब्ध नहीं",
    onlineBackupUnavailable: "ऑनलाइन बैकअप उपलब्ध नहीं", proFeaturesUnavailable: "Pro सुविधाएँ शामिल नहीं", loading: "लोड हो रहा है…",
    stripeButton: "ऑर्डर पूरा करें", paypalButton: "PayPal से ऑर्डर पूरा करें", contactTitle: "कीमतों के बारे में सवाल हैं?",
  },
  pl: {
    pageTitle: "Cennik", trialPlanTitle: "Bezpłatny okres próbny", freePlanButton: "Free", backToHome: "Powrót do strony głównej", trialActive: "OKRES PRÓBNY AKTYWNY", trialEnded: "OKRES PRÓBNY ZAKOŃCZONY", afterTrial: "PO OKRESIE PRÓBNYM",
    month: "miesiąc", trialPriceUnit: "/miesiąc przez 60 dni", firstMonthUnit: "/miesiąc (pierwszy miesiąc)", thenLabel: "następnie",
    daysLeft: "pozostało {days} dni", advancedEditor: "Zaawansowany edytor", backup: "Kopie zapasowe", aiCopilot: "Asystent AI",
    projectOrganization: "Hierarchiczna organizacja projektów", startFree: "Rozpocznij za darmo", recommended: "POLECANY",
    prioritySupport: "Priorytetowa pomoc techniczna", usageSavings: "Im częściej korzystasz ze strony, tym więcej oszczędzasz", advancedAnalytics: "Zaawansowana analityka",
    freePlanLimited: "Free (ograniczony)", localBackupOnly: "Tylko lokalne kopie zapasowe", aiUnavailable: "Asystent AI niedostępny",
    onlineBackupUnavailable: "Kopie zapasowe online niedostępne", proFeaturesUnavailable: "Funkcje Pro nie są dostępne", loading: "Ładowanie…",
    stripeButton: "Dokończ zamówienie", paypalButton: "Dokończ zamówienie przez PayPal", contactTitle: "Pytania o ceny?",
  },
  nl: {
    pageTitle: "Prijzen", trialPlanTitle: "Gratis proefperiode", freePlanButton: "Free", backToHome: "Terug naar home", trialActive: "PROEFPERIODE ACTIEF", trialEnded: "PROEFPERIODE VOORBIJ", afterTrial: "NA DE PROEFPERIODE",
    month: "maand", trialPriceUnit: "/maand gedurende 60 dagen", firstMonthUnit: "/maand (eerste maand)", thenLabel: "daarna",
    daysLeft: "nog {days} dagen", advancedEditor: "Geavanceerde editor", backup: "Back-up", aiCopilot: "AI-assistent",
    projectOrganization: "Hiërarchische projectorganisatie", startFree: "Gratis beginnen", recommended: "AANBEVOLEN",
    prioritySupport: "Prioritaire ondersteuning", usageSavings: "Hoe vaker je de site gebruikt, hoe meer je bespaart", advancedAnalytics: "Geavanceerde analyses",
    freePlanLimited: "Free (beperkt)", localBackupOnly: "Alleen lokale back-ups", aiUnavailable: "AI-assistent niet beschikbaar",
    onlineBackupUnavailable: "Online back-up niet beschikbaar", proFeaturesUnavailable: "Pro-functies niet inbegrepen", loading: "Laden…",
    stripeButton: "Bestelling afronden", paypalButton: "Bestelling afronden met PayPal", contactTitle: "Vragen over de prijzen?",
  },
  tr: {
    pageTitle: "Fiyatlar", trialPlanTitle: "Ücretsiz deneme", freePlanButton: "Free", backToHome: "Ana sayfaya dön", trialActive: "DENEME AKTİF", trialEnded: "DENEME SONA ERDİ", afterTrial: "DENEME SONRASI",
    month: "ay", trialPriceUnit: "/ay, 60 gün boyunca", firstMonthUnit: "/ay (ilk ay)", thenLabel: "sonrasında",
    daysLeft: "{days} gün kaldı", advancedEditor: "Gelişmiş düzenleyici", backup: "Yedekleme", aiCopilot: "AI Yardımcı Pilot",
    projectOrganization: "Hiyerarşik proje düzeni", startFree: "Ücretsiz başla", recommended: "ÖNERİLEN",
    prioritySupport: "Öncelikli destek", usageSavings: "Siteyi ne kadar çok kullanırsanız o kadar çok tasarruf edersiniz", advancedAnalytics: "Gelişmiş analizler",
    freePlanLimited: "Free (sınırlı)", localBackupOnly: "Yalnızca yerel yedekleme", aiUnavailable: "AI asistanı kullanılamıyor",
    onlineBackupUnavailable: "Çevrimiçi yedekleme kullanılamıyor", proFeaturesUnavailable: "Pro özellikleri dahil değil", loading: "Yükleniyor…",
    stripeButton: "Siparişi tamamla", paypalButton: "PayPal ile siparişi tamamla", contactTitle: "Fiyatlar hakkında sorularınız mı var?",
  },
  sv: {
    pageTitle: "Priser", trialPlanTitle: "Kostnadsfri testperiod", freePlanButton: "Free", backToHome: "Tillbaka till startsidan", trialActive: "TESTPERIOD AKTIV", trialEnded: "TESTPERIODEN HAR GÅTT UT", afterTrial: "EFTER TESTPERIODEN",
    month: "månad", trialPriceUnit: "/månad i 60 dagar", firstMonthUnit: "/månad (första månaden)", thenLabel: "därefter",
    daysLeft: "{days} dagar kvar", advancedEditor: "Avancerad editor", backup: "Säkerhetskopiering", aiCopilot: "AI-assistent",
    projectOrganization: "Hierarkisk projektorganisation", startFree: "Kom igång gratis", recommended: "REKOMMENDERAS",
    prioritySupport: "Prioriterad support", usageSavings: "Ju mer du använder webbplatsen, desto mer sparar du", advancedAnalytics: "Avancerad analys",
    freePlanLimited: "Free (begränsad)", localBackupOnly: "Endast lokal säkerhetskopiering", aiUnavailable: "AI-assistenten är inte tillgänglig",
    onlineBackupUnavailable: "Säkerhetskopiering online är inte tillgänglig", proFeaturesUnavailable: "Pro-funktioner ingår inte", loading: "Läser in…",
    stripeButton: "Slutför beställningen", paypalButton: "Slutför beställningen med PayPal", contactTitle: "Frågor om priserna?",
  },
  da: {
    pageTitle: "Priser", trialPlanTitle: "Gratis prøveperiode", freePlanButton: "Free", backToHome: "Tilbage til forsiden", trialActive: "PRØVEPERIODE AKTIV", trialEnded: "PRØVEPERIODEN ER UDLØBET", afterTrial: "EFTER PRØVEPERIODEN",
    month: "måned", trialPriceUnit: "/måned i 60 dage", firstMonthUnit: "/måned (første måned)", thenLabel: "derefter",
    daysLeft: "{days} dage tilbage", advancedEditor: "Avanceret editor", backup: "Sikkerhedskopiering", aiCopilot: "AI-assistent",
    projectOrganization: "Hierarkisk projektorganisering", startFree: "Kom gratis i gang", recommended: "ANBEFALET",
    prioritySupport: "Prioriteret support", usageSavings: "Jo mere du bruger websitet, desto mere sparer du", advancedAnalytics: "Avanceret analyse",
    freePlanLimited: "Free (begrænset)", localBackupOnly: "Kun lokal sikkerhedskopiering", aiUnavailable: "AI-assistent ikke tilgængelig",
    onlineBackupUnavailable: "Online sikkerhedskopiering ikke tilgængelig", proFeaturesUnavailable: "Pro-funktioner er ikke inkluderet", loading: "Indlæser…",
    stripeButton: "Gennemfør ordren", paypalButton: "Gennemfør ordren med PayPal", contactTitle: "Spørgsmål om priserne?",
  },
  no: {
    pageTitle: "Priser", trialPlanTitle: "Gratis prøveperiode", freePlanButton: "Free", backToHome: "Tilbake til forsiden", trialActive: "PRØVEPERIODE AKTIV", trialEnded: "PRØVEPERIODEN ER UTLØPT", afterTrial: "ETTER PRØVEPERIODEN",
    month: "måned", trialPriceUnit: "/måned i 60 dager", firstMonthUnit: "/måned (første måned)", thenLabel: "deretter",
    daysLeft: "{days} dager igjen", advancedEditor: "Avansert editor", backup: "Sikkerhetskopiering", aiCopilot: "AI-assistent",
    projectOrganization: "Hierarkisk prosjektorganisering", startFree: "Kom i gang gratis", recommended: "ANBEFALT",
    prioritySupport: "Prioritert brukerstøtte", usageSavings: "Jo mer du bruker nettstedet, desto mer sparer du", advancedAnalytics: "Avansert analyse",
    freePlanLimited: "Free (begrenset)", localBackupOnly: "Kun lokal sikkerhetskopiering", aiUnavailable: "AI-assistent er ikke tilgjengelig",
    onlineBackupUnavailable: "Sikkerhetskopiering på nett er ikke tilgjengelig", proFeaturesUnavailable: "Pro-funksjoner er ikke inkludert", loading: "Laster…",
    stripeButton: "Fullfør bestillingen", paypalButton: "Fullfør bestillingen med PayPal", contactTitle: "Spørsmål om prisene?",
  },
  fi: {
    pageTitle: "Hinnat", trialPlanTitle: "Maksuton kokeilujakso", freePlanButton: "Free", backToHome: "Takaisin etusivulle", trialActive: "KOKEILU KÄYNNISSÄ", trialEnded: "KOKEILU PÄÄTTYNYT", afterTrial: "KOKEILUN JÄLKEEN",
    month: "kuukausi", trialPriceUnit: "/kuukausi 60 päivän ajan", firstMonthUnit: "/kuukausi (1. kuukausi)", thenLabel: "sen jälkeen",
    daysLeft: "{days} päivää jäljellä", advancedEditor: "Edistynyt editori", backup: "Varmuuskopiointi", aiCopilot: "Tekoälyavustaja",
    projectOrganization: "Projektien hierarkkinen järjestäminen", startFree: "Aloita maksutta", recommended: "SUOSITUS",
    prioritySupport: "Ensisijainen tuki", usageSavings: "Mitä enemmän käytät sivustoa, sitä enemmän säästät", advancedAnalytics: "Edistynyt analytiikka",
    freePlanLimited: "Free (rajoitettu)", localBackupOnly: "Vain paikallinen varmuuskopiointi", aiUnavailable: "Tekoälyavustaja ei ole käytettävissä",
    onlineBackupUnavailable: "Verkkovarmuuskopiointi ei ole käytettävissä", proFeaturesUnavailable: "Pro-ominaisuudet eivät sisälly", loading: "Ladataan…",
    stripeButton: "Viimeistele tilaus", paypalButton: "Viimeistele tilaus PayPalin kautta", contactTitle: "Kysyttävää hinnoista?",
  },
  uk: {
    pageTitle: "Ціни", trialPlanTitle: "Безкоштовний пробний період", freePlanButton: "Free", backToHome: "На головну", trialActive: "ПРОБНИЙ ПЕРІОД АКТИВНИЙ", trialEnded: "ПРОБНИЙ ПЕРІОД ЗАВЕРШЕНО", afterTrial: "ПІСЛЯ ПРОБНОГО ПЕРІОДУ",
    month: "місяць", trialPriceUnit: "/місяць протягом 60 днів", firstMonthUnit: "/місяць (перший місяць)", thenLabel: "далі",
    daysLeft: "залишилося {days} дн.", advancedEditor: "Розширений редактор", backup: "Резервне копіювання", aiCopilot: "AI-помічник",
    projectOrganization: "Ієрархічна організація проєктів", startFree: "Почати безкоштовно", recommended: "РЕКОМЕНДОВАНО",
    prioritySupport: "Пріоритетна підтримка", usageSavings: "Що більше ви користуєтеся сайтом, то більше заощаджуєте", advancedAnalytics: "Розширена аналітика",
    freePlanLimited: "Free (обмежений)", localBackupOnly: "Лише локальні резервні копії", aiUnavailable: "AI-помічник недоступний",
    onlineBackupUnavailable: "Онлайн-резервне копіювання недоступне", proFeaturesUnavailable: "Функції Pro не включені", loading: "Завантаження…",
    stripeButton: "Завершити замовлення", paypalButton: "Завершити замовлення через PayPal", contactTitle: "Запитання щодо цін?",
  },
  cs: {
    pageTitle: "Ceník", trialPlanTitle: "Bezplatné zkušební období", freePlanButton: "Free", backToHome: "Zpět na domovskou stránku", trialActive: "ZKUŠEBNÍ OBDOBÍ AKTIVNÍ", trialEnded: "ZKUŠEBNÍ OBDOBÍ SKONČILO", afterTrial: "PO ZKUŠEBNÍM OBDOBÍ",
    month: "měsíc", trialPriceUnit: "/měsíc po dobu 60 dní", firstMonthUnit: "/měsíc (1. měsíc)", thenLabel: "poté",
    daysLeft: "zbývá {days} dní", advancedEditor: "Pokročilý editor", backup: "Zálohování", aiCopilot: "AI asistent",
    projectOrganization: "Hierarchická organizace projektů", startFree: "Začít zdarma", recommended: "DOPORUČUJEME",
    prioritySupport: "Prioritní podpora", usageSavings: "Čím více web používáte, tím více ušetříte", advancedAnalytics: "Pokročilá analytika",
    freePlanLimited: "Free (omezený)", localBackupOnly: "Pouze místní zálohy", aiUnavailable: "AI asistent není k dispozici",
    onlineBackupUnavailable: "Online zálohování není k dispozici", proFeaturesUnavailable: "Funkce Pro nejsou zahrnuty", loading: "Načítání…",
    stripeButton: "Dokončit objednávku", paypalButton: "Dokončit objednávku přes PayPal", contactTitle: "Máte otázky k cenám?",
  },
};
