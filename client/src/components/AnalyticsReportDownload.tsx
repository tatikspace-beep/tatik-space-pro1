import { useEffect, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type {
  AnalyticsReportConclusion,
  AnalyticsReportLanguage,
  AnalyticsReportVisual,
} from "@/lib/analyticsReportPdf";

type StoredReport = {
  reportId: string;
  title: string;
  content: string;
  visuals?: AnalyticsReportVisual[];
  conclusion?: AnalyticsReportConclusion;
  language?: AnalyticsReportLanguage;
};

const REPORT_STORAGE_PREFIX = "tatik.analytics-report.";
const MAX_STORED_IMAGE_CHARS = 600_000;

type ReportCopy = {
  title: string;
  freeDescription: string;
  premiumDescription: string;
  quotaDescription: (
    remaining: number | null,
    monthlyLimit: number,
    rowLimit: number
  ) => string;
  checking: string;
  pdfDescription: string;
  preparing: string;
  downloadFree: string;
  downloadPurchased: string;
  buy: string;
  cancelled: string;
  temporaryMissing: string;
  mismatch: string;
  readFailure: string;
  notReady: string;
  prepareFailure: string;
  generateFailure: string;
  quotaChecking: string;
  staffNotice: string;
  premiumNotice: string;
  freeNotice: (remaining: number | null, monthlyLimit: number, rowLimit: number) => string;
  viewPro: string;
};

function createReportCopy(
  values: Omit<ReportCopy, "quotaDescription" | "freeNotice">,
  quota: (remaining: string | number, limit: string, rowLimit: string) => string,
  free: (remaining: string | number, limit: string, rowLimit: string) => string,
  language: AnalyticsReportLanguage
): ReportCopy {
  return {
    ...values,
    quotaDescription: (remaining, monthlyLimit, rowLimit) =>
      quota(
        remaining ?? "—",
        monthlyLimit.toLocaleString(language),
        rowLimit.toLocaleString(language)
      ),
    freeNotice: (remaining, monthlyLimit, rowLimit) =>
      free(
        remaining == null ? "—" : remaining.toLocaleString(language),
        monthlyLimit.toLocaleString(language),
        rowLimit.toLocaleString(language)
      ),
  };
}

const reportCopy: Record<AnalyticsReportLanguage, ReportCopy> = {
  en: createReportCopy(
    {
      title: "Downloadable report",
      freeDescription: "Free downloads for administrators and collaborators.",
      premiumDescription:
        "Extended analyses are included in your Pro plan; each PDF report is purchased separately.",
      checking: "Checking report quota and price.",
      pdfDescription:
        "The PDF includes available charts and images, contains aggregated results only, and excludes original rows. For checkout returns, the summary is stored temporarily in this tab's session.",
      preparing: "Preparing PDF…",
      downloadFree: "Download PDF for free",
      downloadPurchased: "Download purchased report",
      buy: "Buy PDF",
      cancelled: "Payment cancelled: the report was not purchased.",
      temporaryMissing:
        "The temporary report is unavailable in this tab. Run the analysis again to prepare it.",
      mismatch: "The temporary content does not match the purchased report.",
      readFailure: "Unable to read the report saved in this session.",
      notReady: "The PDF is still being prepared. Try again in a few seconds.",
      prepareFailure: "Unable to prepare the PDF generator.",
      generateFailure: "Unable to generate the PDF.",
      quotaChecking: "Checking analytics quota…",
      staffNotice:
        "Unlimited analyses and free reports for administrators and collaborators.",
      premiumNotice:
        "Pro plan: extended analyses included; PDF reports are purchased individually.",
      viewPro: "View Pro",
    },
    (remaining, limit, rows) =>
      `Free analyses this month: ${remaining} of ${limit}. Up to ${rows} rows per tabular analysis.`,
    (remaining, limit, rows) =>
      `Free plan: ${remaining} of ${limit} analyses remain this month, up to ${rows} rows for tabular analyses. Pro is required above these limits.`,
    "en"
  ),
  it: createReportCopy(
    {
    title: "Report scaricabile",
    freeDescription: "Download gratuito per amministratori e collaboratori.",
    premiumDescription:
      "Le analisi estese sono incluse nel tuo piano Pro; il PDF del report si acquista singolarmente.",
    checking: "Verifica delle quote e del prezzo in corso.",
    pdfDescription:
      "Il PDF include i grafici e le immagini disponibili, contiene solo risultati aggregati e non include le righe originali. Per il ritorno dal checkout il riepilogo è conservato temporaneamente nella sessione di questa scheda.",
    preparing: "Preparazione PDF…",
    downloadFree: "Scarica PDF gratuitamente",
    downloadPurchased: "Scarica il report acquistato",
    buy: "Acquista PDF",
    cancelled: "Pagamento annullato: il report non è stato acquistato.",
    temporaryMissing:
      "Report temporaneo non disponibile in questa scheda. Esegui di nuovo l’analisi per prepararlo.",
    mismatch: "Il contenuto temporaneo non corrisponde al report acquistato.",
    readFailure: "Impossibile leggere il report salvato nella sessione.",
    notReady: "Il PDF è ancora in preparazione. Riprova tra qualche secondo.",
    prepareFailure: "Impossibile preparare il generatore PDF.",
    generateFailure: "Impossibile generare il PDF.",
    quotaChecking: "Verifica della quota analitica in corso…",
    staffNotice:
      "Analisi illimitate e report gratuiti per amministratori e collaboratori.",
    premiumNotice:
      "Piano Pro: analisi estese incluse; i report PDF si acquistano singolarmente.",
    viewPro: "Vedi Pro",
    },
    (remaining, limit, rows) =>
      `Analisi gratuite questo mese: ${remaining} su ${limit}. Fino a ${rows} righe per analisi tabellare.`,
    (remaining, limit, rows) =>
      `Piano gratuito: ${remaining} di ${limit} analisi disponibili questo mese, fino a ${rows} righe per le analisi tabellari. Per superare questi limiti serve Pro.`,
    "it"
  ),
  es: createReportCopy(
    {
      title: "Informe descargable",
      freeDescription: "Descargas gratuitas para administradores y colaboradores.",
      premiumDescription: "Los análisis ampliados están incluidos en el plan Pro; cada informe PDF se compra por separado.",
      checking: "Comprobando la cuota y el precio del informe.",
      pdfDescription: "El PDF incluye los gráficos e imágenes disponibles, solo contiene resultados agregados y no incluye las filas originales. Al volver del pago, el resumen se conserva temporalmente en esta pestaña.",
      preparing: "Preparando PDF…",
      downloadFree: "Descargar PDF gratis",
      downloadPurchased: "Descargar el informe comprado",
      buy: "Comprar PDF",
      cancelled: "Pago cancelado: no se compró el informe.",
      temporaryMissing: "El informe temporal no está disponible en esta pestaña. Vuelve a ejecutar el análisis para prepararlo.",
      mismatch: "El contenido temporal no coincide con el informe comprado.",
      readFailure: "No se puede leer el informe guardado en esta sesión.",
      notReady: "El PDF todavía se está preparando. Vuelve a intentarlo en unos segundos.",
      prepareFailure: "No se puede preparar el generador de PDF.",
      generateFailure: "No se puede generar el PDF.",
      quotaChecking: "Comprobando la cuota de análisis…",
      staffNotice: "Análisis ilimitados e informes gratuitos para administradores y colaboradores.",
      premiumNotice: "Plan Pro: análisis ampliados incluidos; los informes PDF se compran por separado.",
      viewPro: "Ver Pro",
    },
    (remaining, limit, rows) => `Análisis gratuitos este mes: ${remaining} de ${limit}. Hasta ${rows} filas por análisis tabular.`,
    (remaining, limit, rows) => `Plan gratuito: quedan ${remaining} de ${limit} análisis este mes, hasta ${rows} filas por análisis tabular. Se requiere Pro para superar estos límites.`,
    "es"
  ),
  fr: createReportCopy(
    {
      title: "Rapport téléchargeable",
      freeDescription: "Téléchargements gratuits pour les administrateurs et collaborateurs.",
      premiumDescription: "Les analyses avancées sont incluses dans votre forfait Pro ; chaque rapport PDF s'achète séparément.",
      checking: "Vérification du quota et du prix du rapport.",
      pdfDescription: "Le PDF inclut les graphiques et images disponibles, ne contient que des résultats agrégés et exclut les lignes d'origine. Au retour du paiement, le résumé est conservé temporairement dans cet onglet.",
      preparing: "Préparation du PDF…",
      downloadFree: "Télécharger le PDF gratuitement",
      downloadPurchased: "Télécharger le rapport acheté",
      buy: "Acheter le PDF",
      cancelled: "Paiement annulé : le rapport n'a pas été acheté.",
      temporaryMissing: "Le rapport temporaire n'est pas disponible dans cet onglet. Relancez l'analyse pour le préparer.",
      mismatch: "Le contenu temporaire ne correspond pas au rapport acheté.",
      readFailure: "Impossible de lire le rapport enregistré dans cette session.",
      notReady: "Le PDF est encore en préparation. Réessayez dans quelques secondes.",
      prepareFailure: "Impossible de préparer le générateur PDF.",
      generateFailure: "Impossible de générer le PDF.",
      quotaChecking: "Vérification du quota d'analyse…",
      staffNotice: "Analyses illimitées et rapports gratuits pour les administrateurs et collaborateurs.",
      premiumNotice: "Forfait Pro : analyses avancées incluses ; les rapports PDF sont achetés séparément.",
      viewPro: "Voir Pro",
    },
    (remaining, limit, rows) => `Analyses gratuites ce mois-ci : ${remaining} sur ${limit}. Jusqu'à ${rows} lignes par analyse tabulaire.`,
    (remaining, limit, rows) => `Forfait gratuit : ${remaining} analyses sur ${limit} restantes ce mois-ci, jusqu'à ${rows} lignes par analyse tabulaire. Pro est requis au-delà de ces limites.`,
    "fr"
  ),
  de: createReportCopy(
    {
      title: "Herunterladbarer Bericht",
      freeDescription: "Kostenlose Downloads für Administratoren und Mitarbeitende.",
      premiumDescription: "Erweiterte Analysen sind im Pro-Tarif enthalten; jeder PDF-Bericht wird einzeln erworben.",
      checking: "Berichtskontingent und Preis werden geprüft.",
      pdfDescription: "Das PDF enthält verfügbare Diagramme und Bilder, nur aggregierte Ergebnisse und keine Originalzeilen. Bei der Rückkehr vom Checkout wird die Zusammenfassung vorübergehend in diesem Tab gespeichert.",
      preparing: "PDF wird vorbereitet…",
      downloadFree: "PDF kostenlos herunterladen",
      downloadPurchased: "Erworbenen Bericht herunterladen",
      buy: "PDF kaufen",
      cancelled: "Zahlung abgebrochen: Der Bericht wurde nicht erworben.",
      temporaryMissing: "Der temporäre Bericht ist in diesem Tab nicht verfügbar. Führen Sie die Analyse erneut aus.",
      mismatch: "Der temporäre Inhalt stimmt nicht mit dem erworbenen Bericht überein.",
      readFailure: "Der in dieser Sitzung gespeicherte Bericht kann nicht gelesen werden.",
      notReady: "Das PDF wird noch vorbereitet. Versuchen Sie es in wenigen Sekunden erneut.",
      prepareFailure: "Der PDF-Generator kann nicht vorbereitet werden.",
      generateFailure: "Das PDF kann nicht erstellt werden.",
      quotaChecking: "Analyse-Kontingent wird geprüft…",
      staffNotice: "Unbegrenzte Analysen und kostenlose Berichte für Administratoren und Mitarbeitende.",
      premiumNotice: "Pro-Tarif: erweiterte Analysen inklusive; PDF-Berichte werden einzeln erworben.",
      viewPro: "Pro ansehen",
    },
    (remaining, limit, rows) => `Kostenlose Analysen diesen Monat: ${remaining} von ${limit}. Bis zu ${rows} Zeilen je Tabellenanalyse.`,
    (remaining, limit, rows) => `Kostenloser Tarif: Noch ${remaining} von ${limit} Analysen in diesem Monat, bis zu ${rows} Zeilen je Tabellenanalyse. Für höhere Limits ist Pro erforderlich.`,
    "de"
  ),
  pt: createReportCopy(
    {
      title: "Relatório para download",
      freeDescription: "Downloads gratuitos para administradores e colaboradores.",
      premiumDescription: "As análises avançadas estão incluídas no plano Pro; cada relatório PDF é comprado separadamente.",
      checking: "A verificar a quota e o preço do relatório.",
      pdfDescription: "O PDF inclui os gráficos e imagens disponíveis, contém apenas resultados agregados e exclui as linhas originais. Ao regressar do checkout, o resumo fica guardado temporariamente neste separador.",
      preparing: "A preparar PDF…",
      downloadFree: "Descarregar PDF gratuitamente",
      downloadPurchased: "Descarregar relatório comprado",
      buy: "Comprar PDF",
      cancelled: "Pagamento cancelado: o relatório não foi comprado.",
      temporaryMissing: "O relatório temporário não está disponível neste separador. Execute novamente a análise para o preparar.",
      mismatch: "O conteúdo temporário não corresponde ao relatório comprado.",
      readFailure: "Não foi possível ler o relatório guardado nesta sessão.",
      notReady: "O PDF ainda está a ser preparado. Tente novamente dentro de alguns segundos.",
      prepareFailure: "Não foi possível preparar o gerador de PDF.",
      generateFailure: "Não foi possível gerar o PDF.",
      quotaChecking: "A verificar a quota de análise…",
      staffNotice: "Análises ilimitadas e relatórios gratuitos para administradores e colaboradores.",
      premiumNotice: "Plano Pro: análises avançadas incluídas; os relatórios PDF são comprados separadamente.",
      viewPro: "Ver Pro",
    },
    (remaining, limit, rows) => `Análises gratuitas este mês: ${remaining} de ${limit}. Até ${rows} linhas por análise tabular.`,
    (remaining, limit, rows) => `Plano gratuito: restam ${remaining} de ${limit} análises este mês, até ${rows} linhas por análise tabular. É necessário o Pro para exceder estes limites.`,
    "pt"
  ),
  ru: createReportCopy(
    {
      title: "Отчёт для скачивания",
      freeDescription: "Бесплатная загрузка для администраторов и сотрудников.",
      premiumDescription: "Расширенная аналитика включена в план Pro; каждый PDF-отчёт приобретается отдельно.",
      checking: "Проверка лимита и стоимости отчёта.",
      pdfDescription: "PDF включает доступные графики и изображения, содержит только агрегированные результаты и не включает исходные строки. При возврате после оплаты сводка временно сохраняется в этой вкладке.",
      preparing: "Подготовка PDF…",
      downloadFree: "Скачать PDF бесплатно",
      downloadPurchased: "Скачать купленный отчёт",
      buy: "Купить PDF",
      cancelled: "Оплата отменена: отчёт не был куплен.",
      temporaryMissing: "В этой вкладке нет временного отчёта. Запустите анализ ещё раз, чтобы подготовить его.",
      mismatch: "Временные данные не соответствуют купленному отчёту.",
      readFailure: "Не удалось прочитать отчёт, сохранённый в этой сессии.",
      notReady: "PDF ещё готовится. Повторите попытку через несколько секунд.",
      prepareFailure: "Не удалось подготовить генератор PDF.",
      generateFailure: "Не удалось создать PDF.",
      quotaChecking: "Проверка лимита аналитики…",
      staffNotice: "Неограниченный анализ и бесплатные отчёты для администраторов и сотрудников.",
      premiumNotice: "План Pro: расширенная аналитика включена; PDF-отчёты приобретаются отдельно.",
      viewPro: "Посмотреть Pro",
    },
    (remaining, limit, rows) => `Бесплатные анализы в этом месяце: ${remaining} из ${limit}. До ${rows} строк на табличный анализ.`,
    (remaining, limit, rows) => `Бесплатный план: в этом месяце доступно ${remaining} из ${limit} анализов, до ${rows} строк на табличный анализ. Для превышения лимитов нужен Pro.`,
    "ru"
  ),
  pl: createReportCopy(
    {
      title: "Raport do pobrania",
      freeDescription: "Bezpłatne pobieranie dla administratorów i współpracowników.",
      premiumDescription: "Rozszerzone analizy są częścią planu Pro; każdy raport PDF jest kupowany osobno.",
      checking: "Sprawdzanie limitu i ceny raportu.",
      pdfDescription: "PDF zawiera dostępne wykresy i obrazy, wyłącznie wyniki zagregowane i nie obejmuje oryginalnych wierszy. Po powrocie z płatności podsumowanie jest tymczasowo przechowywane w tej karcie.",
      preparing: "Przygotowywanie PDF…",
      downloadFree: "Pobierz PDF bezpłatnie",
      downloadPurchased: "Pobierz kupiony raport",
      buy: "Kup PDF",
      cancelled: "Płatność anulowana: raport nie został kupiony.",
      temporaryMissing: "Raport tymczasowy jest niedostępny w tej karcie. Uruchom analizę ponownie, aby go przygotować.",
      mismatch: "Tymczasowa treść nie jest zgodna z kupionym raportem.",
      readFailure: "Nie można odczytać raportu zapisanego w tej sesji.",
      notReady: "PDF jest nadal przygotowywany. Spróbuj ponownie za kilka sekund.",
      prepareFailure: "Nie można przygotować generatora PDF.",
      generateFailure: "Nie można wygenerować PDF.",
      quotaChecking: "Sprawdzanie limitu analiz…",
      staffNotice: "Nieograniczone analizy i bezpłatne raporty dla administratorów i współpracowników.",
      premiumNotice: "Plan Pro: rozszerzone analizy w cenie; raporty PDF kupuje się osobno.",
      viewPro: "Zobacz Pro",
    },
    (remaining, limit, rows) => `Bezpłatne analizy w tym miesiącu: ${remaining} z ${limit}. Do ${rows} wierszy na analizę tabelaryczną.`,
    (remaining, limit, rows) => `Plan bezpłatny: pozostało ${remaining} z ${limit} analiz w tym miesiącu, do ${rows} wierszy na analizę tabelaryczną. Aby przekroczyć limity, wymagany jest Pro.`,
    "pl"
  ),
  nl: createReportCopy(
    {
      title: "Downloadbaar rapport",
      freeDescription: "Gratis downloads voor beheerders en medewerkers.",
      premiumDescription: "Uitgebreide analyses zijn inbegrepen bij Pro; elk PDF-rapport wordt afzonderlijk aangeschaft.",
      checking: "Rapportquotum en prijs controleren.",
      pdfDescription: "De PDF bevat beschikbare grafieken en afbeeldingen, alleen geaggregeerde resultaten en geen oorspronkelijke rijen. Bij terugkeer van de checkout wordt de samenvatting tijdelijk in dit tabblad bewaard.",
      preparing: "PDF voorbereiden…",
      downloadFree: "PDF gratis downloaden",
      downloadPurchased: "Gekocht rapport downloaden",
      buy: "PDF kopen",
      cancelled: "Betaling geannuleerd: het rapport is niet gekocht.",
      temporaryMissing: "Het tijdelijke rapport is niet beschikbaar in dit tabblad. Voer de analyse opnieuw uit.",
      mismatch: "De tijdelijke inhoud komt niet overeen met het gekochte rapport.",
      readFailure: "Het rapport dat in deze sessie is opgeslagen, kan niet worden gelezen.",
      notReady: "De PDF wordt nog voorbereid. Probeer het over enkele seconden opnieuw.",
      prepareFailure: "De PDF-generator kan niet worden voorbereid.",
      generateFailure: "De PDF kan niet worden gemaakt.",
      quotaChecking: "Analysequota controleren…",
      staffNotice: "Onbeperkte analyses en gratis rapporten voor beheerders en medewerkers.",
      premiumNotice: "Pro-abonnement: uitgebreide analyses inbegrepen; PDF-rapporten worden afzonderlijk gekocht.",
      viewPro: "Bekijk Pro",
    },
    (remaining, limit, rows) => `Gratis analyses deze maand: ${remaining} van ${limit}. Tot ${rows} rijen per tabelanalyse.`,
    (remaining, limit, rows) => `Gratis abonnement: nog ${remaining} van ${limit} analyses deze maand, tot ${rows} rijen per tabelanalyse. Voor hogere limieten is Pro vereist.`,
    "nl"
  ),
  tr: createReportCopy(
    {
      title: "İndirilebilir rapor",
      freeDescription: "Yöneticiler ve iş arkadaşları için ücretsiz indirme.",
      premiumDescription: "Genişletilmiş analizler Pro planına dahildir; her PDF raporu ayrı satın alınır.",
      checking: "Rapor kotası ve fiyatı kontrol ediliyor.",
      pdfDescription: "PDF, mevcut grafikleri ve görselleri içerir; yalnızca toplu sonuçları kapsar ve özgün satırları içermez. Ödeme sayfasından dönüşte özet bu sekmede geçici olarak saklanır.",
      preparing: "PDF hazırlanıyor…",
      downloadFree: "PDF'yi ücretsiz indir",
      downloadPurchased: "Satın alınan raporu indir",
      buy: "PDF satın al",
      cancelled: "Ödeme iptal edildi: rapor satın alınmadı.",
      temporaryMissing: "Geçici rapor bu sekmede bulunamadı. Hazırlamak için analizi yeniden çalıştırın.",
      mismatch: "Geçici içerik satın alınan raporla eşleşmiyor.",
      readFailure: "Bu oturumda kaydedilen rapor okunamadı.",
      notReady: "PDF hâlâ hazırlanıyor. Birkaç saniye sonra yeniden deneyin.",
      prepareFailure: "PDF oluşturucu hazırlanamadı.",
      generateFailure: "PDF oluşturulamadı.",
      quotaChecking: "Analiz kotası kontrol ediliyor…",
      staffNotice: "Yöneticiler ve iş arkadaşları için sınırsız analiz ve ücretsiz rapor.",
      premiumNotice: "Pro planı: genişletilmiş analizler dahildir; PDF raporları ayrı satın alınır.",
      viewPro: "Pro'yu gör",
    },
    (remaining, limit, rows) => `Bu ay ücretsiz analiz: ${remaining}/${limit}. Tablo analizi başına en fazla ${rows} satır.`,
    (remaining, limit, rows) => `Ücretsiz plan: bu ay ${limit} analizden ${remaining} tanesi kaldı; tablo analizi başına en fazla ${rows} satır. Bu sınırları aşmak için Pro gerekir.`,
    "tr"
  ),
  sv: createReportCopy(
    {
      title: "Nedladdningsbar rapport",
      freeDescription: "Kostnadsfria nedladdningar för administratörer och medarbetare.",
      premiumDescription: "Utökade analyser ingår i Pro-planen; varje PDF-rapport köps separat.",
      checking: "Kontrollerar rapportkvot och pris.",
      pdfDescription: "PDF-filen innehåller tillgängliga diagram och bilder, endast aggregerade resultat och inga ursprungliga rader. Vid återkomst från betalningen sparas sammanfattningen tillfälligt i den här fliken.",
      preparing: "Förbereder PDF…",
      downloadFree: "Ladda ner PDF gratis",
      downloadPurchased: "Ladda ner köpt rapport",
      buy: "Köp PDF",
      cancelled: "Betalningen avbröts: rapporten köptes inte.",
      temporaryMissing: "Den tillfälliga rapporten är inte tillgänglig i den här fliken. Kör analysen igen för att förbereda den.",
      mismatch: "Det tillfälliga innehållet matchar inte den köpta rapporten.",
      readFailure: "Det gick inte att läsa rapporten som sparats i den här sessionen.",
      notReady: "PDF-filen förbereds fortfarande. Försök igen om några sekunder.",
      prepareFailure: "Det gick inte att förbereda PDF-generatorn.",
      generateFailure: "Det gick inte att skapa PDF-filen.",
      quotaChecking: "Kontrollerar analyskvot…",
      staffNotice: "Obegränsade analyser och kostnadsfria rapporter för administratörer och medarbetare.",
      premiumNotice: "Pro-plan: utökade analyser ingår; PDF-rapporter köps separat.",
      viewPro: "Visa Pro",
    },
    (remaining, limit, rows) => `Gratis analyser den här månaden: ${remaining} av ${limit}. Upp till ${rows} rader per tabellanalys.`,
    (remaining, limit, rows) => `Gratisplan: ${remaining} av ${limit} analyser återstår den här månaden, upp till ${rows} rader per tabellanalys. Pro krävs för att överskrida gränserna.`,
    "sv"
  ),
  da: createReportCopy(
    {
      title: "Rapport til download",
      freeDescription: "Gratis downloads for administratorer og medarbejdere.",
      premiumDescription: "Udvidede analyser er inkluderet i Pro-abonnementet; hver PDF-rapport købes separat.",
      checking: "Kontrollerer rapportkvote og pris.",
      pdfDescription: "PDF'en indeholder tilgængelige diagrammer og billeder, kun aggregerede resultater og ingen oprindelige rækker. Ved tilbagevenden fra betaling gemmes oversigten midlertidigt i denne fane.",
      preparing: "Forbereder PDF…",
      downloadFree: "Download PDF gratis",
      downloadPurchased: "Download købt rapport",
      buy: "Køb PDF",
      cancelled: "Betaling annulleret: rapporten blev ikke købt.",
      temporaryMissing: "Den midlertidige rapport er ikke tilgængelig i denne fane. Kør analysen igen for at forberede den.",
      mismatch: "Det midlertidige indhold matcher ikke den købte rapport.",
      readFailure: "Rapporten, der er gemt i denne session, kunne ikke læses.",
      notReady: "PDF'en forberedes stadig. Prøv igen om et par sekunder.",
      prepareFailure: "PDF-generatoren kunne ikke forberedes.",
      generateFailure: "PDF'en kunne ikke oprettes.",
      quotaChecking: "Kontrollerer analysekvote…",
      staffNotice: "Ubegrænsede analyser og gratis rapporter for administratorer og medarbejdere.",
      premiumNotice: "Pro-abonnement: udvidede analyser inkluderet; PDF-rapporter købes separat.",
      viewPro: "Se Pro",
    },
    (remaining, limit, rows) => `Gratis analyser denne måned: ${remaining} af ${limit}. Op til ${rows} rækker pr. tabelanalyse.`,
    (remaining, limit, rows) => `Gratis abonnement: ${remaining} af ${limit} analyser tilbage denne måned, op til ${rows} rækker pr. tabelanalyse. Pro kræves for at overskride grænserne.`,
    "da"
  ),
  no: createReportCopy(
    {
      title: "Nedlastbar rapport",
      freeDescription: "Gratis nedlastinger for administratorer og medarbeidere.",
      premiumDescription: "Utvidede analyser er inkludert i Pro-planen; hver PDF-rapport kjøpes separat.",
      checking: "Kontrollerer rapportkvote og pris.",
      pdfDescription: "PDF-en inneholder tilgjengelige diagrammer og bilder, bare aggregerte resultater og ingen opprinnelige rader. Når du kommer tilbake fra betaling, lagres sammendraget midlertidig i denne fanen.",
      preparing: "Forbereder PDF…",
      downloadFree: "Last ned PDF gratis",
      downloadPurchased: "Last ned kjøpt rapport",
      buy: "Kjøp PDF",
      cancelled: "Betalingen ble avbrutt: rapporten ble ikke kjøpt.",
      temporaryMissing: "Den midlertidige rapporten er ikke tilgjengelig i denne fanen. Kjør analysen på nytt for å forberede den.",
      mismatch: "Det midlertidige innholdet samsvarer ikke med den kjøpte rapporten.",
      readFailure: "Kunne ikke lese rapporten som er lagret i denne økten.",
      notReady: "PDF-en klargjøres fortsatt. Prøv igjen om noen sekunder.",
      prepareFailure: "Kunne ikke klargjøre PDF-generatoren.",
      generateFailure: "Kunne ikke lage PDF-en.",
      quotaChecking: "Kontrollerer analysekvote…",
      staffNotice: "Ubegrensede analyser og gratis rapporter for administratorer og medarbeidere.",
      premiumNotice: "Pro-plan: utvidede analyser er inkludert; PDF-rapporter kjøpes separat.",
      viewPro: "Se Pro",
    },
    (remaining, limit, rows) => `Gratis analyser denne måneden: ${remaining} av ${limit}. Opptil ${rows} rader per tabellanalyse.`,
    (remaining, limit, rows) => `Gratisplan: ${remaining} av ${limit} analyser gjenstår denne måneden, opptil ${rows} rader per tabellanalyse. Pro kreves for å overskride grensene.`,
    "no"
  ),
  fi: createReportCopy(
    {
      title: "Ladattava raportti",
      freeDescription: "Maksuton lataus ylläpitäjille ja yhteistyökumppaneille.",
      premiumDescription: "Laajennetut analyysit sisältyvät Pro-tilaukseen; jokainen PDF-raportti ostetaan erikseen.",
      checking: "Tarkistetaan raporttikiintiötä ja hintaa.",
      pdfDescription: "PDF sisältää saatavilla olevat kaaviot ja kuvat, vain koostetut tulokset eikä alkuperäisiä rivejä. Maksun jälkeen tähän välilehteen tallennetaan yhteenveto väliaikaisesti.",
      preparing: "Valmistellaan PDF-tiedostoa…",
      downloadFree: "Lataa PDF maksutta",
      downloadPurchased: "Lataa ostettu raportti",
      buy: "Osta PDF",
      cancelled: "Maksu peruutettiin: raporttia ei ostettu.",
      temporaryMissing: "Väliaikainen raportti ei ole käytettävissä tässä välilehdessä. Suorita analyysi uudelleen.",
      mismatch: "Väliaikainen sisältö ei vastaa ostettua raporttia.",
      readFailure: "Istuntoon tallennettua raporttia ei voitu lukea.",
      notReady: "PDF-tiedostoa valmistellaan vielä. Yritä uudelleen muutaman sekunnin kuluttua.",
      prepareFailure: "PDF-generaattoria ei voitu valmistella.",
      generateFailure: "PDF-tiedostoa ei voitu luoda.",
      quotaChecking: "Tarkistetaan analyysikiintiötä…",
      staffNotice: "Rajoittamattomasti analyysejä ja maksuttomia raportteja ylläpitäjille ja yhteistyökumppaneille.",
      premiumNotice: "Pro-tilaus: laajennetut analyysit sisältyvät; PDF-raportit ostetaan erikseen.",
      viewPro: "Katso Pro",
    },
    (remaining, limit, rows) => `Maksuttomat analyysit tässä kuussa: ${remaining}/${limit}. Enintään ${rows} riviä taulukkoanalyysissä.`,
    (remaining, limit, rows) => `Maksuton tilaus: tässä kuussa jäljellä ${remaining}/${limit} analyysiä, enintään ${rows} riviä taulukkoanalyysissä. Rajojen ylitys edellyttää Pro-tilausta.`,
    "fi"
  ),
  uk: createReportCopy(
    {
      title: "Звіт для завантаження",
      freeDescription: "Безкоштовне завантаження для адміністраторів і співробітників.",
      premiumDescription: "Розширена аналітика входить до плану Pro; кожен PDF-звіт купується окремо.",
      checking: "Перевірка ліміту та вартості звіту.",
      pdfDescription: "PDF містить доступні графіки й зображення, лише агреговані результати та не містить вихідних рядків. Після повернення з оплати зведення тимчасово зберігається в цій вкладці.",
      preparing: "Підготовка PDF…",
      downloadFree: "Завантажити PDF безкоштовно",
      downloadPurchased: "Завантажити придбаний звіт",
      buy: "Купити PDF",
      cancelled: "Оплату скасовано: звіт не придбано.",
      temporaryMissing: "Тимчасовий звіт недоступний у цій вкладці. Запустіть аналіз ще раз, щоб підготувати його.",
      mismatch: "Тимчасовий вміст не відповідає придбаному звіту.",
      readFailure: "Не вдалося прочитати звіт, збережений у цій сесії.",
      notReady: "PDF ще готується. Спробуйте ще раз за кілька секунд.",
      prepareFailure: "Не вдалося підготувати генератор PDF.",
      generateFailure: "Не вдалося створити PDF.",
      quotaChecking: "Перевірка ліміту аналітики…",
      staffNotice: "Необмежена аналітика та безкоштовні звіти для адміністраторів і співробітників.",
      premiumNotice: "План Pro: розширена аналітика включена; PDF-звіти купуються окремо.",
      viewPro: "Переглянути Pro",
    },
    (remaining, limit, rows) => `Безкоштовні аналізи цього місяця: ${remaining} із ${limit}. До ${rows} рядків на табличний аналіз.`,
    (remaining, limit, rows) => `Безкоштовний план: цього місяця доступно ${remaining} із ${limit} аналізів, до ${rows} рядків на табличний аналіз. Для перевищення лімітів потрібен Pro.`,
    "uk"
  ),
  cs: createReportCopy(
    {
      title: "Zpráva ke stažení",
      freeDescription: "Bezplatné stažení pro správce a spolupracovníky.",
      premiumDescription: "Rozšířené analýzy jsou součástí plánu Pro; každý PDF report se kupuje samostatně.",
      checking: "Kontrola kvóty a ceny reportu.",
      pdfDescription: "PDF obsahuje dostupné grafy a obrázky, pouze agregované výsledky a neobsahuje původní řádky. Po návratu z platby se souhrn dočasně uloží v této kartě.",
      preparing: "Příprava PDF…",
      downloadFree: "Stáhnout PDF zdarma",
      downloadPurchased: "Stáhnout zakoupený report",
      buy: "Koupit PDF",
      cancelled: "Platba byla zrušena: report nebyl zakoupen.",
      temporaryMissing: "Dočasný report není v této kartě dostupný. Spusťte analýzu znovu a připravte jej.",
      mismatch: "Dočasný obsah neodpovídá zakoupenému reportu.",
      readFailure: "Report uložený v této relaci se nepodařilo načíst.",
      notReady: "PDF se stále připravuje. Zkuste to znovu za několik sekund.",
      prepareFailure: "Generátor PDF se nepodařilo připravit.",
      generateFailure: "PDF se nepodařilo vytvořit.",
      quotaChecking: "Kontrola kvóty analýz…",
      staffNotice: "Neomezené analýzy a bezplatné reporty pro správce a spolupracovníky.",
      premiumNotice: "Plán Pro: rozšířené analýzy jsou zahrnuty; PDF reporty se kupují samostatně.",
      viewPro: "Zobrazit Pro",
    },
    (remaining, limit, rows) => `Bezplatné analýzy tento měsíc: ${remaining} z ${limit}. Až ${rows} řádků na tabulkovou analýzu.`,
    (remaining, limit, rows) => `Bezplatný plán: tento měsíc zbývá ${remaining} z ${limit} analýz, až ${rows} řádků na tabulkovou analýzu. Pro překročení limitů je nutný Pro.`,
    "cs"
  ),
};

type PdfGenerator =
  typeof import("@/lib/analyticsReportPdf").createAnalyticsReportPdf;

let pdfGenerator: PdfGenerator | null = null;
let pdfGeneratorPromise: Promise<PdfGenerator> | null = null;

function loadPdfGenerator() {
  if (!pdfGeneratorPromise) {
    pdfGeneratorPromise = import("@/lib/analyticsReportPdf").then(module => {
      pdfGenerator = module.createAnalyticsReportPdf;
      return pdfGenerator;
    });
  }
  return pdfGeneratorPromise;
}

async function compressVisualsForStorage(
  visuals: AnalyticsReportVisual[],
  language: AnalyticsReportLanguage
) {
  return Promise.all(
    visuals.map(async visual => {
      if (
        visual.type !== "image" ||
        visual.dataUrl.length <= MAX_STORED_IMAGE_CHARS
      )
        return visual;
      if (!visual.dataUrl.startsWith("data:image/")) {
        throw new Error(reportCopy[language].prepareFailure);
      }

      const image = new Image();
      image.src = visual.dataUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () =>
          reject(new Error(reportCopy[language].prepareFailure));
      });

      const scale = Math.min(
        1,
        1200 / image.naturalWidth,
        900 / image.naturalHeight
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error(reportCopy[language].prepareFailure);
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return { ...visual, dataUrl: canvas.toDataURL("image/jpeg", 0.84) };
    })
  );
}

export function AnalyticsReportDownload({
  title,
  content,
  visuals = [],
  conclusion,
  language,
  returnPath,
}: {
  title: string;
  content: string;
  visuals?: AnalyticsReportVisual[];
  conclusion?: AnalyticsReportConclusion;
  language: AnalyticsReportLanguage;
  returnPath:
    | "/analysis/ml-studio"
    | "/analysis/remote-sensing"
    | "/analysis/portals";
}) {
  const { isAuthenticated } = useAuth();
  const accessQuery = trpc.analyticsAccess.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const checkoutMutation = trpc.analyticsReports.startCheckout.useMutation();
  const verifyMutation = trpc.analyticsReports.verifyPurchase.useMutation();
  const [verifiedReport, setVerifiedReport] = useState<StoredReport | null>(
    null
  );
  const [error, setError] = useState("");
  const reportLanguage = content
    ? language
    : (verifiedReport?.language ?? language);
  const text = reportCopy[reportLanguage];
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [preparingReport, setPreparingReport] = useState(false);
  const [returnParams] = useState(() => {
    if (typeof window === "undefined")
      return { sessionId: "", reportId: "", cancelled: false };
    const params = new URLSearchParams(window.location.search);
    return {
      sessionId: params.get("session_id") || "",
      reportId: params.get("report_id") || "",
      cancelled: params.get("report_purchase") === "cancelled",
    };
  });

  useEffect(() => {
    if (returnParams.cancelled) {
      setError(reportCopy[language].cancelled);
      return;
    }
    if (!isAuthenticated || !returnParams.sessionId || !returnParams.reportId)
      return;

    let active = true;
    const verify = async () => {
      try {
        const stored = sessionStorage.getItem(
          `${REPORT_STORAGE_PREFIX}${returnParams.reportId}`
        );
        if (!stored) throw new Error(reportCopy[language].temporaryMissing);
        const report = JSON.parse(stored) as StoredReport;
        if (
          report.reportId !== returnParams.reportId ||
          !report.content ||
          !report.title
        ) {
          throw new Error(reportCopy[language].mismatch);
        }
        await verifyMutation.mutateAsync({
          sessionId: returnParams.sessionId,
          reportId: returnParams.reportId,
        });
        if (!active) return;
        setVerifiedReport(report);
        sessionStorage.setItem(
          `${REPORT_STORAGE_PREFIX}latest`,
          JSON.stringify(report)
        );
      } catch (reason) {
        if (active)
          setError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        if (active) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.hash}`
          );
        }
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [
    isAuthenticated,
    language,
    returnParams.cancelled,
    returnParams.reportId,
    returnParams.sessionId,
  ]);

  useEffect(() => {
    if (content || returnParams.sessionId || typeof window === "undefined")
      return;
    try {
      const saved = sessionStorage.getItem(`${REPORT_STORAGE_PREFIX}latest`);
      if (saved) setVerifiedReport(JSON.parse(saved) as StoredReport);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : reportCopy[language].readFailure
      );
    }
  }, [content, language, returnParams.sessionId]);

  useEffect(() => {
    if (content) void accessQuery.refetch();
  }, [content]);

  const pdfContent = content || verifiedReport?.content || "";
  useEffect(() => {
    if (!pdfContent) return;
    let active = true;
    setPdfLoading(true);
    void loadPdfGenerator()
      .then(() => {
        if (active) setPdfReady(true);
      })
      .catch(reason => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : reportCopy[language].prepareFailure
          );
      })
      .finally(() => {
        if (active) setPdfLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language, pdfContent]);

  const currentReport: StoredReport | null = content
    ? { reportId: "", title, content, visuals, conclusion, language }
    : verifiedReport;
  const isCurrentReportPaid = Boolean(
    verifiedReport &&
      currentReport &&
      verifiedReport.language === currentReport.language &&
      verifiedReport.title === currentReport.title &&
      verifiedReport.content === currentReport.content &&
      JSON.stringify(verifiedReport.visuals ?? []) ===
        JSON.stringify(currentReport.visuals ?? []) &&
      JSON.stringify(verifiedReport.conclusion) ===
        JSON.stringify(currentReport.conclusion)
  );
  const access = accessQuery.data;
  const freeDownload = Boolean(access?.staff);
  const isPreparingCheckout =
    checkoutMutation.isPending || verifyMutation.isPending || preparingReport;

  const startCheckout = async () => {
    if (!content.trim()) return;
    setError("");
    const reportId = crypto.randomUUID();
    setPreparingReport(true);
    try {
      const report = {
        reportId,
        title,
        content,
        visuals: await compressVisualsForStorage(visuals, language),
        conclusion,
        language,
      };
      sessionStorage.setItem(
        `${REPORT_STORAGE_PREFIX}${reportId}`,
        JSON.stringify(report)
      );
      const checkout = await checkoutMutation.mutateAsync({
        reportId,
        reportTitle: title,
        returnPath,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (reason) {
      sessionStorage.removeItem(`${REPORT_STORAGE_PREFIX}${reportId}`);
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setPreparingReport(false);
    }
  };

  if (
    !content &&
    !returnParams.sessionId &&
    !returnParams.cancelled &&
    !verifiedReport
  )
    return null;

  const reportToDownload =
    freeDownload && content
      ? { title, content, visuals, conclusion, language }
      : isCurrentReportPaid && verifiedReport
        ? verifiedReport
        : null;
  const reportPrice = access
    ? new Intl.NumberFormat(reportLanguage, {
        style: "currency",
        currency: "EUR",
      }).format(access.reportPriceCents / 100)
    : null;

  const download = async (
    reportTitle: string,
    reportContent: string,
    reportVisuals: AnalyticsReportVisual[] = [],
    reportConclusion?: AnalyticsReportConclusion,
    reportLanguage: AnalyticsReportLanguage = "it"
  ) => {
    setError("");
    setPdfLoading(true);
    try {
      if (!pdfGenerator) throw new Error(text.notReady);
      const pdf = await pdfGenerator(
        reportTitle,
        reportContent,
        reportVisuals,
        reportConclusion,
        reportLanguage
      );
      const filename = `${
        reportTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "tatik-report"
      }.pdf`;
      const url = URL.createObjectURL(pdf.output("blob"));
      const anchor = document.createElement("a");
      try {
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
      } finally {
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.generateFailure);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {text.title}
        </CardTitle>
        <CardDescription>
          {access?.staff
            ? text.freeDescription
            : access?.premium
              ? text.premiumDescription
              : access
                ? text.quotaDescription(
                    access.remaining,
                    access.monthlyLimit,
                    access.freeRowLimit
                  )
                : text.checking}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{text.pdfDescription}</p>
        {content &&
          (freeDownload ? (
            <Button
              onClick={() =>
                download(title, content, visuals, conclusion, language)
              }
              disabled={!pdfReady || pdfLoading}
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? text.preparing : text.downloadFree}
            </Button>
          ) : isCurrentReportPaid && verifiedReport ? (
            <Button
              onClick={() =>
                download(
                  verifiedReport.title,
                  verifiedReport.content,
                  verifiedReport.visuals,
                  verifiedReport.conclusion,
                  verifiedReport.language ?? reportLanguage
                )
              }
              disabled={!pdfReady || pdfLoading}
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? text.preparing : text.downloadPurchased}
            </Button>
          ) : (
            <Button
              onClick={startCheckout}
              disabled={
                !isAuthenticated ||
                !access ||
                !pdfReady ||
                pdfLoading ||
                isPreparingCheckout
              }
            >
              {isPreparingCheckout ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {text.buy}
              {reportPrice ? ` · ${reportPrice}` : ""}
            </Button>
          ))}
        {!content && reportToDownload && (
          <Button
            onClick={() =>
              download(
                reportToDownload.title,
                reportToDownload.content,
                reportToDownload.visuals,
                reportToDownload.conclusion,
                reportToDownload.language ?? reportLanguage
              )
            }
            disabled={!pdfReady || pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {pdfLoading ? text.preparing : text.downloadPurchased}
          </Button>
        )}
        {(error || accessQuery.error) && (
          <p role="alert" className="text-sm text-destructive">
            {error || accessQuery.error?.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsUsageNotice({
  language,
}: {
  language: AnalyticsReportLanguage;
}) {
  const { isAuthenticated } = useAuth();
  const statusQuery = trpc.analyticsAccess.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  if (!isAuthenticated) return null;
  const status = statusQuery.data;
  const message = statusQuery.isLoading
    ? reportCopy[language].quotaChecking
    : statusQuery.error
      ? statusQuery.error.message
      : status?.staff
        ? reportCopy[language].staffNotice
        : status?.premium
          ? reportCopy[language].premiumNotice
          : status
            ? reportCopy[language].freeNotice(
                status.remaining,
                status.monthlyLimit,
                status.freeRowLimit
              )
            : "";
  if (!message) return null;

  return (
    <p
      className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground"
      role={statusQuery.error ? "alert" : "status"}
    >
      {message}{" "}
      {!status?.staff && !status?.premium && !statusQuery.error && (
        <Link href="/pricing" className="font-medium text-primary underline">
        {reportCopy[language].viewPro}
        </Link>
      )}
    </p>
  );
}
