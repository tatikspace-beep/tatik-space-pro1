import { useMemo, useState } from "react";
import {
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
  Map,
  Satellite,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { DataInsightSources } from "@/components/DataInsightSources";
import {
  AnalyticsReportDownload,
  AnalyticsUsageNotice,
} from "@/components/AnalyticsReportDownload";
import { AoiUnet } from "@/components/AoiUnet";
import { EuroSatCnn } from "@/components/EuroSatCnn";
import { Seo } from "@/components/Seo";
import {
  type ReportLanguage,
  formatSentinelNumber,
  localizeSentinelLimitation,
  localizeSentinelMapModelName,
  localizeSentinelModelName,
  localizeSentinelReferenceMeaning,
  localizeSentinelStepMessage,
  localizeSentinelWorldCoverName,
  normalizeSentinelReportLanguage,
} from "@/lib/sentinelReportLocalization";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import type {
  AnalyticsReportConclusion,
  AnalyticsReportLanguage,
  AnalyticsReportVisual,
} from "@/lib/analyticsReportPdf";
import { resolveAnalyticsReportLanguage } from "@/lib/analyticsReportPdf";
import type { SentinelAoiJob } from "../../../server/data-insight";

const copy = {
  it: {
    title: "Telerilevamento e Machine Learning",
    description:
      "Analizza scene Sentinel-2 L2A, confronta classificatori e genera una mappa GeoTIFF per la tua area di studio.",
    intro:
      "Workflow geospaziale riproducibile con Sentinel-2 L2A, maschera nuvole SCL, indici spettrali, confronto Random Forest/SVM e mappa tematica a 10 metri.",
    bbox: "Area di studio WGS84 (ovest, sud, est, nord)",
    start: "Data iniziale",
    end: "Data finale",
    clouds: "Copertura nuvolosa massima (%)",
    mapModelLabel: "Modello che genera la mappa",
    randomForest: "Random Forest",
    svm: "SVM lineare",
    samplesPerClass: "Campioni massimi per classe",
    spatialBlock: "Dimensione del blocco di validazione",
    selectedClasses: "Classi da includere",
    metricsToShow: "Metriche da mostrare",
    prepareUnet:
      "Prepara dati per U-Net (Sentinel-2 + etichette proxy WorldCover)",
    prepareUnetNote:
      "Trasferisce al browser una griglia campionata e compressa (massimo 128×128); non salva i dati.",
    workflowTitle: "Workflow Sentinel-2 L2A",
    selectClassError: "Seleziona almeno una classe WorldCover.",
    samplesError: "Inserisci un numero di campioni per classe tra 100 e 2000.",
    accuracyMetric: "Accuratezza",
    selectMetricError: "Seleziona almeno una metrica da mostrare.",
    sceneClouds: "nuvole",
    balancedAccuracy: "accuratezza bilanciata",
    macroF1: "F1 macro",
    kappa: "Kappa di Cohen",
    run: "Avvia analisi Sentinel-2",
    signIn: "Accedi per avviare l'elaborazione.",
    signInLink: "Accedi",
    running: "Elaborazione in corso…",
    loading: "Elaborazione in corso…",
    reference:
      "La valutazione misura l'accordo con ESA WorldCover 2021, non l'accuratezza rispetto a rilievi a terra indipendenti. Verifica la mappa in GIS prima di qualsiasi uso operativo o scientifico.",
    result: "Risultato dell'elaborazione",
    reportTitle: "Rapporto tecnico ML",
    reportDescription:
      "Confronto riproducibile su blocchi spaziali esclusi dall'addestramento.",
    scene: "Scena",
    accuracy: "Accordo spaziale con WorldCover",
    mapDownload: "Scarica GeoTIFF a colori",
    mapBandNote:
      "GeoTIFF standard a 4 bande RGBA per visualizzare i colori nei viewer comuni; legenda classi disponibile nel rapporto.",
    mapModel: "Modello esportato",
    bands: "bande",
    indices: "indici",
    mapComparison: "Il confronto RF/SVM usa gli stessi campioni di test.",
    macroWinner: (name: string) =>
      `F1 macro più alta nel test spaziale: ${name}. Non equivale a verifica sul terreno.`,
    opinionTitle: "Valutazione tecnica orientativa (automatica)",
    opinionSummary: (
      winner: string,
      winnerF1: string,
      other: string,
      otherF1: string
    ) =>
      `Sul test spaziale, ${winner} ottiene macro F1 ${winnerF1} contro ${other} (${otherF1}); nel campione e nell'area valutati mostra quindi un accordo maggiore con il riferimento.`,
    opinionReference:
      "Le etichette di confronto provengono da ESA WorldCover 2021 e non sono rilievi a terra indipendenti: le metriche non dimostrano l'accuratezza assoluta della mappa.",
    opinionRecommendation:
      "La mappa è adatta a un'esplorazione preliminare, non è sufficiente da sola per decisioni operative o scientifiche. Prima dell'uso, verifica in GIS e confronta con dati indipendenti dell'area.",
    opinionDisclaimer:
      "Sintesi automatizzata basata sui risultati mostrati; non è una perizia firmata né una certificazione professionale.",
    classMetricsTitle: "Prestazioni per classe",
    className: "Classe",
    precision: "Precisione",
    recall: "Richiamo",
    f1: "F1",
    support: "Campioni test",
    confusionTitle: "Matrice di confusione — Random Forest",
    confusionDescription:
      "Righe: classe di riferimento · colonne: classe predetta",
    predicted: "Predetta",
    referenceLabel: "Riferimento",
    featureTitle: "Importanza relativa delle variabili",
    featureDescription:
      "RF: importanza basata sull'impurità; SVM: coefficienti assoluti medi della LinearSVC standardizzata. Valori descrittivi, non causali.",
    areaTitle: "Superficie classificata",
    areaHa: "Area (ha)",
    methodTitle: "Metodo e campioni",
    sampleCounts: (training: number, test: number, block: number) =>
      `${training} campioni di training · ${test} di test · blocchi spaziali da ${block} m.`,
    deepLearningNote:
      "Il benchmark CNN EuroSAT è separato dalla mappa AOI. La U-Net può essere addestrata qui con etichette proxy WorldCover; non sono rilievi a terra indipendenti.",
    downloadError: "Download mappa non riuscito.",
    failed: "Elaborazione non riuscita",
    sourcesTitle: "Fonti e cataloghi del workflow",
    sourcesDescription:
      "Il workflow cerca le scene Sentinel-2 nel catalogo STAC Earth Search e usa ESA WorldCover 2021 come riferimento per addestramento e validazione.",
    sources: [
      {
        label: "Catalogo STAC Sentinel-2 usato dal workflow",
        url: "https://earth-search.aws.element84.com/v1",
      },
      {
        label: "Copernicus Sentinel-2 · fonte ufficiale",
        url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2",
      },
      {
        label: "Copernicus Browser · esplora immagini Sentinel",
        url: "https://browser.dataspace.copernicus.eu/",
      },
      {
        label: "ESA WorldCover · dati e accesso",
        url: "https://esa-worldcover.org/en/data-access",
      },
      {
        label: "Random Forest · documentazione scikit-learn",
        url: "https://scikit-learn.org/stable/modules/ensemble.html#forest",
      },
      {
        label: "SVM · documentazione scikit-learn",
        url: "https://scikit-learn.org/stable/modules/svm.html",
      },
    ],
    portal: "Esplora fonti e dataset correlati",
    portalLink: "Apri Analisi dati",
  },
  en: {
    title: "Remote sensing & Machine Learning",
    description:
      "Analyze Sentinel-2 L2A scenes, compare classifiers and produce a GeoTIFF map for your area of interest.",
    intro:
      "Reproducible geospatial workflow using Sentinel-2 L2A, SCL cloud masking, spectral indices, Random Forest/SVM comparison and a 10-meter thematic map.",
    bbox: "WGS84 area of interest (west, south, east, north)",
    start: "Start date",
    end: "End date",
    clouds: "Maximum cloud cover (%)",
    mapModelLabel: "Model used to create the map",
    randomForest: "Random Forest",
    svm: "Linear SVM",
    samplesPerClass: "Maximum samples per class",
    spatialBlock: "Validation block size",
    selectedClasses: "Classes to include",
    metricsToShow: "Metrics to display",
    prepareUnet: "Prepare U-Net data (Sentinel-2 + WorldCover proxy labels)",
    prepareUnetNote:
      "Transfers a sampled, compressed grid to the browser (maximum 128×128); the data is not stored.",
    workflowTitle: "Sentinel-2 L2A workflow",
    selectClassError: "Select at least one WorldCover class.",
    samplesError: "Enter a sample count between 100 and 2000 per class.",
    accuracyMetric: "Accuracy",
    selectMetricError: "Select at least one metric to display.",
    sceneClouds: "cloud cover",
    balancedAccuracy: "balanced accuracy",
    macroF1: "macro F1",
    kappa: "Cohen's kappa",
    run: "Run Sentinel-2 analysis",
    signIn: "Sign in to start processing.",
    signInLink: "Sign in",
    running: "Processing…",
    loading: "Processing…",
    reference:
      "Evaluation measures agreement with ESA WorldCover 2021, not accuracy against independent ground surveys. Review the map in GIS before operational or scientific use.",
    result: "Processing result",
    reportTitle: "ML technical report",
    reportDescription:
      "Reproducible comparison on spatial blocks held out from training.",
    scene: "Scene",
    accuracy: "Spatial agreement with WorldCover",
    mapDownload: "Download color GeoTIFF",
    mapBandNote:
      "Standard 4-band RGBA GeoTIFF for color display in common viewers; the class legend is in the report.",
    mapModel: "Exported model",
    bands: "bands",
    indices: "indices",
    mapComparison: "RF/SVM comparison uses the same held-out samples.",
    macroWinner: (name: string) =>
      `Highest macro F1 on the spatial test: ${name}. This is not field validation.`,
    opinionTitle: "Automated technical assessment",
    opinionSummary: (
      winner: string,
      winnerF1: string,
      other: string,
      otherF1: string
    ) =>
      `On the spatial test, ${winner} scores macro F1 ${winnerF1} versus ${other} (${otherF1}); it therefore agrees more closely with the reference in the evaluated sample and area.`,
    opinionReference:
      "The reference labels come from ESA WorldCover 2021, not independent ground surveys; these metrics do not establish the map's absolute accuracy.",
    opinionRecommendation:
      "The map is suitable for preliminary exploration, not for operational or scientific decisions by itself. Review it in GIS and compare it with independent data from the area before use.",
    opinionDisclaimer:
      "Automated summary based on the displayed results; it is not a signed expert opinion or professional certification.",
    classMetricsTitle: "Per-class performance",
    className: "Class",
    precision: "Precision",
    recall: "Recall",
    f1: "F1",
    support: "Test samples",
    confusionTitle: "Confusion matrix — Random Forest",
    confusionDescription: "Rows: reference class · columns: predicted class",
    predicted: "Predicted",
    referenceLabel: "Reference",
    featureTitle: "Relative feature importance",
    featureDescription:
      "RF: impurity-based importance; SVM: mean absolute coefficients from standardized LinearSVC. Descriptive, not causal.",
    areaTitle: "Classified area",
    areaHa: "Area (ha)",
    methodTitle: "Method and samples",
    sampleCounts: (training: number, test: number, block: number) =>
      `${training} training samples · ${test} test samples · ${block} m spatial blocks.`,
    deepLearningNote:
      "The EuroSAT CNN benchmark is separate from the AOI map. U-Net can be trained here with WorldCover proxy labels; these are not independent ground surveys.",
    downloadError: "Map download failed.",
    failed: "Processing failed",
    sourcesTitle: "Workflow sources and catalogs",
    sourcesDescription:
      "The workflow searches Sentinel-2 scenes in the Earth Search STAC catalog and uses ESA WorldCover 2021 as a training and validation reference.",
    sources: [
      {
        label: "Sentinel-2 STAC catalog used by the workflow",
        url: "https://earth-search.aws.element84.com/v1",
      },
      {
        label: "Copernicus Sentinel-2 · official source",
        url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2",
      },
      {
        label: "Copernicus Browser · explore Sentinel imagery",
        url: "https://browser.dataspace.copernicus.eu/",
      },
      {
        label: "ESA WorldCover · data access",
        url: "https://esa-worldcover.org/en/data-access",
      },
      {
        label: "Random Forest · scikit-learn documentation",
        url: "https://scikit-learn.org/stable/modules/ensemble.html#forest",
      },
      {
        label: "SVM · scikit-learn documentation",
        url: "https://scikit-learn.org/stable/modules/svm.html",
      },
    ],
    portal: "Explore related sources and datasets",
    portalLink: "Open Data analysis",
  },
};

const pageCopy: Record<ReportLanguage, typeof copy.en> = {
  ...copy,
  es: {
    ...copy.en,
    title: "Teledetección y aprendizaje automático",
    description: "Analiza escenas Sentinel-2 L2A, compara clasificadores y genera un GeoTIFF para tu área de estudio.",
    intro: "Flujo geoespacial reproducible con Sentinel-2 L2A, máscara de nubes SCL, índices espectrales, comparación Random Forest/SVM y mapa temático de 10 metros.",
    bbox: "Área de estudio WGS84 (oeste, sur, este, norte)",
    start: "Fecha inicial", end: "Fecha final", clouds: "Cobertura máxima de nubes (%)",
    mapModelLabel: "Modelo que genera el mapa", randomForest: "Random Forest", svm: "SVM lineal",
    samplesPerClass: "Muestras máximas por clase", spatialBlock: "Tamaño del bloque de validación",
    selectedClasses: "Clases que incluir", metricsToShow: "Métricas que mostrar",
    prepareUnet: "Preparar datos U-Net (Sentinel-2 + etiquetas proxy WorldCover)",
    prepareUnetNote: "Transfiere al navegador una cuadrícula comprimida y muestreada (máximo 128×128); los datos no se guardan.",
    workflowTitle: "Flujo de trabajo Sentinel-2 L2A",
    selectClassError: "Selecciona al menos una clase de WorldCover.",
    samplesError: "Introduce entre 100 y 2.000 muestras por clase.",
    accuracyMetric: "Exactitud",
    selectMetricError: "Selecciona al menos una métrica para mostrar.",
    sceneClouds: "cobertura de nubes",
    balancedAccuracy: "Exactitud equilibrada",
    macroF1: "F1 macro",
    kappa: "Kappa de Cohen",
    run: "Iniciar análisis Sentinel-2", signIn: "Inicia sesión para comenzar.", signInLink: "Iniciar sesión",
    running: "Procesando…", loading: "Procesando…",
    reference: "La evaluación mide la coincidencia con ESA WorldCover 2021, no la precisión frente a mediciones independientes sobre el terreno.",
    result: "Resultado del procesamiento", reportTitle: "Informe técnico de ML",
    reportDescription: "Comparación reproducible en bloques espaciales excluidos del entrenamiento.",
    scene: "Escena", accuracy: "Coincidencia espacial con WorldCover",
    mapDownload: "Descargar GeoTIFF en color", mapBandNote: "GeoTIFF RGBA estándar de 4 bandas para mostrar colores; la leyenda de clases está en el informe.",
    mapModel: "Modelo exportado", bands: "bandas", indices: "índices",
    mapComparison: "La comparación RF/SVM utiliza las mismas muestras de prueba.",
    macroWinner: (name: string) => `F1 macro más alto en la prueba espacial: ${name}. No equivale a una validación de campo.`,
    opinionTitle: "Evaluación técnica automatizada",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `En la prueba espacial, ${winner} obtiene F1 macro ${winnerF1} frente a ${other} (${otherF1}); por tanto, coincide mejor con la referencia en la muestra y el área evaluadas.`,
    opinionReference: "Las etiquetas de referencia proceden de ESA WorldCover 2021, no de mediciones independientes sobre el terreno; estas métricas no determinan la precisión absoluta del mapa.",
    opinionRecommendation: "El mapa sirve para una exploración preliminar, pero no basta por sí solo para tomar decisiones operativas o científicas. Revísalo en un SIG y compáralo con datos independientes del área antes de usarlo.",
    opinionDisclaimer: "Resumen automatizado basado en los resultados mostrados; no es un dictamen experto firmado ni una certificación profesional.",
    classMetricsTitle: "Rendimiento por clase", className: "Clase", precision: "Precisión", recall: "Exhaustividad", f1: "F1", support: "Muestras de prueba",
    areaTitle: "Superficie clasificada", areaHa: "Área (ha)", methodTitle: "Método y muestras",
    sampleCounts: (training: number, test: number, block: number) => `${training} muestras de entrenamiento · ${test} de prueba · bloques espaciales de ${block} m.`,
    confusionTitle: "Matriz de confusión — Random Forest",
    confusionDescription: "Filas: clase de referencia · columnas: clase predicha",
    predicted: "Predicha", referenceLabel: "Referencia",
    featureTitle: "Importancia relativa de las variables",
    featureDescription: "RF: importancia basada en la impureza; SVM: coeficientes absolutos medios de LinearSVC estandarizada. Son valores descriptivos, no causales.",
    deepLearningNote: "El benchmark CNN EuroSAT es independiente del mapa AOI. Aquí se puede entrenar U-Net con etiquetas proxy de WorldCover; no son mediciones independientes sobre el terreno.",
    sourcesTitle: "Fuentes y catálogos del flujo de trabajo",
    sourcesDescription: "El flujo busca escenas Sentinel-2 en el catálogo STAC Earth Search y utiliza ESA WorldCover 2021 como referencia para el entrenamiento y la validación.",
    sources: [
      { label: "Catálogo STAC Sentinel-2 utilizado por el flujo", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · fuente oficial", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · explorar imágenes Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · acceso a los datos", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · documentación de scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · documentación de scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Explorar fuentes y conjuntos de datos relacionados",
    portalLink: "Abrir análisis de datos",
    failed: "El procesamiento falló", downloadError: "No se pudo descargar el mapa.",
  },
  ru: {
    ...copy.en,
    title: "Дистанционное зондирование и машинное обучение",
    description: "Анализируйте сцены Sentinel-2 L2A, сравнивайте классификаторы и создавайте GeoTIFF для вашей области.",
    intro: "Воспроизводимый геопространственный процесс: Sentinel-2 L2A, маска облачности SCL, спектральные индексы, сравнение Random Forest/SVM и тематическая карта 10 метров.",
    bbox: "Область исследования WGS84 (запад, юг, восток, север)",
    start: "Дата начала", end: "Дата окончания", clouds: "Максимальная облачность (%)",
    mapModelLabel: "Модель создания карты", randomForest: "Случайный лес", svm: "Линейный SVM",
    samplesPerClass: "Максимум выборок на класс", spatialBlock: "Размер блока проверки",
    selectedClasses: "Классы для включения", metricsToShow: "Показываемые метрики",
    prepareUnet: "Подготовить данные U-Net (Sentinel-2 + прокси-метки WorldCover)",
    prepareUnetNote: "В браузер передаётся сжатая выборочная сетка (не более 128×128); данные не сохраняются.",
    workflowTitle: "Обработка данных Sentinel-2 L2A",
    selectClassError: "Выберите хотя бы один класс WorldCover.",
    samplesError: "Укажите от 100 до 2000 выборок на класс.",
    accuracyMetric: "Точность",
    selectMetricError: "Выберите хотя бы одну метрику для отображения.",
    sceneClouds: "облачность",
    balancedAccuracy: "Сбалансированная точность",
    macroF1: "Макро F1",
    kappa: "Каппа Коэна",
    run: "Запустить анализ Sentinel-2", signIn: "Войдите, чтобы начать обработку.", signInLink: "Войти",
    running: "Обработка…", loading: "Обработка…",
    reference: "Оценка измеряет согласие с ESA WorldCover 2021, а не точность относительно независимых наземных измерений.",
    result: "Результат обработки", reportTitle: "Технический отчёт ML",
    reportDescription: "Воспроизводимое сравнение на пространственных блоках, исключённых из обучения.",
    scene: "Сцена", accuracy: "Пространственное согласие с WorldCover",
    mapDownload: "Скачать цветной GeoTIFF",
    mapBandNote: "Стандартный четырёхканальный GeoTIFF RGBA для отображения цветов; легенда классов приведена в отчёте.",
    mapModel: "Экспортированная модель", bands: "каналы", indices: "индексы",
    mapComparison: "Сравнение RF/SVM использует одни и те же тестовые выборки.",
    macroWinner: (name: string) => `Наивысшее макро F1 в пространственном тесте: ${name}. Это не полевая проверка.`,
    opinionTitle: "Автоматизированная техническая оценка",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `В пространственном тесте ${winner} получил макро F1 ${winnerF1} против ${other} (${otherF1}); на проверенной выборке он лучше согласуется с эталоном.`,
    opinionReference: "Эталонные метки взяты из ESA WorldCover 2021, а не из независимых наземных наблюдений; эти метрики не подтверждают абсолютную точность карты.",
    opinionRecommendation: "Карта подходит для предварительного изучения, но её недостаточно для практических или научных решений. Перед использованием проверьте её в ГИС и сравните с независимыми данными местности.",
    opinionDisclaimer: "Автоматическое резюме на основе показанных результатов; это не подписанное экспертное заключение и не профессиональная сертификация.",
    classMetricsTitle: "Результаты по классам", className: "Класс", precision: "Точность", recall: "Полнота", f1: "F1", support: "Тестовые выборки",
    areaTitle: "Классифицированная площадь", areaHa: "Площадь (га)", methodTitle: "Метод и выборки",
    sampleCounts: (training: number, test: number, block: number) => `${training} обучающих выборок · ${test} тестовых · пространственные блоки ${block} м.`,
    confusionTitle: "Матрица ошибок — Random Forest",
    confusionDescription: "Строки: эталонный класс · столбцы: предсказанный класс",
    predicted: "Предсказанный", referenceLabel: "Эталон",
    featureTitle: "Относительная важность признаков",
    featureDescription: "RF: важность на основе неоднородности; SVM: средние абсолютные коэффициенты стандартизированной LinearSVC. Это описательные, а не причинные показатели.",
    deepLearningNote: "Тест CNN EuroSAT выполняется отдельно от карты AOI. Здесь можно обучить U-Net на прокси-метках WorldCover; это не независимые наземные наблюдения.",
    failed: "Обработка не выполнена", downloadError: "Не удалось скачать карту.",
    sourcesTitle: "Источники и каталоги рабочего процесса",
    sourcesDescription: "Рабочий процесс ищет сцены Sentinel-2 в каталоге Earth Search STAC и использует ESA WorldCover 2021 в качестве обучающей и контрольной выборки.",
    sources: [
      { label: "Каталог STAC Sentinel-2, используемый в обработке", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · официальный источник", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · просмотр снимков Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · доступ к данным", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · документация scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · документация scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Связанные источники и наборы данных",
    portalLink: "Открыть анализ данных",
  },
  fr: {
    ...copy.en,
    title: "Télédétection et apprentissage automatique",
    description: "Analysez des scènes Sentinel-2 L2A, comparez des classificateurs et créez une carte GeoTIFF pour votre zone d’étude.",
    intro: "Flux géospatial reproductible : Sentinel-2 L2A, masque des nuages SCL, indices spectraux, comparaison Random Forest/SVM et carte thématique à 10 mètres.",
    bbox: "Zone d’étude WGS84 (ouest, sud, est, nord)",
    start: "Date de début", end: "Date de fin", clouds: "Couverture nuageuse maximale (%)",
    mapModelLabel: "Modèle utilisé pour créer la carte", randomForest: "Random Forest", svm: "SVM linéaire",
    samplesPerClass: "Nombre maximal d’échantillons par classe", spatialBlock: "Taille du bloc de validation",
    selectedClasses: "Classes à inclure", metricsToShow: "Métriques à afficher",
    prepareUnet: "Préparer les données U-Net (Sentinel-2 + étiquettes proxy WorldCover)",
    prepareUnetNote: "Transfère au navigateur une grille compressée et échantillonnée (128×128 maximum) ; les données ne sont pas enregistrées.",
    workflowTitle: "Flux de travail Sentinel-2 L2A",
    selectClassError: "Sélectionnez au moins une classe WorldCover.",
    samplesError: "Saisissez entre 100 et 2 000 échantillons par classe.",
    accuracyMetric: "Exactitude", selectMetricError: "Sélectionnez au moins une métrique à afficher.",
    sceneClouds: "couverture nuageuse", balancedAccuracy: "exactitude équilibrée", macroF1: "F1 macro", kappa: "Kappa de Cohen",
    run: "Lancer l’analyse Sentinel-2", signIn: "Connectez-vous pour lancer le traitement.", signInLink: "Se connecter",
    running: "Traitement en cours…", loading: "Chargement…",
    reference: "L’évaluation mesure l’accord avec ESA WorldCover 2021, et non l’exactitude par rapport à des relevés indépendants sur le terrain. Vérifiez la carte dans un SIG avant tout usage opérationnel ou scientifique.",
    result: "Résultat du traitement", reportTitle: "Rapport technique ML",
    reportDescription: "Comparaison reproductible sur des blocs spatiaux exclus de l’entraînement.",
    scene: "Scène", accuracy: "Accord spatial avec WorldCover",
    mapDownload: "Télécharger le GeoTIFF en couleurs",
    mapBandNote: "GeoTIFF RGBA standard à 4 bandes pour afficher les couleurs dans les visionneuses courantes ; la légende des classes figure dans le rapport.",
    mapModel: "Modèle exporté", bands: "bandes", indices: "indices",
    mapComparison: "La comparaison RF/SVM utilise les mêmes échantillons de test.",
    macroWinner: (name: string) => `F1 macro la plus élevée au test spatial : ${name}. Il ne s’agit pas d’une validation sur le terrain.`,
    opinionTitle: "Évaluation technique automatisée",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `Au test spatial, ${winner} obtient un F1 macro de ${winnerF1}, contre ${other} (${otherF1}) ; il correspond donc mieux à la référence dans l’échantillon et la zone évalués.`,
    opinionReference: "Les étiquettes de référence proviennent d’ESA WorldCover 2021, et non de relevés indépendants sur le terrain ; ces métriques n’établissent pas l’exactitude absolue de la carte.",
    opinionRecommendation: "La carte convient à une exploration préliminaire, mais ne suffit pas à elle seule pour prendre des décisions opérationnelles ou scientifiques. Avant de l’utiliser, vérifiez-la dans un SIG et comparez-la à des données indépendantes de la zone.",
    opinionDisclaimer: "Synthèse automatisée fondée sur les résultats affichés ; il ne s’agit ni d’un avis d’expert signé ni d’une certification professionnelle.",
    classMetricsTitle: "Résultats par classe", className: "Classe", precision: "Précision", recall: "Rappel", f1: "F1", support: "Échantillons de test",
    confusionTitle: "Matrice de confusion — Random Forest",
    confusionDescription: "Lignes : classe de référence · colonnes : classe prédite",
    predicted: "Prédite", referenceLabel: "Référence",
    featureTitle: "Importance relative des variables",
    featureDescription: "RF : importance fondée sur l’impureté ; SVM : moyenne des coefficients absolus de LinearSVC standardisée. Ces valeurs sont descriptives, pas causales.",
    areaTitle: "Surface classée", areaHa: "Surface (ha)", methodTitle: "Méthode et échantillons",
    sampleCounts: (training: number, test: number, block: number) => `${training} échantillons d’entraînement · ${test} de test · blocs spatiaux de ${block} m.`,
    deepLearningNote: "Le test CNN EuroSAT est distinct de la carte AOI. U-Net peut être entraîné ici avec les étiquettes proxy WorldCover ; celles-ci ne sont pas des relevés indépendants sur le terrain.",
    downloadError: "Échec du téléchargement de la carte.", failed: "Échec du traitement",
    sourcesTitle: "Sources et catalogues du flux de travail",
    sourcesDescription: "Le flux recherche des scènes Sentinel-2 dans le catalogue STAC Earth Search et utilise ESA WorldCover 2021 comme référence d’entraînement et de validation.",
    sources: [
      { label: "Catalogue STAC Sentinel-2 utilisé par le flux", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · source officielle", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · explorer les images Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · accès aux données", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · documentation scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · documentation scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Explorer les sources et jeux de données associés", portalLink: "Ouvrir l’analyse des données",
  },
  de: {
    ...copy.en,
    title: "Fernerkundung und maschinelles Lernen",
    description: "Analysieren Sie Sentinel-2-L2A-Szenen, vergleichen Sie Klassifikatoren und erstellen Sie eine GeoTIFF-Karte für Ihr Untersuchungsgebiet.",
    intro: "Reproduzierbarer Geodaten-Workflow mit Sentinel-2 L2A, SCL-Wolkenmaske, Spektralindizes, Vergleich von Random Forest/SVM und einer thematischen Karte mit 10 Metern Auflösung.",
    bbox: "Untersuchungsgebiet WGS84 (West, Süd, Ost, Nord)",
    start: "Startdatum", end: "Enddatum", clouds: "Maximale Wolkenbedeckung (%)",
    mapModelLabel: "Modell zur Kartenerstellung", randomForest: "Random Forest", svm: "Lineare SVM",
    samplesPerClass: "Maximale Stichproben pro Klasse", spatialBlock: "Größe des Validierungsblocks",
    selectedClasses: "Einzuschließende Klassen", metricsToShow: "Anzuzeigende Kennzahlen",
    prepareUnet: "U-Net-Daten vorbereiten (Sentinel-2 + WorldCover-Proxy-Labels)",
    prepareUnetNote: "Überträgt ein komprimiertes Stichprobenraster (maximal 128×128) an den Browser; die Daten werden nicht gespeichert.",
    workflowTitle: "Sentinel-2-L2A-Workflow",
    selectClassError: "Wählen Sie mindestens eine WorldCover-Klasse aus.",
    samplesError: "Geben Sie 100 bis 2.000 Stichproben pro Klasse ein.",
    accuracyMetric: "Genauigkeit", selectMetricError: "Wählen Sie mindestens eine anzuzeigende Kennzahl aus.",
    sceneClouds: "Wolkenbedeckung", balancedAccuracy: "Ausgewogene Genauigkeit", macroF1: "Makro-F1", kappa: "Cohens Kappa",
    run: "Sentinel-2-Analyse starten", signIn: "Melden Sie sich an, um die Verarbeitung zu starten.", signInLink: "Anmelden",
    running: "Verarbeitung läuft…", loading: "Wird geladen…",
    reference: "Die Auswertung misst die Übereinstimmung mit ESA WorldCover 2021, nicht die Genauigkeit gegenüber unabhängigen Geländemessungen. Prüfen Sie die Karte vor einer operativen oder wissenschaftlichen Nutzung in einem GIS.",
    result: "Verarbeitungsergebnis", reportTitle: "Technischer ML-Bericht",
    reportDescription: "Reproduzierbarer Vergleich auf räumlichen Blöcken, die vom Training ausgeschlossen wurden.",
    scene: "Szene", accuracy: "Räumliche Übereinstimmung mit WorldCover",
    mapDownload: "Farb-GeoTIFF herunterladen",
    mapBandNote: "Standard-GeoTIFF mit vier RGBA-Bändern zur Farbdarstellung in gängigen Viewern; die Klassenlegende steht im Bericht.",
    mapModel: "Exportiertes Modell", bands: "Bänder", indices: "Indizes",
    mapComparison: "Der RF/SVM-Vergleich verwendet dieselben zurückgehaltenen Stichproben.",
    macroWinner: (name: string) => `Höchster Makro-F1-Wert im räumlichen Test: ${name}. Dies ist keine Validierung im Gelände.`,
    opinionTitle: "Automatisierte technische Bewertung",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `Im räumlichen Test erreicht ${winner} einen Makro-F1-Wert von ${winnerF1} gegenüber ${other} (${otherF1}); im geprüften Gebiet stimmt das Modell daher besser mit der Referenz überein.`,
    opinionReference: "Die Referenzlabels stammen aus ESA WorldCover 2021 und nicht aus unabhängigen Geländemessungen; diese Kennzahlen belegen nicht die absolute Genauigkeit der Karte.",
    opinionRecommendation: "Die Karte eignet sich zur vorläufigen Erkundung, reicht allein jedoch nicht für operative oder wissenschaftliche Entscheidungen. Prüfen Sie sie vor der Nutzung in einem GIS und vergleichen Sie sie mit unabhängigen Daten aus dem Gebiet.",
    opinionDisclaimer: "Automatische Zusammenfassung der angezeigten Ergebnisse; kein unterzeichnetes Gutachten und keine professionelle Zertifizierung.",
    classMetricsTitle: "Leistung nach Klasse", className: "Klasse", precision: "Präzision", recall: "Trefferquote", f1: "F1", support: "Teststichproben",
    confusionTitle: "Konfusionsmatrix — Random Forest",
    confusionDescription: "Zeilen: Referenzklasse · Spalten: vorhergesagte Klasse",
    predicted: "Vorhergesagt", referenceLabel: "Referenz",
    featureTitle: "Relative Merkmalswichtigkeit",
    featureDescription: "RF: auf Unreinheit basierende Wichtigkeit; SVM: mittlere absolute Koeffizienten der standardisierten LinearSVC. Beschreibende, keine kausalen Werte.",
    areaTitle: "Klassifizierte Fläche", areaHa: "Fläche (ha)", methodTitle: "Methode und Stichproben",
    sampleCounts: (training: number, test: number, block: number) => `${training} Trainingsstichproben · ${test} Teststichproben · räumliche Blöcke von ${block} m.`,
    deepLearningNote: "Der EuroSAT-CNN-Test ist von der AOI-Karte getrennt. U-Net kann hier mit WorldCover-Proxy-Labels trainiert werden; diese sind keine unabhängigen Geländemessungen.",
    downloadError: "Karte konnte nicht heruntergeladen werden.", failed: "Verarbeitung fehlgeschlagen",
    sourcesTitle: "Quellen und Kataloge des Workflows",
    sourcesDescription: "Der Workflow sucht Sentinel-2-Szenen im Earth-Search-STAC-Katalog und verwendet ESA WorldCover 2021 als Trainings- und Validierungsreferenz.",
    sources: [
      { label: "Vom Workflow verwendeter Sentinel-2-STAC-Katalog", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · offizielle Quelle", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · Sentinel-Aufnahmen erkunden", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · Datenzugriff", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-Dokumentation", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-Dokumentation", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Verwandte Quellen und Datensätze erkunden", portalLink: "Datenanalyse öffnen",
  },
  pt: {
    ...copy.en,
    title: "Deteção remota e aprendizagem automática",
    description: "Analise cenas Sentinel-2 L2A, compare classificadores e crie um mapa GeoTIFF para a sua área de estudo.",
    intro: "Fluxo geoespacial reproduzível com Sentinel-2 L2A, máscara de nuvens SCL, índices espectrais, comparação Random Forest/SVM e mapa temático de 10 metros.",
    bbox: "Área de estudo WGS84 (oeste, sul, este, norte)",
    start: "Data inicial", end: "Data final", clouds: "Cobertura máxima de nuvens (%)",
    mapModelLabel: "Modelo usado para criar o mapa", randomForest: "Random Forest", svm: "SVM linear",
    samplesPerClass: "Máximo de amostras por classe", spatialBlock: "Tamanho do bloco de validação",
    selectedClasses: "Classes a incluir", metricsToShow: "Métricas a apresentar",
    prepareUnet: "Preparar dados U-Net (Sentinel-2 + etiquetas proxy WorldCover)",
    prepareUnetNote: "Transfere para o navegador uma grelha comprimida e amostrada (máximo 128×128); os dados não são guardados.",
    workflowTitle: "Fluxo de trabalho Sentinel-2 L2A",
    selectClassError: "Selecione pelo menos uma classe WorldCover.",
    samplesError: "Introduza entre 100 e 2 000 amostras por classe.",
    accuracyMetric: "Exatidão", selectMetricError: "Selecione pelo menos uma métrica para apresentar.",
    sceneClouds: "cobertura de nuvens", balancedAccuracy: "exatidão equilibrada", macroF1: "F1 macro", kappa: "Kappa de Cohen",
    run: "Iniciar análise Sentinel-2", signIn: "Inicie sessão para começar o processamento.", signInLink: "Iniciar sessão",
    running: "A processar…", loading: "A carregar…",
    reference: "A avaliação mede a concordância com o ESA WorldCover 2021, não a exatidão face a medições independentes no terreno. Reveja o mapa num SIG antes de qualquer utilização operacional ou científica.",
    result: "Resultado do processamento", reportTitle: "Relatório técnico de ML",
    reportDescription: "Comparação reproduzível em blocos espaciais excluídos do treino.",
    scene: "Cena", accuracy: "Concordância espacial com o WorldCover",
    mapDownload: "Transferir GeoTIFF a cores",
    mapBandNote: "GeoTIFF RGBA padrão de 4 bandas para apresentar cores em visualizadores comuns; a legenda das classes está no relatório.",
    mapModel: "Modelo exportado", bands: "bandas", indices: "índices",
    mapComparison: "A comparação RF/SVM utiliza as mesmas amostras de teste.",
    macroWinner: (name: string) => `F1 macro mais elevado no teste espacial: ${name}. Não equivale a uma validação no terreno.`,
    opinionTitle: "Avaliação técnica automatizada",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `No teste espacial, ${winner} obtém F1 macro ${winnerF1}, face a ${other} (${otherF1}); apresenta, assim, maior concordância com a referência na amostra e área avaliadas.`,
    opinionReference: "As etiquetas de referência provêm do ESA WorldCover 2021, não de medições independentes no terreno; estas métricas não demonstram a exatidão absoluta do mapa.",
    opinionRecommendation: "O mapa é adequado para exploração preliminar, mas não basta, por si só, para decisões operacionais ou científicas. Antes de o utilizar, reveja-o num SIG e compare-o com dados independentes da área.",
    opinionDisclaimer: "Resumo automatizado baseado nos resultados apresentados; não é um parecer especializado assinado nem uma certificação profissional.",
    classMetricsTitle: "Desempenho por classe", className: "Classe", precision: "Precisão", recall: "Revocação", f1: "F1", support: "Amostras de teste",
    confusionTitle: "Matriz de confusão — Random Forest",
    confusionDescription: "Linhas: classe de referência · colunas: classe prevista",
    predicted: "Prevista", referenceLabel: "Referência",
    featureTitle: "Importância relativa das variáveis",
    featureDescription: "RF: importância baseada na impureza; SVM: média dos coeficientes absolutos da LinearSVC padronizada. São valores descritivos, não causais.",
    areaTitle: "Área classificada", areaHa: "Área (ha)", methodTitle: "Método e amostras",
    sampleCounts: (training: number, test: number, block: number) => `${training} amostras de treino · ${test} de teste · blocos espaciais de ${block} m.`,
    deepLearningNote: "O teste CNN EuroSAT é independente do mapa AOI. É possível treinar U-Net aqui com etiquetas proxy WorldCover; não são medições independentes no terreno.",
    downloadError: "Não foi possível transferir o mapa.", failed: "Falha no processamento",
    sourcesTitle: "Fontes e catálogos do fluxo de trabalho",
    sourcesDescription: "O fluxo procura cenas Sentinel-2 no catálogo STAC Earth Search e usa o ESA WorldCover 2021 como referência de treino e validação.",
    sources: [
      { label: "Catálogo STAC Sentinel-2 usado pelo fluxo", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · fonte oficial", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · explorar imagens Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · acesso aos dados", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · documentação scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · documentação scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Explorar fontes e conjuntos de dados relacionados", portalLink: "Abrir análise de dados",
  },
  pl: {
    ...copy.en,
    title: "Teledetekcja i uczenie maszynowe",
    description: "Analizuj sceny Sentinel-2 L2A, porównuj klasyfikatory i twórz mapę GeoTIFF badanego obszaru.",
    intro: "Powtarzalny przepływ geoprzestrzenny: Sentinel-2 L2A, maska chmur SCL, indeksy spektralne, porównanie Random Forest/SVM i mapa tematyczna o rozdzielczości 10 m.",
    bbox: "Obszar badania WGS84 (zachód, południe, wschód, północ)",
    start: "Data początkowa", end: "Data końcowa", clouds: "Maksymalne zachmurzenie (%)",
    mapModelLabel: "Model tworzący mapę", randomForest: "Random Forest", svm: "Liniowy SVM",
    samplesPerClass: "Maksymalna liczba próbek na klasę", spatialBlock: "Rozmiar bloku walidacyjnego",
    selectedClasses: "Uwzględniane klasy", metricsToShow: "Wyświetlane metryki",
    prepareUnet: "Przygotuj dane U-Net (Sentinel-2 + etykiety zastępcze WorldCover)",
    prepareUnetNote: "Przesyła do przeglądarki skompresowaną i próbkowaną siatkę (maks. 128×128); dane nie są zapisywane.",
    workflowTitle: "Przepływ pracy Sentinel-2 L2A",
    selectClassError: "Wybierz co najmniej jedną klasę WorldCover.",
    samplesError: "Podaj od 100 do 2000 próbek na klasę.",
    accuracyMetric: "Dokładność", selectMetricError: "Wybierz co najmniej jedną metrykę do wyświetlenia.",
    sceneClouds: "zachmurzenie", balancedAccuracy: "dokładność zrównoważona", macroF1: "Makro F1", kappa: "Kappa Cohena",
    run: "Uruchom analizę Sentinel-2", signIn: "Zaloguj się, aby rozpocząć przetwarzanie.", signInLink: "Zaloguj się",
    running: "Przetwarzanie…", loading: "Wczytywanie…",
    reference: "Ocena mierzy zgodność z ESA WorldCover 2021, a nie dokładność względem niezależnych pomiarów terenowych. Przed zastosowaniem operacyjnym lub naukowym sprawdź mapę w systemie GIS.",
    result: "Wynik przetwarzania", reportTitle: "Raport techniczny ML",
    reportDescription: "Powtarzalne porównanie na blokach przestrzennych wyłączonych z treningu.",
    scene: "Scena", accuracy: "Zgodność przestrzenna z WorldCover",
    mapDownload: "Pobierz kolorowy GeoTIFF",
    mapBandNote: "Standardowy GeoTIFF RGBA z 4 pasmami do wyświetlania kolorów; legenda klas znajduje się w raporcie.",
    mapModel: "Wyeksportowany model", bands: "pasma", indices: "indeksy",
    mapComparison: "Porównanie RF/SVM wykorzystuje te same próbki testowe.",
    macroWinner: (name: string) => `Najwyższy makro F1 w teście przestrzennym: ${name}. To nie jest walidacja terenowa.`,
    opinionTitle: "Automatyczna ocena techniczna",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `W teście przestrzennym ${winner} uzyskuje makro F1 ${winnerF1} wobec ${other} (${otherF1}), a więc lepiej zgadza się z danymi referencyjnymi na ocenionej próbce i obszarze.`,
    opinionReference: "Etykiety referencyjne pochodzą z ESA WorldCover 2021, a nie z niezależnych pomiarów terenowych; te metryki nie potwierdzają bezwzględnej dokładności mapy.",
    opinionRecommendation: "Mapa nadaje się do wstępnej eksploracji, ale sama nie wystarcza do podejmowania decyzji operacyjnych ani naukowych. Przed użyciem sprawdź ją w GIS i porównaj z niezależnymi danymi z obszaru.",
    opinionDisclaimer: "Automatyczne podsumowanie przedstawionych wyników; nie jest podpisaną opinią eksperta ani certyfikacją zawodową.",
    classMetricsTitle: "Wyniki według klas", className: "Klasa", precision: "Precyzja", recall: "Czułość", f1: "F1", support: "Próbki testowe",
    confusionTitle: "Macierz pomyłek — Random Forest",
    confusionDescription: "Wiersze: klasa referencyjna · kolumny: klasa przewidywana",
    predicted: "Przewidywana", referenceLabel: "Referencyjna",
    featureTitle: "Względna ważność cech",
    featureDescription: "RF: ważność oparta na nieczystości; SVM: średnie bezwzględne współczynniki standaryzowanego LinearSVC. Wartości opisowe, nie przyczynowe.",
    areaTitle: "Sklasyfikowana powierzchnia", areaHa: "Powierzchnia (ha)", methodTitle: "Metoda i próbki",
    sampleCounts: (training: number, test: number, block: number) => `${training} próbek treningowych · ${test} testowych · bloki przestrzenne ${block} m.`,
    deepLearningNote: "Test CNN EuroSAT jest niezależny od mapy AOI. Można tu trenować U-Net na etykietach zastępczych WorldCover; nie są to niezależne pomiary terenowe.",
    downloadError: "Nie udało się pobrać mapy.", failed: "Przetwarzanie nie powiodło się",
    sourcesTitle: "Źródła i katalogi przepływu pracy",
    sourcesDescription: "Przepływ wyszukuje sceny Sentinel-2 w katalogu STAC Earth Search i wykorzystuje ESA WorldCover 2021 jako źródło treningowe i walidacyjne.",
    sources: [
      { label: "Katalog STAC Sentinel-2 używany w przepływie", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · oficjalne źródło", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · przeglądanie zobrazowań Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · dostęp do danych", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · dokumentacja scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · dokumentacja scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Odkryj powiązane źródła i zbiory danych", portalLink: "Otwórz analizę danych",
  },
  nl: {
    ...copy.en,
    title: "Teledetectie en machine learning",
    description: "Analyseer Sentinel-2 L2A-scènes, vergelijk classificatiemodellen en maak een GeoTIFF-kaart van uw onderzoeksgebied.",
    intro: "Reproduceerbare georuimtelijke workflow met Sentinel-2 L2A, SCL-wolkenmasker, spectrale indices, vergelijking van Random Forest/SVM en een thematische kaart met 10 meter resolutie.",
    bbox: "Onderzoeksgebied WGS84 (west, zuid, oost, noord)",
    start: "Startdatum", end: "Einddatum", clouds: "Maximale bewolking (%)",
    mapModelLabel: "Model voor het maken van de kaart", randomForest: "Random Forest", svm: "Lineaire SVM",
    samplesPerClass: "Maximumaantal voorbeelden per klasse", spatialBlock: "Grootte van het validatieblok",
    selectedClasses: "Op te nemen klassen", metricsToShow: "Weer te geven metingen",
    prepareUnet: "U-Net-gegevens voorbereiden (Sentinel-2 + WorldCover-proxylabels)",
    prepareUnetNote: "Stuurt een gecomprimeerd en bemonsterd raster (maximaal 128×128) naar de browser; de gegevens worden niet opgeslagen.",
    workflowTitle: "Sentinel-2 L2A-workflow",
    selectClassError: "Selecteer ten minste één WorldCover-klasse.",
    samplesError: "Voer 100 tot 2.000 voorbeelden per klasse in.",
    accuracyMetric: "Nauwkeurigheid", selectMetricError: "Selecteer ten minste één meting om weer te geven.",
    sceneClouds: "bewolking", balancedAccuracy: "gebalanceerde nauwkeurigheid", macroF1: "macro-F1", kappa: "Cohens kappa",
    run: "Sentinel-2-analyse starten", signIn: "Meld u aan om de verwerking te starten.", signInLink: "Aanmelden",
    running: "Verwerken…", loading: "Laden…",
    reference: "De evaluatie meet de overeenstemming met ESA WorldCover 2021, niet de nauwkeurigheid ten opzichte van onafhankelijke veldmetingen. Controleer de kaart in GIS voordat u deze operationeel of wetenschappelijk gebruikt.",
    result: "Verwerkingsresultaat", reportTitle: "Technisch ML-rapport",
    reportDescription: "Reproduceerbare vergelijking op ruimtelijke blokken die buiten de training zijn gehouden.",
    scene: "Scène", accuracy: "Ruimtelijke overeenstemming met WorldCover",
    mapDownload: "Kleur-GeoTIFF downloaden",
    mapBandNote: "Standaard GeoTIFF met 4 RGBA-banden voor kleurweergave in gangbare viewers; de klassenlegenda staat in het rapport.",
    mapModel: "Geëxporteerd model", bands: "banden", indices: "indices",
    mapComparison: "De vergelijking tussen RF en SVM gebruikt dezelfde testvoorbeelden.",
    macroWinner: (name: string) => `Hoogste macro-F1 in de ruimtelijke test: ${name}. Dit is geen veldvalidatie.`,
    opinionTitle: "Geautomatiseerde technische beoordeling",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `In de ruimtelijke test behaalt ${winner} een macro-F1 van ${winnerF1}, tegenover ${other} (${otherF1}); het model stemt daardoor beter overeen met de referentie in de beoordeelde steekproef en het gebied.`,
    opinionReference: "De referentielabels zijn afkomstig van ESA WorldCover 2021 en niet van onafhankelijke veldmetingen; deze metingen stellen de absolute nauwkeurigheid van de kaart niet vast.",
    opinionRecommendation: "De kaart is geschikt voor een eerste verkenning, maar is op zichzelf niet voldoende voor operationele of wetenschappelijke beslissingen. Controleer de kaart vóór gebruik in GIS en vergelijk deze met onafhankelijke gegevens uit het gebied.",
    opinionDisclaimer: "Automatische samenvatting op basis van de getoonde resultaten; geen ondertekend deskundigenoordeel of professionele certificering.",
    classMetricsTitle: "Prestaties per klasse", className: "Klasse", precision: "Precisie", recall: "Recall", f1: "F1", support: "Testvoorbeelden",
    confusionTitle: "Verwarringsmatrix — Random Forest",
    confusionDescription: "Rijen: referentieklasse · kolommen: voorspelde klasse",
    predicted: "Voorspeld", referenceLabel: "Referentie",
    featureTitle: "Relatief belang van kenmerken",
    featureDescription: "RF: belang op basis van onzuiverheid; SVM: gemiddelde absolute coëfficiënten van gestandaardiseerde LinearSVC. Beschrijvende, geen causale waarden.",
    areaTitle: "Geclassificeerd oppervlak", areaHa: "Oppervlak (ha)", methodTitle: "Methode en voorbeelden",
    sampleCounts: (training: number, test: number, block: number) => `${training} trainingsvoorbeelden · ${test} testvoorbeelden · ruimtelijke blokken van ${block} m.`,
    deepLearningNote: "De EuroSAT-CNN-test staat los van de AOI-kaart. U-Net kan hier worden getraind met WorldCover-proxylabels; dit zijn geen onafhankelijke veldmetingen.",
    downloadError: "De kaart kan niet worden gedownload.", failed: "Verwerking mislukt",
    sourcesTitle: "Workflowbronnen en catalogi",
    sourcesDescription: "De workflow zoekt Sentinel-2-scènes in de Earth Search STAC-catalogus en gebruikt ESA WorldCover 2021 als trainings- en validatiereferentie.",
    sources: [
      { label: "Sentinel-2 STAC-catalogus die door de workflow wordt gebruikt", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · officiële bron", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · Sentinel-beelden verkennen", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · gegevenstoegang", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-documentatie", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-documentatie", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Gerelateerde bronnen en datasets verkennen", portalLink: "Data-analyse openen",
  },
  tr: {
    ...copy.en,
    title: "Uzaktan algılama ve makine öğrenimi",
    description: "Sentinel-2 L2A görüntülerini analiz edin, sınıflandırıcıları karşılaştırın ve çalışma alanınız için GeoTIFF haritası oluşturun.",
    intro: "Sentinel-2 L2A, SCL bulut maskesi, spektral indeksler, Random Forest/SVM karşılaştırması ve 10 metrelik tematik harita içeren tekrarlanabilir jeo-uzamsal iş akışı.",
    bbox: "WGS84 çalışma alanı (batı, güney, doğu, kuzey)",
    start: "Başlangıç tarihi", end: "Bitiş tarihi", clouds: "En fazla bulutluluk (%)",
    mapModelLabel: "Haritayı oluşturan model", randomForest: "Random Forest", svm: "Doğrusal SVM",
    samplesPerClass: "Sınıf başına en fazla örnek", spatialBlock: "Doğrulama bloğu boyutu",
    selectedClasses: "Dahil edilecek sınıflar", metricsToShow: "Gösterilecek ölçümler",
    prepareUnet: "U-Net verilerini hazırla (Sentinel-2 + WorldCover vekil etiketleri)",
    prepareUnetNote: "Örneklenmiş ve sıkıştırılmış bir ızgarayı (en fazla 128×128) tarayıcıya aktarır; veriler saklanmaz.",
    workflowTitle: "Sentinel-2 L2A iş akışı",
    selectClassError: "En az bir WorldCover sınıfı seçin.",
    samplesError: "Sınıf başına 100 ile 2.000 arasında örnek girin.",
    accuracyMetric: "Doğruluk", selectMetricError: "Göstermek için en az bir ölçüm seçin.",
    sceneClouds: "bulutluluk", balancedAccuracy: "dengeli doğruluk", macroF1: "makro F1", kappa: "Cohen kappa",
    run: "Sentinel-2 analizini başlat", signIn: "İşlemi başlatmak için oturum açın.", signInLink: "Oturum aç",
    running: "İşleniyor…", loading: "Yükleniyor…",
    reference: "Değerlendirme, bağımsız arazi ölçümlerine göre doğruluğu değil, ESA WorldCover 2021 ile uyumu ölçer. Haritayı operasyonel veya bilimsel amaçla kullanmadan önce CBS ortamında inceleyin.",
    result: "İşleme sonucu", reportTitle: "ML teknik raporu",
    reportDescription: "Eğitim dışında tutulan mekânsal bloklarda tekrarlanabilir karşılaştırma.",
    scene: "Görüntü", accuracy: "WorldCover ile mekânsal uyum",
    mapDownload: "Renkli GeoTIFF'i indir",
    mapBandNote: "Yaygın görüntüleyicilerde renk gösterimi için standart 4 bantlı RGBA GeoTIFF; sınıf açıklamaları rapordadır.",
    mapModel: "Dışa aktarılan model", bands: "bant", indices: "indeks",
    mapComparison: "RF/SVM karşılaştırması aynı test örneklerini kullanır.",
    macroWinner: (name: string) => `Mekânsal testte en yüksek makro F1: ${name}. Bu, arazi doğrulaması değildir.`,
    opinionTitle: "Otomatik teknik değerlendirme",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `Mekânsal testte ${winner}, ${other} modelinin ${otherF1} değerine karşı ${winnerF1} makro F1 elde etti; değerlendirilen örnek ve alanda referansla daha fazla uyum gösterdi.`,
    opinionReference: "Referans etiketleri bağımsız arazi ölçümlerinden değil, ESA WorldCover 2021'den alınmıştır; bu ölçümler haritanın mutlak doğruluğunu kanıtlamaz.",
    opinionRecommendation: "Harita ön inceleme için uygundur ancak tek başına operasyonel veya bilimsel kararlar için yeterli değildir. Kullanmadan önce CBS ortamında inceleyin ve alana ait bağımsız verilerle karşılaştırın.",
    opinionDisclaimer: "Gösterilen sonuçlara dayalı otomatik özet; imzalı uzman görüşü veya mesleki sertifika değildir.",
    classMetricsTitle: "Sınıfa göre performans", className: "Sınıf", precision: "Kesinlik", recall: "Duyarlılık", f1: "F1", support: "Test örnekleri",
    confusionTitle: "Karışıklık matrisi — Random Forest",
    confusionDescription: "Satırlar: referans sınıfı · sütunlar: tahmin edilen sınıf",
    predicted: "Tahmin", referenceLabel: "Referans",
    featureTitle: "Göreli özellik önemi",
    featureDescription: "RF: safsızlığa dayalı önem; SVM: standartlaştırılmış LinearSVC mutlak katsayılarının ortalaması. Nedensel değil, betimleyici değerlerdir.",
    areaTitle: "Sınıflandırılmış alan", areaHa: "Alan (ha)", methodTitle: "Yöntem ve örnekler",
    sampleCounts: (training: number, test: number, block: number) => `${training} eğitim örneği · ${test} test örneği · ${block} m mekânsal bloklar.`,
    deepLearningNote: "EuroSAT CNN testi AOI haritasından bağımsızdır. U-Net burada WorldCover vekil etiketleriyle eğitilebilir; bunlar bağımsız arazi ölçümleri değildir.",
    downloadError: "Harita indirilemedi.", failed: "İşlem başarısız oldu",
    sourcesTitle: "İş akışı kaynakları ve katalogları",
    sourcesDescription: "İş akışı, Earth Search STAC kataloğunda Sentinel-2 görüntülerini arar ve ESA WorldCover 2021'i eğitim ve doğrulama referansı olarak kullanır.",
    sources: [
      { label: "İş akışında kullanılan Sentinel-2 STAC kataloğu", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · resmî kaynak", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · Sentinel görüntülerini keşfet", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · veri erişimi", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn belgeleri", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn belgeleri", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "İlgili kaynakları ve veri kümelerini keşfet", portalLink: "Veri analizini aç",
  },
  sv: {
    ...copy.en,
    title: "Fjärranalys och maskininlärning",
    description: "Analysera Sentinel-2 L2A-scener, jämför klassificerare och skapa en GeoTIFF-karta över ditt studieområde.",
    intro: "Reproducerbart geospatialt arbetsflöde med Sentinel-2 L2A, SCL-molnmask, spektrala index, jämförelse mellan Random Forest/SVM och en tematisk karta med 10 meters upplösning.",
    bbox: "Studieområde WGS84 (väst, syd, öst, nord)",
    start: "Startdatum", end: "Slutdatum", clouds: "Maximal molntäckning (%)",
    mapModelLabel: "Modell som skapar kartan", randomForest: "Random Forest", svm: "Linjär SVM",
    samplesPerClass: "Maximalt antal prover per klass", spatialBlock: "Storlek på valideringsblock",
    selectedClasses: "Klasser att inkludera", metricsToShow: "Mått att visa",
    prepareUnet: "Förbered U-Net-data (Sentinel-2 + WorldCover-proxyetiketter)",
    prepareUnetNote: "Överför ett komprimerat och samplat rutnät (högst 128×128) till webbläsaren; data sparas inte.",
    workflowTitle: "Sentinel-2 L2A-arbetsflöde",
    selectClassError: "Välj minst en WorldCover-klass.",
    samplesError: "Ange 100–2 000 prover per klass.",
    accuracyMetric: "Träffsäkerhet", selectMetricError: "Välj minst ett mått att visa.",
    sceneClouds: "molntäckning", balancedAccuracy: "balanserad träffsäkerhet", macroF1: "Makro-F1", kappa: "Cohens kappa",
    run: "Starta Sentinel-2-analys", signIn: "Logga in för att starta bearbetningen.", signInLink: "Logga in",
    running: "Bearbetar…", loading: "Läser in…",
    reference: "Utvärderingen mäter överensstämmelse med ESA WorldCover 2021, inte träffsäkerhet mot oberoende fältmätningar. Granska kartan i ett GIS innan operativ eller vetenskaplig användning.",
    result: "Bearbetningsresultat", reportTitle: "Teknisk ML-rapport",
    reportDescription: "Reproducerbar jämförelse på rumsliga block som undantagits från träningen.",
    scene: "Scen", accuracy: "Rumslig överensstämmelse med WorldCover",
    mapDownload: "Ladda ned färgad GeoTIFF",
    mapBandNote: "GeoTIFF med standardiserade 4 RGBA-band för färgvisning i vanliga visare; klassförklaringen finns i rapporten.",
    mapModel: "Exporterad modell", bands: "band", indices: "index",
    mapComparison: "RF/SVM-jämförelsen använder samma testprover.",
    macroWinner: (name: string) => `Högst makro-F1 i det rumsliga testet: ${name}. Detta är inte fältvalidering.`,
    opinionTitle: "Automatiserad teknisk bedömning",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `I det rumsliga testet får ${winner} makro-F1 ${winnerF1} jämfört med ${other} (${otherF1}); modellen stämmer därför bättre med referensen i det utvärderade urvalet och området.`,
    opinionReference: "Referensetiketterna kommer från ESA WorldCover 2021, inte från oberoende fältmätningar; måtten fastställer inte kartans absoluta träffsäkerhet.",
    opinionRecommendation: "Kartan lämpar sig för en inledande undersökning, men räcker inte ensam för operativa eller vetenskapliga beslut. Granska den i GIS och jämför med oberoende områdesdata före användning.",
    opinionDisclaimer: "Automatisk sammanfattning baserad på de visade resultaten; inte ett undertecknat expertutlåtande eller en yrkescertifiering.",
    classMetricsTitle: "Resultat per klass", className: "Klass", precision: "Precision", recall: "Återkallning", f1: "F1", support: "Testprover",
    confusionTitle: "Förväxlingsmatris — Random Forest",
    confusionDescription: "Rader: referensklass · kolumner: förutsagd klass",
    predicted: "Förutsagd", referenceLabel: "Referens",
    featureTitle: "Relativ betydelse för egenskaper",
    featureDescription: "RF: betydelse baserad på orenhet; SVM: genomsnittliga absoluta koefficienter från standardiserad LinearSVC. Beskrivande, inte orsakssamband.",
    areaTitle: "Klassificerad yta", areaHa: "Yta (ha)", methodTitle: "Metod och prover",
    sampleCounts: (training: number, test: number, block: number) => `${training} träningsprover · ${test} testprover · rumsliga block på ${block} m.`,
    deepLearningNote: "EuroSAT-CNN-testet är separat från AOI-kartan. U-Net kan tränas här med WorldCover-proxyetiketter; dessa är inte oberoende fältmätningar.",
    downloadError: "Det gick inte att ladda ned kartan.", failed: "Bearbetningen misslyckades",
    sourcesTitle: "Arbetsflödets källor och kataloger",
    sourcesDescription: "Arbetsflödet söker Sentinel-2-scener i Earth Search STAC-katalogen och använder ESA WorldCover 2021 som tränings- och valideringsreferens.",
    sources: [
      { label: "Sentinel-2 STAC-katalog som används i arbetsflödet", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · officiell källa", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · utforska Sentinel-bilder", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · dataåtkomst", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-dokumentation", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-dokumentation", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Utforska relaterade källor och datamängder", portalLink: "Öppna dataanalys",
  },
  da: {
    ...copy.en,
    title: "Fjernmåling og maskinlæring",
    description: "Analysér Sentinel-2 L2A-scener, sammenlign klassifikatorer, og opret et GeoTIFF-kort over dit undersøgelsesområde.",
    intro: "Reproducerbart geospatialt workflow med Sentinel-2 L2A, SCL-sky-maske, spektrale indekser, sammenligning af Random Forest/SVM og et tematisk kort med 10 meters opløsning.",
    bbox: "Undersøgelsesområde WGS84 (vest, syd, øst, nord)",
    start: "Startdato", end: "Slutdato", clouds: "Maksimal skydækning (%)",
    mapModelLabel: "Model, der opretter kortet", randomForest: "Random Forest", svm: "Lineær SVM",
    samplesPerClass: "Maksimalt antal prøver pr. klasse", spatialBlock: "Størrelse på valideringsblok",
    selectedClasses: "Klasser, der skal medtages", metricsToShow: "Målinger, der skal vises",
    prepareUnet: "Forbered U-Net-data (Sentinel-2 + WorldCover-proxyetiketter)",
    prepareUnetNote: "Overfører et komprimeret, samplet gitter (højst 128×128) til browseren; data gemmes ikke.",
    workflowTitle: "Sentinel-2 L2A-workflow",
    selectClassError: "Vælg mindst én WorldCover-klasse.",
    samplesError: "Angiv 100–2.000 prøver pr. klasse.",
    accuracyMetric: "Nøjagtighed", selectMetricError: "Vælg mindst én måling, der skal vises.",
    sceneClouds: "skydækning", balancedAccuracy: "balanceret nøjagtighed", macroF1: "Makro-F1", kappa: "Cohens kappa",
    run: "Start Sentinel-2-analyse", signIn: "Log ind for at starte behandlingen.", signInLink: "Log ind",
    running: "Behandler…", loading: "Indlæser…",
    reference: "Evalueringen måler overensstemmelse med ESA WorldCover 2021, ikke nøjagtighed i forhold til uafhængige feltmålinger. Gennemgå kortet i et GIS før operationel eller videnskabelig brug.",
    result: "Behandlingsresultat", reportTitle: "Teknisk ML-rapport",
    reportDescription: "Reproducerbar sammenligning på rumlige blokke, der er udeladt fra træningen.",
    scene: "Scene", accuracy: "Rumlig overensstemmelse med WorldCover",
    mapDownload: "Download farve-GeoTIFF",
    mapBandNote: "Standard-GeoTIFF med 4 RGBA-bånd til farvevisning i almindelige visningsprogrammer; klassernes signaturforklaring findes i rapporten.",
    mapModel: "Eksporteret model", bands: "bånd", indices: "indekser",
    mapComparison: "RF/SVM-sammenligningen bruger de samme testprøver.",
    macroWinner: (name: string) => `Højeste makro-F1 i den rumlige test: ${name}. Dette er ikke feltvalidering.`,
    opinionTitle: "Automatiseret teknisk vurdering",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `I den rumlige test opnår ${winner} makro-F1 ${winnerF1} mod ${other} (${otherF1}); modellen stemmer derfor bedre overens med referencen i den vurderede prøve og det vurderede område.`,
    opinionReference: "Referencemærkaterne kommer fra ESA WorldCover 2021, ikke fra uafhængige feltmålinger; disse målinger fastslår ikke kortets absolutte nøjagtighed.",
    opinionRecommendation: "Kortet egner sig til indledende undersøgelse, men er ikke tilstrækkeligt alene til operationelle eller videnskabelige beslutninger. Gennemgå det i GIS, og sammenlign med uafhængige data fra området før brug.",
    opinionDisclaimer: "Automatisk opsummering baseret på de viste resultater; ikke en underskrevet ekspertvurdering eller professionel certificering.",
    classMetricsTitle: "Resultater pr. klasse", className: "Klasse", precision: "Præcision", recall: "Genkaldelse", f1: "F1", support: "Testprøver",
    confusionTitle: "Forvekslingsmatrix — Random Forest",
    confusionDescription: "Rækker: referenceklasse · kolonner: forudsagt klasse",
    predicted: "Forudsagt", referenceLabel: "Reference",
    featureTitle: "Relativ betydning af variabler",
    featureDescription: "RF: betydning baseret på urenhed; SVM: gennemsnitlige absolutte koefficienter fra standardiseret LinearSVC. Beskrivende, ikke årsagsbaserede værdier.",
    areaTitle: "Klassificeret areal", areaHa: "Areal (ha)", methodTitle: "Metode og prøver",
    sampleCounts: (training: number, test: number, block: number) => `${training} træningsprøver · ${test} testprøver · rumlige blokke på ${block} m.`,
    deepLearningNote: "EuroSAT-CNN-testen er adskilt fra AOI-kortet. U-Net kan trænes her med WorldCover-proxyetiketter; de er ikke uafhængige feltmålinger.",
    downloadError: "Kortet kunne ikke downloades.", failed: "Behandlingen mislykkedes",
    sourcesTitle: "Workflowets kilder og kataloger",
    sourcesDescription: "Workflowet søger efter Sentinel-2-scener i Earth Search STAC-kataloget og bruger ESA WorldCover 2021 som reference til træning og validering.",
    sources: [
      { label: "Sentinel-2 STAC-katalog, der bruges af workflowet", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · officiel kilde", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · udforsk Sentinel-billeder", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · dataadgang", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-dokumentation", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-dokumentation", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Udforsk relaterede kilder og datasæt", portalLink: "Åbn dataanalyse",
  },
  no: {
    ...copy.en,
    title: "Fjernmåling og maskinlæring",
    description: "Analyser Sentinel-2 L2A-scener, sammenlign klassifikatorer og lag et GeoTIFF-kart over studieområdet.",
    intro: "Reproduserbar geospatial arbeidsflyt med Sentinel-2 L2A, SCL-skymaske, spektralindekser, sammenligning av Random Forest/SVM og et tematisk kart med 10 meters oppløsning.",
    bbox: "Studieområde WGS84 (vest, sør, øst, nord)",
    start: "Startdato", end: "Sluttdato", clouds: "Maksimal skydekning (%)",
    mapModelLabel: "Modell som lager kartet", randomForest: "Random Forest", svm: "Lineær SVM",
    samplesPerClass: "Maksimalt antall prøver per klasse", spatialBlock: "Størrelse på valideringsblokk",
    selectedClasses: "Klasser som skal inkluderes", metricsToShow: "Målinger som skal vises",
    prepareUnet: "Forbered U-Net-data (Sentinel-2 + WorldCover-proxyetiketter)",
    prepareUnetNote: "Overfører et komprimert og samplet rutenett (maksimalt 128×128) til nettleseren; dataene lagres ikke.",
    workflowTitle: "Sentinel-2 L2A-arbeidsflyt",
    selectClassError: "Velg minst én WorldCover-klasse.",
    samplesError: "Oppgi 100–2 000 prøver per klasse.",
    accuracyMetric: "Nøyaktighet", selectMetricError: "Velg minst én måling som skal vises.",
    sceneClouds: "skydekning", balancedAccuracy: "balansert nøyaktighet", macroF1: "makro-F1", kappa: "Cohens kappa",
    run: "Start Sentinel-2-analyse", signIn: "Logg inn for å starte behandlingen.", signInLink: "Logg inn",
    running: "Behandler…", loading: "Laster…",
    reference: "Evalueringen måler samsvar med ESA WorldCover 2021, ikke nøyaktighet mot uavhengige feltmålinger. Kontroller kartet i et GIS før operasjonell eller vitenskapelig bruk.",
    result: "Behandlingsresultat", reportTitle: "Teknisk ML-rapport",
    reportDescription: "Reproduserbar sammenligning på romlige blokker som er holdt utenfor treningen.",
    scene: "Scene", accuracy: "Romlig samsvar med WorldCover",
    mapDownload: "Last ned farge-GeoTIFF",
    mapBandNote: "Standard GeoTIFF med 4 RGBA-bånd for fargevisning i vanlige visningsprogrammer; klassesymbolene står i rapporten.",
    mapModel: "Eksportert modell", bands: "bånd", indices: "indekser",
    mapComparison: "RF/SVM-sammenligningen bruker de samme testprøvene.",
    macroWinner: (name: string) => `Høyest makro-F1 i den romlige testen: ${name}. Dette er ikke feltvalidering.`,
    opinionTitle: "Automatisert teknisk vurdering",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `I den romlige testen får ${winner} makro-F1 ${winnerF1} mot ${other} (${otherF1}); modellen samsvarer derfor bedre med referansen i det vurderte utvalget og området.`,
    opinionReference: "Referanseetikettene kommer fra ESA WorldCover 2021, ikke fra uavhengige feltmålinger; målingene fastslår ikke kartets absolutte nøyaktighet.",
    opinionRecommendation: "Kartet egner seg til innledende utforskning, men er ikke tilstrekkelig alene for operasjonelle eller vitenskapelige beslutninger. Kontroller det i GIS og sammenlign med uavhengige data fra området før bruk.",
    opinionDisclaimer: "Automatisk sammendrag basert på de viste resultatene; ikke en signert ekspertuttalelse eller profesjonell sertifisering.",
    classMetricsTitle: "Resultater per klasse", className: "Klasse", precision: "Presisjon", recall: "Tilbakekalling", f1: "F1", support: "Testprøver",
    confusionTitle: "Forvekslingsmatrise — Random Forest",
    confusionDescription: "Rader: referanseklasse · kolonner: predikert klasse",
    predicted: "Predikert", referenceLabel: "Referanse",
    featureTitle: "Relativ egenskapsbetydning",
    featureDescription: "RF: betydning basert på urenhet; SVM: gjennomsnittlige absolutte koeffisienter fra standardisert LinearSVC. Beskrivende, ikke årsaksbaserte verdier.",
    areaTitle: "Klassifisert areal", areaHa: "Areal (ha)", methodTitle: "Metode og prøver",
    sampleCounts: (training: number, test: number, block: number) => `${training} treningsprøver · ${test} testprøver · romlige blokker på ${block} m.`,
    deepLearningNote: "EuroSAT-CNN-testen er uavhengig av AOI-kartet. U-Net kan trenes her med WorldCover-proxyetiketter; dette er ikke uavhengige feltmålinger.",
    downloadError: "Kartet kunne ikke lastes ned.", failed: "Behandlingen mislyktes",
    sourcesTitle: "Arbeidsflytens kilder og kataloger",
    sourcesDescription: "Arbeidsflyten søker etter Sentinel-2-scener i Earth Search STAC-katalogen og bruker ESA WorldCover 2021 som trenings- og valideringsreferanse.",
    sources: [
      { label: "Sentinel-2 STAC-katalog som brukes i arbeidsflyten", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · offisiell kilde", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · utforsk Sentinel-bilder", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · datatilgang", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-dokumentasjon", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-dokumentasjon", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Utforsk relaterte kilder og datasett", portalLink: "Åpne dataanalyse",
  },
  fi: {
    ...copy.en,
    title: "Kaukokartoitus ja koneoppiminen",
    description: "Analysoi Sentinel-2 L2A -kuvia, vertaa luokittelijoita ja luo GeoTIFF-kartta tutkimusalueestasi.",
    intro: "Toistettava paikkatietotyönkulku: Sentinel-2 L2A, SCL-pilvimaski, spektri-indeksit, Random Forest/SVM-vertailu ja 10 metrin teemakartta.",
    bbox: "WGS84-tutkimusalue (länsi, etelä, itä, pohjoinen)",
    start: "Alkupäivä", end: "Loppupäivä", clouds: "Pilvipeitteen enimmäismäärä (%)",
    mapModelLabel: "Karttaa luova malli", randomForest: "Random Forest", svm: "Lineaarinen SVM",
    samplesPerClass: "Näytteiden enimmäismäärä luokkaa kohti", spatialBlock: "Validointilohkon koko",
    selectedClasses: "Sisällytettävät luokat", metricsToShow: "Näytettävät mittarit",
    prepareUnet: "Valmistele U-Net-aineisto (Sentinel-2 + WorldCover-korvaavat luokitukset)",
    prepareUnetNote: "Siirtää selaimeen pakatun ja näytteistetyn ruudukon (enintään 128×128); aineistoa ei tallenneta.",
    workflowTitle: "Sentinel-2 L2A -työnkulku",
    selectClassError: "Valitse vähintään yksi WorldCover-luokka.",
    samplesError: "Anna 100–2 000 näytettä luokkaa kohti.",
    accuracyMetric: "Tarkkuus", selectMetricError: "Valitse vähintään yksi näytettävä mittari.",
    sceneClouds: "pilvipeite", balancedAccuracy: "tasapainotettu tarkkuus", macroF1: "makro-F1", kappa: "Cohenin kappa",
    run: "Käynnistä Sentinel-2-analyysi", signIn: "Kirjaudu sisään aloittaaksesi käsittelyn.", signInLink: "Kirjaudu sisään",
    running: "Käsitellään…", loading: "Ladataan…",
    reference: "Arviointi mittaa vastaavuutta ESA WorldCover 2021 -aineistoon, ei tarkkuutta riippumattomiin maastomittauksiin nähden. Tarkista kartta paikkatieto-ohjelmassa ennen operatiivista tai tieteellistä käyttöä.",
    result: "Käsittelyn tulos", reportTitle: "ML-tekninen raportti",
    reportDescription: "Toistettava vertailu koulutuksen ulkopuolelle jätetyissä alueellisissa lohkoissa.",
    scene: "Kuva", accuracy: "Alueellinen vastaavuus WorldCover-aineistoon",
    mapDownload: "Lataa värillinen GeoTIFF",
    mapBandNote: "Tavallinen 4-kanavainen RGBA-GeoTIFF värien näyttämiseen yleisissä katseluohjelmissa; luokkien selite on raportissa.",
    mapModel: "Viety malli", bands: "kaistat", indices: "indeksit",
    mapComparison: "RF/SVM-vertailussa käytetään samoja testinäytteitä.",
    macroWinner: (name: string) => `Suurin makro-F1 alueellisessa testissä: ${name}. Tämä ei ole maastovalidointi.`,
    opinionTitle: "Automaattinen tekninen arvio",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `Alueellisessa testissä ${winner} saa makro-F1-arvon ${winnerF1}, kun taas ${other} saa arvon ${otherF1}; se vastaa siksi paremmin vertailuaineistoa arvioidulla näytteellä ja alueella.`,
    opinionReference: "Vertailuluokitukset ovat peräisin ESA WorldCover 2021 -aineistosta, eivät riippumattomista maastomittauksista; mittarit eivät osoita kartan absoluuttista tarkkuutta.",
    opinionRecommendation: "Kartta soveltuu alustavaan tarkasteluun, mutta ei yksin riitä operatiivisiin tai tieteellisiin päätöksiin. Tarkista se paikkatieto-ohjelmassa ja vertaa alueen riippumattomiin tietoihin ennen käyttöä.",
    opinionDisclaimer: "Näytettyihin tuloksiin perustuva automaattinen yhteenveto; ei allekirjoitettu asiantuntijalausunto eikä ammatillinen sertifiointi.",
    classMetricsTitle: "Tulokset luokittain", className: "Luokka", precision: "Täsmällisyys", recall: "Kattavuus", f1: "F1", support: "Testinäytteet",
    confusionTitle: "Virhematriisi — Random Forest",
    confusionDescription: "Rivit: vertailuluokka · sarakkeet: ennustettu luokka",
    predicted: "Ennustettu", referenceLabel: "Vertailuarvo",
    featureTitle: "Piirteiden suhteellinen tärkeys",
    featureDescription: "RF: epäpuhtauteen perustuva tärkeys; SVM: standardoidun LinearSVC:n absoluuttisten kertoimien keskiarvo. Kuvailevia, eivät syy-yhteyttä osoittavia arvoja.",
    areaTitle: "Luokiteltu pinta-ala", areaHa: "Pinta-ala (ha)", methodTitle: "Menetelmä ja näytteet",
    sampleCounts: (training: number, test: number, block: number) => `${training} koulutusnäytettä · ${test} testinäytettä · alueelliset lohkot ${block} m.`,
    deepLearningNote: "EuroSAT-CNN-testi on erillinen AOI-kartasta. U-Net voidaan kouluttaa tässä WorldCover-korvaavilla luokituksilla; ne eivät ole riippumattomia maastomittauksia.",
    downloadError: "Karttaa ei voitu ladata.", failed: "Käsittely epäonnistui",
    sourcesTitle: "Työnkulun lähteet ja luettelot",
    sourcesDescription: "Työnkulku etsii Sentinel-2-kuvia Earth Search STAC -luettelosta ja käyttää ESA WorldCover 2021 -aineistoa koulutuksen ja validoinnin vertailutietona.",
    sources: [
      { label: "Työnkulussa käytetty Sentinel-2 STAC -luettelo", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · virallinen lähde", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · tutki Sentinel-kuvia", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · aineiston käyttö", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · scikit-learn-ohjeet", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · scikit-learn-ohjeet", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Tutustu aiheeseen liittyviin lähteisiin ja aineistoihin", portalLink: "Avaa data-analyysi",
  },
  uk: {
    ...copy.en,
    title: "Дистанційне зондування та машинне навчання",
    description: "Аналізуйте сцени Sentinel-2 L2A, порівнюйте класифікатори й створюйте GeoTIFF-карту.",
    intro: "Відтворюваний геопросторовий процес: Sentinel-2 L2A, маска хмарності SCL, спектральні індекси, порівняння Random Forest/SVM і тематична карта з роздільністю 10 метрів.",
    bbox: "Область дослідження WGS84 (захід, південь, схід, північ)",
    start: "Дата початку",
    end: "Дата завершення",
    clouds: "Максимальна хмарність (%)",
    mapModelLabel: "Модель для створення карти",
    svm: "Лінійна SVM",
    samplesPerClass: "Максимум вибірок на клас",
    spatialBlock: "Розмір блоку перевірки",
    selectedClasses: "Класи для включення",
    metricsToShow: "Метрики для показу",
    prepareUnet: "Підготувати дані U-Net (Sentinel-2 + проксі-мітки WorldCover)",
    prepareUnetNote: "До браузера передається стиснута вибіркова сітка (максимум 128×128); дані не зберігаються.",
    workflowTitle: "Обробка даних Sentinel-2 L2A",
    selectClassError: "Виберіть принаймні один клас WorldCover.",
    samplesError: "Укажіть від 100 до 2000 вибірок на клас.",
    accuracyMetric: "Точність",
    selectMetricError: "Виберіть принаймні одну метрику для показу.",
    sceneClouds: "хмарність",
    balancedAccuracy: "збалансована точність",
    macroF1: "макро F1",
    kappa: "каппа Коена",
    run: "Запустити аналіз Sentinel-2",
    signIn: "Увійдіть, щоб почати обробку.",
    signInLink: "Увійти",
    running: "Обробка…",
    loading: "Обробка…",
    reference: "Оцінка вимірює узгодженість з ESA WorldCover 2021, а не точність відносно незалежних наземних спостережень. Перевірте карту в ГІС перед використанням у практичних або наукових цілях.",
    result: "Результат обробки",
    reportTitle: "Технічний звіт ML",
    reportDescription: "Відтворюване порівняння на просторових блоках, вилучених із навчання.",
    scene: "Сцена",
    accuracy: "Просторова узгодженість з WorldCover",
    mapDownload: "Завантажити кольоровий GeoTIFF",
    mapBandNote: "Стандартний 4-канальний GeoTIFF RGBA для перегляду кольорів; легенда класів наведена у звіті.",
    mapModel: "Експортована модель",
    bands: "канали",
    indices: "індекси",
    mapComparison: "Порівняння RF/SVM використовує ті самі тестові вибірки.",
    macroWinner: (name: string) => `Найвище макро F1 на просторовому тесті: ${name}. Це не польова перевірка.`,
    opinionTitle: "Автоматизована технічна оцінка",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `На просторовому тесті ${winner} має макро F1 ${winnerF1} проти ${other} (${otherF1}); на оціненій вибірці він краще узгоджується з еталоном.`,
    opinionReference: "Еталонні мітки походять з ESA WorldCover 2021, а не з незалежних наземних спостережень; ці метрики не підтверджують абсолютну точність карти.",
    opinionRecommendation: "Карта придатна для попереднього вивчення, але сама по собі не підходить для практичних чи наукових рішень. Перед використанням перевірте її в ГІС і порівняйте з незалежними даними місцевості.",
    opinionDisclaimer: "Автоматизований підсумок за показаними результатами; це не підписаний експертний висновок і не професійна сертифікація.",
    classMetricsTitle: "Результати за класами",
    className: "Клас",
    precision: "Точність",
    recall: "Повнота",
    f1: "F1",
    support: "Тестові вибірки",
    confusionTitle: "Матриця помилок — Random Forest",
    confusionDescription: "Рядки: еталонний клас · стовпці: передбачений клас",
    predicted: "Передбачений",
    referenceLabel: "Еталон",
    featureTitle: "Відносна важливість ознак",
    featureDescription: "RF: важливість на основі неоднорідності; SVM: середні абсолютні коефіцієнти стандартизованої LinearSVC. Описові, не причинні показники.",
    areaTitle: "Класифікована площа",
    areaHa: "Площа (га)",
    methodTitle: "Метод і вибірки",
    sampleCounts: (training: number, test: number, block: number) => `${training} навчальних і ${test} тестових вибірок · просторові блоки ${block} м.`,
    deepLearningNote: "Тест CNN EuroSAT окремий від карти AOI. Тут можна навчити U-Net на проксі-мітках WorldCover; це не незалежні наземні спостереження.",
    downloadError: "Не вдалося завантажити карту.",
    failed: "Не вдалося виконати обробку",
    sourcesTitle: "Джерела й каталоги робочого процесу",
    sourcesDescription: "Робочий процес шукає сцени Sentinel-2 у каталозі Earth Search STAC і використовує ESA WorldCover 2021 як навчальне та контрольне джерело.",
    sources: [
      { label: "Каталог STAC Sentinel-2, який використовує робочий процес", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · офіційне джерело", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · перегляд знімків Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · доступ до даних", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · документація scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · документація scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Пов’язані джерела й набори даних",
    portalLink: "Відкрити аналіз даних",
  },
  cs: {
    ...copy.en,
    title: "Dálkový průzkum Země a strojové učení",
    description: "Analyzujte scény Sentinel-2 L2A, porovnávejte klasifikátory a vytvářejte mapu GeoTIFF pro svou zájmovou oblast.",
    intro: "Opakovatelný geoprostorový postup se Sentinel-2 L2A, maskou oblačnosti SCL, spektrálními indexy, porovnáním Random Forest/SVM a tematickou mapou s rozlišením 10 metrů.",
    bbox: "Zájmová oblast WGS84 (západ, jih, východ, sever)",
    start: "Počáteční datum", end: "Koncové datum", clouds: "Maximální oblačnost (%)",
    mapModelLabel: "Model použitý k vytvoření mapy", randomForest: "Random Forest", svm: "Lineární SVM",
    samplesPerClass: "Maximální počet vzorků na třídu", spatialBlock: "Velikost validačního bloku",
    selectedClasses: "Zahrnuté třídy", metricsToShow: "Zobrazované metriky",
    prepareUnet: "Připravit data U-Net (Sentinel-2 + zástupné štítky WorldCover)",
    prepareUnetNote: "Přenese do prohlížeče komprimovanou vzorkovanou mřížku (maximálně 128×128); data se neukládají.",
    workflowTitle: "Postup Sentinel-2 L2A",
    selectClassError: "Vyberte alespoň jednu třídu WorldCover.",
    samplesError: "Zadejte 100 až 2 000 vzorků na třídu.",
    accuracyMetric: "Přesnost", selectMetricError: "Vyberte alespoň jednu metriku k zobrazení.",
    sceneClouds: "oblačnost", balancedAccuracy: "vyvážená přesnost", macroF1: "makro F1", kappa: "Cohenovo kappa",
    run: "Spustit analýzu Sentinel-2", signIn: "Přihlaste se a spusťte zpracování.", signInLink: "Přihlásit se",
    running: "Probíhá zpracování…", loading: "Načítání…",
    reference: "Vyhodnocení měří shodu s ESA WorldCover 2021, nikoli přesnost vůči nezávislým terénním měřením. Před provozním či vědeckým použitím mapu zkontrolujte v GIS.",
    result: "Výsledek zpracování", reportTitle: "Technická zpráva ML",
    reportDescription: "Opakovatelné porovnání na prostorových blocích vynechaných z trénování.",
    scene: "Scéna", accuracy: "Prostorová shoda s WorldCover",
    mapDownload: "Stáhnout barevný GeoTIFF",
    mapBandNote: "Standardní čtyřpásmový RGBA GeoTIFF pro zobrazení barev v běžných prohlížečích; legenda tříd je ve zprávě.",
    mapModel: "Exportovaný model", bands: "pásma", indices: "indexy",
    mapComparison: "Porovnání RF/SVM používá stejné testovací vzorky.",
    macroWinner: (name: string) => `Nejvyšší makro F1 v prostorovém testu: ${name}. Nejde o terénní ověření.`,
    opinionTitle: "Automatizované technické posouzení",
    opinionSummary: (winner: string, winnerF1: string, other: string, otherF1: string) => `V prostorovém testu dosahuje ${winner} makro F1 ${winnerF1} oproti ${other} (${otherF1}); v hodnoceném vzorku a oblasti se tedy lépe shoduje s referencí.`,
    opinionReference: "Referenční štítky pocházejí z ESA WorldCover 2021, nikoli z nezávislých terénních měření; tyto metriky nedokládají absolutní přesnost mapy.",
    opinionRecommendation: "Mapa se hodí k předběžnému průzkumu, sama však nestačí pro provozní ani vědecká rozhodnutí. Před použitím ji zkontrolujte v GIS a porovnejte s nezávislými údaji z oblasti.",
    opinionDisclaimer: "Automatický souhrn zobrazených výsledků; nejde o podepsaný odborný posudek ani profesní certifikaci.",
    classMetricsTitle: "Výsledky podle tříd", className: "Třída", precision: "Preciznost", recall: "Úplnost", f1: "F1", support: "Testovací vzorky",
    confusionTitle: "Matice záměn — Random Forest",
    confusionDescription: "Řádky: referenční třída · sloupce: předpovězená třída",
    predicted: "Předpovězená", referenceLabel: "Reference",
    featureTitle: "Relativní důležitost proměnných",
    featureDescription: "RF: důležitost založená na nečistotě; SVM: průměr absolutních koeficientů standardizovaného LinearSVC. Popisné, nikoli příčinné hodnoty.",
    areaTitle: "Klasifikovaná plocha", areaHa: "Plocha (ha)", methodTitle: "Metoda a vzorky",
    sampleCounts: (training: number, test: number, block: number) => `${training} trénovacích vzorků · ${test} testovacích vzorků · prostorové bloky ${block} m.`,
    deepLearningNote: "Test CNN EuroSAT je oddělený od mapy AOI. Zde lze trénovat U-Net se zástupnými štítky WorldCover; nejde o nezávislá terénní měření.",
    downloadError: "Mapu se nepodařilo stáhnout.", failed: "Zpracování se nezdařilo",
    sourcesTitle: "Zdroje a katalogy pracovního postupu",
    sourcesDescription: "Postup vyhledává scény Sentinel-2 v katalogu STAC Earth Search a používá ESA WorldCover 2021 jako referenci pro trénování a ověření.",
    sources: [
      { label: "Katalog STAC Sentinel-2 používaný postupem", url: "https://earth-search.aws.element84.com/v1" },
      { label: "Copernicus Sentinel-2 · oficiální zdroj", url: "https://dataspace.copernicus.eu/explore-data/data-collections/sentinel-data/sentinel-2" },
      { label: "Copernicus Browser · prohlížení snímků Sentinel", url: "https://browser.dataspace.copernicus.eu/" },
      { label: "ESA WorldCover · přístup k datům", url: "https://esa-worldcover.org/en/data-access" },
      { label: "Random Forest · dokumentace scikit-learn", url: "https://scikit-learn.org/stable/modules/ensemble.html#forest" },
      { label: "SVM · dokumentace scikit-learn", url: "https://scikit-learn.org/stable/modules/svm.html" },
    ],
    portal: "Prozkoumat související zdroje a datové sady", portalLink: "Otevřít analýzu dat",
  },
};

const reportLabels: Record<
  AnalyticsReportLanguage,
  {
    scene: string;
    acquisitionDate: string;
    cloudCover: string;
    reference: string;
    mapModel: string;
    resolution: string;
    samples: string;
    training: string;
    test: string;
    metrics: string;
    areaByClass: string;
    perClassPerformance: string;
    featureImportance: string;
    limitations: string;
    thematicMap: string;
    acquisition: string;
    model: string;
    metricComparison: string;
    f1ByClass: string;
    estimatedAreaByClass: string;
    hectares: string;
    importance: string;
    referenceNote: string;
    reportTitle: string;
    accuracy: string;
    balancedAccuracy: string;
    macroF1: string;
    kappa: string;
    precision: string;
    recall: string;
    f1: string;
    support: string;
  }
> = {
  en: {
    scene: "Scene", acquisitionDate: "Acquisition date", cloudCover: "Cloud cover", reference: "Reference",
    mapModel: "Map model", resolution: "Resolution", samples: "Samples", training: "training", test: "test",
    metrics: "Metrics", areaByClass: "Area by class", perClassPerformance: "Per-class performance",
    featureImportance: "Feature importance", limitations: "Limitations", thematicMap: "Sentinel-2 thematic map",
    acquisition: "Acquisition", model: "Model", metricComparison: "Model metric comparison",
    f1ByClass: "F1 by class", estimatedAreaByClass: "Estimated area by class (hectares)",
    hectares: "Hectares", importance: "Importance",
    referenceNote: "Evaluation measures agreement with ESA WorldCover 2021, not accuracy against independent ground surveys.",
    reportTitle: "Sentinel-2 report",
    accuracy: "Accuracy", balancedAccuracy: "Balanced accuracy", macroF1: "Macro F1", kappa: "Cohen's kappa",
    precision: "Precision", recall: "Recall", f1: "F1", support: "Test samples",
  },
  it: {
    scene: "Scena", acquisitionDate: "Data acquisizione", cloudCover: "Copertura nuvolosa", reference: "Riferimento",
    mapModel: "Modello mappa", resolution: "Risoluzione", samples: "Campioni", training: "addestramento", test: "test",
    metrics: "Metriche", areaByClass: "Superficie per classe", perClassPerformance: "Prestazioni per classe",
    featureImportance: "Importanza delle variabili", limitations: "Limiti", thematicMap: "Mappa tematica Sentinel-2",
    acquisition: "Acquisizione", model: "Modello", metricComparison: "Confronto delle metriche del modello",
    f1ByClass: "F1 per classe", estimatedAreaByClass: "Superficie stimata per classe (ettari)",
    hectares: "Ettari", importance: "Importanza",
    referenceNote: "La valutazione misura l'accordo con ESA WorldCover 2021, non l'accuratezza rispetto a rilievi a terra indipendenti.",
    reportTitle: "Rapporto Sentinel-2",
    accuracy: "Accuratezza", balancedAccuracy: "Accuratezza bilanciata", macroF1: "F1 macro", kappa: "Kappa di Cohen",
    precision: "Precisione", recall: "Richiamo", f1: "F1", support: "Campioni test",
  },
  es: {
    scene: "Escena", acquisitionDate: "Fecha de adquisición", cloudCover: "Cobertura de nubes", reference: "Referencia",
    mapModel: "Modelo del mapa", resolution: "Resolución", samples: "Muestras", training: "entrenamiento", test: "prueba",
    metrics: "Métricas", areaByClass: "Superficie por clase", perClassPerformance: "Rendimiento por clase",
    featureImportance: "Importancia de las variables", limitations: "Limitaciones", thematicMap: "Mapa temático Sentinel-2",
    acquisition: "Adquisición", model: "Modelo", metricComparison: "Comparación de métricas del modelo",
    f1ByClass: "F1 por clase", estimatedAreaByClass: "Superficie estimada por clase (hectáreas)",
    hectares: "Hectáreas", importance: "Importancia",
    referenceNote: "La evaluación mide la coincidencia con ESA WorldCover 2021, no la precisión frente a mediciones independientes sobre el terreno.",
    reportTitle: "Informe Sentinel-2",
    accuracy: "Exactitud", balancedAccuracy: "Exactitud equilibrada", macroF1: "F1 macro", kappa: "Kappa de Cohen",
    precision: "Precisión", recall: "Exhaustividad", f1: "F1", support: "Muestras de prueba",
  },
  fr: {
    scene: "Scène", acquisitionDate: "Date d'acquisition", cloudCover: "Couverture nuageuse", reference: "Référence",
    mapModel: "Modèle de carte", resolution: "Résolution", samples: "Échantillons", training: "entraînement", test: "test",
    metrics: "Mesures", areaByClass: "Surface par classe", perClassPerformance: "Performances par classe",
    featureImportance: "Importance des variables", limitations: "Limites", thematicMap: "Carte thématique Sentinel-2",
    acquisition: "Acquisition", model: "Modèle", metricComparison: "Comparaison des mesures du modèle",
    f1ByClass: "F1 par classe", estimatedAreaByClass: "Surface estimée par classe (hectares)",
    hectares: "Hectares", importance: "Importance",
    referenceNote: "L'évaluation mesure l'accord avec ESA WorldCover 2021, et non la précision par rapport à des relevés indépendants sur le terrain.",
    reportTitle: "Rapport Sentinel-2",
    accuracy: "Exactitude", balancedAccuracy: "Exactitude équilibrée", macroF1: "F1 macro", kappa: "Kappa de Cohen",
    precision: "Précision", recall: "Rappel", f1: "F1", support: "Échantillons de test",
  },
  de: {
    scene: "Szene", acquisitionDate: "Aufnahmedatum", cloudCover: "Wolkenbedeckung", reference: "Referenz",
    mapModel: "Kartenmodell", resolution: "Auflösung", samples: "Stichproben", training: "Training", test: "Test",
    metrics: "Metriken", areaByClass: "Fläche nach Klasse", perClassPerformance: "Leistung nach Klasse",
    featureImportance: "Merkmalsrelevanz", limitations: "Einschränkungen", thematicMap: "Thematische Sentinel-2-Karte",
    acquisition: "Aufnahme", model: "Modell", metricComparison: "Vergleich der Modellmetriken",
    f1ByClass: "F1 nach Klasse", estimatedAreaByClass: "Geschätzte Fläche nach Klasse (Hektar)",
    hectares: "Hektar", importance: "Relevanz",
    referenceNote: "Die Bewertung misst die Übereinstimmung mit ESA WorldCover 2021, nicht die Genauigkeit gegenüber unabhängigen Bodenmessungen.",
    reportTitle: "Sentinel-2-Bericht",
    accuracy: "Genauigkeit", balancedAccuracy: "Ausgewogene Genauigkeit", macroF1: "Makro-F1", kappa: "Cohen-Kappa",
    precision: "Präzision", recall: "Trefferquote", f1: "F1", support: "Teststichproben",
  },
  pt: {
    scene: "Cena", acquisitionDate: "Data de aquisição", cloudCover: "Cobertura de nuvens", reference: "Referência",
    mapModel: "Modelo do mapa", resolution: "Resolução", samples: "Amostras", training: "treino", test: "teste",
    metrics: "Métricas", areaByClass: "Área por classe", perClassPerformance: "Desempenho por classe",
    featureImportance: "Importância das variáveis", limitations: "Limitações", thematicMap: "Mapa temático Sentinel-2",
    acquisition: "Aquisição", model: "Modelo", metricComparison: "Comparação das métricas do modelo",
    f1ByClass: "F1 por classe", estimatedAreaByClass: "Área estimada por classe (hectares)",
    hectares: "Hectares", importance: "Importância",
    referenceNote: "A avaliação mede a concordância com o ESA WorldCover 2021, não a precisão face a medições independentes no terreno.",
    reportTitle: "Relatório Sentinel-2",
    accuracy: "Exatidão", balancedAccuracy: "Exatidão equilibrada", macroF1: "F1 macro", kappa: "Kappa de Cohen",
    precision: "Precisão", recall: "Revocação", f1: "F1", support: "Amostras de teste",
  },
  ru: {
    scene: "Сцена", acquisitionDate: "Дата съёмки", cloudCover: "Облачность", reference: "Эталон",
    mapModel: "Модель карты", resolution: "Разрешение", samples: "Выборки", training: "обучение", test: "тестирование",
    metrics: "Метрики", areaByClass: "Площадь по классам", perClassPerformance: "Результаты по классам",
    featureImportance: "Важность признаков", limitations: "Ограничения", thematicMap: "Тематическая карта Sentinel-2",
    acquisition: "Съёмка", model: "Модель", metricComparison: "Сравнение метрик моделей",
    f1ByClass: "F1 по классам", estimatedAreaByClass: "Расчётная площадь по классам (гектары)",
    hectares: "Гектары", importance: "Важность",
    referenceNote: "Оценка измеряет согласие с ESA WorldCover 2021, а не точность относительно независимых наземных измерений.",
    reportTitle: "Отчёт Sentinel-2",
    accuracy: "Точность", balancedAccuracy: "Сбалансированная точность", macroF1: "Макро F1", kappa: "Каппа Коэна",
    precision: "Точность", recall: "Полнота", f1: "F1", support: "Тестовые выборки",
  },
  pl: {
    scene: "Scena", acquisitionDate: "Data pozyskania", cloudCover: "Zachmurzenie", reference: "Źródło odniesienia",
    mapModel: "Model mapy", resolution: "Rozdzielczość", samples: "Próbki", training: "treningowe", test: "testowe",
    metrics: "Metryki", areaByClass: "Powierzchnia według klas", perClassPerformance: "Wyniki według klas",
    featureImportance: "Ważność cech", limitations: "Ograniczenia", thematicMap: "Mapa tematyczna Sentinel-2",
    acquisition: "Pozyskanie", model: "Model", metricComparison: "Porównanie metryk modeli",
    f1ByClass: "F1 według klas", estimatedAreaByClass: "Szacowana powierzchnia według klas (hektary)",
    hectares: "Hektary", importance: "Ważność",
    referenceNote: "Ocena mierzy zgodność z ESA WorldCover 2021, a nie dokładność względem niezależnych pomiarów terenowych.",
    reportTitle: "Raport Sentinel-2",
    accuracy: "Dokładność", balancedAccuracy: "Zrównoważona dokładność", macroF1: "Makro F1", kappa: "Kappa Cohena",
    precision: "Precyzja", recall: "Czułość", f1: "F1", support: "Próbki testowe",
  },
  nl: {
    scene: "Scène", acquisitionDate: "Opnamedatum", cloudCover: "Bewolking", reference: "Referentie",
    mapModel: "Kaartmodel", resolution: "Resolutie", samples: "Voorbeelden", training: "training", test: "test",
    metrics: "Metrieken", areaByClass: "Oppervlakte per klasse", perClassPerformance: "Prestaties per klasse",
    featureImportance: "Kenmerkbelang", limitations: "Beperkingen", thematicMap: "Thematische Sentinel-2-kaart",
    acquisition: "Opname", model: "Model", metricComparison: "Vergelijking van modelmetriek",
    f1ByClass: "F1 per klasse", estimatedAreaByClass: "Geschatte oppervlakte per klasse (hectare)",
    hectares: "Hectare", importance: "Belang",
    referenceNote: "De evaluatie meet de overeenkomst met ESA WorldCover 2021, niet de nauwkeurigheid ten opzichte van onafhankelijke veldmetingen.",
    reportTitle: "Sentinel-2-rapport",
    accuracy: "Nauwkeurigheid", balancedAccuracy: "Gebalanceerde nauwkeurigheid", macroF1: "Macro F1", kappa: "Cohen's kappa",
    precision: "Precisie", recall: "Recall", f1: "F1", support: "Testvoorbeelden",
  },
  tr: {
    scene: "Sahne", acquisitionDate: "Çekim tarihi", cloudCover: "Bulutluluk", reference: "Referans",
    mapModel: "Harita modeli", resolution: "Çözünürlük", samples: "Örnekler", training: "eğitim", test: "test",
    metrics: "Metrikler", areaByClass: "Sınıfa göre alan", perClassPerformance: "Sınıfa göre performans",
    featureImportance: "Özellik önemleri", limitations: "Sınırlamalar", thematicMap: "Sentinel-2 tematik haritası",
    acquisition: "Çekim", model: "Model", metricComparison: "Model metriklerinin karşılaştırması",
    f1ByClass: "Sınıfa göre F1", estimatedAreaByClass: "Sınıfa göre tahmini alan (hektar)",
    hectares: "Hektar", importance: "Önem",
    referenceNote: "Değerlendirme, bağımsız arazi ölçümlerine göre doğruluğu değil, ESA WorldCover 2021 ile uyumu ölçer.",
    reportTitle: "Sentinel-2 raporu",
    accuracy: "Doğruluk", balancedAccuracy: "Dengeli doğruluk", macroF1: "Makro F1", kappa: "Cohen kappa",
    precision: "Kesinlik", recall: "Duyarlılık", f1: "F1", support: "Test örnekleri",
  },
  sv: {
    scene: "Scen", acquisitionDate: "Insamlingsdatum", cloudCover: "Molntäcke", reference: "Referens",
    mapModel: "Kartmodell", resolution: "Upplösning", samples: "Urval", training: "träning", test: "test",
    metrics: "Mått", areaByClass: "Areal per klass", perClassPerformance: "Prestanda per klass",
    featureImportance: "Variabelbetydelse", limitations: "Begränsningar", thematicMap: "Tematisk Sentinel-2-karta",
    acquisition: "Insamling", model: "Modell", metricComparison: "Jämförelse av modellmått",
    f1ByClass: "F1 per klass", estimatedAreaByClass: "Beräknad areal per klass (hektar)",
    hectares: "Hektar", importance: "Betydelse",
    referenceNote: "Utvärderingen mäter överensstämmelse med ESA WorldCover 2021, inte noggrannhet mot oberoende fältmätningar.",
    reportTitle: "Sentinel-2-rapport",
    accuracy: "Träffsäkerhet", balancedAccuracy: "Balanserad träffsäkerhet", macroF1: "Makro F1", kappa: "Cohens kappa",
    precision: "Precision", recall: "Återkallning", f1: "F1", support: "Testexempel",
  },
  da: {
    scene: "Scene", acquisitionDate: "Optagelsesdato", cloudCover: "Skydække", reference: "Reference",
    mapModel: "Kortmodel", resolution: "Opløsning", samples: "Prøver", training: "træning", test: "test",
    metrics: "Målinger", areaByClass: "Areal pr. klasse", perClassPerformance: "Ydeevne pr. klasse",
    featureImportance: "Variabelbetydning", limitations: "Begrænsninger", thematicMap: "Tematisk Sentinel-2-kort",
    acquisition: "Optagelse", model: "Model", metricComparison: "Sammenligning af modelmålinger",
    f1ByClass: "F1 pr. klasse", estimatedAreaByClass: "Estimeret areal pr. klasse (hektar)",
    hectares: "Hektar", importance: "Betydning",
    referenceNote: "Evalueringen måler overensstemmelse med ESA WorldCover 2021, ikke nøjagtighed i forhold til uafhængige feltmålinger.",
    reportTitle: "Sentinel-2-rapport",
    accuracy: "Nøjagtighed", balancedAccuracy: "Balanceret nøjagtighed", macroF1: "Makro F1", kappa: "Cohens kappa",
    precision: "Præcision", recall: "Genkaldelse", f1: "F1", support: "Testprøver",
  },
  no: {
    scene: "Scene", acquisitionDate: "Opptaksdato", cloudCover: "Skydekke", reference: "Referanse",
    mapModel: "Kartmodell", resolution: "Oppløsning", samples: "Utvalg", training: "trening", test: "test",
    metrics: "Målinger", areaByClass: "Areal per klasse", perClassPerformance: "Ytelse per klasse",
    featureImportance: "Variabelbetydning", limitations: "Begrensninger", thematicMap: "Tematisk Sentinel-2-kart",
    acquisition: "Opptak", model: "Modell", metricComparison: "Sammenligning av modellmålinger",
    f1ByClass: "F1 per klasse", estimatedAreaByClass: "Beregnet areal per klasse (hektar)",
    hectares: "Hektar", importance: "Betydning",
    referenceNote: "Evalueringen måler samsvar med ESA WorldCover 2021, ikke nøyaktighet mot uavhengige feltmålinger.",
    reportTitle: "Sentinel-2-rapport",
    accuracy: "Nøyaktighet", balancedAccuracy: "Balansert nøyaktighet", macroF1: "Makro F1", kappa: "Cohens kappa",
    precision: "Presisjon", recall: "Gjenkalling", f1: "F1", support: "Testeksempler",
  },
  fi: {
    scene: "Kuva", acquisitionDate: "Kuvauspäivä", cloudCover: "Pilvisyys", reference: "Vertailuaineisto",
    mapModel: "Karttamalli", resolution: "Erotuskyky", samples: "Havainnot", training: "opetus", test: "testi",
    metrics: "Tunnusluvut", areaByClass: "Pinta-ala luokittain", perClassPerformance: "Suorituskyky luokittain",
    featureImportance: "Piirteiden tärkeys", limitations: "Rajoitukset", thematicMap: "Sentinel-2-teemakartta",
    acquisition: "Kuvaus", model: "Malli", metricComparison: "Mallien tunnuslukujen vertailu",
    f1ByClass: "F1 luokittain", estimatedAreaByClass: "Arvioitu pinta-ala luokittain (hehtaaria)",
    hectares: "Hehtaaria", importance: "Tärkeys",
    referenceNote: "Arviointi mittaa yhtäpitävyyttä ESA WorldCover 2021:n kanssa, ei tarkkuutta riippumattomiin maastomittauksiin nähden.",
    reportTitle: "Sentinel-2-raportti",
    accuracy: "Tarkkuus", balancedAccuracy: "Tasapainotettu tarkkuus", macroF1: "Makro F1", kappa: "Cohenin kappa",
    precision: "Täsmällisyys", recall: "Saanti", f1: "F1", support: "Testihavainnot",
  },
  uk: {
    scene: "Сцена", acquisitionDate: "Дата знімання", cloudCover: "Хмарність", reference: "Еталон",
    mapModel: "Модель карти", resolution: "Роздільність", samples: "Вибірки", training: "навчальні", test: "тестові",
    metrics: "Метрики", areaByClass: "Площа за класами", perClassPerformance: "Результати за класами",
    featureImportance: "Важливість ознак", limitations: "Обмеження", thematicMap: "Тематична карта Sentinel-2",
    acquisition: "Знімання", model: "Модель", metricComparison: "Порівняння метрик моделей",
    f1ByClass: "F1 за класами", estimatedAreaByClass: "Розрахункова площа за класами (гектари)",
    hectares: "Гектари", importance: "Важливість",
    referenceNote: "Оцінка вимірює узгодженість з ESA WorldCover 2021, а не точність відносно незалежних наземних спостережень.",
    reportTitle: "Звіт Sentinel-2",
    accuracy: "Точність", balancedAccuracy: "Збалансована точність", macroF1: "Макро F1", kappa: "Каппа Коена",
    precision: "Точність", recall: "Повнота", f1: "F1", support: "Тестові вибірки",
  },
  cs: {
    scene: "Scéna", acquisitionDate: "Datum pořízení", cloudCover: "Oblačnost", reference: "Referenční zdroj",
    mapModel: "Model mapy", resolution: "Rozlišení", samples: "Vzorky", training: "trénovací", test: "testovací",
    metrics: "Metriky", areaByClass: "Plocha podle tříd", perClassPerformance: "Výsledky podle tříd",
    featureImportance: "Důležitost příznaků", limitations: "Omezení", thematicMap: "Tematická mapa Sentinel-2",
    acquisition: "Pořízení", model: "Model", metricComparison: "Porovnání metrik modelů",
    f1ByClass: "F1 podle tříd", estimatedAreaByClass: "Odhadovaná plocha podle tříd (hektary)",
    hectares: "Hektary", importance: "Důležitost",
    referenceNote: "Hodnocení měří shodu s ESA WorldCover 2021, nikoli přesnost vůči nezávislým terénním měřením.",
    reportTitle: "Zpráva Sentinel-2",
    accuracy: "Přesnost", balancedAccuracy: "Vyvážená přesnost", macroF1: "Makro F1", kappa: "Cohenova kappa",
    precision: "Preciznost", recall: "Úplnost", f1: "F1", support: "Testovací vzorky",
  },
};

const WORLDCOVER_CLASS_OPTIONS = [
  { code: 10, name: "Alberi", color: "#176b3a" },
  { code: 20, name: "Arbusteti", color: "#d6c77a" },
  { code: 30, name: "Praterie", color: "#b8dc8a" },
  { code: 40, name: "Colture", color: "#e7d34a" },
  { code: 50, name: "Edificato", color: "#d83232" },
  { code: 60, name: "Suolo nudo", color: "#b9a092" },
  { code: 70, name: "Neve e ghiaccio", color: "#dce9f4" },
  { code: 80, name: "Acqua", color: "#3478c8" },
  { code: 90, name: "Zone umide", color: "#4bb8a4" },
  { code: 95, name: "Mangrovie", color: "#64a878" },
  { code: 100, name: "Licheni e muschi", color: "#9dba7a" },
] as const;

function formatReportNumber(
  value: number,
  language: import("@/lib/sentinelReportLocalization").ReportLanguage,
  maximumFractionDigits = 3
) {
  return formatSentinelNumber(value, language, maximumFractionDigits);
}

type MetricKey = "accuracy" | "balancedAccuracy" | "macroF1" | "kappa";
type SpatialBlockMeters = 250 | 500 | 1000;

export default function RemoteSensing() {
  const { language } = useLanguage();
  const reportLanguage = normalizeSentinelReportLanguage(language);
  const analyticsReportLanguage = resolveAnalyticsReportLanguage(language);
  const text = pageCopy[reportLanguage] ?? pageCopy.en;
  const reportText = reportLabels[analyticsReportLanguage];
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bbox, setBbox] = useState("12.48, 41.65, 12.55, 41.70");
  const [startDate, setStartDate] = useState("2021-06-01");
  const [endDate, setEndDate] = useState("2021-08-31");
  const [maxCloudCover, setMaxCloudCover] = useState("30");
  const [mapModel, setMapModel] = useState<"randomForest" | "svm">(
    "randomForest"
  );
  const [maxSamplesPerClass, setMaxSamplesPerClass] = useState("900");
  const [spatialBlockMeters, setSpatialBlockMeters] =
    useState<SpatialBlockMeters>(500);
  const [selectedClasses, setSelectedClasses] = useState<number[]>(
    WORLDCOVER_CLASS_OPTIONS.map(({ code }) => code)
  );
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>([
    "accuracy",
    "balancedAccuracy",
    "macroF1",
    "kappa",
  ]);
  const [includeUnetData, setIncludeUnetData] = useState(true);
  const [job, setJob] = useState<SentinelAoiJob | null>(null);
  const [error, setError] = useState("");
  const [downloadBusy, setDownloadBusy] = useState(false);
  const startMutation = trpc.dataInsight.startRemoteSensing.useMutation();
  const isRunning = startMutation.isPending;

  const runAnalysis = async () => {
    setError("");
    setJob(null);
    const coordinates = bbox.split(",").map(part => Number(part.trim()));
    if (
      coordinates.length !== 4 ||
      coordinates.some(value => !Number.isFinite(value))
    ) {
      setError(text.bbox);
      return;
    }
    if (selectedClasses.length === 0) {
      setError(text.selectClassError);
      return;
    }
    if (visibleMetrics.length === 0) {
      setError(text.selectMetricError);
      return;
    }
    const sampleLimit = Number(maxSamplesPerClass);
    if (
      !Number.isInteger(sampleLimit) ||
      sampleLimit < 100 ||
      sampleLimit > 2000
    ) {
      setError(text.samplesError);
      return;
    }
    try {
      const completedJob = await startMutation.mutateAsync({
        bbox: coordinates,
        startDate,
        endDate,
        maxCloudCover: Number(maxCloudCover),
        mapModel,
        maxSamplesPerClass: sampleLimit,
        spatialBlockMeters,
        selectedClasses,
        includeUnetData,
      });
      setJob(completedJob);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const downloadMap = async () => {
    setError("");
    setDownloadBusy(true);
    try {
      if (!job?.mapDataBase64) throw new Error(text.downloadError);
      const bytes = Uint8Array.from(atob(job.mapDataBase64), character =>
        character.charCodeAt(0)
      );
      const blob = new Blob([bytes], { type: "image/tiff" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sentinel-2-classification-rgb-${job.jobId}.tif`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.downloadError);
    } finally {
      setDownloadBusy(false);
    }
  };

  const result = job?.result;
  const modelMetrics = result
    ? [
        { name: "Random Forest", metrics: result.models.randomForest },
        {
          name: localizeSentinelModelName(
            result.models.svm.name,
            reportLanguage
          ),
          metrics: result.models.svm,
        },
      ]
    : [];
  const metricOptions: Array<{ key: MetricKey; label: string }> = [
    { key: "accuracy", label: text.accuracyMetric },
    { key: "balancedAccuracy", label: text.balancedAccuracy },
    { key: "macroF1", label: text.macroF1 },
    { key: "kappa", label: text.kappa },
  ];
  const toggleSelectedClass = (code: number) => {
    setSelectedClasses(current =>
      current.includes(code)
        ? current.filter(value => value !== code)
        : [...current, code]
    );
  };
  const toggleVisibleMetric = (key: MetricKey) => {
    setVisibleMetrics(current =>
      current.includes(key)
        ? current.filter(value => value !== key)
        : [...current, key]
    );
  };
  const macroF1WinnerModel = result
    ? result.models.randomForest.macroF1 >= result.models.svm.macroF1
      ? result.models.randomForest
      : result.models.svm
    : undefined;
  const macroF1OtherModel =
    result && macroF1WinnerModel
      ? macroF1WinnerModel === result.models.randomForest
        ? result.models.svm
        : result.models.randomForest
      : undefined;
  const macroF1Leader = macroF1WinnerModel
    ? localizeSentinelModelName(macroF1WinnerModel.name, reportLanguage)
    : "";
  const reportConclusion: AnalyticsReportConclusion | undefined =
    macroF1WinnerModel && macroF1OtherModel
      ? {
          title: text.opinionTitle,
          content: [
            text.opinionSummary(
              localizeSentinelModelName(
                macroF1WinnerModel.name,
                reportLanguage
              ),
              formatReportNumber(macroF1WinnerModel.macroF1, reportLanguage),
              localizeSentinelModelName(macroF1OtherModel.name, reportLanguage),
              formatReportNumber(macroF1OtherModel.macroF1, reportLanguage)
            ),
            text.opinionReference,
            text.opinionRecommendation,
            text.opinionDisclaimer,
          ].join("\n\n"),
        }
      : undefined;
  const classPerformance = result
    ? result.models.randomForest.perClass.map(randomForestClass => ({
        ...randomForestClass,
        svm: result.models.svm.perClass.find(
          metric => metric.code === randomForestClass.code
        ),
        color:
          result.classLegend.find(item => item.code === randomForestClass.code)
            ?.color ?? "#94a3b8",
      }))
    : [];
  const confusionCodes = result?.models.randomForest.confusionClassCodes ?? [];
  const reportContent =
    result && job
      ? [
          `${reportText.scene}: ${result.scene.id}`,
          `${reportText.acquisitionDate}: ${result.scene.datetime}`,
          `${reportText.cloudCover}: ${formatReportNumber(result.scene.tileCloudCoverPercent, reportLanguage, 1)}%`,
          `${reportText.reference}: ${result.reference.name} — ${reportText.referenceNote}`,
          `${reportText.mapModel}: ${localizeSentinelMapModelName(result.processing.mapModel, reportLanguage)}`,
          `${reportText.resolution}: ${formatReportNumber(result.processing.pixelSizeMeters, reportLanguage, 0)} m`,
          `${reportText.samples}: ${formatReportNumber(result.processing.trainingSampleCount, reportLanguage, 0)} ${reportText.training}, ${formatReportNumber(result.processing.testSampleCount, reportLanguage, 0)} ${reportText.test}`,
          "",
          `${reportText.metrics} Random Forest:`,
          `${reportText.accuracy}: ${formatReportNumber(result.models.randomForest.accuracy, reportLanguage)}`,
          `${reportText.balancedAccuracy}: ${formatReportNumber(result.models.randomForest.balancedAccuracy, reportLanguage)}`,
          `${reportText.macroF1}: ${formatReportNumber(result.models.randomForest.macroF1, reportLanguage)}`,
          `${reportText.kappa}: ${formatReportNumber(result.models.randomForest.kappa, reportLanguage)}`,
          "",
          `${reportText.metrics} ${localizeSentinelModelName(result.models.svm.name, reportLanguage)}:`,
          `${reportText.accuracy}: ${formatReportNumber(result.models.svm.accuracy, reportLanguage)}`,
          `${reportText.balancedAccuracy}: ${formatReportNumber(result.models.svm.balancedAccuracy, reportLanguage)}`,
          `${reportText.macroF1}: ${formatReportNumber(result.models.svm.macroF1, reportLanguage)}`,
          `${reportText.kappa}: ${formatReportNumber(result.models.svm.kappa, reportLanguage)}`,
          "",
          `${reportText.areaByClass}:`,
          ...result.classAreas.map(
            area =>
              `${localizeSentinelWorldCoverName(area.name, reportLanguage)}: ${formatReportNumber(area.areaHa, reportLanguage, 2)} ha`
          ),
          "",
          `${reportText.perClassPerformance} — Random Forest:`,
          ...result.models.randomForest.perClass.map(
            metric =>
              `${localizeSentinelWorldCoverName(metric.className, reportLanguage)}: ${reportText.precision} ${formatReportNumber(metric.precision, reportLanguage)}, ${reportText.recall} ${formatReportNumber(metric.recall, reportLanguage)}, ${reportText.f1} ${formatReportNumber(metric.f1, reportLanguage)}, ${reportText.support} ${formatReportNumber(metric.support, reportLanguage, 0)}`
          ),
          "",
          `${reportText.perClassPerformance} — ${localizeSentinelModelName(result.models.svm.name, reportLanguage)}:`,
          ...result.models.svm.perClass.map(
            metric =>
              `${localizeSentinelWorldCoverName(metric.className, reportLanguage)}: ${reportText.precision} ${formatReportNumber(metric.precision, reportLanguage)}, ${reportText.recall} ${formatReportNumber(metric.recall, reportLanguage)}, ${reportText.f1} ${formatReportNumber(metric.f1, reportLanguage)}, ${reportText.support} ${formatReportNumber(metric.support, reportLanguage, 0)}`
          ),
          "",
          `${reportText.featureImportance} — Random Forest:`,
          ...result.models.randomForest.featureImportance.map(
            feature =>
              `${feature.name}: ${formatReportNumber(feature.importance, reportLanguage)}`
          ),
          "",
          `${reportText.limitations}:`,
          ...result.limitations.map(limitation =>
            localizeSentinelLimitation(limitation, reportLanguage)
          ),
        ].join("\n")
      : "";
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!result) return [];
    const metricNames = [
      reportText.accuracy,
      reportText.balancedAccuracy,
      reportText.macroF1,
      reportText.kappa,
    ];
    const displayClassName = (code: number) =>
      localizeSentinelWorldCoverName(
        result.classLegend.find(item => item.code === code)?.name ??
          String(code),
        reportLanguage
      );
    const modelMetricValues = (
      model: SentinelAoiJob["result"]["models"]["randomForest"]
    ) => [model.accuracy, model.balancedAccuracy, model.macroF1, model.kappa];
    const confusionCodes = result.models.randomForest.confusionClassCodes;
    const confusionLabels = confusionCodes.map(displayClassName);
    const visuals: AnalyticsReportVisual[] = [
      {
        type: "image",
        title: `${reportText.thematicMap} — ${result.scene.id}`,
        dataUrl: result.mapImage,
        caption: `${reportText.acquisition}: ${result.scene.datetime}. ${reportText.cloudCover}: ${formatReportNumber(result.scene.tileCloudCoverPercent, reportLanguage, 1)}%. ${reportText.resolution}: ${formatReportNumber(result.processing.pixelSizeMeters, reportLanguage, 0)} m. ${reportText.model}: ${localizeSentinelMapModelName(result.processing.mapModel, reportLanguage)}. ${reportText.reference}: ${result.reference.name} — ${reportText.referenceNote}`,
        legend: result.classLegend.map(item => ({
          label: localizeSentinelWorldCoverName(item.name, reportLanguage),
          color: item.color,
        })),
      },
      {
        type: "chart",
        title: reportText.metricComparison,
        chartType: "bar",
        categories: metricNames,
        series: [
          {
            name: "Random Forest",
            color: "#2563eb",
            values: modelMetricValues(result.models.randomForest),
          },
          {
            name: localizeSentinelModelName(
              result.models.svm.name,
              reportLanguage
            ),
            color: "#16a34a",
            values: modelMetricValues(result.models.svm),
          },
        ],
        minValue: 0,
        maxValue: 1,
      },
      {
        type: "chart",
        title: reportText.f1ByClass,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.randomForest.perClass.map(metric =>
          localizeSentinelWorldCoverName(metric.className, reportLanguage)
        ),
        series: [
          {
            name: "Random Forest",
            color: "#2563eb",
            values: result.models.randomForest.perClass.map(
              metric => metric.f1
            ),
          },
          {
            name: localizeSentinelModelName(
              result.models.svm.name,
              reportLanguage
            ),
            color: "#16a34a",
            values: result.models.randomForest.perClass.map(
              metric =>
                result.models.svm.perClass.find(
                  svmMetric => svmMetric.code === metric.code
                )?.f1 ?? 0
            ),
          },
        ],
        minValue: 0,
        maxValue: 1,
      },
      {
        type: "chart",
        title: reportText.estimatedAreaByClass,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.classAreas.map(area =>
          localizeSentinelWorldCoverName(area.name, reportLanguage)
        ),
        series: [
          {
            name: reportText.hectares,
            color: "#0f766e",
            values: result.classAreas.map(area => area.areaHa),
          },
        ],
        minValue: 0,
      },
      {
        type: "chart",
        title: `${reportText.featureImportance} — Random Forest`,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.randomForest.featureImportance.map(
          feature => feature.name
        ),
        series: [
          {
            name: reportText.importance,
            color: "#9333ea",
            values: result.models.randomForest.featureImportance.map(
              feature => feature.importance
            ),
          },
        ],
        minValue: 0,
      },
    ];
    if (
      confusionLabels.length &&
      result.models.randomForest.confusionMatrix.length
    ) {
      visuals.push({
        type: "matrix",
        title: text.confusionTitle,
        rowLabels: confusionLabels,
        columnLabels: confusionLabels,
        values: result.models.randomForest.confusionMatrix,
      });
    }
    return visuals;
  }, [language, reportText, result, reportLanguage, text]);

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${text.title} | Tatik.space`}
        description={text.description}
        path="/analysis/remote-sensing"
        language={language}
      />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <Satellite className="h-4 w-4 text-primary" /> {text.title}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            {text.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            {text.intro}
          </p>
        </div>
      </section>
      <section className="container max-w-6xl space-y-8 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              {text.workflowTitle}
            </CardTitle>
            <CardDescription>{text.reference}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnalyticsUsageNotice language={analyticsReportLanguage} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                {text.bbox}
                <Input
                  value={bbox}
                  onChange={event => setBbox(event.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm font-medium">
                  {text.start}
                  <Input
                    type="date"
                    value={startDate}
                    onChange={event => setStartDate(event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  {text.end}
                  <Input
                    type="date"
                    value={endDate}
                    onChange={event => setEndDate(event.target.value)}
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium">
                {text.clouds}
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={maxCloudCover}
                  onChange={event => setMaxCloudCover(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.mapModelLabel}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={mapModel}
                  onChange={event => {
                    if (
                      event.target.value === "randomForest" ||
                      event.target.value === "svm"
                    ) {
                      setMapModel(event.target.value);
                    }
                  }}
                >
                  <option value="randomForest">{text.randomForest}</option>
                  <option value="svm">{text.svm}</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.samplesPerClass}
                <Input
                  type="number"
                  min="100"
                  max="2000"
                  step="100"
                  value={maxSamplesPerClass}
                  onChange={event => setMaxSamplesPerClass(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                {text.spatialBlock}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={spatialBlockMeters}
                  onChange={event => {
                    const value = Number(event.target.value);
                    if (value === 250 || value === 500 || value === 1000)
                      setSpatialBlockMeters(value);
                  }}
                >
                  <option value={250}>250 m</option>
                  <option value={500}>500 m</option>
                  <option value={1000}>1000 m</option>
                </select>
              </label>
              <fieldset className="space-y-2 rounded-md border p-3 md:col-span-2">
                <legend className="px-1 text-sm font-medium">
                  {text.selectedClasses}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {WORLDCOVER_CLASS_OPTIONS.map(item => (
                    <label
                      key={item.code}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(item.code)}
                        onChange={() => toggleSelectedClass(item.code)}
                      />
                      <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      {localizeSentinelWorldCoverName(
                        item.name,
                        reportLanguage
                      )}{" "}
                      ({item.code})
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-2 rounded-md border p-3 md:col-span-2">
                <legend className="px-1 text-sm font-medium">
                  {text.metricsToShow}
                </legend>
                <div className="flex flex-wrap gap-4">
                  {metricOptions.map(metric => (
                    <label
                      key={metric.key}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={visibleMetrics.includes(metric.key)}
                        onChange={() => toggleVisibleMetric(metric.key)}
                      />
                      {metric.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="space-y-2 rounded-md border p-3 text-sm md:col-span-2">
                <span className="flex items-start gap-2 font-medium">
                  <input
                    type="checkbox"
                    checked={includeUnetData}
                    onChange={event => setIncludeUnetData(event.target.checked)}
                  />
                  {text.prepareUnet}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {text.prepareUnetNote}
                </span>
              </label>
            </div>
            {!isAuthenticated && !authLoading && (
              <p className="text-sm text-muted-foreground">
                {text.signIn}{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline"
                >
                  {text.signInLink}
                </Link>
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}
            <Button
              onClick={runAnalysis}
              disabled={isRunning || authLoading || !isAuthenticated}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {text.loading}
                </>
              ) : (
                text.run
              )}
            </Button>
            {job?.steps && job.steps.length > 0 && (
              <ol className="space-y-2 border-l pl-4 text-sm text-muted-foreground">
                {job.steps.map((step, index) => (
                  <li key={`${step.stage}-${index}`}>
                    {localizeSentinelStepMessage(step.message, reportLanguage)}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <EuroSatCnn language={reportLanguage} />

        {result && job && (
          <Card>
            <CardHeader>
              <CardTitle>{text.result}</CardTitle>
              <CardDescription>
                {text.scene}: {result.scene.id} · {result.scene.datetime} ·{" "}
                {result.scene.tileCloudCoverPercent.toFixed(1)}%{" "}
                {text.sceneClouds}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
              <div className="space-y-4">
                <img
                  className="w-full rounded-lg border"
                  src={result.mapImage}
                  alt={text.title}
                />
                <Button onClick={downloadMap} disabled={downloadBusy}>
                  {downloadBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {text.mapDownload}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {text.mapBandNote}
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">{text.accuracy}</h3>
                {modelMetrics.map(({ name, metrics }) => (
                  <div key={name} className="rounded-lg border p-4">
                    <p className="font-medium">{name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {metricOptions
                        .filter(metric => visibleMetrics.includes(metric.key))
                        .map(metric => (
                          <span key={metric.key} className="mr-3 inline-block">
                            {metric.label}: {metrics[metric.key].toFixed(3)}
                          </span>
                        ))}
                    </p>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  {localizeSentinelReferenceMeaning(
                    result.reference.meaning,
                    reportLanguage
                  )}
                </p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {result.limitations.map(limitation => (
                    <li key={limitation}>
                      {localizeSentinelLimitation(limitation, reportLanguage)}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <AnalyticsReportDownload
          title={`${reportText.reportTitle}${result ? ` - ${result.scene.id}` : ""}`}
          content={reportContent}
          visuals={reportVisuals}
          conclusion={reportConclusion}
          language={analyticsReportLanguage}
          returnPath="/analysis/remote-sensing"
        />

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{text.reportTitle}</CardTitle>
              <CardDescription>{text.reportDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <p>
                  {text.methodTitle}: Sentinel-2 L2A,{" "}
                  {result.processing.pixelSizeMeters} m, {text.bands}{" "}
                  {result.processing.bands.join(", ")}, {text.indices}{" "}
                  {result.processing.indices.join(", ")}.
                </p>
                <p>
                  {text.sampleCounts(
                    result.processing.trainingSampleCount,
                    result.processing.testSampleCount,
                    result.processing.spatialValidationBlockMeters
                  )}
                </p>
                <p>
                  {text.mapModel}:{" "}
                  {localizeSentinelMapModelName(
                    result.processing.mapModel,
                    reportLanguage
                  )}
                  . {text.mapComparison}
                </p>
                <p>{text.macroWinner(macroF1Leader)}</p>
                <p>{text.deepLearningNote}</p>
              </div>

              <section className="space-y-3">
                <h3 className="font-semibold">{text.classMetricsTitle}</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="p-3">{text.className}</th>
                        <th className="p-3">RF {text.precision}</th>
                        <th className="p-3">RF {text.recall}</th>
                        <th className="p-3">RF {text.f1}</th>
                        <th className="p-3">SVM {text.precision}</th>
                        <th className="p-3">SVM {text.recall}</th>
                        <th className="p-3">SVM {text.f1}</th>
                        <th className="p-3">{text.support}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classPerformance.map(metric => (
                        <tr key={metric.code} className="border-t">
                          <td className="p-3">
                            <span
                              className="mr-2 inline-block h-3 w-3 rounded-sm"
                              style={{ backgroundColor: metric.color }}
                            />
                            {metric.className} ({metric.code})
                          </td>
                          <td className="p-3">{metric.precision.toFixed(3)}</td>
                          <td className="p-3">{metric.recall.toFixed(3)}</td>
                          <td className="p-3">{metric.f1.toFixed(3)}</td>
                          <td className="p-3">
                            {metric.svm?.precision.toFixed(3) ?? "—"}
                          </td>
                          <td className="p-3">
                            {metric.svm?.recall.toFixed(3) ?? "—"}
                          </td>
                          <td className="p-3">
                            {metric.svm?.f1.toFixed(3) ?? "—"}
                          </td>
                          <td className="p-3">{metric.support}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">{text.featureTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {text.featureDescription}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {modelMetrics.map(({ name, metrics }) => {
                    const maxImportance = Math.max(
                      ...metrics.featureImportance.map(item => item.importance),
                      0
                    );
                    return (
                      <div
                        key={name}
                        className="space-y-3 rounded-lg border p-4"
                      >
                        <h4 className="font-medium">{name}</h4>
                        {metrics.featureImportance.map(item => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between gap-3 text-xs">
                              <span>{item.name}</span>
                              <span>{item.importance.toFixed(3)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded bg-muted">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${maxImportance > 0 ? (item.importance / maxImportance) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="grid gap-8 xl:grid-cols-2">
                <section className="space-y-3">
                  <h3 className="font-semibold">{text.areaTitle}</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="p-3">{text.className}</th>
                          <th className="p-3">{text.areaHa}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.classAreas.map(item => (
                          <tr key={item.code} className="border-t">
                            <td className="p-3">
                              <span
                                className="mr-2 inline-block h-3 w-3 rounded-sm"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name} ({item.code})
                            </td>
                            <td className="p-3">{item.areaHa.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="font-semibold">{text.confusionTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {text.confusionDescription}
                  </p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-2 text-left">
                            {text.referenceLabel} / {text.predicted}
                          </th>
                          {confusionCodes.map(code => (
                            <th key={code} className="min-w-14 p-2 text-center">
                              {result.classLegend.find(
                                item => item.code === code
                              )?.name ?? code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {confusionCodes.map((code, rowIndex) => (
                          <tr key={code} className="border-t">
                            <th className="p-2 text-left">
                              {result.classLegend.find(
                                item => item.code === code
                              )?.name ?? code}
                            </th>
                            {confusionCodes.map(
                              (predictedCode, columnIndex) => (
                                <td
                                  key={predictedCode}
                                  className="p-2 text-center"
                                >
                                  {result.models.randomForest.confusionMatrix[
                                    rowIndex
                                  ]?.[columnIndex] ?? 0}
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        )}

        <AoiUnet
          language={reportLanguage}
          data={result?.unetTrainingData}
          classLegend={result?.classLegend ?? []}
        />

        <DataInsightSources language={language} />
        <div className="rounded-lg border p-5 text-sm text-muted-foreground">
          {text.portal} ·{" "}
          <Link
            className="font-medium text-primary underline"
            href="/analysis/portals"
          >
            {text.portalLink}
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{text.sourcesTitle}</CardTitle>
            <CardDescription>{text.sourcesDescription}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {text.sources.map(source => (
              <a
                key={source.url}
                className="inline-flex items-start gap-2 rounded-md border p-3 text-sm font-medium text-primary underline underline-offset-4 hover:bg-accent"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                {source.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
