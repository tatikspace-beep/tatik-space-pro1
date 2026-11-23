import { useState } from "react";
import { AlertCircle, Download, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import type { SentinelAoiJob } from "../../../server/data-insight";
import type { ReportLanguage } from "@/lib/sentinelReportLocalization";
import { formatSentinelNumber, normalizeSentinelReportLanguage } from "@/lib/sentinelReportLocalization";

type TrainingData = NonNullable<SentinelAoiJob["result"]["unetTrainingData"]>;
type ClassLegend = SentinelAoiJob["result"]["classLegend"];
type UnetResult = {
  accuracy: number;
  balancedAccuracy: number;
  macroF1: number;
  testPixels: number;
  classes: Array<{ code: number; name: string; color: string }>;
  perClass: Array<{ code: number; precision: number; recall: number; f1: number; support: number }>;
  confusionMatrix: number[][];
  preview: string;
  exportPayload: {
    width: number;
    height: number;
    classCodes: number[];
    predictedClassCodesBase64: string;
    transform: TrainingData["transform"];
    crs: string;
    bbox: TrainingData["bbox"];
    sceneId: string;
  };
};

const PATCH_SIZE = 32;
const FEATURE_CHANNELS = 8;

const copy = {
  it: {
    title: "U-Net · Segmentazione pixel per pixel dell'AOI",
    description: "Training CNN leggero nel browser, usando i dati Sentinel-2 e ESA WorldCover dell'analisi appena completata.",
    labelTitle: "Fonte delle etichette",
    proxy: "ESA WorldCover 2021 · etichette proxy",
    verified: "Etichette verificate indipendenti · non disponibili",
    proxyNote: "WorldCover è un prodotto cartografico derivato da classificazione, non ground truth indipendente. Le metriche misurano l'accordo con questo proxy su patch spaziali escluse dal training.",
    missing: "Esegui prima l'analisi Sentinel-2 con l'opzione «Prepara dati per U-Net» attiva.",
    epochs: "Epoche",
    run: "Addestra e valuta U-Net nel browser",
    running: "Training U-Net in corso…",
    progress: (epoch: number, total: number, loss: number | string) => `Epoca ${epoch}/${total} · loss ${loss}`,
    accuracy: "Accuracy proxy",
    balanced: "Balanced accuracy proxy",
    f1: "Macro F1 proxy",
    testPixels: "Pixel test spaziali",
    class: "Classe",
    precision: "Precision",
    recall: "Recall",
    support: "Pixel test",
    matrix: "Matrice di confusione (righe: WorldCover, colonne: predetta)",
    actual: "Riferimento / predetta",
    preview: "Anteprima U-Net (griglia ridotta, non georeferenziata)",
    download: "Scarica GeoTIFF U-Net georeferenziato",
    note: "La preview non è georeferenziata; il download produce un GeoTIFF a griglia ridotta. Il risultato resta esplorativo e non sostituisce validazione indipendente o rilievi sul campo.",
    error: "Training U-Net non riuscito.",
    unavailable: "Non ci sono abbastanza patch spaziali o classi proxy per una valutazione indipendente. Prova un'AOI più ampia o seleziona meno classi.",
    badData: "I dati raster compressi non sono validi o non corrispondono alla griglia dichiarata.",
    invalidEpochs: "Scegli da 1 a 10 epoche.",
    classCoverage: "Copertura di classi insufficiente nei blocchi spaziali esclusi. Amplia l'area o riduci le classi selezionate.",
  },
  en: {
    title: "U-Net · Pixel-wise AOI segmentation",
    description: "Lightweight CNN training in your browser using Sentinel-2 and ESA WorldCover data from the completed analysis.",
    labelTitle: "Label source",
    proxy: "ESA WorldCover 2021 · proxy labels",
    verified: "Independent verified labels · unavailable",
    proxyNote: "WorldCover is a classified map product, not independent ground truth. Metrics report agreement with this proxy on spatial patches held out from training.",
    missing: "First run Sentinel-2 analysis with «Prepare data for U-Net» enabled.",
    epochs: "Epochs",
    run: "Train and evaluate U-Net in browser",
    running: "U-Net training…",
    progress: (epoch: number, total: number, loss: number | string) => `Epoch ${epoch}/${total} · loss ${loss}`,
    accuracy: "Proxy accuracy",
    balanced: "Proxy balanced accuracy",
    f1: "Proxy macro F1",
    testPixels: "Spatial test pixels",
    class: "Class",
    precision: "Precision",
    recall: "Recall",
    support: "Test pixels",
    matrix: "Confusion matrix (rows: WorldCover, columns: predicted)",
    actual: "Reference / predicted",
    preview: "U-Net preview (reduced grid, not georeferenced)",
    download: "Download georeferenced U-Net GeoTIFF",
    note: "The preview is not georeferenced; the download produces a reduced-grid GeoTIFF. Results remain exploratory and do not replace independent validation or field surveys.",
    error: "U-Net training failed.",
    unavailable: "There are not enough spatial patches or proxy classes for independent evaluation. Try a larger AOI or select fewer classes.",
    badData: "Compressed raster data is invalid or does not match the declared grid.",
    invalidEpochs: "Choose 1–10 epochs.",
    classCoverage: "Insufficient class coverage in held-out spatial blocks. Expand the AOI or select fewer classes.",
  },
};

const unetCopy: Record<ReportLanguage, typeof copy.en> = {
  ...copy,
  es: {
    ...copy.en,
    title: "U-Net · Segmentación píxel a píxel del AOI",
    description: "Entrenamiento ligero de CNN en el navegador con datos Sentinel-2 y ESA WorldCover del análisis completado.",
    labelTitle: "Fuente de las etiquetas",
    proxy: "ESA WorldCover 2021 · etiquetas proxy",
    verified: "Etiquetas independientes verificadas · no disponibles",
    proxyNote: "WorldCover es un producto cartográfico clasificado, no una referencia terrestre independiente. Las métricas miden la coincidencia con este proxy en bloques espaciales excluidos del entrenamiento.",
    missing: "Primero ejecuta el análisis Sentinel-2 con «Preparar datos para U-Net» activado.",
    epochs: "Épocas",
    run: "Entrenar y evaluar U-Net en el navegador",
    running: "Entrenando U-Net…",
    progress: (epoch, total, loss) => `Época ${epoch}/${total} · pérdida ${loss}`,
    accuracy: "Exactitud proxy",
    balanced: "Exactitud equilibrada proxy",
    f1: "F1 macro proxy",
    testPixels: "Píxeles espaciales de prueba",
    class: "Clase",
    precision: "Precisión",
    recall: "Exhaustividad",
    support: "Píxeles de prueba",
    matrix: "Matriz de confusión (filas: WorldCover, columnas: predicción)",
    actual: "Referencia / predicción",
    preview: "Vista previa U-Net (cuadrícula reducida, sin georreferenciar)",
    download: "Descargar GeoTIFF U-Net georreferenciado",
    note: "La vista previa no está georreferenciada; la descarga genera un GeoTIFF de cuadrícula reducida. El resultado es exploratorio y no sustituye la validación independiente ni las mediciones de campo.",
    error: "El entrenamiento U-Net falló.",
    unavailable: "No hay suficientes bloques espaciales o clases proxy para una evaluación independiente. Prueba con un AOI mayor o selecciona menos clases.",
    badData: "Los datos ráster comprimidos no son válidos o no coinciden con la cuadrícula indicada.",
    invalidEpochs: "Elige de 1 a 10 épocas.",
    classCoverage: "Cobertura insuficiente de clases en los bloques espaciales reservados. Amplía el AOI o selecciona menos clases.",
  },
  ru: {
    ...copy.en,
    title: "U-Net · Пиксельная сегментация AOI",
    description: "Облегчённое обучение CNN в браузере на данных Sentinel-2 и ESA WorldCover из завершённого анализа.",
    labelTitle: "Источник меток",
    proxy: "ESA WorldCover 2021 · прокси-метки",
    verified: "Независимые проверенные метки · недоступны",
    proxyNote: "WorldCover — классифицированная карта, а не независимая наземная проверка. Метрики показывают согласие с этим источником на пространственных блоках, исключённых из обучения.",
    missing: "Сначала запустите анализ Sentinel-2, включив параметр «Подготовить данные для U-Net».",
    epochs: "Эпохи",
    run: "Обучить и проверить U-Net в браузере",
    running: "Обучение U-Net…",
    accuracy: "Точность по прокси",
    balanced: "Сбалансированная точность по прокси",
    f1: "Макро F1 по прокси",
    testPixels: "Пространственные тестовые пиксели",
    class: "Класс",
    precision: "Точность",
    recall: "Полнота",
    support: "Тестовые пиксели",
    matrix: "Матрица ошибок (строки: WorldCover, столбцы: прогноз)",
    actual: "Эталон / прогноз",
    preview: "Предпросмотр U-Net (уменьшенная сетка без геопривязки)",
    download: "Скачать геопривязанный GeoTIFF U-Net",
    note: "Предпросмотр не имеет геопривязки; скачивается GeoTIFF с уменьшенной сеткой. Результат носит исследовательский характер и не заменяет независимую проверку или полевые наблюдения.",
    error: "Не удалось обучить U-Net.",
    unavailable: "Недостаточно пространственных блоков или прокси-классов для независимой оценки. Попробуйте увеличить область или выбрать меньше классов.",
    badData: "Сжатые растровые данные недействительны или не соответствуют указанной сетке.",
    invalidEpochs: "Выберите от 1 до 10 эпох.",
    classCoverage: "Недостаточное покрытие классов в исключённых пространственных блоках. Увеличьте область или выберите меньше классов.",
    progress: (epoch, total, loss) => `Эпоха ${epoch}/${total} · ошибка ${loss}`,
  },
  fr: {
    ...copy.en,
    title: "U-Net · Segmentation de l’AOI pixel par pixel",
    description: "Entraînement léger d’un CNN dans le navigateur à partir des données Sentinel-2 et ESA WorldCover de l’analyse terminée.",
    labelTitle: "Source des étiquettes",
    proxy: "ESA WorldCover 2021 · étiquettes proxy",
    verified: "Étiquettes indépendantes vérifiées · indisponibles",
    proxyNote: "WorldCover est un produit cartographique classé, et non une vérité terrain indépendante. Les métriques mesurent l’accord avec ce proxy sur des blocs spatiaux exclus de l’entraînement.",
    missing: "Lancez d’abord l’analyse Sentinel-2 en activant « Préparer les données pour U-Net ».",
    epochs: "Époques",
    run: "Entraîner et évaluer U-Net dans le navigateur",
    running: "Entraînement de U-Net…",
    progress: (epoch, total, loss) => `Époque ${epoch}/${total} · perte ${loss}`,
    accuracy: "Exactitude proxy",
    balanced: "Exactitude équilibrée proxy",
    f1: "F1 macro proxy",
    testPixels: "Pixels de test spatiaux",
    class: "Classe",
    precision: "Précision",
    recall: "Rappel",
    support: "Pixels de test",
    matrix: "Matrice de confusion (lignes : WorldCover, colonnes : prédiction)",
    actual: "Référence / prédiction",
    preview: "Aperçu U-Net (grille réduite, sans géoréférencement)",
    download: "Télécharger le GeoTIFF U-Net géoréférencé",
    note: "L’aperçu n’est pas géoréférencé ; le téléchargement produit un GeoTIFF à grille réduite. Le résultat est exploratoire et ne remplace ni une validation indépendante ni des relevés de terrain.",
    error: "Échec de l’entraînement U-Net.",
    unavailable: "Nombre insuffisant de blocs spatiaux ou de classes proxy pour une évaluation indépendante. Essayez une AOI plus grande ou sélectionnez moins de classes.",
    badData: "Les données raster compressées sont invalides ou ne correspondent pas à la grille déclarée.",
    invalidEpochs: "Choisissez de 1 à 10 époques.",
    classCoverage: "Couverture des classes insuffisante dans les blocs spatiaux réservés. Agrandissez l’AOI ou sélectionnez moins de classes.",
  },
  de: {
    ...copy.en,
    title: "U-Net · Pixelweise Segmentierung des AOI",
    description: "Leichtes CNN-Training im Browser mit Sentinel-2- und ESA-WorldCover-Daten aus der abgeschlossenen Analyse.",
    labelTitle: "Quelle der Labels",
    proxy: "ESA WorldCover 2021 · Proxy-Labels",
    verified: "Unabhängig geprüfte Labels · nicht verfügbar",
    proxyNote: "WorldCover ist ein klassifiziertes Kartenprodukt und keine unabhängige Referenz vor Ort. Die Metriken zeigen die Übereinstimmung mit diesem Proxy in räumlichen Blöcken, die vom Training ausgeschlossen wurden.",
    missing: "Führen Sie zuerst die Sentinel-2-Analyse mit aktivierter Option „U-Net-Daten vorbereiten“ aus.",
    epochs: "Epochen",
    run: "U-Net im Browser trainieren und auswerten",
    running: "U-Net wird trainiert…",
    progress: (epoch, total, loss) => `Epoche ${epoch}/${total} · Verlust ${loss}`,
    accuracy: "Proxy-Genauigkeit",
    balanced: "Ausgewogene Proxy-Genauigkeit",
    f1: "Makro-F1 des Proxys",
    testPixels: "Räumliche Testpixel",
    class: "Klasse",
    precision: "Präzision",
    recall: "Trefferquote",
    support: "Testpixel",
    matrix: "Konfusionsmatrix (Zeilen: WorldCover, Spalten: Vorhersage)",
    actual: "Referenz / Vorhersage",
    preview: "U-Net-Vorschau (verkleinertes Raster, nicht georeferenziert)",
    download: "Georeferenziertes U-Net-GeoTIFF herunterladen",
    note: "Die Vorschau ist nicht georeferenziert; der Download erzeugt ein GeoTIFF mit verkleinertem Raster. Das Ergebnis dient der Exploration und ersetzt weder eine unabhängige Validierung noch Geländemessungen.",
    error: "U-Net-Training fehlgeschlagen.",
    unavailable: "Für eine unabhängige Auswertung gibt es nicht genügend räumliche Blöcke oder Proxy-Klassen. Verwenden Sie ein größeres AOI oder wählen Sie weniger Klassen.",
    badData: "Die komprimierten Rasterdaten sind ungültig oder stimmen nicht mit dem angegebenen Raster überein.",
    invalidEpochs: "Wählen Sie 1 bis 10 Epochen.",
    classCoverage: "Unzureichende Klassenabdeckung in den zurückgehaltenen räumlichen Blöcken. Vergrößern Sie das AOI oder wählen Sie weniger Klassen.",
  },
  pt: {
    ...copy.en,
    title: "U-Net · Segmentação da AOI pixel a pixel",
    description: "Treino leve de CNN no navegador com dados Sentinel-2 e ESA WorldCover da análise concluída.",
    labelTitle: "Origem das etiquetas",
    proxy: "ESA WorldCover 2021 · etiquetas proxy",
    verified: "Etiquetas independentes verificadas · indisponíveis",
    proxyNote: "O WorldCover é um produto cartográfico classificado, não uma referência terrestre independente. As métricas medem a concordância com este proxy em blocos espaciais excluídos do treino.",
    missing: "Execute primeiro a análise Sentinel-2 com «Preparar dados para U-Net» ativado.",
    epochs: "Épocas",
    run: "Treinar e avaliar U-Net no navegador",
    running: "A treinar U-Net…",
    progress: (epoch, total, loss) => `Época ${epoch}/${total} · perda ${loss}`,
    accuracy: "Exatidão proxy",
    balanced: "Exatidão equilibrada proxy",
    f1: "F1 macro proxy",
    testPixels: "Pixels de teste espaciais",
    class: "Classe",
    precision: "Precisão",
    recall: "Revocação",
    support: "Pixels de teste",
    matrix: "Matriz de confusão (linhas: WorldCover, colunas: previsão)",
    actual: "Referência / previsão",
    preview: "Pré-visualização U-Net (grelha reduzida, sem georreferenciação)",
    download: "Transferir GeoTIFF U-Net georreferenciado",
    note: "A pré-visualização não está georreferenciada; a transferência gera um GeoTIFF de grelha reduzida. O resultado é exploratório e não substitui uma validação independente nem medições no terreno.",
    error: "O treino da U-Net falhou.",
    unavailable: "Não existem blocos espaciais ou classes proxy suficientes para uma avaliação independente. Experimente uma AOI maior ou selecione menos classes.",
    badData: "Os dados raster comprimidos são inválidos ou não correspondem à grelha indicada.",
    invalidEpochs: "Escolha entre 1 e 10 épocas.",
    classCoverage: "Cobertura insuficiente das classes nos blocos espaciais reservados. Aumente a AOI ou selecione menos classes.",
  },
  pl: {
    ...copy.en,
    title: "U-Net · Segmentacja pikselowa AOI",
    description: "Lekkie trenowanie CNN w przeglądarce z użyciem danych Sentinel-2 i ESA WorldCover z ukończonej analizy.",
    labelTitle: "Źródło etykiet",
    proxy: "ESA WorldCover 2021 · etykiety zastępcze",
    verified: "Niezależne zweryfikowane etykiety · niedostępne",
    proxyNote: "WorldCover to sklasyfikowany produkt mapowy, a nie niezależne dane terenowe. Metryki pokazują zgodność z tym źródłem w blokach przestrzennych wyłączonych z treningu.",
    missing: "Najpierw uruchom analizę Sentinel-2 z włączoną opcją „Przygotuj dane U-Net”.",
    epochs: "Epoki",
    run: "Trenuj i oceniaj U-Net w przeglądarce",
    running: "Trenowanie U-Net…",
    progress: (epoch, total, loss) => `Epoka ${epoch}/${total} · strata ${loss}`,
    accuracy: "Dokładność zastępcza",
    balanced: "Zrównoważona dokładność zastępcza",
    f1: "Makro F1",
    testPixels: "Przestrzenne piksele testowe",
    class: "Klasa",
    precision: "Precyzja",
    recall: "Czułość",
    support: "Piksele testowe",
    matrix: "Macierz pomyłek (wiersze: WorldCover, kolumny: przewidywanie)",
    actual: "Odniesienie / przewidywanie",
    preview: "Podgląd U-Net (zmniejszona siatka, bez georeferencji)",
    download: "Pobierz georeferencyjny GeoTIFF U-Net",
    note: "Podgląd nie ma georeferencji; pobierany GeoTIFF używa zmniejszonej siatki. Wynik ma charakter eksploracyjny i nie zastępuje niezależnej walidacji ani pomiarów terenowych.",
    error: "Trenowanie U-Net nie powiodło się.",
    unavailable: "Za mało bloków przestrzennych lub klas zastępczych do niezależnej oceny. Spróbuj większego AOI lub wybierz mniej klas.",
    badData: "Skompresowane dane rastrowe są nieprawidłowe lub nie pasują do zadeklarowanej siatki.",
    invalidEpochs: "Wybierz od 1 do 10 epok.",
    classCoverage: "Niewystarczające pokrycie klas w odłożonych blokach przestrzennych. Zwiększ AOI lub wybierz mniej klas.",
  },
  nl: {
    ...copy.en,
    title: "U-Net · Pixelgewijze AOI-segmentatie",
    description: "Lichte CNN-training in de browser met Sentinel-2- en ESA WorldCover-gegevens uit de voltooide analyse.",
    labelTitle: "Bron van de labels",
    proxy: "ESA WorldCover 2021 · proxylabels",
    verified: "Onafhankelijk geverifieerde labels · niet beschikbaar",
    proxyNote: "WorldCover is een geclassificeerd kaartproduct, geen onafhankelijke terreinreferentie. De metingen tonen overeenstemming met deze proxy in ruimtelijke blokken die buiten de training zijn gehouden.",
    missing: "Voer eerst de Sentinel-2-analyse uit met „U-Net-gegevens voorbereiden” ingeschakeld.",
    epochs: "Epochs",
    run: "U-Net trainen en evalueren in de browser",
    running: "U-Net wordt getraind…",
    progress: (epoch, total, loss) => `Epoch ${epoch}/${total} · verlies ${loss}`,
    accuracy: "Proxy-nauwkeurigheid",
    balanced: "Gebalanceerde proxy-nauwkeurigheid",
    f1: "Macro-F1-proxy",
    testPixels: "Ruimtelijke testpixels",
    class: "Klasse",
    precision: "Precisie",
    recall: "Recall",
    support: "Testpixels",
    matrix: "Verwarringsmatrix (rijen: WorldCover, kolommen: voorspelling)",
    actual: "Referentie / voorspelling",
    preview: "U-Net-voorbeeld (verkleind raster, niet gegeorefereerd)",
    download: "Gegeorefereerde U-Net-GeoTIFF downloaden",
    note: "Het voorbeeld is niet gegeorefereerd; de download levert een GeoTIFF met een verkleind raster. Het resultaat is verkennend en vervangt geen onafhankelijke validatie of veldmetingen.",
    error: "U-Net-training mislukt.",
    unavailable: "Er zijn onvoldoende ruimtelijke blokken of proxyklassen voor een onafhankelijke evaluatie. Probeer een groter AOI of selecteer minder klassen.",
    badData: "De gecomprimeerde rastergegevens zijn ongeldig of komen niet overeen met het opgegeven raster.",
    invalidEpochs: "Kies 1 tot en met 10 epochs.",
    classCoverage: "Onvoldoende klassevertegenwoordiging in de gereserveerde ruimtelijke blokken. Vergroot het AOI of selecteer minder klassen.",
  },
  tr: {
    ...copy.en,
    title: "U-Net · AOI piksel tabanlı bölütleme",
    description: "Tamamlanan analizdeki Sentinel-2 ve ESA WorldCover verileriyle tarayıcıda hafif CNN eğitimi.",
    labelTitle: "Etiket kaynağı",
    proxy: "ESA WorldCover 2021 · vekil etiketler",
    verified: "Bağımsız doğrulanmış etiketler · kullanılamıyor",
    proxyNote: "WorldCover bağımsız arazi gerçeği değil, sınıflandırılmış bir harita ürünüdür. Ölçümler, eğitim dışında tutulan mekânsal bloklarda bu vekil veriyle uyumu gösterir.",
    missing: "Önce «U-Net verilerini hazırla» seçeneğini etkinleştirerek Sentinel-2 analizini çalıştırın.",
    epochs: "Dönem",
    run: "U-Net'i tarayıcıda eğit ve değerlendir",
    running: "U-Net eğitiliyor…",
    progress: (epoch, total, loss) => `Dönem ${epoch}/${total} · kayıp ${loss}`,
    accuracy: "Vekil doğruluğu",
    balanced: "Dengeli vekil doğruluğu",
    f1: "Makro F1 vekili",
    testPixels: "Mekânsal test pikselleri",
    class: "Sınıf",
    precision: "Kesinlik",
    recall: "Duyarlılık",
    support: "Test pikselleri",
    matrix: "Karışıklık matrisi (satırlar: WorldCover, sütunlar: tahmin)",
    actual: "Referans / tahmin",
    preview: "U-Net önizlemesi (küçültülmüş, coğrafi referanssız ızgara)",
    download: "Coğrafi referanslı U-Net GeoTIFF dosyasını indir",
    note: "Önizleme coğrafi referans içermez; indirilen GeoTIFF küçültülmüş bir ızgara kullanır. Sonuç keşif amaçlıdır ve bağımsız doğrulamanın veya saha ölçümlerinin yerini tutmaz.",
    error: "U-Net eğitimi başarısız oldu.",
    unavailable: "Bağımsız değerlendirme için yeterli mekânsal blok veya vekil sınıf yok. Daha büyük bir AOI deneyin ya da daha az sınıf seçin.",
    badData: "Sıkıştırılmış raster verileri geçersiz veya belirtilen ızgarayla eşleşmiyor.",
    invalidEpochs: "1 ile 10 arasında dönem seçin.",
    classCoverage: "Ayrılmış mekânsal bloklarda sınıf kapsamı yetersiz. AOI'yi genişletin veya daha az sınıf seçin.",
  },
  sv: {
    ...copy.en,
    title: "U-Net · Pixelvis AOI-segmentering",
    description: "Lätt CNN-träning i webbläsaren med Sentinel-2- och ESA WorldCover-data från den slutförda analysen.",
    labelTitle: "Etiketkälla",
    proxy: "ESA WorldCover 2021 · proxyetiketter",
    verified: "Oberoende verifierade etiketter · inte tillgängliga",
    proxyNote: "WorldCover är en klassificerad kartprodukt, inte oberoende fältdata. Måtten visar överensstämmelsen med denna proxy i rumsliga block som undantagits från träningen.",
    missing: "Kör först Sentinel-2-analysen med «Förbered U-Net-data» aktiverat.",
    epochs: "Epoker",
    run: "Träna och utvärdera U-Net i webbläsaren",
    running: "U-Net tränas…",
    progress: (epoch, total, loss) => `Epok ${epoch}/${total} · förlust ${loss}`,
    accuracy: "Proxyträffsäkerhet",
    balanced: "Balanserad proxyträffsäkerhet",
    f1: "Makro-F1-proxy",
    testPixels: "Rumsliga testpixlar",
    class: "Klass",
    precision: "Precision",
    recall: "Återkallning",
    support: "Testpixlar",
    matrix: "Förväxlingsmatris (rader: WorldCover, kolumner: förutsägelse)",
    actual: "Referens / förutsägelse",
    preview: "U-Net-förhandsvisning (förminskat rutnät, ej georefererat)",
    download: "Ladda ned georefererad U-Net-GeoTIFF",
    note: "Förhandsvisningen är inte georefererad; nedladdningen ger en GeoTIFF med förminskat rutnät. Resultatet är utforskande och ersätter inte oberoende validering eller fältmätningar.",
    error: "U-Net-träningen misslyckades.",
    unavailable: "Det finns inte tillräckligt med rumsliga block eller proxyklasser för en oberoende utvärdering. Prova ett större AOI eller välj färre klasser.",
    badData: "Komprimerade rasterdata är ogiltiga eller stämmer inte med det angivna rutnätet.",
    invalidEpochs: "Välj 1–10 epoker.",
    classCoverage: "Otillräcklig klasstäckning i de undantagna rumsblocken. Utöka AOI eller välj färre klasser.",
  },
  da: {
    ...copy.en,
    title: "U-Net · Pixelvis AOI-segmentering",
    description: "Let CNN-træning i browseren med Sentinel-2- og ESA WorldCover-data fra den gennemførte analyse.",
    labelTitle: "Etiketkilde",
    proxy: "ESA WorldCover 2021 · proxyetiketter",
    verified: "Uafhængigt verificerede etiketter · ikke tilgængelige",
    proxyNote: "WorldCover er et klassificeret kortprodukt, ikke uafhængige feltdata. Målingerne viser overensstemmelse med denne proxy i rumlige blokke, der er udeladt fra træningen.",
    missing: "Kør først Sentinel-2-analysen med «Forbered U-Net-data» slået til.",
    epochs: "Epoker",
    run: "Træn og evaluer U-Net i browseren",
    running: "U-Net trænes…",
    progress: (epoch, total, loss) => `Epoke ${epoch}/${total} · tab ${loss}`,
    accuracy: "Proxy-nøjagtighed",
    balanced: "Balanceret proxy-nøjagtighed",
    f1: "Makro-F1-proxy",
    testPixels: "Rumlige testpixels",
    class: "Klasse",
    precision: "Præcision",
    recall: "Genkaldelse",
    support: "Testpixels",
    matrix: "Forvekslingsmatrix (rækker: WorldCover, kolonner: forudsigelse)",
    actual: "Reference / forudsigelse",
    preview: "U-Net-forhåndsvisning (formindsket gitter, ikke georefereret)",
    download: "Download georefereret U-Net-GeoTIFF",
    note: "Forhåndsvisningen er ikke georefereret; downloadet giver en GeoTIFF med et formindsket gitter. Resultatet er undersøgende og erstatter ikke uafhængig validering eller feltmålinger.",
    error: "U-Net-træningen mislykkedes.",
    unavailable: "Der er ikke nok rumlige blokke eller proxyklasser til en uafhængig evaluering. Prøv et større AOI, eller vælg færre klasser.",
    badData: "Komprimerede rasterdata er ugyldige eller passer ikke til det angivne gitter.",
    invalidEpochs: "Vælg 1–10 epoker.",
    classCoverage: "Utilstrækkelig klassedækning i de tilbageholdte rumlige blokke. Udvid AOI, eller vælg færre klasser.",
  },
  no: {
    ...copy.en,
    title: "U-Net · Pikselvis AOI-segmentering",
    description: "Lett CNN-trening i nettleseren med Sentinel-2- og ESA WorldCover-data fra den fullførte analysen.",
    labelTitle: "Etikettkilde",
    proxy: "ESA WorldCover 2021 · proxyetiketter",
    verified: "Uavhengig verifiserte etiketter · ikke tilgjengelig",
    proxyNote: "WorldCover er et klassifisert kartprodukt, ikke uavhengige feltdata. Målingene viser samsvar med denne proxyen i romlige blokker som er holdt utenfor treningen.",
    missing: "Kjør først Sentinel-2-analysen med «Forbered U-Net-data» aktivert.",
    epochs: "Epoker",
    run: "Tren og evaluer U-Net i nettleseren",
    running: "U-Net trenes…",
    progress: (epoch, total, loss) => `Epoke ${epoch}/${total} · tap ${loss}`,
    accuracy: "Proxy-nøyaktighet",
    balanced: "Balansert proxy-nøyaktighet",
    f1: "Makro-F1-proxy",
    testPixels: "Romlige testpiksler",
    class: "Klasse",
    precision: "Presisjon",
    recall: "Tilbakekalling",
    support: "Testpiksler",
    matrix: "Forvekslingsmatrise (rader: WorldCover, kolonner: prediksjon)",
    actual: "Referanse / prediksjon",
    preview: "U-Net-forhåndsvisning (redusert rutenett, ikke georeferert)",
    download: "Last ned georeferert U-Net-GeoTIFF",
    note: "Forhåndsvisningen er ikke georeferert; nedlastingen gir en GeoTIFF med redusert rutenett. Resultatet er utforskende og erstatter ikke uavhengig validering eller feltmålinger.",
    error: "U-Net-treningen mislyktes.",
    unavailable: "Det finnes ikke nok romlige blokker eller proxyklasser for uavhengig evaluering. Prøv et større AOI eller velg færre klasser.",
    badData: "Komprimerte rasterdata er ugyldige eller samsvarer ikke med det oppgitte rutenettet.",
    invalidEpochs: "Velg 1–10 epoker.",
    classCoverage: "Utilstrekkelig klassedekning i de holdte romlige blokkene. Utvid AOI eller velg færre klasser.",
  },
  fi: {
    ...copy.en,
    title: "U-Net · AOI:n pikselitason segmentointi",
    description: "Kevyt CNN-koulutus selaimessa valmiin analyysin Sentinel-2- ja ESA WorldCover -aineistolla.",
    labelTitle: "Luokitustietojen lähde",
    proxy: "ESA WorldCover 2021 · korvaavat luokitustiedot",
    verified: "Riippumattomat tarkistetut luokitustiedot · ei saatavilla",
    proxyNote: "WorldCover on luokiteltu karttatuote, ei riippumaton maastototuus. Mittarit kuvaavat vastaavuutta tähän korvaavaan aineistoon koulutuksen ulkopuolelle jätetyissä alueellisissa lohkoissa.",
    missing: "Suorita ensin Sentinel-2-analyysi ja ota käyttöön «Valmistele U-Net-aineisto».",
    epochs: "Epochit",
    run: "Kouluta ja arvioi U-Net selaimessa",
    running: "U-Net-koulutus käynnissä…",
    progress: (epoch, total, loss) => `Epoch ${epoch}/${total} · häviö ${loss}`,
    accuracy: "Korvaavan aineiston tarkkuus",
    balanced: "Tasapainotettu tarkkuus",
    f1: "Makro-F1",
    testPixels: "Alueelliset testipikselit",
    class: "Luokka",
    precision: "Täsmällisyys",
    recall: "Kattavuus",
    support: "Testipikselit",
    matrix: "Virhematriisi (rivit: WorldCover, sarakkeet: ennuste)",
    actual: "Vertailuarvo / ennuste",
    preview: "U-Net-esikatselu (pienennetty ruudukko, ei georeferoitu)",
    download: "Lataa georeferoitu U-Net-GeoTIFF",
    note: "Esikatselu ei ole georeferoitu; lataus luo pienennetyn ruudukon GeoTIFF-tiedoston. Tulos on kokeellinen eikä korvaa riippumatonta validointia tai maastomittauksia.",
    error: "U-Net-koulutus epäonnistui.",
    unavailable: "Riippumattomaan arviointiin ei ole riittävästi alueellisia lohkoja tai korvaavia luokkia. Kokeile suurempaa AOI-aluetta tai valitse vähemmän luokkia.",
    badData: "Pakattu rasteriaineisto on virheellinen tai ei vastaa ilmoitettua ruudukkoa.",
    invalidEpochs: "Valitse 1–10 epochia.",
    classCoverage: "Luokkien kattavuus varatuissa alueellisissa lohkoissa on riittämätön. Laajenna AOI-aluetta tai valitse vähemmän luokkia.",
  },
  uk: {
    ...copy.en,
    title: "U-Net · Піксельна сегментація AOI",
    description: "Полегшене навчання CNN у браузері на даних Sentinel-2 та ESA WorldCover із завершеного аналізу.",
    labelTitle: "Джерело міток",
    proxy: "ESA WorldCover 2021 · проксі-мітки",
    verified: "Незалежні перевірені мітки · недоступні",
    proxyNote: "WorldCover — класифікована карта, а не незалежні наземні дані. Метрики показують узгодженість із цим джерелом на просторових блоках, вилучених із навчання.",
    missing: "Спочатку запустіть аналіз Sentinel-2 з увімкненим параметром «Підготувати дані для U-Net».",
    epochs: "Епохи",
    run: "Навчити й оцінити U-Net у браузері",
    running: "Навчання U-Net…",
    accuracy: "Точність за проксі",
    balanced: "Збалансована точність за проксі",
    f1: "Макро F1 за проксі",
    testPixels: "Просторові тестові пікселі",
    class: "Клас",
    precision: "Точність",
    recall: "Повнота",
    support: "Тестові пікселі",
    matrix: "Матриця помилок (рядки: WorldCover, стовпці: прогноз)",
    actual: "Еталон / прогноз",
    preview: "Попередній перегляд U-Net (зменшена сітка без геоприв’язки)",
    download: "Завантажити геоприв’язаний GeoTIFF U-Net",
    note: "Попередній перегляд не має геоприв’язки; завантажується GeoTIFF зі зменшеною сіткою. Результат має дослідницький характер і не замінює незалежну перевірку чи польові спостереження.",
    error: "Не вдалося навчити U-Net.",
    unavailable: "Недостатньо просторових блоків або проксі-класів для незалежного оцінювання. Спробуйте збільшити область або вибрати менше класів.",
    badData: "Стиснуті растрові дані некоректні або не відповідають зазначеній сітці.",
    invalidEpochs: "Виберіть від 1 до 10 епох.",
    classCoverage: "Недостатнє покриття класів у вилучених просторових блоках. Збільште область або виберіть менше класів.",
    progress: (epoch, total, loss) => `Епоха ${epoch}/${total} · помилка ${loss}`,
  },
  cs: {
    ...copy.en,
    title: "U-Net · Pixelová segmentace AOI",
    description: "Lehké trénování CNN v prohlížeči s daty Sentinel-2 a ESA WorldCover z dokončené analýzy.",
    labelTitle: "Zdroj štítků",
    proxy: "ESA WorldCover 2021 · zástupné štítky",
    verified: "Nezávisle ověřené štítky · nejsou k dispozici",
    proxyNote: "WorldCover je klasifikovaný mapový produkt, nikoli nezávislá terénní reference. Metriky měří shodu s tímto zástupným zdrojem v prostorových blocích vynechaných z trénování.",
    missing: "Nejprve spusťte analýzu Sentinel-2 se zapnutou volbou „Připravit data pro U-Net“.",
    epochs: "Epochy",
    run: "Trénovat a vyhodnotit U-Net v prohlížeči",
    running: "U-Net se trénuje…",
    progress: (epoch, total, loss) => `Epocha ${epoch}/${total} · ztráta ${loss}`,
    accuracy: "Přesnost zástupného zdroje",
    balanced: "Vyvážená přesnost zástupného zdroje",
    f1: "Makro F1 zástupného zdroje",
    testPixels: "Prostorové testovací pixely",
    class: "Třída",
    precision: "Preciznost",
    recall: "Úplnost",
    support: "Testovací pixely",
    matrix: "Matice záměn (řádky: WorldCover, sloupce: predikce)",
    actual: "Reference / predikce",
    preview: "Náhled U-Net (zmenšená mřížka bez georeference)",
    download: "Stáhnout georeferencovaný GeoTIFF U-Net",
    note: "Náhled není georeferencovaný; stažení vytvoří GeoTIFF se zmenšenou mřížkou. Výsledek je průzkumný a nenahrazuje nezávislé ověření ani terénní měření.",
    error: "Trénování U-Net se nezdařilo.",
    unavailable: "Pro nezávislé vyhodnocení není dostatek prostorových bloků nebo zástupných tříd. Zkuste větší AOI nebo vyberte méně tříd.",
    badData: "Komprimovaná rastrová data jsou neplatná nebo neodpovídají uvedené mřížce.",
    invalidEpochs: "Zvolte 1 až 10 epoch.",
    classCoverage: "Nedostatečné pokrytí tříd ve vyhrazených prostorových blocích. Rozšiřte AOI nebo vyberte méně tříd.",
  },
};

type Patch = { values: Float32Array; labels: Uint8Array; classCodes: Set<number> };

function seededShuffle<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = seed >>> 0;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function AoiUnet({
  data,
  classLegend,
  language,
}: {
  data?: TrainingData | null;
  classLegend: ClassLegend;
  language: ReportLanguage | string;
}) {
  const reportLanguage = normalizeSentinelReportLanguage(language);
  const text = unetCopy[reportLanguage] ?? unetCopy.en;
  const [epochs, setEpochs] = useState("5");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnetResult | null>(null);
  const exportMutation = trpc.dataInsight.exportUnetClassification.useMutation();

  const run = async () => {
    setError("");
    setResult(null);
    const epochCount = Number(epochs);
    if (!Number.isInteger(epochCount) || epochCount < 1 || epochCount > 10) {
      setError(text.invalidEpochs);
      return;
    }
    if (!data) {
      setError(text.missing);
      return;
    }
    if (data.encoding !== "zlib-f32le-interleaved-features-then-u8-worldcover"
      || data.channels.length !== FEATURE_CHANNELS
      || data.width < 1 || data.height < 1) {
      setError(text.badData);
      return;
    }

    setRunning(true);
    let tf: typeof import("@tensorflow/tfjs") | undefined;
    let model: import("@tensorflow/tfjs").LayersModel | undefined;
    let allX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainY: import("@tensorflow/tfjs").Tensor4D | undefined;
    let testX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let prediction: import("@tensorflow/tfjs").Tensor | undefined;
    try {
      const { unzlibSync } = await import("fflate");
      tf = await import("@tensorflow/tfjs");
      await tf.setBackend("cpu");
      await tf.ready();
      const compressed = Uint8Array.from(atob(data.dataBase64), (character) => character.charCodeAt(0));
      const raw = unzlibSync(compressed);
      const featureByteCount = data.width * data.height * FEATURE_CHANNELS * 4;
      if (raw.length !== featureByteCount + data.width * data.height) throw new Error(text.badData);
      const featureView = new DataView(raw.buffer, raw.byteOffset, featureByteCount);
      const labelGrid = raw.subarray(featureByteCount);
      const gridFeature = (row: number, column: number, channel: number) =>
        featureView.getFloat32(((row * data.width + column) * FEATURE_CHANNELS + channel) * 4, true);

      const paddedWidth = Math.ceil(data.width / PATCH_SIZE) * PATCH_SIZE;
      const paddedHeight = Math.ceil(data.height / PATCH_SIZE) * PATCH_SIZE;
      const columns = paddedWidth / PATCH_SIZE;
      const rows = paddedHeight / PATCH_SIZE;
      const patches: Patch[] = [];
      for (let tileRow = 0; tileRow < rows; tileRow += 1) {
        for (let tileColumn = 0; tileColumn < columns; tileColumn += 1) {
          const values = new Float32Array(PATCH_SIZE * PATCH_SIZE * FEATURE_CHANNELS);
          const labels = new Uint8Array(PATCH_SIZE * PATCH_SIZE);
          const patchClasses = new Set<number>();
          let validPixels = 0;
          for (let row = 0; row < PATCH_SIZE; row += 1) {
            for (let column = 0; column < PATCH_SIZE; column += 1) {
              const globalRow = tileRow * PATCH_SIZE + row;
              const globalColumn = tileColumn * PATCH_SIZE + column;
              const pixel = row * PATCH_SIZE + column;
              if (globalRow >= data.height || globalColumn >= data.width) continue;
              const classCode = labelGrid[globalRow * data.width + globalColumn];
              labels[pixel] = classCode;
              if (classCode > 0 && data.classCodes.includes(classCode)) {
                patchClasses.add(classCode);
                validPixels += 1;
              }
              for (let channel = 0; channel < FEATURE_CHANNELS; channel += 1) {
                const value = gridFeature(globalRow, globalColumn, channel);
                values[pixel * FEATURE_CHANNELS + channel] = channel < 5
                  ? Math.min(1, Math.max(0, value))
                  : Math.min(1, Math.max(0, (value + 1) / 2));
              }
            }
          }
          patches.push({ values, labels, classCodes: patchClasses });
        }
      }

      const classCountByPatch = new Map<number, number>();
      data.classCodes.forEach((code) => classCountByPatch.set(code, 0));
      patches.forEach((patch) => patch.classCodes.forEach((code) => {
        classCountByPatch.set(code, (classCountByPatch.get(code) ?? 0) + 1);
      }));
      const usableClasses = data.classCodes.filter((code) => (classCountByPatch.get(code) ?? 0) >= 2);
      const candidatePatchIndices = patches.flatMap((patch, index) => patch.classCodes.size ? [index] : []);
      if (usableClasses.length < 2 || candidatePatchIndices.length < 4) throw new Error(text.unavailable);
      const legendByCode = new Map(classLegend.map((entry) => [entry.code, entry]));
      const classes = usableClasses.map((code) => ({
        code,
        name: legendByCode.get(code)?.name ?? String(code),
        color: legendByCode.get(code)?.color ?? "#94a3b8",
      }));

      const totalPatches = candidatePatchIndices;
      let split: { training: number[]; test: number[] } | null = null;
      let bestScore = -1;
      for (let attempt = 0; attempt < 120; attempt += 1) {
        const order = seededShuffle(totalPatches, 2026 + attempt);
        const testCount = Math.max(1, Math.ceil(candidatePatchIndices.length * 0.2));
        const test = order.slice(0, testCount);
        const training = order.slice(testCount);
        const trainingClasses = new Set(training.flatMap((index) => [...patches[index].classCodes]));
        const testClasses = new Set(test.flatMap((index) => [...patches[index].classCodes]));
        if (!usableClasses.every((code) => trainingClasses.has(code)) || testClasses.size < 2) continue;
        const score = usableClasses.filter((code) => testClasses.has(code)).length * 1_000_000
          + test.reduce((sum, index) => sum + patches[index].labels.filter((code) => usableClasses.includes(code)).length, 0);
        if (score > bestScore) {
          split = { training, test };
          bestScore = score;
        }
        if (testClasses.size === usableClasses.length) break;
      }
      if (!split) throw new Error(text.classCoverage);

      const classIndex = new Map(usableClasses.map((code, index) => [code, index]));
      const patchPixels = PATCH_SIZE * PATCH_SIZE;
      const trainingPixels = new Float32Array(split.training.length * patchPixels * FEATURE_CHANNELS);
      const trainingTargets = new Float32Array(split.training.length * patchPixels * usableClasses.length);
      const testPixels = new Float32Array(split.test.length * patchPixels * FEATURE_CHANNELS);
      split.training.forEach((patchIndex, sample) => {
        const patch = patches[patchIndex];
        trainingPixels.set(patch.values, sample * patch.values.length);
        patch.labels.forEach((code, pixel) => {
          const targetClass = classIndex.get(code);
          if (targetClass !== undefined) trainingTargets[(sample * patchPixels + pixel) * usableClasses.length + targetClass] = 1;
        });
      });
      split.test.forEach((patchIndex, sample) => testPixels.set(patches[patchIndex].values, sample * patches[patchIndex].values.length));
      const allPixels = new Float32Array(patches.length * patchPixels * FEATURE_CHANNELS);
      patches.forEach((patch, index) => allPixels.set(patch.values, index * patch.values.length));

      trainX = tf.tensor4d(trainingPixels, [split.training.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);
      trainY = tf.tensor4d(trainingTargets, [split.training.length, PATCH_SIZE, PATCH_SIZE, usableClasses.length]);
      testX = tf.tensor4d(testPixels, [split.test.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);
      allX = tf.tensor4d(allPixels, [patches.length, PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS]);

      const input = tf.input({ shape: [PATCH_SIZE, PATCH_SIZE, FEATURE_CHANNELS] });
      const encoder1 = tf.layers.conv2d({ filters: 16, kernelSize: 3, padding: "same", activation: "relu" }).apply(input) as import("@tensorflow/tfjs").SymbolicTensor;
      const pool1 = tf.layers.maxPooling2d({ poolSize: 2 }).apply(encoder1) as import("@tensorflow/tfjs").SymbolicTensor;
      const encoder2 = tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }).apply(pool1) as import("@tensorflow/tfjs").SymbolicTensor;
      const pool2 = tf.layers.maxPooling2d({ poolSize: 2 }).apply(encoder2) as import("@tensorflow/tfjs").SymbolicTensor;
      const bridge = tf.layers.conv2d({ filters: 64, kernelSize: 3, padding: "same", activation: "relu" }).apply(pool2) as import("@tensorflow/tfjs").SymbolicTensor;
      const up2 = tf.layers.upSampling2d({ size: [2, 2] }).apply(bridge) as import("@tensorflow/tfjs").SymbolicTensor;
      const merge2 = tf.layers.concatenate().apply([up2, encoder2]) as import("@tensorflow/tfjs").SymbolicTensor;
      const decoder2 = tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }).apply(merge2) as import("@tensorflow/tfjs").SymbolicTensor;
      const up1 = tf.layers.upSampling2d({ size: [2, 2] }).apply(decoder2) as import("@tensorflow/tfjs").SymbolicTensor;
      const merge1 = tf.layers.concatenate().apply([up1, encoder1]) as import("@tensorflow/tfjs").SymbolicTensor;
      const decoder1 = tf.layers.conv2d({ filters: 16, kernelSize: 3, padding: "same", activation: "relu" }).apply(merge1) as import("@tensorflow/tfjs").SymbolicTensor;
      const output = tf.layers.conv2d({ filters: usableClasses.length, kernelSize: 1, activation: "softmax" }).apply(decoder1) as import("@tensorflow/tfjs").SymbolicTensor;
      model = tf.model({ inputs: input, outputs: output });
      model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy" });
      await model.fit(trainX, trainY, {
        epochs: epochCount,
        batchSize: 2,
        shuffle: true,
        yieldEvery: "batch",
        callbacks: {
          onEpochEnd: (epoch, logs) => setProgress(text.progress(epoch + 1, epochCount, formatSentinelNumber(logs?.loss ?? 0, reportLanguage))),
        },
      });

      const testOutput = model.predict(testX);
      if (Array.isArray(testOutput)) throw new Error("Il modello U-Net ha restituito più output del previsto.");
      prediction = testOutput;
      const testPredictions = await prediction.data();
      const matrix = usableClasses.map(() => usableClasses.map(() => 0));
      let evaluatedPixels = 0;
      split.test.forEach((patchIndex, sample) => {
        patches[patchIndex].labels.forEach((code, pixel) => {
          const actualClass = classIndex.get(code);
          if (actualClass === undefined) return;
          let predictedClass = 0;
          let maxProbability = -1;
          const offset = (sample * patchPixels + pixel) * usableClasses.length;
          for (let classId = 0; classId < usableClasses.length; classId += 1) {
            if (testPredictions[offset + classId] > maxProbability) {
              maxProbability = testPredictions[offset + classId];
              predictedClass = classId;
            }
          }
          matrix[actualClass][predictedClass] += 1;
          evaluatedPixels += 1;
        });
      });
      if (evaluatedPixels === 0) throw new Error(text.unavailable);
      const perClass = usableClasses.map((code, index) => {
        const truePositive = matrix[index][index];
        const support = matrix[index].reduce((sum, value) => sum + value, 0);
        const predictedCount = matrix.reduce((sum, row) => sum + row[index], 0);
        const precision = predictedCount ? truePositive / predictedCount : 0;
        const recall = support ? truePositive / support : 0;
        return {
          code,
          precision,
          recall,
          f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
          support,
        };
      });
      const evaluatedClasses = perClass.filter((metric) => metric.support > 0);

      const allOutput = model.predict(allX);
      if (Array.isArray(allOutput)) throw new Error("Il modello U-Net ha restituito più output del previsto.");
      const allPredictions = await allOutput.data();
      allOutput.dispose();
      const canvas = document.createElement("canvas");
      canvas.width = data.width;
      canvas.height = data.height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas 2D non disponibile.");
      const image = context.createImageData(data.width, data.height);
      const predictedClassCodes = new Uint8Array(data.width * data.height);
      const palette = classes.map(({ color }) =>
        color.match(/[0-9a-f]{2}/gi)?.map((value) => parseInt(value, 16)) ?? [148, 163, 184],
      );
      patches.forEach((patch, patchIndex) => {
        const tileRow = Math.floor(patchIndex / columns);
        const tileColumn = patchIndex % columns;
        for (let pixel = 0; pixel < patchPixels; pixel += 1) {
          const row = tileRow * PATCH_SIZE + Math.floor(pixel / PATCH_SIZE);
          const column = tileColumn * PATCH_SIZE + pixel % PATCH_SIZE;
          if (row >= data.height || column >= data.width || patch.labels[pixel] === 0) continue;
          const offset = (patchIndex * patchPixels + pixel) * usableClasses.length;
          let bestClass = 0;
          for (let classId = 1; classId < usableClasses.length; classId += 1) {
            if (allPredictions[offset + classId] > allPredictions[offset + bestClass]) bestClass = classId;
          }
          predictedClassCodes[row * data.width + column] = usableClasses[bestClass];
          const color = palette[bestClass];
          const imageOffset = (row * data.width + column) * 4;
          image.data[imageOffset] = color[0];
          image.data[imageOffset + 1] = color[1];
          image.data[imageOffset + 2] = color[2];
          image.data[imageOffset + 3] = 255;
        }
      });
      context.putImageData(image, 0, 0);
      setResult({
        accuracy: matrix.reduce((sum, row, index) => sum + row[index], 0) / evaluatedPixels,
        balancedAccuracy: evaluatedClasses.reduce((sum, metric) => sum + metric.recall, 0) / evaluatedClasses.length,
        macroF1: evaluatedClasses.reduce((sum, metric) => sum + metric.f1, 0) / evaluatedClasses.length,
        testPixels: evaluatedPixels,
        classes,
        perClass,
        confusionMatrix: matrix,
        preview: canvas.toDataURL("image/png"),
        exportPayload: {
          width: data.width,
          height: data.height,
          classCodes: usableClasses,
          predictedClassCodesBase64: btoa(String.fromCharCode(...predictedClassCodes)),
          transform: data.transform,
          crs: data.crs,
          bbox: data.bbox,
          sceneId: data.sceneId,
        },
      });
      setProgress("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    } finally {
      prediction?.dispose();
      testX?.dispose();
      trainY?.dispose();
      trainX?.dispose();
      allX?.dispose();
      model?.dispose();
      setRunning(false);
    }
  };

  const downloadGeoTiff = async () => {
    if (!result) return;
    setError("");
    try {
      const exported = await exportMutation.mutateAsync(result.exportPayload);
      const bytes = Uint8Array.from(atob(exported.geoTiffBase64), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/tiff" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sentinel-2-unet-${result.exportPayload.sceneId.replace(/[^a-zA-Z0-9._-]/g, "_")}.tif`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset className="space-y-2 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">{text.labelTitle}</legend>
          <label className="flex items-center gap-2 text-sm"><input type="radio" checked disabled />{text.proxy}</label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="radio" disabled />{text.verified}</label>
          <p className="text-xs text-muted-foreground">{text.proxyNote}</p>
        </fieldset>
        {!data && <p className="text-sm text-muted-foreground">{text.missing}</p>}
        <label className="block max-w-xs space-y-2 text-sm font-medium">
          {text.epochs}
          <Input type="number" min="1" max="10" value={epochs} onChange={(event) => setEpochs(event.target.value)} />
        </label>
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {progress && <p aria-live="polite" className="text-sm text-muted-foreground">{progress}</p>}
        <Button onClick={run} disabled={running || !data}>
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.running}</> : <><Play className="mr-2 h-4 w-4" />{text.run}</>}
        </Button>
        {result && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                [text.accuracy, result.accuracy],
                [text.balanced, result.balancedAccuracy],
                [text.f1, result.macroF1],
                [text.testPixels, result.testPixels],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{typeof value === "number" && value <= 1 ? formatSentinelNumber(value, reportLanguage) : formatSentinelNumber(Number(value), reportLanguage, 0)}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-3">
                <h3 className="font-semibold">{text.preview}</h3>
                <img className="w-full rounded-lg border" src={result.preview} alt={text.preview} />
                <p className="text-xs text-muted-foreground">{text.note}</p>
                <Button onClick={downloadGeoTiff} disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {text.download}
                </Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">{text.matrix}</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="text-xs">
                    <thead className="bg-muted/50"><tr><th className="p-2 text-left">{text.actual}</th>{result.classes.map((item) => <th key={item.code} className="min-w-16 p-2">{item.name}</th>)}</tr></thead>
                    <tbody>{result.confusionMatrix.map((row, index) => <tr key={result.classes[index].code} className="border-t"><th className="p-2 text-left">{result.classes[index].name}</th>{row.map((count, column) => <td key={result.classes[column].code} className="p-2 text-center">{formatSentinelNumber(count, reportLanguage, 0)}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left"><tr><th className="p-3">{text.class}</th><th className="p-3">{text.precision}</th><th className="p-3">{text.recall}</th><th className="p-3">F1</th><th className="p-3">{text.support}</th></tr></thead>
                    <tbody>{result.perClass.map((metric) => <tr key={metric.code} className="border-t"><td className="p-3">{result.classes.find((item) => item.code === metric.code)?.name}</td><td className="p-3">{formatSentinelNumber(metric.precision, reportLanguage)}</td><td className="p-3">{formatSentinelNumber(metric.recall, reportLanguage)}</td><td className="p-3">{formatSentinelNumber(metric.f1, reportLanguage)}</td><td className="p-3">{formatSentinelNumber(metric.support, reportLanguage, 0)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
