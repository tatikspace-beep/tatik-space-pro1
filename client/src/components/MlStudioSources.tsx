import { useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AlertCircle, ExternalLink, FileText, Loader2, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getMlStudioLanguage, getMlStudioLocale } from "@/lib/mlStudioAssessment";
import type { AppRouter } from "../../../server/routers";

type MlSourceResult = inferRouterOutputs<AppRouter>["mlStudio"]["analyzeSources"];
type MergedDataset = inferRouterOutputs<AppRouter>["mlStudio"]["mergeSources"];
type MlSourceDocument = { name: string; contentBase64: string };
type SourceMode = "separate" | "corpus" | "tables" | "both";

const MAX_SOURCE_BYTES = 2_500_000;
const MAX_SOURCE_FILES = 5;
const supportedExtensions = new Set(["pdf", "docx", "xlsx", "csv", "json", "txt", "md"]);
const tableExtensions = new Set(["csv", "json", "xlsx"]);

const copy = {
  it: {
    title: "Documenti e URL",
    description: "Analizza più fonti pubbliche, crea un corpus testuale oppure unisci tabelle compatibili per il training ML.",
    mode: "Flusso di elaborazione",
    separate: "Analisi separata e confronto fonti",
    corpus: "Corpus testuale e temi ricorrenti",
    tables: "Unisci tabelle per il training ML",
    both: "Analisi testo + tabelle per ML",
    objective: "Domanda o obiettivo (facoltativo)",
    objectivePlaceholder: "Es. confronta le evidenze su qualità dell'aria...",
    urls: "URL pubblici (uno per riga, massimo 5)",
    files: "File (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; massimo 5)",
    chooseFiles: "Scegli più file",
    limits: "Massimo 5 file e 5 URL; totale file 2,5 MB. I file e le pagine pubbliche vengono elaborati in memoria e non salvati. Le pagine web devono esporre testo HTML; per tabelle ML, gli URL devono puntare direttamente a CSV o JSON.",
    run: "Elabora fonti",
    busy: "Elaborazione…",
    extracted: "Estratto",
    recommendations: "Risorse correlate",
    corpusTitle: "Corpus combinato",
    corpusMethod: "Sintesi estrattiva e parole ricorrenti, senza LLM.",
    summary: "Frasi rappresentative",
    keywords: "Parole ricorrenti",
    sources: "fonti",
    characters: "caratteri",
    tablesReady: "Tabelle unite e caricate nel pannello ML sottostante",
    tableNote: "Non sono state selezionate tabelle CSV/JSON/XLSX o URL diretti a dataset tabellari.",
    noSources: "Aggiungi almeno un file o un URL.",
    tooManyFiles: "Puoi aggiungere al massimo 5 file.",
    tooManyUrls: "Puoi aggiungere al massimo 5 URL.",
    badUrl: "Usa URL HTTP o HTTPS pubblici validi, senza credenziali nell'indirizzo.",
    unsupported: "Formato file non supportato",
    tooLarge: "La dimensione complessiva dei file supera 2,5 MB.",
    tableOnly: "Il flusso tabelle richiede file CSV, JSON o XLSX e URL diretti a CSV/JSON.",
    login: "Accedi per elaborare più fonti.",
    signIn: "Accedi",
    rows: "righe",
    truncated: "troncato",
  },
  en: {
    title: "Documents and URLs",
    description: "Analyze multiple public sources, build a text corpus, or merge compatible tables for ML training.",
    mode: "Processing workflow",
    separate: "Analyze and compare sources separately",
    corpus: "Combined text corpus and recurring terms",
    tables: "Merge tables for ML training",
    both: "Text analysis + ML tables",
    objective: "Question or objective (optional)",
    objectivePlaceholder: "e.g. compare evidence about air quality...",
    urls: "Public URLs (one per line, up to 5)",
    files: "Files (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; up to 5)",
    chooseFiles: "Choose multiple files",
    limits: "Up to 5 files and 5 URLs; combined file size 2.5 MB. Files and public pages are processed in memory and are not stored. Webpages must expose HTML text; ML tables require direct CSV or JSON URLs.",
    run: "Process sources",
    busy: "Processing…",
    extracted: "Extract",
    recommendations: "Related resources",
    corpusTitle: "Combined corpus",
    corpusMethod: "Extractive summary and recurring terms; no LLM.",
    summary: "Representative sentences",
    keywords: "Recurring terms",
    sources: "sources",
    characters: "characters",
    tablesReady: "Tables merged and loaded in the ML panel below",
    tableNote: "No CSV/JSON/XLSX tables or direct tabular dataset URLs were selected.",
    noSources: "Add at least one file or URL.",
    tooManyFiles: "You can add up to 5 files.",
    tooManyUrls: "You can add up to 5 URLs.",
    badUrl: "Use valid public HTTP or HTTPS URLs without embedded credentials.",
    unsupported: "Unsupported file format",
    tooLarge: "Combined file size exceeds 2.5 MB.",
    tableOnly: "Table mode requires CSV, JSON, or XLSX files and direct CSV/JSON URLs.",
    login: "Sign in to process multiple sources.",
    signIn: "Sign in",
    rows: "rows",
    truncated: "truncated",
  },
};

const localizedCopy: Record<string, Partial<typeof copy.en>> = {
  es: { title: "Documentos y URL", description: "Analiza varias fuentes públicas, crea un corpus de texto o combina tablas compatibles para entrenar modelos de ML.", mode: "Flujo de procesamiento", separate: "Analizar y comparar fuentes por separado", corpus: "Corpus de texto y temas recurrentes", tables: "Combinar tablas para entrenar ML", both: "Análisis de texto + tablas de ML", objective: "Pregunta u objetivo (opcional)", objectivePlaceholder: "p. ej., comparar evidencias sobre la calidad del aire...", urls: "URL públicas (una por línea, máximo 5)", files: "Archivos (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; máximo 5)", chooseFiles: "Elegir varios archivos", limits: "Máximo 5 archivos y 5 URL; tamaño total de archivos: 2,5 MB. Los archivos y las páginas públicas se procesan en memoria y no se guardan. Las páginas web deben ofrecer texto HTML; las tablas ML requieren URL directas a CSV o JSON.", run: "Procesar fuentes", busy: "Procesando…", extracted: "Texto extraído", recommendations: "Recursos relacionados", corpusTitle: "Corpus combinado", corpusMethod: "Resumen extractivo y términos recurrentes, sin LLM.", summary: "Frases representativas", keywords: "Palabras recurrentes", sources: "fuentes", characters: "caracteres", tablesReady: "Tablas combinadas y cargadas en el panel ML inferior", tableNote: "No se seleccionaron tablas CSV/JSON/XLSX ni URL directas a conjuntos tabulares.", noSources: "Añade al menos un archivo o una URL.", tooManyFiles: "Puedes añadir un máximo de 5 archivos.", tooManyUrls: "Puedes añadir un máximo de 5 URL.", badUrl: "Usa URL HTTP o HTTPS públicas válidas, sin credenciales en la dirección.", unsupported: "Formato de archivo no compatible", tooLarge: "El tamaño total de los archivos supera los 2,5 MB.", tableOnly: "El modo de tablas requiere archivos CSV, JSON o XLSX y URL directas a CSV/JSON.", login: "Inicia sesión para procesar varias fuentes.", signIn: "Iniciar sesión", rows: "filas", truncated: "truncado" },
  fr: { title: "Documents et URL", description: "Analysez plusieurs sources publiques, créez un corpus textuel ou fusionnez des tableaux compatibles pour l’entraînement ML.", mode: "Flux de traitement", separate: "Analyser et comparer les sources séparément", corpus: "Corpus textuel et thèmes récurrents", tables: "Fusionner des tableaux pour le ML", both: "Analyse de texte + tableaux ML", objective: "Question ou objectif (facultatif)", objectivePlaceholder: "ex. comparer les données sur la qualité de l’air...", urls: "URL publiques (une par ligne, 5 maximum)", files: "Fichiers (PDF, DOCX, XLSX, CSV, JSON, TXT, MD ; 5 maximum)", chooseFiles: "Choisir plusieurs fichiers", limits: "5 fichiers et 5 URL maximum ; taille totale des fichiers : 2,5 Mo. Les fichiers et pages publiques sont traités en mémoire et ne sont pas enregistrés. Les pages Web doivent fournir du texte HTML ; les tableaux ML nécessitent des URL directes vers CSV ou JSON.", run: "Traiter les sources", busy: "Traitement…", extracted: "Extrait", recommendations: "Ressources associées", corpusTitle: "Corpus combiné", corpusMethod: "Résumé extractif et termes récurrents, sans LLM.", summary: "Phrases représentatives", keywords: "Mots récurrents", sources: "sources", characters: "caractères", tablesReady: "Tableaux fusionnés et chargés dans le panneau ML ci-dessous", tableNote: "Aucun tableau CSV/JSON/XLSX ni URL directe vers des données tabulaires n’a été sélectionné.", noSources: "Ajoutez au moins un fichier ou une URL.", tooManyFiles: "Vous pouvez ajouter 5 fichiers maximum.", tooManyUrls: "Vous pouvez ajouter 5 URL maximum.", badUrl: "Utilisez des URL HTTP ou HTTPS publiques valides, sans identifiants.", unsupported: "Format de fichier non pris en charge", tooLarge: "La taille totale des fichiers dépasse 2,5 Mo.", tableOnly: "Le mode tableau nécessite des fichiers CSV, JSON ou XLSX et des URL directes vers CSV/JSON.", login: "Connectez-vous pour traiter plusieurs sources.", signIn: "Se connecter", rows: "lignes", truncated: "tronqué" },
  de: { title: "Dokumente und URLs", description: "Analysieren Sie mehrere öffentliche Quellen, erstellen Sie ein Textkorpus oder führen Sie kompatible Tabellen für ML-Training zusammen.", mode: "Verarbeitungsablauf", separate: "Quellen getrennt analysieren und vergleichen", corpus: "Textkorpus und wiederkehrende Themen", tables: "Tabellen für ML-Training zusammenführen", both: "Textanalyse + ML-Tabellen", objective: "Frage oder Ziel (optional)", objectivePlaceholder: "z. B. Belege zur Luftqualität vergleichen…", urls: "Öffentliche URLs (eine pro Zeile, max. 5)", files: "Dateien (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; max. 5)", chooseFiles: "Mehrere Dateien auswählen", limits: "Maximal 5 Dateien und 5 URLs; Gesamtgröße der Dateien 2,5 MB. Dateien und öffentliche Seiten werden im Arbeitsspeicher verarbeitet und nicht gespeichert. Webseiten müssen HTML-Text bereitstellen; ML-Tabellen benötigen direkte CSV- oder JSON-URLs.", run: "Quellen verarbeiten", busy: "Verarbeitung…", extracted: "Extrahiert", recommendations: "Verwandte Ressourcen", corpusTitle: "Kombiniertes Korpus", corpusMethod: "Extraktive Zusammenfassung und häufige Begriffe, ohne LLM.", summary: "Repräsentative Sätze", keywords: "Häufige Wörter", sources: "Quellen", characters: "Zeichen", tablesReady: "Tabellen zusammengeführt und in das ML-Feld unten geladen", tableNote: "Es wurden keine CSV/JSON/XLSX-Tabellen oder direkten URLs zu Tabellendaten ausgewählt.", noSources: "Fügen Sie mindestens eine Datei oder URL hinzu.", tooManyFiles: "Sie können höchstens 5 Dateien hinzufügen.", tooManyUrls: "Sie können höchstens 5 URLs hinzufügen.", badUrl: "Verwenden Sie gültige öffentliche HTTP- oder HTTPS-URLs ohne eingebettete Zugangsdaten.", unsupported: "Nicht unterstütztes Dateiformat", tooLarge: "Die Gesamtgröße der Dateien überschreitet 2,5 MB.", tableOnly: "Der Tabellenmodus benötigt CSV-, JSON- oder XLSX-Dateien und direkte CSV/JSON-URLs.", login: "Melden Sie sich an, um mehrere Quellen zu verarbeiten.", signIn: "Anmelden", rows: "Zeilen", truncated: "gekürzt" },
  pt: { title: "Documentos e URLs", description: "Analise várias fontes públicas, crie um corpus de texto ou una tabelas compatíveis para treinar modelos ML.", mode: "Fluxo de processamento", separate: "Analisar e comparar fontes separadamente", corpus: "Corpus de texto e temas recorrentes", tables: "Unir tabelas para treino ML", both: "Análise de texto + tabelas ML", objective: "Pergunta ou objetivo (opcional)", objectivePlaceholder: "ex.: comparar evidências sobre a qualidade do ar...", urls: "URLs públicas (uma por linha, máximo 5)", files: "Ficheiros (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; máximo 5)", chooseFiles: "Escolher vários ficheiros", limits: "Máximo de 5 ficheiros e 5 URLs; tamanho total de 2,5 MB. Os ficheiros e páginas públicas são processados em memória e não são guardados. As páginas Web devem disponibilizar texto HTML; as tabelas ML exigem URLs diretos para CSV ou JSON.", run: "Processar fontes", busy: "A processar…", extracted: "Extraído", recommendations: "Recursos relacionados", corpusTitle: "Corpus combinado", corpusMethod: "Resumo extrativo e termos recorrentes, sem LLM.", summary: "Frases representativas", keywords: "Palavras recorrentes", sources: "fontes", characters: "caracteres", tablesReady: "Tabelas unidas e carregadas no painel ML abaixo", tableNote: "Não foram selecionadas tabelas CSV/JSON/XLSX nem URLs diretos para conjuntos tabulares.", noSources: "Adicione pelo menos um ficheiro ou URL.", tooManyFiles: "Pode adicionar no máximo 5 ficheiros.", tooManyUrls: "Pode adicionar no máximo 5 URLs.", badUrl: "Use URLs HTTP ou HTTPS públicas válidas, sem credenciais no endereço.", unsupported: "Formato de ficheiro não suportado", tooLarge: "O tamanho total dos ficheiros excede 2,5 MB.", tableOnly: "O modo de tabelas exige ficheiros CSV, JSON ou XLSX e URLs diretos CSV/JSON.", login: "Inicie sessão para processar várias fontes.", signIn: "Iniciar sessão", rows: "linhas", truncated: "truncado" },
  ru: { title: "Документы и URL", description: "Анализируйте несколько общедоступных источников, создавайте текстовый корпус или объединяйте совместимые таблицы для обучения ML.", mode: "Сценарий обработки", separate: "Анализировать и сравнивать источники отдельно", corpus: "Текстовый корпус и повторяющиеся темы", tables: "Объединить таблицы для обучения ML", both: "Анализ текста + таблицы ML", objective: "Вопрос или цель (необязательно)", objectivePlaceholder: "например, сравнить данные о качестве воздуха…", urls: "Общедоступные URL (по одному в строке, не более 5)", files: "Файлы (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; не более 5)", chooseFiles: "Выбрать несколько файлов", limits: "Не более 5 файлов и 5 URL; общий размер файлов — 2,5 МБ. Файлы и общедоступные страницы обрабатываются в памяти и не сохраняются. Веб-страницы должны содержать HTML-текст; для таблиц ML нужны прямые ссылки на CSV или JSON.", run: "Обработать источники", busy: "Обработка…", extracted: "Извлечено", recommendations: "Связанные ресурсы", corpusTitle: "Объединённый корпус", corpusMethod: "Экстрактивное резюме и частые термины, без LLM.", summary: "Характерные предложения", keywords: "Частые слова", sources: "источников", characters: "символов", tablesReady: "Таблицы объединены и загружены в панель ML ниже", tableNote: "Не выбраны таблицы CSV/JSON/XLSX или прямые ссылки на табличные данные.", noSources: "Добавьте хотя бы один файл или URL.", tooManyFiles: "Можно добавить не более 5 файлов.", tooManyUrls: "Можно добавить не более 5 URL.", badUrl: "Используйте корректные общедоступные URL HTTP или HTTPS без учётных данных.", unsupported: "Неподдерживаемый формат файла", tooLarge: "Общий размер файлов превышает 2,5 МБ.", tableOnly: "Для режима таблиц нужны файлы CSV, JSON или XLSX и прямые ссылки CSV/JSON.", login: "Войдите, чтобы обработать несколько источников.", signIn: "Войти", rows: "строк", truncated: "обрезано" },
  pl: { title: "Dokumenty i adresy URL", description: "Analizuj wiele źródeł publicznych, twórz korpus tekstowy lub łącz zgodne tabele do trenowania ML.", mode: "Przepływ przetwarzania", separate: "Osobna analiza i porównanie źródeł", corpus: "Korpus tekstowy i powtarzające się tematy", tables: "Połącz tabele do trenowania ML", both: "Analiza tekstu + tabele ML", objective: "Pytanie lub cel (opcjonalnie)", objectivePlaceholder: "np. porównaj dane o jakości powietrza...", urls: "Publiczne adresy URL (jeden w wierszu, maks. 5)", files: "Pliki (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; maks. 5)", chooseFiles: "Wybierz wiele plików", limits: "Maksymalnie 5 plików i 5 adresów URL; łączny rozmiar plików 2,5 MB. Pliki i strony publiczne są przetwarzane w pamięci i nie są zapisywane. Strony muszą udostępniać tekst HTML; tabele ML wymagają bezpośrednich adresów CSV lub JSON.", run: "Przetwórz źródła", busy: "Przetwarzanie…", extracted: "Wyodrębniono", recommendations: "Powiązane zasoby", corpusTitle: "Połączony korpus", corpusMethod: "Podsumowanie ekstrakcyjne i powtarzające się terminy, bez LLM.", summary: "Reprezentatywne zdania", keywords: "Powtarzające się słowa", sources: "źródeł", characters: "znaków", tablesReady: "Tabele połączono i załadowano do panelu ML poniżej", tableNote: "Nie wybrano tabel CSV/JSON/XLSX ani bezpośrednich adresów do danych tabelarycznych.", noSources: "Dodaj co najmniej jeden plik lub adres URL.", tooManyFiles: "Możesz dodać maksymalnie 5 plików.", tooManyUrls: "Możesz dodać maksymalnie 5 adresów URL.", badUrl: "Użyj prawidłowych publicznych adresów HTTP lub HTTPS bez danych logowania.", unsupported: "Nieobsługiwany format pliku", tooLarge: "Łączny rozmiar plików przekracza 2,5 MB.", tableOnly: "Tryb tabel wymaga plików CSV, JSON lub XLSX i bezpośrednich adresów CSV/JSON.", login: "Zaloguj się, aby przetwarzać wiele źródeł.", signIn: "Zaloguj się", rows: "wierszy", truncated: "skrócono" },
  nl: { title: "Documenten en URL's", description: "Analyseer meerdere openbare bronnen, maak een tekstcorpus of voeg compatibele tabellen samen voor ML-training.", mode: "Verwerkingsworkflow", separate: "Bronnen afzonderlijk analyseren en vergelijken", corpus: "Tekstcorpus en terugkerende thema's", tables: "Tabellen samenvoegen voor ML-training", both: "Tekstanalyse + ML-tabellen", objective: "Vraag of doel (optioneel)", objectivePlaceholder: "bijv. bewijs over luchtkwaliteit vergelijken...", urls: "Openbare URL's (één per regel, maximaal 5)", files: "Bestanden (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; maximaal 5)", chooseFiles: "Meerdere bestanden kiezen", limits: "Maximaal 5 bestanden en 5 URL's; totale bestandsgrootte 2,5 MB. Bestanden en openbare pagina's worden in het geheugen verwerkt en niet opgeslagen. Webpagina's moeten HTML-tekst bevatten; ML-tabellen vereisen directe CSV- of JSON-URL's.", run: "Bronnen verwerken", busy: "Verwerken…", extracted: "Geëxtraheerd", recommendations: "Verwante bronnen", corpusTitle: "Gecombineerd corpus", corpusMethod: "Extractieve samenvatting en terugkerende termen, zonder LLM.", summary: "Representatieve zinnen", keywords: "Terugkerende woorden", sources: "bronnen", characters: "tekens", tablesReady: "Tabellen samengevoegd en geladen in het ML-paneel hieronder", tableNote: "Er zijn geen CSV/JSON/XLSX-tabellen of directe URL's naar tabelgegevens geselecteerd.", noSources: "Voeg ten minste één bestand of URL toe.", tooManyFiles: "U kunt maximaal 5 bestanden toevoegen.", tooManyUrls: "U kunt maximaal 5 URL's toevoegen.", badUrl: "Gebruik geldige openbare HTTP- of HTTPS-URL's zonder inloggegevens.", unsupported: "Niet-ondersteunde bestandsindeling", tooLarge: "De totale bestandsgrootte is groter dan 2,5 MB.", tableOnly: "De tabelmodus vereist CSV-, JSON- of XLSX-bestanden en directe CSV/JSON-URL's.", login: "Meld u aan om meerdere bronnen te verwerken.", signIn: "Aanmelden", rows: "rijen", truncated: "afgekapt" },
  tr: { title: "Belgeler ve URL'ler", description: "Birden fazla herkese açık kaynağı analiz edin, metin külliyatı oluşturun veya ML eğitimi için uyumlu tabloları birleştirin.", mode: "İşleme akışı", separate: "Kaynakları ayrı analiz et ve karşılaştır", corpus: "Metin külliyatı ve yinelenen temalar", tables: "ML eğitimi için tabloları birleştir", both: "Metin analizi + ML tabloları", objective: "Soru veya hedef (isteğe bağlı)", objectivePlaceholder: "örn. hava kalitesi kanıtlarını karşılaştır...", urls: "Herkese açık URL'ler (satır başına bir, en fazla 5)", files: "Dosyalar (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; en fazla 5)", chooseFiles: "Birden fazla dosya seç", limits: "En fazla 5 dosya ve 5 URL; toplam dosya boyutu 2,5 MB. Dosyalar ve herkese açık sayfalar bellekte işlenir ve kaydedilmez. Web sayfaları HTML metni sunmalıdır; ML tabloları doğrudan CSV veya JSON URL'leri gerektirir.", run: "Kaynakları işle", busy: "İşleniyor…", extracted: "Çıkarılan", recommendations: "İlgili kaynaklar", corpusTitle: "Birleşik külliyat", corpusMethod: "LLM olmadan çıkarımsal özet ve yinelenen terimler.", summary: "Temsilî cümleler", keywords: "Yinelenen sözcükler", sources: "kaynak", characters: "karakter", tablesReady: "Tablolar birleştirildi ve aşağıdaki ML paneline yüklendi", tableNote: "CSV/JSON/XLSX tablosu veya doğrudan tablo veri kümesi URL'si seçilmedi.", noSources: "En az bir dosya veya URL ekleyin.", tooManyFiles: "En fazla 5 dosya ekleyebilirsiniz.", tooManyUrls: "En fazla 5 URL ekleyebilirsiniz.", badUrl: "Kimlik bilgisi içermeyen geçerli herkese açık HTTP veya HTTPS URL'leri kullanın.", unsupported: "Desteklenmeyen dosya biçimi", tooLarge: "Toplam dosya boyutu 2,5 MB sınırını aşıyor.", tableOnly: "Tablo modu CSV, JSON veya XLSX dosyaları ve doğrudan CSV/JSON URL'leri gerektirir.", login: "Birden fazla kaynağı işlemek için oturum açın.", signIn: "Oturum aç", rows: "satır", truncated: "kısaltıldı" },
  sv: { title: "Dokument och URL:er", description: "Analysera flera offentliga källor, skapa en textkorpus eller slå ihop kompatibla tabeller för ML-träning.", mode: "Arbetsflöde", separate: "Analysera och jämför källor separat", corpus: "Textkorpus och återkommande teman", tables: "Slå ihop tabeller för ML-träning", both: "Textanalys + ML-tabeller", objective: "Fråga eller mål (valfritt)", objectivePlaceholder: "t.ex. jämför belägg om luftkvalitet...", urls: "Offentliga URL:er (en per rad, högst 5)", files: "Filer (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; högst 5)", chooseFiles: "Välj flera filer", limits: "Högst 5 filer och 5 URL:er; total filstorlek 2,5 MB. Filer och offentliga sidor bearbetas i minnet och sparas inte. Webbsidor måste innehålla HTML-text; ML-tabeller kräver direkta CSV- eller JSON-URL:er.", run: "Bearbeta källor", busy: "Bearbetar…", extracted: "Extraherat", recommendations: "Relaterade resurser", corpusTitle: "Kombinerad korpus", corpusMethod: "Extraktiv sammanfattning och återkommande termer, utan LLM.", summary: "Representativa meningar", keywords: "Återkommande ord", sources: "källor", characters: "tecken", tablesReady: "Tabeller har slagits ihop och lästs in i ML-panelen nedan", tableNote: "Inga CSV/JSON/XLSX-tabeller eller direkta URL:er till tabelldata valdes.", noSources: "Lägg till minst en fil eller URL.", tooManyFiles: "Du kan lägga till högst 5 filer.", tooManyUrls: "Du kan lägga till högst 5 URL:er.", badUrl: "Använd giltiga offentliga HTTP- eller HTTPS-URL:er utan inbäddade autentiseringsuppgifter.", unsupported: "Filformatet stöds inte", tooLarge: "Den sammanlagda filstorleken överstiger 2,5 MB.", tableOnly: "Tabelläget kräver CSV-, JSON- eller XLSX-filer och direkta CSV/JSON-URL:er.", login: "Logga in för att bearbeta flera källor.", signIn: "Logga in", rows: "rader", truncated: "avkortad" },
  da: { title: "Dokumenter og URL'er", description: "Analysér flere offentlige kilder, opret et tekstkorpus eller flet kompatible tabeller til ML-træning.", mode: "Behandlingsflow", separate: "Analysér og sammenlign kilder separat", corpus: "Tekstkorpus og tilbagevendende temaer", tables: "Flet tabeller til ML-træning", both: "Tekstanalyse + ML-tabeller", objective: "Spørgsmål eller mål (valgfrit)", objectivePlaceholder: "f.eks. sammenlign dokumentation om luftkvalitet...", urls: "Offentlige URL'er (én pr. linje, højst 5)", files: "Filer (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; højst 5)", chooseFiles: "Vælg flere filer", limits: "Højst 5 filer og 5 URL'er; samlet filstørrelse 2,5 MB. Filer og offentlige sider behandles i hukommelsen og gemmes ikke. Websider skal vise HTML-tekst; ML-tabeller kræver direkte CSV- eller JSON-URL'er.", run: "Behandl kilder", busy: "Behandler…", extracted: "Udtrukket", recommendations: "Relaterede ressourcer", corpusTitle: "Kombineret korpus", corpusMethod: "Ekstraktivt resumé og tilbagevendende termer, uden LLM.", summary: "Repræsentative sætninger", keywords: "Tilbagevendende ord", sources: "kilder", characters: "tegn", tablesReady: "Tabeller flettet og indlæst i ML-panelet nedenfor", tableNote: "Der blev ikke valgt CSV/JSON/XLSX-tabeller eller direkte URL'er til tabeldata.", noSources: "Tilføj mindst én fil eller URL.", tooManyFiles: "Du kan højst tilføje 5 filer.", tooManyUrls: "Du kan højst tilføje 5 URL'er.", badUrl: "Brug gyldige offentlige HTTP- eller HTTPS-URL'er uden loginoplysninger.", unsupported: "Filformatet understøttes ikke", tooLarge: "Den samlede filstørrelse overstiger 2,5 MB.", tableOnly: "Tabeltilstand kræver CSV-, JSON- eller XLSX-filer og direkte CSV/JSON-URL'er.", login: "Log ind for at behandle flere kilder.", signIn: "Log ind", rows: "rækker", truncated: "afkortet" },
  no: { title: "Dokumenter og URL-er", description: "Analyser flere offentlige kilder, lag et tekstkorpus eller slå sammen kompatible tabeller for ML-trening.", mode: "Arbeidsflyt", separate: "Analyser og sammenlign kilder separat", corpus: "Tekstkorpus og tilbakevendende temaer", tables: "Slå sammen tabeller for ML-trening", both: "Tekstanalyse + ML-tabeller", objective: "Spørsmål eller mål (valgfritt)", objectivePlaceholder: "f.eks. sammenlign dokumentasjon om luftkvalitet...", urls: "Offentlige URL-er (én per linje, maks. 5)", files: "Filer (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; maks. 5)", chooseFiles: "Velg flere filer", limits: "Maks. 5 filer og 5 URL-er; samlet filstørrelse 2,5 MB. Filer og offentlige sider behandles i minnet og lagres ikke. Nettsider må vise HTML-tekst; ML-tabeller krever direkte CSV- eller JSON-URL-er.", run: "Behandle kilder", busy: "Behandler…", extracted: "Hentet ut", recommendations: "Relaterte ressurser", corpusTitle: "Kombinert korpus", corpusMethod: "Ekstraktivt sammendrag og tilbakevendende termer, uten LLM.", summary: "Representative setninger", keywords: "Tilbakevendende ord", sources: "kilder", characters: "tegn", tablesReady: "Tabeller slått sammen og lastet i ML-panelet nedenfor", tableNote: "Ingen CSV/JSON/XLSX-tabeller eller direkte URL-er til tabelldata ble valgt.", noSources: "Legg til minst én fil eller URL.", tooManyFiles: "Du kan legge til maksimalt 5 filer.", tooManyUrls: "Du kan legge til maksimalt 5 URL-er.", badUrl: "Bruk gyldige offentlige HTTP- eller HTTPS-URL-er uten innebygde påloggingsopplysninger.", unsupported: "Filformatet støttes ikke", tooLarge: "Samlet filstørrelse overstiger 2,5 MB.", tableOnly: "Tabellmodus krever CSV-, JSON- eller XLSX-filer og direkte CSV/JSON-URL-er.", login: "Logg inn for å behandle flere kilder.", signIn: "Logg inn", rows: "rader", truncated: "avkortet" },
  fi: { title: "Asiakirjat ja URL-osoitteet", description: "Analysoi useita julkisia lähteitä, luo tekstikorpus tai yhdistä yhteensopivia taulukoita ML-koulutukseen.", mode: "Käsittelytyönkulku", separate: "Analysoi ja vertaa lähteitä erikseen", corpus: "Tekstikorpus ja toistuvat aiheet", tables: "Yhdistä taulukot ML-koulutusta varten", both: "Tekstianalyysi + ML-taulukot", objective: "Kysymys tai tavoite (valinnainen)", objectivePlaceholder: "esim. vertaile ilmanlaadun näyttöä...", urls: "Julkiset URL-osoitteet (yksi rivillä, enintään 5)", files: "Tiedostot (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; enintään 5)", chooseFiles: "Valitse useita tiedostoja", limits: "Enintään 5 tiedostoa ja 5 URL-osoitetta; tiedostojen yhteiskoko 2,5 Mt. Tiedostot ja julkiset sivut käsitellään muistissa eikä niitä tallenneta. Verkkosivujen on tarjottava HTML-tekstiä; ML-taulukot vaativat suorat CSV- tai JSON-URL-osoitteet.", run: "Käsittele lähteet", busy: "Käsitellään…", extracted: "Poimittu", recommendations: "Aiheeseen liittyvät resurssit", corpusTitle: "Yhdistetty korpus", corpusMethod: "Poimiva yhteenveto ja toistuvat termit, ei LLM:ää.", summary: "Edustavat lauseet", keywords: "Toistuvat sanat", sources: "lähdettä", characters: "merkkiä", tablesReady: "Taulukot yhdistetty ja ladattu alla olevaan ML-paneeliin", tableNote: "CSV/JSON/XLSX-taulukoita tai suoria taulukkoaineiston URL-osoitteita ei valittu.", noSources: "Lisää vähintään yksi tiedosto tai URL-osoite.", tooManyFiles: "Voit lisätä enintään 5 tiedostoa.", tooManyUrls: "Voit lisätä enintään 5 URL-osoitetta.", badUrl: "Käytä kelvollisia julkisia HTTP- tai HTTPS-URL-osoitteita ilman kirjautumistietoja.", unsupported: "Tiedostomuotoa ei tueta", tooLarge: "Tiedostojen yhteiskoko ylittää 2,5 Mt.", tableOnly: "Taulukkotila vaatii CSV-, JSON- tai XLSX-tiedostoja ja suoria CSV/JSON-URL-osoitteita.", login: "Kirjaudu sisään käsitelläksesi useita lähteitä.", signIn: "Kirjaudu sisään", rows: "riviä", truncated: "katkaistu" },
  uk: { title: "Документи й URL", description: "Аналізуйте кілька загальнодоступних джерел, створюйте текстовий корпус або об’єднуйте сумісні таблиці для навчання ML.", mode: "Сценарій обробки", separate: "Окремо аналізувати й порівнювати джерела", corpus: "Текстовий корпус і повторювані теми", tables: "Об’єднати таблиці для навчання ML", both: "Аналіз тексту + таблиці ML", objective: "Запитання або мета (необов’язково)", objectivePlaceholder: "наприклад, порівняти дані про якість повітря...", urls: "Загальнодоступні URL (по одному в рядку, до 5)", files: "Файли (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; до 5)", chooseFiles: "Вибрати кілька файлів", limits: "До 5 файлів і 5 URL; загальний розмір файлів — 2,5 МБ. Файли й загальнодоступні сторінки обробляються в пам’яті та не зберігаються. Вебсторінки мають містити HTML-текст; таблиці ML потребують прямих URL CSV або JSON.", run: "Обробити джерела", busy: "Обробка…", extracted: "Витягнуто", recommendations: "Пов’язані ресурси", corpusTitle: "Об’єднаний корпус", corpusMethod: "Екстрактивний підсумок і повторювані терміни, без LLM.", summary: "Характерні речення", keywords: "Повторювані слова", sources: "джерел", characters: "символів", tablesReady: "Таблиці об’єднано й завантажено в панель ML нижче", tableNote: "Не вибрано таблиць CSV/JSON/XLSX або прямих URL табличних даних.", noSources: "Додайте принаймні один файл або URL.", tooManyFiles: "Можна додати не більше 5 файлів.", tooManyUrls: "Можна додати не більше 5 URL.", badUrl: "Використовуйте коректні загальнодоступні URL HTTP або HTTPS без облікових даних.", unsupported: "Непідтримуваний формат файлу", tooLarge: "Загальний розмір файлів перевищує 2,5 МБ.", tableOnly: "Для режиму таблиць потрібні файли CSV, JSON або XLSX і прямі URL CSV/JSON.", login: "Увійдіть, щоб обробляти кілька джерел.", signIn: "Увійти", rows: "рядків", truncated: "обрізано" },
  cs: { title: "Dokumenty a URL", description: "Analyzujte více veřejných zdrojů, vytvářejte textový korpus nebo slučujte kompatibilní tabulky pro trénování ML.", mode: "Pracovní postup", separate: "Samostatně analyzovat a porovnat zdroje", corpus: "Textový korpus a opakující se témata", tables: "Sloučit tabulky pro trénování ML", both: "Analýza textu + ML tabulky", objective: "Otázka nebo cíl (volitelné)", objectivePlaceholder: "např. porovnat důkazy o kvalitě ovzduší...", urls: "Veřejné URL (jedno na řádek, nejvýše 5)", files: "Soubory (PDF, DOCX, XLSX, CSV, JSON, TXT, MD; nejvýše 5)", chooseFiles: "Vybrat více souborů", limits: "Nejvýše 5 souborů a 5 URL; celková velikost souborů 2,5 MB. Soubory a veřejné stránky se zpracovávají v paměti a neukládají se. Webové stránky musí poskytovat text HTML; tabulky ML vyžadují přímé URL CSV nebo JSON.", run: "Zpracovat zdroje", busy: "Zpracování…", extracted: "Extrahováno", recommendations: "Související zdroje", corpusTitle: "Sloučený korpus", corpusMethod: "Extraktivní shrnutí a opakující se termíny, bez LLM.", summary: "Reprezentativní věty", keywords: "Opakující se slova", sources: "zdrojů", characters: "znaků", tablesReady: "Tabulky sloučeny a načteny do panelu ML níže", tableNote: "Nebyly vybrány tabulky CSV/JSON/XLSX ani přímá URL na tabulková data.", noSources: "Přidejte alespoň jeden soubor nebo URL.", tooManyFiles: "Můžete přidat nejvýše 5 souborů.", tooManyUrls: "Můžete přidat nejvýše 5 URL.", badUrl: "Použijte platná veřejná URL HTTP nebo HTTPS bez přihlašovacích údajů.", unsupported: "Nepodporovaný formát souboru", tooLarge: "Celková velikost souborů přesahuje 2,5 MB.", tableOnly: "Režim tabulek vyžaduje soubory CSV, JSON nebo XLSX a přímé URL CSV/JSON.", login: "Přihlaste se pro zpracování více zdrojů.", signIn: "Přihlásit se", rows: "řádků", truncated: "zkráceno" },
};

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function readSourceFiles(files: File[]): Promise<MlSourceDocument[]> {
  return Promise.all(files.map(async (file) => ({
    name: file.name,
    contentBase64: encodeBase64(new Uint8Array(await file.arrayBuffer())),
  })));
}

function extensionOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isDirectTableUrl(value: string) {
  const path = new URL(value).pathname.toLowerCase();
  return path.endsWith(".csv") || path.endsWith(".json");
}

export function MlStudioSources({
  language,
  onMergedDataset,
}: {
  language: string;
  onMergedDataset: (dataset: Pick<MergedDataset, "name" | "contentBase64">) => Promise<void>;
}) {
  const locale = getMlStudioLanguage(language);
  const text = {
    ...(locale === "it" ? copy.it : copy.en),
    ...localizedCopy[locale],
  };
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<SourceMode>("both");
  const [question, setQuestion] = useState("");
  const [urlText, setUrlText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<MlSourceResult | null>(null);
  const [error, setError] = useState("");
  const [tableMessage, setTableMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const analyzeMutation = trpc.mlStudio.analyzeSources.useMutation();
  const mergeMutation = trpc.mlStudio.mergeSources.useMutation();

  const analyze = async () => {
    setError("");
    setTableMessage("");
    setAnalysis(null);
    const urls = urlText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (!files.length && !urls.length) {
      setError(text.noSources);
      return;
    }
    if (files.length > MAX_SOURCE_FILES) {
      setError(text.tooManyFiles);
      return;
    }
    if (urls.length > MAX_SOURCE_FILES) {
      setError(text.tooManyUrls);
      return;
    }
    if (urls.some((value) => {
      try {
        const parsed = new URL(value);
        return !["http:", "https:"].includes(parsed.protocol) || Boolean(parsed.username || parsed.password);
      } catch {
        return true;
      }
    })) {
      setError(text.badUrl);
      return;
    }
    if (files.some((file) => !supportedExtensions.has(extensionOf(file.name)))) {
      setError(text.unsupported);
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > MAX_SOURCE_BYTES) {
      setError(text.tooLarge);
      return;
    }

    setBusy(true);
    try {
      const documents = await readSourceFiles(files);
      if (mode === "separate" || mode === "corpus" || mode === "both") {
        try {
          setAnalysis(await analyzeMutation.mutateAsync({ documents, urls, query: question.trim() }));
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
        }
      }

      if (mode === "tables" || mode === "both") {
        const tableDocuments = documents.filter((document) => tableExtensions.has(extensionOf(document.name)));
        const unsupportedUrl = urls.some((url) => !isDirectTableUrl(url));
        if (mode === "tables" && (
          tableDocuments.length !== documents.length
          || unsupportedUrl
        )) {
          setError(text.tableOnly);
        } else {
          const tableUrls = urls.filter(isDirectTableUrl);
          if (!tableDocuments.length && !tableUrls.length) {
            setTableMessage(text.tableNote);
          } else {
            try {
              const merged = await mergeMutation.mutateAsync({ documents: tableDocuments, urls: tableUrls });
              await onMergedDataset({ name: merged.name, contentBase64: merged.contentBase64 });
              setTableMessage(`${text.tablesReady}: ${merged.sourceCount.toLocaleString(getMlStudioLocale(locale))} · ${merged.rows.toLocaleString(getMlStudioLocale(locale))} ${text.rows}.`);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : String(reason));
            }
          }
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" />{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="block max-w-xl space-y-1 text-sm font-medium">
          {text.mode}
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            value={mode}
            onChange={(event) => setMode(event.target.value as SourceMode)}
          >
            <option value="separate">{text.separate}</option>
            <option value="corpus">{text.corpus}</option>
            <option value="tables">{text.tables}</option>
            <option value="both">{text.both}</option>
          </select>
        </label>
        {mode !== "tables" && (
          <label className="block space-y-1 text-sm font-medium">
            {text.objective}
            <Textarea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} rows={2} placeholder={text.objectivePlaceholder} />
          </label>
        )}
        <label className="block space-y-1 text-sm font-medium">
          {text.urls}
          <Textarea value={urlText} onChange={(event) => setUrlText(event.target.value)} maxLength={10_500} rows={3} placeholder={"https://example.org/report\nhttps://example.org/data.csv"} />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          {text.files}
          <span className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
            <Upload className="h-4 w-4" />
            {files.length ? files.map((file) => file.name).join(", ") : text.chooseFiles}
            <Input
              className="sr-only"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.json,.txt,.md"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </span>
        </label>
        <p className="text-xs text-muted-foreground">{text.limits}</p>
        {!isAuthenticated && !authLoading && <p className="text-sm text-muted-foreground">{text.login} <a className="text-primary underline" href="/login">{text.signIn}</a></p>}
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {tableMessage && <p role="status" className="text-sm text-muted-foreground">{tableMessage}</p>}
        <Button onClick={analyze} disabled={busy || authLoading || !isAuthenticated}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          {busy ? text.busy : text.run}
        </Button>

        {analysis?.corpus && mode !== "separate" && (
          <section className="space-y-3 rounded-lg border bg-muted/30 p-4" aria-live="polite">
            <h3 className="font-semibold">{text.corpusTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {analysis.corpus.sourceCount.toLocaleString(getMlStudioLocale(locale))} {text.sources} · {analysis.corpus.characters.toLocaleString(getMlStudioLocale(locale))} {text.characters} · {analysis.corpus.method}
            </p>
            {analysis.corpus.summary.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">{text.summary}</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {analysis.corpus.summary.map((sentence) => <li key={sentence}>{sentence}</li>)}
                </ul>
              </div>
            )}
            {analysis.corpus.keywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium">{text.keywords}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {analysis.corpus.keywords.map((keyword) => (
                    <span key={keyword.term} className="rounded-full border bg-background px-2 py-1 text-xs">
                      {keyword.term} · {keyword.sourceCount.toLocaleString(getMlStudioLocale(locale))}/{analysis.corpus?.sourceCount.toLocaleString(getMlStudioLocale(locale))}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {analysis?.items.map((item, index) => (
          <article key={`${item.kind}-${item.label ?? item.document?.name ?? index}-${index}`} className="rounded-lg border p-4">
            <h3 className="flex items-center gap-2 font-medium">
              {item.kind === "file" ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              {item.label ?? item.document?.name}
            </h3>
            {item.error && <p role="alert" className="mt-2 text-sm text-destructive">{item.error}</p>}
            {item.document && (
              <div className="mt-3 space-y-2 text-sm">
                {item.label && item.document.name !== item.label && <p className="text-muted-foreground">{item.document.name}</p>}
                <p className="text-muted-foreground">{item.document.format} · {item.document.charactersExtracted.toLocaleString(getMlStudioLocale(locale))} {text.characters}{item.document.truncated ? ` · ${text.truncated}` : ""}</p>
                <p className="text-xs text-muted-foreground">{item.processing}</p>
                {item.extractedTextPreview && (
                  <>
                    <p className="font-medium">{text.extracted}</p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{item.extractedTextPreview}</pre>
                  </>
                )}
                {item.analysis?.references.length ? (
                  <div>
                    <h4 className="font-medium">{text.recommendations}</h4>
                    <ul className="mt-1 space-y-1">
                      {item.analysis.references.slice(0, 5).map((reference) => (
                        <li key={reference.url}>
                          <a className="text-primary underline" href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}</a>
                          <p className="text-xs text-muted-foreground">{reference.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
