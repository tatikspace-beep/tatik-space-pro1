export type CollaborationPageCopy = {
  title: string;
  backHome: string;
  demoNotice: string;
  demoTitle: string;
  tagline: string;
  offline: string;
  useOffline: string;
  connected: string;
  connecting: string;
  disconnected: string;
  connectionError: string;
  connectingMessage: string;
  connectionFailed: string;
  checkServer: string;
  retry: string;
  project: string;
  offlineProjectName: string;
  offlineSystemMessage: string;
  online: string;
  members: string;
  membersLabel: string;
  owner: string;
  editorRole: string;
  viewerRole: string;
  messages: string;
  linkActive: string;
  team: string;
  teamDescription: string;
  chat: string;
  chatDescription: string;
  sharing: string;
  sharingDescription: string;
  security: string;
  securityDescription: string;
  teamTab: string;
  chatTab: string;
  shareTab: string;
  securityTab: string;
  loadingProject: string;
  quickStart: string;
  quickStartDescription: string;
  openEditor: string;
  securityTitle: string;
  securityNotice: string;
  teamManagement: string;
  inviteEmail: string;
  role: string;
  invite: string;
  sending: string;
  inviteAdded: string;
  setViewer: string;
  setEditor: string;
  remove: string;
  close: string;
  chatRealtime: string;
  writeMessage: string;
  send: string;
  projectShare: string;
  shareLinkDescription: string;
  copy: string;
  linkUnavailable: string;
};

export const collaborationPageCopy: Record<string, CollaborationPageCopy> = {
  en: {
    title: "Collaboration", backHome: "Back to Home", demoNotice: "This is an isolated demo using a sample project and demo user. It is not connected to your account, projects, or real team. Do not invite collaborators or share production or personal data here.",
    demoTitle: "Collaboration demo", tagline: "Explore sample team, chat, and sharing screens. This demo is not connected to your real projects.",
    offline: "Offline mode", useOffline: "Use offline mode", connected: "Connected", connecting: "Connecting…", disconnected: "Disconnected", connectionError: "Connection error",
    connectingMessage: "Connecting to the collaboration demo…", connectionFailed: "Could not connect", checkServer: "Check that the demo server is running", retry: "Retry",
    project: "Demo project", offlineProjectName: "Offline demo project", offlineSystemMessage: "You opened offline mode. No external connection is required.", online: "online", members: "members", membersLabel: "members", owner: "Owner", editorRole: "Editor", viewerRole: "Viewer", messages: "messages", linkActive: "Demo link available",
    team: "Sample team", teamDescription: "Preview member roles in this isolated demo", chat: "Sample chat", chatDescription: "Preview demo messages",
    sharing: "Sample sharing", sharingDescription: "Preview a demo sharing link", security: "Demo limitations", securityDescription: "Review privacy and security limitations",
    teamTab: "Team", chatTab: "Chat", shareTab: "Sharing", securityTab: "Limitations", loadingProject: "Loading demo project…",
    quickStart: "Want to get started?", quickStartDescription: "The collaboration controls on this page are a demo and do not connect to your actual projects or team.",
    openEditor: "Open the editor", securityTitle: "Demo privacy and security", securityNotice: "This demo uses a sample project and in-memory data. It does not demonstrate or guarantee encryption, access controls, audit logs, or production security. Do not enter real personal, confidential, or production data.",
    teamManagement: "Demo team", inviteEmail: "Email address (demo only)", role: "Role", invite: "Add to demo", sending: "Adding…",
    inviteAdded: "Demo invitation added for {email}", setViewer: "Set as viewer", setEditor: "Set as editor", remove: "Remove from demo", close: "Close",
    chatRealtime: "Demo conversation", writeMessage: "Write a demo message…", send: "Send",
    projectShare: "Demo project sharing", shareLinkDescription: "This sample link is not for real project access.", copy: "Copy", linkUnavailable: "No demo link available",
  },
  it: {
    title: "Collaborazione", backHome: "Torna alla Home", demoNotice: "Questa è una demo isolata con un progetto e un utente di esempio. Non è collegata al tuo account, ai tuoi progetti o al tuo team reale. Non invitare collaboratori né condividere dati personali o di produzione.",
    demoTitle: "Demo collaborazione", tagline: "Esplora le schermate dimostrative di team, chat e condivisione. Questa demo non è collegata ai tuoi progetti reali.",
    offline: "Modalità offline", useOffline: "Usa la modalità offline", connected: "Connesso", connecting: "Connessione…", disconnected: "Disconnesso", connectionError: "Errore di connessione",
    connectingMessage: "Connessione alla demo di collaborazione…", connectionFailed: "Impossibile connettersi", checkServer: "Verifica che il server demo sia in esecuzione", retry: "Riprova",
    project: "Progetto demo", offlineProjectName: "Progetto demo offline", offlineSystemMessage: "Hai aperto la modalità offline. Non è necessaria alcuna connessione esterna.", online: "online", members: "membri", membersLabel: "membri", owner: "Proprietario", editorRole: "Editor", viewerRole: "Visualizzatore", messages: "messaggi", linkActive: "Link demo disponibile",
    team: "Team demo", teamDescription: "Anteprima dei ruoli dei membri in questa demo isolata", chat: "Chat demo", chatDescription: "Anteprima dei messaggi dimostrativi",
    sharing: "Condivisione demo", sharingDescription: "Anteprima di un link dimostrativo", security: "Limiti della demo", securityDescription: "Consulta i limiti di privacy e sicurezza",
    teamTab: "Team", chatTab: "Chat", shareTab: "Condivisione", securityTab: "Limiti", loadingProject: "Caricamento del progetto demo…",
    quickStart: "Vuoi iniziare?", quickStartDescription: "I controlli di collaborazione in questa pagina sono una demo e non si collegano ai tuoi progetti o al tuo team reale.",
    openEditor: "Apri l’editor", securityTitle: "Privacy e sicurezza della demo", securityNotice: "Questa demo usa un progetto di esempio e dati conservati temporaneamente in memoria. Non dimostra né garantisce cifratura, controlli di accesso, registri delle attività o sicurezza per la produzione. Non inserire dati personali reali, riservati o di produzione.",
    teamManagement: "Team demo", inviteEmail: "Indirizzo email (solo demo)", role: "Ruolo", invite: "Aggiungi alla demo", sending: "Aggiunta…",
    inviteAdded: "Invito demo aggiunto per {email}", setViewer: "Imposta come visualizzatore", setEditor: "Imposta come editor", remove: "Rimuovi dalla demo", close: "Chiudi",
    chatRealtime: "Conversazione demo", writeMessage: "Scrivi un messaggio demo…", send: "Invia",
    projectShare: "Condivisione progetto demo", shareLinkDescription: "Questo link di esempio non consente di accedere a progetti reali.", copy: "Copia", linkUnavailable: "Nessun link demo disponibile",
  },
  es: {
    title: "Colaboración", backHome: "Volver al inicio", demoNotice: "Esta es una demo aislada con un proyecto y un usuario de ejemplo. No está conectada a tu cuenta, tus proyectos ni tu equipo real. No invites colaboradores ni compartas datos personales o de producción.",
    demoTitle: "Demo de colaboración", tagline: "Explora pantallas de ejemplo de equipo, chat y uso compartido. Esta demo no está conectada a tus proyectos reales.",
    offline: "Modo sin conexión", useOffline: "Usar modo sin conexión", connected: "Conectado", connecting: "Conectando…", disconnected: "Desconectado", connectionError: "Error de conexión",
    connectingMessage: "Conectando con la demo de colaboración…", connectionFailed: "No se pudo conectar", checkServer: "Comprueba que el servidor de la demo esté en ejecución", retry: "Reintentar",
    project: "Proyecto de demo", offlineProjectName: "Proyecto de demo sin conexión", offlineSystemMessage: "Has abierto el modo sin conexión. No se necesita ninguna conexión externa.", online: "en línea", members: "miembros", membersLabel: "miembros", owner: "Propietario", editorRole: "Editor", viewerRole: "Lector", messages: "mensajes", linkActive: "Enlace de demo disponible",
    team: "Equipo de ejemplo", teamDescription: "Vista previa de los roles en esta demo aislada", chat: "Chat de ejemplo", chatDescription: "Vista previa de mensajes de la demo",
    sharing: "Uso compartido de ejemplo", sharingDescription: "Vista previa de un enlace de demo", security: "Limitaciones de la demo", securityDescription: "Consulta las limitaciones de privacidad y seguridad",
    teamTab: "Equipo", chatTab: "Chat", shareTab: "Compartir", securityTab: "Limitaciones", loadingProject: "Cargando el proyecto de demo…",
    quickStart: "¿Quieres empezar?", quickStartDescription: "Los controles de colaboración de esta página son una demo y no se conectan a tus proyectos ni a tu equipo real.",
    openEditor: "Abrir el editor", securityTitle: "Privacidad y seguridad de la demo", securityNotice: "Esta demo utiliza un proyecto de ejemplo y datos en memoria. No demuestra ni garantiza cifrado, controles de acceso, registros de actividad ni seguridad de producción. No introduzcas datos personales reales, confidenciales o de producción.",
    teamManagement: "Equipo de demo", inviteEmail: "Correo electrónico (solo para la demo)", role: "Rol", invite: "Añadir a la demo", sending: "Añadiendo…",
    inviteAdded: "Invitación de demo añadida para {email}", setViewer: "Establecer como lector", setEditor: "Establecer como editor", remove: "Quitar de la demo", close: "Cerrar",
    chatRealtime: "Conversación de demo", writeMessage: "Escribe un mensaje de demo…", send: "Enviar",
    projectShare: "Compartir proyecto de demo", shareLinkDescription: "Este enlace de ejemplo no permite acceder a proyectos reales.", copy: "Copiar", linkUnavailable: "No hay ningún enlace de demo disponible",
  },
  fr: {
    title: "Collaboration", backHome: "Retour à l’accueil", demoNotice: "Cette démonstration isolée utilise un projet et un utilisateur fictifs. Elle n’est pas reliée à votre compte, à vos projets ni à votre véritable équipe. N’invitez pas de collaborateurs et ne partagez aucune donnée personnelle ou de production.",
    demoTitle: "Démo de collaboration", tagline: "Découvrez des exemples d’écrans d’équipe, de chat et de partage. Cette démo n’est pas reliée à vos projets réels.",
    offline: "Mode hors ligne", useOffline: "Utiliser le mode hors ligne", connected: "Connecté", connecting: "Connexion…", disconnected: "Déconnecté", connectionError: "Erreur de connexion",
    connectingMessage: "Connexion à la démo de collaboration…", connectionFailed: "Connexion impossible", checkServer: "Vérifiez que le serveur de démonstration est démarré", retry: "Réessayer",
    project: "Projet de démonstration", offlineProjectName: "Projet de démo hors ligne", offlineSystemMessage: "Vous avez activé le mode hors ligne. Aucune connexion externe n’est nécessaire.", online: "en ligne", members: "membres", membersLabel: "membres", owner: "Propriétaire", editorRole: "Éditeur", viewerRole: "Lecteur", messages: "messages", linkActive: "Lien de démonstration disponible",
    team: "Équipe de démonstration", teamDescription: "Aperçu des rôles dans cette démo isolée", chat: "Chat de démonstration", chatDescription: "Aperçu des messages de démonstration",
    sharing: "Partage de démonstration", sharingDescription: "Aperçu d’un lien de démonstration", security: "Limites de la démo", securityDescription: "Consultez les limites de confidentialité et de sécurité",
    teamTab: "Équipe", chatTab: "Chat", shareTab: "Partage", securityTab: "Limites", loadingProject: "Chargement du projet de démonstration…",
    quickStart: "Envie de commencer ?", quickStartDescription: "Les commandes de collaboration de cette page sont une démo et ne sont pas reliées à vos projets ni à votre véritable équipe.",
    openEditor: "Ouvrir l’éditeur", securityTitle: "Confidentialité et sécurité de la démo", securityNotice: "Cette démo utilise un projet fictif et des données conservées en mémoire. Elle ne démontre ni ne garantit le chiffrement, les contrôles d’accès, les journaux d’activité ou la sécurité en production. N’y saisissez aucune donnée personnelle réelle, confidentielle ou de production.",
    teamManagement: "Équipe de démo", inviteEmail: "Adresse e-mail (démo uniquement)", role: "Rôle", invite: "Ajouter à la démo", sending: "Ajout…",
    inviteAdded: "Invitation de démo ajoutée pour {email}", setViewer: "Définir comme lecteur", setEditor: "Définir comme éditeur", remove: "Retirer de la démo", close: "Fermer",
    chatRealtime: "Conversation de démonstration", writeMessage: "Écrire un message de démo…", send: "Envoyer",
    projectShare: "Partage du projet de démo", shareLinkDescription: "Ce lien fictif ne donne pas accès à de vrais projets.", copy: "Copier", linkUnavailable: "Aucun lien de démonstration disponible",
  },
  de: {
    title: "Zusammenarbeit", backHome: "Zurück zur Startseite", demoNotice: "Dies ist eine isolierte Demo mit einem Beispielprojekt und einem Demo-Benutzer. Sie ist nicht mit deinem Konto, deinen Projekten oder deinem echten Team verbunden. Lade hier keine Mitarbeitenden ein und teile keine persönlichen oder produktiven Daten.",
    demoTitle: "Zusammenarbeitsdemo", tagline: "Entdecke beispielhafte Team-, Chat- und Freigabeansichten. Diese Demo ist nicht mit deinen echten Projekten verbunden.",
    offline: "Offline-Modus", useOffline: "Offline-Modus verwenden", connected: "Verbunden", connecting: "Verbindung wird hergestellt…", disconnected: "Getrennt", connectionError: "Verbindungsfehler",
    connectingMessage: "Verbindung zur Zusammenarbeitsdemo…", connectionFailed: "Verbindung fehlgeschlagen", checkServer: "Prüfe, ob der Demo-Server läuft", retry: "Erneut versuchen",
    project: "Demoprojekt", offlineProjectName: "Offline-Demoprojekt", offlineSystemMessage: "Du hast den Offlinemodus geöffnet. Es ist keine externe Verbindung erforderlich.", online: "online", members: "Mitglieder", membersLabel: "Mitglieder", owner: "Eigentümer", editorRole: "Editor", viewerRole: "Betrachter", messages: "Nachrichten", linkActive: "Demolink verfügbar",
    team: "Demoteam", teamDescription: "Mitgliederrollen in dieser isolierten Demo ansehen", chat: "Demo-Chat", chatDescription: "Demonstrationsnachrichten ansehen",
    sharing: "Demofreigabe", sharingDescription: "Einen Demofreigabelink ansehen", security: "Demo-Einschränkungen", securityDescription: "Datenschutz- und Sicherheitseinschränkungen ansehen",
    teamTab: "Team", chatTab: "Chat", shareTab: "Freigabe", securityTab: "Einschränkungen", loadingProject: "Demoprojekt wird geladen…",
    quickStart: "Möchtest du loslegen?", quickStartDescription: "Die Zusammenarbeitsfunktionen auf dieser Seite sind eine Demo und nicht mit deinen echten Projekten oder deinem Team verbunden.",
    openEditor: "Editor öffnen", securityTitle: "Datenschutz und Sicherheit der Demo", securityNotice: "Diese Demo verwendet ein Beispielprojekt und Daten im Arbeitsspeicher. Sie demonstriert oder garantiert weder Verschlüsselung noch Zugriffskontrollen, Aktivitätsprotokolle oder Produktionssicherheit. Gib keine echten persönlichen, vertraulichen oder produktiven Daten ein.",
    teamManagement: "Demoteam", inviteEmail: "E-Mail-Adresse (nur Demo)", role: "Rolle", invite: "Zur Demo hinzufügen", sending: "Wird hinzugefügt…",
    inviteAdded: "Demo-Einladung für {email} hinzugefügt", setViewer: "Als Betrachter festlegen", setEditor: "Als Editor festlegen", remove: "Aus der Demo entfernen", close: "Schließen",
    chatRealtime: "Demogespräch", writeMessage: "Demonstrationsnachricht schreiben…", send: "Senden",
    projectShare: "Demoprojektfreigabe", shareLinkDescription: "Dieser Beispiellink gewährt keinen Zugriff auf echte Projekte.", copy: "Kopieren", linkUnavailable: "Kein Demolink verfügbar",
  },
  pt: {
    title: "Colaboração", backHome: "Voltar ao início", demoNotice: "Esta é uma demonstração isolada com um projeto e um utilizador de exemplo. Não está ligada à sua conta, aos seus projetos ou à sua equipa real. Não convide colaboradores nem partilhe dados pessoais ou de produção.",
    demoTitle: "Demonstração de colaboração", tagline: "Explore exemplos de ecrãs de equipa, conversa e partilha. Esta demonstração não está ligada aos seus projetos reais.",
    offline: "Modo offline", useOffline: "Usar modo offline", connected: "Ligado", connecting: "A ligar…", disconnected: "Desligado", connectionError: "Erro de ligação",
    connectingMessage: "A ligar à demonstração de colaboração…", connectionFailed: "Não foi possível ligar", checkServer: "Verifique se o servidor de demonstração está em execução", retry: "Tentar novamente",
    project: "Projeto de demonstração", offlineProjectName: "Projeto de demonstração offline", offlineSystemMessage: "Abriu o modo offline. Não é necessária uma ligação externa.", online: "online", members: "membros", membersLabel: "membros", owner: "Proprietário", editorRole: "Editor", viewerRole: "Leitor", messages: "mensagens", linkActive: "Ligação de demonstração disponível",
    team: "Equipa de demonstração", teamDescription: "Pré-visualize funções de membros nesta demonstração isolada", chat: "Conversa de demonstração", chatDescription: "Pré-visualize mensagens de demonstração",
    sharing: "Partilha de demonstração", sharingDescription: "Pré-visualize uma ligação de demonstração", security: "Limitações da demonstração", securityDescription: "Consulte os limites de privacidade e segurança",
    teamTab: "Equipa", chatTab: "Conversa", shareTab: "Partilha", securityTab: "Limitações", loadingProject: "A carregar o projeto de demonstração…",
    quickStart: "Quer começar?", quickStartDescription: "Os controlos de colaboração desta página são uma demonstração e não se ligam aos seus projetos ou à sua equipa real.",
    openEditor: "Abrir o editor", securityTitle: "Privacidade e segurança da demonstração", securityNotice: "Esta demonstração utiliza um projeto de exemplo e dados em memória. Não demonstra nem garante encriptação, controlos de acesso, registos de atividade ou segurança de produção. Não introduza dados pessoais reais, confidenciais ou de produção.",
    teamManagement: "Equipa de demonstração", inviteEmail: "Endereço de email (apenas demonstração)", role: "Função", invite: "Adicionar à demonstração", sending: "A adicionar…",
    inviteAdded: "Convite de demonstração adicionado para {email}", setViewer: "Definir como leitor", setEditor: "Definir como editor", remove: "Remover da demonstração", close: "Fechar",
    chatRealtime: "Conversa de demonstração", writeMessage: "Escreva uma mensagem de demonstração…", send: "Enviar",
    projectShare: "Partilha do projeto de demonstração", shareLinkDescription: "Esta ligação de exemplo não dá acesso a projetos reais.", copy: "Copiar", linkUnavailable: "Não existe uma ligação de demonstração disponível",
  },
  ru: {
    title: "Совместная работа", backHome: "На главную", demoNotice: "Это изолированная демонстрация с примером проекта и демонстрационным пользователем. Она не связана с вашей учётной записью, проектами или реальной командой. Не приглашайте сюда сотрудников и не передавайте личные или рабочие данные.",
    demoTitle: "Демонстрация совместной работы", tagline: "Посмотрите примеры экранов команды, чата и общего доступа. Демонстрация не связана с вашими реальными проектами.",
    offline: "Автономный режим", useOffline: "Включить автономный режим", connected: "Подключено", connecting: "Подключение…", disconnected: "Отключено", connectionError: "Ошибка подключения",
    connectingMessage: "Подключение к демонстрации совместной работы…", connectionFailed: "Не удалось подключиться", checkServer: "Проверьте, запущен ли демонстрационный сервер", retry: "Повторить",
    project: "Демонстрационный проект", offlineProjectName: "Автономный демонстрационный проект", offlineSystemMessage: "Вы открыли автономный режим. Внешнее подключение не требуется.", online: "в сети", members: "участников", membersLabel: "участников", owner: "Владелец", editorRole: "Редактор", viewerRole: "Наблюдатель", messages: "сообщений", linkActive: "Демонстрационная ссылка доступна",
    team: "Демонстрационная команда", teamDescription: "Просмотр ролей участников в изолированной демонстрации", chat: "Демонстрационный чат", chatDescription: "Просмотр демонстрационных сообщений",
    sharing: "Демонстрационный доступ", sharingDescription: "Просмотр демонстрационной ссылки", security: "Ограничения демонстрации", securityDescription: "Ограничения конфиденциальности и безопасности",
    teamTab: "Команда", chatTab: "Чат", shareTab: "Доступ", securityTab: "Ограничения", loadingProject: "Загрузка демонстрационного проекта…",
    quickStart: "Хотите начать?", quickStartDescription: "Элементы управления совместной работой на этой странице демонстрационные и не связаны с вашими реальными проектами или командой.",
    openEditor: "Открыть редактор", securityTitle: "Конфиденциальность и безопасность демонстрации", securityNotice: "В демонстрации используется пример проекта и данные в оперативной памяти. Она не подтверждает и не гарантирует шифрование, контроль доступа, журналы действий или безопасность для production. Не вводите настоящие личные, конфиденциальные или рабочие данные.",
    teamManagement: "Демонстрационная команда", inviteEmail: "Электронная почта (только для демо)", role: "Роль", invite: "Добавить в демо", sending: "Добавление…",
    inviteAdded: "Демонстрационное приглашение добавлено для {email}", setViewer: "Назначить наблюдателем", setEditor: "Назначить редактором", remove: "Удалить из демо", close: "Закрыть",
    chatRealtime: "Демонстрационный разговор", writeMessage: "Напишите демонстрационное сообщение…", send: "Отправить",
    projectShare: "Общий доступ к демопроекту", shareLinkDescription: "Эта примерная ссылка не предоставляет доступ к реальным проектам.", copy: "Копировать", linkUnavailable: "Демонстрационная ссылка недоступна",
  },
  zh: {
    title: "协作", backHome: "返回主页", demoNotice: "这是一个独立演示，使用示例项目和演示用户。它不关联你的账户、项目或真实团队。请勿在此邀请协作者，也不要共享个人或生产数据。",
    demoTitle: "协作演示", tagline: "查看团队、聊天和共享界面的示例。本演示不连接你的真实项目。",
    offline: "离线模式", useOffline: "使用离线模式", connected: "已连接", connecting: "正在连接…", disconnected: "已断开", connectionError: "连接错误",
    connectingMessage: "正在连接协作演示…", connectionFailed: "无法连接", checkServer: "请确认演示服务器正在运行", retry: "重试",
    project: "演示项目", offlineProjectName: "离线演示项目", offlineSystemMessage: "你已进入离线模式，无需外部连接。", online: "在线", members: "位成员", membersLabel: "位成员", owner: "所有者", editorRole: "编辑者", viewerRole: "查看者", messages: "条消息", linkActive: "演示链接可用",
    team: "示例团队", teamDescription: "预览独立演示中的成员角色", chat: "示例聊天", chatDescription: "预览演示消息",
    sharing: "示例共享", sharingDescription: "预览演示共享链接", security: "演示限制", securityDescription: "查看隐私和安全限制",
    teamTab: "团队", chatTab: "聊天", shareTab: "共享", securityTab: "限制", loadingProject: "正在加载演示项目…",
    quickStart: "准备开始了吗？", quickStartDescription: "此页面上的协作控件仅为演示，不会连接你的真实项目或团队。",
    openEditor: "打开编辑器", securityTitle: "演示的隐私与安全", securityNotice: "此演示使用示例项目和内存中的数据。它不展示也不保证加密、访问控制、活动日志或生产环境安全。请勿输入真实个人信息、机密信息或生产数据。",
    teamManagement: "演示团队", inviteEmail: "电子邮箱（仅用于演示）", role: "角色", invite: "添加到演示", sending: "正在添加…",
    inviteAdded: "已为 {email} 添加演示邀请", setViewer: "设为查看者", setEditor: "设为编辑者", remove: "从演示中移除", close: "关闭",
    chatRealtime: "演示对话", writeMessage: "输入演示消息…", send: "发送",
    projectShare: "演示项目共享", shareLinkDescription: "此示例链接不能访问真实项目。", copy: "复制", linkUnavailable: "没有可用的演示链接",
  },
  ja: {
    title: "コラボレーション", backHome: "ホームに戻る", demoNotice: "これはサンプルプロジェクトとデモユーザーを使った独立したデモです。お客様のアカウント、プロジェクト、実際のチームには接続されていません。ここで共同作業者を招待したり、個人情報や本番データを共有したりしないでください。",
    demoTitle: "コラボレーションデモ", tagline: "チーム、チャット、共有画面のサンプルを確認できます。このデモは実際のプロジェクトには接続されません。",
    offline: "オフラインモード", useOffline: "オフラインモードを使用", connected: "接続済み", connecting: "接続中…", disconnected: "切断", connectionError: "接続エラー",
    connectingMessage: "コラボレーションデモに接続中…", connectionFailed: "接続できませんでした", checkServer: "デモサーバーが起動していることを確認してください", retry: "再試行",
    project: "デモプロジェクト", offlineProjectName: "オフラインデモプロジェクト", offlineSystemMessage: "オフラインモードを開きました。外部接続は必要ありません。", online: "オンライン", members: "人", membersLabel: "人", owner: "オーナー", editorRole: "編集者", viewerRole: "閲覧者", messages: "件のメッセージ", linkActive: "デモリンクを利用できます",
    team: "デモチーム", teamDescription: "独立したデモでメンバーの役割を確認", chat: "デモチャット", chatDescription: "デモメッセージを確認",
    sharing: "デモ共有", sharingDescription: "デモ共有リンクを確認", security: "デモの制限事項", securityDescription: "プライバシーとセキュリティの制限を確認",
    teamTab: "チーム", chatTab: "チャット", shareTab: "共有", securityTab: "制限事項", loadingProject: "デモプロジェクトを読み込み中…",
    quickStart: "始めますか？", quickStartDescription: "このページのコラボレーション操作はデモ用で、実際のプロジェクトやチームには接続されません。",
    openEditor: "エディターを開く", securityTitle: "デモのプライバシーとセキュリティ", securityNotice: "このデモではサンプルプロジェクトとメモリ上のデータを使用します。暗号化、アクセス制御、操作ログ、本番環境のセキュリティを実証または保証するものではありません。実際の個人情報、機密情報、本番データを入力しないでください。",
    teamManagement: "デモチーム", inviteEmail: "メールアドレス（デモ専用）", role: "役割", invite: "デモに追加", sending: "追加中…",
    inviteAdded: "{email} のデモ招待を追加しました", setViewer: "閲覧者に設定", setEditor: "編集者に設定", remove: "デモから削除", close: "閉じる",
    chatRealtime: "デモ会話", writeMessage: "デモメッセージを入力…", send: "送信",
    projectShare: "デモプロジェクトの共有", shareLinkDescription: "このサンプルリンクから実際のプロジェクトにはアクセスできません。", copy: "コピー", linkUnavailable: "利用可能なデモリンクはありません",
  },
  ko: {
    title: "협업", backHome: "홈으로 돌아가기", demoNotice: "이 페이지는 샘플 프로젝트와 데모 사용자를 이용하는 독립 데모입니다. 계정, 프로젝트 또는 실제 팀과 연결되어 있지 않습니다. 여기서 협업자를 초대하거나 개인 정보 및 실제 운영 데이터를 공유하지 마세요.",
    demoTitle: "협업 데모", tagline: "팀, 채팅, 공유 화면의 예시를 살펴보세요. 이 데모는 실제 프로젝트와 연결되지 않습니다.",
    offline: "오프라인 모드", useOffline: "오프라인 모드 사용", connected: "연결됨", connecting: "연결 중…", disconnected: "연결 끊김", connectionError: "연결 오류",
    connectingMessage: "협업 데모에 연결하는 중…", connectionFailed: "연결할 수 없습니다", checkServer: "데모 서버가 실행 중인지 확인하세요", retry: "다시 시도",
    project: "데모 프로젝트", offlineProjectName: "오프라인 데모 프로젝트", offlineSystemMessage: "오프라인 모드를 열었습니다. 외부 연결이 필요하지 않습니다.", online: "온라인", members: "명", membersLabel: "명", owner: "소유자", editorRole: "편집자", viewerRole: "뷰어", messages: "개 메시지", linkActive: "데모 링크 사용 가능",
    team: "데모 팀", teamDescription: "독립 데모에서 구성원 역할 미리 보기", chat: "데모 채팅", chatDescription: "데모 메시지 미리 보기",
    sharing: "데모 공유", sharingDescription: "데모 공유 링크 미리 보기", security: "데모 제한 사항", securityDescription: "개인 정보 보호 및 보안 제한 사항 확인",
    teamTab: "팀", chatTab: "채팅", shareTab: "공유", securityTab: "제한 사항", loadingProject: "데모 프로젝트를 불러오는 중…",
    quickStart: "시작할 준비가 되셨나요?", quickStartDescription: "이 페이지의 협업 기능은 데모이며 실제 프로젝트나 팀에 연결되지 않습니다.",
    openEditor: "편집기 열기", securityTitle: "데모 개인정보 보호 및 보안", securityNotice: "이 데모는 샘플 프로젝트와 메모리 데이터를 사용합니다. 암호화, 접근 제어, 활동 로그 또는 실제 운영 환경의 보안을 입증하거나 보장하지 않습니다. 실제 개인 정보, 기밀 정보 또는 운영 데이터를 입력하지 마세요.",
    teamManagement: "데모 팀", inviteEmail: "이메일 주소 (데모 전용)", role: "역할", invite: "데모에 추가", sending: "추가 중…",
    inviteAdded: "{email}에 대한 데모 초대를 추가했습니다", setViewer: "뷰어로 설정", setEditor: "편집자로 설정", remove: "데모에서 제거", close: "닫기",
    chatRealtime: "데모 대화", writeMessage: "데모 메시지 입력…", send: "보내기",
    projectShare: "데모 프로젝트 공유", shareLinkDescription: "이 샘플 링크로는 실제 프로젝트에 접근할 수 없습니다.", copy: "복사", linkUnavailable: "사용 가능한 데모 링크가 없습니다",
  },
  ar: {
    title: "التعاون", backHome: "العودة إلى الصفحة الرئيسية", demoNotice: "هذا عرض تجريبي معزول يستخدم مشروعًا ومستخدمًا تجريبيين. لا يتصل بحسابك أو مشاريعك أو فريقك الفعلي. لا تدعُ متعاونين ولا تشارك بيانات شخصية أو بيانات إنتاج هنا.",
    demoTitle: "عرض التعاون التجريبي", tagline: "استكشف نماذج لشاشات الفريق والدردشة والمشاركة. لا يتصل هذا العرض بمشاريعك الفعلية.",
    offline: "وضع عدم الاتصال", useOffline: "استخدام وضع عدم الاتصال", connected: "متصل", connecting: "جارٍ الاتصال…", disconnected: "غير متصل", connectionError: "خطأ في الاتصال",
    connectingMessage: "جارٍ الاتصال بعرض التعاون التجريبي…", connectionFailed: "تعذّر الاتصال", checkServer: "تحقق من تشغيل خادم العرض التجريبي", retry: "إعادة المحاولة",
    project: "مشروع تجريبي", offlineProjectName: "مشروع تجريبي دون اتصال", offlineSystemMessage: "لقد فتحت وضع عدم الاتصال. لا يلزم اتصال خارجي.", online: "متصل", members: "أعضاء", membersLabel: "أعضاء", owner: "مالك", editorRole: "محرر", viewerRole: "مشاهد", messages: "رسائل", linkActive: "رابط تجريبي متاح",
    team: "فريق تجريبي", teamDescription: "معاينة أدوار الأعضاء في هذا العرض المعزول", chat: "دردشة تجريبية", chatDescription: "معاينة رسائل العرض التجريبي",
    sharing: "مشاركة تجريبية", sharingDescription: "معاينة رابط مشاركة تجريبي", security: "قيود العرض التجريبي", securityDescription: "راجع قيود الخصوصية والأمان",
    teamTab: "الفريق", chatTab: "الدردشة", shareTab: "المشاركة", securityTab: "القيود", loadingProject: "جارٍ تحميل المشروع التجريبي…",
    quickStart: "هل تريد البدء؟", quickStartDescription: "عناصر التعاون في هذه الصفحة تجريبية ولا تتصل بمشاريعك أو فريقك الفعلي.",
    openEditor: "فتح المحرر", securityTitle: "خصوصية العرض التجريبي وأمانه", securityNotice: "يستخدم هذا العرض مشروعًا تجريبيًا وبيانات في الذاكرة. لا يثبت ولا يضمن التشفير أو عناصر التحكم في الوصول أو سجلات النشاط أو أمان بيئة الإنتاج. لا تُدخل بيانات شخصية حقيقية أو سرية أو خاصة بالإنتاج.",
    teamManagement: "فريق تجريبي", inviteEmail: "عنوان البريد الإلكتروني (للعرض التجريبي فقط)", role: "الدور", invite: "إضافة إلى العرض التجريبي", sending: "جارٍ الإضافة…",
    inviteAdded: "تمت إضافة دعوة تجريبية إلى {email}", setViewer: "تعيين كمشاهد", setEditor: "تعيين كمحرر", remove: "إزالة من العرض التجريبي", close: "إغلاق",
    chatRealtime: "محادثة تجريبية", writeMessage: "اكتب رسالة تجريبية…", send: "إرسال",
    projectShare: "مشاركة المشروع التجريبي", shareLinkDescription: "لا يتيح هذا الرابط التجريبي الوصول إلى مشاريع حقيقية.", copy: "نسخ", linkUnavailable: "لا يتوفر رابط تجريبي",
  },
  hi: {
    title: "सहयोग", backHome: "होम पर वापस जाएँ", demoNotice: "यह एक अलग डेमो है जिसमें नमूना प्रोजेक्ट और डेमो उपयोगकर्ता हैं। यह आपके खाते, प्रोजेक्ट या वास्तविक टीम से जुड़ा नहीं है। यहाँ सहयोगियों को आमंत्रित न करें और व्यक्तिगत या उत्पादन डेटा साझा न करें।",
    demoTitle: "सहयोग डेमो", tagline: "टीम, चैट और साझा करने वाली स्क्रीन के उदाहरण देखें। यह डेमो आपके वास्तविक प्रोजेक्ट से जुड़ा नहीं है।",
    offline: "ऑफ़लाइन मोड", useOffline: "ऑफ़लाइन मोड इस्तेमाल करें", connected: "कनेक्टेड", connecting: "कनेक्ट हो रहा है…", disconnected: "डिस्कनेक्टेड", connectionError: "कनेक्शन त्रुटि",
    connectingMessage: "सहयोग डेमो से कनेक्ट हो रहा है…", connectionFailed: "कनेक्ट नहीं हो सका", checkServer: "जाँचें कि डेमो सर्वर चल रहा है", retry: "फिर कोशिश करें",
    project: "डेमो प्रोजेक्ट", offlineProjectName: "ऑफ़लाइन डेमो प्रोजेक्ट", offlineSystemMessage: "आपने ऑफ़लाइन मोड खोला है। किसी बाहरी कनेक्शन की आवश्यकता नहीं है।", online: "ऑनलाइन", members: "सदस्य", membersLabel: "सदस्य", owner: "स्वामी", editorRole: "संपादक", viewerRole: "दर्शक", messages: "संदेश", linkActive: "डेमो लिंक उपलब्ध",
    team: "नमूना टीम", teamDescription: "इस अलग डेमो में सदस्य भूमिकाएँ देखें", chat: "नमूना चैट", chatDescription: "डेमो संदेशों का पूर्वावलोकन",
    sharing: "नमूना साझा करना", sharingDescription: "डेमो साझा लिंक का पूर्वावलोकन", security: "डेमो की सीमाएँ", securityDescription: "गोपनीयता और सुरक्षा की सीमाएँ देखें",
    teamTab: "टीम", chatTab: "चैट", shareTab: "साझा करें", securityTab: "सीमाएँ", loadingProject: "डेमो प्रोजेक्ट लोड हो रहा है…",
    quickStart: "शुरू करना चाहते हैं?", quickStartDescription: "इस पृष्ठ के सहयोग नियंत्रण डेमो हैं और आपके वास्तविक प्रोजेक्ट या टीम से नहीं जुड़ते।",
    openEditor: "एडिटर खोलें", securityTitle: "डेमो की गोपनीयता और सुरक्षा", securityNotice: "यह डेमो नमूना प्रोजेक्ट और मेमोरी में रखे डेटा का उपयोग करता है। यह एन्क्रिप्शन, पहुँच नियंत्रण, गतिविधि लॉग या उत्पादन सुरक्षा का प्रमाण या गारंटी नहीं देता। वास्तविक व्यक्तिगत, गोपनीय या उत्पादन डेटा दर्ज न करें।",
    teamManagement: "डेमो टीम", inviteEmail: "ईमेल पता (केवल डेमो)", role: "भूमिका", invite: "डेमो में जोड़ें", sending: "जोड़ा जा रहा है…",
    inviteAdded: "{email} के लिए डेमो आमंत्रण जोड़ा गया", setViewer: "दर्शक के रूप में सेट करें", setEditor: "संपादक के रूप में सेट करें", remove: "डेमो से हटाएँ", close: "बंद करें",
    chatRealtime: "डेमो बातचीत", writeMessage: "डेमो संदेश लिखें…", send: "भेजें",
    projectShare: "डेमो प्रोजेक्ट साझा करना", shareLinkDescription: "इस नमूना लिंक से वास्तविक प्रोजेक्ट तक पहुँच नहीं मिलती।", copy: "कॉपी करें", linkUnavailable: "कोई डेमो लिंक उपलब्ध नहीं है",
  },
  pl: {
    title: "Współpraca", backHome: "Powrót do strony głównej", demoNotice: "To odizolowana wersja demonstracyjna z przykładowym projektem i użytkownikiem. Nie jest połączona z Twoim kontem, projektami ani prawdziwym zespołem. Nie zapraszaj tu współpracowników ani nie udostępniaj danych osobowych lub produkcyjnych.",
    demoTitle: "Demo współpracy", tagline: "Zobacz przykładowe ekrany zespołu, czatu i udostępniania. To demo nie łączy się z Twoimi prawdziwymi projektami.",
    offline: "Tryb offline", useOffline: "Użyj trybu offline", connected: "Połączono", connecting: "Łączenie…", disconnected: "Rozłączono", connectionError: "Błąd połączenia",
    connectingMessage: "Łączenie z wersją demonstracyjną współpracy…", connectionFailed: "Nie udało się połączyć", checkServer: "Sprawdź, czy serwer demonstracyjny jest uruchomiony", retry: "Ponów próbę",
    project: "Projekt demonstracyjny", offlineProjectName: "Projekt demonstracyjny offline", offlineSystemMessage: "Włączono tryb offline. Połączenie zewnętrzne nie jest wymagane.", online: "online", members: "członków", membersLabel: "członków", owner: "Właściciel", editorRole: "Edytor", viewerRole: "Obserwator", messages: "wiadomości", linkActive: "Link demonstracyjny dostępny",
    team: "Zespół demonstracyjny", teamDescription: "Podgląd ról członków w odizolowanym demo", chat: "Czat demonstracyjny", chatDescription: "Podgląd wiadomości demonstracyjnych",
    sharing: "Udostępnianie demonstracyjne", sharingDescription: "Podgląd linku demonstracyjnego", security: "Ograniczenia demo", securityDescription: "Informacje o ograniczeniach prywatności i bezpieczeństwa",
    teamTab: "Zespół", chatTab: "Czat", shareTab: "Udostępnianie", securityTab: "Ograniczenia", loadingProject: "Wczytywanie projektu demonstracyjnego…",
    quickStart: "Chcesz zacząć?", quickStartDescription: "Elementy współpracy na tej stronie są demonstracyjne i nie łączą się z Twoimi prawdziwymi projektami ani zespołem.",
    openEditor: "Otwórz edytor", securityTitle: "Prywatność i bezpieczeństwo demo", securityNotice: "To demo korzysta z przykładowego projektu i danych przechowywanych w pamięci. Nie demonstruje ani nie gwarantuje szyfrowania, kontroli dostępu, dzienników aktywności ani bezpieczeństwa produkcyjnego. Nie wpisuj prawdziwych danych osobowych, poufnych ani produkcyjnych.",
    teamManagement: "Zespół demo", inviteEmail: "Adres e-mail (tylko demo)", role: "Rola", invite: "Dodaj do demo", sending: "Dodawanie…",
    inviteAdded: "Dodano zaproszenie demo dla {email}", setViewer: "Ustaw jako obserwatora", setEditor: "Ustaw jako edytora", remove: "Usuń z demo", close: "Zamknij",
    chatRealtime: "Rozmowa demonstracyjna", writeMessage: "Napisz wiadomość demonstracyjną…", send: "Wyślij",
    projectShare: "Udostępnianie projektu demo", shareLinkDescription: "Ten przykładowy link nie daje dostępu do prawdziwych projektów.", copy: "Kopiuj", linkUnavailable: "Brak dostępnego linku demonstracyjnego",
  },
  nl: {
    title: "Samenwerking", backHome: "Terug naar home", demoNotice: "Dit is een geïsoleerde demo met een voorbeeldproject en demo-gebruiker. De demo is niet gekoppeld aan je account, projecten of echte team. Nodig hier geen medewerkers uit en deel geen persoonlijke of productiegegevens.",
    demoTitle: "Samenwerkingsdemo", tagline: "Bekijk voorbeelden van team-, chat- en deelpagina's. Deze demo is niet gekoppeld aan je echte projecten.",
    offline: "Offline modus", useOffline: "Offline modus gebruiken", connected: "Verbonden", connecting: "Verbinden…", disconnected: "Verbinding verbroken", connectionError: "Verbindingsfout",
    connectingMessage: "Verbinden met de samenwerkingsdemo…", connectionFailed: "Verbinding mislukt", checkServer: "Controleer of de demoserver actief is", retry: "Opnieuw proberen",
    project: "Demoproject", offlineProjectName: "Offline-demoproject", offlineSystemMessage: "Je hebt de offline modus geopend. Er is geen externe verbinding nodig.", online: "online", members: "leden", membersLabel: "leden", owner: "Eigenaar", editorRole: "Editor", viewerRole: "Kijker", messages: "berichten", linkActive: "Demolink beschikbaar",
    team: "Demoteam", teamDescription: "Bekijk de rollen van leden in deze geïsoleerde demo", chat: "Demochat", chatDescription: "Bekijk demoberichten",
    sharing: "Demodeling", sharingDescription: "Bekijk een demodeellink", security: "Demobeperkingen", securityDescription: "Bekijk de beperkingen voor privacy en beveiliging",
    teamTab: "Team", chatTab: "Chat", shareTab: "Delen", securityTab: "Beperkingen", loadingProject: "Demoproject laden…",
    quickStart: "Klaar om te beginnen?", quickStartDescription: "De samenwerkingsbediening op deze pagina is een demo en is niet gekoppeld aan je echte projecten of team.",
    openEditor: "Editor openen", securityTitle: "Privacy en beveiliging van de demo", securityNotice: "Deze demo gebruikt een voorbeeldproject en gegevens in het geheugen. De demo toont of garandeert geen versleuteling, toegangsbeheer, activiteitenlogboeken of productieveiligheid. Voer geen echte persoonlijke, vertrouwelijke of productiegegevens in.",
    teamManagement: "Demoteam", inviteEmail: "E-mailadres (alleen demo)", role: "Rol", invite: "Toevoegen aan demo", sending: "Toevoegen…",
    inviteAdded: "Demouitnodiging toegevoegd voor {email}", setViewer: "Instellen als kijker", setEditor: "Instellen als editor", remove: "Verwijderen uit demo", close: "Sluiten",
    chatRealtime: "Demogesprek", writeMessage: "Schrijf een demobericht…", send: "Verzenden",
    projectShare: "Demoproject delen", shareLinkDescription: "Deze voorbeeldlink geeft geen toegang tot echte projecten.", copy: "Kopiëren", linkUnavailable: "Geen demolink beschikbaar",
  },
  tr: {
    title: "İş birliği", backHome: "Ana sayfaya dön", demoNotice: "Bu, örnek proje ve demo kullanıcısı içeren yalıtılmış bir demodur. Hesabınıza, projelerinize veya gerçek ekibinize bağlı değildir. Burada iş arkadaşı davet etmeyin veya kişisel ya da üretim verisi paylaşmayın.",
    demoTitle: "İş birliği demosu", tagline: "Örnek ekip, sohbet ve paylaşım ekranlarını keşfedin. Bu demo gerçek projelerinize bağlı değildir.",
    offline: "Çevrimdışı mod", useOffline: "Çevrimdışı modu kullan", connected: "Bağlandı", connecting: "Bağlanıyor…", disconnected: "Bağlantı kesildi", connectionError: "Bağlantı hatası",
    connectingMessage: "İş birliği demosuna bağlanılıyor…", connectionFailed: "Bağlanılamadı", checkServer: "Demo sunucusunun çalıştığını kontrol edin", retry: "Yeniden dene",
    project: "Demo projesi", offlineProjectName: "Çevrimdışı demo projesi", offlineSystemMessage: "Çevrimdışı modu açtınız. Harici bağlantı gerekmez.", online: "çevrimiçi", members: "üye", membersLabel: "üye", owner: "Sahip", editorRole: "Düzenleyici", viewerRole: "Görüntüleyici", messages: "mesaj", linkActive: "Demo bağlantısı kullanılabilir",
    team: "Örnek ekip", teamDescription: "Yalıtılmış demodaki üye rollerini önizleyin", chat: "Örnek sohbet", chatDescription: "Demo mesajlarını önizleyin",
    sharing: "Örnek paylaşım", sharingDescription: "Demo paylaşım bağlantısını önizleyin", security: "Demo sınırlamaları", securityDescription: "Gizlilik ve güvenlik sınırlamalarını inceleyin",
    teamTab: "Ekip", chatTab: "Sohbet", shareTab: "Paylaşım", securityTab: "Sınırlamalar", loadingProject: "Demo projesi yükleniyor…",
    quickStart: "Başlamak ister misiniz?", quickStartDescription: "Bu sayfadaki iş birliği kontrolleri demodur ve gerçek projelerinize veya ekibinize bağlanmaz.",
    openEditor: "Düzenleyiciyi aç", securityTitle: "Demo gizliliği ve güvenliği", securityNotice: "Bu demo örnek proje ve bellekte tutulan veriler kullanır. Şifreleme, erişim denetimleri, etkinlik kayıtları veya üretim güvenliği göstermez ya da garanti etmez. Gerçek kişisel, gizli veya üretim verilerini girmeyin.",
    teamManagement: "Demo ekibi", inviteEmail: "E-posta adresi (yalnızca demo)", role: "Rol", invite: "Demoya ekle", sending: "Ekleniyor…",
    inviteAdded: "{email} için demo daveti eklendi", setViewer: "Görüntüleyici yap", setEditor: "Düzenleyici yap", remove: "Demodan kaldır", close: "Kapat",
    chatRealtime: "Demo sohbeti", writeMessage: "Demo mesajı yazın…", send: "Gönder",
    projectShare: "Demo projesi paylaşımı", shareLinkDescription: "Bu örnek bağlantı gerçek projelere erişim sağlamaz.", copy: "Kopyala", linkUnavailable: "Kullanılabilir demo bağlantısı yok",
  },
  sv: {
    title: "Samarbete", backHome: "Tillbaka till startsidan", demoNotice: "Det här är en isolerad demo med ett exempelprojekt och en demonstrationsanvändare. Den är inte kopplad till ditt konto, dina projekt eller ditt riktiga team. Bjud inte in medarbetare och dela inga personuppgifter eller produktionsdata här.",
    demoTitle: "Samarbetsdemo", tagline: "Utforska exempel på team-, chatt- och delningsvyer. Den här demon är inte kopplad till dina riktiga projekt.",
    offline: "Offlineläge", useOffline: "Använd offlineläge", connected: "Ansluten", connecting: "Ansluter…", disconnected: "Frånkopplad", connectionError: "Anslutningsfel",
    connectingMessage: "Ansluter till samarbetsdemon…", connectionFailed: "Det gick inte att ansluta", checkServer: "Kontrollera att demoservern körs", retry: "Försök igen",
    project: "Demoprojekt", offlineProjectName: "Offline-demoprojekt", offlineSystemMessage: "Du har öppnat offlineläget. Ingen extern anslutning behövs.", online: "online", members: "medlemmar", membersLabel: "medlemmar", owner: "Ägare", editorRole: "Redigerare", viewerRole: "Läsare", messages: "meddelanden", linkActive: "Demolänk tillgänglig",
    team: "Demoteam", teamDescription: "Visa medlemsroller i den isolerade demon", chat: "Demochatt", chatDescription: "Visa demomeddelanden",
    sharing: "Demodelning", sharingDescription: "Visa en demolänk", security: "Demons begränsningar", securityDescription: "Läs om integritets- och säkerhetsbegränsningar",
    teamTab: "Team", chatTab: "Chatt", shareTab: "Delning", securityTab: "Begränsningar", loadingProject: "Läser in demoprojekt…",
    quickStart: "Vill du komma igång?", quickStartDescription: "Samarbetskontrollerna på den här sidan är en demo och är inte kopplade till dina riktiga projekt eller ditt team.",
    openEditor: "Öppna editorn", securityTitle: "Demon och din integritet", securityNotice: "Den här demon använder ett exempelprojekt och data i minnet. Den visar eller garanterar inte kryptering, åtkomstkontroller, aktivitetsloggar eller produktionssäkerhet. Ange inga riktiga personuppgifter, konfidentiella uppgifter eller produktionsdata.",
    teamManagement: "Demoteam", inviteEmail: "E-postadress (endast demo)", role: "Roll", invite: "Lägg till i demon", sending: "Lägger till…",
    inviteAdded: "Demoinbjudan har lagts till för {email}", setViewer: "Ange som läsare", setEditor: "Ange som redigerare", remove: "Ta bort från demon", close: "Stäng",
    chatRealtime: "Demokonversation", writeMessage: "Skriv ett demomeddelande…", send: "Skicka",
    projectShare: "Dela demoprojekt", shareLinkDescription: "Exempellänken ger inte åtkomst till riktiga projekt.", copy: "Kopiera", linkUnavailable: "Ingen demolänk är tillgänglig",
  },
  da: {
    title: "Samarbejde", backHome: "Tilbage til forsiden", demoNotice: "Dette er en isoleret demo med et eksempelprojekt og en demobruger. Den er ikke forbundet med din konto, dine projekter eller dit rigtige team. Invitér ikke samarbejdspartnere, og del ikke personlige oplysninger eller produktionsdata her.",
    demoTitle: "Samarbejdsdemo", tagline: "Se eksempler på team-, chat- og delingsvisninger. Denne demo er ikke forbundet med dine rigtige projekter.",
    offline: "Offline-tilstand", useOffline: "Brug offline-tilstand", connected: "Forbundet", connecting: "Forbinder…", disconnected: "Afbrudt", connectionError: "Forbindelsesfejl",
    connectingMessage: "Forbinder til samarbejdsdemoen…", connectionFailed: "Kunne ikke oprette forbindelse", checkServer: "Kontrollér, at demoserveren kører", retry: "Prøv igen",
    project: "Demoprojekt", offlineProjectName: "Offline-demoprojekt", offlineSystemMessage: "Du har åbnet offline-tilstand. Der kræves ingen ekstern forbindelse.", online: "online", members: "medlemmer", membersLabel: "medlemmer", owner: "Ejer", editorRole: "Redaktør", viewerRole: "Læser", messages: "beskeder", linkActive: "Demolink tilgængeligt",
    team: "Demoteam", teamDescription: "Se medlemsroller i denne isolerede demo", chat: "Demochat", chatDescription: "Se demobeskeder",
    sharing: "Demodeling", sharingDescription: "Se et demodelingslink", security: "Demobegrænsninger", securityDescription: "Læs om begrænsninger for privatliv og sikkerhed",
    teamTab: "Team", chatTab: "Chat", shareTab: "Deling", securityTab: "Begrænsninger", loadingProject: "Indlæser demoprojekt…",
    quickStart: "Klar til at komme i gang?", quickStartDescription: "Samarbejdsfunktionerne på denne side er en demo og er ikke forbundet med dine rigtige projekter eller dit team.",
    openEditor: "Åbn editoren", securityTitle: "Demoens privatliv og sikkerhed", securityNotice: "Denne demo bruger et eksempelprojekt og data i hukommelsen. Den demonstrerer eller garanterer ikke kryptering, adgangskontrol, aktivitetslogge eller produktionssikkerhed. Indtast ikke rigtige personlige, fortrolige eller produktionsdata.",
    teamManagement: "Demoteam", inviteEmail: "E-mailadresse (kun demo)", role: "Rolle", invite: "Føj til demo", sending: "Tilføjer…",
    inviteAdded: "Demoinvitation føjet til for {email}", setViewer: "Angiv som læser", setEditor: "Angiv som editor", remove: "Fjern fra demo", close: "Luk",
    chatRealtime: "Demonstrationssamtale", writeMessage: "Skriv en demobesked…", send: "Send",
    projectShare: "Deling af demoprojekt", shareLinkDescription: "Dette eksempellink giver ikke adgang til rigtige projekter.", copy: "Kopiér", linkUnavailable: "Intet demolink tilgængeligt",
  },
  no: {
    title: "Samarbeid", backHome: "Tilbake til forsiden", demoNotice: "Dette er en isolert demo med et eksempelprosjekt og en demobruker. Den er ikke koblet til kontoen din, prosjektene dine eller det virkelige teamet ditt. Ikke inviter samarbeidspartnere eller del personopplysninger eller produksjonsdata her.",
    demoTitle: "Samarbeidsdemo", tagline: "Utforsk eksempler på team-, chat- og delingsvisninger. Denne demoen er ikke koblet til de virkelige prosjektene dine.",
    offline: "Frakoblet modus", useOffline: "Bruk frakoblet modus", connected: "Tilkoblet", connecting: "Kobler til…", disconnected: "Frakoblet", connectionError: "Tilkoblingsfeil",
    connectingMessage: "Kobler til samarbeidsdemoen…", connectionFailed: "Kunne ikke koble til", checkServer: "Kontroller at demoserveren kjører", retry: "Prøv igjen",
    project: "Demoprosjekt", offlineProjectName: "Frakoblet demoprosjekt", offlineSystemMessage: "Du har åpnet frakoblet modus. Ingen ekstern tilkobling er nødvendig.", online: "på nett", members: "medlemmer", membersLabel: "medlemmer", owner: "Eier", editorRole: "Redaktør", viewerRole: "Leser", messages: "meldinger", linkActive: "Demolenke tilgjengelig",
    team: "Demoteam", teamDescription: "Se medlemsroller i denne isolerte demoen", chat: "Demochat", chatDescription: "Se demomeldinger",
    sharing: "Demodeling", sharingDescription: "Se en demodelingslenke", security: "Demobegrensninger", securityDescription: "Les om begrensningene for personvern og sikkerhet",
    teamTab: "Team", chatTab: "Chat", shareTab: "Deling", securityTab: "Begrensninger", loadingProject: "Laster demoprosjekt…",
    quickStart: "Klar til å begynne?", quickStartDescription: "Samarbeidskontrollene på denne siden er en demo og kobles ikke til de virkelige prosjektene dine eller teamet ditt.",
    openEditor: "Åpne redigeringsverktøyet", securityTitle: "Demoens personvern og sikkerhet", securityNotice: "Denne demoen bruker et eksempelprosjekt og data i minnet. Den demonstrerer eller garanterer ikke kryptering, tilgangskontroll, aktivitetslogger eller produksjonssikkerhet. Ikke skriv inn ekte personopplysninger, konfidensielle opplysninger eller produksjonsdata.",
    teamManagement: "Demoteam", inviteEmail: "E-postadresse (kun demo)", role: "Rolle", invite: "Legg til i demoen", sending: "Legger til…",
    inviteAdded: "Demoinvitasjon lagt til for {email}", setViewer: "Angi som leser", setEditor: "Angi som redaktør", remove: "Fjern fra demoen", close: "Lukk",
    chatRealtime: "Dem samtale", writeMessage: "Skriv en demomelding…", send: "Send",
    projectShare: "Del demoprosjekt", shareLinkDescription: "Denne eksempel-lenken gir ikke tilgang til virkelige prosjekter.", copy: "Kopier", linkUnavailable: "Ingen demolenk er tilgjengelig",
  },
  fi: {
    title: "Yhteistyö", backHome: "Takaisin etusivulle", demoNotice: "Tämä on erillinen esittely, jossa käytetään esimerkkiprojektia ja demokäyttäjää. Se ei ole yhteydessä tiliisi, projekteihisi tai oikeaan tiimiisi. Älä kutsu yhteistyökumppaneita äläkä jaa täällä henkilötietoja tai tuotantotietoja.",
    demoTitle: "Yhteistyöesittely", tagline: "Tutustu tiimi-, chat- ja jakonäkymien esimerkkeihin. Tämä esittely ei ole yhteydessä oikeisiin projekteihisi.",
    offline: "Offline-tila", useOffline: "Käytä offline-tilaa", connected: "Yhdistetty", connecting: "Yhdistetään…", disconnected: "Yhteys katkaistu", connectionError: "Yhteysvirhe",
    connectingMessage: "Yhdistetään yhteistyöesittelyyn…", connectionFailed: "Yhteyden muodostaminen epäonnistui", checkServer: "Tarkista, että esittelypalvelin on käynnissä", retry: "Yritä uudelleen",
    project: "Demoprojekti", offlineProjectName: "Offline-demoprojekti", offlineSystemMessage: "Avasit offline-tilan. Ulkoista yhteyttä ei tarvita.", online: "verkossa", members: "jäsentä", membersLabel: "jäsentä", owner: "Omistaja", editorRole: "Muokkaaja", viewerRole: "Katselija", messages: "viestiä", linkActive: "Demolinkki käytettävissä",
    team: "Demotiimi", teamDescription: "Tarkastele jäsenten rooleja tässä erillisessä esittelyssä", chat: "Demokeskustelu", chatDescription: "Tarkastele esittelyviestejä",
    sharing: "Demojako", sharingDescription: "Tarkastele esittelyn jakolinkkiä", security: "Esittelyn rajoitukset", securityDescription: "Tutustu yksityisyyden ja tietoturvan rajoituksiin",
    teamTab: "Tiimi", chatTab: "Chat", shareTab: "Jakaminen", securityTab: "Rajoitukset", loadingProject: "Ladataan demoprojektia…",
    quickStart: "Haluatko aloittaa?", quickStartDescription: "Tämän sivun yhteistyötoiminnot ovat esittelyä eivätkä ole yhteydessä oikeisiin projekteihisi tai tiimiisi.",
    openEditor: "Avaa editori", securityTitle: "Esittelyn yksityisyys ja tietoturva", securityNotice: "Tässä esittelyssä käytetään esimerkkiprojektia ja muistissa olevia tietoja. Se ei osoita eikä takaa salausta, käyttöoikeuksien hallintaa, toimintalokeja tai tuotantotason tietoturvaa. Älä syötä oikeita henkilötietoja, luottamuksellisia tietoja tai tuotantotietoja.",
    teamManagement: "Demotiimi", inviteEmail: "Sähköpostiosoite (vain esittelyyn)", role: "Rooli", invite: "Lisää esittelyyn", sending: "Lisätään…",
    inviteAdded: "Demokutsu lisätty osoitteelle {email}", setViewer: "Aseta katselijaksi", setEditor: "Aseta muokkaajaksi", remove: "Poista esittelystä", close: "Sulje",
    chatRealtime: "Demokeskustelu", writeMessage: "Kirjoita demoviesti…", send: "Lähetä",
    projectShare: "Demoprojektin jakaminen", shareLinkDescription: "Tällä esimerkkilinkillä ei pääse oikeisiin projekteihin.", copy: "Kopioi", linkUnavailable: "Demolinkkiä ei ole saatavilla",
  },
  uk: {
    title: "Співпраця", backHome: "На головну", demoNotice: "Це ізольована демонстрація зі зразком проєкту та демонстраційним користувачем. Вона не пов’язана з вашим обліковим записом, проєктами чи реальною командою. Не запрошуйте сюди співробітників і не передавайте особисті або виробничі дані.",
    demoTitle: "Демонстрація співпраці", tagline: "Перегляньте приклади екранів команди, чату та спільного доступу. Демонстрація не пов’язана з вашими реальними проєктами.",
    offline: "Автономний режим", useOffline: "Увімкнути автономний режим", connected: "Підключено", connecting: "Підключення…", disconnected: "Відключено", connectionError: "Помилка підключення",
    connectingMessage: "Підключення до демонстрації співпраці…", connectionFailed: "Не вдалося підключитися", checkServer: "Перевірте, чи запущено демонстраційний сервер", retry: "Повторити",
    project: "Демонстраційний проєкт", offlineProjectName: "Автономний демонстраційний проєкт", offlineSystemMessage: "Ви відкрили автономний режим. Зовнішнє підключення не потрібне.", online: "у мережі", members: "учасників", membersLabel: "учасників", owner: "Власник", editorRole: "Редактор", viewerRole: "Переглядач", messages: "повідомлень", linkActive: "Демонстраційне посилання доступне",
    team: "Демонстраційна команда", teamDescription: "Перегляд ролей учасників в ізольованій демонстрації", chat: "Демонстраційний чат", chatDescription: "Перегляд демонстраційних повідомлень",
    sharing: "Демонстраційний доступ", sharingDescription: "Перегляд демонстраційного посилання", security: "Обмеження демонстрації", securityDescription: "Перегляньте обмеження конфіденційності та безпеки",
    teamTab: "Команда", chatTab: "Чат", shareTab: "Спільний доступ", securityTab: "Обмеження", loadingProject: "Завантаження демонстраційного проєкту…",
    quickStart: "Готові почати?", quickStartDescription: "Елементи співпраці на цій сторінці є демонстраційними й не пов’язані з вашими реальними проєктами або командою.",
    openEditor: "Відкрити редактор", securityTitle: "Конфіденційність і безпека демонстрації", securityNotice: "У демонстрації використовується зразок проєкту та дані в пам’яті. Вона не підтверджує й не гарантує шифрування, контроль доступу, журнали активності чи безпеку production-середовища. Не вводьте справжні особисті, конфіденційні або виробничі дані.",
    teamManagement: "Демонстраційна команда", inviteEmail: "Електронна адреса (лише для демо)", role: "Роль", invite: "Додати до демо", sending: "Додавання…",
    inviteAdded: "Демонстраційне запрошення додано для {email}", setViewer: "Призначити переглядачем", setEditor: "Призначити редактором", remove: "Видалити з демо", close: "Закрити",
    chatRealtime: "Демонстраційна розмова", writeMessage: "Напишіть демонстраційне повідомлення…", send: "Надіслати",
    projectShare: "Спільний доступ до демопроєкту", shareLinkDescription: "Це зразкове посилання не надає доступу до реальних проєктів.", copy: "Копіювати", linkUnavailable: "Демонстраційне посилання недоступне",
  },
  cs: {
    title: "Spolupráce", backHome: "Zpět na domovskou stránku", demoNotice: "Jde o izolovanou ukázku se vzorovým projektem a ukázkovým uživatelem. Není propojena s vaším účtem, projekty ani skutečným týmem. Nezvěte zde spolupracovníky a nesdílejte osobní ani produkční data.",
    demoTitle: "Ukázka spolupráce", tagline: "Prohlédněte si ukázkové obrazovky týmu, chatu a sdílení. Tato ukázka není propojena s vašimi skutečnými projekty.",
    offline: "Offline režim", useOffline: "Použít offline režim", connected: "Připojeno", connecting: "Připojování…", disconnected: "Odpojeno", connectionError: "Chyba připojení",
    connectingMessage: "Připojování k ukázce spolupráce…", connectionFailed: "Nepodařilo se připojit", checkServer: "Zkontrolujte, zda běží ukázkový server", retry: "Zkusit znovu",
    project: "Ukázkový projekt", offlineProjectName: "Offline ukázkový projekt", offlineSystemMessage: "Otevřeli jste offline režim. Externí připojení není potřeba.", online: "online", members: "členů", membersLabel: "členů", owner: "Vlastník", editorRole: "Editor", viewerRole: "Čtenář", messages: "zpráv", linkActive: "Ukázkový odkaz je k dispozici",
    team: "Ukázkový tým", teamDescription: "Náhled rolí členů v této izolované ukázce", chat: "Ukázkový chat", chatDescription: "Náhled ukázkových zpráv",
    sharing: "Ukázkové sdílení", sharingDescription: "Náhled ukázkového odkazu ke sdílení", security: "Omezení ukázky", securityDescription: "Informace o omezeních soukromí a zabezpečení",
    teamTab: "Tým", chatTab: "Chat", shareTab: "Sdílení", securityTab: "Omezení", loadingProject: "Načítání ukázkového projektu…",
    quickStart: "Chcete začít?", quickStartDescription: "Ovládací prvky spolupráce na této stránce jsou pouze ukázkové a nejsou propojeny s vašimi skutečnými projekty ani týmem.",
    openEditor: "Otevřít editor", securityTitle: "Soukromí a zabezpečení ukázky", securityNotice: "Tato ukázka používá vzorový projekt a data v paměti. Nedokládá ani nezaručuje šifrování, řízení přístupu, protokoly aktivit ani zabezpečení produkčního prostředí. Nezadávejte skutečné osobní, důvěrné ani produkční údaje.",
    teamManagement: "Ukázkový tým", inviteEmail: "E-mailová adresa (pouze ukázka)", role: "Role", invite: "Přidat do ukázky", sending: "Přidávání…",
    inviteAdded: "Ukázková pozvánka přidána pro {email}", setViewer: "Nastavit jako čtenáře", setEditor: "Nastavit jako editora", remove: "Odebrat z ukázky", close: "Zavřít",
    chatRealtime: "Ukázková konverzace", writeMessage: "Napište ukázkovou zprávu…", send: "Odeslat",
    projectShare: "Sdílení ukázkového projektu", shareLinkDescription: "Tento vzorový odkaz neposkytuje přístup ke skutečným projektům.", copy: "Kopírovat", linkUnavailable: "Ukázkový odkaz není k dispozici",
  },
};
