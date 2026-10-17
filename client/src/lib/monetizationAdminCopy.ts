import { translations } from '@/lib/i18n';

type MonetizationLanguage = keyof typeof translations;

type MonetizationAdminCopy = {
  loading: string;
  loadingDetails: string;
  loadError: string;
  loadDetailsError: string;
  daysInPeriod: string;
  refresh: string;
  celebration: string;
  discountUnlocked: string;
  applyDiscount: string;
  applyingDiscount: string;
  approvePaypalDiscount: string;
  discountApplyError: string;
  detailsTitle: string;
  devMode: string;
  selectActivity: string;
  addTest: string;
  adding: string;
  filterPlaceholder: string;
  quickFilter: string;
  sortBy: string;
  date: string;
  activity: string;
  ascending: string;
  descending: string;
  resultsSummary: string;
  noResults: string;
  bannerActivity: string;
  project: string;
  link: string;
  go: string;
  previous: string;
  pageSummary: string;
  next: string;
  defaultActivity: string;
};

export const monetizationAdminCopy: Record<MonetizationLanguage, MonetizationAdminCopy> = {
  en: {
    loading: 'Loading…', loadingDetails: 'Loading details…', loadError: 'Could not load progress.', loadDetailsError: 'Could not load interaction details.',
    daysInPeriod: 'days left in this period', refresh: 'Refresh', celebration: 'Congratulations! You unlocked the discount!',
    discountUnlocked: 'Discount unlocked', applyDiscount: 'Apply €2 discount', applyingDiscount: 'Applying…',
    approvePaypalDiscount: 'Approve the €2 bonus on PayPal', discountApplyError: 'Could not apply the bonus automatically. Please try again.',
    detailsTitle: 'Banner interactions (last 30 days)', devMode: 'Dev mode', selectActivity: 'Select activity…',
    addTest: 'Add test', adding: 'Adding…', filterPlaceholder: 'Filter by activity/banner', quickFilter: 'Quick filter:',
    sortBy: 'Sort by:', date: 'Date', activity: 'Activity', ascending: '↑ Ascending', descending: '↓ Descending',
    resultsSummary: 'Showing {from}–{to} of {total} results', noResults: 'No interactions recorded.',
    bannerActivity: 'Banner / activity', project: 'Project', link: 'Link', go: 'Open', previous: 'Previous',
    pageSummary: 'Page {page} of {total}', next: 'Next', defaultActivity: 'Item',
  },
  it: {
    loading: 'Caricamento…', loadingDetails: 'Caricamento dettagli…', loadError: 'Impossibile caricare l’avanzamento.', loadDetailsError: 'Impossibile caricare i dettagli delle interazioni.',
    daysInPeriod: 'giorni rimanenti nel periodo', refresh: 'Aggiorna', celebration: 'Complimenti! Hai sbloccato lo sconto!',
    discountUnlocked: 'Sconto sbloccato', applyDiscount: 'Applica lo sconto di 2 €', applyingDiscount: 'Applicazione…',
    approvePaypalDiscount: 'Approva il bonus di 2 € su PayPal', discountApplyError: 'Impossibile applicare automaticamente il bonus. Riprova.',
    detailsTitle: 'Interazioni con i banner (ultimi 30 giorni)', devMode: 'Modalità sviluppo', selectActivity: 'Seleziona attività…',
    addTest: 'Aggiungi test', adding: 'Aggiunta…', filterPlaceholder: 'Filtra per attività/banner', quickFilter: 'Filtro rapido:',
    sortBy: 'Ordina per:', date: 'Data', activity: 'Attività', ascending: '↑ Crescente', descending: '↓ Decrescente',
    resultsSummary: 'Visualizzati {from}–{to} di {total} risultati', noResults: 'Nessuna interazione registrata.',
    bannerActivity: 'Banner / attività', project: 'Progetto', link: 'Link', go: 'Apri', previous: 'Precedente',
    pageSummary: 'Pagina {page} di {total}', next: 'Successiva', defaultActivity: 'Elemento',
  },
  es: {
    loading: 'Cargando…', loadingDetails: 'Cargando detalles…', loadError: 'No se pudo cargar el progreso.', loadDetailsError: 'No se pudieron cargar los detalles de las interacciones.',
    daysInPeriod: 'días restantes del período', refresh: 'Actualizar', celebration: '¡Enhorabuena! Has desbloqueado el descuento.',
    discountUnlocked: 'Descuento desbloqueado', applyDiscount: 'Aplicar descuento de 2 €', applyingDiscount: 'Aplicando…',
    approvePaypalDiscount: 'Aprobar el bono de 2 € en PayPal', discountApplyError: 'No se pudo aplicar el bono automáticamente. Inténtalo de nuevo.',
    detailsTitle: 'Interacciones con banners (últimos 30 días)', devMode: 'Modo de desarrollo', selectActivity: 'Seleccionar actividad…',
    addTest: 'Añadir prueba', adding: 'Añadiendo…', filterPlaceholder: 'Filtrar por actividad/banner', quickFilter: 'Filtro rápido:',
    sortBy: 'Ordenar por:', date: 'Fecha', activity: 'Actividad', ascending: '↑ Ascendente', descending: '↓ Descendente',
    resultsSummary: 'Mostrando {from}–{to} de {total} resultados', noResults: 'No hay interacciones registradas.',
    bannerActivity: 'Banner / actividad', project: 'Proyecto', link: 'Enlace', go: 'Abrir', previous: 'Anterior',
    pageSummary: 'Página {page} de {total}', next: 'Siguiente', defaultActivity: 'Elemento',
  },
  fr: {
    loading: 'Chargement…', loadingDetails: 'Chargement des détails…', loadError: 'Impossible de charger la progression.', loadDetailsError: 'Impossible de charger le détail des interactions.',
    daysInPeriod: 'jours restants sur cette période', refresh: 'Actualiser', celebration: 'Félicitations ! Vous avez débloqué la remise !',
    discountUnlocked: 'Remise débloquée', applyDiscount: 'Appliquer la remise de 2 €', applyingDiscount: 'Application…',
    approvePaypalDiscount: 'Approuver le bonus de 2 € sur PayPal', discountApplyError: 'Impossible d’appliquer automatiquement le bonus. Réessayez.',
    detailsTitle: 'Interactions avec les bannières (30 derniers jours)', devMode: 'Mode développement', selectActivity: 'Sélectionner une activité…',
    addTest: 'Ajouter un test', adding: 'Ajout…', filterPlaceholder: 'Filtrer par activité/bannière', quickFilter: 'Filtre rapide :',
    sortBy: 'Trier par :', date: 'Date', activity: 'Activité', ascending: '↑ Croissant', descending: '↓ Décroissant',
    resultsSummary: 'Affichage de {from} à {to} sur {total} résultats', noResults: 'Aucune interaction enregistrée.',
    bannerActivity: 'Bannière / activité', project: 'Projet', link: 'Lien', go: 'Ouvrir', previous: 'Précédent',
    pageSummary: 'Page {page} sur {total}', next: 'Suivant', defaultActivity: 'Élément',
  },
  de: {
    loading: 'Wird geladen…', loadingDetails: 'Details werden geladen…', loadError: 'Fortschritt konnte nicht geladen werden.', loadDetailsError: 'Interaktionsdetails konnten nicht geladen werden.',
    daysInPeriod: 'verbleibende Tage in diesem Zeitraum', refresh: 'Aktualisieren', celebration: 'Glückwunsch! Du hast den Rabatt freigeschaltet!',
    discountUnlocked: 'Rabatt freigeschaltet', applyDiscount: '2-€-Rabatt anwenden', applyingDiscount: 'Wird angewendet…',
    approvePaypalDiscount: '2-€-Bonus bei PayPal bestätigen', discountApplyError: 'Der Bonus konnte nicht automatisch angewendet werden. Bitte erneut versuchen.',
    detailsTitle: 'Banner-Interaktionen (letzte 30 Tage)', devMode: 'Entwicklermodus', selectActivity: 'Aktivität auswählen…',
    addTest: 'Test hinzufügen', adding: 'Wird hinzugefügt…', filterPlaceholder: 'Nach Aktivität/Banner filtern', quickFilter: 'Schnellfilter:',
    sortBy: 'Sortieren nach:', date: 'Datum', activity: 'Aktivität', ascending: '↑ Aufsteigend', descending: '↓ Absteigend',
    resultsSummary: '{from}–{to} von {total} Ergebnissen', noResults: 'Keine Interaktionen erfasst.',
    bannerActivity: 'Banner / Aktivität', project: 'Projekt', link: 'Link', go: 'Öffnen', previous: 'Zurück',
    pageSummary: 'Seite {page} von {total}', next: 'Weiter', defaultActivity: 'Element',
  },
  pt: {
    loading: 'A carregar…', loadingDetails: 'A carregar detalhes…', loadError: 'Não foi possível carregar o progresso.', loadDetailsError: 'Não foi possível carregar os detalhes das interações.',
    daysInPeriod: 'dias restantes neste período', refresh: 'Atualizar', celebration: 'Parabéns! Desbloqueou o desconto!',
    discountUnlocked: 'Desconto desbloqueado', applyDiscount: 'Aplicar desconto de 2 €', applyingDiscount: 'A aplicar…',
    approvePaypalDiscount: 'Aprovar o bónus de 2 € no PayPal', discountApplyError: 'Não foi possível aplicar o bónus automaticamente. Tente novamente.',
    detailsTitle: 'Interações com banners (últimos 30 dias)', devMode: 'Modo de desenvolvimento', selectActivity: 'Selecionar atividade…',
    addTest: 'Adicionar teste', adding: 'A adicionar…', filterPlaceholder: 'Filtrar por atividade/banner', quickFilter: 'Filtro rápido:',
    sortBy: 'Ordenar por:', date: 'Data', activity: 'Atividade', ascending: '↑ Ascendente', descending: '↓ Descendente',
    resultsSummary: 'A mostrar {from}–{to} de {total} resultados', noResults: 'Nenhuma interação registada.',
    bannerActivity: 'Banner / atividade', project: 'Projeto', link: 'Ligação', go: 'Abrir', previous: 'Anterior',
    pageSummary: 'Página {page} de {total}', next: 'Seguinte', defaultActivity: 'Elemento',
  },
  ru: {
    loading: 'Загрузка…', loadingDetails: 'Загрузка сведений…', loadError: 'Не удалось загрузить прогресс.', loadDetailsError: 'Не удалось загрузить сведения о взаимодействиях.',
    daysInPeriod: 'дн. осталось в этом периоде', refresh: 'Обновить', celebration: 'Поздравляем! Вы открыли скидку!',
    discountUnlocked: 'Скидка открыта', applyDiscount: 'Применить скидку 2 €', applyingDiscount: 'Применение…',
    approvePaypalDiscount: 'Подтвердить бонус 2 € в PayPal', discountApplyError: 'Не удалось автоматически применить бонус. Повторите попытку.',
    detailsTitle: 'Взаимодействия с баннерами (за последние 30 дней)', devMode: 'Режим разработчика', selectActivity: 'Выберите действие…',
    addTest: 'Добавить тест', adding: 'Добавление…', filterPlaceholder: 'Фильтр по действию/баннеру', quickFilter: 'Быстрый фильтр:',
    sortBy: 'Сортировать по:', date: 'Дате', activity: 'Действию', ascending: '↑ По возрастанию', descending: '↓ По убыванию',
    resultsSummary: 'Показано {from}–{to} из {total} результатов', noResults: 'Взаимодействий не зарегистрировано.',
    bannerActivity: 'Баннер / действие', project: 'Проект', link: 'Ссылка', go: 'Открыть', previous: 'Назад',
    pageSummary: 'Страница {page} из {total}', next: 'Далее', defaultActivity: 'Элемент',
  },
  zh: {
    loading: '正在加载…', loadingDetails: '正在加载详情…', loadError: '无法加载进度。', loadDetailsError: '无法加载互动详情。',
    daysInPeriod: '本周期剩余天数', refresh: '刷新', celebration: '恭喜！您已解锁折扣！',
    discountUnlocked: '折扣已解锁', applyDiscount: '应用 2 欧元折扣', applyingDiscount: '正在应用…',
    approvePaypalDiscount: '在 PayPal 确认 2 欧元奖励', discountApplyError: '无法自动应用奖励，请重试。',
    detailsTitle: '横幅互动（最近 30 天）', devMode: '开发模式', selectActivity: '选择活动…',
    addTest: '添加测试', adding: '正在添加…', filterPlaceholder: '按活动/横幅筛选', quickFilter: '快速筛选：',
    sortBy: '排序方式：', date: '日期', activity: '活动', ascending: '↑ 升序', descending: '↓ 降序',
    resultsSummary: '显示第 {from}–{to} 条，共 {total} 条结果', noResults: '没有记录到互动。',
    bannerActivity: '横幅 / 活动', project: '项目', link: '链接', go: '打开', previous: '上一页',
    pageSummary: '第 {page} 页，共 {total} 页', next: '下一页', defaultActivity: '项目',
  },
  ja: {
    loading: '読み込み中…', loadingDetails: '詳細を読み込み中…', loadError: '進捗を読み込めませんでした。', loadDetailsError: '操作の詳細を読み込めませんでした。',
    daysInPeriod: 'この期間の残り日数', refresh: '更新', celebration: 'おめでとうございます！割引が解除されました。',
    discountUnlocked: '割引が解除されました', applyDiscount: '2 €の割引を適用', applyingDiscount: '適用中…',
    approvePaypalDiscount: 'PayPalで2 €のボーナスを承認', discountApplyError: 'ボーナスを自動で適用できませんでした。もう一度お試しください。',
    detailsTitle: 'バナー操作（過去30日間）', devMode: '開発モード', selectActivity: '操作を選択…',
    addTest: 'テストを追加', adding: '追加中…', filterPlaceholder: '操作/バナーで絞り込む', quickFilter: 'クイックフィルター：',
    sortBy: '並べ替え：', date: '日付', activity: '操作', ascending: '↑ 昇順', descending: '↓ 降順',
    resultsSummary: '{total} 件中 {from}～{to} 件を表示', noResults: '記録された操作はありません。',
    bannerActivity: 'バナー / 操作', project: 'プロジェクト', link: 'リンク', go: '開く', previous: '前へ',
    pageSummary: '{total} ページ中 {page} ページ', next: '次へ', defaultActivity: '項目',
  },
  ko: {
    loading: '불러오는 중…', loadingDetails: '세부 정보 불러오는 중…', loadError: '진행 상황을 불러오지 못했습니다.', loadDetailsError: '상호작용 세부 정보를 불러오지 못했습니다.',
    daysInPeriod: '이번 기간의 남은 일수', refresh: '새로 고침', celebration: '축하합니다! 할인이 잠금 해제되었습니다!',
    discountUnlocked: '할인 잠금 해제', applyDiscount: '2 € 할인 적용', applyingDiscount: '적용 중…',
    approvePaypalDiscount: 'PayPal에서 2 € 보너스 승인', discountApplyError: '보너스를 자동으로 적용하지 못했습니다. 다시 시도해 주세요.',
    detailsTitle: '배너 상호작용 (최근 30일)', devMode: '개발 모드', selectActivity: '활동 선택…',
    addTest: '테스트 추가', adding: '추가 중…', filterPlaceholder: '활동/배너로 필터링', quickFilter: '빠른 필터:',
    sortBy: '정렬 기준:', date: '날짜', activity: '활동', ascending: '↑ 오름차순', descending: '↓ 내림차순',
    resultsSummary: '전체 {total}개 중 {from}–{to}개 표시', noResults: '기록된 상호작용이 없습니다.',
    bannerActivity: '배너 / 활동', project: '프로젝트', link: '링크', go: '열기', previous: '이전',
    pageSummary: '전체 {total}페이지 중 {page}페이지', next: '다음', defaultActivity: '항목',
  },
  ar: {
    loading: 'جارٍ التحميل…', loadingDetails: 'جارٍ تحميل التفاصيل…', loadError: 'تعذّر تحميل التقدم.', loadDetailsError: 'تعذّر تحميل تفاصيل التفاعلات.',
    daysInPeriod: 'يومًا متبقيًا في هذه الفترة', refresh: 'تحديث', celebration: 'تهانينا! لقد فتحت الخصم!',
    discountUnlocked: 'تم فتح الخصم', applyDiscount: 'تطبيق خصم 2 €', applyingDiscount: 'جارٍ التطبيق…',
    approvePaypalDiscount: 'الموافقة على مكافأة 2 € عبر PayPal', discountApplyError: 'تعذر تطبيق المكافأة تلقائيًا. يُرجى المحاولة مرة أخرى.',
    detailsTitle: 'تفاعلات اللافتات (آخر 30 يومًا)', devMode: 'وضع التطوير', selectActivity: 'اختر نشاطًا…',
    addTest: 'إضافة اختبار', adding: 'جارٍ الإضافة…', filterPlaceholder: 'تصفية حسب النشاط/اللافتة', quickFilter: 'تصفية سريعة:',
    sortBy: 'ترتيب حسب:', date: 'التاريخ', activity: 'النشاط', ascending: '↑ تصاعديًا', descending: '↓ تنازليًا',
    resultsSummary: 'عرض {from}–{to} من إجمالي {total}', noResults: 'لا توجد تفاعلات مسجلة.',
    bannerActivity: 'اللافتة / النشاط', project: 'المشروع', link: 'الرابط', go: 'فتح', previous: 'السابق',
    pageSummary: 'الصفحة {page} من {total}', next: 'التالي', defaultActivity: 'عنصر',
  },
  hi: {
    loading: 'लोड हो रहा है…', loadingDetails: 'विवरण लोड हो रहा है…', loadError: 'प्रगति लोड नहीं हो सकी।', loadDetailsError: 'इंटरैक्शन विवरण लोड नहीं हो सके।',
    daysInPeriod: 'इस अवधि में शेष दिन', refresh: 'रीफ़्रेश करें', celebration: 'बधाई हो! आपने छूट अनलॉक कर ली है!',
    discountUnlocked: 'छूट अनलॉक हुई', applyDiscount: '€2 की छूट लागू करें', applyingDiscount: 'लागू हो रही है…',
    approvePaypalDiscount: 'PayPal पर €2 बोनस की पुष्टि करें', discountApplyError: 'बोनस अपने आप लागू नहीं हो सका। कृपया फिर कोशिश करें।',
    detailsTitle: 'बैनर इंटरैक्शन (पिछले 30 दिन)', devMode: 'डेवलपर मोड', selectActivity: 'गतिविधि चुनें…',
    addTest: 'टेस्ट जोड़ें', adding: 'जोड़ा जा रहा है…', filterPlaceholder: 'गतिविधि/बैनर से फ़िल्टर करें', quickFilter: 'त्वरित फ़िल्टर:',
    sortBy: 'क्रमबद्ध करें:', date: 'तारीख', activity: 'गतिविधि', ascending: '↑ आरोही', descending: '↓ अवरोही',
    resultsSummary: '{total} में से {from}–{to} दिखाए जा रहे हैं', noResults: 'कोई इंटरैक्शन दर्ज नहीं है।',
    bannerActivity: 'बैनर / गतिविधि', project: 'प्रोजेक्ट', link: 'लिंक', go: 'खोलें', previous: 'पिछला',
    pageSummary: '{total} में से पृष्ठ {page}', next: 'अगला', defaultActivity: 'आइटम',
  },
  pl: {
    loading: 'Ładowanie…', loadingDetails: 'Ładowanie szczegółów…', loadError: 'Nie udało się wczytać postępu.', loadDetailsError: 'Nie udało się wczytać szczegółów interakcji.',
    daysInPeriod: 'pozostałe dni w tym okresie', refresh: 'Odśwież', celebration: 'Gratulacje! Odblokowano zniżkę!',
    discountUnlocked: 'Zniżka odblokowana', applyDiscount: 'Zastosuj zniżkę 2 €', applyingDiscount: 'Stosowanie…',
    approvePaypalDiscount: 'Zatwierdź bonus 2 € w PayPal', discountApplyError: 'Nie udało się automatycznie zastosować bonusu. Spróbuj ponownie.',
    detailsTitle: 'Interakcje z banerami (ostatnie 30 dni)', devMode: 'Tryb deweloperski', selectActivity: 'Wybierz aktywność…',
    addTest: 'Dodaj test', adding: 'Dodawanie…', filterPlaceholder: 'Filtruj według aktywności/banera', quickFilter: 'Szybki filtr:',
    sortBy: 'Sortuj według:', date: 'Daty', activity: 'Aktywności', ascending: '↑ Rosnąco', descending: '↓ Malejąco',
    resultsSummary: 'Wyświetlanie {from}–{to} z {total} wyników', noResults: 'Brak zarejestrowanych interakcji.',
    bannerActivity: 'Baner / aktywność', project: 'Projekt', link: 'Link', go: 'Otwórz', previous: 'Poprzednia',
    pageSummary: 'Strona {page} z {total}', next: 'Następna', defaultActivity: 'Element',
  },
  nl: {
    loading: 'Laden…', loadingDetails: 'Details laden…', loadError: 'Voortgang laden is mislukt.', loadDetailsError: 'Interactiegegevens laden is mislukt.',
    daysInPeriod: 'resterende dagen in deze periode', refresh: 'Vernieuwen', celebration: 'Gefeliciteerd! Je hebt de korting ontgrendeld!',
    discountUnlocked: 'Korting ontgrendeld', applyDiscount: 'Korting van €2 toepassen', applyingDiscount: 'Toepassen…',
    approvePaypalDiscount: 'Bonus van €2 goedkeuren via PayPal', discountApplyError: 'De bonus kon niet automatisch worden toegepast. Probeer het opnieuw.',
    detailsTitle: 'Bannerinteracties (afgelopen 30 dagen)', devMode: 'Ontwikkelmodus', selectActivity: 'Activiteit selecteren…',
    addTest: 'Test toevoegen', adding: 'Toevoegen…', filterPlaceholder: 'Filteren op activiteit/banner', quickFilter: 'Snel filteren:',
    sortBy: 'Sorteren op:', date: 'Datum', activity: 'Activiteit', ascending: '↑ Oplopend', descending: '↓ Aflopend',
    resultsSummary: '{from}–{to} van {total} resultaten', noResults: 'Geen interacties geregistreerd.',
    bannerActivity: 'Banner / activiteit', project: 'Project', link: 'Link', go: 'Openen', previous: 'Vorige',
    pageSummary: 'Pagina {page} van {total}', next: 'Volgende', defaultActivity: 'Item',
  },
  tr: {
    loading: 'Yükleniyor…', loadingDetails: 'Ayrıntılar yükleniyor…', loadError: 'İlerleme yüklenemedi.', loadDetailsError: 'Etkileşim ayrıntıları yüklenemedi.',
    daysInPeriod: 'bu dönemde kalan gün', refresh: 'Yenile', celebration: 'Tebrikler! İndirimin kilidi açıldı!',
    discountUnlocked: 'İndirim açıldı', applyDiscount: '2 € indirimi uygula', applyingDiscount: 'Uygulanıyor…',
    approvePaypalDiscount: 'PayPal üzerinden 2 € bonusu onayla', discountApplyError: 'Bonus otomatik olarak uygulanamadı. Lütfen tekrar deneyin.',
    detailsTitle: 'Banner etkileşimleri (son 30 gün)', devMode: 'Geliştirici modu', selectActivity: 'Etkinlik seç…',
    addTest: 'Test ekle', adding: 'Ekleniyor…', filterPlaceholder: 'Etkinlik/banner ile filtrele', quickFilter: 'Hızlı filtre:',
    sortBy: 'Sıralama:', date: 'Tarih', activity: 'Etkinlik', ascending: '↑ Artan', descending: '↓ Azalan',
    resultsSummary: '{total} sonuçtan {from}–{to} gösteriliyor', noResults: 'Kaydedilmiş etkileşim yok.',
    bannerActivity: 'Banner / etkinlik', project: 'Proje', link: 'Bağlantı', go: 'Aç', previous: 'Önceki',
    pageSummary: '{total} sayfadan {page}. sayfa', next: 'Sonraki', defaultActivity: 'Öğe',
  },
  sv: {
    loading: 'Läser in…', loadingDetails: 'Läser in detaljer…', loadError: 'Det gick inte att läsa in förloppet.', loadDetailsError: 'Det gick inte att läsa in interaktionsdetaljer.',
    daysInPeriod: 'dagar kvar av perioden', refresh: 'Uppdatera', celebration: 'Grattis! Du har låst upp rabatten!',
    discountUnlocked: 'Rabatt upplåst', applyDiscount: 'Tillämpa rabatt på 2 €', applyingDiscount: 'Tillämpas…',
    approvePaypalDiscount: 'Godkänn bonusen på 2 € hos PayPal', discountApplyError: 'Bonusen kunde inte tillämpas automatiskt. Försök igen.',
    detailsTitle: 'Bannerinteraktioner (senaste 30 dagarna)', devMode: 'Utvecklarläge', selectActivity: 'Välj aktivitet…',
    addTest: 'Lägg till test', adding: 'Lägger till…', filterPlaceholder: 'Filtrera efter aktivitet/banner', quickFilter: 'Snabbfilter:',
    sortBy: 'Sortera efter:', date: 'Datum', activity: 'Aktivitet', ascending: '↑ Stigande', descending: '↓ Fallande',
    resultsSummary: 'Visar {from}–{to} av {total} resultat', noResults: 'Inga interaktioner har registrerats.',
    bannerActivity: 'Banner / aktivitet', project: 'Projekt', link: 'Länk', go: 'Öppna', previous: 'Föregående',
    pageSummary: 'Sida {page} av {total}', next: 'Nästa', defaultActivity: 'Objekt',
  },
  da: {
    loading: 'Indlæser…', loadingDetails: 'Indlæser detaljer…', loadError: 'Fremskridtet kunne ikke indlæses.', loadDetailsError: 'Interaktionsdetaljerne kunne ikke indlæses.',
    daysInPeriod: 'dage tilbage i perioden', refresh: 'Opdater', celebration: 'Tillykke! Du har låst op for rabatten!',
    discountUnlocked: 'Rabat låst op', applyDiscount: 'Anvend rabat på 2 €', applyingDiscount: 'Anvender…',
    approvePaypalDiscount: 'Godkend bonus på 2 € hos PayPal', discountApplyError: 'Bonussen kunne ikke anvendes automatisk. Prøv igen.',
    detailsTitle: 'Bannerinteraktioner (seneste 30 dage)', devMode: 'Udviklertilstand', selectActivity: 'Vælg aktivitet…',
    addTest: 'Tilføj test', adding: 'Tilføjer…', filterPlaceholder: 'Filtrer efter aktivitet/banner', quickFilter: 'Hurtigfilter:',
    sortBy: 'Sortér efter:', date: 'Dato', activity: 'Aktivitet', ascending: '↑ Stigende', descending: '↓ Faldende',
    resultsSummary: 'Viser {from}–{to} af {total} resultater', noResults: 'Ingen interaktioner registreret.',
    bannerActivity: 'Banner / aktivitet', project: 'Projekt', link: 'Link', go: 'Åbn', previous: 'Forrige',
    pageSummary: 'Side {page} af {total}', next: 'Næste', defaultActivity: 'Element',
  },
  no: {
    loading: 'Laster…', loadingDetails: 'Laster detaljer…', loadError: 'Kunne ikke laste fremdriften.', loadDetailsError: 'Kunne ikke laste interaksjonsdetaljene.',
    daysInPeriod: 'dager igjen av perioden', refresh: 'Oppdater', celebration: 'Gratulerer! Du har låst opp rabatten!',
    discountUnlocked: 'Rabatt låst opp', applyDiscount: 'Bruk rabatt på 2 €', applyingDiscount: 'Bruker…',
    approvePaypalDiscount: 'Godkjenn bonusen på 2 € hos PayPal', discountApplyError: 'Bonusen kunne ikke brukes automatisk. Prøv på nytt.',
    detailsTitle: 'Bannerinteraksjoner (siste 30 dager)', devMode: 'Utviklermodus', selectActivity: 'Velg aktivitet…',
    addTest: 'Legg til test', adding: 'Legger til…', filterPlaceholder: 'Filtrer etter aktivitet/banner', quickFilter: 'Hurtigfilter:',
    sortBy: 'Sorter etter:', date: 'Dato', activity: 'Aktivitet', ascending: '↑ Stigende', descending: '↓ Synkende',
    resultsSummary: 'Viser {from}–{to} av {total} resultater', noResults: 'Ingen interaksjoner registrert.',
    bannerActivity: 'Banner / aktivitet', project: 'Prosjekt', link: 'Lenke', go: 'Åpne', previous: 'Forrige',
    pageSummary: 'Side {page} av {total}', next: 'Neste', defaultActivity: 'Element',
  },
  fi: {
    loading: 'Ladataan…', loadingDetails: 'Ladataan tietoja…', loadError: 'Edistymistä ei voitu ladata.', loadDetailsError: 'Vuorovaikutustietoja ei voitu ladata.',
    daysInPeriod: 'päivää jäljellä tällä jaksolla', refresh: 'Päivitä', celebration: 'Onnittelut! Alennus on avattu!',
    discountUnlocked: 'Alennus avattu', applyDiscount: 'Käytä 2 €:n alennus', applyingDiscount: 'Käytetään…',
    approvePaypalDiscount: 'Hyväksy 2 €:n bonus PayPalissa', discountApplyError: 'Bonusta ei voitu käyttää automaattisesti. Yritä uudelleen.',
    detailsTitle: 'Bannerien vuorovaikutukset (viimeiset 30 päivää)', devMode: 'Kehittäjätila', selectActivity: 'Valitse toiminto…',
    addTest: 'Lisää testi', adding: 'Lisätään…', filterPlaceholder: 'Suodata toiminnon/bannerin mukaan', quickFilter: 'Pikasuodatus:',
    sortBy: 'Lajitteluperuste:', date: 'Päivämäärä', activity: 'Toiminto', ascending: '↑ Nouseva', descending: '↓ Laskeva',
    resultsSummary: 'Näytetään {from}–{to} / {total} tulosta', noResults: 'Vuorovaikutuksia ei ole kirjattu.',
    bannerActivity: 'Banneri / toiminto', project: 'Projekti', link: 'Linkki', go: 'Avaa', previous: 'Edellinen',
    pageSummary: 'Sivu {page} / {total}', next: 'Seuraava', defaultActivity: 'Kohde',
  },
  uk: {
    loading: 'Завантаження…', loadingDetails: 'Завантаження деталей…', loadError: 'Не вдалося завантажити прогрес.', loadDetailsError: 'Не вдалося завантажити дані про взаємодії.',
    daysInPeriod: 'дн. залишилося в цьому періоді', refresh: 'Оновити', celebration: 'Вітаємо! Ви розблокували знижку!',
    discountUnlocked: 'Знижку розблоковано', applyDiscount: 'Застосувати знижку 2 €', applyingDiscount: 'Застосування…',
    approvePaypalDiscount: 'Підтвердити бонус 2 € у PayPal', discountApplyError: 'Не вдалося автоматично застосувати бонус. Спробуйте ще раз.',
    detailsTitle: 'Взаємодії з банерами (за останні 30 днів)', devMode: 'Режим розробника', selectActivity: 'Виберіть дію…',
    addTest: 'Додати тест', adding: 'Додавання…', filterPlaceholder: 'Фільтр за дією/банером', quickFilter: 'Швидкий фільтр:',
    sortBy: 'Сортувати за:', date: 'Датою', activity: 'Дією', ascending: '↑ За зростанням', descending: '↓ За спаданням',
    resultsSummary: 'Показано {from}–{to} із {total} результатів', noResults: 'Взаємодій не зареєстровано.',
    bannerActivity: 'Банер / дія', project: 'Проєкт', link: 'Посилання', go: 'Відкрити', previous: 'Назад',
    pageSummary: 'Сторінка {page} із {total}', next: 'Далі', defaultActivity: 'Елемент',
  },
  cs: {
    loading: 'Načítání…', loadingDetails: 'Načítání podrobností…', loadError: 'Průběh se nepodařilo načíst.', loadDetailsError: 'Podrobnosti interakcí se nepodařilo načíst.',
    daysInPeriod: 'zbývající dny v tomto období', refresh: 'Obnovit', celebration: 'Gratulujeme! Sleva byla odemčena!',
    discountUnlocked: 'Sleva odemčena', applyDiscount: 'Uplatnit slevu 2 €', applyingDiscount: 'Uplatňování…',
    approvePaypalDiscount: 'Schválit bonus 2 € na PayPalu', discountApplyError: 'Bonus se nepodařilo automaticky uplatnit. Zkuste to znovu.',
    detailsTitle: 'Interakce s bannery (posledních 30 dní)', devMode: 'Vývojářský režim', selectActivity: 'Vyberte aktivitu…',
    addTest: 'Přidat test', adding: 'Přidávání…', filterPlaceholder: 'Filtrovat podle aktivity/banneru', quickFilter: 'Rychlý filtr:',
    sortBy: 'Řadit podle:', date: 'Data', activity: 'Aktivity', ascending: '↑ Vzestupně', descending: '↓ Sestupně',
    resultsSummary: 'Zobrazeno {from}–{to} z {total} výsledků', noResults: 'Nebyly zaznamenány žádné interakce.',
    bannerActivity: 'Banner / aktivita', project: 'Projekt', link: 'Odkaz', go: 'Otevřít', previous: 'Předchozí',
    pageSummary: 'Stránka {page} z {total}', next: 'Další', defaultActivity: 'Položka',
  },
};
