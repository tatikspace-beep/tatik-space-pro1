import { useState } from "react";
import { Link } from "wouter";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ExternalLink, FileText, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../server/routers";
import type { ReportLanguage } from "@/lib/sentinelReportLocalization";
import { formatSentinelNumber, normalizeSentinelReportLanguage } from "@/lib/sentinelReportLocalization";

const MAX_FILE_BYTES = 2.5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "docx", "xlsx", "csv", "json", "txt", "md"]);
const copy = {
  it: {
    title: "Documenti e portali",
    description: "Carica materiali di ricerca oppure indica pagine di catalogo e dataset pubblici da esplorare.",
    question: "Obiettivo della ricerca",
    questionPlaceholder: "Es. individuare dataset Sentinel-2 per mappare l'espansione urbana...",
    urls: "URL dei portali o dataset (uno per riga, massimo 5)",
    files: "Documenti (PDF, DOCX, XLSX, CSV, JSON, TXT o MD; massimo 2,5 MB ciascuno)",
    chooseFiles: "Scegli file",
    analyze: "Analizza fonti e documenti",
    login: "Accedi per avviare un'analisi.",
    loginLink: "Accedi",
    limits: "I file sono elaborati in memoria dal servizio Python configurato; l'applicazione non li salva. Non caricare materiali riservati; i PDF scansiti senza testo selezionabile non sono leggibili.",
    noInput: "Aggiungi almeno un documento o un URL.",
    tooManyFiles: "Puoi elaborare al massimo 3 documenti per volta.",
    tooManyUrls: "Puoi esplorare al massimo 5 URL per volta.",
    invalidUrl: "Controlla gli URL: sono ammessi solo indirizzi HTTP o HTTPS validi.",
    unsupportedFile: "Formato non supportato",
    tooLarge: "supera il limite di 2,5 MB.",
    result: "Risultati",
    recommendations: "Risorse individuate",
    preview: "Estratto del documento",
    method: "Indicazioni metodologiche",
    characters: "caratteri estratti",
    processing: "Analisi in corso…",
    emptyResult: "Nessun risultato da mostrare.",
  },
  en: {
    title: "Documents and portals",
    description: "Upload research material or enter public catalog and dataset pages to explore.",
    question: "Research objective",
    questionPlaceholder: "e.g. find Sentinel-2 datasets for mapping urban expansion...",
    urls: "Portal or dataset URLs (one per line, up to 5)",
    files: "Documents (PDF, DOCX, XLSX, CSV, JSON, TXT or MD; up to 2.5 MB each)",
    chooseFiles: "Choose files",
    analyze: "Analyze sources and documents",
    login: "Sign in to start an analysis.",
    loginLink: "Sign in",
    limits: "Files are processed in memory by the configured Python service; the application does not store them. Do not upload confidential material; scanned PDFs without selectable text cannot be read.",
    noInput: "Add at least one document or URL.",
    tooManyFiles: "You can process up to 3 documents at a time.",
    tooManyUrls: "You can explore up to 5 URLs at a time.",
    invalidUrl: "Check the URLs: only valid HTTP or HTTPS addresses are accepted.",
    unsupportedFile: "Unsupported format",
    tooLarge: "exceeds the 2.5 MB limit.",
    result: "Results",
    recommendations: "Resources found",
    preview: "Document excerpt",
    method: "Method guidance",
    characters: "characters extracted",
    processing: "Analyzing…",
    emptyResult: "No results to display.",
  },
};

const sourcesCopy: Record<ReportLanguage, typeof copy.en> = {
  ...copy,
  es: {
    ...copy.en,
    title: "Documentos y portales",
    description: "Carga materiales de investigación o indica páginas públicas de catálogos y conjuntos de datos para explorarlas.",
    question: "Objetivo de la investigación",
    questionPlaceholder: "Por ejemplo, encontrar conjuntos Sentinel-2 para cartografiar la expansión urbana…",
    urls: "URL de portales o conjuntos de datos (una por línea, máximo 5)",
    files: "Documentos (PDF, DOCX, XLSX, CSV, JSON, TXT o MD; máximo 2,5 MB cada uno)",
    chooseFiles: "Elegir archivos",
    analyze: "Analizar fuentes y documentos",
    login: "Inicia sesión para comenzar el análisis.",
    loginLink: "Iniciar sesión",
    limits: "Los archivos se procesan en memoria mediante el servicio Python configurado y la aplicación no los guarda. No cargues material confidencial; no se pueden leer PDF escaneados sin texto seleccionable.",
    noInput: "Añade al menos un documento o una URL.",
    tooManyFiles: "Puedes procesar un máximo de 3 documentos a la vez.",
    tooManyUrls: "Puedes explorar un máximo de 5 URL a la vez.",
    invalidUrl: "Comprueba las URL: solo se admiten direcciones HTTP o HTTPS válidas.",
    unsupportedFile: "Formato no compatible",
    tooLarge: "supera el límite de 2,5 MB.",
    result: "Resultados",
    recommendations: "Recursos encontrados",
    preview: "Extracto del documento",
    method: "Indicaciones metodológicas",
    characters: "caracteres extraídos",
    processing: "Analizando…",
    emptyResult: "No hay resultados que mostrar.",
  },
  ru: {
    ...copy.en,
    title: "Документы и порталы",
    description: "Загрузите исследовательские материалы или укажите страницы общедоступных каталогов и наборов данных.",
    question: "Цель исследования",
    questionPlaceholder: "Например, найти наборы данных Sentinel-2 для картирования городской застройки…",
    urls: "URL порталов или наборов данных (по одному в строке, не более 5)",
    files: "Документы (PDF, DOCX, XLSX, CSV, JSON, TXT или MD; до 2,5 МБ каждый)",
    chooseFiles: "Выбрать файлы",
    analyze: "Анализировать источники и документы",
    login: "Войдите, чтобы начать анализ.",
    loginLink: "Войти",
    limits: "Файлы обрабатываются в памяти настроенной службы Python и не сохраняются приложением. Не загружайте конфиденциальные материалы; сканированные PDF без выделяемого текста прочитать нельзя.",
    noInput: "Добавьте хотя бы один документ или URL.",
    tooManyFiles: "За один раз можно обработать не более 3 документов.",
    tooManyUrls: "За один раз можно проверить не более 5 URL.",
    invalidUrl: "Проверьте URL: допускаются только корректные адреса HTTP или HTTPS.",
    unsupportedFile: "Неподдерживаемый формат",
    tooLarge: "превышает ограничение 2,5 МБ.",
    result: "Результаты",
    recommendations: "Найденные ресурсы",
    preview: "Фрагмент документа",
    method: "Методические указания",
    characters: "извлечено символов",
    processing: "Анализ…",
    emptyResult: "Нет результатов для отображения.",
  },
  fr: {
    ...copy.en,
    title: "Documents et portails",
    description: "Chargez des documents de recherche ou indiquez des pages publiques de catalogues et de jeux de données à explorer.",
    question: "Objectif de recherche",
    questionPlaceholder: "Par exemple, trouver des jeux de données Sentinel-2 pour cartographier l’expansion urbaine…",
    urls: "URL de portails ou de jeux de données (une par ligne, 5 maximum)",
    files: "Documents (PDF, DOCX, XLSX, CSV, JSON, TXT ou MD ; 2,5 Mo maximum chacun)",
    chooseFiles: "Choisir des fichiers",
    analyze: "Analyser les sources et les documents",
    login: "Connectez-vous pour lancer une analyse.",
    loginLink: "Se connecter",
    limits: "Les fichiers sont traités en mémoire par le service Python configuré et ne sont pas enregistrés par l’application. Ne chargez pas de documents confidentiels ; les PDF numérisés sans texte sélectionnable ne peuvent pas être lus.",
    noInput: "Ajoutez au moins un document ou une URL.",
    tooManyFiles: "Vous pouvez traiter au maximum 3 documents à la fois.",
    tooManyUrls: "Vous pouvez explorer au maximum 5 URL à la fois.",
    invalidUrl: "Vérifiez les URL : seules les adresses HTTP ou HTTPS valides sont acceptées.",
    unsupportedFile: "Format non pris en charge",
    tooLarge: "dépasse la limite de 2,5 Mo.",
    result: "Résultats",
    recommendations: "Ressources trouvées",
    preview: "Extrait du document",
    method: "Conseils méthodologiques",
    characters: "caractères extraits",
    processing: "Analyse en cours…",
    emptyResult: "Aucun résultat à afficher.",
  },
  de: {
    ...copy.en,
    title: "Dokumente und Portale",
    description: "Laden Sie Forschungsmaterial hoch oder geben Sie öffentliche Katalog- und Datensatzseiten zur Recherche an.",
    question: "Forschungsziel",
    questionPlaceholder: "Zum Beispiel: Sentinel-2-Datensätze zur Kartierung der Stadterweiterung finden…",
    urls: "Portal- oder Datensatz-URLs (eine pro Zeile, höchstens 5)",
    files: "Dokumente (PDF, DOCX, XLSX, CSV, JSON, TXT oder MD; höchstens 2,5 MB je Datei)",
    chooseFiles: "Dateien auswählen",
    analyze: "Quellen und Dokumente analysieren",
    login: "Melden Sie sich an, um eine Analyse zu starten.",
    loginLink: "Anmelden",
    limits: "Dateien werden im Arbeitsspeicher des konfigurierten Python-Dienstes verarbeitet und von der Anwendung nicht gespeichert. Laden Sie keine vertraulichen Inhalte hoch; gescannte PDFs ohne auswählbaren Text können nicht gelesen werden.",
    noInput: "Fügen Sie mindestens ein Dokument oder eine URL hinzu.",
    tooManyFiles: "Sie können höchstens 3 Dokumente gleichzeitig verarbeiten.",
    tooManyUrls: "Sie können höchstens 5 URLs gleichzeitig untersuchen.",
    invalidUrl: "Prüfen Sie die URLs: Zulässig sind nur gültige HTTP- oder HTTPS-Adressen.",
    unsupportedFile: "Nicht unterstütztes Format",
    tooLarge: "überschreitet die Grenze von 2,5 MB.",
    result: "Ergebnisse",
    recommendations: "Gefundene Ressourcen",
    preview: "Dokumentauszug",
    method: "Methodische Hinweise",
    characters: "Zeichen extrahiert",
    processing: "Analyse läuft…",
    emptyResult: "Keine Ergebnisse vorhanden.",
  },
  pt: {
    ...copy.en,
    title: "Documentos e portais",
    description: "Carregue materiais de investigação ou indique páginas públicas de catálogos e conjuntos de dados para explorar.",
    question: "Objetivo da investigação",
    questionPlaceholder: "Por exemplo, encontrar conjuntos Sentinel-2 para mapear a expansão urbana…",
    urls: "URLs de portais ou conjuntos de dados (uma por linha, até 5)",
    files: "Documentos (PDF, DOCX, XLSX, CSV, JSON, TXT ou MD; até 2,5 MB cada)",
    chooseFiles: "Escolher ficheiros",
    analyze: "Analisar fontes e documentos",
    login: "Inicie sessão para começar uma análise.",
    loginLink: "Iniciar sessão",
    limits: "Os ficheiros são processados em memória pelo serviço Python configurado e não são guardados pela aplicação. Não carregue materiais confidenciais; não é possível ler PDFs digitalizados sem texto selecionável.",
    noInput: "Adicione pelo menos um documento ou URL.",
    tooManyFiles: "Pode processar até 3 documentos de cada vez.",
    tooManyUrls: "Pode explorar até 5 URLs de cada vez.",
    invalidUrl: "Verifique os URLs: só são aceites endereços HTTP ou HTTPS válidos.",
    unsupportedFile: "Formato não suportado",
    tooLarge: "excede o limite de 2,5 MB.",
    result: "Resultados",
    recommendations: "Recursos encontrados",
    preview: "Excerto do documento",
    method: "Orientações metodológicas",
    characters: "caracteres extraídos",
    processing: "A analisar…",
    emptyResult: "Não existem resultados para apresentar.",
  },
  pl: {
    ...copy.en,
    title: "Dokumenty i portale",
    description: "Prześlij materiały badawcze lub podaj publiczne strony katalogów i zbiorów danych do przeszukania.",
    question: "Cel badania",
    questionPlaceholder: "Na przykład: znajdź zbiory Sentinel-2 do mapowania rozrostu miast…",
    urls: "Adresy URL portali lub zbiorów danych (po jednym w wierszu, maks. 5)",
    files: "Dokumenty (PDF, DOCX, XLSX, CSV, JSON, TXT lub MD; maks. 2,5 MB każdy)",
    chooseFiles: "Wybierz pliki",
    analyze: "Analizuj źródła i dokumenty",
    login: "Zaloguj się, aby rozpocząć analizę.",
    loginLink: "Zaloguj się",
    limits: "Pliki są przetwarzane w pamięci skonfigurowanej usługi Python i nie są zapisywane przez aplikację. Nie przesyłaj poufnych materiałów; zeskanowanych plików PDF bez zaznaczalnego tekstu nie można odczytać.",
    noInput: "Dodaj co najmniej jeden dokument lub adres URL.",
    tooManyFiles: "Możesz przetworzyć najwyżej 3 dokumenty jednocześnie.",
    tooManyUrls: "Możesz sprawdzić najwyżej 5 adresów URL jednocześnie.",
    invalidUrl: "Sprawdź adresy URL: akceptowane są wyłącznie prawidłowe adresy HTTP lub HTTPS.",
    unsupportedFile: "Nieobsługiwany format",
    tooLarge: "przekracza limit 2,5 MB.",
    result: "Wyniki",
    recommendations: "Znalezione zasoby",
    preview: "Fragment dokumentu",
    method: "Wskazówki metodyczne",
    characters: "wyodrębnionych znaków",
    processing: "Analizowanie…",
    emptyResult: "Brak wyników do wyświetlenia.",
  },
  nl: {
    ...copy.en,
    title: "Documenten en portalen",
    description: "Upload onderzoeksmateriaal of geef openbare catalogus- en datasetpagina's op om te verkennen.",
    question: "Onderzoeksdoel",
    questionPlaceholder: "Bijvoorbeeld: Sentinel-2-datasets vinden om stadsuitbreiding in kaart te brengen…",
    urls: "URL's van portalen of datasets (één per regel, maximaal 5)",
    files: "Documenten (PDF, DOCX, XLSX, CSV, JSON, TXT of MD; maximaal 2,5 MB per bestand)",
    chooseFiles: "Bestanden kiezen",
    analyze: "Bronnen en documenten analyseren",
    login: "Meld u aan om een analyse te starten.",
    loginLink: "Aanmelden",
    limits: "Bestanden worden in het geheugen verwerkt door de geconfigureerde Python-service en niet door de toepassing opgeslagen. Upload geen vertrouwelijk materiaal; gescande PDF's zonder selecteerbare tekst kunnen niet worden gelezen.",
    noInput: "Voeg minstens één document of URL toe.",
    tooManyFiles: "U kunt maximaal 3 documenten tegelijk verwerken.",
    tooManyUrls: "U kunt maximaal 5 URL's tegelijk verkennen.",
    invalidUrl: "Controleer de URL's: alleen geldige HTTP- of HTTPS-adressen worden geaccepteerd.",
    unsupportedFile: "Niet-ondersteunde indeling",
    tooLarge: "overschrijdt de limiet van 2,5 MB.",
    result: "Resultaten",
    recommendations: "Gevonden bronnen",
    preview: "Documentfragment",
    method: "Methodologische richtlijnen",
    characters: "tekens geëxtraheerd",
    processing: "Analyseren…",
    emptyResult: "Geen resultaten om weer te geven.",
  },
  tr: {
    ...copy.en,
    title: "Belgeler ve portallar",
    description: "Araştırma materyallerini yükleyin veya incelenecek herkese açık katalog ve veri kümesi sayfalarını girin.",
    question: "Araştırma amacı",
    questionPlaceholder: "Örneğin, kentsel genişlemeyi haritalamak için Sentinel-2 veri kümeleri bul…",
    urls: "Portal veya veri kümesi URL'leri (satır başına bir tane, en fazla 5)",
    files: "Belgeler (PDF, DOCX, XLSX, CSV, JSON, TXT veya MD; dosya başına en fazla 2,5 MB)",
    chooseFiles: "Dosya seç",
    analyze: "Kaynakları ve belgeleri analiz et",
    login: "Analizi başlatmak için oturum açın.",
    loginLink: "Oturum aç",
    limits: "Dosyalar yapılandırılmış Python hizmetinin belleğinde işlenir ve uygulama tarafından saklanmaz. Gizli materyal yüklemeyin; seçilebilir metni olmayan taranmış PDF'ler okunamaz.",
    noInput: "En az bir belge veya URL ekleyin.",
    tooManyFiles: "Aynı anda en fazla 3 belge işleyebilirsiniz.",
    tooManyUrls: "Aynı anda en fazla 5 URL inceleyebilirsiniz.",
    invalidUrl: "URL'leri kontrol edin: yalnızca geçerli HTTP veya HTTPS adresleri kabul edilir.",
    unsupportedFile: "Desteklenmeyen biçim",
    tooLarge: "2,5 MB sınırını aşıyor.",
    result: "Sonuçlar",
    recommendations: "Bulunan kaynaklar",
    preview: "Belge alıntısı",
    method: "Yöntem önerileri",
    characters: "karakter çıkarıldı",
    processing: "Analiz ediliyor…",
    emptyResult: "Gösterilecek sonuç yok.",
  },
  sv: {
    ...copy.en,
    title: "Dokument och portaler",
    description: "Ladda upp forskningsmaterial eller ange offentliga katalog- och datamängdssidor att utforska.",
    question: "Forskningsmål",
    questionPlaceholder: "Till exempel: hitta Sentinel-2-datamängder för att kartlägga stadsutbredning…",
    urls: "URL:er till portaler eller datamängder (en per rad, högst 5)",
    files: "Dokument (PDF, DOCX, XLSX, CSV, JSON, TXT eller MD; högst 2,5 MB per fil)",
    chooseFiles: "Välj filer",
    analyze: "Analysera källor och dokument",
    login: "Logga in för att starta en analys.",
    loginLink: "Logga in",
    limits: "Filer behandlas i minnet av den konfigurerade Python-tjänsten och sparas inte av programmet. Ladda inte upp konfidentiellt material; skannade PDF-filer utan markerbar text kan inte läsas.",
    noInput: "Lägg till minst ett dokument eller en URL.",
    tooManyFiles: "Du kan behandla högst 3 dokument åt gången.",
    tooManyUrls: "Du kan utforska högst 5 URL:er åt gången.",
    invalidUrl: "Kontrollera URL:erna: endast giltiga HTTP- eller HTTPS-adresser godtas.",
    unsupportedFile: "Filformatet stöds inte",
    tooLarge: "överskrider gränsen på 2,5 MB.",
    result: "Resultat",
    recommendations: "Hittade resurser",
    preview: "Dokumentutdrag",
    method: "Metodvägledning",
    characters: "tecken extraherade",
    processing: "Analyserar…",
    emptyResult: "Det finns inga resultat att visa.",
  },
  da: {
    ...copy.en,
    title: "Dokumenter og portaler",
    description: "Upload forskningsmateriale, eller angiv offentlige katalog- og datasætsider, der skal undersøges.",
    question: "Forskningsmål",
    questionPlaceholder: "For eksempel: find Sentinel-2-datasæt til kortlægning af byudvidelse…",
    urls: "URL'er til portaler eller datasæt (én pr. linje, højst 5)",
    files: "Dokumenter (PDF, DOCX, XLSX, CSV, JSON, TXT eller MD; højst 2,5 MB pr. fil)",
    chooseFiles: "Vælg filer",
    analyze: "Analysér kilder og dokumenter",
    login: "Log ind for at starte en analyse.",
    loginLink: "Log ind",
    limits: "Filer behandles i hukommelsen af den konfigurerede Python-tjeneste og gemmes ikke af programmet. Upload ikke fortroligt materiale; scannede PDF-filer uden markerbar tekst kan ikke læses.",
    noInput: "Tilføj mindst ét dokument eller en URL.",
    tooManyFiles: "Du kan behandle højst 3 dokumenter ad gangen.",
    tooManyUrls: "Du kan undersøge højst 5 URL'er ad gangen.",
    invalidUrl: "Kontrollér URL'erne: kun gyldige HTTP- eller HTTPS-adresser accepteres.",
    unsupportedFile: "Filformatet understøttes ikke",
    tooLarge: "overskrider grænsen på 2,5 MB.",
    result: "Resultater",
    recommendations: "Fundne ressourcer",
    preview: "Dokumentuddrag",
    method: "Metodevejledning",
    characters: "tegn udtrukket",
    processing: "Analyserer…",
    emptyResult: "Der er ingen resultater at vise.",
  },
  no: {
    ...copy.en,
    title: "Dokumenter og portaler",
    description: "Last opp forskningsmateriale eller oppgi offentlige katalog- og datasettider som skal utforskes.",
    question: "Forskningsmål",
    questionPlaceholder: "For eksempel: finn Sentinel-2-datasett for å kartlegge byutvikling…",
    urls: "URL-er til portaler eller datasett (én per linje, maks. 5)",
    files: "Dokumenter (PDF, DOCX, XLSX, CSV, JSON, TXT eller MD; maks. 2,5 MB per fil)",
    chooseFiles: "Velg filer",
    analyze: "Analyser kilder og dokumenter",
    login: "Logg inn for å starte en analyse.",
    loginLink: "Logg inn",
    limits: "Filer behandles i minnet av den konfigurerte Python-tjenesten og lagres ikke av programmet. Ikke last opp konfidensielt materiale; skannede PDF-er uten markerbar tekst kan ikke leses.",
    noInput: "Legg til minst ett dokument eller en URL.",
    tooManyFiles: "Du kan behandle maksimalt 3 dokumenter om gangen.",
    tooManyUrls: "Du kan utforske maksimalt 5 URL-er om gangen.",
    invalidUrl: "Kontroller URL-ene: bare gyldige HTTP- eller HTTPS-adresser godtas.",
    unsupportedFile: "Filformatet støttes ikke",
    tooLarge: "overskrider grensen på 2,5 MB.",
    result: "Resultater",
    recommendations: "Funnet ressurser",
    preview: "Utdrag fra dokumentet",
    method: "Metodeveiledning",
    characters: "tegn hentet ut",
    processing: "Analyserer…",
    emptyResult: "Ingen resultater å vise.",
  },
  fi: {
    ...copy.en,
    title: "Asiakirjat ja portaalit",
    description: "Lataa tutkimusaineistoa tai anna tutkittavien julkisten luetteloiden ja tietojoukkojen sivuja.",
    question: "Tutkimuksen tavoite",
    questionPlaceholder: "Esimerkiksi: etsi Sentinel-2-aineistoja kaupunkialueiden laajenemisen kartoittamiseen…",
    urls: "Portaalien tai tietojoukkojen URL-osoitteet (yksi rivillä, enintään 5)",
    files: "Asiakirjat (PDF, DOCX, XLSX, CSV, JSON, TXT tai MD; enintään 2,5 Mt tiedostoa kohti)",
    chooseFiles: "Valitse tiedostot",
    analyze: "Analysoi lähteet ja asiakirjat",
    login: "Kirjaudu sisään aloittaaksesi analyysin.",
    loginLink: "Kirjaudu sisään",
    limits: "Määritetty Python-palvelu käsittelee tiedostot muistissa, eikä sovellus tallenna niitä. Älä lataa luottamuksellista aineistoa; skannattuja PDF-tiedostoja, joissa ei ole valittavaa tekstiä, ei voi lukea.",
    noInput: "Lisää vähintään yksi asiakirja tai URL-osoite.",
    tooManyFiles: "Voit käsitellä enintään 3 asiakirjaa kerrallaan.",
    tooManyUrls: "Voit tutkia enintään 5 URL-osoitetta kerrallaan.",
    invalidUrl: "Tarkista URL-osoitteet: vain kelvolliset HTTP- tai HTTPS-osoitteet hyväksytään.",
    unsupportedFile: "Tiedostomuotoa ei tueta",
    tooLarge: "ylittää 2,5 Mt:n rajan.",
    result: "Tulokset",
    recommendations: "Löydetyt resurssit",
    preview: "Asiakirjan ote",
    method: "Menetelmäohjeet",
    characters: "merkkiä poimittu",
    processing: "Analysoidaan…",
    emptyResult: "Näytettäviä tuloksia ei ole.",
  },
  uk: {
    ...copy.en,
    title: "Документи та портали",
    description: "Завантажте дослідницькі матеріали або вкажіть сторінки загальнодоступних каталогів і наборів даних.",
    question: "Мета дослідження",
    questionPlaceholder: "Наприклад, знайти набори даних Sentinel-2 для картографування міської забудови…",
    urls: "URL порталів або наборів даних (по одному в рядку, не більше 5)",
    files: "Документи (PDF, DOCX, XLSX, CSV, JSON, TXT або MD; до 2,5 МБ кожен)",
    chooseFiles: "Вибрати файли",
    analyze: "Аналізувати джерела й документи",
    login: "Увійдіть, щоб почати аналіз.",
    loginLink: "Увійти",
    limits: "Файли обробляються в пам’яті налаштованого сервісу Python і не зберігаються застосунком. Не завантажуйте конфіденційні матеріали; скановані PDF без доступного для виділення тексту прочитати неможливо.",
    noInput: "Додайте принаймні один документ або URL.",
    tooManyFiles: "За один раз можна обробити не більше 3 документів.",
    tooManyUrls: "За один раз можна перевірити не більше 5 URL.",
    invalidUrl: "Перевірте URL: дозволені лише коректні адреси HTTP або HTTPS.",
    unsupportedFile: "Формат не підтримується",
    tooLarge: "перевищує обмеження 2,5 МБ.",
    result: "Результати",
    recommendations: "Знайдені ресурси",
    preview: "Фрагмент документа",
    method: "Методичні рекомендації",
    characters: "символів вилучено",
    processing: "Аналіз…",
    emptyResult: "Немає результатів для показу.",
  },
  cs: {
    ...copy.en,
    title: "Dokumenty a portály",
    description: "Nahrajte výzkumné materiály nebo zadejte veřejné stránky katalogů a datových sad k prozkoumání.",
    question: "Cíl výzkumu",
    questionPlaceholder: "Například: najít datové sady Sentinel-2 pro mapování rozšiřování měst…",
    urls: "URL portálů nebo datových sad (jedna na řádek, maximálně 5)",
    files: "Dokumenty (PDF, DOCX, XLSX, CSV, JSON, TXT nebo MD; maximálně 2,5 MB každý)",
    chooseFiles: "Vybrat soubory",
    analyze: "Analyzovat zdroje a dokumenty",
    login: "Přihlaste se a spusťte analýzu.",
    loginLink: "Přihlásit se",
    limits: "Soubory zpracovává v paměti nakonfigurovaná služba Python a aplikace je neukládá. Nenahrávejte důvěrné materiály; naskenované PDF bez označitelného textu nelze přečíst.",
    noInput: "Přidejte alespoň jeden dokument nebo URL.",
    tooManyFiles: "Najednou můžete zpracovat maximálně 3 dokumenty.",
    tooManyUrls: "Najednou můžete prozkoumat maximálně 5 URL.",
    invalidUrl: "Zkontrolujte URL: přijímáme pouze platné adresy HTTP nebo HTTPS.",
    unsupportedFile: "Nepodporovaný formát",
    tooLarge: "překračuje limit 2,5 MB.",
    result: "Výsledky",
    recommendations: "Nalezené zdroje",
    preview: "Úryvek dokumentu",
    method: "Metodické pokyny",
    characters: "extrahovaných znaků",
    processing: "Probíhá analýza…",
    emptyResult: "Žádné výsledky k zobrazení.",
  },
};

type OutputItem = {
  kind: "document" | "portal";
  label: string;
  document?: inferRouterOutputs<AppRouter>["dataInsight"]["analyzeDocument"];
  portal?: inferRouterOutputs<AppRouter>["dataInsight"]["explorePortal"];
};

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossibile leggere il file selezionato."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Il contenuto del file non e disponibile."));
        return;
      }
      const separator = reader.result.indexOf(",");
      if (separator < 0) {
        reject(new Error("Formato del file caricato non valido."));
        return;
      }
      resolve(reader.result.slice(separator + 1));
    };
    reader.readAsDataURL(file);
  });
}

export function DataInsightSources({ language = "en" }: { language: string }) {
  const reportLanguage = normalizeSentinelReportLanguage(language);
  const text = sourcesCopy[reportLanguage] ?? sourcesCopy.en;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<OutputItem[]>([]);
  const [error, setError] = useState("");
  const documentMutation = trpc.dataInsight.analyzeDocument.useMutation();
  const portalMutation = trpc.dataInsight.explorePortal.useMutation();
  const busy = documentMutation.isPending || portalMutation.isPending;

  const analyze = async () => {
    setError("");
    setItems([]);
    const portalUrls = urls.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (!files.length && !portalUrls.length) {
      setError(text.noInput);
      return;
    }
    if (files.length > 3) {
      setError(text.tooManyFiles);
      return;
    }
    if (portalUrls.length > 5) {
      setError(text.tooManyUrls);
      return;
    }
    if (portalUrls.some((value) => {
      try {
        const parsed = new URL(value);
        return !["http:", "https:"].includes(parsed.protocol);
      } catch {
        return true;
      }
    })) {
      setError(text.invalidUrl);
      return;
    }

    const results: OutputItem[] = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ACCEPTED_EXTENSIONS.has(extension)) {
        setError(`${text.unsupportedFile}: ${file.name}`);
        setItems(results);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} ${text.tooLarge}`);
        setItems(results);
        return;
      }
      try {
        const contentBase64 = await readAsBase64(file);
        const document = await documentMutation.mutateAsync({
          name: file.name,
          contentBase64,
          query,
        });
        results.push({ kind: "document", label: file.name, document });
        setItems([...results]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        setItems([...results]);
        return;
      }
    }
    for (const url of portalUrls) {
      try {
        const portal = await portalMutation.mutateAsync({ url, query });
        results.push({ kind: "portal", label: url, portal });
        setItems([...results]);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        setItems([...results]);
        return;
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" />{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block space-y-2 text-sm font-medium">
          {text.question}
          <Textarea value={query} onChange={(event) => setQuery(event.target.value)} maxLength={1000} rows={3} placeholder={text.questionPlaceholder} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.urls}
          <Textarea value={urls} onChange={(event) => setUrls(event.target.value)} rows={3} placeholder={"https://..."} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.files}
          <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            {files.length ? files.map((file) => file.name).join(", ") : text.chooseFiles}
            <input
              className="sr-only"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.json,.txt,.md"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </span>
        </label>
        <p className="text-xs text-muted-foreground">{text.limits}</p>
        {!isAuthenticated && !authLoading && (
          <p className="text-sm text-muted-foreground">
            {text.login} <Link href="/login" className="font-medium text-primary underline">{text.loginLink}</Link>
          </p>
        )}
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        <Button onClick={analyze} disabled={busy || authLoading || !isAuthenticated} className="w-full sm:w-auto">
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.processing}</> : text.analyze}
        </Button>

        {items.length > 0 && (
          <section aria-live="polite" className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">{text.result}</h3>
            {items.map((item, index) => (
              <article key={`${item.kind}-${item.label}-${index}`} className="rounded-lg border p-4">
                <h4 className="flex items-center gap-2 font-medium">
                  {item.kind === "document" ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  {item.label}
                </h4>
                {item.kind === "document" && item.document && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {item.document.document.format} · {formatSentinelNumber(item.document.document.charactersExtracted, reportLanguage, 0)} {text.characters}
                      {item.document.document.truncated ? " · estrazione limitata" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.document.processing}</p>
                    <p className="text-xs text-muted-foreground">{item.document.analysis.note}</p>
                    <p className="font-medium">{text.preview}</p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{item.document.extractedTextPreview}</pre>
                    {item.document.analysis.references.length > 0 && (
                      <>
                        <p className="font-medium">{text.recommendations}</p>
                        <ul className="space-y-2">
                          {item.document.analysis.references.slice(0, 5).map((reference) => (
                            <li key={reference.url}>
                              <a className="font-medium text-primary underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a>
                              <p className="text-muted-foreground">{reference.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {item.document.analysis.specialized && (
                      <div className="rounded-md bg-muted p-3">
                        <p className="font-medium">{text.method}: {item.document.analysis.specialized.title}</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                          {item.document.analysis.specialized.workflow.map((step) => <li key={step}>{step}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
                {item.kind === "portal" && item.portal && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-muted-foreground">{item.portal.pagesCount} pagine esaminate</p>
                    <p className="text-sm font-medium">{text.recommendations}</p>
                    <ul className="space-y-1">
                      {item.portal.recommendations.slice(0, 5).map((resource) => (
                        <li key={resource.url}>
                          <a className="text-sm text-primary underline" href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.label} <ExternalLink className="inline h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                    {item.portal.recommendations.length === 0 && <p className="text-sm text-muted-foreground">{text.emptyResult}</p>}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </CardContent>
    </Card>
  );
}
