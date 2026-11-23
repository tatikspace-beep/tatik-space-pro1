import type { StatisticalAnalysis } from "../../../server/data-insight";
import type {
  AnalyticsReportConclusion,
  AnalyticsReportLanguage,
} from "./analyticsReportPdf";

type LanguageCopy = {
  title: string;
  summary: (series: string, observations: string) => string;
  trend: (name: string, direction: string, first: string, last: string, count: string) => string;
  rising: string;
  falling: string;
  stable: string;
  unknown: string;
  change: (value: string) => string;
  noChange: string;
  validation: (points: string, mae: string, unit: string, mape: string) => string;
  noValidation: string;
  points: (count: number) => string;
  projection: (count: string) => string;
  strongest: (first: string, second: string, r: string, count: string, interpretation: string) => string;
  factor: (target: string, count: string, r2: string) => string;
  warnings: (warnings: string) => string;
  disclaimer: string;
  positive: string;
  negative: string;
  weak: string;
  moderate: string;
  strong: string;
  causal: string;
  shock: string;
  fullShock: string;
  commonDates: string;
  factorWarning: string;
  localDisclaimer: string;
  people: string;
  units: string;
  seriesLabels: Record<string, string>;
};

const copies: Partial<Record<AnalyticsReportLanguage, LanguageCopy>> = {
  it: {
    title: "Valutazione tecnica orientativa (automatica)",
    summary: (s, o) => `L'analisi esplorativa comprende ${s} serie e ${o} osservazioni complessive.`,
    trend: (n, d, f, l, c) => `${n}: andamento ${d} dal ${f} al ${l} (${c} osservazioni)`,
    rising: "crescente", falling: "decrescente", stable: "quasi stabile", unknown: "non stimabile",
    change: v => `variazione complessiva ${v}%`, noChange: "variazione complessiva non calcolabile",
    validation: (p, mae, u, mape) => `test storico su ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "nessun punto disponibile per il test storico",
    points: n => `${n} ${n === 1 ? "punto" : "punti"}`,
    projection: n => `Sono state generate proiezioni lineari per ${n} serie. Sono scenari esplorativi senza intervalli di confidenza, non previsioni certificate.`,
    strongest: (a, b, r, n, i) => `L'associazione più forte tra le serie è ${a} / ${b} (r=${r}, ${n} date comuni); ${i}`,
    factor: (t, n, r) => `Il modello fattoriale sul target ${t} usa ${n} osservazioni${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Avvertenze rilevate: ${w}`,
    disclaimer: "Sintesi automatizzata basata sui risultati mostrati; non è una perizia firmata né una certificazione. Le proiezioni non garantiscono risultati futuri e le correlazioni non dimostrano causalità.",
    positive: "associazione positiva", negative: "associazione negativa", weak: "associazione debole", moderate: "associazione moderata", strong: "associazione forte",
    causal: "non dimostra causalità",
    shock: "Estrapolazione lineare sensibile a shock.",
    fullShock: "Estrapolazione lineare sensibile a shock, stagionalità e cambi di regime.",
    commonDates: "Associazione osservata sulle date comuni; non implica causalità.",
    factorWarning: "Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalità e possono essere instabili con pochi dati o variabili collineari.",
    localDisclaimer: "Valutazione statistica locale in Python, non un agente LLM. Le correlazioni non dimostrano causalità; le proiezioni lineari non sono previsioni certificate.",
    people: "persone", units: "unità",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Spesa militare (% PIL; WDI/SIPRI)",
      "PIL (USD correnti)": "PIL (USD correnti)",
      "Popolazione totale": "Popolazione totale",
      "Temperatura media giornaliera": "Temperatura media giornaliera",
      "Cambio di riferimento USD per EUR": "Cambio di riferimento USD per EUR",
      "Popolazione residente in Italia": "Popolazione residente in Italia",
      "Banca Mondiale": "Banca Mondiale", "Banca Centrale Europea": "Banca Centrale Europea", BCE: "BCE",
    },
  },
  en: {
    title: "Automated technical assessment",
    summary: (s, o) => `This exploratory analysis covers ${s} series and ${o} observations in total.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trend from ${f} to ${l} (${c} observations)`,
    rising: "rising", falling: "falling", stable: "roughly stable", unknown: "not estimable",
    change: v => `overall change ${v}%`, noChange: "overall change could not be calculated",
    validation: (p, mae, u, mape) => `historical test on ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "no points available for historical testing",
    points: n => `${n} ${n === 1 ? "point" : "points"}`,
    projection: n => `Linear projections were generated for ${n} series. These are exploratory scenarios without confidence intervals, not certified forecasts.`,
    strongest: (a, b, r, n, i) => `The strongest association between series is ${a} / ${b} (r=${r}, ${n} overlapping dates); ${i}`,
    factor: (t, n, r) => `The factor model for target ${t} uses ${n} observations${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Warnings identified: ${w}`,
    disclaimer: "Automated summary based on the displayed results; it is not a signed expert opinion or certification. Projections do not guarantee future outcomes, and correlations do not establish causality.",
    positive: "positive association", negative: "negative association", weak: "weak association", moderate: "moderate association", strong: "strong association",
    causal: "it does not establish causality",
    shock: "Linear extrapolation is sensitive to shocks.",
    fullShock: "Linear extrapolation is sensitive to shocks, seasonality, and regime changes.",
    commonDates: "Association observed on overlapping dates; it does not imply causality.",
    factorWarning: "Association coefficients are conditional on the other selected factors; they do not prove causality and may be unstable with few observations or collinear variables.",
    localDisclaimer: "Local statistical assessment in Python, not an LLM agent. Correlations do not establish causality; linear projections are not certified forecasts.",
    people: "people", units: "units",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Military expenditure (% GDP; WDI/SIPRI)",
      "PIL (USD correnti)": "GDP (current USD)", "Popolazione totale": "Total population",
      "Temperatura media giornaliera": "Daily mean temperature",
      "Cambio di riferimento USD per EUR": "USD reference exchange rate",
      "Popolazione residente in Italia": "Resident population in Italy",
      "Banca Mondiale": "World Bank", "Banca Centrale Europea": "European Central Bank", BCE: "ECB",
    },
  },
  es: {
    title: "Evaluación técnica orientativa (automática)",
    summary: (s, o) => `Este análisis exploratorio incluye ${s} series y ${o} observaciones en total.`,
    trend: (n, d, f, l, c) => `${n}: tendencia ${d} del ${f} al ${l} (${c} observaciones)`,
    rising: "ascendente", falling: "descendente", stable: "aproximadamente estable", unknown: "no estimable",
    change: v => `cambio total ${v}%`, noChange: "no se pudo calcular el cambio total",
    validation: (p, mae, u, mape) => `prueba histórica en ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "no hay puntos disponibles para la prueba histórica",
    points: n => `${n} ${n === 1 ? "punto" : "puntos"}`,
    projection: n => `Se generaron proyecciones lineales para ${n} series. Son escenarios exploratorios sin intervalos de confianza, no pronósticos certificados.`,
    strongest: (a, b, r, n, i) => `La asociación más fuerte entre las series es ${a} / ${b} (r=${r}, ${n} fechas coincidentes); ${i}`,
    factor: (t, n, r) => `El modelo factorial para el objetivo ${t} usa ${n} observaciones${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Advertencias detectadas: ${w}`,
    disclaimer: "Resumen automatizado basado en los resultados mostrados; no es un dictamen firmado ni una certificación. Las proyecciones no garantizan resultados futuros y las correlaciones no demuestran causalidad.",
    positive: "asociación positiva", negative: "asociación negativa", weak: "asociación débil", moderate: "asociación moderada", strong: "asociación fuerte",
    causal: "no demuestra causalidad",
    shock: "La extrapolación lineal es sensible a los impactos.",
    fullShock: "La extrapolación lineal es sensible a los impactos, la estacionalidad y los cambios de régimen.",
    commonDates: "Asociación observada en fechas coincidentes; no implica causalidad.",
    factorWarning: "Los coeficientes de asociación están condicionados por los demás factores seleccionados; no demuestran causalidad y pueden ser inestables con pocos datos o variables colineales.",
    localDisclaimer: "Evaluación estadística local en Python, no un agente LLM. Las correlaciones no demuestran causalidad; las proyecciones lineales no son pronósticos certificados.",
    people: "personas", units: "unidades",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Gasto militar (% PIB; WDI/SIPRI)", "PIL (USD correnti)": "PIB (USD actuales)",
      "Popolazione totale": "Población total", "Temperatura media giornaliera": "Temperatura media diaria",
      "Cambio di riferimento USD per EUR": "Tipo de cambio de referencia USD por EUR",
      "Popolazione residente in Italia": "Población residente en Italia",
      "Banca Mondiale": "Banco Mundial", "Banca Centrale Europea": "Banco Central Europeo", BCE: "BCE",
    },
  },
  fr: {
    title: "Évaluation technique indicative (automatique)",
    summary: (s, o) => `Cette analyse exploratoire couvre ${s} séries et ${o} observations au total.`,
    trend: (n, d, f, l, c) => `${n} : tendance ${d} du ${f} au ${l} (${c} observations)`,
    rising: "à la hausse", falling: "à la baisse", stable: "globalement stable", unknown: "non estimable",
    change: v => `variation totale ${v}%`, noChange: "variation totale impossible à calculer",
    validation: (p, mae, u, mape) => `test historique sur ${p} : MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "aucun point disponible pour le test historique", points: n => `${n} ${n === 1 ? "point" : "points"}`,
    projection: n => `Des projections linéaires ont été générées pour ${n} séries. Ce sont des scénarios exploratoires sans intervalles de confiance, pas des prévisions certifiées.`,
    strongest: (a, b, r, n, i) => `L'association la plus forte entre les séries est ${a} / ${b} (r=${r}, ${n} dates communes) ; ${i}`,
    factor: (t, n, r) => `Le modèle factoriel pour la cible ${t} utilise ${n} observations${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Avertissements relevés : ${w}`,
    disclaimer: "Synthèse automatisée fondée sur les résultats affichés ; elle ne constitue ni une expertise signée ni une certification. Les projections ne garantissent pas les résultats futurs et les corrélations ne prouvent pas de causalité.",
    positive: "association positive", negative: "association négative", weak: "association faible", moderate: "association modérée", strong: "association forte",
    causal: "n'établit pas de causalité",
    shock: "L'extrapolation linéaire est sensible aux chocs.",
    fullShock: "L'extrapolation linéaire est sensible aux chocs, à la saisonnalité et aux changements de régime.",
    commonDates: "Association observée aux dates communes ; elle n'implique pas de causalité.",
    factorWarning: "Les coefficients d'association dépendent des autres facteurs sélectionnés ; ils ne prouvent pas de causalité et peuvent être instables avec peu de données ou des variables colinéaires.",
    localDisclaimer: "Évaluation statistique locale en Python, pas un agent LLM. Les corrélations n'établissent pas de causalité ; les projections linéaires ne sont pas des prévisions certifiées.",
    people: "personnes", units: "unités",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Dépenses militaires (% PIB ; WDI/SIPRI)", "PIL (USD correnti)": "PIB (USD courants)",
      "Popolazione totale": "Population totale", "Temperatura media giornaliera": "Température moyenne quotidienne",
      "Cambio di riferimento USD per EUR": "Taux de référence USD/EUR", "Popolazione residente in Italia": "Population résidente en Italie",
      "Banca Mondiale": "Banque mondiale", "Banca Centrale Europea": "Banque centrale européenne", BCE: "BCE",
    },
  },
  de: {
    title: "Automatisierte technische Einschätzung",
    summary: (s, o) => `Diese explorative Analyse umfasst insgesamt ${s} Reihen und ${o} Beobachtungen.`,
    trend: (n, d, f, l, c) => `${n}: ${d}er Trend von ${f} bis ${l} (${c} Beobachtungen)`,
    rising: "steigender", falling: "fallender", stable: "weitgehend stabiler", unknown: "nicht schätzbarer",
    change: v => `Gesamtänderung ${v}%`, noChange: "Gesamtänderung konnte nicht berechnet werden",
    validation: (p, mae, u, mape) => `historischer Test mit ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "keine Punkte für den historischen Test verfügbar", points: n => `${n} ${n === 1 ? "Punkt" : "Punkte"}`,
    projection: n => `Für ${n} Reihen wurden lineare Projektionen erstellt. Dies sind explorative Szenarien ohne Konfidenzintervalle, keine zertifizierten Prognosen.`,
    strongest: (a, b, r, n, i) => `Der stärkste Zusammenhang zwischen den Reihen besteht zwischen ${a} / ${b} (r=${r}, ${n} gemeinsame Daten); ${i}`,
    factor: (t, n, r) => `Das Faktormodell für das Ziel ${t} verwendet ${n} Beobachtungen${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Erkannte Warnungen: ${w}`,
    disclaimer: "Automatisierte Zusammenfassung der angezeigten Ergebnisse; kein unterzeichnetes Gutachten und keine Zertifizierung. Projektionen garantieren keine zukünftigen Ergebnisse, und Korrelationen belegen keine Kausalität.",
    positive: "positiver Zusammenhang", negative: "negativer Zusammenhang", weak: "schwacher Zusammenhang", moderate: "mäßiger Zusammenhang", strong: "starker Zusammenhang",
    causal: "belegt keine Kausalität",
    shock: "Lineare Extrapolation reagiert empfindlich auf Schocks.",
    fullShock: "Lineare Extrapolation reagiert empfindlich auf Schocks, Saisonalität und Regimewechsel.",
    commonDates: "An gemeinsamen Daten beobachteter Zusammenhang; keine Kausalitätsaussage.",
    factorWarning: "Zusammenhangskoeffizienten hängen von den übrigen ausgewählten Faktoren ab; sie belegen keine Kausalität und können bei wenigen Daten oder kollinearen Variablen instabil sein.",
    localDisclaimer: "Lokale statistische Auswertung in Python, kein LLM-Agent. Korrelationen belegen keine Kausalität; lineare Projektionen sind keine zertifizierten Prognosen.",
    people: "Personen", units: "Einheiten",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Militärausgaben (% BIP; WDI/SIPRI)", "PIL (USD correnti)": "BIP (US-Dollar, laufende Preise)",
      "Popolazione totale": "Gesamtbevölkerung", "Temperatura media giornaliera": "Tägliche Durchschnittstemperatur",
      "Cambio di riferimento USD per EUR": "USD-Referenzwechselkurs für EUR", "Popolazione residente in Italia": "Wohnbevölkerung in Italien",
      "Banca Mondiale": "Weltbank", "Banca Centrale Europea": "Europäische Zentralbank", BCE: "EZB",
    },
  },
  pt: {
    title: "Avaliação técnica indicativa (automática)",
    summary: (s, o) => `Esta análise exploratória abrange ${s} séries e ${o} observações no total.`,
    trend: (n, d, f, l, c) => `${n}: tendência ${d} de ${f} a ${l} (${c} observações)`,
    rising: "crescente", falling: "decrescente", stable: "aproximadamente estável", unknown: "não estimável",
    change: v => `variação total ${v}%`, noChange: "não foi possível calcular a variação total",
    validation: (p, mae, u, mape) => `teste histórico em ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "não há pontos disponíveis para o teste histórico", points: n => `${n} ${n === 1 ? "ponto" : "pontos"}`,
    projection: n => `Foram geradas projeções lineares para ${n} séries. São cenários exploratórios sem intervalos de confiança, não previsões certificadas.`,
    strongest: (a, b, r, n, i) => `A associação mais forte entre as séries é ${a} / ${b} (r=${r}, ${n} datas coincidentes); ${i}`,
    factor: (t, n, r) => `O modelo fatorial para o alvo ${t} usa ${n} observações${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Avisos identificados: ${w}`,
    disclaimer: "Resumo automatizado baseado nos resultados apresentados; não é um parecer assinado nem uma certificação. As projeções não garantem resultados futuros e as correlações não demonstram causalidade.",
    positive: "associação positiva", negative: "associação negativa", weak: "associação fraca", moderate: "associação moderada", strong: "associação forte",
    causal: "não estabelece causalidade",
    shock: "A extrapolação linear é sensível a choques.",
    fullShock: "A extrapolação linear é sensível a choques, sazonalidade e mudanças de regime.",
    commonDates: "Associação observada em datas coincidentes; não implica causalidade.",
    factorWarning: "Os coeficientes de associação dependem dos outros fatores selecionados; não provam causalidade e podem ser instáveis com poucos dados ou variáveis colineares.",
    localDisclaimer: "Avaliação estatística local em Python, não um agente LLM. As correlações não estabelecem causalidade; as projeções lineares não são previsões certificadas.",
    people: "pessoas", units: "unidades",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Despesas militares (% PIB; WDI/SIPRI)", "PIL (USD correnti)": "PIB (USD correntes)",
      "Popolazione totale": "População total", "Temperatura media giornaliera": "Temperatura média diária",
      "Cambio di riferimento USD per EUR": "Taxa de referência USD/EUR", "Popolazione residente in Italia": "População residente em Itália",
      "Banca Mondiale": "Banco Mundial", "Banca Centrale Europea": "Banco Central Europeu", BCE: "BCE",
    },
  },
  ru: {
    title: "Автоматическая техническая оценка",
    summary: (s, o) => `Этот исследовательский анализ охватывает рядов: ${s}; всего наблюдений: ${o}.`,
    trend: (n, d, f, l, c) => `${n}: ${d} тенденция с ${f} по ${l} (наблюдений: ${c})`,
    rising: "восходящая", falling: "нисходящая", stable: "примерно стабильная", unknown: "не поддающаяся оценке",
    change: v => `общее изменение ${v}%`, noChange: "общее изменение вычислить не удалось",
    validation: (p, mae, u, mape) => `историческая проверка (${p}): MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "нет точек для исторической проверки", points: n => `${n} ${n === 1 ? "точка" : "точек"}`,
    projection: n => `Построены линейные проекции для рядов: ${n}. Это исследовательские сценарии без доверительных интервалов, а не сертифицированные прогнозы.`,
    strongest: (a, b, r, n, i) => `Самая сильная связь между рядами: ${a} / ${b} (r=${r}, общих дат: ${n}); ${i}`,
    factor: (t, n, r) => `Факторная модель для целевого показателя «${t}» использует наблюдений: ${n}${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Обнаружены предупреждения: ${w}`,
    disclaimer: "Автоматическое резюме по показанным результатам; это не подписанное экспертное заключение и не сертификация. Проекции не гарантируют будущие результаты, а корреляции не доказывают причинно-следственную связь.",
    positive: "положительная связь", negative: "отрицательная связь", weak: "слабая связь", moderate: "умеренная связь", strong: "сильная связь",
    causal: "не доказывает причинно-следственную связь",
    shock: "Линейная экстраполяция чувствительна к резким изменениям.",
    fullShock: "Линейная экстраполяция чувствительна к резким изменениям, сезонности и смене режима.",
    commonDates: "Связь, наблюдаемая на совпадающих датах; причинность не подразумевается.",
    factorWarning: "Коэффициенты связи зависят от других выбранных факторов; они не доказывают причинность и могут быть нестабильными при малом объёме данных или коллинеарных переменных.",
    localDisclaimer: "Локальная статистическая оценка в Python, не LLM-агент. Корреляции не доказывают причинность; линейные проекции не являются сертифицированными прогнозами.",
    people: "человек", units: "единиц",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Военные расходы (% ВВП; WDI/SIPRI)", "PIL (USD correnti)": "ВВП (в текущих долларах США)",
      "Popolazione totale": "Общая численность населения", "Temperatura media giornaliera": "Среднесуточная температура",
      "Cambio di riferimento USD per EUR": "Справочный курс USD к EUR", "Popolazione residente in Italia": "Постоянное население Италии",
      "Banca Mondiale": "Всемирный банк", "Banca Centrale Europea": "Европейский центральный банк", BCE: "ЕЦБ",
    },
  },
  pl: {
    title: "Automatyczna orientacyjna ocena techniczna",
    summary: (s, o) => `Analiza eksploracyjna obejmuje ${s} szeregów i łącznie ${o} obserwacji.`,
    trend: (n, d, f, l, c) => `${n}: trend ${d} od ${f} do ${l} (${c} obserwacji)`,
    rising: "rosnący", falling: "malejący", stable: "w przybliżeniu stabilny", unknown: "niemożliwy do oszacowania",
    change: v => `zmiana całkowita ${v}%`, noChange: "nie można obliczyć zmiany całkowitej",
    validation: (p, mae, u, mape) => `test historyczny dla ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "brak punktów do testu historycznego", points: n => `${n} ${n === 1 ? "punkt" : "punktów"}`,
    projection: n => `Utworzono projekcje liniowe dla ${n} szeregów. To scenariusze eksploracyjne bez przedziałów ufności, a nie certyfikowane prognozy.`,
    strongest: (a, b, r, n, i) => `Najsilniejszy związek między szeregami: ${a} / ${b} (r=${r}, wspólne daty: ${n}); ${i}`,
    factor: (t, n, r) => `Model czynnikowy dla celu ${t} wykorzystuje ${n} obserwacji${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Wykryte ostrzeżenia: ${w}`,
    disclaimer: "Automatyczne podsumowanie na podstawie wyświetlonych wyników; nie jest podpisaną opinią eksperta ani certyfikacją. Projekcje nie gwarantują przyszłych wyników, a korelacje nie dowodzą związku przyczynowego.",
    positive: "dodatni związek", negative: "ujemny związek", weak: "słaby związek", moderate: "umiarkowany związek", strong: "silny związek",
    causal: "nie dowodzi związku przyczynowego",
    shock: "Ekstrapolacja liniowa jest wrażliwa na nagłe zmiany.",
    fullShock: "Ekstrapolacja liniowa jest wrażliwa na nagłe zmiany, sezonowość i zmiany reżimu.",
    commonDates: "Związek zaobserwowany dla wspólnych dat; nie oznacza przyczynowości.",
    factorWarning: "Współczynniki zależą od pozostałych wybranych czynników; nie dowodzą przyczynowości i mogą być niestabilne przy małej liczbie danych lub współliniowych zmiennych.",
    localDisclaimer: "Lokalna ocena statystyczna w Pythonie, nie agent LLM. Korelacje nie dowodzą przyczynowości; projekcje liniowe nie są certyfikowanymi prognozami.",
    people: "osoby", units: "jednostki",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Wydatki wojskowe (% PKB; WDI/SIPRI)", "PIL (USD correnti)": "PKB (bieżące USD)",
      "Popolazione totale": "Całkowita liczba ludności", "Temperatura media giornaliera": "Średnia temperatura dobowa",
      "Cambio di riferimento USD per EUR": "Referencyjny kurs USD/EUR", "Popolazione residente in Italia": "Ludność rezydująca we Włoszech",
      "Banca Mondiale": "Bank Światowy", "Banca Centrale Europea": "Europejski Bank Centralny", BCE: "EBC",
    },
  },
  nl: {
    title: "Geautomatiseerde technische beoordeling",
    summary: (s, o) => `Deze verkennende analyse omvat ${s} reeksen en in totaal ${o} waarnemingen.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trend van ${f} tot ${l} (${c} waarnemingen)`,
    rising: "stijgende", falling: "dalende", stable: "ongeveer stabiele", unknown: "niet te schatten",
    change: v => `totale verandering ${v}%`, noChange: "totale verandering kon niet worden berekend",
    validation: (p, mae, u, mape) => `historische test op ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "geen punten beschikbaar voor historische tests", points: n => `${n} ${n === 1 ? "punt" : "punten"}`,
    projection: n => `Er zijn lineaire projecties gemaakt voor ${n} reeksen. Dit zijn verkennende scenario's zonder betrouwbaarheidsintervallen, geen gecertificeerde prognoses.`,
    strongest: (a, b, r, n, i) => `De sterkste samenhang tussen reeksen is ${a} / ${b} (r=${r}, ${n} overlappende datums); ${i}`,
    factor: (t, n, r) => `Het factormodel voor doel ${t} gebruikt ${n} waarnemingen${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Geconstateerde waarschuwingen: ${w}`,
    disclaimer: "Automatische samenvatting van de getoonde resultaten; geen ondertekend deskundigenoordeel of certificering. Projecties garanderen geen toekomstige uitkomsten en correlaties tonen geen causaliteit aan.",
    positive: "positieve samenhang", negative: "negatieve samenhang", weak: "zwakke samenhang", moderate: "matige samenhang", strong: "sterke samenhang",
    causal: "toont geen causaliteit aan",
    shock: "Lineaire extrapolatie is gevoelig voor schokken.",
    fullShock: "Lineaire extrapolatie is gevoelig voor schokken, seizoensinvloeden en regimewisselingen.",
    commonDates: "Samenhang waargenomen op overlappende datums; impliceert geen causaliteit.",
    factorWarning: "Associatiecoëfficiënten zijn afhankelijk van de overige geselecteerde factoren; ze bewijzen geen causaliteit en kunnen instabiel zijn bij weinig gegevens of collineaire variabelen.",
    localDisclaimer: "Lokale statistische beoordeling in Python, geen LLM-agent. Correlaties tonen geen causaliteit aan; lineaire projecties zijn geen gecertificeerde prognoses.",
    people: "personen", units: "eenheden",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Militaire uitgaven (% bbp; WDI/SIPRI)", "PIL (USD correnti)": "bbp (huidige USD)",
      "Popolazione totale": "Totale bevolking", "Temperatura media giornaliera": "Gemiddelde dagtemperatuur",
      "Cambio di riferimento USD per EUR": "Referentiewisselkoers USD/EUR", "Popolazione residente in Italia": "Inwoners van Italië",
      "Banca Mondiale": "Wereldbank", "Banca Centrale Europea": "Europese Centrale Bank", BCE: "ECB",
    },
  },
  tr: {
    title: "Otomatik teknik değerlendirme",
    summary: (s, o) => `Bu keşif amaçlı analiz toplam ${s} seriyi ve ${o} gözlemi kapsar.`,
    trend: (n, d, f, l, c) => `${n}: ${f}–${l} arasında ${d} eğilim (${c} gözlem)`,
    rising: "yükselen", falling: "düşen", stable: "yaklaşık durağan", unknown: "tahmin edilemez",
    change: v => `toplam değişim ${v}%`, noChange: "toplam değişim hesaplanamadı",
    validation: (p, mae, u, mape) => `${p} nokta üzerinde geçmiş testi: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "geçmiş testi için kullanılabilir nokta yok", points: n => `${n} nokta`,
    projection: n => `${n} seri için doğrusal projeksiyon üretildi. Bunlar güven aralığı olmayan keşif senaryolarıdır; onaylı tahmin değildir.`,
    strongest: (a, b, r, n, i) => `Seriler arasındaki en güçlü ilişki ${a} / ${b} arasındadır (r=${r}, ortak tarih: ${n}); ${i}`,
    factor: (t, n, r) => `${t} hedefi için faktör modeli ${n} gözlem kullanır${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Belirlenen uyarılar: ${w}`,
    disclaimer: "Gösterilen sonuçlara dayalı otomatik özet; imzalı uzman görüşü veya sertifika değildir. Projeksiyonlar gelecekteki sonuçları garanti etmez ve korelasyonlar nedenselliği kanıtlamaz.",
    positive: "pozitif ilişki", negative: "negatif ilişki", weak: "zayıf ilişki", moderate: "orta düzey ilişki", strong: "güçlü ilişki",
    causal: "nedenselliği kanıtlamaz",
    shock: "Doğrusal ekstrapolasyon ani değişimlere duyarlıdır.",
    fullShock: "Doğrusal ekstrapolasyon ani değişimlere, mevsimselliğe ve rejim değişikliklerine duyarlıdır.",
    commonDates: "Ortak tarihlerde gözlenen ilişki; nedensellik anlamına gelmez.",
    factorWarning: "İlişki katsayıları seçilen diğer faktörlere bağlıdır; nedenselliği kanıtlamaz ve az veri ya da eşdoğrusal değişkenlerde kararsız olabilir.",
    localDisclaimer: "Python'da yerel istatistiksel değerlendirme; LLM aracısı değildir. Korelasyonlar nedenselliği kanıtlamaz; doğrusal projeksiyonlar onaylı tahmin değildir.",
    people: "kişi", units: "birim",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Askerî harcamalar (% GSYH; WDI/SIPRI)", "PIL (USD correnti)": "GSYH (cari USD)",
      "Popolazione totale": "Toplam nüfus", "Temperatura media giornaliera": "Günlük ortalama sıcaklık",
      "Cambio di riferimento USD per EUR": "USD/EUR referans kuru", "Popolazione residente in Italia": "İtalya'da ikamet eden nüfus",
      "Banca Mondiale": "Dünya Bankası", "Banca Centrale Europea": "Avrupa Merkez Bankası", BCE: "ECB",
    },
  },
  sv: {
    title: "Automatisk teknisk bedömning",
    summary: (s, o) => `Den här explorativa analysen omfattar ${s} serier och totalt ${o} observationer.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trend från ${f} till ${l} (${c} observationer)`,
    rising: "stigande", falling: "fallande", stable: "ungefär stabil", unknown: "kan inte uppskattas",
    change: v => `total förändring ${v}%`, noChange: "total förändring kunde inte beräknas",
    validation: (p, mae, u, mape) => `historiskt test på ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "inga punkter tillgängliga för historiskt test", points: n => `${n} ${n === 1 ? "punkt" : "punkter"}`,
    projection: n => `Linjär projektion har skapats för ${n} serier. Det är explorativa scenarier utan konfidensintervall, inte certifierade prognoser.`,
    strongest: (a, b, r, n, i) => `Det starkaste sambandet mellan serierna är ${a} / ${b} (r=${r}, ${n} gemensamma datum); ${i}`,
    factor: (t, n, r) => `Faktormodellen för målet ${t} använder ${n} observationer${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Identifierade varningar: ${w}`,
    disclaimer: "Automatisk sammanfattning av resultaten; inte ett undertecknat expertutlåtande eller en certifiering. Projektioner garanterar inte framtida utfall och korrelationer visar inte orsakssamband.",
    positive: "positivt samband", negative: "negativt samband", weak: "svagt samband", moderate: "måttligt samband", strong: "starkt samband",
    causal: "visar inte orsakssamband",
    shock: "Linjär extrapolering är känslig för chocker.",
    fullShock: "Linjär extrapolering är känslig för chocker, säsongsvariationer och regimskiften.",
    commonDates: "Samband observerat vid gemensamma datum; innebär inte orsakssamband.",
    factorWarning: "Sambandskoefficienter beror på övriga valda faktorer; de bevisar inte orsakssamband och kan vara instabila vid få data eller kollineära variabler.",
    localDisclaimer: "Lokal statistisk bedömning i Python, inte en LLM-agent. Korrelationer visar inte orsakssamband; linjära projektioner är inte certifierade prognoser.",
    people: "personer", units: "enheter",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Militärutgifter (% av BNP; WDI/SIPRI)", "PIL (USD correnti)": "BNP (löpande USD)",
      "Popolazione totale": "Total befolkning", "Temperatura media giornaliera": "Dygnsmedeltemperatur",
      "Cambio di riferimento USD per EUR": "Referenskurs USD/EUR", "Popolazione residente in Italia": "Folkbokförd befolkning i Italien",
      "Banca Mondiale": "Världsbanken", "Banca Centrale Europea": "Europeiska centralbanken", BCE: "ECB",
    },
  },
  da: {
    title: "Automatisk teknisk vurdering",
    summary: (s, o) => `Denne eksplorative analyse omfatter ${s} serier og i alt ${o} observationer.`,
    trend: (n, d, f, l, c) => `${n}: ${d} tendens fra ${f} til ${l} (${c} observationer)`,
    rising: "stigende", falling: "faldende", stable: "nogenlunde stabil", unknown: "kan ikke estimeres",
    change: v => `samlet ændring ${v}%`, noChange: "samlet ændring kunne ikke beregnes",
    validation: (p, mae, u, mape) => `historisk test på ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "ingen punkter tilgængelige til historisk test", points: n => `${n} ${n === 1 ? "punkt" : "punkter"}`,
    projection: n => `Der blev oprettet lineære projektioner for ${n} serier. Det er eksplorative scenarier uden konfidensintervaller, ikke certificerede prognoser.`,
    strongest: (a, b, r, n, i) => `Den stærkeste sammenhæng mellem serierne er ${a} / ${b} (r=${r}, ${n} fælles datoer); ${i}`,
    factor: (t, n, r) => `Faktormodellen for målet ${t} bruger ${n} observationer${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Registrerede advarsler: ${w}`,
    disclaimer: "Automatisk opsummering af de viste resultater; ikke en underskrevet ekspertvurdering eller certificering. Projektioner garanterer ikke fremtidige resultater, og korrelationer beviser ikke årsagssammenhæng.",
    positive: "positiv sammenhæng", negative: "negativ sammenhæng", weak: "svag sammenhæng", moderate: "moderat sammenhæng", strong: "stærk sammenhæng",
    causal: "beviser ikke årsagssammenhæng",
    shock: "Lineær ekstrapolation er følsom over for chok.",
    fullShock: "Lineær ekstrapolation er følsom over for chok, sæsonudsving og regimeskift.",
    commonDates: "Sammenhæng observeret på fælles datoer; indebærer ikke årsagssammenhæng.",
    factorWarning: "Sammenhængskoefficienter afhænger af de øvrige valgte faktorer; de beviser ikke årsagssammenhæng og kan være ustabile ved få data eller kollineære variabler.",
    localDisclaimer: "Lokal statistisk vurdering i Python, ikke en LLM-agent. Korrelationer beviser ikke årsagssammenhæng; lineære projektioner er ikke certificerede prognoser.",
    people: "personer", units: "enheder",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Militærudgifter (% af BNP; WDI/SIPRI)", "PIL (USD correnti)": "BNP (løbende USD)",
      "Popolazione totale": "Samlet befolkning", "Temperatura media giornaliera": "Daglig middeltemperatur",
      "Cambio di riferimento USD per EUR": "Referencekurs USD/EUR", "Popolazione residente in Italia": "Bosiddende befolkning i Italien",
      "Banca Mondiale": "Verdensbanken", "Banca Centrale Europea": "Den Europæiske Centralbank", BCE: "ECB",
    },
  },
  no: {
    title: "Automatisk teknisk vurdering",
    summary: (s, o) => `Denne utforskende analysen omfatter ${s} serier og totalt ${o} observasjoner.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trend fra ${f} til ${l} (${c} observasjoner)`,
    rising: "stigende", falling: "fallende", stable: "omtrent stabil", unknown: "kan ikke anslås",
    change: v => `samlet endring ${v}%`, noChange: "samlet endring kunne ikke beregnes",
    validation: (p, mae, u, mape) => `historisk test på ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "ingen punkter tilgjengelig for historisk testing", points: n => `${n} ${n === 1 ? "punkt" : "punkter"}`,
    projection: n => `Lineære projeksjoner ble laget for ${n} serier. Dette er utforskende scenarioer uten konfidensintervaller, ikke sertifiserte prognoser.`,
    strongest: (a, b, r, n, i) => `Den sterkeste sammenhengen mellom seriene er ${a} / ${b} (r=${r}, ${n} felles datoer); ${i}`,
    factor: (t, n, r) => `Faktormodellen for målet ${t} bruker ${n} observasjoner${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Registrerte advarsler: ${w}`,
    disclaimer: "Automatisk sammendrag av de viste resultatene; ikke en signert ekspertuttalelse eller sertifisering. Projeksjoner garanterer ikke fremtidige resultater, og korrelasjoner viser ikke årsakssammenheng.",
    positive: "positiv sammenheng", negative: "negativ sammenheng", weak: "svak sammenheng", moderate: "moderat sammenheng", strong: "sterk sammenheng",
    causal: "viser ikke årsakssammenheng",
    shock: "Lineær ekstrapolering er følsom for sjokk.",
    fullShock: "Lineær ekstrapolering er følsom for sjokk, sesongvariasjoner og regimeskifter.",
    commonDates: "Sammenheng observert på felles datoer; innebærer ikke årsakssammenheng.",
    factorWarning: "Sammenhengskoeffisientene avhenger av de andre valgte faktorene; de beviser ikke årsakssammenheng og kan være ustabile ved få data eller kollineære variabler.",
    localDisclaimer: "Lokal statistisk vurdering i Python, ikke en LLM-agent. Korrelasjoner viser ikke årsakssammenheng; lineære projeksjoner er ikke sertifiserte prognoser.",
    people: "personer", units: "enheter",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Militærutgifter (% av BNP; WDI/SIPRI)", "PIL (USD correnti)": "BNP (løpende USD)",
      "Popolazione totale": "Total befolkning", "Temperatura media giornaliera": "Daglig gjennomsnittstemperatur",
      "Cambio di riferimento USD per EUR": "Referansekurs USD/EUR", "Popolazione residente in Italia": "Bosatt befolkning i Italia",
      "Banca Mondiale": "Verdensbanken", "Banca Centrale Europea": "Den europeiske sentralbanken", BCE: "ECB",
    },
  },
  fi: {
    title: "Automaattinen tekninen arvio",
    summary: (s, o) => `Tämä tutkiva analyysi kattaa ${s} aikasarjaa ja yhteensä ${o} havaintoa.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trendi ${f}–${l} (${c} havaintoa)`,
    rising: "nouseva", falling: "laskeva", stable: "suunnilleen vakaa", unknown: "ei arvioitavissa",
    change: v => `kokonaismuutos ${v}%`, noChange: "kokonaismuutosta ei voitu laskea",
    validation: (p, mae, u, mape) => `historiallinen testi (${p}): MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "historialliseen testiin ei ole pisteitä", points: n => `${n} pistettä`,
    projection: n => `Lineaariset projektiot luotiin ${n} aikasarjalle. Ne ovat tutkivia skenaarioita ilman luottamusvälejä, eivät sertifioituja ennusteita.`,
    strongest: (a, b, r, n, i) => `Vahvin yhteys aikasarjojen välillä on ${a} / ${b} (r=${r}, yhteisiä päivämääriä ${n}); ${i}`,
    factor: (t, n, r) => `Kohteen ${t} faktorimalli käyttää ${n} havaintoa${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Havaitut varoitukset: ${w}`,
    disclaimer: "Näytettyihin tuloksiin perustuva automaattinen yhteenveto; ei allekirjoitettu asiantuntijalausunto tai sertifiointi. Projektiot eivät takaa tulevia tuloksia, eivätkä korrelaatiot osoita syy-seuraussuhdetta.",
    positive: "positiivinen yhteys", negative: "negatiivinen yhteys", weak: "heikko yhteys", moderate: "kohtalainen yhteys", strong: "vahva yhteys",
    causal: "ei osoita syy-seuraussuhdetta",
    shock: "Lineaarinen ekstrapolointi on herkkä äkillisille muutoksille.",
    fullShock: "Lineaarinen ekstrapolointi on herkkä äkillisille muutoksille, kausivaihtelulle ja toimintatavan muutoksille.",
    commonDates: "Yhteisillä päivämäärillä havaittu yhteys; ei tarkoita syy-seuraussuhdetta.",
    factorWarning: "Yhteyskertoimet riippuvat muista valituista tekijöistä; ne eivät osoita syy-seuraussuhdetta ja voivat olla epävakaita vähäisellä aineistolla tai kollineaarisilla muuttujilla.",
    localDisclaimer: "Paikallinen tilastollinen arvio Pythonilla, ei LLM-agentti. Korrelaatiot eivät osoita syy-seuraussuhdetta; lineaariset projektiot eivät ole sertifioituja ennusteita.",
    people: "henkilöä", units: "yksikköä",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Sotilasmenot (% BKT:sta; WDI/SIPRI)", "PIL (USD correnti)": "BKT (käypinä Yhdysvaltain dollareina)",
      "Popolazione totale": "Kokonaisväestö", "Temperatura media giornaliera": "Päivän keskilämpötila",
      "Cambio di riferimento USD per EUR": "USD/EUR-viitekurssi", "Popolazione residente in Italia": "Italian vakituinen väestö",
      "Banca Mondiale": "Maailmanpankki", "Banca Centrale Europea": "Euroopan keskuspankki", BCE: "EKP",
    },
  },
  uk: {
    title: "Автоматична орієнтовна технічна оцінка",
    summary: (s, o) => `Цей дослідницький аналіз охоплює рядів: ${s}; загалом спостережень: ${o}.`,
    trend: (n, d, f, l, c) => `${n}: ${d} тенденція з ${f} до ${l} (спостережень: ${c})`,
    rising: "висхідна", falling: "низхідна", stable: "приблизно стабільна", unknown: "не піддається оцінюванню",
    change: v => `загальна зміна ${v}%`, noChange: "не вдалося обчислити загальну зміну",
    validation: (p, mae, u, mape) => `історична перевірка (${p}): MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "немає точок для історичної перевірки", points: n => `${n} ${n === 1 ? "точка" : "точок"}`,
    projection: n => `Створено лінійні проєкції для рядів: ${n}. Це дослідницькі сценарії без довірчих інтервалів, а не сертифіковані прогнози.`,
    strongest: (a, b, r, n, i) => `Найсильніший зв'язок між рядами: ${a} / ${b} (r=${r}, спільних дат: ${n}); ${i}`,
    factor: (t, n, r) => `Факторна модель цільового показника «${t}» використовує спостережень: ${n}${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Виявлені попередження: ${w}`,
    disclaimer: "Автоматичний підсумок за показаними результатами; це не підписаний експертний висновок і не сертифікація. Проєкції не гарантують майбутніх результатів, а кореляції не доводять причинно-наслідкового зв'язку.",
    positive: "позитивний зв'язок", negative: "негативний зв'язок", weak: "слабкий зв'язок", moderate: "помірний зв'язок", strong: "сильний зв'язок",
    causal: "не доводить причинно-наслідкового зв'язку",
    shock: "Лінійна екстраполяція чутлива до різких змін.",
    fullShock: "Лінійна екстраполяція чутлива до різких змін, сезонності та зміни режиму.",
    commonDates: "Зв'язок, спостережений на спільних датах; причинність не мається на увазі.",
    factorWarning: "Коефіцієнти зв'язку залежать від інших вибраних чинників; вони не доводять причинності й можуть бути нестабільними за малої кількості даних або колінеарних змінних.",
    localDisclaimer: "Локальна статистична оцінка в Python, не LLM-агент. Кореляції не доводять причинності; лінійні проєкції не є сертифікованими прогнозами.",
    people: "осіб", units: "одиниць",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Військові витрати (% ВВП; WDI/SIPRI)", "PIL (USD correnti)": "ВВП (у поточних доларах США)",
      "Popolazione totale": "Загальна чисельність населення", "Temperatura media giornaliera": "Середньодобова температура",
      "Cambio di riferimento USD per EUR": "Довідковий курс USD до EUR", "Popolazione residente in Italia": "Постійне населення Італії",
      "Banca Mondiale": "Світовий банк", "Banca Centrale Europea": "Європейський центральний банк", BCE: "ЄЦБ",
    },
  },
  cs: {
    title: "Automatické orientační technické hodnocení",
    summary: (s, o) => `Tato průzkumná analýza zahrnuje ${s} časových řad a celkem ${o} pozorování.`,
    trend: (n, d, f, l, c) => `${n}: ${d} trend od ${f} do ${l} (${c} pozorování)`,
    rising: "rostoucí", falling: "klesající", stable: "přibližně stabilní", unknown: "nelze odhadnout",
    change: v => `celková změna ${v}%`, noChange: "celkovou změnu nelze vypočítat",
    validation: (p, mae, u, mape) => `historický test pro ${p}: MAE ${mae}${u ? ` ${u}` : ""}${mape ? `, MAPE ${mape}%` : ""}`,
    noValidation: "pro historický test nejsou k dispozici žádné body", points: n => `${n} ${n === 1 ? "bod" : "bodů"}`,
    projection: n => `Lineární projekce byly vytvořeny pro ${n} řad. Jde o průzkumné scénáře bez intervalů spolehlivosti, nikoli o certifikované předpovědi.`,
    strongest: (a, b, r, n, i) => `Nejsilnější vztah mezi řadami je ${a} / ${b} (r=${r}, společných dat: ${n}); ${i}`,
    factor: (t, n, r) => `Faktorový model cíle ${t} používá ${n} pozorování${r ? ` (R² ${r})` : ""}.`,
    warnings: w => `Zjištěná upozornění: ${w}`,
    disclaimer: "Automatické shrnutí zobrazených výsledků; nejde o podepsaný odborný posudek ani certifikaci. Projekce nezaručují budoucí výsledky a korelace neprokazují příčinnou souvislost.",
    positive: "kladný vztah", negative: "záporný vztah", weak: "slabý vztah", moderate: "středně silný vztah", strong: "silný vztah",
    causal: "neprokazuje příčinnou souvislost",
    shock: "Lineární extrapolace je citlivá na šoky.",
    fullShock: "Lineární extrapolace je citlivá na šoky, sezónnost a změny režimu.",
    commonDates: "Vztah zjištěný ve společných datech; neznamená příčinnou souvislost.",
    factorWarning: "Koeficienty vztahu závisí na ostatních vybraných faktorech; neprokazují příčinnou souvislost a při malém množství dat nebo kolineárních proměnných mohou být nestabilní.",
    localDisclaimer: "Lokální statistické hodnocení v Pythonu, nikoli agent LLM. Korelace neprokazují příčinnou souvislost; lineární projekce nejsou certifikované předpovědi.",
    people: "osoby", units: "jednotky",
    seriesLabels: {
      "Spesa militare (% PIL; WDI/SIPRI)": "Vojenské výdaje (% HDP; WDI/SIPRI)", "PIL (USD correnti)": "HDP (běžné USD)",
      "Popolazione totale": "Celkový počet obyvatel", "Temperatura media giornaliera": "Průměrná denní teplota",
      "Cambio di riferimento USD per EUR": "Referenční kurz USD/EUR", "Popolazione residente in Italia": "Počet obyvatel Itálie",
      "Banca Mondiale": "Světová banka", "Banca Centrale Europea": "Evropská centrální banka", BCE: "ECB",
    },
  },
};

function getCopy(language: AnalyticsReportLanguage): LanguageCopy {
  return copies[language] ?? copies.en!;
}

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function localizeStatisticalText(value: string, language: AnalyticsReportLanguage) {
  const copy = getCopy(language);
  const normalized = normalizeText(value);
  const exact: Array<[string, string]> = [
    ["Estrapolazione lineare sensibile a shock, stagionalità e cambi di regime.", copy.fullShock],
    ["Estrapolazione lineare sensibile a shock.", copy.shock],
    ["Associazione osservata sulle date comuni; non implica causalità.", copy.commonDates],
    ["Coefficienti associativi condizionati agli altri fattori selezionati; non dimostrano causalità e possono essere instabili con pochi dati o variabili collineari.", copy.factorWarning],
    ["Valutazione statistica locale in Python, non un agente LLM. Le correlazioni non dimostrano causalità; le proiezioni lineari non sono previsioni certificate.", copy.localDisclaimer],
    ["Le correlazioni non dimostrano causalità.", `${correlationDisclaimer(language)}.`],
  ];
  const match = exact.find(([source]) => normalizeText(source) === normalized);
  if (match) return match[1];
  const associations: Array<[string, string]> = [
    ["associazione positiva", copy.positive], ["associazione negativa", copy.negative],
    ["associazione debole", copy.weak], ["associazione moderata", copy.moderate], ["associazione forte", copy.strong],
  ];
  const phrase = associations.find(([source]) => normalized.includes(source));
  if (phrase) return value.replace(new RegExp(phrase[0], "i"), phrase[1]);
  const correlationPrefix = "Le correlazioni non dimostrano causalità";
  if (normalizeText(value).startsWith(normalizeText(correlationPrefix))) {
    return value.replace(new RegExp(correlationPrefix, "i"), correlationDisclaimer(language));
  }
  return value;
}

function correlationDisclaimer(language: AnalyticsReportLanguage) {
  const translations: Record<AnalyticsReportLanguage, string> = {
    it: "Le correlazioni non dimostrano causalità",
    en: "Correlations do not establish causality",
    es: "Las correlaciones no demuestran causalidad",
    fr: "Les corrélations ne prouvent pas de causalité",
    de: "Korrelationen belegen keine Kausalität",
    pt: "As correlações não demonstram causalidade",
    ru: "Корреляции не доказывают причинно-следственную связь",
    pl: "Korelacje nie dowodzą związku przyczynowego",
    nl: "Correlaties tonen geen causaliteit aan",
    tr: "Korelasyonlar nedenselliği kanıtlamaz",
    sv: "Korrelationer visar inte orsakssamband",
    da: "Korrelationer beviser ikke årsagssammenhæng",
    no: "Korrelasjoner viser ikke årsakssammenheng",
    fi: "Korrelaatiot eivät osoita syy-seuraussuhdetta",
    uk: "Кореляції не доводять причинно-наслідкового зв'язку",
    cs: "Korelace neprokazují příčinnou souvislost",
  };
  return translations[language];
}

export function localizeStatisticalCorrelationInterpretation(value: string, language: AnalyticsReportLanguage) {
  const copy = getCopy(language);
  const normalized = normalizeText(value);
  if (normalized === normalizeText("Associazione osservata sulle date comuni; non implica causalità.")) {
    return copy.commonDates;
  }
  const localized = localizeStatisticalText(value, language);
  if (language === "it") return `${localized}; non dimostra causalità.`;
  return `${localized}; ${copy.causal}.`;
}

export function localizeStatisticalSeriesLabel(value: string, language: AnalyticsReportLanguage) {
  const extraLabels: Partial<
    Record<AnalyticsReportLanguage, Record<string, string>>
  > = {
    en: {
      "Fondo Monetario Internazionale": "International Monetary Fund",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · climate and oceans",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · Earth observation",
      "NATO · spesa per la difesa": "NATO · defence spending",
      "ONU · Registro delle armi convenzionali": "UN · Register of Conventional Arms",
      "Portale dati dell'Unione europea": "European Union data portal",
    },
    es: {
      "Fondo Monetario Internazionale": "Fondo Monetario Internacional",
      "OCSE · OECD Data Explorer": "OCDE · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · clima y océanos",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · observación de la Tierra",
      "NATO · spesa per la difesa": "OTAN · gasto en defensa",
      "ONU · Registro delle armi convenzionali": "ONU · Registro de Armas Convencionales",
      "Portale dati dell'Unione europea": "Portal de datos de la Unión Europea",
    },
    fr: {
      "Fondo Monetario Internazionale": "Fonds monétaire international",
      "OCSE · OECD Data Explorer": "OCDE · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · climat et océans",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · observation de la Terre",
      "NATO · spesa per la difesa": "OTAN · dépenses de défense",
      "ONU · Registro delle armi convenzionali": "ONU · Registre des armes classiques",
      "Portale dati dell'Unione europea": "Portail de données de l’Union européenne",
    },
    de: {
      "Fondo Monetario Internazionale": "Internationaler Währungsfonds",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · Klima und Ozeane",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · Erdbeobachtung",
      "NATO · spesa per la difesa": "NATO · Verteidigungsausgaben",
      "ONU · Registro delle armi convenzionali": "UN · Register für konventionelle Waffen",
      "Portale dati dell'Unione europea": "Datenportal der Europäischen Union",
    },
    pt: {
      "Fondo Monetario Internazionale": "Fundo Monetário Internacional",
      "OCSE · OECD Data Explorer": "OCDE · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · clima e oceanos",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · observação da Terra",
      "NATO · spesa per la difesa": "OTAN · despesas de defesa",
      "ONU · Registro delle armi convenzionali": "ONU · Registo de Armas Convencionais",
      "Portale dati dell'Unione europea": "Portal de dados da União Europeia",
    },
    ru: {
      "Fondo Monetario Internazionale": "Международный валютный фонд",
      "OCSE · OECD Data Explorer": "ОЭСР · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · климат и океаны",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · наблюдение за Землёй",
      "NATO · spesa per la difesa": "НАТО · расходы на оборону",
      "ONU · Registro delle armi convenzionali": "ООН · Регистр обычных вооружений",
      "Portale dati dell'Unione europea": "Портал данных Европейского союза",
    },
    pl: {
      "Fondo Monetario Internazionale": "Międzynarodowy Fundusz Walutowy",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klimat i oceany",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · obserwacja Ziemi",
      "NATO · spesa per la difesa": "NATO · wydatki na obronność",
      "ONU · Registro delle armi convenzionali": "ONZ · Rejestr Broni Konwencjonalnej",
      "Portale dati dell'Unione europea": "Portal danych Unii Europejskiej",
    },
    nl: {
      "Fondo Monetario Internazionale": "Internationaal Monetair Fonds",
      "OCSE · OECD Data Explorer": "OESO · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klimaat en oceanen",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · aardobservatie",
      "NATO · spesa per la difesa": "NAVO · defensie-uitgaven",
      "ONU · Registro delle armi convenzionali": "VN · Register van Conventionele Wapens",
      "Portale dati dell'Unione europea": "Dataportaal van de Europese Unie",
    },
    tr: {
      "Fondo Monetario Internazionale": "Uluslararası Para Fonu",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · iklim ve okyanuslar",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · Dünya gözlemi",
      "NATO · spesa per la difesa": "NATO · savunma harcamaları",
      "ONU · Registro delle armi convenzionali": "BM · Konvansiyonel Silahlar Sicili",
      "Portale dati dell'Unione europea": "Avrupa Birliği veri portalı",
    },
    sv: {
      "Fondo Monetario Internazionale": "Internationella valutafonden",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klimat och hav",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · jordobservation",
      "NATO · spesa per la difesa": "NATO · försvarsutgifter",
      "ONU · Registro delle armi convenzionali": "FN · register över konventionella vapen",
      "Portale dati dell'Unione europea": "Europeiska unionens dataportal",
    },
    da: {
      "Fondo Monetario Internazionale": "Den Internationale Valutafond",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klima og oceaner",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · jordobservation",
      "NATO · spesa per la difesa": "NATO · forsvarsudgifter",
      "ONU · Registro delle armi convenzionali": "FN · register over konventionelle våben",
      "Portale dati dell'Unione europea": "Den Europæiske Unions dataportal",
    },
    no: {
      "Fondo Monetario Internazionale": "Det internasjonale valutafondet",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klima og hav",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · jordobservasjon",
      "NATO · spesa per la difesa": "NATO · forsvarsutgifter",
      "ONU · Registro delle armi convenzionali": "FN · registeret over konvensjonelle våpen",
      "Portale dati dell'Unione europea": "Den europeiske unionens dataportal",
    },
    fi: {
      "Fondo Monetario Internazionale": "Kansainvälinen valuuttarahasto",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · ilmasto ja valtameret",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · maanhavainnointi",
      "NATO · spesa per la difesa": "NATO · puolustusmenot",
      "ONU · Registro delle armi convenzionali": "YK · tavanomaisten aseiden rekisteri",
      "Portale dati dell'Unione europea": "Euroopan unionin tietoportaali",
    },
    uk: {
      "Fondo Monetario Internazionale": "Міжнародний валютний фонд",
      "OCSE · OECD Data Explorer": "ОЕСР · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · клімат і океани",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · спостереження за Землею",
      "NATO · spesa per la difesa": "НАТО · витрати на оборону",
      "ONU · Registro delle armi convenzionali": "ООН · Реєстр звичайних озброєнь",
      "Portale dati dell'Unione europea": "Портал даних Європейського Союзу",
    },
    cs: {
      "Fondo Monetario Internazionale": "Mezinárodní měnový fond",
      "OCSE · OECD Data Explorer": "OECD · OECD Data Explorer",
      "NOAA · clima e oceani": "NOAA · klima a oceány",
      "Copernicus Data Space · osservazione della Terra": "Copernicus Data Space · pozorování Země",
      "NATO · spesa per la difesa": "NATO · výdaje na obranu",
      "ONU · Registro delle armi convenzionali": "OSN · Registr konvenčních zbraní",
      "Portale dati dell'Unione europea": "Datový portál Evropské unie",
    },
  };
  const labels = {
    ...getCopy(language).seriesLabels,
    ...extraLabels[language],
  };
  const englishAliases: Record<string, string> = {
    "World Bank": labels["Banca Mondiale"] ?? "World Bank",
    "European Central Bank": labels["Banca Centrale Europea"] ?? "European Central Bank",
    ECB: labels.BCE ?? "ECB",
    "GDP (current USD)": labels["PIL (USD correnti)"] ?? "GDP (current USD)",
    "Total population": labels["Popolazione totale"] ?? "Total population",
    "Daily mean temperature":
      labels["Temperatura media giornaliera"] ?? "Daily mean temperature",
    "USD reference exchange rate":
      labels["Cambio di riferimento USD per EUR"] ??
      "USD reference exchange rate",
    "Resident population in Italy":
      labels["Popolazione residente in Italia"] ??
      "Resident population in Italy",
  };
  const allLabels = { ...labels, ...englishAliases };
  return Object.entries(labels).reduce((result, [source, target]) => {
    if (source === target) return result;
    return result.replaceAll(source, target);
  }, value).replace(/World Bank|European Central Bank|ECB|GDP \(current USD\)|Total population|Daily mean temperature|USD reference exchange rate|Resident population in Italy/g, match => allLabels[match] ?? match);
}

const gdpShareUnits: Record<AnalyticsReportLanguage, string> = {
  en: "% GDP",
  it: "% PIL",
  es: "% PIB",
  fr: "% PIB",
  de: "% BIP",
  pt: "% PIB",
  ru: "% ВВП",
  pl: "% PKB",
  nl: "% bbp",
  tr: "% GSYH",
  sv: "% av BNP",
  da: "% af BNP",
  no: "% av BNP",
  fi: "% BKT:sta",
  uk: "% ВВП",
  cs: "% HDP",
};
const gdpShareUnitAliases = new Set(
  [
    "% PIL",
    "% GDP",
    "% PIB",
    "% ВВП",
    "% PKB",
    "% bbp",
    "% GSYH",
    "% av BNP",
    "% af BNP",
    "% BKT:sta",
    "% HDP",
  ].map(normalizeText)
);

export function localizeStatisticalUnit(value: string, language: AnalyticsReportLanguage) {
  const normalized = normalizeText(value);
  if (normalized === normalizeText("persone")) return getCopy(language).people;
  if (normalized === normalizeText("unità")) return getCopy(language).units;
  if (gdpShareUnitAliases.has(normalized)) return gdpShareUnits[language];
  return value;
}

const officialSourceNames = new Set([
  "Banca Mondiale",
  "World Bank",
  "NASA POWER",
  "BCE",
  "ECB",
  "Banca Centrale Europea",
  "European Central Bank",
  "Eurostat",
]);

function localizeReportName(
  name: string,
  source: string,
  language: AnalyticsReportLanguage,
  officialSeriesNames?: ReadonlySet<string>
) {
  return (officialSeriesNames
    ? officialSeriesNames.has(name)
    : officialSourceNames.has(source))
    ? localizeStatisticalSeriesLabel(name, language)
    : name;
}

function formatNumber(value: number, language: AnalyticsReportLanguage) {
  const locales: Record<string, string> = {
    en: "en-US", it: "it-IT", es: "es-ES", fr: "fr-FR", de: "de-DE", pt: "pt-PT",
    ru: "ru-RU", pl: "pl-PL", nl: "nl-NL", tr: "tr-TR", sv: "sv-SE", da: "da-DK",
    no: "nb-NO", fi: "fi-FI", uk: "uk-UA", cs: "cs-CZ",
  };
  return value.toLocaleString(locales[language] ?? "en-US", { maximumFractionDigits: 2 });
}

export function localizeStatisticalDirection(direction: string, language: AnalyticsReportLanguage) {
  const copy = getCopy(language);
  const translations: Record<string, string> = {
    crescente: copy.rising, decrescente: copy.falling, "quasi stabile": copy.stable, "non stimabile": copy.unknown,
  };
  return translations[direction] ?? direction;
}

export function createStatisticalAssessment(
  analysis: StatisticalAnalysis,
  language: AnalyticsReportLanguage,
  officialSeriesNames?: ReadonlySet<string>
): AnalyticsReportConclusion {
  const copy = getCopy(language);
  const totalObservations = analysis.reports.reduce((total, report) => total + report.count, 0);
  const findings = analysis.reports.map(report => {
    const name = localizeReportName(
      report.name,
      report.source,
      language,
      officialSeriesNames
    );
    const isOfficial = officialSeriesNames
      ? officialSeriesNames.has(report.name)
      : officialSourceNames.has(report.source);
    const unit = isOfficial
      ? localizeStatisticalUnit(report.unit, language)
      : report.unit;
    const pointCount = report.validation.length;
    const change = report.changePercent === null ? copy.noChange : copy.change(formatNumber(report.changePercent, language));
    const validation = pointCount
      ? copy.validation(copy.points(pointCount), report.mae === null ? (language === "it" ? "n.d." : "—") : formatNumber(report.mae, language), unit, report.mape === null ? "" : formatNumber(report.mape, language))
      : copy.noValidation;
    return `${copy.trend(name, localizeStatisticalDirection(report.direction, language), report.firstDate, report.lastDate, formatNumber(report.count, language))}; ${change}; ${validation}.`;
  });
  const projected = analysis.reports.filter(report => report.forecast.length > 0);
  if (projected.length) findings.push(copy.projection(formatNumber(projected.length, language)));

  const strongest = analysis.correlations.reduce<(typeof analysis.correlations)[number] | null>(
    (best, item) => !best || Math.abs(item.r) > Math.abs(best.r) ? item : best, null
  );
  if (strongest) {
    const firstReport = analysis.reports.find(
      report => report.name === strongest.first
    );
    const secondReport = analysis.reports.find(
      report => report.name === strongest.second
    );
    findings.push(copy.strongest(
      firstReport
        ? localizeReportName(firstReport.name, firstReport.source, language, officialSeriesNames)
        : strongest.first,
      secondReport
        ? localizeReportName(secondReport.name, secondReport.source, language, officialSeriesNames)
        : strongest.second,
      formatNumber(strongest.r, language),
      formatNumber(strongest.count, language),
      localizeStatisticalCorrelationInterpretation(strongest.interpretation, language)
    ));
  }
  if (analysis.factorModel) {
    const factor = analysis.factorModel;
    const targetReport = analysis.reports.find(
      report => report.name === factor.target
    );
    const r2 = factor.r2 === null ? "" : formatNumber(factor.r2, language);
    findings.push(`${copy.factor(targetReport ? localizeReportName(targetReport.name, targetReport.source, language, officialSeriesNames) : factor.target, formatNumber(factor.count, language), r2)}${factor.warning ? ` ${localizeStatisticalText(factor.warning, language)}` : ""}`);
  }
  const warnings = [...new Set(analysis.reports.flatMap(report => report.warnings))].slice(0, 3);
  if (warnings.length) findings.push(copy.warnings(warnings.map(warning => localizeStatisticalText(warning, language)).join(" ")));
  return {
    title: copy.title,
    content: [copy.summary(formatNumber(analysis.reports.length, language), formatNumber(totalObservations, language)), ...findings, copy.disclaimer].join("\n\n"),
  };
}
