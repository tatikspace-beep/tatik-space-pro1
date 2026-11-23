import { useState } from "react";
import { AlertCircle, Download, Loader2, Play, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ReportLanguage } from "@/lib/sentinelReportLocalization";
import { formatSentinelNumber, normalizeSentinelReportLanguage } from "@/lib/sentinelReportLocalization";

const EURO_SAT_URL = "https://zenodo.org/records/7711810/files/EuroSAT_RGB.zip?download=1";
const CLASS_NAMES = [
  "AnnualCrop",
  "Forest",
  "HerbaceousVegetation",
  "Highway",
  "Industrial",
  "Pasture",
  "PermanentCrop",
  "Residential",
  "River",
  "SeaLake",
];

type CnnResult = {
  accuracy: number;
  balancedAccuracy: number;
  macroF1: number;
  testCount: number;
  classNames: string[];
  confusionMatrix: number[][];
  perClass: Array<{ name: string; precision: number; recall: number; f1: number; support: number }>;
};

const copy = {
  it: {
    title: "CNN · Computer vision EuroSAT",
    description: "Benchmark di classificazione di immagini Sentinel-2 a chip. L’archivio viene elaborato nel browser: non viene caricato sul server.",
    download: "Scarica EuroSAT RGB (94,7 MB)",
    choose: "Seleziona il file EuroSAT_RGB.zip scaricato",
    samples: "Campioni per classe",
    epochs: "Epoche",
    run: "Addestra e valuta CNN nel browser",
    running: "Il browser sta elaborando EuroSAT…",
    ready: "Archivio caricato localmente. Avvia il benchmark per continuare.",
    downloadNote: "Il download avviene dal repository Zenodo ufficiale e salva il file sul tuo dispositivo; poi selezionalo qui. La rete e la memoria del dispositivo possono rendere il training lento.",
    method: "CNN convoluzionale compatta · split stratificato 80/20 · seed fisso.",
    metrics: "Metriche sul test EuroSAT",
    accuracy: "Accuracy",
    balanced: "Balanced accuracy",
    f1: "Macro F1",
    class: "Classe",
    precision: "Precision",
    recall: "Recall",
    support: "Campioni test",
    confusion: "Matrice di confusione (righe: classe reale, colonne: predetta)",
    actual: "Reale / predetta",
    error: "Benchmark CNN non riuscito.",
    invalidFile: "Seleziona l’archivio EuroSAT_RGB.zip ufficiale.",
    invalidSample: "Scegli da 20 a 150 campioni per classe e da 1 a 10 epoche.",
    license: "EuroSAT è distribuito con licenza MIT. Il risultato classifica chip RGB e non produce una mappa georeferenziata della tua AOI.",
    progress: (current: number, total: number) => `Decodifica delle immagini: ${current}/${total}`,
    epoch: (current: number, total: number, loss: number | string) => `Epoca ${current}/${total} · loss ${loss}`,
  },
  en: {
    title: "CNN · EuroSAT computer vision",
    description: "Sentinel-2 image-chip classification benchmark. The archive is processed in your browser and is not uploaded to the server.",
    download: "Download EuroSAT RGB (94.7 MB)",
    choose: "Select the downloaded EuroSAT_RGB.zip file",
    samples: "Samples per class",
    epochs: "Epochs",
    run: "Train and evaluate CNN in browser",
    running: "The browser is processing EuroSAT…",
    ready: "Archive loaded locally. Start the benchmark to continue.",
    downloadNote: "The official Zenodo archive is downloaded to your device; select it here afterward. Network speed and device memory can make training slow.",
    method: "Compact convolutional CNN · stratified 80/20 split · fixed seed.",
    metrics: "EuroSAT test metrics",
    accuracy: "Accuracy",
    balanced: "Balanced accuracy",
    f1: "Macro F1",
    class: "Class",
    precision: "Precision",
    recall: "Recall",
    support: "Test samples",
    confusion: "Confusion matrix (rows: actual, columns: predicted)",
    actual: "Actual / predicted",
    error: "CNN benchmark failed.",
    invalidFile: "Select the official EuroSAT_RGB.zip archive.",
    invalidSample: "Choose 20–150 samples per class and 1–10 epochs.",
    license: "EuroSAT is distributed under the MIT license. This classifies RGB image chips; it does not create a georeferenced map of your AOI.",
    progress: (current: number, total: number) => `Decoding images: ${current}/${total}`,
    epoch: (current: number, total: number, loss: number | string) => `Epoch ${current}/${total} · loss ${loss}`,
  },
};

const cnnCopy: Record<ReportLanguage, typeof copy.en> = {
  ...copy,
  es: {
    ...copy.en,
    title: "CNN · Visión artificial EuroSAT",
    description: "Prueba de clasificación de chips Sentinel-2. El archivo se procesa en el navegador y no se carga al servidor.",
    download: "Descargar EuroSAT RGB (94,7 MB)",
    choose: "Selecciona el archivo EuroSAT_RGB.zip descargado",
    samples: "Muestras por clase",
    epochs: "Épocas",
    run: "Entrenar y evaluar CNN en el navegador",
    running: "El navegador está procesando EuroSAT…",
    ready: "Archivo cargado localmente. Inicia la prueba para continuar.",
    downloadNote: "El archivo oficial de Zenodo se descarga en tu dispositivo; después, selecciónalo aquí. La velocidad de la red y la memoria del dispositivo pueden ralentizar el entrenamiento.",
    method: "CNN convolucional compacta · división estratificada 80/20 · semilla fija.",
    metrics: "Métricas de prueba EuroSAT",
    accuracy: "Exactitud",
    balanced: "Exactitud equilibrada",
    f1: "F1 macro",
    class: "Clase",
    precision: "Precisión",
    recall: "Exhaustividad",
    support: "Muestras de prueba",
    confusion: "Matriz de confusión (filas: clase real, columnas: predicha)",
    actual: "Real / predicha",
    error: "La prueba CNN falló.",
    invalidFile: "Selecciona el archivo oficial EuroSAT_RGB.zip.",
    invalidSample: "Elige de 20 a 150 muestras por clase y de 1 a 10 épocas.",
    license: "EuroSAT se distribuye con licencia MIT. El modelo clasifica chips RGB y no crea un mapa georreferenciado del AOI.",
    progress: (current, total) => `Decodificación de imágenes: ${current}/${total}`,
    epoch: (current, total, loss) => `Época ${current}/${total} · pérdida ${loss}`,
  },
  ru: {
    ...copy.en,
    title: "CNN · Компьютерное зрение EuroSAT",
    description: "Тест классификации фрагментов изображений Sentinel-2. Архив обрабатывается в браузере и не загружается на сервер.",
    download: "Скачать EuroSAT RGB (94,7 МБ)",
    choose: "Выберите загруженный файл EuroSAT_RGB.zip",
    samples: "Выборок на класс",
    epochs: "Эпохи",
    run: "Обучить и проверить CNN в браузере",
    running: "Браузер обрабатывает EuroSAT…",
    ready: "Архив загружен на устройство. Запустите тест, чтобы продолжить.",
    downloadNote: "Официальный архив Zenodo будет загружен на ваше устройство; затем выберите его здесь. Скорость сети и память устройства могут замедлить обучение.",
    method: "Компактная свёрточная CNN · стратифицированное разбиение 80/20 · фиксированное начальное значение.",
    metrics: "Метрики тестирования EuroSAT",
    accuracy: "Точность",
    balanced: "Сбалансированная точность",
    f1: "Макро F1",
    class: "Класс",
    precision: "Точность",
    recall: "Полнота",
    support: "Тестовые выборки",
    confusion: "Матрица ошибок (строки: истинный класс, столбцы: прогноз)",
    actual: "Истинный / прогнозируемый",
    error: "Не удалось выполнить тест CNN.",
    invalidFile: "Выберите официальный архив EuroSAT_RGB.zip.",
    invalidSample: "Выберите от 20 до 150 выборок на класс и от 1 до 10 эпох.",
    license: "EuroSAT распространяется по лицензии MIT. Модель классифицирует RGB-фрагменты и не создаёт геопривязанную карту AOI.",
    progress: (current, total) => `Декодирование изображений: ${current}/${total}`,
    epoch: (current, total, loss) => `Эпоха ${current}/${total} · ошибка ${loss}`,
  },
  fr: {
    ...copy.en,
    title: "CNN · Vision par ordinateur EuroSAT",
    description: "Test de classification de vignettes Sentinel-2. L’archive est traitée dans le navigateur et n’est pas envoyée au serveur.",
    download: "Télécharger EuroSAT RGB (94,7 Mo)",
    choose: "Sélectionner le fichier EuroSAT_RGB.zip téléchargé",
    samples: "Échantillons par classe",
    epochs: "Époques",
    run: "Entraîner et évaluer le CNN dans le navigateur",
    running: "Le navigateur traite EuroSAT…",
    ready: "Archive chargée localement. Lancez le test pour continuer.",
    downloadNote: "L’archive officielle Zenodo est téléchargée sur votre appareil ; sélectionnez-la ensuite ici. Le réseau et la mémoire de l’appareil peuvent ralentir l’entraînement.",
    method: "CNN convolutif compact · séparation stratifiée 80/20 · graine fixe.",
    metrics: "Métriques de test EuroSAT",
    accuracy: "Exactitude",
    balanced: "Exactitude équilibrée",
    f1: "F1 macro",
    class: "Classe",
    precision: "Précision",
    recall: "Rappel",
    support: "Échantillons de test",
    confusion: "Matrice de confusion (lignes : classe réelle, colonnes : classe prédite)",
    actual: "Réel / prédit",
    error: "Échec du test CNN.",
    invalidFile: "Sélectionnez l’archive officielle EuroSAT_RGB.zip.",
    invalidSample: "Choisissez de 20 à 150 échantillons par classe et de 1 à 10 époques.",
    license: "EuroSAT est distribué sous licence MIT. Le modèle classe des vignettes RGB et ne crée pas de carte géoréférencée de l’AOI.",
    progress: (current, total) => `Décodage des images : ${current}/${total}`,
    epoch: (current, total, loss) => `Époque ${current}/${total} · perte ${loss}`,
  },
  de: {
    ...copy.en,
    title: "CNN · Computer Vision mit EuroSAT",
    description: "Klassifikationstest für Sentinel-2-Bildkacheln. Das Archiv wird im Browser verarbeitet und nicht auf den Server hochgeladen.",
    download: "EuroSAT RGB herunterladen (94,7 MB)",
    choose: "Heruntergeladene Datei EuroSAT_RGB.zip auswählen",
    samples: "Stichproben pro Klasse",
    epochs: "Epochen",
    run: "CNN im Browser trainieren und auswerten",
    running: "EuroSAT wird im Browser verarbeitet…",
    ready: "Archiv lokal geladen. Starten Sie den Test, um fortzufahren.",
    downloadNote: "Das offizielle Zenodo-Archiv wird auf Ihr Gerät heruntergeladen; wählen Sie es anschließend hier aus. Netzwerkgeschwindigkeit und Gerätespeicher können das Training verlangsamen.",
    method: "Kompaktes faltendes CNN · stratifizierte Aufteilung 80/20 · fester Seed.",
    metrics: "EuroSAT-Testmetriken",
    accuracy: "Genauigkeit",
    balanced: "Ausgewogene Genauigkeit",
    f1: "Makro-F1",
    class: "Klasse",
    precision: "Präzision",
    recall: "Trefferquote",
    support: "Teststichproben",
    confusion: "Konfusionsmatrix (Zeilen: tatsächliche Klasse, Spalten: vorhergesagte Klasse)",
    actual: "Tatsächlich / vorhergesagt",
    error: "CNN-Test fehlgeschlagen.",
    invalidFile: "Wählen Sie das offizielle Archiv EuroSAT_RGB.zip aus.",
    invalidSample: "Wählen Sie 20 bis 150 Stichproben pro Klasse und 1 bis 10 Epochen.",
    license: "EuroSAT steht unter der MIT-Lizenz. Das Modell klassifiziert RGB-Bildkacheln und erstellt keine georeferenzierte Karte des AOI.",
    progress: (current, total) => `Bilder werden dekodiert: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoche ${current}/${total} · Verlust ${loss}`,
  },
  pt: {
    ...copy.en,
    title: "CNN · Visão computacional EuroSAT",
    description: "Teste de classificação de recortes de imagens Sentinel-2. O arquivo é processado no navegador e não é enviado para o servidor.",
    download: "Transferir EuroSAT RGB (94,7 MB)",
    choose: "Selecionar o ficheiro EuroSAT_RGB.zip transferido",
    samples: "Amostras por classe",
    epochs: "Épocas",
    run: "Treinar e avaliar a CNN no navegador",
    running: "A processar o EuroSAT no navegador…",
    ready: "Arquivo carregado localmente. Inicie o teste para continuar.",
    downloadNote: "O arquivo oficial do Zenodo é transferido para o seu dispositivo; depois, selecione-o aqui. A velocidade da rede e a memória do dispositivo podem tornar o treino mais lento.",
    method: "CNN convolucional compacta · divisão estratificada 80/20 · semente fixa.",
    metrics: "Métricas de teste EuroSAT",
    accuracy: "Exatidão",
    balanced: "Exatidão equilibrada",
    f1: "F1 macro",
    class: "Classe",
    precision: "Precisão",
    recall: "Revocação",
    support: "Amostras de teste",
    confusion: "Matriz de confusão (linhas: classe real, colunas: classe prevista)",
    actual: "Real / prevista",
    error: "O teste da CNN falhou.",
    invalidFile: "Selecione o arquivo oficial EuroSAT_RGB.zip.",
    invalidSample: "Escolha entre 20 e 150 amostras por classe e entre 1 e 10 épocas.",
    license: "O EuroSAT é distribuído ao abrigo da licença MIT. O modelo classifica recortes RGB e não cria um mapa georreferenciado da AOI.",
    progress: (current, total) => `Descodificação das imagens: ${current}/${total}`,
    epoch: (current, total, loss) => `Época ${current}/${total} · perda ${loss}`,
  },
  pl: {
    ...copy.en,
    title: "CNN · Wizja komputerowa EuroSAT",
    description: "Test klasyfikacji wycinków obrazów Sentinel-2. Archiwum jest przetwarzane w przeglądarce i nie jest wysyłane na serwer.",
    download: "Pobierz EuroSAT RGB (94,7 MB)",
    choose: "Wybierz pobrany plik EuroSAT_RGB.zip",
    samples: "Próbki na klasę",
    epochs: "Epoki",
    run: "Trenuj i oceniaj CNN w przeglądarce",
    running: "Przetwarzanie EuroSAT w przeglądarce…",
    ready: "Archiwum wczytano lokalnie. Uruchom test, aby kontynuować.",
    downloadNote: "Oficjalne archiwum Zenodo zostanie pobrane na urządzenie; następnie wybierz je tutaj. Szybkość sieci i pamięć urządzenia mogą spowolnić trening.",
    method: "Kompaktowa konwolucyjna sieć CNN · stratyfikowany podział 80/20 · stałe ziarno.",
    metrics: "Metryki testowe EuroSAT",
    accuracy: "Dokładność",
    balanced: "Dokładność zrównoważona",
    f1: "Makro F1",
    class: "Klasa",
    precision: "Precyzja",
    recall: "Czułość",
    support: "Próbki testowe",
    confusion: "Macierz pomyłek (wiersze: klasa rzeczywista, kolumny: przewidywana)",
    actual: "Rzeczywista / przewidywana",
    error: "Test CNN nie powiódł się.",
    invalidFile: "Wybierz oficjalne archiwum EuroSAT_RGB.zip.",
    invalidSample: "Wybierz od 20 do 150 próbek na klasę i od 1 do 10 epok.",
    license: "EuroSAT jest udostępniany na licencji MIT. Model klasyfikuje wycinki RGB i nie tworzy georeferencyjnej mapy AOI.",
    progress: (current, total) => `Dekodowanie obrazów: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoka ${current}/${total} · strata ${loss}`,
  },
  nl: {
    ...copy.en,
    title: "CNN · Computervisie met EuroSAT",
    description: "Classificatietest voor Sentinel-2-beeldfragmenten. Het archief wordt in de browser verwerkt en niet naar de server geüpload.",
    download: "EuroSAT RGB downloaden (94,7 MB)",
    choose: "Het gedownloade bestand EuroSAT_RGB.zip selecteren",
    samples: "Voorbeelden per klasse",
    epochs: "Epochs",
    run: "CNN trainen en evalueren in de browser",
    running: "EuroSAT wordt in de browser verwerkt…",
    ready: "Archief lokaal geladen. Start de test om verder te gaan.",
    downloadNote: "Het officiële Zenodo-archief wordt naar uw apparaat gedownload; selecteer het daarna hier. Netwerksnelheid en apparaatgeheugen kunnen de training vertragen.",
    method: "Compact convolutioneel CNN · gestratificeerde verdeling 80/20 · vaste seed.",
    metrics: "EuroSAT-testmetingen",
    accuracy: "Nauwkeurigheid",
    balanced: "Gebalanceerde nauwkeurigheid",
    f1: "Macro-F1",
    class: "Klasse",
    precision: "Precisie",
    recall: "Recall",
    support: "Testvoorbeelden",
    confusion: "Verwarringsmatrix (rijen: werkelijke klasse, kolommen: voorspelde klasse)",
    actual: "Werkelijk / voorspeld",
    error: "De CNN-test is mislukt.",
    invalidFile: "Selecteer het officiële archief EuroSAT_RGB.zip.",
    invalidSample: "Kies 20 tot 150 voorbeelden per klasse en 1 tot 10 epochs.",
    license: "EuroSAT wordt verspreid onder de MIT-licentie. Het model classificeert RGB-beeldfragmenten en maakt geen gegeorefereerde kaart van uw AOI.",
    progress: (current, total) => `Afbeeldingen decoderen: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoch ${current}/${total} · verlies ${loss}`,
  },
  tr: {
    ...copy.en,
    title: "CNN · EuroSAT bilgisayarlı görü",
    description: "Sentinel-2 görüntü parçaları için sınıflandırma testi. Arşiv tarayıcıda işlenir ve sunucuya yüklenmez.",
    download: "EuroSAT RGB dosyasını indir (94,7 MB)",
    choose: "İndirilen EuroSAT_RGB.zip dosyasını seçin",
    samples: "Sınıf başına örnek",
    epochs: "Dönem",
    run: "CNN'i tarayıcıda eğit ve değerlendir",
    running: "EuroSAT tarayıcıda işleniyor…",
    ready: "Arşiv yerel olarak yüklendi. Devam etmek için testi başlatın.",
    downloadNote: "Resmî Zenodo arşivi cihazınıza indirilir; ardından buradan seçin. Ağ hızı ve cihaz belleği eğitimi yavaşlatabilir.",
    method: "Kompakt evrişimli CNN · tabakalı 80/20 bölme · sabit tohum.",
    metrics: "EuroSAT test ölçümleri",
    accuracy: "Doğruluk",
    balanced: "Dengeli doğruluk",
    f1: "Makro F1",
    class: "Sınıf",
    precision: "Kesinlik",
    recall: "Duyarlılık",
    support: "Test örnekleri",
    confusion: "Karışıklık matrisi (satırlar: gerçek sınıf, sütunlar: tahmin)",
    actual: "Gerçek / tahmin",
    error: "CNN testi başarısız oldu.",
    invalidFile: "Resmî EuroSAT_RGB.zip arşivini seçin.",
    invalidSample: "Sınıf başına 20–150 örnek ve 1–10 dönem seçin.",
    license: "EuroSAT, MIT lisansı altında dağıtılır. Model RGB görüntü parçalarını sınıflandırır; AOI için coğrafi referanslı bir harita oluşturmaz.",
    progress: (current, total) => `Görüntüler çözümleniyor: ${current}/${total}`,
    epoch: (current, total, loss) => `Dönem ${current}/${total} · kayıp ${loss}`,
  },
  sv: {
    ...copy.en,
    title: "CNN · Datorseende med EuroSAT",
    description: "Klassificeringstest för Sentinel-2-bildutsnitt. Arkivet behandlas i webbläsaren och laddas inte upp till servern.",
    download: "Ladda ned EuroSAT RGB (94,7 MB)",
    choose: "Välj den nedladdade filen EuroSAT_RGB.zip",
    samples: "Exempel per klass",
    epochs: "Epoker",
    run: "Träna och utvärdera CNN i webbläsaren",
    running: "EuroSAT behandlas i webbläsaren…",
    ready: "Arkivet har lästs in lokalt. Starta testet för att fortsätta.",
    downloadNote: "Det officiella Zenodo-arkivet laddas ned till din enhet; välj det sedan här. Nätverkshastighet och enhetens minne kan göra träningen långsam.",
    method: "Kompakt faltnings-CNN · stratifierad 80/20-delning · fast startvärde.",
    metrics: "EuroSAT-testmått",
    accuracy: "Träffsäkerhet",
    balanced: "Balanserad träffsäkerhet",
    f1: "Makro-F1",
    class: "Klass",
    precision: "Precision",
    recall: "Återkallning",
    support: "Testexempel",
    confusion: "Förväxlingsmatris (rader: faktisk klass, kolumner: förutsagd klass)",
    actual: "Faktisk / förutsagd",
    error: "CNN-testet misslyckades.",
    invalidFile: "Välj det officiella arkivet EuroSAT_RGB.zip.",
    invalidSample: "Välj 20–150 exempel per klass och 1–10 epoker.",
    license: "EuroSAT distribueras under MIT-licensen. Modellen klassificerar RGB-bildutsnitt och skapar ingen georefererad AOI-karta.",
    progress: (current, total) => `Avkodar bilder: ${current}/${total}`,
    epoch: (current, total, loss) => `Epok ${current}/${total} · förlust ${loss}`,
  },
  da: {
    ...copy.en,
    title: "CNN · Computervision med EuroSAT",
    description: "Klassifikationstest af Sentinel-2-billedudsnit. Arkivet behandles i browseren og uploades ikke til serveren.",
    download: "Download EuroSAT RGB (94,7 MB)",
    choose: "Vælg den downloadede fil EuroSAT_RGB.zip",
    samples: "Eksempler pr. klasse",
    epochs: "Epoker",
    run: "Træn og evaluer CNN i browseren",
    running: "EuroSAT behandles i browseren…",
    ready: "Arkivet er indlæst lokalt. Start testen for at fortsætte.",
    downloadNote: "Det officielle Zenodo-arkiv downloades til din enhed; vælg det derefter her. Netværkshastighed og enhedens hukommelse kan gøre træningen langsom.",
    method: "Kompakt konvolutionelt CNN · stratificeret 80/20-opdeling · fast seed.",
    metrics: "EuroSAT-testmålinger",
    accuracy: "Nøjagtighed",
    balanced: "Balanceret nøjagtighed",
    f1: "Makro-F1",
    class: "Klasse",
    precision: "Præcision",
    recall: "Genkaldelse",
    support: "Testeksempler",
    confusion: "Forvekslingsmatrix (rækker: faktisk klasse, kolonner: forudsagt klasse)",
    actual: "Faktisk / forudsagt",
    error: "CNN-testen mislykkedes.",
    invalidFile: "Vælg det officielle arkiv EuroSAT_RGB.zip.",
    invalidSample: "Vælg 20–150 eksempler pr. klasse og 1–10 epoker.",
    license: "EuroSAT distribueres under MIT-licensen. Modellen klassificerer RGB-billedudsnit og opretter ikke et georefereret AOI-kort.",
    progress: (current, total) => `Afkoder billeder: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoke ${current}/${total} · tab ${loss}`,
  },
  no: {
    ...copy.en,
    title: "CNN · Datamaskinsyn med EuroSAT",
    description: "Klassifiseringstest av Sentinel-2-bildeutsnitt. Arkivet behandles i nettleseren og lastes ikke opp til serveren.",
    download: "Last ned EuroSAT RGB (94,7 MB)",
    choose: "Velg den nedlastede filen EuroSAT_RGB.zip",
    samples: "Eksempler per klasse",
    epochs: "Epoker",
    run: "Tren og evaluer CNN i nettleseren",
    running: "EuroSAT behandles i nettleseren…",
    ready: "Arkivet er lastet inn lokalt. Start testen for å fortsette.",
    downloadNote: "Det offisielle Zenodo-arkivet lastes ned til enheten din; velg det deretter her. Nettverkshastighet og enhetsminne kan gjøre treningen langsom.",
    method: "Kompakt konvolusjonelt CNN · stratifisert 80/20-deling · fast seed.",
    metrics: "EuroSAT-testmålinger",
    accuracy: "Nøyaktighet",
    balanced: "Balansert nøyaktighet",
    f1: "Makro-F1",
    class: "Klasse",
    precision: "Presisjon",
    recall: "Tilbakekalling",
    support: "Testeksempler",
    confusion: "Forvekslingsmatrise (rader: faktisk klasse, kolonner: predikert klasse)",
    actual: "Faktisk / predikert",
    error: "CNN-testen mislyktes.",
    invalidFile: "Velg det offisielle arkivet EuroSAT_RGB.zip.",
    invalidSample: "Velg 20–150 eksempler per klasse og 1–10 epoker.",
    license: "EuroSAT distribueres under MIT-lisensen. Modellen klassifiserer RGB-bildeutsnitt og lager ikke et georeferert AOI-kart.",
    progress: (current, total) => `Dekoder bilder: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoke ${current}/${total} · tap ${loss}`,
  },
  fi: {
    ...copy.en,
    title: "CNN · EuroSAT-konenäkö",
    description: "Sentinel-2-kuvaleikkeiden luokittelutesti. Arkisto käsitellään selaimessa eikä sitä ladata palvelimelle.",
    download: "Lataa EuroSAT RGB (94,7 Mt)",
    choose: "Valitse ladattu EuroSAT_RGB.zip-tiedosto",
    samples: "Näytteitä luokkaa kohti",
    epochs: "Epochit",
    run: "Kouluta ja arvioi CNN selaimessa",
    running: "EuroSAT käsitellään selaimessa…",
    ready: "Arkisto ladattu paikallisesti. Jatka käynnistämällä testi.",
    downloadNote: "Virallinen Zenodo-arkisto ladataan laitteellesi; valitse se sitten tästä. Verkon nopeus ja laitteen muisti voivat hidastaa koulutusta.",
    method: "Pienikokoinen konvoluutioneuroverkko · ositettu 80/20-jako · kiinteä siemen.",
    metrics: "EuroSAT-testin mittarit",
    accuracy: "Tarkkuus",
    balanced: "Tasapainotettu tarkkuus",
    f1: "Makro-F1",
    class: "Luokka",
    precision: "Täsmällisyys",
    recall: "Kattavuus",
    support: "Testinäytteet",
    confusion: "Virhematriisi (rivit: todellinen luokka, sarakkeet: ennustettu luokka)",
    actual: "Todellinen / ennustettu",
    error: "CNN-testi epäonnistui.",
    invalidFile: "Valitse virallinen EuroSAT_RGB.zip-arkisto.",
    invalidSample: "Valitse 20–150 näytettä luokkaa kohti ja 1–10 epochia.",
    license: "EuroSAT julkaistaan MIT-lisenssillä. Malli luokittelee RGB-kuvaleikkeitä eikä luo georeferoitua AOI-karttaa.",
    progress: (current, total) => `Kuvia puretaan: ${current}/${total}`,
    epoch: (current, total, loss) => `Epoch ${current}/${total} · häviö ${loss}`,
  },
  uk: {
    ...copy.en,
    title: "CNN · Комп’ютерний зір EuroSAT",
    description: "Тест класифікації фрагментів зображень Sentinel-2. Архів обробляється у браузері й не завантажується на сервер.",
    download: "Завантажити EuroSAT RGB (94,7 МБ)",
    choose: "Виберіть завантажений файл EuroSAT_RGB.zip",
    samples: "Вибірок на клас",
    epochs: "Епохи",
    run: "Навчити й оцінити CNN у браузері",
    running: "Браузер обробляє EuroSAT…",
    ready: "Архів завантажено на пристрій. Запустіть тест, щоб продовжити.",
    downloadNote: "Офіційний архів Zenodo буде завантажено на ваш пристрій; потім виберіть його тут. Швидкість мережі та пам’ять пристрою можуть сповільнити навчання.",
    method: "Компактна згорткова CNN · стратифікований поділ 80/20 · фіксоване початкове значення.",
    metrics: "Метрики тестування EuroSAT",
    accuracy: "Точність",
    balanced: "Збалансована точність",
    f1: "Макро F1",
    class: "Клас",
    precision: "Точність",
    recall: "Повнота",
    support: "Тестові вибірки",
    confusion: "Матриця помилок (рядки: справжній клас, стовпці: прогноз)",
    actual: "Справжній / прогнозований",
    error: "Не вдалося виконати тест CNN.",
    invalidFile: "Виберіть офіційний архів EuroSAT_RGB.zip.",
    invalidSample: "Виберіть від 20 до 150 вибірок на клас і від 1 до 10 епох.",
    license: "EuroSAT поширюється за ліцензією MIT. Модель класифікує RGB-фрагменти й не створює геоприв’язану карту AOI.",
    progress: (current, total) => `Декодування зображень: ${current}/${total}`,
    epoch: (current, total, loss) => `Епоха ${current}/${total} · помилка ${loss}`,
  },
  cs: {
    ...copy.en,
    title: "CNN · Počítačové vidění EuroSAT",
    description: "Test klasifikace výřezů snímků Sentinel-2. Archiv se zpracovává v prohlížeči a nenahrává se na server.",
    download: "Stáhnout EuroSAT RGB (94,7 MB)",
    choose: "Vybrat stažený soubor EuroSAT_RGB.zip",
    samples: "Vzorky na třídu",
    epochs: "Epochy",
    run: "Trénovat a vyhodnotit CNN v prohlížeči",
    running: "EuroSAT se zpracovává v prohlížeči…",
    ready: "Archiv je načten místně. Pokračujte spuštěním testu.",
    downloadNote: "Oficiální archiv Zenodo se stáhne do vašeho zařízení; potom jej vyberte zde. Rychlost sítě a paměť zařízení mohou trénování zpomalit.",
    method: "Kompaktní konvoluční CNN · stratifikované rozdělení 80/20 · pevný seed.",
    metrics: "Testovací metriky EuroSAT",
    accuracy: "Přesnost",
    balanced: "Vyvážená přesnost",
    f1: "Makro F1",
    class: "Třída",
    precision: "Preciznost",
    recall: "Úplnost",
    support: "Testovací vzorky",
    confusion: "Matice záměn (řádky: skutečná třída, sloupce: předpovězená třída)",
    actual: "Skutečná / předpovězená",
    error: "Test CNN se nezdařil.",
    invalidFile: "Vyberte oficiální archiv EuroSAT_RGB.zip.",
    invalidSample: "Zvolte 20 až 150 vzorků na třídu a 1 až 10 epoch.",
    license: "EuroSAT se šíří pod licencí MIT. Model klasifikuje výřezy RGB a nevytváří georeferencovanou mapu AOI.",
    progress: (current, total) => `Dekódování obrázků: ${current}/${total}`,
    epoch: (current, total, loss) => `Epocha ${current}/${total} · ztráta ${loss}`,
  },
};

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

async function decodeChip(bytes: Uint8Array, pixels: Float32Array, offset: number): Promise<void> {
  const blob = new Blob([bytes.slice().buffer]);
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas 2D non disponibile.");
    context.drawImage(bitmap, 0, 0, 64, 64);
    const image = context.getImageData(0, 0, 64, 64).data;
    for (let source = 0, target = offset; source < image.length; source += 4) {
      pixels[target] = image[source] / 255;
      pixels[target + 1] = image[source + 1] / 255;
      pixels[target + 2] = image[source + 2] / 255;
      target += 3;
    }
  } finally {
    bitmap.close();
  }
}

export function EuroSatCnn({ language }: { language: ReportLanguage | string }) {
  const reportLanguage = normalizeSentinelReportLanguage(language);
  const text = cnnCopy[reportLanguage] ?? cnnCopy.en;
  const [file, setFile] = useState<File | null>(null);
  const [samplesPerClass, setSamplesPerClass] = useState("50");
  const [epochs, setEpochs] = useState("5");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<CnnResult | null>(null);

  const run = async () => {
    setError("");
    setResult(null);
    const sampleLimit = Number(samplesPerClass);
    const epochCount = Number(epochs);
    if (!file || !file.name.toLowerCase().endsWith(".zip") || file.size > 120 * 1024 * 1024) {
      setError(text.invalidFile);
      return;
    }
    if (!Number.isInteger(sampleLimit) || sampleLimit < 20 || sampleLimit > 150
      || !Number.isInteger(epochCount) || epochCount < 1 || epochCount > 10) {
      setError(text.invalidSample);
      return;
    }

    setRunning(true);
    let tf: typeof import("@tensorflow/tfjs") | undefined;
    let model: import("@tensorflow/tfjs").Sequential | undefined;
    let trainingLabels: import("@tensorflow/tfjs").Tensor1D | undefined;
    let testLabels: import("@tensorflow/tfjs").Tensor1D | undefined;
    let trainX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let trainY: import("@tensorflow/tfjs").Tensor | undefined;
    let testX: import("@tensorflow/tfjs").Tensor4D | undefined;
    let predictions: import("@tensorflow/tfjs").Tensor | undefined;
    try {
      const { unzipSync } = await import("fflate");
      tf = await import("@tensorflow/tfjs");
      await tf.setBackend("cpu");
      await tf.ready();
      const zipBytes = new Uint8Array(await file.arrayBuffer());
      const selectedCounts = new Map(CLASS_NAMES.map((className) => [className, 0]));
      let selectedBytes = 0;
      const files = unzipSync(zipBytes, {
        filter: (entry) => {
          if (!entry.name.toLowerCase().endsWith(".jpg")) return false;
          const pathParts = entry.name.replace(/\\/g, "/").split("/");
          const className = CLASS_NAMES.find((name) => pathParts.includes(name));
          if (!className || (selectedCounts.get(className) ?? 0) >= sampleLimit) return false;
          if (entry.originalSize > 512 * 1024 || selectedBytes + entry.originalSize > 40 * 1024 * 1024) {
            throw new Error("Archivio EuroSAT non valido: dimensione dei campioni selezionati oltre il limite.");
          }
          selectedCounts.set(className, (selectedCounts.get(className) ?? 0) + 1);
          selectedBytes += entry.originalSize;
          return true;
        },
      });
      const entriesByClass = CLASS_NAMES.map((className) => {
        const matching = Object.entries(files)
          .filter(([path, bytes]) => path.toLowerCase().endsWith(".jpg")
            && path.replace(/\\/g, "/").split("/").includes(className)
            && bytes.length > 0)
          .map(([, bytes]) => bytes);
        if (matching.length < 20) throw new Error(`Dataset incompleto: immagini insufficienti per ${className}.`);
        return seededShuffle(matching, 2026 + CLASS_NAMES.indexOf(className)).slice(0, sampleLimit);
      });

      const trainingSamples: Array<{ bytes: Uint8Array; label: number }> = [];
      const testSamples: Array<{ bytes: Uint8Array; label: number }> = [];
      entriesByClass.forEach((entries, label) => {
        const shuffled = seededShuffle(entries, 783 + label);
        const testCount = Math.max(1, Math.floor(shuffled.length * 0.2));
        shuffled.slice(0, testCount).forEach((bytes) => testSamples.push({ bytes, label }));
        shuffled.slice(testCount).forEach((bytes) => trainingSamples.push({ bytes, label }));
      });
      const pixelCount = 64 * 64 * 3;
      const trainingPixels = new Float32Array(trainingSamples.length * pixelCount);
      const testPixels = new Float32Array(testSamples.length * pixelCount);
      for (let index = 0; index < trainingSamples.length; index += 1) {
        await decodeChip(trainingSamples[index].bytes, trainingPixels, index * pixelCount);
        if (index % 25 === 0) setProgress(text.progress(index + 1, trainingSamples.length + testSamples.length));
      }
      for (let index = 0; index < testSamples.length; index += 1) {
        await decodeChip(testSamples[index].bytes, testPixels, index * pixelCount);
        if (index % 25 === 0) setProgress(text.progress(trainingSamples.length + index + 1, trainingSamples.length + testSamples.length));
      }

      trainingLabels = tf.tensor1d(trainingSamples.map((sample) => sample.label), "int32");
      testLabels = tf.tensor1d(testSamples.map((sample) => sample.label), "int32");
      trainX = tf.tensor4d(trainingPixels, [trainingSamples.length, 64, 64, 3]);
      trainY = tf.oneHot(trainingLabels, CLASS_NAMES.length);
      testX = tf.tensor4d(testPixels, [testSamples.length, 64, 64, 3]);
      model = tf.sequential({
        layers: [
          tf.layers.conv2d({ inputShape: [64, 64, 3], filters: 16, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 32, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.maxPooling2d({ poolSize: 2 }),
          tf.layers.conv2d({ filters: 64, kernelSize: 3, padding: "same", activation: "relu" }),
          tf.layers.globalAveragePooling2d({}),
          tf.layers.dense({ units: 64, activation: "relu" }),
          tf.layers.dense({ units: CLASS_NAMES.length, activation: "softmax" }),
        ],
      });
      model.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] });
      await model.fit(trainX, trainY, {
        epochs: epochCount,
        batchSize: 16,
        shuffle: true,
        yieldEvery: "batch",
        callbacks: {
          onEpochEnd: (_epoch, logs) => {
            setProgress(text.epoch(_epoch + 1, epochCount, formatSentinelNumber(logs?.loss ?? 0, reportLanguage)));
          },
        },
      });

      const predictionOutput = model.predict(testX);
      if (Array.isArray(predictionOutput)) throw new Error("Il modello CNN ha restituito più output del previsto.");
      predictions = predictionOutput;
      const predictionLabels = predictions.argMax(1);
      const predicted = Array.from(await predictionLabels.data());
      predictionLabels.dispose();
      const actual = Array.from(await testLabels.data());
      const confusionMatrix = CLASS_NAMES.map(() => CLASS_NAMES.map(() => 0));
      predicted.forEach((label, index) => {
        confusionMatrix[actual[index]][label] += 1;
      });
      const perClass = CLASS_NAMES.map((name, classIndex) => {
        const truePositive = confusionMatrix[classIndex][classIndex];
        const support = confusionMatrix[classIndex].reduce((sum, value) => sum + value, 0);
        const predictedCount = confusionMatrix.reduce((sum, row) => sum + row[classIndex], 0);
        const precision = predictedCount ? truePositive / predictedCount : 0;
        const recall = support ? truePositive / support : 0;
        return {
          name,
          precision,
          recall,
          f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0,
          support,
        };
      });
      setResult({
        accuracy: predicted.reduce((sum, label, index) => sum + Number(label === actual[index]), 0) / actual.length,
        balancedAccuracy: perClass.reduce((sum, metric) => sum + metric.recall, 0) / perClass.length,
        macroF1: perClass.reduce((sum, metric) => sum + metric.f1, 0) / perClass.length,
        testCount: actual.length,
        classNames: CLASS_NAMES,
        confusionMatrix,
        perClass,
      });
      setProgress("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.error);
    } finally {
      predictions?.dispose();
      testX?.dispose();
      trainY?.dispose();
      trainX?.dispose();
      testLabels?.dispose();
      trainingLabels?.dispose();
      model?.dispose();
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{text.title}</CardTitle>
        <CardDescription>{text.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href={EURO_SAT_URL} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />{text.download}
            </a>
          </Button>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
            <Upload className="h-4 w-4" />{text.choose}
            <Input
              className="sr-only"
              type="file"
              accept=".zip,application/zip"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setResult(null);
                setError("");
              }}
            />
          </label>
          {file && <span className="self-center text-sm text-muted-foreground">{file.name}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{text.downloadNote}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            {text.samples}
            <Input type="number" min="20" max="150" step="10" value={samplesPerClass} onChange={(event) => setSamplesPerClass(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            {text.epochs}
            <Input type="number" min="1" max="10" value={epochs} onChange={(event) => setEpochs(event.target.value)} />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{text.method} {text.license}</p>
        {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
        {progress && <p aria-live="polite" className="text-sm text-muted-foreground">{progress}</p>}
        <Button onClick={run} disabled={running || !file}>
          {running ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{text.running}</> : <><Play className="mr-2 h-4 w-4" />{text.run}</>}
        </Button>
        {result && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                [text.accuracy, result.accuracy],
                [text.balanced, result.balancedAccuracy],
                [text.f1, result.macroF1],
                [text.support, result.testCount],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{typeof value === "number" && value <= 1 ? formatSentinelNumber(value, reportLanguage) : formatSentinelNumber(Number(value), reportLanguage, 0)}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr><th className="p-3">{text.class}</th><th className="p-3">{text.precision}</th><th className="p-3">{text.recall}</th><th className="p-3">{text.f1}</th><th className="p-3">{text.support}</th></tr>
                </thead>
                <tbody>
                  {result.perClass.map((metric) => (
                    <tr key={metric.name} className="border-t">
                      <td className="p-3">{metric.name}</td>
                      <td className="p-3">{formatSentinelNumber(metric.precision, reportLanguage)}</td>
                      <td className="p-3">{formatSentinelNumber(metric.recall, reportLanguage)}</td>
                      <td className="p-3">{formatSentinelNumber(metric.f1, reportLanguage)}</td>
                      <td className="p-3">{formatSentinelNumber(metric.support, reportLanguage, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section className="space-y-3">
              <h3 className="font-semibold">{text.confusion}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="text-xs">
                  <thead className="bg-muted/50">
                    <tr><th className="p-2 text-left">{text.actual}</th>{result.classNames.map((name) => <th key={name} className="min-w-16 p-2">{name}</th>)}</tr>
                  </thead>
                  <tbody>
                    {result.confusionMatrix.map((row, index) => (
                      <tr key={result.classNames[index]} className="border-t">
                        <th className="p-2 text-left">{result.classNames[index]}</th>
                        {row.map((count, column) => <td key={result.classNames[column]} className="p-2 text-center">{formatSentinelNumber(count, reportLanguage, 0)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
