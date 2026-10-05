type BlogArticleCopy = {
  title: string;
  date: string;
  description: string;
};

type BlogPageCopy = {
  title: string;
  backToHome: string;
  heading: string;
  intro: string;
  readArticle: string;
  articles: [BlogArticleCopy, BlogArticleCopy, BlogArticleCopy, BlogArticleCopy];
};

export const blogPageCopy: Record<
  'en' | 'it' | 'es' | 'fr' | 'de' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'pl' | 'nl' | 'tr' | 'sv' | 'da' | 'no' | 'fi' | 'uk' | 'cs',
  BlogPageCopy
> = {
  en: {
    title: 'Blog',
    backToHome: 'Back to Home',
    heading: 'Updates & News',
    intro: 'Latest news about the platform and the development world',
    readArticle: 'Read Article',
    articles: [
      { title: 'New AI Features in the Editor', date: 'Published on January 15, 2026', description: "We've added new AI assistance capabilities to the editor that can help you write code faster and with fewer errors." },
      { title: 'Best Practices for Project Management', date: 'Published on January 8, 2026', description: 'How to better organize your projects to maximize productivity and facilitate collaboration.' },
      { title: 'Performance Optimization Guide', date: 'Published on January 1, 2026', description: 'Advanced techniques to improve the performance of your websites and applications developed with Tatik.space Pro.' },
      { title: 'Real-Time Collaboration: News 2026', date: 'Published on December 20, 2025', description: 'The new collaboration features we introduced to facilitate team work.' },
    ],
  },
  it: {
    title: 'Blog',
    backToHome: 'Torna alla Home',
    heading: 'Aggiornamenti e notizie',
    intro: 'Ultime novità sulla piattaforma e sul mondo dello sviluppo',
    readArticle: 'Leggi l’articolo',
    articles: [
      { title: 'Nuove funzionalità AI nell’editor', date: 'Pubblicato il 15 gennaio 2026', description: 'Abbiamo aggiunto nuove funzionalità di assistenza AI all’editor per aiutarti a scrivere codice più velocemente e con meno errori.' },
      { title: 'Buone pratiche per la gestione dei progetti', date: 'Pubblicato l’8 gennaio 2026', description: 'Come organizzare meglio i tuoi progetti per massimizzare la produttività e facilitare la collaborazione.' },
      { title: 'Guida all’ottimizzazione delle prestazioni', date: 'Pubblicato il 1º gennaio 2026', description: 'Tecniche avanzate per migliorare le prestazioni di siti web e applicazioni sviluppati con Tatik.space Pro.' },
      { title: 'Collaborazione in tempo reale: novità 2026', date: 'Pubblicato il 20 dicembre 2025', description: 'Le nuove funzionalità di collaborazione introdotte per facilitare il lavoro di squadra.' },
    ],
  },
  es: {
    title: 'Blog',
    backToHome: 'Volver al inicio',
    heading: 'Actualizaciones y noticias',
    intro: 'Últimas noticias sobre la plataforma y el mundo del desarrollo',
    readArticle: 'Leer artículo',
    articles: [
      { title: 'Nuevas funciones de IA en el editor', date: 'Publicado el 15 de enero de 2026', description: 'Hemos añadido nuevas funciones de asistencia de IA al editor para ayudarte a escribir código más rápido y con menos errores.' },
      { title: 'Buenas prácticas para la gestión de proyectos', date: 'Publicado el 8 de enero de 2026', description: 'Cómo organizar mejor tus proyectos para maximizar la productividad y facilitar la colaboración.' },
      { title: 'Guía de optimización del rendimiento', date: 'Publicado el 1 de enero de 2026', description: 'Técnicas avanzadas para mejorar el rendimiento de los sitios web y las aplicaciones desarrollados con Tatik.space Pro.' },
      { title: 'Colaboración en tiempo real: novedades de 2026', date: 'Publicado el 20 de diciembre de 2025', description: 'Las nuevas funciones de colaboración que hemos incorporado para facilitar el trabajo en equipo.' },
    ],
  },
  fr: {
    title: 'Blog',
    backToHome: 'Retour à l’accueil',
    heading: 'Mises à jour et actualités',
    intro: 'Dernières actualités sur la plateforme et le monde du développement',
    readArticle: 'Lire l’article',
    articles: [
      { title: 'Nouvelles fonctionnalités d’IA dans l’éditeur', date: 'Publié le 15 janvier 2026', description: 'Nous avons ajouté de nouvelles fonctionnalités d’assistance par IA à l’éditeur pour vous aider à écrire du code plus vite et avec moins d’erreurs.' },
      { title: 'Bonnes pratiques de gestion de projet', date: 'Publié le 8 janvier 2026', description: 'Comment mieux organiser vos projets pour maximiser la productivité et faciliter la collaboration.' },
      { title: 'Guide d’optimisation des performances', date: 'Publié le 1er janvier 2026', description: 'Techniques avancées pour améliorer les performances de vos sites web et applications développés avec Tatik.space Pro.' },
      { title: 'Collaboration en temps réel : actualités 2026', date: 'Publié le 20 décembre 2025', description: 'Les nouvelles fonctionnalités de collaboration que nous avons mises en place pour faciliter le travail d’équipe.' },
    ],
  },
  de: {
    title: 'Blog',
    backToHome: 'Zurück zur Startseite',
    heading: 'Updates und Neuigkeiten',
    intro: 'Neuigkeiten zur Plattform und aus der Welt der Entwicklung',
    readArticle: 'Artikel lesen',
    articles: [
      { title: 'Neue KI-Funktionen im Editor', date: 'Veröffentlicht am 15. Januar 2026', description: 'Wir haben den Editor um neue KI-Unterstützungsfunktionen erweitert, mit denen du schneller und mit weniger Fehlern programmieren kannst.' },
      { title: 'Bewährte Methoden für das Projektmanagement', date: 'Veröffentlicht am 8. Januar 2026', description: 'So organisierst du deine Projekte besser, um die Produktivität zu steigern und die Zusammenarbeit zu erleichtern.' },
      { title: 'Leitfaden zur Leistungsoptimierung', date: 'Veröffentlicht am 1. Januar 2026', description: 'Fortgeschrittene Techniken zur Leistungsverbesserung deiner mit Tatik.space Pro entwickelten Websites und Anwendungen.' },
      { title: 'Echtzeit-Zusammenarbeit: Neuigkeiten 2026', date: 'Veröffentlicht am 20. Dezember 2025', description: 'Die neuen Zusammenarbeitsfunktionen, die wir eingeführt haben, um die Teamarbeit zu erleichtern.' },
    ],
  },
  pt: {
    title: 'Blog',
    backToHome: 'Voltar ao início',
    heading: 'Atualizações e notícias',
    intro: 'Últimas notícias sobre a plataforma e o mundo do desenvolvimento',
    readArticle: 'Ler artigo',
    articles: [
      { title: 'Novos recursos de IA no editor', date: 'Publicado em 15 de janeiro de 2026', description: 'Adicionámos novos recursos de assistência de IA ao editor para ajudar a escrever código mais depressa e com menos erros.' },
      { title: 'Boas práticas de gestão de projetos', date: 'Publicado em 8 de janeiro de 2026', description: 'Como organizar melhor os seus projetos para maximizar a produtividade e facilitar a colaboração.' },
      { title: 'Guia de otimização do desempenho', date: 'Publicado em 1 de janeiro de 2026', description: 'Técnicas avançadas para melhorar o desempenho dos seus sites e aplicações desenvolvidos com Tatik.space Pro.' },
      { title: 'Colaboração em tempo real: novidades de 2026', date: 'Publicado em 20 de dezembro de 2025', description: 'Os novos recursos de colaboração que introduzimos para facilitar o trabalho em equipa.' },
    ],
  },
  ru: {
    title: 'Блог',
    backToHome: 'На главную',
    heading: 'Обновления и новости',
    intro: 'Последние новости о платформе и мире разработки',
    readArticle: 'Читать статью',
    articles: [
      { title: 'Новые функции ИИ в редакторе', date: 'Опубликовано 15 января 2026 года', description: 'Мы добавили в редактор новые возможности помощи ИИ, которые помогут писать код быстрее и с меньшим количеством ошибок.' },
      { title: 'Лучшие практики управления проектами', date: 'Опубликовано 8 января 2026 года', description: 'Как лучше организовать проекты, чтобы повысить продуктивность и упростить совместную работу.' },
      { title: 'Руководство по оптимизации производительности', date: 'Опубликовано 1 января 2026 года', description: 'Продвинутые методы повышения производительности сайтов и приложений, созданных с помощью Tatik.space Pro.' },
      { title: 'Совместная работа в реальном времени: новости 2026', date: 'Опубликовано 20 декабря 2025 года', description: 'Новые функции совместной работы, которые мы внедрили, чтобы упростить командную работу.' },
    ],
  },
  zh: {
    title: '博客',
    backToHome: '返回首页',
    heading: '更新与新闻',
    intro: '平台和开发领域的最新消息',
    readArticle: '阅读文章',
    articles: [
      { title: '编辑器中的全新 AI 功能', date: '发布于 2026 年 1 月 15 日', description: '我们为编辑器新增了 AI 辅助功能，帮助你更快地编写代码并减少错误。' },
      { title: '项目管理最佳实践', date: '发布于 2026 年 1 月 8 日', description: '了解如何更好地组织项目，以提高效率并促进协作。' },
      { title: '性能优化指南', date: '发布于 2026 年 1 月 1 日', description: '介绍提升使用 Tatik.space Pro 开发的网站和应用性能的进阶技巧。' },
      { title: '实时协作：2026 年新动态', date: '发布于 2025 年 12 月 20 日', description: '我们推出了新的协作功能，帮助团队更顺畅地合作。' },
    ],
  },
  ja: {
    title: 'ブログ',
    backToHome: 'ホームに戻る',
    heading: 'アップデートとニュース',
    intro: 'プラットフォームと開発分野の最新ニュース',
    readArticle: '記事を読む',
    articles: [
      { title: 'エディターに新しい AI 機能を追加', date: '2026年1月15日公開', description: 'エディターに新しい AI 支援機能を追加しました。コードをより速く、より少ないミスで書けるようサポートします。' },
      { title: 'プロジェクト管理のベストプラクティス', date: '2026年1月8日公開', description: '生産性を高め、共同作業を円滑にするためのプロジェクト整理方法をご紹介します。' },
      { title: 'パフォーマンス最適化ガイド', date: '2026年1月1日公開', description: 'Tatik.space Pro で開発したウェブサイトやアプリケーションのパフォーマンスを向上させる高度なテクニックを紹介します。' },
      { title: 'リアルタイム共同作業：2026年のニュース', date: '2025年12月20日公開', description: 'チームワークを円滑にするために導入した、新しい共同作業機能をご紹介します。' },
    ],
  },
  ko: {
    title: '블로그',
    backToHome: '홈으로 돌아가기',
    heading: '업데이트 및 소식',
    intro: '플랫폼과 개발 분야의 최신 소식',
    readArticle: '기사 읽기',
    articles: [
      { title: '에디터의 새로운 AI 기능', date: '2026년 1월 15일 게시', description: '에디터에 새로운 AI 지원 기능을 추가했습니다. 코드를 더 빠르고 오류를 줄여 작성할 수 있도록 도와줍니다.' },
      { title: '프로젝트 관리 모범 사례', date: '2026년 1월 8일 게시', description: '생산성을 높이고 협업을 원활하게 하기 위해 프로젝트를 더 효과적으로 정리하는 방법을 알아보세요.' },
      { title: '성능 최적화 가이드', date: '2026년 1월 1일 게시', description: 'Tatik.space Pro로 개발한 웹사이트와 애플리케이션의 성능을 개선하는 고급 기법을 소개합니다.' },
      { title: '실시간 협업: 2026년 소식', date: '2025년 12월 20일 게시', description: '팀워크를 원활하게 하기 위해 새롭게 도입한 협업 기능을 소개합니다.' },
    ],
  },
  ar: {
    title: 'المدونة',
    backToHome: 'العودة إلى الصفحة الرئيسية',
    heading: 'التحديثات والأخبار',
    intro: 'آخر الأخبار عن المنصة وعالم التطوير',
    readArticle: 'اقرأ المقال',
    articles: [
      { title: 'ميزات ذكاء اصطناعي جديدة في المحرر', date: 'نُشر في 15 يناير 2026', description: 'أضفنا إلى المحرر إمكانات جديدة للمساعدة بالذكاء الاصطناعي، لتتمكن من كتابة التعليمات البرمجية بسرعة أكبر وبأخطاء أقل.' },
      { title: 'أفضل ممارسات إدارة المشاريع', date: 'نُشر في 8 يناير 2026', description: 'كيفية تنظيم مشاريعك بشكل أفضل لزيادة الإنتاجية وتسهيل التعاون.' },
      { title: 'دليل تحسين الأداء', date: 'نُشر في 1 يناير 2026', description: 'تقنيات متقدمة لتحسين أداء مواقع الويب والتطبيقات المطوّرة باستخدام Tatik.space Pro.' },
      { title: 'التعاون في الوقت الفعلي: أخبار 2026', date: 'نُشر في 20 ديسمبر 2025', description: 'ميزات التعاون الجديدة التي قدمناها لتسهيل العمل الجماعي.' },
    ],
  },
  hi: {
    title: 'ब्लॉग',
    backToHome: 'होम पर वापस जाएँ',
    heading: 'अपडेट और समाचार',
    intro: 'प्लेटफ़ॉर्म और विकास जगत की नवीनतम खबरें',
    readArticle: 'लेख पढ़ें',
    articles: [
      { title: 'एडिटर में नई AI सुविधाएँ', date: '15 जनवरी 2026 को प्रकाशित', description: 'हमने एडिटर में AI सहायता की नई सुविधाएँ जोड़ी हैं, जो आपको तेज़ी से और कम त्रुटियों के साथ कोड लिखने में मदद करेंगी।' },
      { title: 'प्रोजेक्ट प्रबंधन के सर्वोत्तम तरीके', date: '8 जनवरी 2026 को प्रकाशित', description: 'उत्पादकता बढ़ाने और सहयोग को आसान बनाने के लिए अपने प्रोजेक्ट बेहतर ढंग से व्यवस्थित करने के तरीके।' },
      { title: 'प्रदर्शन अनुकूलन मार्गदर्शिका', date: '1 जनवरी 2026 को प्रकाशित', description: 'Tatik.space Pro से विकसित वेबसाइटों और एप्लिकेशन का प्रदर्शन बेहतर बनाने की उन्नत तकनीकें।' },
      { title: 'रीयल-टाइम सहयोग: 2026 की खबरें', date: '20 दिसंबर 2025 को प्रकाशित', description: 'टीमवर्क को आसान बनाने के लिए शुरू की गई नई सहयोग सुविधाएँ।' },
    ],
  },
  pl: {
    title: 'Blog',
    backToHome: 'Wróć do strony głównej',
    heading: 'Aktualizacje i wiadomości',
    intro: 'Najnowsze informacje o platformie i świecie programowania',
    readArticle: 'Czytaj artykuł',
    articles: [
      { title: 'Nowe funkcje AI w edytorze', date: 'Opublikowano 15 stycznia 2026', description: 'Dodaliśmy do edytora nowe funkcje pomocy AI, które ułatwiają szybsze pisanie kodu i ograniczają liczbę błędów.' },
      { title: 'Najlepsze praktyki zarządzania projektami', date: 'Opublikowano 8 stycznia 2026', description: 'Jak lepiej organizować projekty, aby zwiększyć produktywność i ułatwić współpracę.' },
      { title: 'Przewodnik po optymalizacji wydajności', date: 'Opublikowano 1 stycznia 2026', description: 'Zaawansowane techniki poprawiania wydajności stron i aplikacji tworzonych za pomocą Tatik.space Pro.' },
      { title: 'Współpraca w czasie rzeczywistym: nowości 2026', date: 'Opublikowano 20 grudnia 2025', description: 'Nowe funkcje współpracy, które wprowadziliśmy, aby ułatwić pracę zespołową.' },
    ],
  },
  nl: {
    title: 'Blog',
    backToHome: 'Terug naar home',
    heading: 'Updates en nieuws',
    intro: 'Het laatste nieuws over het platform en de wereld van ontwikkeling',
    readArticle: 'Artikel lezen',
    articles: [
      { title: 'Nieuwe AI-functies in de editor', date: 'Gepubliceerd op 15 januari 2026', description: 'We hebben nieuwe AI-ondersteuning aan de editor toegevoegd, zodat je sneller code kunt schrijven met minder fouten.' },
      { title: 'Best practices voor projectbeheer', date: 'Gepubliceerd op 8 januari 2026', description: 'Zo organiseer je projecten beter om de productiviteit te verhogen en samenwerking te vergemakkelijken.' },
      { title: 'Handleiding voor prestatieoptimalisatie', date: 'Gepubliceerd op 1 januari 2026', description: 'Geavanceerde technieken om de prestaties te verbeteren van websites en toepassingen die met Tatik.space Pro zijn ontwikkeld.' },
      { title: 'Realtime samenwerking: nieuws uit 2026', date: 'Gepubliceerd op 20 december 2025', description: 'De nieuwe samenwerkingsfuncties die we hebben geïntroduceerd om teamwork makkelijker te maken.' },
    ],
  },
  tr: {
    title: 'Blog',
    backToHome: 'Ana sayfaya dön',
    heading: 'Güncellemeler ve haberler',
    intro: 'Platform ve yazılım geliştirme dünyasından en son haberler',
    readArticle: 'Makaleyi oku',
    articles: [
      { title: 'Düzenleyicide yeni yapay zekâ özellikleri', date: '15 Ocak 2026 tarihinde yayımlandı', description: 'Düzenleyiciye, daha hızlı ve daha az hatayla kod yazmanıza yardımcı olacak yeni yapay zekâ destek özellikleri ekledik.' },
      { title: 'Proje yönetimi için en iyi uygulamalar', date: '8 Ocak 2026 tarihinde yayımlandı', description: 'Verimliliği artırmak ve iş birliğini kolaylaştırmak için projelerinizi daha iyi düzenleme yolları.' },
      { title: 'Performans optimizasyonu rehberi', date: '1 Ocak 2026 tarihinde yayımlandı', description: 'Tatik.space Pro ile geliştirilen web sitelerinin ve uygulamaların performansını artırmaya yönelik ileri teknikler.' },
      { title: 'Gerçek zamanlı iş birliği: 2026 haberleri', date: '20 Aralık 2025 tarihinde yayımlandı', description: 'Ekip çalışmasını kolaylaştırmak için kullanıma sunduğumuz yeni iş birliği özellikleri.' },
    ],
  },
  sv: {
    title: 'Blogg',
    backToHome: 'Tillbaka till startsidan',
    heading: 'Uppdateringar och nyheter',
    intro: 'Senaste nytt om plattformen och utvecklingsvärlden',
    readArticle: 'Läs artikeln',
    articles: [
      { title: 'Nya AI-funktioner i redigeraren', date: 'Publicerad 15 januari 2026', description: 'Vi har lagt till nya AI-funktioner i redigeraren som hjälper dig att skriva kod snabbare och med färre fel.' },
      { title: 'Bästa praxis för projekthantering', date: 'Publicerad 8 januari 2026', description: 'Så organiserar du dina projekt bättre för att maximera produktiviteten och underlätta samarbete.' },
      { title: 'Guide till prestandaoptimering', date: 'Publicerad 1 januari 2026', description: 'Avancerade tekniker för att förbättra prestandan hos webbplatser och appar som utvecklats med Tatik.space Pro.' },
      { title: 'Samarbete i realtid: nyheter 2026', date: 'Publicerad 20 december 2025', description: 'De nya samarbetsfunktionerna som vi har introducerat för att underlätta lagarbete.' },
    ],
  },
  da: {
    title: 'Blog',
    backToHome: 'Tilbage til forsiden',
    heading: 'Opdateringer og nyheder',
    intro: 'Seneste nyt om platformen og udviklingsverdenen',
    readArticle: 'Læs artiklen',
    articles: [
      { title: 'Nye AI-funktioner i editoren', date: 'Udgivet 15. januar 2026', description: 'Vi har tilføjet nye AI-hjælpefunktioner til editoren, som kan hjælpe dig med at skrive kode hurtigere og med færre fejl.' },
      { title: 'Bedste praksis for projektstyring', date: 'Udgivet 8. januar 2026', description: 'Sådan organiserer du dine projekter bedre for at øge produktiviteten og gøre samarbejdet lettere.' },
      { title: 'Guide til performanceoptimering', date: 'Udgivet 1. januar 2026', description: 'Avancerede teknikker til at forbedre ydeevnen på websites og apps udviklet med Tatik.space Pro.' },
      { title: 'Samarbejde i realtid: nyheder i 2026', date: 'Udgivet 20. december 2025', description: 'De nye samarbejdsfunktioner, vi har introduceret for at gøre teamwork lettere.' },
    ],
  },
  no: {
    title: 'Blogg',
    backToHome: 'Tilbake til forsiden',
    heading: 'Oppdateringer og nyheter',
    intro: 'Siste nytt om plattformen og utviklingsverdenen',
    readArticle: 'Les artikkelen',
    articles: [
      { title: 'Nye AI-funksjoner i editoren', date: 'Publisert 15. januar 2026', description: 'Vi har lagt til nye AI-funksjoner i editoren som kan hjelpe deg med å skrive kode raskere og med færre feil.' },
      { title: 'Beste praksis for prosjektstyring', date: 'Publisert 8. januar 2026', description: 'Slik organiserer du prosjektene bedre for å øke produktiviteten og gjøre samarbeid enklere.' },
      { title: 'Guide til ytelsesoptimalisering', date: 'Publisert 1. januar 2026', description: 'Avanserte teknikker for å forbedre ytelsen til nettsteder og apper utviklet med Tatik.space Pro.' },
      { title: 'Samarbeid i sanntid: nyheter i 2026', date: 'Publisert 20. desember 2025', description: 'De nye samarbeidsfunksjonene vi har innført for å gjøre teamarbeid enklere.' },
    ],
  },
  fi: {
    title: 'Blogi',
    backToHome: 'Takaisin etusivulle',
    heading: 'Päivitykset ja uutiset',
    intro: 'Alustan ja kehitysmaailman uusimmat uutiset',
    readArticle: 'Lue artikkeli',
    articles: [
      { title: 'Editorin uudet tekoälyominaisuudet', date: 'Julkaistu 15. tammikuuta 2026', description: 'Lisäsimme editoriin uusia tekoälyavusteisia toimintoja, joiden avulla voit kirjoittaa koodia nopeammin ja vähemmillä virheillä.' },
      { title: 'Projektinhallinnan parhaat käytännöt', date: 'Julkaistu 8. tammikuuta 2026', description: 'Näin järjestät projektisi paremmin tuottavuuden parantamiseksi ja yhteistyön helpottamiseksi.' },
      { title: 'Suorituskyvyn optimointiopas', date: 'Julkaistu 1. tammikuuta 2026', description: 'Edistyneitä tekniikoita Tatik.space Prolla kehitettyjen verkkosivustojen ja sovellusten suorituskyvyn parantamiseen.' },
      { title: 'Reaaliaikainen yhteistyö: vuoden 2026 uutiset', date: 'Julkaistu 20. joulukuuta 2025', description: 'Uudet yhteistyöominaisuudet, jotka otimme käyttöön helpottaaksemme tiimityötä.' },
    ],
  },
  uk: {
    title: 'Блог',
    backToHome: 'На головну',
    heading: 'Оновлення та новини',
    intro: 'Останні новини про платформу та світ розробки',
    readArticle: 'Читати статтю',
    articles: [
      { title: 'Нові функції ШІ в редакторі', date: 'Опубліковано 15 січня 2026 року', description: 'Ми додали до редактора нові можливості допомоги ШІ, які допоможуть писати код швидше та з меншою кількістю помилок.' },
      { title: 'Найкращі практики управління проєктами', date: 'Опубліковано 8 січня 2026 року', description: 'Як краще організувати проєкти, щоб підвищити продуктивність і полегшити співпрацю.' },
      { title: 'Посібник з оптимізації продуктивності', date: 'Опубліковано 1 січня 2026 року', description: 'Просунуті методи покращення продуктивності вебсайтів і застосунків, розроблених за допомогою Tatik.space Pro.' },
      { title: 'Співпраця в реальному часі: новини 2026', date: 'Опубліковано 20 грудня 2025 року', description: 'Нові функції співпраці, які ми запровадили, щоб полегшити командну роботу.' },
    ],
  },
  cs: {
    title: 'Blog',
    backToHome: 'Zpět na hlavní stránku',
    heading: 'Aktualizace a novinky',
    intro: 'Nejnovější zprávy o platformě a světě vývoje',
    readArticle: 'Číst článek',
    articles: [
      { title: 'Nové funkce AI v editoru', date: 'Zveřejněno 15. ledna 2026', description: 'Do editoru jsme přidali nové funkce asistence AI, které vám pomohou psát kód rychleji a s menším počtem chyb.' },
      { title: 'Osvědčené postupy pro řízení projektů', date: 'Zveřejněno 8. ledna 2026', description: 'Jak lépe organizovat projekty, zvýšit produktivitu a usnadnit spolupráci.' },
      { title: 'Průvodce optimalizací výkonu', date: 'Zveřejněno 1. ledna 2026', description: 'Pokročilé techniky pro zlepšení výkonu webů a aplikací vyvíjených pomocí Tatik.space Pro.' },
      { title: 'Spolupráce v reálném čase: novinky 2026', date: 'Zveřejněno 20. prosince 2025', description: 'Nové funkce pro spolupráci, které jsme zavedli, aby usnadnily týmovou práci.' },
    ],
  },
};
