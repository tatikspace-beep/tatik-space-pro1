import { useMemo, useState } from "react";
import { AlertCircle, BrainCircuit, Loader2, Upload } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/Seo";
import { MlStudioSources } from "@/components/MlStudioSources";
import {
  AnalyticsReportDownload,
  AnalyticsUsageNotice,
} from "@/components/AnalyticsReportDownload";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  createMlAssessment,
  getMlStudioLocale,
  localizeMlModelName,
  localizeMlWarning,
} from "@/lib/mlStudioAssessment";
import { resolveAnalyticsReportLanguage } from "@/lib/analyticsReportPdf";
import type {
  AnalyticsReportConclusion,
  AnalyticsReportVisual,
} from "@/lib/analyticsReportPdf";
import { trpc } from "@/lib/trpc";

const copy = {
  it: {
    title: "ML Studio",
    description:
      "Addestra e confronta modelli di machine learning su dataset CSV, JSON ed Excel.",
    intro:
      "Porta l’analisi ML in qualunque settore: scegli il problema, indica l’obiettivo e confronta modelli con un test separato.",
    dataset: "Dataset tabellare",
    file: "Carica un dataset tabellare singolo (CSV, JSON o XLSX)",
    fileLimit:
      "Elaborazione temporanea sulla Function Vercel esistente: massimo 2,5 MB, 10.000 righe e 50 colonne. Il dataset non viene salvato.",
    task: "Tipo di problema",
    classification: "Classificazione",
    regression: "Regressione",
    sector: "Settore o contesto (facoltativo)",
    sectorPlaceholder: "Es. salute, finanza, ambiente, vendite",
    target: "Variabile obiettivo",
    features: "Variabili predittive",
    run: "Addestra e confronta",
    working: "Elaborazione…",
    models: "Confronto modelli su test separato",
    model: "Modello",
    observations: "osservazioni",
    train: "addestramento",
    accuracy: "Accuratezza",
    balancedAccuracy: "Accuratezza bilanciata",
    macroF1: "F1 macro",
    r2: "R²",
    mae: "MAE",
    rmse: "RMSE",
    best: "Miglior modello sul test",
    importance: "Variabili piu influenti (Random Forest)",
    rows: "Righe",
    columns: "colonne",
    testRows: "Test",
    metricsChart: "Confronto visuale delle metriche",
    chartType: "Tipo di grafico",
    chartBars: "Barre",
    chartLines: "Linee",
    chartRadar: "Radar",
    chartScatter: "Dispersione",
    chartScatterNote:
      "Classificazione: accuratezza vs F1 macro; dimensione del punto = accuratezza bilanciata. Regressione: MAE vs RMSE.",
    errorsChart: "Errori sul test (nelle unità del target)",
    assessmentDisclaimer: "Indicazione automatica, non certificata.",
    confusion:
      "Matrice di confusione · righe = classe reale, colonne = classe prevista",
    realPredicted: "Reale / Prevista",
    explainTitle: "Chiedi un’interpretazione AI (facoltativa)",
    question: "La tua domanda",
    questionPlaceholder:
      "Es. Quale modello generalizza meglio e quali limiti devo considerare?",
    consent:
      "Invia al modello AI soltanto domanda, settore e metriche aggregate. Non inviare le righe originali del dataset.",
    freeOnly:
      "Usa solo la rotta OpenRouter openrouter/free, senza fallback a modelli a pagamento. La disponibilita e la quota gratuita dipendono dal provider e non sono garantite.",
    explain: "Genera interpretazione gratuita",
    answer: "Interpretazione",
    method:
      "La classificazione confronta Random Forest, SVM lineare e una rete neurale MLP leggera; la regressione confronta Random Forest, Ridge e MLP. Il test casuale 80/20 non e una validazione indipendente. La MLP non e una CNN per immagini. Le metriche non dimostrano causalita e non sostituiscono una valutazione esperta.",
    login: "Accedi per usare il ML Studio.",
    signIn: "Accedi",
    fileTooLarge: "Il file deve essere più piccolo di 2,5 MB.",
    selectDataset: "Carica un dataset e seleziona obiettivo e almeno una variabile predittiva.",
    metricsLabel: "Metriche dei modelli:",
    warningsLabel: "Avvertenze:",
    none: "Nessuna.",
    mlReport: "Report ML",
    mlStudioReport: "Report ML Studio",
    top: "top",
  },
  en: {
    title: "ML Studio",
    description:
      "Train and compare machine-learning models on CSV, JSON, and Excel datasets.",
    intro:
      "Bring ML analysis to any sector: choose a task, select its target, and compare models against a held-out test set.",
    dataset: "Tabular dataset",
    file: "Upload one tabular dataset (CSV, JSON, or XLSX)",
    fileLimit:
      "Temporary processing on the existing Vercel Function: max 2.5 MB, 10,000 rows, and 50 columns. The dataset is not stored.",
    task: "Problem type",
    classification: "Classification",
    regression: "Regression",
    sector: "Sector or context (optional)",
    sectorPlaceholder: "e.g. health, finance, environment, sales",
    target: "Target variable",
    features: "Predictor variables",
    run: "Train and compare",
    working: "Processing…",
    models: "Model comparison on held-out test set",
    model: "Model",
    observations: "observations",
    train: "training",
    accuracy: "Accuracy",
    balancedAccuracy: "Balanced accuracy",
    macroF1: "Macro F1",
    r2: "R²",
    mae: "MAE",
    rmse: "RMSE",
    best: "Best model on test set",
    importance: "Most influential variables (Random Forest)",
    rows: "Rows",
    columns: "columns",
    testRows: "Test",
    metricsChart: "Visual model comparison",
    chartType: "Chart type",
    chartBars: "Bars",
    chartLines: "Lines",
    chartRadar: "Radar",
    chartScatter: "Scatter",
    chartScatterNote:
      "Classification: accuracy vs macro F1; point size = balanced accuracy. Regression: MAE vs RMSE.",
    errorsChart: "Test errors (in target units)",
    assessmentDisclaimer: "Automated guidance, not certified.",
    confusion:
      "Confusion matrix · rows = actual class, columns = predicted class",
    realPredicted: "Actual / Predicted",
    explainTitle: "Ask for an AI interpretation (optional)",
    question: "Your question",
    questionPlaceholder:
      "e.g. Which model generalizes better and what limitations should I consider?",
    consent:
      "Send only the question, sector, and aggregate metrics to the AI model. Original dataset rows are not sent.",
    freeOnly:
      "Uses only the OpenRouter openrouter/free route, with no paid-model fallback. Provider availability and free quotas are controlled by the provider and are not guaranteed.",
    explain: "Generate free interpretation",
    answer: "Interpretation",
    method:
      "Classification compares Random Forest, linear SVM, and a lightweight neural MLP; regression compares Random Forest, Ridge, and MLP. The random 80/20 test split is not independent validation. MLP is not an image CNN. Metrics do not prove causality or replace expert review.",
    login: "Sign in to use ML Studio.",
    signIn: "Sign in",
    fileTooLarge: "The file must be smaller than 2.5 MB.",
    selectDataset: "Upload a dataset and select a target plus at least one predictor.",
    metricsLabel: "Model metrics:",
    warningsLabel: "Warnings:",
    none: "None.",
    mlReport: "ML report",
    mlStudioReport: "ML Studio report",
    top: "top",
  },
};

const localizedCopy: Record<string, Partial<typeof copy.en>> = {
  es: { title: "ML Studio", description: "Entrena y compara modelos de aprendizaje automático con conjuntos de datos CSV, JSON y Excel.", intro: "Analiza datos de cualquier sector: elige el problema, selecciona el objetivo y compara modelos con un conjunto de prueba independiente.", dataset: "Conjunto de datos tabular", file: "Carga un conjunto de datos tabular (CSV, JSON o XLSX)", task: "Tipo de problema", classification: "Clasificación", regression: "Regresión", sector: "Sector o contexto (opcional)", sectorPlaceholder: "p. ej., salud, finanzas, medioambiente, ventas", target: "Variable objetivo", features: "Variables predictoras", run: "Entrenar y comparar", working: "Procesando…", models: "Comparación de modelos con conjunto de prueba", model: "Modelo", observations: "observaciones", train: "entrenamiento", accuracy: "Exactitud", balancedAccuracy: "Exactitud balanceada", macroF1: "F1 macro", best: "Mejor modelo en la prueba", importance: "Variables más influyentes (Random Forest)", rows: "Filas", columns: "columnas", testRows: "Prueba", metricsChart: "Comparación visual de modelos", chartType: "Tipo de gráfico", chartBars: "Barras", chartLines: "Líneas", chartRadar: "Radar", chartScatter: "Dispersión", errorsChart: "Errores de prueba (unidades del objetivo)", assessmentDisclaimer: "Orientación automática, no certificada.", confusion: "Matriz de confusión · filas = clase real, columnas = clase prevista", realPredicted: "Real / Prevista", explainTitle: "Solicitar interpretación de IA (opcional)", question: "Tu pregunta", consent: "Envía al modelo de IA solo la pregunta, el sector y las métricas agregadas. No se envían las filas originales del conjunto de datos.", explain: "Generar interpretación gratuita", answer: "Interpretación", login: "Inicia sesión para usar ML Studio.", signIn: "Iniciar sesión", fileTooLarge: "El archivo debe ser menor de 2,5 MB.", selectDataset: "Carga un conjunto de datos y selecciona un objetivo y al menos una variable predictora.", metricsLabel: "Métricas de los modelos:", warningsLabel: "Advertencias:", none: "Ninguna.", mlReport: "Informe ML", mlStudioReport: "Informe de ML Studio", top: "principales" },
  fr: { title: "ML Studio", description: "Entraînez et comparez des modèles d’apprentissage automatique sur des jeux de données CSV, JSON et Excel.", intro: "Analysez les données de tout secteur : choisissez le problème, la cible et comparez les modèles sur un jeu de test séparé.", dataset: "Jeu de données tabulaire", file: "Importer un jeu de données tabulaire (CSV, JSON ou XLSX)", task: "Type de problème", classification: "Classification", regression: "Régression", sector: "Secteur ou contexte (facultatif)", sectorPlaceholder: "ex. santé, finance, environnement, ventes", target: "Variable cible", features: "Variables prédictives", run: "Entraîner et comparer", working: "Traitement…", models: "Comparaison des modèles sur un jeu de test", model: "Modèle", observations: "observations", train: "entraînement", accuracy: "Exactitude", balancedAccuracy: "Exactitude équilibrée", macroF1: "F1 macro", best: "Meilleur modèle sur le test", importance: "Variables les plus influentes (Random Forest)", rows: "Lignes", columns: "colonnes", testRows: "Test", metricsChart: "Comparaison visuelle des modèles", chartType: "Type de graphique", chartBars: "Barres", chartLines: "Lignes", chartRadar: "Radar", chartScatter: "Nuage de points", errorsChart: "Erreurs de test (unités de la cible)", assessmentDisclaimer: "Indication automatisée, non certifiée.", confusion: "Matrice de confusion · lignes = classe réelle, colonnes = classe prédite", realPredicted: "Réelle / Prédite", explainTitle: "Demander une interprétation IA (facultatif)", question: "Votre question", consent: "N’envoyez au modèle IA que la question, le secteur et les métriques agrégées. Les lignes originales ne sont pas transmises.", explain: "Générer une interprétation gratuite", answer: "Interprétation", login: "Connectez-vous pour utiliser ML Studio.", signIn: "Se connecter" },
  de: { title: "ML Studio", description: "Trainieren und vergleichen Sie Machine-Learning-Modelle mit CSV-, JSON- und Excel-Datensätzen.", intro: "Analysieren Sie Daten aus jeder Branche: Wählen Sie eine Aufgabe und Zielvariable und vergleichen Sie Modelle mit einem separaten Testsatz.", dataset: "Tabellarischer Datensatz", file: "Einen tabellarischen Datensatz hochladen (CSV, JSON oder XLSX)", task: "Problemtyp", classification: "Klassifikation", regression: "Regression", sector: "Branche oder Kontext (optional)", sectorPlaceholder: "z. B. Gesundheit, Finanzen, Umwelt, Vertrieb", target: "Zielvariable", features: "Prädiktorvariablen", run: "Trainieren und vergleichen", working: "Wird verarbeitet…", models: "Modellvergleich mit separatem Testsatz", model: "Modell", observations: "Beobachtungen", train: "Training", accuracy: "Genauigkeit", balancedAccuracy: "Balancierte Genauigkeit", macroF1: "Makro-F1", best: "Bestes Modell im Test", importance: "Einflussreichste Variablen (Random Forest)", rows: "Zeilen", columns: "Spalten", testRows: "Test", metricsChart: "Visueller Modellvergleich", chartType: "Diagrammtyp", chartBars: "Balken", chartLines: "Linien", chartRadar: "Radar", chartScatter: "Streudiagramm", errorsChart: "Testfehler (Einheiten der Zielvariable)", assessmentDisclaimer: "Automatische, nicht zertifizierte Auswertung.", confusion: "Konfusionsmatrix · Zeilen = tatsächliche Klasse, Spalten = vorhergesagte Klasse", realPredicted: "Tatsächlich / Vorhergesagt", explainTitle: "KI-Interpretation anfordern (optional)", question: "Ihre Frage", consent: "Nur Frage, Branche und aggregierte Kennzahlen an das KI-Modell senden. Originalzeilen werden nicht übermittelt.", explain: "Kostenlose Interpretation erstellen", answer: "Interpretation", login: "Melden Sie sich an, um ML Studio zu verwenden.", signIn: "Anmelden" },
  pt: { title: "ML Studio", description: "Treine e compare modelos de aprendizagem automática com conjuntos de dados CSV, JSON e Excel.", intro: "Analise dados de qualquer setor: escolha o problema, defina o alvo e compare modelos com um conjunto de teste separado.", dataset: "Conjunto de dados tabular", file: "Carregue um conjunto de dados tabular (CSV, JSON ou XLSX)", task: "Tipo de problema", classification: "Classificação", regression: "Regressão", sector: "Setor ou contexto (opcional)", sectorPlaceholder: "ex.: saúde, finanças, ambiente, vendas", target: "Variável-alvo", features: "Variáveis preditoras", run: "Treinar e comparar", working: "A processar…", models: "Comparação de modelos num conjunto de teste", model: "Modelo", observations: "observações", train: "treino", accuracy: "Exatidão", balancedAccuracy: "Exatidão equilibrada", macroF1: "F1 macro", best: "Melhor modelo no teste", importance: "Variáveis mais influentes (Random Forest)", rows: "Linhas", columns: "colunas", testRows: "Teste", metricsChart: "Comparação visual dos modelos", chartType: "Tipo de gráfico", chartBars: "Barras", chartLines: "Linhas", chartRadar: "Radar", chartScatter: "Dispersão", errorsChart: "Erros no teste (unidades do alvo)", assessmentDisclaimer: "Orientação automática, não certificada.", confusion: "Matriz de confusão · linhas = classe real, colunas = classe prevista", realPredicted: "Real / Prevista", explainTitle: "Pedir interpretação de IA (opcional)", question: "A sua pergunta", consent: "Envie ao modelo de IA apenas a pergunta, o setor e as métricas agregadas. As linhas originais não são enviadas.", explain: "Gerar interpretação gratuita", answer: "Interpretação", login: "Inicie sessão para usar o ML Studio.", signIn: "Iniciar sessão" },
  ru: { title: "ML Studio", description: "Обучайте и сравнивайте модели машинного обучения на наборах данных CSV, JSON и Excel.", intro: "Анализируйте данные из любой отрасли: выберите задачу и целевой признак, сравните модели на отдельной тестовой выборке.", dataset: "Табличный набор данных", file: "Загрузить один табличный набор данных (CSV, JSON или XLSX)", task: "Тип задачи", classification: "Классификация", regression: "Регрессия", sector: "Отрасль или контекст (необязательно)", sectorPlaceholder: "например, здравоохранение, финансы, экология, продажи", target: "Целевая переменная", features: "Признаки", run: "Обучить и сравнить", working: "Обработка…", models: "Сравнение моделей на тестовой выборке", model: "Модель", observations: "наблюдений", train: "обучение", accuracy: "Точность", balancedAccuracy: "Сбалансированная точность", macroF1: "Макро-F1", best: "Лучшая модель на тесте", importance: "Наиболее значимые признаки (Random Forest)", rows: "Строки", columns: "столбцов", testRows: "Тест", metricsChart: "Сравнение моделей", chartType: "Тип диаграммы", chartBars: "Столбцы", chartLines: "Линии", chartRadar: "Радар", chartScatter: "Точечная", errorsChart: "Ошибки на тесте (единицы целевой переменной)", assessmentDisclaimer: "Автоматическая оценка, не сертифицирована.", confusion: "Матрица ошибок · строки = фактический класс, столбцы = предсказанный класс", realPredicted: "Факт / Прогноз", explainTitle: "Запросить интерпретацию ИИ (необязательно)", question: "Ваш вопрос", consent: "Отправляйте ИИ только вопрос, отрасль и агрегированные метрики. Исходные строки набора данных не отправляются.", explain: "Создать бесплатную интерпретацию", answer: "Интерпретация", login: "Войдите, чтобы использовать ML Studio.", signIn: "Войти" },
  pl: { title: "ML Studio", description: "Trenuj i porównuj modele uczenia maszynowego na zbiorach CSV, JSON i Excel.", intro: "Analizuj dane z dowolnej branży: wybierz zadanie i cel, a następnie porównaj modele na oddzielnym zbiorze testowym.", dataset: "Tabelaryczny zbiór danych", file: "Prześlij jeden tabelaryczny zbiór danych (CSV, JSON lub XLSX)", task: "Typ problemu", classification: "Klasyfikacja", regression: "Regresja", sector: "Branża lub kontekst (opcjonalnie)", sectorPlaceholder: "np. zdrowie, finanse, środowisko, sprzedaż", target: "Zmienna docelowa", features: "Zmienne predykcyjne", run: "Trenuj i porównaj", working: "Przetwarzanie…", models: "Porównanie modeli na zbiorze testowym", model: "Model", observations: "obserwacji", train: "trening", accuracy: "Dokładność", balancedAccuracy: "Zrównoważona dokładność", macroF1: "Makro F1", best: "Najlepszy model w teście", importance: "Najważniejsze zmienne (Random Forest)", rows: "Wiersze", columns: "kolumny", testRows: "Test", metricsChart: "Wizualne porównanie modeli", chartType: "Typ wykresu", chartBars: "Słupki", chartLines: "Linie", chartRadar: "Radarowy", chartScatter: "Punktowy", errorsChart: "Błędy testowe (jednostki celu)", assessmentDisclaimer: "Automatyczna wskazówka, bez certyfikacji.", confusion: "Macierz pomyłek · wiersze = klasa rzeczywista, kolumny = przewidywana", realPredicted: "Rzeczywista / Przewidywana", explainTitle: "Poproś o interpretację AI (opcjonalnie)", question: "Twoje pytanie", consent: "Do modelu AI wysyłaj tylko pytanie, branżę i zagregowane metryki. Oryginalne wiersze danych nie są wysyłane.", explain: "Utwórz bezpłatną interpretację", answer: "Interpretacja", login: "Zaloguj się, aby używać ML Studio.", signIn: "Zaloguj się" },
  nl: { title: "ML Studio", description: "Train en vergelijk machinelearningmodellen met CSV-, JSON- en Excel-datasets.", intro: "Analyseer gegevens uit elke sector: kies een taak en doelvariabele en vergelijk modellen met een aparte testset.", dataset: "Tabelvormige dataset", file: "Upload één tabelvormige dataset (CSV, JSON of XLSX)", task: "Probleemtype", classification: "Classificatie", regression: "Regressie", sector: "Sector of context (optioneel)", sectorPlaceholder: "bijv. zorg, financiën, milieu, verkoop", target: "Doelvariabele", features: "Voorspellende variabelen", run: "Trainen en vergelijken", working: "Verwerken…", models: "Modelvergelijking op aparte testset", model: "Model", observations: "observaties", train: "training", accuracy: "Nauwkeurigheid", balancedAccuracy: "Gebalanceerde nauwkeurigheid", macroF1: "Macro-F1", best: "Beste model op testset", importance: "Invloedrijkste variabelen (Random Forest)", rows: "Rijen", columns: "kolommen", testRows: "Test", metricsChart: "Visuele modelvergelijking", chartType: "Grafiektype", chartBars: "Staafdiagram", chartLines: "Lijnen", chartRadar: "Radar", chartScatter: "Spreiding", errorsChart: "Testfouten (eenheden van doelvariabele)", assessmentDisclaimer: "Automatische richtlijn, niet gecertificeerd.", confusion: "Verwarringsmatrix · rijen = werkelijke klasse, kolommen = voorspelde klasse", realPredicted: "Werkelijk / Voorspeld", explainTitle: "Vraag om een AI-interpretatie (optioneel)", question: "Uw vraag", consent: "Stuur alleen de vraag, sector en geaggregeerde statistieken naar het AI-model. Oorspronkelijke datasetrijen worden niet verzonden.", explain: "Gratis interpretatie genereren", answer: "Interpretatie", login: "Meld u aan om ML Studio te gebruiken.", signIn: "Aanmelden" },
  tr: { title: "ML Studio", description: "CSV, JSON ve Excel veri kümelerinde makine öğrenimi modelleri eğitin ve karşılaştırın.", intro: "Her sektörden veriyi analiz edin: görevi ve hedefi seçin, modelleri ayrı bir test kümesinde karşılaştırın.", dataset: "Tablo veri kümesi", file: "Bir tablo veri kümesi yükleyin (CSV, JSON veya XLSX)", task: "Problem türü", classification: "Sınıflandırma", regression: "Regresyon", sector: "Sektör veya bağlam (isteğe bağlı)", sectorPlaceholder: "örn. sağlık, finans, çevre, satış", target: "Hedef değişken", features: "Yordayıcı değişkenler", run: "Eğit ve karşılaştır", working: "İşleniyor…", models: "Ayrı test kümesinde model karşılaştırması", model: "Model", observations: "gözlem", train: "eğitim", accuracy: "Doğruluk", balancedAccuracy: "Dengeli doğruluk", macroF1: "Makro F1", best: "Testteki en iyi model", importance: "En etkili değişkenler (Random Forest)", rows: "Satır", columns: "sütun", testRows: "Test", metricsChart: "Görsel model karşılaştırması", chartType: "Grafik türü", chartBars: "Çubuklar", chartLines: "Çizgiler", chartRadar: "Radar", chartScatter: "Dağılım", errorsChart: "Test hataları (hedef birimleri)", assessmentDisclaimer: "Otomatik yönlendirme, sertifikalı değildir.", confusion: "Karmaşıklık matrisi · satırlar = gerçek sınıf, sütunlar = tahmin edilen sınıf", realPredicted: "Gerçek / Tahmin", explainTitle: "Yapay zekâ yorumlaması iste (isteğe bağlı)", question: "Sorunuz", consent: "Yapay zekâ modeline yalnızca soruyu, sektörü ve toplu metrikleri gönderin. Özgün veri kümesi satırları gönderilmez.", explain: "Ücretsiz yorum oluştur", answer: "Yorum", login: "ML Studio'yu kullanmak için oturum açın.", signIn: "Oturum aç" },
  sv: { title: "ML Studio", description: "Träna och jämför maskininlärningsmodeller med CSV-, JSON- och Excel-datauppsättningar.", intro: "Analysera data från alla branscher: välj uppgift och mål och jämför modeller med en separat testmängd.", dataset: "Tabellbaserad datauppsättning", file: "Ladda upp en tabellbaserad datauppsättning (CSV, JSON eller XLSX)", task: "Problemtyp", classification: "Klassificering", regression: "Regression", sector: "Bransch eller sammanhang (valfritt)", sectorPlaceholder: "t.ex. hälsa, ekonomi, miljö, försäljning", target: "Målvariabel", features: "Prediktorvariabler", run: "Träna och jämför", working: "Bearbetar…", models: "Modelljämförelse med separat testmängd", model: "Modell", observations: "observationer", train: "träning", accuracy: "Träffsäkerhet", balancedAccuracy: "Balanserad träffsäkerhet", macroF1: "Makro-F1", best: "Bästa modellen i testet", importance: "Mest inflytelserika variabler (Random Forest)", rows: "Rader", columns: "kolumner", testRows: "Test", metricsChart: "Visuell modelljämförelse", chartType: "Diagramtyp", chartBars: "Staplar", chartLines: "Linjer", chartRadar: "Radar", chartScatter: "Spridning", errorsChart: "Testfel (målenheter)", assessmentDisclaimer: "Automatisk vägledning, ej certifierad.", confusion: "Förväxlingsmatris · rader = faktisk klass, kolumner = förutsagd klass", realPredicted: "Faktisk / Förutsagd", explainTitle: "Be om en AI-tolkning (valfritt)", question: "Din fråga", consent: "Skicka endast frågan, branschen och aggregerade mätvärden till AI-modellen. Ursprungliga datarader skickas inte.", explain: "Skapa kostnadsfri tolkning", answer: "Tolkning", login: "Logga in för att använda ML Studio.", signIn: "Logga in" },
  da: { title: "ML Studio", description: "Træn og sammenlign maskinlæringsmodeller på CSV-, JSON- og Excel-datasæt.", intro: "Analysér data fra alle brancher: vælg opgave og mål, og sammenlign modeller på et separat testsæt.", dataset: "Tabelformet datasæt", file: "Upload ét tabelformet datasæt (CSV, JSON eller XLSX)", task: "Problemtype", classification: "Klassifikation", regression: "Regression", sector: "Branche eller kontekst (valgfrit)", sectorPlaceholder: "f.eks. sundhed, finans, miljø, salg", target: "Målvariabel", features: "Prædiktorvariabler", run: "Træn og sammenlign", working: "Behandler…", models: "Modelsammenligning på separat testsæt", model: "Model", observations: "observationer", train: "træning", accuracy: "Nøjagtighed", balancedAccuracy: "Balanceret nøjagtighed", macroF1: "Makro-F1", best: "Bedste model i testen", importance: "Mest indflydelsesrige variabler (Random Forest)", rows: "Rækker", columns: "kolonner", testRows: "Test", metricsChart: "Visuel modelsammenligning", chartType: "Diagramtype", chartBars: "Søjler", chartLines: "Linjer", chartRadar: "Radar", chartScatter: "Punktdiagram", errorsChart: "Testfejl (målenheder)", assessmentDisclaimer: "Automatisk vejledning, ikke certificeret.", confusion: "Forvekslingsmatrix · rækker = faktisk klasse, kolonner = forudsagt klasse", realPredicted: "Faktisk / Forudsagt", explainTitle: "Bed om en AI-fortolkning (valgfrit)", question: "Dit spørgsmål", consent: "Send kun spørgsmålet, branchen og aggregerede målinger til AI-modellen. Originale datarækker sendes ikke.", explain: "Opret gratis fortolkning", answer: "Fortolkning", login: "Log ind for at bruge ML Studio.", signIn: "Log ind" },
  no: { title: "ML Studio", description: "Tren og sammenlign maskinlæringsmodeller på CSV-, JSON- og Excel-datasett.", intro: "Analyser data fra alle bransjer: velg oppgave og mål, og sammenlign modeller med et separat testsett.", dataset: "Tabellbasert datasett", file: "Last opp ett tabellbasert datasett (CSV, JSON eller XLSX)", task: "Problemtype", classification: "Klassifisering", regression: "Regresjon", sector: "Bransje eller kontekst (valgfritt)", sectorPlaceholder: "f.eks. helse, finans, miljø, salg", target: "Målvariabel", features: "Prediktorvariabler", run: "Tren og sammenlign", working: "Behandler…", models: "Modellsammenligning på separat testsett", model: "Modell", observations: "observasjoner", train: "trening", accuracy: "Nøyaktighet", balancedAccuracy: "Balansert nøyaktighet", macroF1: "Makro-F1", best: "Beste modell på testen", importance: "Mest innflytelsesrike variabler (Random Forest)", rows: "Rader", columns: "kolonner", testRows: "Test", metricsChart: "Visuell modellsammenligning", chartType: "Diagramtype", chartBars: "Søyler", chartLines: "Linjer", chartRadar: "Radar", chartScatter: "Punktdiagram", errorsChart: "Testfeil (målenheter)", assessmentDisclaimer: "Automatisk veiledning, ikke sertifisert.", confusion: "Forvekslingsmatrise · rader = faktisk klasse, kolonner = predikert klasse", realPredicted: "Faktisk / Predikert", explainTitle: "Be om en KI-tolkning (valgfritt)", question: "Spørsmålet ditt", consent: "Send bare spørsmålet, bransjen og aggregerte måltall til KI-modellen. Opprinnelige datarader sendes ikke.", explain: "Lag gratis tolkning", answer: "Tolkning", login: "Logg inn for å bruke ML Studio.", signIn: "Logg inn" },
  fi: { title: "ML Studio", description: "Kouluta ja vertaile koneoppimismalleja CSV-, JSON- ja Excel-aineistoilla.", intro: "Analysoi minkä tahansa alan tietoja: valitse tehtävä ja kohde sekä vertaile malleja erillisellä testijoukolla.", dataset: "Taulukkomuotoinen aineisto", file: "Lataa yksi taulukkomuotoinen aineisto (CSV, JSON tai XLSX)", task: "Ongelmatyyppi", classification: "Luokittelu", regression: "Regressio", sector: "Ala tai asiayhteys (valinnainen)", sectorPlaceholder: "esim. terveys, talous, ympäristö, myynti", target: "Kohdemuuttuja", features: "Selittävät muuttujat", run: "Kouluta ja vertaile", working: "Käsitellään…", models: "Mallien vertailu erillisellä testijoukolla", model: "Malli", observations: "havaintoa", train: "koulutus", accuracy: "Tarkkuus", balancedAccuracy: "Tasapainotettu tarkkuus", macroF1: "Makro-F1", best: "Paras malli testissä", importance: "Vaikuttavimmat muuttujat (Random Forest)", rows: "Rivit", columns: "saraketta", testRows: "Testi", metricsChart: "Mallien visuaalinen vertailu", chartType: "Kaaviotyyppi", chartBars: "Pylväät", chartLines: "Viivat", chartRadar: "Tutka", chartScatter: "Hajonta", errorsChart: "Testivirheet (kohteen yksiköt)", assessmentDisclaimer: "Automaattinen ohje, ei sertifioitu.", confusion: "Sekavuusmatriisi · rivit = todellinen luokka, sarakkeet = ennustettu luokka", realPredicted: "Todellinen / Ennustettu", explainTitle: "Pyydä tekoälytulkintaa (valinnainen)", question: "Kysymyksesi", consent: "Lähetä tekoälymallille vain kysymys, ala ja yhdistetyt mittarit. Alkuperäisiä aineistorivejä ei lähetetä.", explain: "Luo maksuton tulkinta", answer: "Tulkinta", login: "Kirjaudu sisään käyttääksesi ML Studiota.", signIn: "Kirjaudu sisään" },
  uk: { title: "ML Studio", description: "Навчайте й порівнюйте моделі машинного навчання на наборах даних CSV, JSON та Excel.", intro: "Аналізуйте дані будь-якої галузі: виберіть задачу й ціль, а моделі порівняйте на окремій тестовій вибірці.", dataset: "Табличний набір даних", file: "Завантажте один табличний набір даних (CSV, JSON або XLSX)", task: "Тип задачі", classification: "Класифікація", regression: "Регресія", sector: "Галузь або контекст (необов’язково)", sectorPlaceholder: "наприклад, медицина, фінанси, довкілля, продажі", target: "Цільова змінна", features: "Предиктори", run: "Навчити й порівняти", working: "Обробка…", models: "Порівняння моделей на тестовій вибірці", model: "Модель", observations: "спостережень", train: "навчання", accuracy: "Точність", balancedAccuracy: "Збалансована точність", macroF1: "Макро-F1", best: "Найкраща модель на тесті", importance: "Найвпливовіші ознаки (Random Forest)", rows: "Рядки", columns: "стовпців", testRows: "Тест", metricsChart: "Візуальне порівняння моделей", chartType: "Тип діаграми", chartBars: "Стовпці", chartLines: "Лінії", chartRadar: "Радар", chartScatter: "Розсіювання", errorsChart: "Помилки на тесті (одиниці цілі)", assessmentDisclaimer: "Автоматична рекомендація, не сертифікована.", confusion: "Матриця помилок · рядки = фактичний клас, стовпці = передбачений клас", realPredicted: "Факт / Прогноз", explainTitle: "Запросити інтерпретацію ШІ (необов’язково)", question: "Ваше запитання", consent: "Надсилайте моделі ШІ лише запитання, галузь і агреговані метрики. Вихідні рядки набору даних не надсилаються.", explain: "Створити безкоштовну інтерпретацію", answer: "Інтерпретація", login: "Увійдіть, щоб користуватися ML Studio.", signIn: "Увійти" },
  cs: { title: "ML Studio", description: "Trénujte a porovnávejte modely strojového učení nad datovými sadami CSV, JSON a Excel.", intro: "Analyzujte data z libovolného oboru: zvolte úlohu a cíl a porovnejte modely na oddělené testovací sadě.", dataset: "Tabulková datová sada", file: "Nahrajte jednu tabulkovou datovou sadu (CSV, JSON nebo XLSX)", task: "Typ problému", classification: "Klasifikace", regression: "Regrese", sector: "Obor nebo kontext (volitelné)", sectorPlaceholder: "např. zdravotnictví, finance, životní prostředí, prodej", target: "Cílová proměnná", features: "Prediktory", run: "Trénovat a porovnat", working: "Zpracování…", models: "Porovnání modelů na oddělené testovací sadě", model: "Model", observations: "pozorování", train: "trénink", accuracy: "Přesnost", balancedAccuracy: "Vyvážená přesnost", macroF1: "Makro F1", best: "Nejlepší model v testu", importance: "Nejvlivnější proměnné (Random Forest)", rows: "Řádky", columns: "sloupců", testRows: "Test", metricsChart: "Vizuální porovnání modelů", chartType: "Typ grafu", chartBars: "Sloupce", chartLines: "Čáry", chartRadar: "Radar", chartScatter: "Bodový", errorsChart: "Testovací chyby (jednotky cíle)", assessmentDisclaimer: "Automatické doporučení, bez certifikace.", confusion: "Matice záměn · řádky = skutečná třída, sloupce = předpovězená třída", realPredicted: "Skutečnost / Predikce", explainTitle: "Požádat o interpretaci AI (volitelné)", question: "Vaše otázka", consent: "Modelu AI odešlete pouze otázku, obor a souhrnné metriky. Původní řádky datové sady se neodesílají.", explain: "Vytvořit bezplatnou interpretaci", answer: "Interpretace", login: "Přihlaste se a používejte ML Studio.", signIn: "Přihlásit se" },
};

const localizedDetails: Record<string, Partial<typeof copy.en>> = {
  es: { fileLimit: "Procesamiento temporal en la Function de Vercel existente: máximo 2,5 MB, 10.000 filas y 50 columnas. El conjunto de datos no se guarda.", chartScatterNote: "Clasificación: exactitud frente a F1 macro; tamaño del punto = exactitud balanceada. Regresión: MAE frente a RMSE.", questionPlaceholder: "p. ej., ¿qué modelo generaliza mejor y qué limitaciones debo considerar?", freeOnly: "Usa solo la ruta openrouter/free, sin alternativas de pago. La disponibilidad y las cuotas gratuitas dependen del proveedor y no están garantizadas.", method: "La clasificación compara Random Forest, SVM lineal y una red neuronal MLP ligera; la regresión compara Random Forest, Ridge y MLP. La partición aleatoria 80/20 no es una validación independiente. MLP no es una CNN de imágenes. Las métricas no prueban causalidad ni sustituyen la revisión de especialistas.", mlReport: "Informe ML", mlStudioReport: "Informe de ML Studio", metricsLabel: "Métricas de los modelos:", warningsLabel: "Advertencias:", none: "Ninguna.", top: "principales" },
  fr: { fileLimit: "Traitement temporaire sur la Function Vercel existante : 2,5 Mo, 10 000 lignes et 50 colonnes maximum. Le jeu de données n’est pas enregistré.", chartScatterNote: "Classification : exactitude vs F1 macro ; taille du point = exactitude équilibrée. Régression : MAE vs RMSE.", questionPlaceholder: "ex. quel modèle généralise le mieux et quelles limites dois-je prendre en compte ?", freeOnly: "Utilise uniquement la route openrouter/free, sans recours à un modèle payant. Disponibilité et quotas gratuits dépendent du fournisseur et ne sont pas garantis.", method: "La classification compare Random Forest, SVM linéaire et un MLP neuronal léger ; la régression compare Random Forest, Ridge et MLP. Le découpage aléatoire 80/20 n’est pas une validation indépendante. Le MLP n’est pas un CNN d’images. Les métriques ne prouvent pas la causalité et ne remplacent pas un avis expert.", mlReport: "Rapport ML", mlStudioReport: "Rapport ML Studio", metricsLabel: "Métriques des modèles :", warningsLabel: "Avertissements :", none: "Aucun.", top: "principaux" },
  de: { fileLimit: "Temporäre Verarbeitung in der vorhandenen Vercel Function: max. 2,5 MB, 10.000 Zeilen und 50 Spalten. Der Datensatz wird nicht gespeichert.", chartScatterNote: "Klassifikation: Genauigkeit vs. Makro-F1; Punktgröße = balancierte Genauigkeit. Regression: MAE vs. RMSE.", questionPlaceholder: "z. B. Welches Modell generalisiert besser und welche Einschränkungen sollte ich beachten?", freeOnly: "Verwendet ausschließlich die openrouter/free-Route ohne kostenpflichtigen Fallback. Verfügbarkeit und Gratis-Kontingente werden vom Anbieter festgelegt und sind nicht garantiert.", method: "Die Klassifikation vergleicht Random Forest, lineare SVM und ein leichtes neuronales MLP; die Regression vergleicht Random Forest, Ridge und MLP. Die zufällige 80/20-Aufteilung ist keine unabhängige Validierung. MLP ist kein Bild-CNN. Kennzahlen belegen keine Kausalität und ersetzen keine fachliche Prüfung.", mlReport: "ML-Bericht", mlStudioReport: "ML-Studio-Bericht", metricsLabel: "Modellkennzahlen:", warningsLabel: "Warnungen:", none: "Keine.", top: "Top" },
  pt: { fileLimit: "Processamento temporário na Function Vercel existente: máximo de 2,5 MB, 10.000 linhas e 50 colunas. O conjunto de dados não é guardado.", chartScatterNote: "Classificação: exatidão vs. F1 macro; tamanho do ponto = exatidão equilibrada. Regressão: MAE vs. RMSE.", questionPlaceholder: "ex.: qual modelo generaliza melhor e que limitações devo considerar?", freeOnly: "Usa apenas a rota openrouter/free, sem alternativa de modelo pago. A disponibilidade e as quotas gratuitas dependem do fornecedor e não são garantidas.", method: "A classificação compara Random Forest, SVM linear e uma MLP neural leve; a regressão compara Random Forest, Ridge e MLP. A divisão aleatória 80/20 não é validação independente. MLP não é uma CNN de imagens. As métricas não provam causalidade nem substituem uma análise especializada.", mlReport: "Relatório ML", mlStudioReport: "Relatório ML Studio", metricsLabel: "Métricas dos modelos:", warningsLabel: "Avisos:", none: "Nenhum.", top: "principais" },
  ru: { fileLimit: "Временная обработка в существующей Vercel Function: не более 2,5 МБ, 10 000 строк и 50 столбцов. Набор данных не сохраняется.", chartScatterNote: "Классификация: точность и макро-F1; размер точки = сбалансированная точность. Регрессия: MAE и RMSE.", questionPlaceholder: "например, какая модель лучше обобщает и какие ограничения следует учитывать?", freeOnly: "Используется только маршрут openrouter/free без перехода на платные модели. Доступность и бесплатные квоты зависят от провайдера и не гарантируются.", method: "Для классификации сравниваются Random Forest, линейная SVM и лёгкая нейронная MLP; для регрессии — Random Forest, Ridge и MLP. Случайное разбиение 80/20 не является независимой проверкой. MLP — не CNN для изображений. Метрики не доказывают причинность и не заменяют экспертную оценку.", mlReport: "Отчёт ML", mlStudioReport: "Отчёт ML Studio", metricsLabel: "Метрики моделей:", warningsLabel: "Предупреждения:", none: "Нет.", top: "лучших" },
  pl: { fileLimit: "Tymczasowe przetwarzanie w istniejącej funkcji Vercel: maks. 2,5 MB, 10 000 wierszy i 50 kolumn. Zbiór danych nie jest zapisywany.", chartScatterNote: "Klasyfikacja: dokładność vs makro F1; rozmiar punktu = zrównoważona dokładność. Regresja: MAE vs RMSE.", questionPlaceholder: "np. który model lepiej uogólnia i jakie ograniczenia należy uwzględnić?", freeOnly: "Używa wyłącznie trasy openrouter/free, bez płatnego modelu zastępczego. Dostępność i bezpłatne limity zależą od dostawcy i nie są gwarantowane.", method: "Klasyfikacja porównuje Random Forest, liniowy SVM i lekką neuronową MLP; regresja porównuje Random Forest, Ridge i MLP. Losowy podział 80/20 nie jest niezależną walidacją. MLP nie jest obrazową CNN. Metryki nie dowodzą przyczynowości ani nie zastępują eksperckiej oceny.", mlReport: "Raport ML", mlStudioReport: "Raport ML Studio", metricsLabel: "Metryki modeli:", warningsLabel: "Ostrzeżenia:", none: "Brak.", top: "najważniejszych" },
  nl: { fileLimit: "Tijdelijke verwerking in de bestaande Vercel Function: maximaal 2,5 MB, 10.000 rijen en 50 kolommen. De dataset wordt niet opgeslagen.", chartScatterNote: "Classificatie: nauwkeurigheid versus macro-F1; puntgrootte = gebalanceerde nauwkeurigheid. Regressie: MAE versus RMSE.", questionPlaceholder: "bijv. welk model generaliseert beter en met welke beperkingen moet ik rekening houden?", freeOnly: "Gebruikt uitsluitend de openrouter/free-route, zonder betaalde terugval. Beschikbaarheid en gratis quota worden door de provider bepaald en zijn niet gegarandeerd.", method: "Classificatie vergelijkt Random Forest, lineaire SVM en een licht neuraal MLP; regressie vergelijkt Random Forest, Ridge en MLP. De willekeurige 80/20-splitsing is geen onafhankelijke validatie. MLP is geen beeld-CNN. Statistieken bewijzen geen causaliteit en vervangen geen deskundige beoordeling.", mlReport: "ML-rapport", mlStudioReport: "ML Studio-rapport", metricsLabel: "Modelstatistieken:", warningsLabel: "Waarschuwingen:", none: "Geen.", top: "top" },
  tr: { fileLimit: "Mevcut Vercel Function üzerinde geçici işleme: en fazla 2,5 MB, 10.000 satır ve 50 sütun. Veri kümesi kaydedilmez.", chartScatterNote: "Sınıflandırma: doğruluk ve makro F1; nokta boyutu = dengeli doğruluk. Regresyon: MAE ve RMSE.", questionPlaceholder: "örn. hangi model daha iyi genelleme yapıyor ve hangi sınırlamaları dikkate almalıyım?", freeOnly: "Ücretli modele geçiş olmadan yalnızca openrouter/free rotasını kullanır. Kullanılabilirlik ve ücretsiz kotalar sağlayıcıya bağlıdır ve garanti edilmez.", method: "Sınıflandırma Random Forest, doğrusal SVM ve hafif sinirsel MLP'yi; regresyon Random Forest, Ridge ve MLP'yi karşılaştırır. Rastgele 80/20 bölme bağımsız doğrulama değildir. MLP bir görüntü CNN'i değildir. Metrikler nedenselliği kanıtlamaz ve uzman incelemesinin yerini tutmaz.", mlReport: "ML raporu", mlStudioReport: "ML Studio raporu", metricsLabel: "Model metrikleri:", warningsLabel: "Uyarılar:", none: "Yok.", top: "öne çıkan" },
  sv: { fileLimit: "Tillfällig bearbetning i den befintliga Vercel Function: högst 2,5 MB, 10 000 rader och 50 kolumner. Datauppsättningen sparas inte.", chartScatterNote: "Klassificering: träffsäkerhet mot makro-F1; punktstorlek = balanserad träffsäkerhet. Regression: MAE mot RMSE.", questionPlaceholder: "t.ex. vilken modell generaliserar bäst och vilka begränsningar bör jag tänka på?", freeOnly: "Använder endast openrouter/free utan betald reservmodell. Tillgänglighet och gratiskvoter styrs av leverantören och garanteras inte.", method: "Klassificering jämför Random Forest, linjär SVM och en lätt neural MLP; regression jämför Random Forest, Ridge och MLP. Den slumpmässiga 80/20-delningen är ingen oberoende validering. MLP är inte ett bild-CNN. Mätvärden bevisar inte orsakssamband och ersätter inte expertgranskning.", mlReport: "ML-rapport", mlStudioReport: "ML Studio-rapport", metricsLabel: "Modellmått:", warningsLabel: "Varningar:", none: "Inga.", top: "främsta" },
  da: { fileLimit: "Midlertidig behandling i den eksisterende Vercel Function: højst 2,5 MB, 10.000 rækker og 50 kolonner. Datasættet gemmes ikke.", chartScatterNote: "Klassifikation: nøjagtighed vs. makro-F1; punktstørrelse = balanceret nøjagtighed. Regression: MAE vs. RMSE.", questionPlaceholder: "f.eks. hvilken model generaliserer bedst, og hvilke begrænsninger bør jeg overveje?", freeOnly: "Bruger kun openrouter/free uden betalt reserve. Tilgængelighed og gratiskvoter bestemmes af udbyderen og garanteres ikke.", method: "Klassifikation sammenligner Random Forest, lineær SVM og en let neural MLP; regression sammenligner Random Forest, Ridge og MLP. Den tilfældige 80/20-opdeling er ikke uafhængig validering. MLP er ikke et billed-CNN. Målinger beviser ikke årsagssammenhæng og erstatter ikke ekspertvurdering.", mlReport: "ML-rapport", mlStudioReport: "ML Studio-rapport", metricsLabel: "Modelmålinger:", warningsLabel: "Advarsler:", none: "Ingen.", top: "vigtigste" },
  no: { fileLimit: "Midlertidig behandling i den eksisterende Vercel Function: maks. 2,5 MB, 10 000 rader og 50 kolonner. Datasettet lagres ikke.", chartScatterNote: "Klassifisering: nøyaktighet mot makro-F1; punktstørrelse = balansert nøyaktighet. Regresjon: MAE mot RMSE.", questionPlaceholder: "f.eks. hvilken modell generaliserer best, og hvilke begrensninger bør jeg ta hensyn til?", freeOnly: "Bruker bare openrouter/free uten betalt reserve. Tilgjengelighet og gratiskvoter styres av leverandøren og er ikke garantert.", method: "Klassifisering sammenligner Random Forest, lineær SVM og en lett nevral MLP; regresjon sammenligner Random Forest, Ridge og MLP. Den tilfeldige 80/20-delingen er ikke uavhengig validering. MLP er ikke et bilde-CNN. Måltall beviser ikke årsakssammenheng og erstatter ikke faglig vurdering.", mlReport: "ML-rapport", mlStudioReport: "ML Studio-rapport", metricsLabel: "Modellmåltall:", warningsLabel: "Advarsler:", none: "Ingen.", top: "viktigste" },
  fi: { fileLimit: "Väliaikainen käsittely olemassa olevassa Vercel Functionissa: enintään 2,5 Mt, 10 000 riviä ja 50 saraketta. Aineistoa ei tallenneta.", chartScatterNote: "Luokittelu: tarkkuus vs. makro-F1; pisteen koko = tasapainotettu tarkkuus. Regressio: MAE vs. RMSE.", questionPlaceholder: "esim. mikä malli yleistyy parhaiten ja mitä rajoituksia tulisi huomioida?", freeOnly: "Käyttää vain openrouter/free-reittiä ilman maksullista varamallia. Saatavuus ja maksuttomat kiintiöt ovat palveluntarjoajan hallinnassa eikä niitä taata.", method: "Luokittelu vertailee Random Forestia, lineaarista SVM:ää ja kevyttä neuroverkko-MLP:tä; regressio vertailee Random Forestia, Ridgeä ja MLP:tä. Satunnainen 80/20-jako ei ole riippumaton validointi. MLP ei ole kuvien CNN. Mittarit eivät todista syy-seuraussuhdetta eivätkä korvaa asiantuntija-arviota.", mlReport: "ML-raportti", mlStudioReport: "ML Studio -raportti", metricsLabel: "Mallien mittarit:", warningsLabel: "Varoitukset:", none: "Ei mitään.", top: "tärkeintä" },
  uk: { fileLimit: "Тимчасова обробка в наявній Vercel Function: до 2,5 МБ, 10 000 рядків і 50 стовпців. Набір даних не зберігається.", chartScatterNote: "Класифікація: точність і макро-F1; розмір точки = збалансована точність. Регресія: MAE і RMSE.", questionPlaceholder: "наприклад, яка модель краще узагальнює та які обмеження врахувати?", freeOnly: "Використовується лише маршрут openrouter/free без платної резервної моделі. Доступність і безкоштовні квоти залежать від провайдера й не гарантуються.", method: "Класифікація порівнює Random Forest, лінійну SVM і легку нейронну MLP; регресія — Random Forest, Ridge і MLP. Випадковий поділ 80/20 не є незалежною перевіркою. MLP — не CNN для зображень. Метрики не доводять причинність і не замінюють експертну оцінку.", mlReport: "Звіт ML", mlStudioReport: "Звіт ML Studio", metricsLabel: "Метрики моделей:", warningsLabel: "Попередження:", none: "Немає.", top: "найважливіших" },
  cs: { fileLimit: "Dočasné zpracování v existující Vercel Function: maximálně 2,5 MB, 10 000 řádků a 50 sloupců. Datová sada se neukládá.", chartScatterNote: "Klasifikace: přesnost vs. makro F1; velikost bodu = vyvážená přesnost. Regrese: MAE vs. RMSE.", questionPlaceholder: "např. který model lépe zobecňuje a jaká omezení mám zvážit?", freeOnly: "Používá pouze trasu openrouter/free bez placeného náhradního modelu. Dostupnost a bezplatné kvóty určuje poskytovatel a nejsou zaručeny.", method: "Klasifikace porovnává Random Forest, lineární SVM a lehkou neuronovou MLP; regrese porovnává Random Forest, Ridge a MLP. Náhodné rozdělení 80/20 není nezávislá validace. MLP není obrazová CNN. Metriky nedokazují kauzalitu a nenahrazují odborné posouzení.", mlReport: "ML zpráva", mlStudioReport: "Zpráva ML Studio", metricsLabel: "Metriky modelů:", warningsLabel: "Upozornění:", none: "Žádné.", top: "nejlepších" },
};

const localizedErrors: Record<string, Pick<typeof copy.en, "fileTooLarge" | "selectDataset">> = {
  es: { fileTooLarge: "El archivo debe ser menor de 2,5 MB.", selectDataset: "Carga un conjunto de datos y selecciona un objetivo y al menos una variable predictora." },
  fr: { fileTooLarge: "Le fichier doit faire moins de 2,5 Mo.", selectDataset: "Importez un jeu de données et sélectionnez une cible ainsi qu’au moins une variable prédictive." },
  de: { fileTooLarge: "Die Datei muss kleiner als 2,5 MB sein.", selectDataset: "Laden Sie einen Datensatz hoch und wählen Sie ein Ziel sowie mindestens einen Prädiktor aus." },
  pt: { fileTooLarge: "O ficheiro deve ter menos de 2,5 MB.", selectDataset: "Carregue um conjunto de dados e selecione um alvo e pelo menos uma variável preditora." },
  ru: { fileTooLarge: "Размер файла должен быть меньше 2,5 МБ.", selectDataset: "Загрузите набор данных и выберите целевую переменную и хотя бы один признак." },
  pl: { fileTooLarge: "Plik musi mieć mniej niż 2,5 MB.", selectDataset: "Prześlij zbiór danych i wybierz cel oraz co najmniej jedną zmienną predykcyjną." },
  nl: { fileTooLarge: "Het bestand moet kleiner zijn dan 2,5 MB.", selectDataset: "Upload een dataset en selecteer een doelvariabele en ten minste één voorspeller." },
  tr: { fileTooLarge: "Dosya 2,5 MB'tan küçük olmalıdır.", selectDataset: "Bir veri kümesi yükleyin ve bir hedef ile en az bir yordayıcı seçin." },
  sv: { fileTooLarge: "Filen måste vara mindre än 2,5 MB.", selectDataset: "Ladda upp en datauppsättning och välj ett mål samt minst en prediktor." },
  da: { fileTooLarge: "Filen skal være mindre end 2,5 MB.", selectDataset: "Upload et datasæt, og vælg et mål samt mindst én prædiktor." },
  no: { fileTooLarge: "Filen må være mindre enn 2,5 MB.", selectDataset: "Last opp et datasett og velg et mål samt minst én prediktor." },
  fi: { fileTooLarge: "Tiedoston on oltava alle 2,5 Mt.", selectDataset: "Lataa aineisto ja valitse kohde sekä vähintään yksi selittävä muuttuja." },
  uk: { fileTooLarge: "Файл має бути меншим за 2,5 МБ.", selectDataset: "Завантажте набір даних і виберіть цільову змінну та принаймні один предиктор." },
  cs: { fileTooLarge: "Soubor musí být menší než 2,5 MB.", selectDataset: "Nahrajte datovou sadu a vyberte cíl a alespoň jeden prediktor." },
};

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize)
    );
  }
  return btoa(binary);
}

function formatMetric(value: number | undefined, language: string) {
  return value === undefined
    ? "—"
    : value.toLocaleString(getMlStudioLocale(language), {
        maximumFractionDigits: 3,
      });
}

function formatReportMetric(value: number | undefined, language: string) {
  return formatMetric(value, language);
}

function formatCount(value: number, language: string) {
  return value.toLocaleString(getMlStudioLocale(language));
}

function formatPercent(value: number, language: string) {
  return value.toLocaleString(getMlStudioLocale(language), {
    style: "percent",
    maximumFractionDigits: 0,
  });
}

export default function MlStudio() {
  const { language } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const reportLanguage = resolveAnalyticsReportLanguage(language);
  const text = {
    ...(reportLanguage === "it" ? copy.it : copy.en),
    ...localizedCopy[reportLanguage],
    ...localizedDetails[reportLanguage],
    ...localizedErrors[reportLanguage],
  };
  const [file, setFile] = useState<{
    name: string;
    contentBase64: string;
  } | null>(null);
  const [preview, setPreview] = useState<{
    name: string;
    rows: number;
    columns: Array<{
      name: string;
      kind: "numeric" | "category";
      nonEmpty: number;
    }>;
  } | null>(null);
  const [task, setTask] = useState<"classification" | "regression">(
    "classification"
  );
  const [target, setTarget] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [chartType, setChartType] = useState<
    "bar" | "line" | "radar" | "scatter"
  >("bar");
  const [sector, setSector] = useState("");
  const [question, setQuestion] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [answer, setAnswer] = useState("");
  const previewMutation = trpc.mlStudio.previewDataset.useMutation();
  const trainMutation = trpc.mlStudio.trainTabular.useMutation();
  const explainMutation = trpc.mlStudio.explainResults.useMutation();
  const result = trainMutation.data;
  const assessment = useMemo(
    () =>
      result
        ? createMlAssessment(result, reportLanguage)
        : null,
    [result, language]
  );
  const reportContent = useMemo(() => {
    if (!result || !assessment) return "";
    const modelMetrics = result.models.map(model =>
      result.task === "classification"
        ? `${localizeMlModelName(model.name, reportLanguage)}: ${text.accuracy.toLowerCase()} ${formatReportMetric(model.accuracy, reportLanguage)}, ${text.balancedAccuracy.toLowerCase()} ${formatReportMetric(model.balancedAccuracy, reportLanguage)}, ${text.macroF1} ${formatReportMetric(model.macroF1, reportLanguage)}`
        : `${localizeMlModelName(model.name, reportLanguage)}: ${text.r2} ${formatReportMetric(model.r2, reportLanguage)}, ${text.mae} ${formatReportMetric(model.mae, reportLanguage)}, ${text.rmse} ${formatReportMetric(model.rmse, reportLanguage)}`
    );
    return [
      `${text.dataset}: ${result.fileName}`,
      `${text.task}: ${result.task === "classification" ? text.classification : text.regression}; ${text.target}: ${result.target}`,
      `${text.rows}: ${formatCount(result.usableRows, reportLanguage)}; ${text.train}: ${formatCount(result.trainRows, reportLanguage)}; ${text.testRows}: ${formatCount(result.testRows, reportLanguage)}`,
      `${text.best}: ${localizeMlModelName(result.bestModel, reportLanguage)}`,
      "",
      text.metricsLabel,
      ...modelMetrics,
      "",
      `${text.importance}:`,
      ...result.featureImportance.map(
        feature =>
          `${feature.name}: ${formatReportMetric(feature.importance, reportLanguage)}`
      ),
      "",
      text.warningsLabel,
      ...(result.warnings.length
        ? result.warnings.map(warning =>
            localizeMlWarning(warning, reportLanguage)
          )
        : [text.none]),
    ].join("\n");
  }, [assessment, reportLanguage, result, text]);
  const reportConclusion = useMemo<AnalyticsReportConclusion | undefined>(
    () =>
      assessment
        ? {
            title: assessment.title,
            content: [
              assessment.summary,
              ...assessment.findings.map(finding => `• ${finding}`),
              assessment.disclaimer,
            ].join("\n\n"),
          }
        : undefined,
    [assessment]
  );
  const classificationChartData =
    result?.task === "classification"
      ? result.models.map(model => ({
          model: localizeMlModelName(model.name, reportLanguage),
          accuracy: model.accuracy ?? 0,
          balancedAccuracy: model.balancedAccuracy ?? 0,
          macroF1: model.macroF1 ?? 0,
        }))
      : [];
  const radarChartData =
    result?.task === "classification"
      ? [
          {
            metric: text.accuracy,
            ...Object.fromEntries(
              result.models.map(model => [model.name, model.accuracy ?? 0])
            ),
          },
          {
            metric: text.balancedAccuracy,
            ...Object.fromEntries(
              result.models.map(model => [
                model.name,
                model.balancedAccuracy ?? 0,
              ])
            ),
          },
          {
            metric: text.macroF1,
            ...Object.fromEntries(
              result.models.map(model => [model.name, model.macroF1 ?? 0])
            ),
          },
        ]
      : [];
  const regressionErrorData =
    result?.task === "regression"
      ? result.models.map(model => ({
          model: localizeMlModelName(model.name, reportLanguage),
          mae: model.mae ?? 0,
          rmse: model.rmse ?? 0,
        }))
      : [];
  const bestConfusionMatrix =
    result?.models.find(model => model.name === result.bestModel)
      ?.confusionMatrix ?? [];
  const maxConfusionCount = Math.max(1, ...bestConfusionMatrix.flat());
  const reportVisuals = useMemo<AnalyticsReportVisual[]>(() => {
    if (!result) return [];
    const visuals: AnalyticsReportVisual[] = [];
    if (result.task === "classification") {
      visuals.push({
        type: "chart",
        title: text.metricsChart,
        chartType: "bar",
        orientation: "horizontal",
        categories: result.models.map(model =>
          localizeMlModelName(model.name, reportLanguage)
        ),
        series: [
          {
            name: text.accuracy,
            color: "#2563eb",
            values: result.models.map(model => model.accuracy ?? null),
          },
          {
            name: text.balancedAccuracy,
            color: "#16a34a",
            values: result.models.map(model => model.balancedAccuracy ?? null),
          },
          {
            name: text.macroF1,
            color: "#f59e0b",
            values: result.models.map(model => model.macroF1 ?? null),
          },
        ],
        minValue: 0,
        maxValue: 1,
      });
      if (
        result.classLabels.length &&
        result.classLabels.length <= 10 &&
        bestConfusionMatrix.length
      ) {
        visuals.push({
          type: "matrix",
          title: text.confusion,
          rowLabels: result.classLabels,
          columnLabels: result.classLabels,
          values: bestConfusionMatrix,
        });
      }
    } else {
      visuals.push(
        {
          type: "chart",
          title: text.r2,
          chartType: "bar",
          orientation: "horizontal",
          categories: result.models.map(model =>
            localizeMlModelName(model.name, reportLanguage)
          ),
          series: [
            {
              name: text.r2,
              color: "#2563eb",
              values: result.models.map(model => model.r2 ?? null),
            },
          ],
        },
        {
          type: "chart",
          title: text.errorsChart,
          chartType: "bar",
          orientation: "horizontal",
          categories: result.models.map(model =>
            localizeMlModelName(model.name, reportLanguage)
          ),
          series: [
            {
              name: text.mae,
              color: "#16a34a",
              values: result.models.map(model => model.mae ?? null),
            },
            {
              name: text.rmse,
              color: "#f59e0b",
              values: result.models.map(model => model.rmse ?? null),
            },
          ],
          minValue: 0,
        }
      );
    }
    if (result.featureImportance.length) {
      const topFeatures = result.featureImportance.slice(0, 12);
      visuals.push({
        type: "chart",
        title: `${text.importance} (${text.top} ${formatCount(topFeatures.length, reportLanguage)})`,
        chartType: "bar",
        orientation: "horizontal",
        categories: topFeatures.map(feature => feature.name),
        series: [
          {
            name: text.importance,
            color: "#0f766e",
            values: topFeatures.map(feature => feature.importance),
          },
        ],
        minValue: 0,
      });
    }
    return visuals;
  }, [bestConfusionMatrix, reportLanguage, result, text]);
  const activeChartType =
    chartType === "radar" && result?.task !== "classification"
      ? "bar"
      : chartType;
  const usableTargets = useMemo(
    () =>
      preview?.columns.filter(
        column => task === "classification" || column.kind === "numeric"
      ) ?? [],
    [preview, task]
  );

  const loadDatasetPayload = async (dataset: {
    name: string;
    contentBase64: string;
  }) => {
    setError("");
    setAnswerError("");
    setAnswer("");
    setConsent(false);
    setQuestion("");
    trainMutation.reset();
    setPreview(null);
    setFile(null);
    const data = await previewMutation.mutateAsync(dataset);
    setFile(dataset);
    setPreview(data);
    const defaultTask = data.columns.some(column => column.kind === "category")
      ? "classification"
      : "regression";
    setTask(defaultTask);
    const defaultTarget =
      data.columns.find(column =>
        defaultTask === "classification"
          ? column.kind === "category"
          : column.kind === "numeric"
      )?.name ?? "";
    setTarget(defaultTarget);
    setFeatures(
      data.columns
        .filter(column => column.name !== defaultTarget)
        .map(column => column.name)
    );
  };

  const loadFile = async (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > 2_500_000) {
      setError(text.fileTooLarge);
      return;
    }
    try {
      const contentBase64 = encodeBase64(
        new Uint8Array(await selected.arrayBuffer())
      );
      await loadDatasetPayload({ name: selected.name, contentBase64 });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const changeTask = (next: "classification" | "regression") => {
    trainMutation.reset();
    setConsent(false);
    setTask(next);
    const nextTarget =
      preview?.columns.find(column =>
        next === "classification"
          ? column.kind === "category"
          : column.kind === "numeric"
      )?.name ?? "";
    setTarget(nextTarget);
    setFeatures(current => current.filter(feature => feature !== nextTarget));
    setAnswer("");
  };

  const runTraining = async () => {
    setError("");
    setAnswerError("");
    setAnswer("");
    setConsent(false);
    if (!file || !target || !features.length) {
      setError(text.selectDataset);
      return;
    }
    try {
      await trainMutation.mutateAsync({ ...file, task, target, features });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const explain = async () => {
    setAnswerError("");
    if (!result || !question.trim() || !consent) return;
    try {
      const response = await explainMutation.mutateAsync({
        question: question.trim(),
        consent: true,
        language: reportLanguage === "it" ? "it" : "en",
        sector: sector.trim(),
        task: result.task,
        target: result.target,
        bestModel: result.bestModel,
        trainRows: result.trainRows,
        testRows: result.testRows,
        models: result.models,
        featureImportance: result.featureImportance,
        classLabels: result.classLabels,
      });
      setAnswer(response.content);
    } catch (reason) {
      setAnswerError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Seo
        title={`${text.title} | Tatik.space`}
        description={text.description}
        path="/analysis/ml-studio"
        language={language}
        noIndex
      />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <BrainCircuit className="h-4 w-4 text-primary" /> {text.dataset}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            {text.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            {text.intro}
          </p>
        </div>
      </section>
      <section className="container max-w-6xl space-y-6 px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>{text.dataset}</CardTitle>
            <CardDescription>{text.fileLimit}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnalyticsUsageNotice language={reportLanguage} />
            <label className="block space-y-2 text-sm font-medium">
              {text.file}
              <Input
                type="file"
                accept=".csv,.json,.xlsx"
                disabled={
                  !isAuthenticated || authLoading || previewMutation.isPending
                }
                onChange={event => {
                  void loadFile(event.currentTarget.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            {preview && (
              <>
                <p className="text-sm text-muted-foreground">
                  {preview.name} ·{" "}
                  {preview.rows.toLocaleString(
                    getMlStudioLocale(reportLanguage)
                  )}{" "}
                  {text.rows} · {preview.columns.length} {text.columns}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    {text.task}
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3"
                      value={task}
                      onChange={event =>
                        changeTask(
                          event.target.value as "classification" | "regression"
                        )
                      }
                    >
                      <option value="classification">
                        {text.classification}
                      </option>
                      <option value="regression">{text.regression}</option>
                    </select>
                  </label>
                  <label className="space-y-1 text-sm">
                    {text.target}
                    <select
                      className="h-10 w-full rounded-md border border-input bg-background px-3"
                      value={target}
                      onChange={event => {
                        trainMutation.reset();
                        setConsent(false);
                        setAnswer("");
                        setTarget(event.target.value);
                        setFeatures(current =>
                          current.filter(
                            feature => feature !== event.target.value
                          )
                        );
                      }}
                    >
                      {usableTargets.map(column => (
                        <option key={column.name} value={column.name}>
                          {column.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block max-w-xl space-y-1 text-sm">
                  {text.sector}
                  <Input
                    value={sector}
                    onChange={event => setSector(event.target.value)}
                    maxLength={100}
                    placeholder={text.sectorPlaceholder}
                  />
                </label>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">
                    {text.features}
                  </legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {preview.columns
                      .filter(column => column.name !== target)
                      .map(column => (
                        <label
                          key={column.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={features.includes(column.name)}
                            onChange={event => {
                              trainMutation.reset();
                              setConsent(false);
                              setAnswer("");
                              setFeatures(current =>
                                event.target.checked
                                  ? [...current, column.name]
                                  : current.filter(
                                      feature => feature !== column.name
                                    )
                              );
                            }}
                          />
                          {column.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({column.kind})
                          </span>
                        </label>
                      ))}
                  </div>
                </fieldset>
                <p className="text-xs text-muted-foreground">{text.method}</p>
                <Button
                  onClick={runTraining}
                  disabled={
                    !isAuthenticated ||
                    trainMutation.isPending ||
                    !usableTargets.length ||
                    !features.length
                  }
                >
                  {trainMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {trainMutation.isPending ? text.working : text.run}
                </Button>
              </>
            )}
            {!isAuthenticated && !authLoading && (
              <p className="text-sm text-muted-foreground">
                {text.login}{" "}
                <Link href="/login" className="text-primary underline">
                  {text.signIn}
                </Link>
              </p>
            )}
            {previewMutation.isPending && (
              <p role="status" className="text-sm text-muted-foreground">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                {text.working}
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
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{text.models}</CardTitle>
              <CardDescription>
                {result.fileName} ·{" "}
                {result.usableRows.toLocaleString(
                  getMlStudioLocale(reportLanguage)
                )}{" "}
                {text.observations} ·{" "}
                {result.trainRows.toLocaleString(
                  getMlStudioLocale(reportLanguage)
                )}{" "}
                {text.train} /{" "}
                {result.testRows.toLocaleString(
                  getMlStudioLocale(reportLanguage)
                )}{" "}
                {text.testRows}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="rounded-md border bg-muted/40 p-3 text-sm">
                <strong>{text.best}:</strong>{" "}
                {localizeMlModelName(result.bestModel, reportLanguage)}
              </p>
              <label className="block max-w-sm space-y-1 text-sm font-medium">
                {text.chartType}
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  value={activeChartType}
                  onChange={event =>
                    setChartType(event.target.value as typeof chartType)
                  }
                >
                  <option value="bar">{text.chartBars}</option>
                  <option value="line">{text.chartLines}</option>
                  {result.task === "classification" && (
                    <option value="radar">{text.chartRadar}</option>
                  )}
                  <option value="scatter">{text.chartScatter}</option>
                </select>
              </label>
              {result.task === "classification" &&
                activeChartType === "bar" && (
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.metricsChart}
                  >
                    <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={classificationChartData}
                        layout="vertical"
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={value =>
                            formatPercent(Number(value), reportLanguage)
                          }
                        />
                        <YAxis dataKey="model" type="category" width={130} />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="accuracy"
                          name={text.accuracy}
                          fill="#2563eb"
                          maxBarSize={18}
                        />
                        <Bar
                          dataKey="balancedAccuracy"
                          name={text.balancedAccuracy}
                          fill="#16a34a"
                          maxBarSize={18}
                        />
                        <Bar
                          dataKey="macroF1"
                          name={text.macroF1}
                          fill="#f59e0b"
                          maxBarSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>
                )}
              {result.task === "classification" &&
                activeChartType === "line" && (
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.metricsChart}
                  >
                    <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={classificationChartData}
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={value =>
                            formatPercent(Number(value), reportLanguage)
                          }
                        />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Legend />
                        <Line
                          dataKey="accuracy"
                          name={text.accuracy}
                          stroke="#2563eb"
                        />
                        <Line
                          dataKey="balancedAccuracy"
                          name={text.balancedAccuracy}
                          stroke="#16a34a"
                        />
                        <Line
                          dataKey="macroF1"
                          name={text.macroF1}
                          stroke="#f59e0b"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </section>
                )}
              {result.task === "classification" &&
                activeChartType === "radar" && (
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.metricsChart}
                  >
                    <h3 className="mb-3 font-semibold">{text.metricsChart}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarChartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis
                          domain={[0, 1]}
                          tickFormatter={value =>
                            formatPercent(Number(value), reportLanguage)
                          }
                        />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Legend />
                        {result.models.map((model, index) => {
                          const color = ["#2563eb", "#16a34a", "#f59e0b"][
                            index % 3
                          ];
                          return (
                            <Radar
                              key={model.name}
                              name={localizeMlModelName(
                                model.name,
                                reportLanguage
                              )}
                              dataKey={model.name}
                              stroke={color}
                              fill={color}
                              fillOpacity={0.12}
                            />
                          );
                        })}
                      </RadarChart>
                    </ResponsiveContainer>
                  </section>
                )}
              {result.task === "classification" &&
                activeChartType === "scatter" && (
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.chartScatter}
                  >
                    <h3 className="mb-1 font-semibold">{text.chartScatter}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {text.chartScatterNote}
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <ScatterChart
                        margin={{ left: 12, right: 24, bottom: 12 }}
                      >
                        <CartesianGrid />
                        <XAxis
                          dataKey="accuracy"
                          name={text.accuracy}
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={value =>
                            formatPercent(Number(value), reportLanguage)
                          }
                        />
                        <YAxis
                          dataKey="macroF1"
                          name={text.macroF1}
                          type="number"
                          domain={[0, 1]}
                          tickFormatter={value =>
                            formatPercent(Number(value), reportLanguage)
                          }
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Scatter
                          name={text.models}
                          data={classificationChartData}
                          fill="#2563eb"
                        >
                          {classificationChartData.map((model, index) => (
                            <Cell
                              key={model.model}
                              fill={
                                ["#2563eb", "#16a34a", "#f59e0b"][index % 3]
                              }
                            />
                          ))}
                          <LabelList dataKey="model" position="top" />
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </section>
                )}
              {result.task === "regression" && activeChartType === "bar" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={`${text.r2} ${text.metricsChart}`}
                  >
                    <h3 className="mb-3 font-semibold">R²</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={result.models.map(model => ({
                          model: localizeMlModelName(
                            model.name,
                            reportLanguage
                          ),
                          r2: model.r2 ?? 0,
                        }))}
                        layout="vertical"
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          domain={["auto", "auto"]}
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <YAxis dataKey="model" type="category" width={130} />
                        <ReferenceLine x={0} stroke="#64748b" />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Bar
                          dataKey="r2"
                          name="R²"
                          fill="#2563eb"
                          maxBarSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.errorsChart}
                  >
                    <h3 className="mb-3 font-semibold">{text.errorsChart}</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={regressionErrorData}
                        layout="vertical"
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          domain={[0, "auto"]}
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <YAxis dataKey="model" type="category" width={130} />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Legend />
                        <Bar
                          dataKey="mae"
                          name={text.mae}
                          fill="#16a34a"
                          maxBarSize={18}
                        />
                        <Bar
                          dataKey="rmse"
                          name={text.rmse}
                          fill="#f59e0b"
                          maxBarSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </section>
                </div>
              )}
              {result.task === "regression" && activeChartType === "line" && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={`${text.r2} ${text.metricsChart}`}
                  >
                    <h3 className="mb-3 font-semibold">R²</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={result.models.map(model => ({
                          model: localizeMlModelName(
                            model.name,
                            reportLanguage
                          ),
                          r2: model.r2 ?? 0,
                        }))}
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis
                          type="number"
                          domain={["auto", "auto"]}
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Line dataKey="r2" name="R²" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </section>
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.errorsChart}
                  >
                    <h3 className="mb-3 font-semibold">{text.errorsChart}</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={regressionErrorData}
                        margin={{ left: 12, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis
                          type="number"
                          domain={[0, "auto"]}
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Tooltip
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Legend />
                        <Line dataKey="mae" name={text.mae} stroke="#16a34a" />
                        <Line
                          dataKey="rmse"
                          name={text.rmse}
                          stroke="#f59e0b"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </section>
                </div>
              )}
              {result.task === "regression" &&
                activeChartType === "scatter" && (
                  <section
                    className="rounded-lg border p-4"
                    role="img"
                    aria-label={text.chartScatter}
                  >
                    <h3 className="mb-1 font-semibold">{text.chartScatter}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {text.chartScatterNote}
                    </p>
                    <ResponsiveContainer width="100%" height={280}>
                      <ScatterChart
                        margin={{ left: 12, right: 24, bottom: 12 }}
                      >
                        <CartesianGrid />
                        <XAxis
                          dataKey="mae"
                          name={text.mae}
                          type="number"
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <YAxis
                          dataKey="rmse"
                          name={text.rmse}
                          type="number"
                          tickFormatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          formatter={value =>
                            formatMetric(Number(value), reportLanguage)
                          }
                        />
                        <Scatter
                          name={text.models}
                          data={regressionErrorData}
                          fill="#2563eb"
                        >
                          {regressionErrorData.map((model, index) => (
                            <Cell
                              key={model.model}
                              fill={
                                ["#2563eb", "#16a34a", "#f59e0b"][index % 3]
                              }
                            />
                          ))}
                          <LabelList dataKey="model" position="top" />
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </section>
                )}
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3">{text.model}</th>
                      {result.task === "classification" ? (
                        <>
                          <th className="p-3">{text.accuracy}</th>
                          <th className="p-3">{text.balancedAccuracy}</th>
                          <th className="p-3">{text.macroF1}</th>
                        </>
                      ) : (
                        <>
                          <th className="p-3">{text.r2}</th>
                          <th className="p-3">{text.mae}</th>
                          <th className="p-3">{text.rmse}</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.models.map(model => (
                      <tr key={model.name} className="border-t">
                        <td className="p-3">
                          {localizeMlModelName(model.name, reportLanguage)}
                        </td>
                        {result.task === "classification" ? (
                          <>
                            <td className="p-3">
                              {formatMetric(model.accuracy, reportLanguage)}
                            </td>
                            <td className="p-3">
                              {formatMetric(
                                model.balancedAccuracy,
                                reportLanguage
                              )}
                            </td>
                            <td className="p-3">
                              {formatMetric(model.macroF1, reportLanguage)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3">
                              {formatMetric(model.r2, reportLanguage)}
                            </td>
                            <td className="p-3">
                              {formatMetric(model.mae, reportLanguage)}
                            </td>
                            <td className="p-3">
                              {formatMetric(model.rmse, reportLanguage)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.task === "classification" &&
                result.classLabels.length > 0 && (
                  <div className="overflow-x-auto">
                    <p className="mb-2 text-sm font-medium">{text.confusion}</p>
                    <table className="w-full min-w-[420px] text-left text-xs">
                      <thead>
                        <tr>
                          <th className="p-2">{text.realPredicted}</th>
                          {result.classLabels.map(label => (
                            <th className="p-2" key={label}>
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.classLabels.map((label, rowIndex) => (
                          <tr className="border-t" key={label}>
                            <th className="p-2">{label}</th>
                            {bestConfusionMatrix[rowIndex]?.map(
                              (count, columnIndex) => (
                                <td
                                  className="p-2"
                                  key={`${label}-${columnIndex}`}
                                >
                                  <span
                                    className="block rounded px-2 py-2 text-center"
                                    style={
                                      count
                                        ? {
                                            backgroundColor: `rgba(37, 99, 235, ${0.08 + (0.38 * count) / maxConfusionCount})`,
                                          }
                                        : undefined
                                    }
                                  >
                                    {formatCount(count, reportLanguage)}
                                  </span>
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              {result.featureImportance.length > 0 && (
                <section
                  className="rounded-lg border p-4"
                  role="img"
                  aria-label={text.importance}
                >
                  <h3 className="mb-2 font-semibold">{text.importance}</h3>
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(180, result.featureImportance.length * 34)}
                  >
                    <BarChart
                      data={result.featureImportance}
                      layout="vertical"
                      margin={{ left: 12, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, "dataMax"]}
                        tickFormatter={value =>
                          formatMetric(Number(value), reportLanguage)
                        }
                      />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip
                        formatter={value =>
                          formatMetric(Number(value), reportLanguage)
                        }
                      />
                      <Bar
                        dataKey="importance"
                        name={text.importance}
                        fill="#0f766e"
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              )}
              <ul className="space-y-1 text-sm text-muted-foreground">
                {result.warnings.map(warning => (
                  <li key={warning}>
                    • {localizeMlWarning(warning, reportLanguage)}
                  </li>
                ))}
              </ul>
              {assessment && (
                <section className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{assessment.title}</h3>
                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                      {text.assessmentDisclaimer}
                    </span>
                  </div>
                  <p className="text-sm">{assessment.summary}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {assessment.findings.map(finding => (
                      <li key={finding}>{finding}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    {assessment.disclaimer}
                  </p>
                </section>
              )}
              <section className="space-y-3 border-t pt-5">
                <h3 className="font-semibold">{text.explainTitle}</h3>
                <label className="block max-w-xl space-y-1 text-sm">
                  {text.question}
                  <Input
                    value={question}
                    onChange={event => setQuestion(event.target.value)}
                    maxLength={1000}
                    placeholder={text.questionPlaceholder}
                  />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={consent}
                    onChange={event => setConsent(event.target.checked)}
                  />
                  <span>{text.consent}</span>
                </label>
                <p className="text-xs text-muted-foreground">{text.freeOnly}</p>
                <Button
                  variant="outline"
                  onClick={explain}
                  disabled={
                    !consent || !question.trim() || explainMutation.isPending
                  }
                >
                  {explainMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {text.explain}
                </Button>
                {answerError && (
                  <p role="alert" className="text-sm text-destructive">
                    {answerError}
                  </p>
                )}
                {answer && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="mb-2 font-medium">{text.answer}</h4>
                    <p className="whitespace-pre-wrap text-sm">{answer}</p>
                  </div>
                )}
              </section>
            </CardContent>
          </Card>
        )}
        <AnalyticsReportDownload
          title={
            result
              ? `${text.mlReport} - ${result.fileName}`
              : language === "it"
                ? text.mlStudioReport
                : text.mlStudioReport
          }
          content={reportContent}
          visuals={reportVisuals}
          conclusion={reportConclusion}
          language={reportLanguage}
          returnPath="/analysis/ml-studio"
        />
        <MlStudioSources
          language={language}
          onMergedDataset={loadDatasetPayload}
        />
      </section>
    </main>
  );
}
