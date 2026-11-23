export type ReportLanguage =
  | "en" | "it" | "es" | "fr" | "de" | "pt" | "ru" | "pl"
  | "nl" | "tr" | "sv" | "da" | "no" | "fi" | "uk" | "cs";

export const SENTINEL_SUPPORTED_LOCALES: readonly ReportLanguage[] = [
  "en", "it", "es", "fr", "de", "pt", "ru", "pl",
  "nl", "tr", "sv", "da", "no", "fi", "uk", "cs",
];

export function normalizeSentinelReportLanguage(language: string): ReportLanguage {
  return SENTINEL_SUPPORTED_LOCALES.includes(language as ReportLanguage)
    ? (language as ReportLanguage)
    : "en";
}

export function sentinelLocale(language: ReportLanguage) {
  const localeMap: Record<ReportLanguage, string> = {
    en: "en-US", it: "it-IT", es: "es-ES", fr: "fr-FR", de: "de-DE",
    pt: "pt-PT", ru: "ru-RU", pl: "pl-PL", nl: "nl-NL", tr: "tr-TR",
    sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI", uk: "uk-UA", cs: "cs-CZ",
  };
  return localeMap[language];
}

export function formatSentinelNumber(value: number, language: ReportLanguage, maximumFractionDigits = 3) {
  return value.toLocaleString(sentinelLocale(language), { maximumFractionDigits });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const limitationTranslations = new Map<string, string>([
  [
    normalizeText(
      "La mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono ESA WorldCover 2021, non osservazioni di campo."
    ),
    "The map is an exploratory 10 m classification; training and reference labels come from ESA WorldCover 2021, not field observations.",
  ],
  [
    normalizeText(
      "Il test spaziale misura l'accordo con WorldCover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti."
    ),
    "The spatial test measures agreement with WorldCover on geographic blocks held out from training, not accuracy against independent ground truth.",
  ],
  [
    normalizeText(
      "La differenza temporale tra WorldCover 2021 e la scena Sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette."
    ),
    "The time difference between ESA WorldCover 2021 and the selected Sentinel-2 scene may include real changes not represented by the labels.",
  ],
  [
    normalizeText(
      "Verifica la mappa in GIS e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche."
    ),
    "Review the map in GIS and compare it with independent data before using it for operational decisions or scientific conclusions.",
  ],
]);

const worldCoverNamesEn: Record<string, string> = {
  Alberi: "Trees",
  Arbusteti: "Shrubland",
  Praterie: "Grassland",
  Colture: "Cropland",
  Edificato: "Built-up",
  "Suolo nudo": "Bare or sparse vegetation",
  "Neve e ghiaccio": "Snow and ice",
  Acqua: "Water",
  "Zone umide": "Herbaceous wetland",
  Mangrovie: "Mangroves",
  "Licheni e muschi": "Moss and lichen",
};

const worldCoverNames: Partial<Record<ReportLanguage, Record<string, string>>> = {
  es: { Alberi: "Árboles", Arbusteti: "Matorral", Praterie: "Praderas", Colture: "Cultivos", Edificato: "Zonas construidas", "Suolo nudo": "Suelo desnudo", "Neve e ghiaccio": "Nieve y hielo", Acqua: "Agua", "Zone umide": "Humedal herbáceo", Mangrovie: "Manglares", "Licheni e muschi": "Liquen y musgo" },
  fr: { Alberi: "Arbres", Arbusteti: "Maquis", Praterie: "Prairies", Colture: "Cultures", Edificato: "Zones bâties", "Suolo nudo": "Sol nu ou végétation clairsemée", "Neve e ghiaccio": "Neige et glace", Acqua: "Eau", "Zone umide": "Zones humides herbacées", Mangrovie: "Mangroves", "Licheni e muschi": "Mousses et lichens" },
  de: { Alberi: "Bäume", Arbusteti: "Strauchland", Praterie: "Grasland", Colture: "Ackerland", Edificato: "Bebaute Flächen", "Suolo nudo": "Kahler oder spärlich bewachsener Boden", "Neve e ghiaccio": "Schnee und Eis", Acqua: "Wasser", "Zone umide": "Krautige Feuchtgebiete", Mangrovie: "Mangroven", "Licheni e muschi": "Moose und Flechten" },
  pt: { Alberi: "Árvores", Arbusteti: "Arbustos", Praterie: "Pradarias", Colture: "Culturas agrícolas", Edificato: "Áreas construídas", "Suolo nudo": "Solo nu ou vegetação esparsa", "Neve e ghiaccio": "Neve e gelo", Acqua: "Água", "Zone umide": "Zonas húmidas herbáceas", Mangrovie: "Mangais", "Licheni e muschi": "Musgos e líquenes" },
  pl: { Alberi: "Lasy", Arbusteti: "Zarośla", Praterie: "Łąki", Colture: "Uprawy", Edificato: "Tereny zabudowane", "Suolo nudo": "Goła gleba lub skąpa roślinność", "Neve e ghiaccio": "Śnieg i lód", Acqua: "Woda", "Zone umide": "Trawiaste tereny podmokłe", Mangrovie: "Namorzyny", "Licheni e muschi": "Mchy i porosty" },
  nl: { Alberi: "Bomen", Arbusteti: "Struikgewas", Praterie: "Grasland", Colture: "Akkerland", Edificato: "Bebouwd gebied", "Suolo nudo": "Onbegroeide grond of schaarse vegetatie", "Neve e ghiaccio": "Sneeuw en ijs", Acqua: "Water", "Zone umide": "Kruidachtige wetlands", Mangrovie: "Mangroven", "Licheni e muschi": "Mossen en korstmossen" },
  tr: { Alberi: "Ağaçlar", Arbusteti: "Çalılıklar", Praterie: "Otlaklar", Colture: "Tarım alanları", Edificato: "Yerleşim alanları", "Suolo nudo": "Çıplak veya seyrek bitki örtülü alan", "Neve e ghiaccio": "Kar ve buz", Acqua: "Su", "Zone umide": "Otsu sulak alanlar", Mangrovie: "Mangrovlar", "Licheni e muschi": "Yosun ve likenler" },
  sv: { Alberi: "Träd", Arbusteti: "Buskmark", Praterie: "Gräsmark", Colture: "Jordbruksmark", Edificato: "Bebyggda områden", "Suolo nudo": "Bar mark eller gles vegetation", "Neve e ghiaccio": "Snö och is", Acqua: "Vatten", "Zone umide": "Örtbevuxna våtmarker", Mangrovie: "Mangrover", "Licheni e muschi": "Mossor och lavar" },
  da: { Alberi: "Træer", Arbusteti: "Buskland", Praterie: "Græsland", Colture: "Afgrøder", Edificato: "Bebyggede områder", "Suolo nudo": "Bar jord eller sparsom vegetation", "Neve e ghiaccio": "Sne og is", Acqua: "Vand", "Zone umide": "Urteagtige vådområder", Mangrovie: "Mangrover", "Licheni e muschi": "Mos og laver" },
  no: { Alberi: "Trær", Arbusteti: "Buskmark", Praterie: "Gressmark", Colture: "Jordbruksareal", Edificato: "Bebygde områder", "Suolo nudo": "Bar jord eller sparsom vegetasjon", "Neve e ghiaccio": "Snø og is", Acqua: "Vann", "Zone umide": "Urtepregede våtmarker", Mangrovie: "Mangrover", "Licheni e muschi": "Moser og lav" },
  fi: { Alberi: "Puut", Arbusteti: "Pensaat", Praterie: "Niityt", Colture: "Viljelyalueet", Edificato: "Rakennetut alueet", "Suolo nudo": "Paljas maa tai harva kasvillisuus", "Neve e ghiaccio": "Lumi ja jää", Acqua: "Vesi", "Zone umide": "Ruohovaltaiset kosteikot", Mangrovie: "Mangrovemetsät", "Licheni e muschi": "Sammalet ja jäkälät" },
  ru: { Alberi: "Деревья", Arbusteti: "Кустарники", Praterie: "Луга", Colture: "Культуры", Edificato: "Застройка", "Suolo nudo": "Открытый грунт", "Neve e ghiaccio": "Снег и лёд", Acqua: "Вода", "Zone umide": "Травянистые водно-болотные угодья", Mangrovie: "Мангры", "Licheni e muschi": "Мхи и лишайники" },
  uk: { Alberi: "Дерева", Arbusteti: "Чагарники", Praterie: "Луки", Colture: "Посіви", Edificato: "Забудова", "Suolo nudo": "Відкритий ґрунт", "Neve e ghiaccio": "Сніг і лід", Acqua: "Вода", "Zone umide": "Трав’янисті водно-болотні угіддя", Mangrovie: "Мангрові зарості", "Licheni e muschi": "Мохи й лишайники" },
  cs: { Alberi: "Stromy", Arbusteti: "Křoviny", Praterie: "Travní porosty", Colture: "Plodiny", Edificato: "Zastavěné území", "Suolo nudo": "Holá půda nebo řídká vegetace", "Neve e ghiaccio": "Sníh a led", Acqua: "Voda", "Zone umide": "Bylinné mokřady", Mangrovie: "Mangrovy", "Licheni e muschi": "Mechy a lišejníky" },
};

const stepTranslations = new Map<string, string>([
  [
    normalizeText("Cerco scene Sentinel-2 L2A nel catalogo STAC pubblico."),
    "Searching the public STAC catalog for Sentinel-2 L2A scenes.",
  ],
  [
    normalizeText(
      "Allineo ESA WorldCover 2021 alla griglia Sentinel-2 a 10 metri."
    ),
    "Aligning ESA WorldCover 2021 with the 10-meter Sentinel-2 grid.",
  ],
  [
    normalizeText(
      "Random Forest addestrata; valuto i blocchi geografici esclusi dal training."
    ),
    "Random Forest trained; evaluating geographic blocks held out from training.",
  ],
  [
    normalizeText(
      "SVM lineare addestrata sulle feature spettrali e sugli indici."
    ),
    "Linear SVM trained on spectral features and indices.",
  ],
  [
    normalizeText(
      "Rifitto randomForest sui campioni di riferimento e classifico i pixel senza nuvole."
    ),
    "Refitting Random Forest on reference samples and classifying cloud-free pixels.",
  ],
  [
    normalizeText(
      "Preparo nel risultato un campione raster compresso con etichette proxy WorldCover per il training U-Net nel browser."
    ),
    "Preparing a compressed raster sample with WorldCover proxy labels for browser-based U-Net training.",
  ],
  [
    normalizeText("Mappa GeoTIFF e valutazione spaziale completate."),
    "GeoTIFF map and spatial evaluation complete.",
  ],
]);

export function localizeSentinelModelName(
  name: string,
  language: ReportLanguage
) {
  if (name !== "SVM lineare") return name;
  const translations: Partial<Record<ReportLanguage, string>> = {
    en: "Linear SVM",
    es: "SVM lineal",
    ru: "Линейная SVM",
    uk: "Лінійна SVM",
    pl: "Liniowa SVM",
    fr: "SVM linéaire",
    de: "Lineare SVM",
    pt: "SVM linear",
    nl: "Lineaire SVM",
    tr: "Doğrusal SVM",
    sv: "Linjär SVM",
    da: "Lineær SVM",
    no: "Lineær SVM",
    fi: "Lineaarinen SVM",
    cs: "Lineární SVM",
  };
  return translations[language] ?? name;
}

export function localizeSentinelWorldCoverName(
  name: string,
  language: ReportLanguage
) {
  if (language === "it") return name;
  if (language === "en") return worldCoverNamesEn[name] ?? name;
  return worldCoverNames[language]?.[name] ?? worldCoverNamesEn[name] ?? name;
}

export function localizeSentinelMapModelName(
  name: string,
  language: ReportLanguage
) {
  const cleanName = name.trim().replace(/[.!?]+$/, "");
  if (language === "it") return cleanName;

  const retrainedDescriptions: Record<
    Exclude<ReportLanguage, "it">,
    { randomForest: string; linearSvm: string }
  > = {
    en: {
      randomForest: "Random Forest retrained on balanced WorldCover samples from the AOI",
      linearSvm: "Linear SVM retrained on balanced WorldCover samples from the AOI",
    },
    es: {
      randomForest: "Random Forest reajustado con muestras equilibradas de WorldCover del AOI",
      linearSvm: "SVM lineal reajustada con muestras equilibradas de WorldCover del AOI",
    },
    fr: {
      randomForest: "Random Forest réentraîné sur des échantillons WorldCover équilibrés de l'AOI",
      linearSvm: "SVM linéaire réentraînée sur des échantillons WorldCover équilibrés de l'AOI",
    },
    de: {
      randomForest: "Random Forest, erneut mit ausgeglichenen WorldCover-Stichproben aus dem AOI trainiert",
      linearSvm: "Lineare SVM, erneut mit ausgeglichenen WorldCover-Stichproben aus dem AOI trainiert",
    },
    pt: {
      randomForest: "Random Forest retreinado com amostras equilibradas do WorldCover da AOI",
      linearSvm: "SVM linear retreinado com amostras equilibradas do WorldCover da AOI",
    },
    ru: {
      randomForest: "Random Forest, переобученная на сбалансированных выборках WorldCover из AOI",
      linearSvm: "Линейная SVM, переобученная на сбалансированных выборках WorldCover из AOI",
    },
    pl: {
      randomForest: "Random Forest ponownie wytrenowany na zrównoważonych próbkach WorldCover z AOI",
      linearSvm: "Liniowa SVM ponownie wytrenowana na zrównoważonych próbkach WorldCover z AOI",
    },
    nl: {
      randomForest: "Random Forest opnieuw getraind met gebalanceerde WorldCover-voorbeelden uit het AOI",
      linearSvm: "Lineaire SVM opnieuw getraind met gebalanceerde WorldCover-voorbeelden uit het AOI",
    },
    tr: {
      randomForest: "AOI içindeki dengeli WorldCover örnekleriyle yeniden eğitilmiş Random Forest",
      linearSvm: "AOI içindeki dengeli WorldCover örnekleriyle yeniden eğitilmiş doğrusal SVM",
    },
    sv: {
      randomForest: "Random Forest omtränad med balanserade WorldCover-urval från AOI",
      linearSvm: "Linjär SVM omtränad med balanserade WorldCover-urval från AOI",
    },
    da: {
      randomForest: "Random Forest genoptrænet med balancerede WorldCover-prøver fra AOI",
      linearSvm: "Lineær SVM genoptrænet med balancerede WorldCover-prøver fra AOI",
    },
    no: {
      randomForest: "Random Forest trent på nytt med balanserte WorldCover-utvalg fra AOI",
      linearSvm: "Lineær SVM trent på nytt med balanserte WorldCover-utvalg fra AOI",
    },
    fi: {
      randomForest: "AOI-alueen tasapainotetuilla WorldCover-havainnoilla uudelleen opetettu Random Forest",
      linearSvm: "AOI-alueen tasapainotetuilla WorldCover-havainnoilla uudelleen opetettu lineaarinen SVM",
    },
    uk: {
      randomForest: "Random Forest, повторно навчена на збалансованих вибірках WorldCover з AOI",
      linearSvm: "Лінійна SVM, повторно навчена на збалансованих вибірках WorldCover з AOI",
    },
    cs: {
      randomForest: "Random Forest znovu natrénovaný na vyvážených vzorcích WorldCover z AOI",
      linearSvm: "Lineární SVM znovu natrénovaná na vyvážených vzorcích WorldCover z AOI",
    },
  };
  const normalized = normalizeText(cleanName);
  if (normalized.startsWith("random forest rifittata")) {
    return retrainedDescriptions[language].randomForest;
  }
  if (normalized.startsWith("svm lineare rifittata")) {
    return retrainedDescriptions[language].linearSvm;
  }
  return localizeSentinelModelName(cleanName, language);
}

export function localizeSentinelLimitation(
  value: string,
  language: ReportLanguage
) {
  if (language === "it") return value;
  if (language === "es") {
    const es: Record<string, string> = {
      "la mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono esa worldcover 2021, non osservazioni di campo.": "El mapa es una clasificación exploratoria a 10 m; las etiquetas de entrenamiento y referencia proceden de ESA WorldCover 2021, no de observaciones de campo.",
      "il test spaziale misura l'accordo con worldcover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.": "La prueba espacial mide la coincidencia con WorldCover en bloques geográficos excluidos del entrenamiento, no la precisión frente a datos independientes sobre el terreno.",
      "la differenza temporale tra worldcover 2021 e la scena sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette.": "La diferencia temporal entre WorldCover 2021 y la escena Sentinel-2 seleccionada puede incluir cambios reales no representados por las etiquetas.",
      "verifica la mappa in gis e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.": "Revise el mapa en un SIG y compárelo con datos independientes antes de usarlo para decisiones operativas o conclusiones científicas.",
    };
    return es[normalizeText(value)] ?? value;
  }
  if (language === "ru") {
    const ru: Record<string, string> = {
      "la mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono esa worldcover 2021, non osservazioni di campo.": "Карта представляет собой исследовательскую классификацию с разрешением 10 м; обучающие и контрольные метки взяты из ESA WorldCover 2021, а не из полевых наблюдений.",
      "il test spaziale misura l'accordo con worldcover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.": "Пространственная проверка оценивает согласие с WorldCover на географических блоках, исключённых из обучения, а не точность относительно независимых наземных данных.",
      "la differenza temporale tra worldcover 2021 e la scena sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette.": "Разница во времени между WorldCover 2021 и выбранной сценой Sentinel-2 может привести к реальным изменениям, которые не отражены в метках.",
      "verifica la mappa in gis e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.": "Проверьте карту в ГИС и сопоставьте её с независимыми данными перед использованием для оперативных решений или научных выводов.",
    };
    return ru[normalizeText(value)] ?? value;
  }
  if (language === "uk") {
    const uk: Record<string, string> = {
      "la mappa e una classificazione esplorativa a 10 m; le etichette di training e riferimento sono esa worldcover 2021, non osservazioni di campo.": "Карта є дослідницькою класифікацією з роздільністю 10 м; навчальні та еталонні мітки походять з ESA WorldCover 2021, а не з польових спостережень.",
      "il test spaziale misura l'accordo con worldcover su blocchi geografici esclusi dal training, non l'accuratezza rispetto a verita-terreno indipendenti.": "Просторовий тест вимірює узгодженість із WorldCover на географічних блоках, вилучених із навчання, а не точність відносно незалежних наземних даних.",
      "la differenza temporale tra worldcover 2021 e la scena sentinel-2 selezionata puo introdurre cambiamenti reali non rappresentati dalle etichette.": "Часова різниця між WorldCover 2021 і вибраною сценою Sentinel-2 може містити реальні зміни, не відображені в мітках.",
      "verifica la mappa in gis e con dati indipendenti prima di usarla per decisioni operative o conclusioni scientifiche.": "Перевірте карту в ГІС і порівняйте її з незалежними даними перед використанням для практичних рішень або наукових висновків.",
    };
    return uk[normalizeText(value)] ?? value;
  }
  return limitationTranslations.get(normalizeText(value)) ?? value;
}

export function localizeSentinelReferenceMeaning(
  value: string,
  language: ReportLanguage
) {
  if (language === "it") return value;
  if (language === "es") return "Etiquetas de referencia de 2021; no son mediciones independientes sobre el terreno.";
  if (language === "ru") return "Контрольные метки 2021 года; это не независимые наземные обследования.";
  if (language === "uk") return "Еталонні мітки 2021 року; це не незалежні наземні вимірювання.";
  if (
    normalizeText(value) ===
    normalizeText(
      "Etichette di riferimento 2021; non sono rilievi a terra indipendenti."
    )
  ) {
    return "2021 reference labels; these are not independent ground surveys.";
  }
  return value;
}

export function localizeSentinelStepMessage(
  value: string,
  language: ReportLanguage
) {
  if (language === "it") return value;
  if (language === "es") {
    if (normalizeText(value).startsWith("cerco scene sentinel-2")) return "Buscando escenas Sentinel-2 L2A en el catálogo público STAC.";
    if (normalizeText(value).startsWith("allineo esa worldcover")) return "Alineando ESA WorldCover 2021 con la cuadrícula Sentinel-2 de 10 metros.";
    if (normalizeText(value).startsWith("mappa geotiff")) return "Mapa GeoTIFF y evaluación espacial completados.";
  }
  if (language === "ru") {
    if (normalizeText(value).startsWith("cerco scene sentinel-2")) return "Поиск сцен Sentinel-2 L2A в публичном каталоге STAC.";
    if (normalizeText(value).startsWith("allineo esa worldcover")) return "Сопоставление ESA WorldCover 2021 с сеткой Sentinel-2 разрешением 10 метров.";
    if (normalizeText(value).startsWith("random forest addestrata")) return "Random Forest обучена; оценка географических блоков, исключённых из обучения.";
    if (normalizeText(value).startsWith("svm lineare addestrata")) return "Линейная SVM обучена на спектральных признаках и индексах.";
    if (normalizeText(value).startsWith("rifitto randomforest")) return "Повторное обучение Random Forest на эталонных выборках и классификация безоблачных пикселей.";
    if (normalizeText(value).startsWith("preparo nel risultato")) return "Подготовка сжатого растрового образца с прокси-метками WorldCover для обучения U-Net в браузере.";
    if (normalizeText(value).startsWith("mappa geotiff")) return "Карта GeoTIFF и пространственная оценка завершены.";
    const selectedScene = value.match(/^Scena selezionata: (.+) con copertura nuvolosa di tile ([\d.,]+)%\.$/);
    if (selectedScene) return `Выбрана сцена ${selectedScene[1]}; облачность тайла — ${selectedScene[2]}%.`;
    const sceneBand = value.match(/^Leggo dalla scena COG l'area richiesta: banda ([A-Z0-9]+)\.$/);
    if (sceneBand) return `Чтение нужной области из сцены COG: канал ${sceneBand[1]}.`;
    const spatialValidation = value.match(/^Validazione spaziale su blocchi da ([\d.,]+) m; (\d+) campioni di training e (\d+) di test\.$/);
    if (spatialValidation) return `Пространственная проверка блоками ${spatialValidation[1]} м; обучающих выборок: ${spatialValidation[2]}, тестовых: ${spatialValidation[3]}.`;
  }
  if (language === "uk") {
    const normalized = normalizeText(value);
    if (normalized.startsWith("cerco scene sentinel-2")) return "Пошук сцен Sentinel-2 L2A у загальнодоступному каталозі STAC.";
    if (normalized.startsWith("allineo esa worldcover")) return "Узгодження ESA WorldCover 2021 із сіткою Sentinel-2 з роздільністю 10 метрів.";
    if (normalized.startsWith("random forest addestrata")) return "Random Forest навчено; оцінювання просторових блоків, вилучених із навчання.";
    if (normalized.startsWith("svm lineare addestrata")) return "Лінійну SVM навчено на спектральних ознаках та індексах.";
    if (normalized.startsWith("rifitto randomforest")) return "Повторне навчання Random Forest на еталонних вибірках і класифікація безхмарних пікселів.";
    if (normalized.startsWith("preparo nel risultato")) return "Підготовка стиснутого растрового зразка з проксі-мітками WorldCover для навчання U-Net у браузері.";
    if (normalized.startsWith("mappa geotiff")) return "Карту GeoTIFF і просторове оцінювання завершено.";
    const selectedScene = value.match(/^Scena selezionata: (.+) con copertura nuvolosa di tile ([\d.,]+)%\.$/);
    if (selectedScene) return `Вибрана сцена: ${selectedScene[1]}; хмарність тайла — ${selectedScene[2]}%.`;
    const sceneBand = value.match(/^Leggo dalla scena COG l'area richiesta: banda ([A-Z0-9]+)\.$/);
    if (sceneBand) return `Читання потрібної області зі сцени COG: канал ${sceneBand[1]}.`;
    const spatialValidation = value.match(/^Validazione spaziale su blocchi da ([\d.,]+) m; (\d+) campioni di training e (\d+) di test\.$/);
    if (spatialValidation) return `Просторова перевірка блоками ${spatialValidation[1]} м; ${spatialValidation[2]} навчальних і ${spatialValidation[3]} тестових вибірок.`;
  }
  const exactTranslation = stepTranslations.get(normalizeText(value));
  if (exactTranslation) return exactTranslation;

  const selectedScene = value.match(
    /^Scena selezionata: (.+) con copertura nuvolosa di tile ([\d.,]+)%\.$/
  );
  if (selectedScene) {
    return `Selected scene: ${selectedScene[1]} with ${selectedScene[2]}% tile cloud cover.`;
  }
  const sceneBand = value.match(
    /^Leggo dalla scena COG l'area richiesta: banda ([A-Z0-9]+)\.$/
  );
  if (sceneBand)
    return `Reading requested area from COG scene: ${sceneBand[1]} band.`;
  const spatialValidation = value.match(
    /^Validazione spaziale su blocchi da ([\d.,]+) m; (\d+) campioni di training e (\d+) di test\.$/
  );
  if (spatialValidation) {
    return `Spatial validation on ${spatialValidation[1]} m blocks; ${spatialValidation[2]} training samples and ${spatialValidation[3]} test samples.`;
  }
  return value;
}
