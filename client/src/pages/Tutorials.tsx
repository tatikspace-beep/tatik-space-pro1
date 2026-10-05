import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown } from 'lucide-react';

type Guide = {
  id: string;
  title: string;
  description: string;
  action: string;
  href: string;
  steps: { title: string; content: string }[];
  resources?: { label: string; href: string }[];
};

type TutorialsCopy = {
  title: string;
  home: string;
  heading: string;
  intro: string;
  externalDocs: string;
  seoTitle: string;
  seoDescription: string;
  guides: Guide[];
};

export const tutorialsCopy: Record<string, TutorialsCopy> = {
  en: {
    title: "Practical guides", home: "Back to Home", heading: "Practical guides",
    intro: "These guides describe actions available in the current interface. Preview support varies by project; publishing must be completed with an external hosting provider.",
    externalDocs: "External documentation", seoTitle: "Practical Tatik.space Pro guides | Editor, backups and publishing",
    seoDescription: "Step-by-step guides to the Tatik.space Pro editor, project backups, and publishing files with an external hosting provider.",
    guides: [
      { id: "editor", title: "Work in the editor", description: "Open files, make changes, and preview supported web projects.", action: "Open editor", href: "/editor", steps: [
        { title: "Open the editor", content: "Sign in and open Editor from the site navigation. It loads the project workspace available to your account." },
        { title: "Open or add files", content: "Use the File menu to create or upload files, or open a local folder when your browser supports folder access." },
        { title: "Edit and preview", content: "Select a file to edit it. Preview works with supported web projects; it cannot run every language or project configuration." },
      ], resources: [{ label: "HTML on MDN", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "CSS on MDN", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "Save and back up your work", description: "Save individual files and use available backup controls to create or restore a project snapshot.", action: "Open editor", href: "/editor", steps: [
        { title: "Save the current file", content: "Use Save in the editor. Depending on how the file was opened, it may be saved to the project or downloaded to your device." },
        { title: "Create a backup", content: "Open Backup to manage project snapshots. Confirm that a backup completed before relying on it." },
        { title: "Restore carefully", content: "Choose a snapshot to restore. Restoring replaces the current project files with those in the selected snapshot." },
      ] },
      { id: "deployment", title: "Publish with an external hosting provider", description: "Tatik.space Pro does not currently publish projects directly. Deployment must be completed with a hosting provider.", action: "Deployment information", href: "/deployment", steps: [
        { title: "Prepare your files", content: "Save your project files from the editor. There is no working one-click deployment or Tatik-hosted production URL." },
        { title: "Choose a provider", content: "Use the provider’s documentation to create a site and upload or connect your project files." },
        { title: "Complete deployment there", content: "Configure build settings, environment variables, domains, SSL, and continuous deployment with the hosting provider, not in Tatik." },
      ], resources: [{ label: "Vercel documentation", href: "https://vercel.com/docs" }, { label: "Netlify documentation", href: "https://docs.netlify.com/" }] },
    ],
  },
  it: {
    title: "Guide pratiche", home: "Torna alla Home", heading: "Guide pratiche",
    intro: "Queste guide descrivono le operazioni disponibili nell’interfaccia attuale. L’anteprima dipende dal progetto; la pubblicazione va completata tramite un provider di hosting esterno.",
    externalDocs: "Documentazione esterna", seoTitle: "Guide pratiche Tatik.space Pro | Editor, backup e pubblicazione",
    seoDescription: "Guide passo dopo passo per usare l’editor Tatik.space Pro, gestire i backup dei progetti e pubblicare i file tramite un provider esterno.",
    guides: [
      { id: "editor", title: "Lavorare nell’editor", description: "Apri i file, modificali e visualizza l’anteprima dei progetti web supportati.", action: "Apri l’editor", href: "/editor", steps: [
        { title: "Apri l’editor", content: "Accedi al sito e apri Editor dalla navigazione. Verrà caricato lo spazio di lavoro disponibile per il tuo account." },
        { title: "Apri o aggiungi file", content: "Dal menu File puoi creare o caricare file, oppure aprire una cartella locale se il browser supporta questa funzione." },
        { title: "Modifica e visualizza", content: "Seleziona un file per modificarlo. L’anteprima funziona con i progetti web supportati, ma non esegue tutti i linguaggi o le configurazioni." },
      ], resources: [{ label: "HTML su MDN", href: "https://developer.mozilla.org/it/docs/Web/HTML" }, { label: "CSS su MDN", href: "https://developer.mozilla.org/it/docs/Web/CSS" }] },
      { id: "save-backup", title: "Salvare e fare il backup", description: "Salva i singoli file e usa i comandi disponibili per creare o ripristinare uno snapshot del progetto.", action: "Apri l’editor", href: "/editor", steps: [
        { title: "Salva il file corrente", content: "Usa Salva nell’editor. In base a come è stato aperto il file, puoi salvarlo nel progetto o scaricarlo sul dispositivo." },
        { title: "Crea un backup", content: "Apri Backup per gestire gli snapshot del progetto. Verifica che il backup sia stato completato prima di farci affidamento." },
        { title: "Ripristina con attenzione", content: "Scegli uno snapshot da ripristinare. Il ripristino sostituisce i file attuali del progetto con quelli dello snapshot selezionato." },
      ] },
      { id: "deployment", title: "Pubblicare con un hosting esterno", description: "Tatik.space Pro al momento non pubblica direttamente i progetti. Il deploy va completato tramite un provider di hosting.", action: "Informazioni sul deploy", href: "/deployment", steps: [
        { title: "Prepara i file", content: "Salva i file del progetto dall’editor. Non è disponibile un deploy funzionante con un clic né un URL di produzione ospitato da Tatik." },
        { title: "Scegli un provider", content: "Consulta la documentazione del provider per creare un sito e caricare o collegare i file del progetto." },
        { title: "Completa il deploy sul provider", content: "Configura build, variabili d’ambiente, domini, SSL e deploy continuo presso il provider, non nell’editor Tatik." },
      ], resources: [{ label: "Documentazione Vercel", href: "https://vercel.com/docs" }, { label: "Documentazione Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  es: {
    title: "Guías prácticas", home: "Volver al inicio", heading: "Guías prácticas",
    intro: "Estas guías describen las acciones disponibles en la interfaz actual. La vista previa depende del proyecto; la publicación debe completarse con un proveedor de alojamiento externo.",
    externalDocs: "Documentación externa", seoTitle: "Guías prácticas de Tatik.space Pro | Editor, copias y publicación",
    seoDescription: "Guías paso a paso para el editor de Tatik.space Pro, las copias de seguridad y la publicación con un proveedor externo.",
    guides: [
      { id: "editor", title: "Trabajar en el editor", description: "Abre y edita archivos y previsualiza proyectos web compatibles.", action: "Abrir el editor", href: "/editor", steps: [
        { title: "Abrir el editor", content: "Inicia sesión y abre Editor desde la navegación. Se cargará el espacio de trabajo disponible para tu cuenta." },
        { title: "Abrir o añadir archivos", content: "Usa el menú Archivo para crear o subir archivos, o abrir una carpeta local si tu navegador lo permite." },
        { title: "Editar y previsualizar", content: "Selecciona un archivo para editarlo. La vista previa funciona con proyectos web compatibles, pero no ejecuta todos los lenguajes ni configuraciones." },
      ], resources: [{ label: "HTML en MDN", href: "https://developer.mozilla.org/es/docs/Web/HTML" }, { label: "CSS en MDN", href: "https://developer.mozilla.org/es/docs/Web/CSS" }] },
      { id: "save-backup", title: "Guardar y crear copias de seguridad", description: "Guarda archivos individuales y usa los controles disponibles para crear o restaurar una instantánea del proyecto.", action: "Abrir el editor", href: "/editor", steps: [
        { title: "Guardar el archivo actual", content: "Usa Guardar en el editor. Según cómo se haya abierto el archivo, se guardará en el proyecto o se descargará en tu dispositivo." },
        { title: "Crear una copia", content: "Abre Backup para gestionar instantáneas del proyecto. Comprueba que la copia se haya completado antes de confiar en ella." },
        { title: "Restaurar con cuidado", content: "Elige una instantánea para restaurar. La restauración reemplaza los archivos actuales del proyecto por los de la instantánea." },
      ] },
      { id: "deployment", title: "Publicar con un proveedor externo", description: "Tatik.space Pro no publica proyectos directamente por ahora. Debes completar el despliegue con un proveedor de alojamiento.", action: "Información sobre publicación", href: "/deployment", steps: [
        { title: "Preparar los archivos", content: "Guarda los archivos del proyecto desde el editor. No hay despliegue con un clic ni una URL de producción alojada por Tatik." },
        { title: "Elegir un proveedor", content: "Consulta la documentación del proveedor para crear un sitio y subir o conectar los archivos del proyecto." },
        { title: "Completar la publicación allí", content: "Configura compilación, variables de entorno, dominio, SSL y despliegue continuo con el proveedor, no en Tatik." },
      ], resources: [{ label: "Documentación de Vercel", href: "https://vercel.com/docs" }, { label: "Documentación de Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  fr: {
    title: "Guides pratiques", home: "Retour à l’accueil", heading: "Guides pratiques",
    intro: "Ces guides décrivent les actions disponibles dans l’interface actuelle. L’aperçu dépend du projet ; la publication doit être effectuée auprès d’un hébergeur externe.",
    externalDocs: "Documentation externe", seoTitle: "Guides pratiques Tatik.space Pro | Éditeur, sauvegardes et publication",
    seoDescription: "Guides pas à pas pour utiliser l’éditeur Tatik.space Pro, gérer les sauvegardes et publier avec un hébergeur externe.",
    guides: [
      { id: "editor", title: "Travailler dans l’éditeur", description: "Ouvrez et modifiez des fichiers, puis prévisualisez les projets web compatibles.", action: "Ouvrir l’éditeur", href: "/editor", steps: [
        { title: "Ouvrir l’éditeur", content: "Connectez-vous et ouvrez l’éditeur depuis la navigation. L’espace de travail disponible pour votre compte se chargera." },
        { title: "Ouvrir ou ajouter des fichiers", content: "Dans le menu Fichier, créez ou importez des fichiers, ou ouvrez un dossier local si votre navigateur le permet." },
        { title: "Modifier et prévisualiser", content: "Sélectionnez un fichier pour le modifier. L’aperçu fonctionne avec les projets web compatibles, mais pas avec tous les langages ni toutes les configurations." },
      ], resources: [{ label: "HTML sur MDN", href: "https://developer.mozilla.org/fr/docs/Web/HTML" }, { label: "CSS sur MDN", href: "https://developer.mozilla.org/fr/docs/Web/CSS" }] },
      { id: "save-backup", title: "Enregistrer et sauvegarder votre travail", description: "Enregistrez les fichiers individuellement et utilisez les commandes disponibles pour créer ou restaurer un instantané.", action: "Ouvrir l’éditeur", href: "/editor", steps: [
        { title: "Enregistrer le fichier", content: "Utilisez Enregistrer dans l’éditeur. Selon son mode d’ouverture, le fichier sera enregistré dans le projet ou téléchargé sur votre appareil." },
        { title: "Créer une sauvegarde", content: "Ouvrez Backup pour gérer les instantanés du projet. Vérifiez qu’une sauvegarde est terminée avant de vous y fier." },
        { title: "Restaurer avec précaution", content: "Choisissez un instantané à restaurer. La restauration remplace les fichiers actuels du projet par ceux de l’instantané choisi." },
      ] },
      { id: "deployment", title: "Publier avec un hébergeur externe", description: "Tatik.space Pro ne publie pas encore les projets directement. Le déploiement doit être effectué auprès d’un hébergeur.", action: "Informations sur la publication", href: "/deployment", steps: [
        { title: "Préparer les fichiers", content: "Enregistrez les fichiers du projet depuis l’éditeur. Aucun déploiement fonctionnel en un clic ni URL de production hébergée par Tatik n’est disponible." },
        { title: "Choisir un hébergeur", content: "Consultez sa documentation pour créer un site et importer ou connecter les fichiers du projet." },
        { title: "Terminer le déploiement chez l’hébergeur", content: "Configurez compilation, variables d’environnement, domaine, SSL et déploiement continu chez l’hébergeur, pas dans Tatik." },
      ], resources: [{ label: "Documentation Vercel", href: "https://vercel.com/docs" }, { label: "Documentation Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  de: {
    title: "Praktische Anleitungen", home: "Zurück zur Startseite", heading: "Praktische Anleitungen",
    intro: "Diese Anleitungen beschreiben die Funktionen der aktuellen Oberfläche. Die Vorschau hängt vom Projekt ab; veröffentlicht wird über einen externen Hosting-Anbieter.",
    externalDocs: "Externe Dokumentation", seoTitle: "Tatik.space Pro: praktische Anleitungen | Editor, Backups und Veröffentlichung",
    seoDescription: "Schritt-für-Schritt-Anleitungen für den Tatik.space-Pro-Editor, Projekt-Backups und die Veröffentlichung über einen externen Hosting-Anbieter.",
    guides: [
      { id: "editor", title: "Im Editor arbeiten", description: "Dateien öffnen und bearbeiten sowie unterstützte Webprojekte in der Vorschau ansehen.", action: "Editor öffnen", href: "/editor", steps: [
        { title: "Editor öffnen", content: "Melde dich an und öffne den Editor über die Seitennavigation. Der für dein Konto verfügbare Arbeitsbereich wird geladen." },
        { title: "Dateien öffnen oder hinzufügen", content: "Erstelle oder lade Dateien über das Menü Datei hoch oder öffne einen lokalen Ordner, sofern dein Browser dies unterstützt." },
        { title: "Bearbeiten und Vorschau ansehen", content: "Wähle eine Datei zum Bearbeiten aus. Die Vorschau funktioniert mit unterstützten Webprojekten, aber nicht mit jeder Sprache und Konfiguration." },
      ], resources: [{ label: "HTML bei MDN", href: "https://developer.mozilla.org/de/docs/Web/HTML" }, { label: "CSS bei MDN", href: "https://developer.mozilla.org/de/docs/Web/CSS" }] },
      { id: "save-backup", title: "Arbeit speichern und sichern", description: "Speichere einzelne Dateien und erstelle oder stelle Projektsnapshots mit den verfügbaren Backup-Funktionen wieder her.", action: "Editor öffnen", href: "/editor", steps: [
        { title: "Aktuelle Datei speichern", content: "Verwende Speichern im Editor. Je nach Öffnungsart wird die Datei im Projekt gespeichert oder auf dein Gerät heruntergeladen." },
        { title: "Backup erstellen", content: "Öffne Backup, um Projektsnapshots zu verwalten. Prüfe, ob ein Backup abgeschlossen wurde, bevor du dich darauf verlässt." },
        { title: "Sorgfältig wiederherstellen", content: "Wähle einen Snapshot zur Wiederherstellung. Dabei werden die aktuellen Projektdateien durch die ausgewählten Snapshot-Dateien ersetzt." },
      ] },
      { id: "deployment", title: "Mit externem Hosting-Anbieter veröffentlichen", description: "Tatik.space Pro veröffentlicht Projekte derzeit nicht direkt. Die Bereitstellung muss über einen Hosting-Anbieter erfolgen.", action: "Informationen zur Veröffentlichung", href: "/deployment", steps: [
        { title: "Dateien vorbereiten", content: "Speichere die Projektdateien im Editor. Ein funktionierender Ein-Klick-Deploy oder eine von Tatik gehostete Produktions-URL ist nicht verfügbar." },
        { title: "Anbieter wählen", content: "Nutze die Dokumentation des Anbieters, um eine Website zu erstellen und Projektdateien hochzuladen oder zu verbinden." },
        { title: "Bereitstellung dort abschließen", content: "Build, Umgebungsvariablen, Domain, SSL und kontinuierliche Bereitstellung werden beim Hosting-Anbieter eingerichtet, nicht in Tatik." },
      ], resources: [{ label: "Vercel-Dokumentation", href: "https://vercel.com/docs" }, { label: "Netlify-Dokumentation", href: "https://docs.netlify.com/" }] },
    ],
  },
  pt: {
    title: "Guias práticos", home: "Voltar ao início", heading: "Guias práticos",
    intro: "Estes guias descrevem ações disponíveis na interface atual. A pré-visualização depende do projeto; a publicação deve ser concluída através de um fornecedor de alojamento externo.",
    externalDocs: "Documentação externa", seoTitle: "Guias práticos do Tatik.space Pro | Editor, cópias e publicação",
    seoDescription: "Guias passo a passo para o editor do Tatik.space Pro, cópias de segurança e publicação com um fornecedor externo.",
    guides: [
      { id: "editor", title: "Trabalhar no editor", description: "Abra e edite ficheiros e pré-visualize projetos web compatíveis.", action: "Abrir o editor", href: "/editor", steps: [
        { title: "Abrir o editor", content: "Inicie sessão e abra o Editor na navegação do site. Será carregado o espaço de trabalho disponível para a sua conta." },
        { title: "Abrir ou adicionar ficheiros", content: "Use o menu Ficheiro para criar ou carregar ficheiros, ou abrir uma pasta local se o navegador permitir." },
        { title: "Editar e pré-visualizar", content: "Selecione um ficheiro para o editar. A pré-visualização funciona com projetos web compatíveis, mas não executa todas as linguagens ou configurações." },
      ], resources: [{ label: "HTML na MDN", href: "https://developer.mozilla.org/pt-PT/docs/Web/HTML" }, { label: "CSS na MDN", href: "https://developer.mozilla.org/pt-PT/docs/Web/CSS" }] },
      { id: "save-backup", title: "Guardar e criar cópias de segurança", description: "Guarde ficheiros individualmente e use os controlos disponíveis para criar ou restaurar um snapshot do projeto.", action: "Abrir o editor", href: "/editor", steps: [
        { title: "Guardar o ficheiro atual", content: "Use Guardar no editor. Consoante a forma como o ficheiro foi aberto, pode ser guardado no projeto ou transferido para o dispositivo." },
        { title: "Criar uma cópia", content: "Abra Backup para gerir snapshots do projeto. Confirme que a cópia foi concluída antes de depender dela." },
        { title: "Restaurar com cuidado", content: "Escolha um snapshot para restaurar. O restauro substitui os ficheiros atuais do projeto pelos ficheiros desse snapshot." },
      ] },
      { id: "deployment", title: "Publicar através de alojamento externo", description: "O Tatik.space Pro ainda não publica projetos diretamente. A publicação tem de ser concluída num fornecedor de alojamento.", action: "Informações de publicação", href: "/deployment", steps: [
        { title: "Preparar os ficheiros", content: "Guarde os ficheiros do projeto no editor. Não existe publicação funcional com um clique nem URL de produção alojado pela Tatik." },
        { title: "Escolher um fornecedor", content: "Consulte a documentação do fornecedor para criar um site e carregar ou ligar os ficheiros do projeto." },
        { title: "Concluir a publicação no fornecedor", content: "Configure compilação, variáveis de ambiente, domínio, SSL e publicação contínua no fornecedor, não no Tatik." },
      ], resources: [{ label: "Documentação da Vercel", href: "https://vercel.com/docs" }, { label: "Documentação da Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  ru: {
    title: "Практические руководства", home: "На главную", heading: "Практические руководства",
    intro: "В руководствах описаны действия, доступные в текущем интерфейсе. Предпросмотр зависит от проекта; публикация выполняется через внешнего хостинг-провайдера.",
    externalDocs: "Внешняя документация", seoTitle: "Руководства Tatik.space Pro | Редактор, резервные копии и публикация",
    seoDescription: "Пошаговые руководства по редактору Tatik.space Pro, резервному копированию проектов и публикации через внешнего провайдера.",
    guides: [
      { id: "editor", title: "Работа в редакторе", description: "Открывайте и редактируйте файлы, просматривайте совместимые веб-проекты.", action: "Открыть редактор", href: "/editor", steps: [
        { title: "Открыть редактор", content: "Войдите в систему и откройте редактор через меню сайта. Загрузится рабочее пространство, доступное вашему аккаунту." },
        { title: "Открыть или добавить файлы", content: "Создавайте и загружайте файлы в меню «Файл» или открывайте локальную папку, если браузер это поддерживает." },
        { title: "Редактирование и предпросмотр", content: "Выберите файл для редактирования. Предпросмотр поддерживает совместимые веб-проекты, но не все языки и конфигурации." },
      ], resources: [{ label: "HTML на MDN", href: "https://developer.mozilla.org/ru/docs/Web/HTML" }, { label: "CSS на MDN", href: "https://developer.mozilla.org/ru/docs/Web/CSS" }] },
      { id: "save-backup", title: "Сохранение и резервное копирование", description: "Сохраняйте отдельные файлы и создавайте или восстанавливайте снимки проекта с помощью доступных средств резервного копирования.", action: "Открыть редактор", href: "/editor", steps: [
        { title: "Сохранить текущий файл", content: "Используйте команду сохранения в редакторе. В зависимости от способа открытия файл сохранится в проекте или загрузится на устройство." },
        { title: "Создать резервную копию", content: "Откройте Backup для управления снимками проекта. Убедитесь, что копирование завершено, прежде чем полагаться на него." },
        { title: "Осторожно восстановить", content: "Выберите снимок для восстановления. Текущие файлы проекта будут заменены файлами выбранного снимка." },
      ] },
      { id: "deployment", title: "Публикация через внешний хостинг", description: "Tatik.space Pro пока не публикует проекты напрямую. Развёртывание нужно выполнить у хостинг-провайдера.", action: "Информация о публикации", href: "/deployment", steps: [
        { title: "Подготовить файлы", content: "Сохраните файлы проекта из редактора. Рабочего развёртывания в один клик и производственного URL от Tatik нет." },
        { title: "Выбрать провайдера", content: "Следуйте документации провайдера, чтобы создать сайт и загрузить или подключить файлы проекта." },
        { title: "Завершить развёртывание там", content: "Сборка, переменные среды, домен, SSL и непрерывное развёртывание настраиваются у провайдера, а не в Tatik." },
      ], resources: [{ label: "Документация Vercel", href: "https://vercel.com/docs" }, { label: "Документация Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  zh: {
    title: "实用指南", home: "返回首页", heading: "实用指南",
    intro: "本指南介绍当前界面中可用的操作。预览能力取决于项目；项目需要通过外部托管服务完成发布。",
    externalDocs: "外部文档", seoTitle: "Tatik.space Pro 实用指南 | 编辑器、备份与发布",
    seoDescription: "通过分步指南了解 Tatik.space Pro 编辑器、项目备份以及使用外部托管服务发布文件。",
    guides: [
      { id: "editor", title: "在编辑器中工作", description: "打开并编辑文件，预览受支持的 Web 项目。", action: "打开编辑器", href: "/editor", steps: [
        { title: "打开编辑器", content: "登录后，从网站导航中打开编辑器。系统会加载你的账户可用的项目工作区。" },
        { title: "打开或添加文件", content: "在“文件”菜单中创建或上传文件；如果浏览器支持，也可以打开本地文件夹。" },
        { title: "编辑和预览", content: "选择文件进行编辑。预览适用于受支持的 Web 项目，但并非所有语言或项目配置都能运行。" },
      ], resources: [{ label: "MDN HTML 文档", href: "https://developer.mozilla.org/zh-CN/docs/Web/HTML" }, { label: "MDN CSS 文档", href: "https://developer.mozilla.org/zh-CN/docs/Web/CSS" }] },
      { id: "save-backup", title: "保存和备份工作", description: "保存单个文件，并使用备份功能创建或恢复项目快照。", action: "打开编辑器", href: "/editor", steps: [
        { title: "保存当前文件", content: "在编辑器中使用保存。文件的保存位置取决于打开方式，可能写入项目或下载到设备。" },
        { title: "创建备份", content: "打开 Backup 管理项目快照。依赖备份前，请确认备份已完成。" },
        { title: "谨慎恢复", content: "选择要恢复的快照。恢复操作会用所选快照中的文件替换当前项目文件。" },
      ] },
      { id: "deployment", title: "通过外部托管服务发布", description: "Tatik.space Pro 目前不直接发布项目；需要通过托管服务完成部署。", action: "查看发布说明", href: "/deployment", steps: [
        { title: "准备文件", content: "从编辑器保存项目文件。目前没有可用的一键部署功能，也没有由 Tatik 托管的生产网址。" },
        { title: "选择服务商", content: "按照服务商文档创建网站，并上传或连接项目文件。" },
        { title: "在服务商处完成部署", content: "构建设置、环境变量、域名、SSL 和持续部署均在托管服务商处配置，而非 Tatik 编辑器中。" },
      ], resources: [{ label: "Vercel 文档", href: "https://vercel.com/docs" }, { label: "Netlify 文档", href: "https://docs.netlify.com/" }] },
    ],
  },
  ja: {
    title: "実践ガイド", home: "ホームに戻る", heading: "実践ガイド",
    intro: "このガイドでは現在の画面で利用できる操作を説明します。プレビューはプロジェクトによって異なり、公開には外部ホスティングサービスが必要です。",
    externalDocs: "外部ドキュメント", seoTitle: "Tatik.space Pro 実践ガイド | エディター、バックアップ、公開",
    seoDescription: "Tatik.space Pro エディター、プロジェクトのバックアップ、外部ホスティングを使った公開方法を手順ごとに紹介します。",
    guides: [
      { id: "editor", title: "エディターで作業する", description: "ファイルを開いて編集し、対応する Web プロジェクトをプレビューします。", action: "エディターを開く", href: "/editor", steps: [
        { title: "エディターを開く", content: "ログインし、サイトのナビゲーションからエディターを開きます。アカウントで利用できるワークスペースが読み込まれます。" },
        { title: "ファイルを開く・追加する", content: "「ファイル」メニューからファイルを作成・アップロードするか、ブラウザーが対応していればローカルフォルダーを開きます。" },
        { title: "編集してプレビューする", content: "ファイルを選択して編集します。プレビューは対応する Web プロジェクトで利用できますが、すべての言語や構成を実行できるわけではありません。" },
      ], resources: [{ label: "MDN HTML", href: "https://developer.mozilla.org/ja/docs/Web/HTML" }, { label: "MDN CSS", href: "https://developer.mozilla.org/ja/docs/Web/CSS" }] },
      { id: "save-backup", title: "作業を保存・バックアップする", description: "個別ファイルを保存し、利用可能なバックアップ機能でスナップショットを作成・復元します。", action: "エディターを開く", href: "/editor", steps: [
        { title: "現在のファイルを保存する", content: "エディターで保存を実行します。ファイルの開き方によって、プロジェクトへの保存または端末へのダウンロードになります。" },
        { title: "バックアップを作成する", content: "Backup を開いてプロジェクトのスナップショットを管理します。利用する前にバックアップの完了を確認してください。" },
        { title: "慎重に復元する", content: "復元するスナップショットを選択します。現在のプロジェクトファイルは選択した内容に置き換わります。" },
      ] },
      { id: "deployment", title: "外部ホスティングで公開する", description: "Tatik.space Pro は現在、プロジェクトを直接公開しません。ホスティングサービスで公開作業を行ってください。", action: "公開について", href: "/deployment", steps: [
        { title: "ファイルを準備する", content: "エディターからプロジェクトファイルを保存します。ワンクリック公開や Tatik の本番ホスティング URL はありません。" },
        { title: "サービスを選ぶ", content: "サービスのドキュメントに従ってサイトを作成し、プロジェクトファイルをアップロードまたは接続します。" },
        { title: "サービス側で公開を完了する", content: "ビルド設定、環境変数、ドメイン、SSL、継続的デプロイは Tatik ではなくホスティングサービス側で設定します。" },
      ], resources: [{ label: "Vercel ドキュメント", href: "https://vercel.com/docs" }, { label: "Netlify ドキュメント", href: "https://docs.netlify.com/" }] },
    ],
  },
  ko: {
    title: "실용 가이드", home: "홈으로 돌아가기", heading: "실용 가이드",
    intro: "이 가이드는 현재 인터페이스에서 사용할 수 있는 작업을 설명합니다. 미리보기는 프로젝트에 따라 다르며, 게시하려면 외부 호스팅 제공업체를 이용해야 합니다.",
    externalDocs: "외부 문서", seoTitle: "Tatik.space Pro 실용 가이드 | 편집기, 백업 및 게시",
    seoDescription: "Tatik.space Pro 편집기 사용, 프로젝트 백업, 외부 호스팅을 통한 게시 방법을 단계별로 안내합니다.",
    guides: [
      { id: "editor", title: "편집기에서 작업하기", description: "파일을 열고 수정한 뒤 지원되는 웹 프로젝트를 미리 봅니다.", action: "편집기 열기", href: "/editor", steps: [
        { title: "편집기 열기", content: "로그인한 뒤 사이트 메뉴에서 편집기를 엽니다. 계정에서 사용할 수 있는 작업 공간이 로드됩니다." },
        { title: "파일 열기 또는 추가", content: "파일 메뉴에서 파일을 만들거나 업로드하고, 브라우저가 지원하면 로컬 폴더를 엽니다." },
        { title: "편집 및 미리보기", content: "파일을 선택해 편집합니다. 미리보기는 지원되는 웹 프로젝트에서 작동하지만 모든 언어나 설정을 실행하지는 않습니다." },
      ], resources: [{ label: "MDN HTML 문서", href: "https://developer.mozilla.org/ko/docs/Web/HTML" }, { label: "MDN CSS 문서", href: "https://developer.mozilla.org/ko/docs/Web/CSS" }] },
      { id: "save-backup", title: "작업 저장 및 백업", description: "개별 파일을 저장하고 제공되는 백업 기능으로 프로젝트 스냅샷을 만들거나 복원합니다.", action: "편집기 열기", href: "/editor", steps: [
        { title: "현재 파일 저장", content: "편집기에서 저장을 사용하세요. 파일을 연 방식에 따라 프로젝트에 저장되거나 기기로 다운로드됩니다." },
        { title: "백업 만들기", content: "Backup을 열어 프로젝트 스냅샷을 관리하세요. 백업에 의존하기 전에 완료 여부를 확인하세요." },
        { title: "주의해서 복원", content: "복원할 스냅샷을 선택하세요. 복원하면 현재 프로젝트 파일이 선택한 스냅샷의 파일로 대체됩니다." },
      ] },
      { id: "deployment", title: "외부 호스팅 제공업체로 게시", description: "Tatik.space Pro는 현재 프로젝트를 직접 게시하지 않습니다. 호스팅 제공업체에서 배포를 완료해야 합니다.", action: "게시 정보", href: "/deployment", steps: [
        { title: "파일 준비", content: "편집기에서 프로젝트 파일을 저장하세요. 원클릭 배포 기능이나 Tatik 호스팅 프로덕션 URL은 제공되지 않습니다." },
        { title: "제공업체 선택", content: "제공업체 문서를 따라 사이트를 만들고 프로젝트 파일을 업로드하거나 연결하세요." },
        { title: "제공업체에서 배포 완료", content: "빌드 설정, 환경 변수, 도메인, SSL, 지속적 배포는 Tatik이 아니라 호스팅 제공업체에서 설정합니다." },
      ], resources: [{ label: "Vercel 문서", href: "https://vercel.com/docs" }, { label: "Netlify 문서", href: "https://docs.netlify.com/" }] },
    ],
  },
  ar: {
    title: "أدلة عملية", home: "العودة إلى الرئيسية", heading: "أدلة عملية",
    intro: "تشرح هذه الأدلة الإجراءات المتاحة في الواجهة الحالية. تعتمد المعاينة على المشروع؛ ويجب إتمام النشر عبر مزود استضافة خارجي.",
    externalDocs: "توثيق خارجي", seoTitle: "أدلة Tatik.space Pro العملية | المحرر والنسخ الاحتياطي والنشر",
    seoDescription: "أدلة خطوة بخطوة لاستخدام محرر Tatik.space Pro والنسخ الاحتياطي للمشاريع والنشر عبر مزود استضافة خارجي.",
    guides: [
      { id: "editor", title: "العمل في المحرر", description: "افتح الملفات وعدّلها واعرض معاينة مشاريع الويب المدعومة.", action: "فتح المحرر", href: "/editor", steps: [
        { title: "فتح المحرر", content: "سجّل الدخول وافتح المحرر من قائمة الموقع. ستظهر مساحة العمل المتاحة لحسابك." },
        { title: "فتح الملفات أو إضافتها", content: "استخدم قائمة الملفات لإنشاء الملفات أو تحميلها، أو افتح مجلدًا محليًا إذا كان المتصفح يدعم ذلك." },
        { title: "التحرير والمعاينة", content: "حدّد ملفًا لتحريره. تعمل المعاينة مع مشاريع الويب المدعومة، لكنها لا تشغّل جميع اللغات أو الإعدادات." },
      ], resources: [{ label: "HTML على MDN", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "CSS على MDN", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "حفظ العمل ونسخه احتياطيًا", description: "احفظ الملفات منفردة واستخدم عناصر النسخ الاحتياطي المتاحة لإنشاء لقطة للمشروع أو استعادتها.", action: "فتح المحرر", href: "/editor", steps: [
        { title: "حفظ الملف الحالي", content: "استخدم الحفظ في المحرر. بحسب طريقة فتح الملف، قد يُحفظ في المشروع أو يُنزّل إلى جهازك." },
        { title: "إنشاء نسخة احتياطية", content: "افتح Backup لإدارة لقطات المشروع. تأكد من اكتمال النسخ قبل الاعتماد عليه." },
        { title: "الاستعادة بحذر", content: "اختر لقطة لاستعادتها. تستبدل عملية الاستعادة ملفات المشروع الحالية بملفات اللقطة المختارة." },
      ] },
      { id: "deployment", title: "النشر عبر مزود استضافة خارجي", description: "لا ينشر Tatik.space Pro المشاريع مباشرة حاليًا. يجب إكمال النشر عبر مزود استضافة.", action: "معلومات النشر", href: "/deployment", steps: [
        { title: "إعداد الملفات", content: "احفظ ملفات المشروع من المحرر. لا تتوفر عملية نشر فعالة بنقرة واحدة أو عنوان إنتاج مستضاف لدى Tatik." },
        { title: "اختيار مزود", content: "اتبع توثيق المزود لإنشاء موقع وتحميل ملفات المشروع أو ربطها." },
        { title: "إكمال النشر لدى المزود", content: "اضبط إعدادات البناء ومتغيرات البيئة والنطاق وSSL والنشر المستمر لدى المزود، وليس في Tatik." },
      ], resources: [{ label: "توثيق Vercel", href: "https://vercel.com/docs" }, { label: "توثيق Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  hi: {
    title: "व्यावहारिक गाइड", home: "होम पर वापस जाएँ", heading: "व्यावहारिक गाइड",
    intro: "ये गाइड मौजूदा इंटरफ़ेस में उपलब्ध काम के तरीके बताती हैं। प्रीव्यू प्रोजेक्ट पर निर्भर है; प्रकाशन बाहरी होस्टिंग प्रदाता के माध्यम से पूरा करना होगा।",
    externalDocs: "बाहरी दस्तावेज़", seoTitle: "Tatik.space Pro व्यावहारिक गाइड | एडिटर, बैकअप और प्रकाशन",
    seoDescription: "Tatik.space Pro एडिटर, प्रोजेक्ट बैकअप और बाहरी होस्टिंग प्रदाता से प्रकाशन के लिए चरण-दर-चरण गाइड।",
    guides: [
      { id: "editor", title: "एडिटर में काम करें", description: "फ़ाइलें खोलें और संपादित करें तथा समर्थित वेब प्रोजेक्ट का प्रीव्यू देखें।", action: "एडिटर खोलें", href: "/editor", steps: [
        { title: "एडिटर खोलें", content: "साइन इन करें और साइट मेनू से एडिटर खोलें। आपके खाते के लिए उपलब्ध कार्यक्षेत्र लोड होगा।" },
        { title: "फ़ाइलें खोलें या जोड़ें", content: "फ़ाइल मेनू से फ़ाइल बनाएँ या अपलोड करें, या ब्राउज़र समर्थन करे तो स्थानीय फ़ोल्डर खोलें।" },
        { title: "संपादन और प्रीव्यू", content: "संपादन के लिए फ़ाइल चुनें। प्रीव्यू समर्थित वेब प्रोजेक्ट पर काम करता है; यह हर भाषा या कॉन्फ़िगरेशन नहीं चला सकता।" },
      ], resources: [{ label: "MDN HTML", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "MDN CSS", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "काम सहेजें और बैकअप लें", description: "अलग-अलग फ़ाइलें सहेजें और प्रोजेक्ट स्नैपशॉट बनाने या पुनर्स्थापित करने के लिए उपलब्ध बैकअप नियंत्रणों का उपयोग करें।", action: "एडिटर खोलें", href: "/editor", steps: [
        { title: "मौजूदा फ़ाइल सहेजें", content: "एडिटर में Save का उपयोग करें। फ़ाइल खोलने के तरीके के अनुसार यह प्रोजेक्ट में सहेजी जा सकती है या डिवाइस पर डाउनलोड हो सकती है।" },
        { title: "बैकअप बनाएँ", content: "प्रोजेक्ट स्नैपशॉट प्रबंधित करने के लिए Backup खोलें। निर्भर होने से पहले पुष्टि करें कि बैकअप पूरा हुआ है।" },
        { title: "सावधानी से पुनर्स्थापित करें", content: "पुनर्स्थापित करने के लिए स्नैपशॉट चुनें। इससे मौजूदा प्रोजेक्ट फ़ाइलें चुने गए स्नैपशॉट की फ़ाइलों से बदल जाती हैं।" },
      ] },
      { id: "deployment", title: "बाहरी होस्टिंग प्रदाता से प्रकाशित करें", description: "Tatik.space Pro अभी प्रोजेक्ट सीधे प्रकाशित नहीं करता। होस्टिंग प्रदाता से डिप्लॉयमेंट पूरा करें।", action: "प्रकाशन की जानकारी", href: "/deployment", steps: [
        { title: "फ़ाइलें तैयार करें", content: "एडिटर से प्रोजेक्ट फ़ाइलें सहेजें। एक-क्लिक डिप्लॉयमेंट या Tatik द्वारा होस्ट किया गया प्रोडक्शन URL उपलब्ध नहीं है।" },
        { title: "प्रदाता चुनें", content: "साइट बनाने और प्रोजेक्ट फ़ाइलें अपलोड या कनेक्ट करने के लिए प्रदाता के दस्तावेज़ों का पालन करें।" },
        { title: "प्रदाता पर डिप्लॉयमेंट पूरा करें", content: "बिल्ड सेटिंग, एनवायरनमेंट वैरिएबल, डोमेन, SSL और निरंतर डिप्लॉयमेंट प्रदाता पर सेट करें, Tatik में नहीं।" },
      ], resources: [{ label: "Vercel दस्तावेज़", href: "https://vercel.com/docs" }, { label: "Netlify दस्तावेज़", href: "https://docs.netlify.com/" }] },
    ],
  },
  pl: {
    title: "Praktyczne poradniki", home: "Wróć na stronę główną", heading: "Praktyczne poradniki",
    intro: "Poradniki opisują działania dostępne w obecnym interfejsie. Podgląd zależy od projektu, a publikację należy przeprowadzić u zewnętrznego dostawcy hostingu.",
    externalDocs: "Dokumentacja zewnętrzna", seoTitle: "Praktyczne poradniki Tatik.space Pro | Edytor, kopie i publikowanie",
    seoDescription: "Instrukcje krok po kroku dotyczące edytora Tatik.space Pro, kopii zapasowych projektów i publikowania u zewnętrznego dostawcy.",
    guides: [
      { id: "editor", title: "Praca w edytorze", description: "Otwieraj i edytuj pliki oraz wyświetlaj podgląd obsługiwanych projektów internetowych.", action: "Otwórz edytor", href: "/editor", steps: [
        { title: "Otwórz edytor", content: "Zaloguj się i otwórz Edytor z nawigacji strony. Załaduje się przestrzeń robocza dostępna na Twoim koncie." },
        { title: "Otwieranie i dodawanie plików", content: "Użyj menu Plik, aby utworzyć lub przesłać pliki albo otworzyć folder lokalny, jeśli przeglądarka to obsługuje." },
        { title: "Edycja i podgląd", content: "Wybierz plik do edycji. Podgląd działa w obsługiwanych projektach internetowych, ale nie uruchamia wszystkich języków ani konfiguracji." },
      ], resources: [{ label: "HTML w MDN", href: "https://developer.mozilla.org/pl/docs/Web/HTML" }, { label: "CSS w MDN", href: "https://developer.mozilla.org/pl/docs/Web/CSS" }] },
      { id: "save-backup", title: "Zapisywanie i tworzenie kopii zapasowych", description: "Zapisuj pojedyncze pliki oraz twórz lub przywracaj migawki projektu za pomocą dostępnych narzędzi kopii zapasowych.", action: "Otwórz edytor", href: "/editor", steps: [
        { title: "Zapisz bieżący plik", content: "Użyj polecenia Zapisz w edytorze. Zależnie od sposobu otwarcia plik zostanie zapisany w projekcie lub pobrany na urządzenie." },
        { title: "Utwórz kopię", content: "Otwórz Backup, aby zarządzać migawkami projektu. Sprawdź, czy kopia została ukończona, zanim na niej polegniesz." },
        { title: "Ostrożnie przywróć", content: "Wybierz migawkę do przywrócenia. Zastąpi ona bieżące pliki projektu plikami z wybranej migawki." },
      ] },
      { id: "deployment", title: "Publikowanie u zewnętrznego dostawcy hostingu", description: "Tatik.space Pro nie publikuje obecnie projektów bezpośrednio. Wdrożenie należy wykonać u dostawcy hostingu.", action: "Informacje o publikowaniu", href: "/deployment", steps: [
        { title: "Przygotuj pliki", content: "Zapisz pliki projektu w edytorze. Nie ma działającego wdrożenia jednym kliknięciem ani produkcyjnego adresu hostowanego przez Tatik." },
        { title: "Wybierz dostawcę", content: "Skorzystaj z dokumentacji dostawcy, aby utworzyć witrynę i przesłać lub podłączyć pliki projektu." },
        { title: "Dokończ wdrożenie u dostawcy", content: "Kompilację, zmienne środowiskowe, domenę, SSL i ciągłe wdrażanie konfiguruje się u dostawcy, nie w Tatik." },
      ], resources: [{ label: "Dokumentacja Vercel", href: "https://vercel.com/docs" }, { label: "Dokumentacja Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  nl: {
    title: "Praktische handleidingen", home: "Terug naar home", heading: "Praktische handleidingen",
    intro: "Deze handleidingen beschrijven acties die in de huidige interface beschikbaar zijn. Voorbeeldweergave hangt af van het project; publiceren gebeurt via een externe hostingprovider.",
    externalDocs: "Externe documentatie", seoTitle: "Praktische Tatik.space Pro-handleidingen | Editor, back-ups en publiceren",
    seoDescription: "Stapsgewijze handleidingen voor de Tatik.space Pro-editor, projectback-ups en publiceren via een externe hostingprovider.",
    guides: [
      { id: "editor", title: "Werken in de editor", description: "Open en bewerk bestanden en bekijk ondersteunde webprojecten in de voorbeeldweergave.", action: "Editor openen", href: "/editor", steps: [
        { title: "De editor openen", content: "Log in en open Editor via de websitenavigatie. De werkruimte die voor je account beschikbaar is, wordt geladen." },
        { title: "Bestanden openen of toevoegen", content: "Maak of upload bestanden via het menu Bestand, of open een lokale map als je browser dit ondersteunt." },
        { title: "Bewerken en bekijken", content: "Selecteer een bestand om het te bewerken. De voorbeeldweergave werkt voor ondersteunde webprojecten, maar niet voor elke taal of configuratie." },
      ], resources: [{ label: "HTML op MDN", href: "https://developer.mozilla.org/nl/docs/Web/HTML" }, { label: "CSS op MDN", href: "https://developer.mozilla.org/nl/docs/Web/CSS" }] },
      { id: "save-backup", title: "Werk opslaan en back-uppen", description: "Sla afzonderlijke bestanden op en maak of herstel projectsnapshots met de beschikbare back-upopties.", action: "Editor openen", href: "/editor", steps: [
        { title: "Huidig bestand opslaan", content: "Gebruik Opslaan in de editor. Afhankelijk van hoe het bestand is geopend, wordt het opgeslagen in het project of gedownload naar je apparaat." },
        { title: "Een back-up maken", content: "Open Backup om projectsnapshots te beheren. Controleer of de back-up is voltooid voordat je erop vertrouwt." },
        { title: "Voorzichtig herstellen", content: "Kies een snapshot om te herstellen. De huidige projectbestanden worden vervangen door de bestanden uit de geselecteerde snapshot." },
      ] },
      { id: "deployment", title: "Publiceren via externe hosting", description: "Tatik.space Pro publiceert projecten momenteel niet rechtstreeks. Voltooi de implementatie via een hostingprovider.", action: "Informatie over publiceren", href: "/deployment", steps: [
        { title: "Bestanden voorbereiden", content: "Sla de projectbestanden op vanuit de editor. Er is geen werkende implementatie met één klik of productie-URL van Tatik." },
        { title: "Een provider kiezen", content: "Volg de documentatie van de provider om een site te maken en projectbestanden te uploaden of te koppelen." },
        { title: "Implementatie daar afronden", content: "Configureer buildinstellingen, omgevingsvariabelen, domein, SSL en continue implementatie bij de provider, niet in Tatik." },
      ], resources: [{ label: "Vercel-documentatie", href: "https://vercel.com/docs" }, { label: "Netlify-documentatie", href: "https://docs.netlify.com/" }] },
    ],
  },
  tr: {
    title: "Uygulamalı kılavuzlar", home: "Ana sayfaya dön", heading: "Uygulamalı kılavuzlar",
    intro: "Bu kılavuzlar mevcut arayüzde kullanılabilen işlemleri açıklar. Önizleme projeye bağlıdır; yayınlama harici bir barındırma sağlayıcısıyla tamamlanmalıdır.",
    externalDocs: "Harici belgeler", seoTitle: "Tatik.space Pro uygulamalı kılavuzları | Düzenleyici, yedek ve yayınlama",
    seoDescription: "Tatik.space Pro düzenleyicisi, proje yedekleri ve harici barındırma sağlayıcısıyla yayınlama için adım adım kılavuzlar.",
    guides: [
      { id: "editor", title: "Düzenleyicide çalışma", description: "Dosyaları açıp düzenleyin ve desteklenen web projelerini önizleyin.", action: "Düzenleyiciyi aç", href: "/editor", steps: [
        { title: "Düzenleyiciyi açın", content: "Oturum açın ve site menüsünden Düzenleyici'yi açın. Hesabınız için kullanılabilir çalışma alanı yüklenir." },
        { title: "Dosyaları açın veya ekleyin", content: "Dosya menüsünden dosya oluşturun veya yükleyin ya da tarayıcınız destekliyorsa yerel bir klasör açın." },
        { title: "Düzenleme ve önizleme", content: "Düzenlemek için bir dosya seçin. Önizleme desteklenen web projelerinde çalışır; tüm dilleri veya yapılandırmaları çalıştıramaz." },
      ], resources: [{ label: "MDN'de HTML", href: "https://developer.mozilla.org/tr/docs/Web/HTML" }, { label: "MDN'de CSS", href: "https://developer.mozilla.org/tr/docs/Web/CSS" }] },
      { id: "save-backup", title: "Çalışmanızı kaydetme ve yedekleme", description: "Dosyaları ayrı ayrı kaydedin ve proje anlık görüntülerini oluşturmak veya geri yüklemek için yedekleme kontrollerini kullanın.", action: "Düzenleyiciyi aç", href: "/editor", steps: [
        { title: "Geçerli dosyayı kaydedin", content: "Düzenleyicide Kaydet'i kullanın. Dosyanın açılma biçimine bağlı olarak proje içine kaydedilebilir veya cihazınıza indirilebilir." },
        { title: "Yedek oluşturun", content: "Proje anlık görüntülerini yönetmek için Backup'ı açın. Güvenmeden önce yedeklemenin tamamlandığını doğrulayın." },
        { title: "Dikkatlice geri yükleyin", content: "Geri yüklenecek görüntüyü seçin. Geçerli proje dosyaları seçilen görüntüdeki dosyalarla değiştirilir." },
      ] },
      { id: "deployment", title: "Harici barındırma sağlayıcısıyla yayınlama", description: "Tatik.space Pro şu anda projeleri doğrudan yayınlamaz. Dağıtım bir barındırma sağlayıcısıyla tamamlanmalıdır.", action: "Yayınlama bilgileri", href: "/deployment", steps: [
        { title: "Dosyaları hazırlayın", content: "Proje dosyalarını düzenleyiciden kaydedin. Çalışan tek tıklamalı dağıtım veya Tatik üretim URL'si yoktur." },
        { title: "Sağlayıcı seçin", content: "Site oluşturmak ve proje dosyalarını yüklemek ya da bağlamak için sağlayıcının belgelerini izleyin." },
        { title: "Dağıtımı sağlayıcıda tamamlayın", content: "Derleme ayarları, ortam değişkenleri, alan adı, SSL ve sürekli dağıtım Tatik'te değil, sağlayıcıda yapılandırılır." },
      ], resources: [{ label: "Vercel belgeleri", href: "https://vercel.com/docs" }, { label: "Netlify belgeleri", href: "https://docs.netlify.com/" }] },
    ],
  },
  sv: {
    title: "Praktiska guider", home: "Tillbaka till startsidan", heading: "Praktiska guider",
    intro: "Guiderna beskriver åtgärder som är tillgängliga i det aktuella gränssnittet. Förhandsgranskning beror på projektet; publicering görs via en extern webbhotellstjänst.",
    externalDocs: "Extern dokumentation", seoTitle: "Praktiska guider för Tatik.space Pro | Redigerare, säkerhetskopior och publicering",
    seoDescription: "Stegvisa guider till Tatik.space Pro-redigeraren, projektsäkerhetskopior och publicering via en extern webbhotellstjänst.",
    guides: [
      { id: "editor", title: "Arbeta i redigeraren", description: "Öppna och redigera filer och förhandsgranska webbprojekt som stöds.", action: "Öppna redigeraren", href: "/editor", steps: [
        { title: "Öppna redigeraren", content: "Logga in och öppna Redigeraren via webbplatsens navigering. Arbetsytan som är tillgänglig för ditt konto läses in." },
        { title: "Öppna eller lägg till filer", content: "Skapa eller ladda upp filer via menyn Arkiv, eller öppna en lokal mapp om webbläsaren stöder det." },
        { title: "Redigera och förhandsgranska", content: "Välj en fil att redigera. Förhandsgranskningen fungerar för webbprojekt som stöds, men inte för alla språk eller konfigurationer." },
      ], resources: [{ label: "HTML på MDN", href: "https://developer.mozilla.org/sv/docs/Web/HTML" }, { label: "CSS på MDN", href: "https://developer.mozilla.org/sv/docs/Web/CSS" }] },
      { id: "save-backup", title: "Spara och säkerhetskopiera arbetet", description: "Spara enskilda filer och använd tillgängliga säkerhetskopior för att skapa eller återställa en projektsnapshot.", action: "Öppna redigeraren", href: "/editor", steps: [
        { title: "Spara den aktuella filen", content: "Använd Spara i redigeraren. Beroende på hur filen öppnades sparas den i projektet eller laddas ned till enheten." },
        { title: "Skapa en säkerhetskopia", content: "Öppna Backup för att hantera projektsnapshots. Kontrollera att kopieringen är klar innan du förlitar dig på den." },
        { title: "Återställ försiktigt", content: "Välj en snapshot att återställa. De aktuella projektfilerna ersätts med filerna i den valda snapshoten." },
      ] },
      { id: "deployment", title: "Publicera via extern webbhotellstjänst", description: "Tatik.space Pro publicerar inte projekt direkt just nu. Driftsättningen måste slutföras hos en webbhotellstjänst.", action: "Information om publicering", href: "/deployment", steps: [
        { title: "Förbered filerna", content: "Spara projektfilerna från redigeraren. Det finns ingen fungerande driftsättning med ett klick eller produktionsadress hos Tatik." },
        { title: "Välj leverantör", content: "Följ leverantörens dokumentation för att skapa en webbplats och ladda upp eller ansluta projektfilerna." },
        { title: "Slutför driftsättningen där", content: "Bygginställningar, miljövariabler, domän, SSL och kontinuerlig driftsättning konfigureras hos leverantören, inte i Tatik." },
      ], resources: [{ label: "Vercel-dokumentation", href: "https://vercel.com/docs" }, { label: "Netlify-dokumentation", href: "https://docs.netlify.com/" }] },
    ],
  },
  da: {
    title: "Praktiske vejledninger", home: "Tilbage til forsiden", heading: "Praktiske vejledninger",
    intro: "Vejledningerne beskriver handlinger, der er tilgængelige i den aktuelle grænseflade. Forhåndsvisning afhænger af projektet; publicering gennemføres hos en ekstern hostingudbyder.",
    externalDocs: "Ekstern dokumentation", seoTitle: "Praktiske Tatik.space Pro-vejledninger | Editor, sikkerhedskopier og publicering",
    seoDescription: "Trinvis vejledning til Tatik.space Pro-editoren, projektsikkerhedskopier og publicering via en ekstern hostingudbyder.",
    guides: [
      { id: "editor", title: "Arbejd i editoren", description: "Åbn og rediger filer, og få vist understøttede webprojekter.", action: "Åbn editoren", href: "/editor", steps: [
        { title: "Åbn editoren", content: "Log ind, og åbn Editor fra webstedets navigation. Det arbejdsområde, der er tilgængeligt for din konto, indlæses." },
        { title: "Åbn eller tilføj filer", content: "Opret eller upload filer via menuen Filer, eller åbn en lokal mappe, hvis browseren understøtter det." },
        { title: "Redigér og forhåndsvis", content: "Vælg en fil, der skal redigeres. Forhåndsvisning fungerer for understøttede webprojekter, men ikke for alle sprog eller konfigurationer." },
      ], resources: [{ label: "HTML på MDN", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "CSS på MDN", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "Gem og sikkerhedskopiér dit arbejde", description: "Gem enkelte filer, og opret eller gendan projektsnapshots med de tilgængelige sikkerhedskopifunktioner.", action: "Åbn editoren", href: "/editor", steps: [
        { title: "Gem den aktuelle fil", content: "Brug Gem i editoren. Afhængigt af hvordan filen blev åbnet, gemmes den i projektet eller downloades til din enhed." },
        { title: "Opret en sikkerhedskopi", content: "Åbn Backup for at administrere projektsnapshots. Kontrollér, at sikkerhedskopien er fuldført, før du stoler på den." },
        { title: "Gendan med omtanke", content: "Vælg et snapshot, der skal gendannes. De aktuelle projektfiler erstattes af filerne i det valgte snapshot." },
      ] },
      { id: "deployment", title: "Publicér via ekstern hosting", description: "Tatik.space Pro publicerer ikke projekter direkte i øjeblikket. Publiceringen skal gennemføres hos en hostingudbyder.", action: "Oplysninger om publicering", href: "/deployment", steps: [
        { title: "Klargør filerne", content: "Gem projektfilerne fra editoren. Der findes ikke en fungerende publicering med ét klik eller en produktionsadresse fra Tatik." },
        { title: "Vælg en udbyder", content: "Følg udbyderens dokumentation for at oprette et websted og uploade eller tilslutte projektfilerne." },
        { title: "Afslut publiceringen dér", content: "Buildindstillinger, miljøvariabler, domæne, SSL og løbende publicering konfigureres hos udbyderen, ikke i Tatik." },
      ], resources: [{ label: "Vercel-dokumentation", href: "https://vercel.com/docs" }, { label: "Netlify-dokumentation", href: "https://docs.netlify.com/" }] },
    ],
  },
  no: {
    title: "Praktiske veiledninger", home: "Tilbake til forsiden", heading: "Praktiske veiledninger",
    intro: "Veiledningene beskriver handlinger som er tilgjengelige i dagens grensesnitt. Forhåndsvisning avhenger av prosjektet; publisering må fullføres hos en ekstern hostingleverandør.",
    externalDocs: "Ekstern dokumentasjon", seoTitle: "Praktiske Tatik.space Pro-veiledninger | Editor, sikkerhetskopier og publisering",
    seoDescription: "Trinnvise veiledninger for Tatik.space Pro-editoren, prosjektsikkerhetskopier og publisering via en ekstern hostingleverandør.",
    guides: [
      { id: "editor", title: "Arbeide i editoren", description: "Åpne og rediger filer og forhåndsvis støttede webprosjekter.", action: "Åpne editoren", href: "/editor", steps: [
        { title: "Åpne editoren", content: "Logg inn og åpne Editor fra navigasjonen på nettstedet. Arbeidsområdet som er tilgjengelig for kontoen din, lastes inn." },
        { title: "Åpne eller legge til filer", content: "Opprett eller last opp filer fra Fil-menyen, eller åpne en lokal mappe hvis nettleseren støtter det." },
        { title: "Redigere og forhåndsvise", content: "Velg en fil for redigering. Forhåndsvisning fungerer for støttede webprosjekter, men ikke alle språk eller konfigurasjoner." },
      ], resources: [{ label: "HTML på MDN", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "CSS på MDN", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "Lagre og sikkerhetskopiere arbeidet", description: "Lagre enkeltfiler, og bruk tilgjengelige sikkerhetskopifunksjoner til å opprette eller gjenopprette et prosjektsnapshot.", action: "Åpne editoren", href: "/editor", steps: [
        { title: "Lagre gjeldende fil", content: "Bruk Lagre i editoren. Avhengig av hvordan filen ble åpnet, lagres den i prosjektet eller lastes ned til enheten." },
        { title: "Opprette en sikkerhetskopi", content: "Åpne Backup for å administrere prosjektsnapshots. Kontroller at sikkerhetskopien er fullført før du stoler på den." },
        { title: "Gjenopprette forsiktig", content: "Velg et snapshot du vil gjenopprette. De gjeldende prosjektfilene erstattes med filene i det valgte snapshotet." },
      ] },
      { id: "deployment", title: "Publisere via ekstern hosting", description: "Tatik.space Pro publiserer ikke prosjekter direkte for øyeblikket. Fullfør publiseringen hos en hostingleverandør.", action: "Publiseringsinformasjon", href: "/deployment", steps: [
        { title: "Klargjøre filene", content: "Lagre prosjektfilene fra editoren. Det finnes ingen fungerende ettklikksdistribusjon eller produksjonsadresse hos Tatik." },
        { title: "Velge leverandør", content: "Følg leverandørens dokumentasjon for å opprette et nettsted og laste opp eller koble til prosjektfilene." },
        { title: "Fullføre publiseringen der", content: "Bygginnstillinger, miljøvariabler, domene, SSL og kontinuerlig publisering konfigureres hos leverandøren, ikke i Tatik." },
      ], resources: [{ label: "Vercel-dokumentasjon", href: "https://vercel.com/docs" }, { label: "Netlify-dokumentasjon", href: "https://docs.netlify.com/" }] },
    ],
  },
  fi: {
    title: "Käytännön oppaat", home: "Takaisin etusivulle", heading: "Käytännön oppaat",
    intro: "Oppaat kuvaavat nykyisessä käyttöliittymässä saatavilla olevia toimintoja. Esikatselu riippuu projektista; julkaisu tehdään ulkoisen palveluntarjoajan kautta.",
    externalDocs: "Ulkoinen dokumentaatio", seoTitle: "Tatik.space Pron käytännön oppaat | Editori, varmuuskopiot ja julkaisu",
    seoDescription: "Vaiheittaiset oppaat Tatik.space Pron editoriin, projektien varmuuskopiointiin ja julkaisemiseen ulkoisen palveluntarjoajan avulla.",
    guides: [
      { id: "editor", title: "Työskentely editorissa", description: "Avaa ja muokkaa tiedostoja sekä esikatsele tuettuja verkkoprojekteja.", action: "Avaa editori", href: "/editor", steps: [
        { title: "Avaa editori", content: "Kirjaudu sisään ja avaa Editor sivuston navigaatiosta. Tilillesi käytettävissä oleva työtila latautuu." },
        { title: "Avaa tai lisää tiedostoja", content: "Luo tai lataa tiedostoja Tiedosto-valikosta tai avaa paikallinen kansio, jos selaimesi tukee sitä." },
        { title: "Muokkaa ja esikatsele", content: "Valitse muokattava tiedosto. Esikatselu toimii tuetuissa verkkoprojekteissa, mutta ei kaikilla kielillä tai määrityksillä." },
      ], resources: [{ label: "HTML MDN:ssä", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" }, { label: "CSS MDN:ssä", href: "https://developer.mozilla.org/en-US/docs/Web/CSS" }] },
      { id: "save-backup", title: "Tallenna ja varmuuskopioi työsi", description: "Tallenna yksittäisiä tiedostoja ja luo tai palauta projektin tilannekuva käytettävissä olevilla varmuuskopiointitoiminnoilla.", action: "Avaa editori", href: "/editor", steps: [
        { title: "Tallenna nykyinen tiedosto", content: "Käytä editorin tallennustoimintoa. Avaustavasta riippuen tiedosto tallentuu projektiin tai latautuu laitteellesi." },
        { title: "Luo varmuuskopio", content: "Avaa Backup projektin tilannekuvien hallintaan. Varmista varmuuskopion valmistuminen ennen siihen luottamista." },
        { title: "Palauta harkiten", content: "Valitse palautettava tilannekuva. Palautus korvaa nykyiset projektitiedostot valitun tilannekuvan tiedostoilla." },
      ] },
      { id: "deployment", title: "Julkaise ulkoisen palveluntarjoajan kautta", description: "Tatik.space Pro ei tällä hetkellä julkaise projekteja suoraan. Julkaisu on tehtävä ulkoisessa hosting-palvelussa.", action: "Julkaisutiedot", href: "/deployment", steps: [
        { title: "Valmistele tiedostot", content: "Tallenna projektitiedostot editorista. Käytössä ei ole toimivaa yhden napsautuksen julkaisua eikä Tatikin tuotanto-osoitetta." },
        { title: "Valitse palveluntarjoaja", content: "Luo sivusto palveluntarjoajan ohjeiden mukaan ja lataa tai yhdistä projektitiedostot." },
        { title: "Viimeistele julkaisu siellä", content: "Koonti, ympäristömuuttujat, verkkotunnus, SSL ja jatkuva julkaisu määritetään palveluntarjoajalla, ei Tatikissa." },
      ], resources: [{ label: "Vercel-dokumentaatio", href: "https://vercel.com/docs" }, { label: "Netlify-dokumentaatio", href: "https://docs.netlify.com/" }] },
    ],
  },
  uk: {
    title: "Практичні посібники", home: "На головну", heading: "Практичні посібники",
    intro: "Посібники описують дії, доступні в поточному інтерфейсі. Попередній перегляд залежить від проєкту; публікацію потрібно завершити через зовнішній хостинг.",
    externalDocs: "Зовнішня документація", seoTitle: "Практичні посібники Tatik.space Pro | Редактор, резервні копії та публікація",
    seoDescription: "Покрокові посібники з редактора Tatik.space Pro, резервного копіювання проєктів і публікації через зовнішнього провайдера.",
    guides: [
      { id: "editor", title: "Робота в редакторі", description: "Відкривайте й редагуйте файли та переглядайте сумісні вебпроєкти.", action: "Відкрити редактор", href: "/editor", steps: [
        { title: "Відкрити редактор", content: "Увійдіть і відкрийте редактор у навігації сайту. Завантажиться робочий простір, доступний вашому обліковому запису." },
        { title: "Відкрити або додати файли", content: "У меню «Файл» створюйте або завантажуйте файли чи відкривайте локальну теку, якщо це підтримує браузер." },
        { title: "Редагування й перегляд", content: "Виберіть файл для редагування. Попередній перегляд працює із сумісними вебпроєктами, але не з усіма мовами чи конфігураціями." },
      ], resources: [{ label: "HTML на MDN", href: "https://developer.mozilla.org/uk/docs/Web/HTML" }, { label: "CSS на MDN", href: "https://developer.mozilla.org/uk/docs/Web/CSS" }] },
      { id: "save-backup", title: "Збереження та резервне копіювання", description: "Зберігайте окремі файли та створюйте або відновлюйте знімки проєкту доступними засобами резервного копіювання.", action: "Відкрити редактор", href: "/editor", steps: [
        { title: "Зберегти поточний файл", content: "Скористайтеся збереженням у редакторі. Залежно від способу відкриття файл збережеться в проєкті або завантажиться на пристрій." },
        { title: "Створити резервну копію", content: "Відкрийте Backup для керування знімками проєкту. Переконайтеся, що копіювання завершилося, перш ніж покладатися на нього." },
        { title: "Обережно відновити", content: "Виберіть знімок для відновлення. Поточні файли проєкту буде замінено файлами вибраного знімка." },
      ] },
      { id: "deployment", title: "Публікація через зовнішній хостинг", description: "Tatik.space Pro наразі не публікує проєкти безпосередньо. Завершіть розгортання через хостинг-провайдера.", action: "Інформація про публікацію", href: "/deployment", steps: [
        { title: "Підготувати файли", content: "Збережіть файли проєкту з редактора. Немає робочого розгортання в один клік або виробничої адреси від Tatik." },
        { title: "Вибрати провайдера", content: "Дотримуйтеся документації провайдера, щоб створити сайт і завантажити або підключити файли проєкту." },
        { title: "Завершити розгортання там", content: "Збирання, змінні середовища, домен, SSL і безперервне розгортання налаштовуються у провайдера, а не в Tatik." },
      ], resources: [{ label: "Документація Vercel", href: "https://vercel.com/docs" }, { label: "Документація Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
  cs: {
    title: "Praktické návody", home: "Zpět na hlavní stránku", heading: "Praktické návody",
    intro: "Návody popisují postupy dostupné v aktuálním rozhraní. Náhled závisí na projektu; publikování je nutné dokončit u externího poskytovatele hostingu.",
    externalDocs: "Externí dokumentace", seoTitle: "Praktické návody Tatik.space Pro | Editor, zálohy a publikování",
    seoDescription: "Podrobné návody k editoru Tatik.space Pro, zálohování projektů a publikování prostřednictvím externího poskytovatele.",
    guides: [
      { id: "editor", title: "Práce v editoru", description: "Otevírejte a upravujte soubory a zobrazujte náhled podporovaných webových projektů.", action: "Otevřít editor", href: "/editor", steps: [
        { title: "Otevřete editor", content: "Přihlaste se a otevřete Editor v navigaci webu. Načte se pracovní prostor dostupný pro váš účet." },
        { title: "Otevřete nebo přidejte soubory", content: "V nabídce Soubor vytvářejte či nahrávejte soubory nebo otevřete místní složku, pokud to prohlížeč podporuje." },
        { title: "Upravujte a zobrazte náhled", content: "Vyberte soubor k úpravě. Náhled funguje u podporovaných webových projektů, ale nespustí všechny jazyky ani konfigurace." },
      ], resources: [{ label: "HTML na MDN", href: "https://developer.mozilla.org/cs/docs/Web/HTML" }, { label: "CSS na MDN", href: "https://developer.mozilla.org/cs/docs/Web/CSS" }] },
      { id: "save-backup", title: "Uložení a zálohování práce", description: "Ukládejte jednotlivé soubory a pomocí dostupných záloh vytvářejte nebo obnovujte snímky projektu.", action: "Otevřít editor", href: "/editor", steps: [
        { title: "Uložte aktuální soubor", content: "V editoru použijte Uložit. Podle způsobu otevření se soubor uloží do projektu nebo stáhne do zařízení." },
        { title: "Vytvořte zálohu", content: "Otevřete Backup pro správu snímků projektu. Než se na zálohu spolehnete, ověřte její dokončení." },
        { title: "Opatrně obnovujte", content: "Vyberte snímek k obnovení. Aktuální soubory projektu budou nahrazeny soubory zvoleného snímku." },
      ] },
      { id: "deployment", title: "Publikování přes externí hosting", description: "Tatik.space Pro projekty přímo nepublikuje. Nasazení je nutné dokončit u poskytovatele hostingu.", action: "Informace o publikování", href: "/deployment", steps: [
        { title: "Připravte soubory", content: "Uložte soubory projektu z editoru. Není dostupné funkční nasazení jedním kliknutím ani produkční adresa hostovaná službou Tatik." },
        { title: "Vyberte poskytovatele", content: "Podle dokumentace poskytovatele vytvořte web a nahrajte nebo připojte soubory projektu." },
        { title: "Dokončete nasazení u poskytovatele", content: "Sestavení, proměnné prostředí, doménu, SSL a průběžné nasazování nastavte u poskytovatele, ne v Tatik." },
      ], resources: [{ label: "Dokumentace Vercel", href: "https://vercel.com/docs" }, { label: "Dokumentace Netlify", href: "https://docs.netlify.com/" }] },
    ],
  },
};

export default function Tutorials() {
  const { language } = useLanguage();
  const copy = tutorialsCopy[language] ?? tutorialsCopy.en;
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <Link href="/">
              <Button variant="outline">{copy.home}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">{copy.heading}</h2>
            <p className="text-muted-foreground">{copy.intro}</p>
          </div>

          <div className="space-y-4">
            {copy.guides.map((guide) => {
              const isExpanded = expandedGuide === guide.id;
              return (
                <section key={guide.id} className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedGuide(isExpanded ? null : guide.id)}
                    aria-expanded={isExpanded}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-accent/50 transition-colors"
                  >
                    <span>
                      <span className="block text-lg font-semibold">{guide.title}</span>
                      <span className="block text-sm text-muted-foreground mt-1">{guide.description}</span>
                    </span>
                    <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/30 p-6 space-y-6">
                      <ol className="space-y-4">
                        {guide.steps.map((step, index) => (
                          <li key={step.title} className="border-l-2 border-primary pl-4">
                            <h3 className="font-semibold text-sm mb-2">{index + 1}. {step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
                          </li>
                        ))}
                      </ol>

                      {guide.resources && (
                        <div className="border-t border-border pt-4">
                          <p className="text-sm font-semibold mb-3">{copy.externalDocs}</p>
                          <div className="flex flex-wrap gap-2">
                            {guide.resources.map((resource) => (
                              <Button key={resource.href} variant="outline" size="sm" asChild>
                                <a href={resource.href} target="_blank" rel="noopener noreferrer">{resource.label}</a>
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button className="w-full" asChild>
                        <Link href={guide.href}>{guide.action}</Link>
                      </Button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
