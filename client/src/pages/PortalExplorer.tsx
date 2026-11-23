import { Compass, Database, Satellite, Search } from "lucide-react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { DataInsightSources } from "@/components/DataInsightSources";
import { OfficialDataAnalysis, OfficialDataCatalogs } from "@/components/OfficialDataAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  resolveAnalyticsReportLanguage,
  type AnalyticsReportLanguage,
} from "@/lib/analyticsReportPdf";

type PortalExplorerCopy = {
  title: string;
  description: string;
  label: string;
  intro: string;
  method: string;
  other: string;
  otherLink: string;
  source: string;
};

const copy: Record<AnalyticsReportLanguage, PortalExplorerCopy> = {
  it: {
    title: "Analisi dati",
    description: "Analizza serie storiche ufficiali, importa dataset e confronta dati con metodi statistici.",
    label: "Analisi statistica dei dati",
    intro: "Confronta serie storiche e fonti ufficiali, importa i tuoi dataset e calcola correlazioni, verifiche storiche e proiezioni esplorative.",
    method: "Il servizio esamina un massimo di 5 pagine HTML pubbliche per URL, segue solo collegamenti della stessa origine e non aggira login o protezioni. Le risorse non vengono scaricate automaticamente.",
    other: "Per classificazione satellitare e mappe tematiche usa l'assistente dedicato.",
    otherLink: "Vai al telerilevamento",
    source: "Fonti pubbliche, risultati verificabili",
  },
  en: {
    title: "Data analysis",
    description: "Analyze official time series, import datasets and compare data with statistical methods.",
    label: "Statistical data analysis",
    intro: "Compare official time series, import datasets, and calculate correlations, backtests, and exploratory projections.",
    method: "The service scans up to 5 public HTML pages per URL, follows same-origin links only, and does not bypass logins or protections. Resources are not downloaded automatically.",
    other: "For satellite classification and thematic maps, use the dedicated assistant.",
    otherLink: "Open remote sensing",
    source: "Public sources, verifiable results",
  },
  es: {
    title: "Análisis de datos",
    description: "Analiza series temporales oficiales, importa conjuntos de datos y compáralos con métodos estadísticos.",
    label: "Análisis estadístico de datos",
    intro: "Compara series temporales y fuentes oficiales, importa tus conjuntos de datos y calcula correlaciones, validaciones retrospectivas y proyecciones exploratorias.",
    method: "El servicio examina hasta 5 páginas HTML públicas por URL, solo sigue enlaces del mismo origen y no elude inicios de sesión ni protecciones. Los recursos no se descargan automáticamente.",
    other: "Para clasificar satélites y crear mapas temáticos, usa el asistente específico.",
    otherLink: "Abrir teledetección",
    source: "Fuentes públicas, resultados verificables",
  },
  fr: {
    title: "Analyse de données",
    description: "Analysez des séries temporelles officielles, importez des jeux de données et comparez-les avec des méthodes statistiques.",
    label: "Analyse statistique des données",
    intro: "Comparez des séries temporelles et des sources officielles, importez vos jeux de données et calculez des corrélations, des validations rétrospectives et des projections exploratoires.",
    method: "Le service examine jusqu’à 5 pages HTML publiques par URL, suit uniquement les liens de même origine et ne contourne ni connexion ni protection. Les ressources ne sont pas téléchargées automatiquement.",
    other: "Pour la classification satellitaire et les cartes thématiques, utilisez l’assistant dédié.",
    otherLink: "Ouvrir la télédétection",
    source: "Sources publiques, résultats vérifiables",
  },
  de: {
    title: "Datenanalyse",
    description: "Analysieren Sie offizielle Zeitreihen, importieren Sie Datensätze und vergleichen Sie Daten mit statistischen Methoden.",
    label: "Statistische Datenanalyse",
    intro: "Vergleichen Sie offizielle Zeitreihen und Quellen, importieren Sie eigene Datensätze und berechnen Sie Korrelationen, Rücktests und explorative Prognosen.",
    method: "Der Dienst untersucht bis zu 5 öffentliche HTML-Seiten pro URL, folgt nur Links derselben Herkunft und umgeht weder Anmeldungen noch Schutzmaßnahmen. Ressourcen werden nicht automatisch heruntergeladen.",
    other: "Für Satellitenklassifizierung und thematische Karten verwenden Sie den entsprechenden Assistenten.",
    otherLink: "Fernerkundung öffnen",
    source: "Öffentliche Quellen, überprüfbare Ergebnisse",
  },
  pt: {
    title: "Análise de dados",
    description: "Analise séries temporais oficiais, importe conjuntos de dados e compare-os com métodos estatísticos.",
    label: "Análise estatística de dados",
    intro: "Compare séries temporais e fontes oficiais, importe os seus conjuntos de dados e calcule correlações, validações retrospetivas e projeções exploratórias.",
    method: "O serviço examina até 5 páginas HTML públicas por URL, segue apenas ligações da mesma origem e não contorna autenticação nem proteções. Os recursos não são descarregados automaticamente.",
    other: "Para classificação por satélite e mapas temáticos, use o assistente dedicado.",
    otherLink: "Abrir deteção remota",
    source: "Fontes públicas, resultados verificáveis",
  },
  ru: {
    title: "Анализ данных",
    description: "Анализируйте официальные временные ряды, импортируйте наборы данных и сравнивайте их статистическими методами.",
    label: "Статистический анализ данных",
    intro: "Сравнивайте официальные временные ряды и источники, импортируйте наборы данных и рассчитывайте корреляции, ретроспективные проверки и исследовательские прогнозы.",
    method: "Сервис проверяет до 5 общедоступных HTML-страниц для каждого URL, переходит только по ссылкам того же источника и не обходит авторизацию или защиту. Ресурсы не загружаются автоматически.",
    other: "Для классификации спутниковых снимков и тематических карт используйте отдельный инструмент.",
    otherLink: "Открыть дистанционное зондирование",
    source: "Публичные источники, проверяемые результаты",
  },
  pl: {
    title: "Analiza danych",
    description: "Analizuj oficjalne szeregi czasowe, importuj zbiory danych i porównuj dane metodami statystycznymi.",
    label: "Statystyczna analiza danych",
    intro: "Porównuj oficjalne szeregi czasowe i źródła, importuj własne zbiory danych oraz obliczaj korelacje, testy historyczne i prognozy eksploracyjne.",
    method: "Usługa sprawdza maksymalnie 5 publicznych stron HTML dla każdego adresu URL, podąża tylko za linkami z tej samej domeny i nie omija logowania ani zabezpieczeń. Zasoby nie są pobierane automatycznie.",
    other: "Do klasyfikacji satelitarnej i map tematycznych użyj dedykowanego narzędzia.",
    otherLink: "Otwórz teledetekcję",
    source: "Publiczne źródła, weryfikowalne wyniki",
  },
  nl: {
    title: "Data-analyse",
    description: "Analyseer officiële tijdreeksen, importeer datasets en vergelijk gegevens met statistische methoden.",
    label: "Statistische data-analyse",
    intro: "Vergelijk officiële tijdreeksen en bronnen, importeer datasets en bereken correlaties, backtests en verkennende prognoses.",
    method: "De service bekijkt maximaal 5 openbare HTML-pagina’s per URL, volgt alleen links van dezelfde oorsprong en omzeilt geen aanmeldingen of beveiligingen. Bronnen worden niet automatisch gedownload.",
    other: "Gebruik de speciale assistent voor satellietclassificatie en thematische kaarten.",
    otherLink: "Teledetectie openen",
    source: "Openbare bronnen, controleerbare resultaten",
  },
  tr: {
    title: "Veri analizi",
    description: "Resmî zaman serilerini analiz edin, veri kümelerini içe aktarın ve istatistiksel yöntemlerle karşılaştırın.",
    label: "İstatistiksel veri analizi",
    intro: "Resmî zaman serilerini ve kaynakları karşılaştırın, veri kümelerinizi içe aktarın; korelasyonları, geçmişe dönük testleri ve keşif amaçlı projeksiyonları hesaplayın.",
    method: "Hizmet, URL başına en fazla 5 herkese açık HTML sayfasını tarar, yalnızca aynı kaynaktaki bağlantıları izler ve oturum açma ya da korumaları aşmaz. Kaynaklar otomatik olarak indirilmez.",
    other: "Uydu sınıflandırması ve tematik haritalar için özel asistanı kullanın.",
    otherLink: "Uzaktan algılamayı aç",
    source: "Herkese açık kaynaklar, doğrulanabilir sonuçlar",
  },
  sv: {
    title: "Dataanalys",
    description: "Analysera officiella tidsserier, importera datamängder och jämför data med statistiska metoder.",
    label: "Statistisk dataanalys",
    intro: "Jämför officiella tidsserier och källor, importera datamängder och beräkna korrelationer, historiska tester och utforskande prognoser.",
    method: "Tjänsten granskar högst 5 offentliga HTML-sidor per URL, följer endast länkar från samma ursprung och kringgår inte inloggning eller skydd. Resurser hämtas inte automatiskt.",
    other: "Använd den särskilda assistenten för satellitklassificering och tematiska kartor.",
    otherLink: "Öppna fjärranalys",
    source: "Offentliga källor, verifierbara resultat",
  },
  da: {
    title: "Dataanalyse",
    description: "Analysér officielle tidsserier, importér datasæt, og sammenlign data med statistiske metoder.",
    label: "Statistisk dataanalyse",
    intro: "Sammenlign officielle tidsserier og kilder, importér datasæt, og beregn korrelationer, historiske test og undersøgende fremskrivninger.",
    method: "Tjenesten gennemgår op til 5 offentlige HTML-sider pr. URL, følger kun links fra samme oprindelse og omgår ikke login eller beskyttelse. Ressourcer hentes ikke automatisk.",
    other: "Brug den dedikerede assistent til satellitklassifikation og tematiske kort.",
    otherLink: "Åbn fjernmåling",
    source: "Offentlige kilder, verificerbare resultater",
  },
  no: {
    title: "Dataanalyse",
    description: "Analyser offisielle tidsserier, importer datasett og sammenlign data med statistiske metoder.",
    label: "Statistisk dataanalyse",
    intro: "Sammenlign offisielle tidsserier og kilder, importer datasett og beregn korrelasjoner, historiske tester og utforskende framskrivinger.",
    method: "Tjenesten undersøker opptil 5 offentlige HTML-sider per URL, følger bare lenker fra samme opphav og omgår ikke innlogging eller beskyttelse. Ressurser lastes ikke ned automatisk.",
    other: "Bruk den egne assistenten for satellittklassifisering og tematiske kart.",
    otherLink: "Åpne fjernmåling",
    source: "Offentlige kilder, kontrollerbare resultater",
  },
  fi: {
    title: "Data-analyysi",
    description: "Analysoi virallisia aikasarjoja, tuo tietoaineistoja ja vertaile tietoja tilastollisin menetelmin.",
    label: "Tilastollinen data-analyysi",
    intro: "Vertaa virallisia aikasarjoja ja lähteitä, tuo tietoaineistoja ja laske korrelaatioita, takautuvia testejä ja tutkivia ennusteita.",
    method: "Palvelu tarkastaa enintään 5 julkista HTML-sivua URL-osoitetta kohden, seuraa vain saman alkuperän linkkejä eikä ohita kirjautumisia tai suojauksia. Resursseja ei ladata automaattisesti.",
    other: "Käytä satelliittiluokitukseen ja temaattisiin karttoihin tarkoitettua avustajaa.",
    otherLink: "Avaa kaukokartoitus",
    source: "Julkiset lähteet, tarkistettavat tulokset",
  },
  uk: {
    title: "Аналіз даних",
    description: "Аналізуйте офіційні часові ряди, імпортуйте набори даних і порівнюйте їх статистичними методами.",
    label: "Статистичний аналіз даних",
    intro: "Порівнюйте офіційні часові ряди й джерела, імпортуйте набори даних та обчислюйте кореляції, ретроспективні перевірки й дослідницькі прогнози.",
    method: "Сервіс перевіряє до 5 загальнодоступних HTML-сторінок для кожної URL-адреси, переходить лише за посиланнями того самого джерела й не обходить авторизацію чи захист. Ресурси не завантажуються автоматично.",
    other: "Для класифікації супутникових знімків і тематичних карт скористайтеся окремим інструментом.",
    otherLink: "Відкрити дистанційне зондування",
    source: "Публічні джерела, результати можна перевірити",
  },
  cs: {
    title: "Analýza dat",
    description: "Analyzujte oficiální časové řady, importujte datové sady a porovnávejte data statistickými metodami.",
    label: "Statistická analýza dat",
    intro: "Porovnávejte oficiální časové řady a zdroje, importujte datové sady a počítejte korelace, zpětné testy a průzkumné projekce.",
    method: "Služba pro každou adresu URL prohledá nejvýše 5 veřejných stránek HTML, sleduje pouze odkazy ze stejného původu a neobchází přihlášení ani ochranu. Zdroje se nestahují automaticky.",
    other: "Pro klasifikaci satelitních snímků a tematické mapy použijte specializovaného asistenta.",
    otherLink: "Otevřít dálkový průzkum",
    source: "Veřejné zdroje, ověřitelné výsledky",
  },
};

export default function PortalExplorer() {
  const { language } = useLanguage();
  const text = copy[resolveAnalyticsReportLanguage(language)];
  return (
    <main className="min-h-screen bg-background">
      <Seo title={`${text.title} | Tatik.space`} description={text.description} path="/analysis/portals" language={language} />
      <section className="border-b bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl px-4 py-14 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <Compass className="h-4 w-4 text-primary" /> {text.label}
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{text.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{text.intro}</p>
          <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>{text.method}</p>
          </div>
        </div>
      </section>
      <section className="container max-w-6xl space-y-8 px-4 py-10">
        <OfficialDataAnalysis />
        <DataInsightSources language={language} />
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <Satellite className="mt-1 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{text.other}</p>
              <p className="text-sm text-muted-foreground">{text.source}</p>
            </div>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/analysis/remote-sensing">
            <Search className="h-4 w-4" />{text.otherLink}
          </Link>
        </div>
        <OfficialDataCatalogs />
      </section>
    </main>
  );
}
