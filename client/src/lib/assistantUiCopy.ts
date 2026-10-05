import type { translations } from '@/lib/i18n';

export type ComponentLocale = keyof typeof translations;
export type TechAdId = 'security-1' | 'security-2' | 'dev-tools-1' | 'dev-tools-2' | 'alert-1' | 'code-quality';

type AssistantCopy = {
  button: string;
  title: string;
  bugTab: string;
  optimizeTab: string;
  bugTitle: string;
  language: string;
  code: string;
  codePlaceholder: string;
  errorLabel: string;
  errorPlaceholder: string;
  analysis: string;
  correctedCode: string;
  optimizeTitle: string;
  optimizeCode: string;
  suggestions: string;
  proTitle: string;
  proBenefits: string;
  welcome: string;
  modelChanged: string;
  dailyLimit: string;
  askModel: string;
  limitPlaceholder: string;
  analyzing: string;
  analyze: string;
  optimize: string;
  suggested: string;
  deploy: string;
  linter: string;
  bugEmpty: string;
  optimizeEmpty: string;
  bugSuccess: string;
  bugFailure: string;
  optimizeSuccess: string;
  optimizeFailure: string;
  codeInserted: string;
  copied: string;
  copy: string;
  insertCode: string;
  chatError: string;
};

type TechAdCopy = {
  affiliateTitle: string;
  sponsoredTitle: string;
  affiliateLabel: string;
  sponsoredLabel: string;
  close: string;
  items: Record<TechAdId, { title: string; description: string }>;
};

type ComponentCopy = {
  promo: { trial: string; days: string; plan: string; upgrade: string; toast: string };
  ai: AssistantCopy;
  techAd: TechAdCopy;
};

const componentCopy: Record<ComponentLocale, ComponentCopy> = {
  en: {
    promo: { trial: 'Free trial', days: 'days', plan: 'Plan: FREE', upgrade: 'Upgrade to Pro', toast: 'Upgrade is in development…' },
    ai: {
      button: 'AI Assistant', title: 'AI Developer Assistant', bugTab: 'Analyze bug', optimizeTab: 'Optimize',
      bugTitle: 'Load code to analyze', language: 'Programming language', code: 'Code (paste your code here)',
      codePlaceholder: 'Paste the code you want analyzed here.', errorLabel: 'Error or error message',
      errorPlaceholder: 'Describe the error or paste its message here.', analysis: 'Analysis', correctedCode: 'Corrected code',
      optimizeTitle: 'Optimize your code', optimizeCode: 'Code to optimize', suggestions: 'Optimization suggestions',
      proTitle: 'Unlock Tatik.space Pro', proBenefits: 'Unlimited messages, GPT-4o, all models, and server priority.',
      welcome: 'Hello! I’m your AI assistant for Tatik.space Pro. Active model: **{model}** — {description}. Best for: {strengths}. Paste code or tell me what you want to build.',
      modelChanged: 'Model changed: **{model}**\n\n{description}\n\nOptimized for: {strengths}',
      dailyLimit: 'Daily limit reached. Upgrade to Pro for unlimited messages.',
      askModel: 'Ask {model}… (Enter to send · Shift+Enter for a new line)',
      limitPlaceholder: 'Limit reached — upgrade to Pro to continue…',
      analyzing: 'Analyzing…', analyze: 'Analyze bug', optimize: 'Optimize code',
      suggested: 'Suggested', deploy: 'Quick deployment:', linter: 'Premium linter:',
      bugEmpty: 'Please enter code and an error.', optimizeEmpty: 'Please enter code to optimize.',
      bugSuccess: 'Bug analysis complete', bugFailure: 'Bug analysis failed: ',
      optimizeSuccess: '{count} optimization suggestions found', optimizeFailure: 'Optimization analysis failed: ',
      codeInserted: 'Code inserted in the editor', copied: 'Copied', copy: 'Copy', insertCode: 'Insert in editor →',
      chatError: 'Error: ',
    },
    techAd: {
      affiliateTitle: 'Affiliate link (opens in a new tab)', sponsoredTitle: 'Sponsored ad',
      affiliateLabel: '→ Affiliate link', sponsoredLabel: '→ Sponsored', close: 'Close',
      items: {
        'security-1': { title: '🔒 Security', description: 'Code vulnerabilities' },
        'security-2': { title: '🛡️ Protection', description: 'Encrypted backups' },
        'dev-tools-1': { title: '⚡ Performance', description: 'Speed analysis' },
        'dev-tools-2': { title: '💻 API testing', description: 'REST API testing' },
        'alert-1': { title: '🚨 Errors', description: 'Real-time monitoring' },
        'code-quality': { title: '✨ Code quality', description: 'Code suggestions' },
      },
    },
  },
  it: {
    promo: { trial: 'Prova gratuita', days: 'giorni', plan: 'Piano: FREE', upgrade: 'Passa a Pro', toast: 'L’upgrade è in fase di sviluppo…' },
    ai: {
      button: 'Assistente IA', title: 'Assistente IA per sviluppatori', bugTab: 'Analizza bug', optimizeTab: 'Ottimizza',
      bugTitle: 'Carica il codice da analizzare', language: 'Linguaggio di programmazione', code: 'Codice (incolla qui il codice)',
      codePlaceholder: 'Incolla qui il codice da analizzare.', errorLabel: 'Errore o messaggio di errore',
      errorPlaceholder: 'Descrivi l’errore o incolla qui il relativo messaggio.', analysis: 'Analisi', correctedCode: 'Codice corretto',
      optimizeTitle: 'Ottimizza il tuo codice', optimizeCode: 'Codice da ottimizzare', suggestions: 'Suggerimenti di ottimizzazione',
      proTitle: 'Sblocca Tatik.space Pro', proBenefits: 'Messaggi illimitati, GPT-4o, tutti i modelli e priorità server.',
      welcome: 'Ciao! Sono il tuo assistente IA per Tatik.space Pro. Modello attivo: **{model}** — {description}. Ottimizzato per: {strengths}. Incolla il codice o dimmi cosa vuoi creare.',
      modelChanged: 'Modello cambiato: **{model}**\n\n{description}\n\nOttimizzato per: {strengths}',
      dailyLimit: 'Limite giornaliero raggiunto. Passa a Pro per avere messaggi illimitati.',
      askModel: 'Chiedi a {model}… (Invio per inviare · Maiusc+Invio per andare a capo)',
      limitPlaceholder: 'Limite raggiunto — passa a Pro per continuare…',
      analyzing: 'Analisi in corso…', analyze: 'Analizza bug', optimize: 'Ottimizza codice',
      suggested: 'Suggerito', deploy: 'Deploy rapido:', linter: 'Linter Premium:',
      bugEmpty: 'Inserisci il codice e l’errore.', optimizeEmpty: 'Inserisci il codice da ottimizzare.',
      bugSuccess: 'Analisi del bug completata', bugFailure: 'Analisi del bug non riuscita: ',
      optimizeSuccess: 'Trovati {count} suggerimenti di ottimizzazione', optimizeFailure: 'Analisi di ottimizzazione non riuscita: ',
      codeInserted: 'Codice inserito nell’editor', copied: 'Copiato', copy: 'Copia', insertCode: 'Inserisci nell’editor →',
      chatError: 'Errore: ',
    },
    techAd: {
      affiliateTitle: 'Link affiliato (si apre in una nuova scheda)', sponsoredTitle: 'Annuncio sponsorizzato',
      affiliateLabel: '→ Link affiliato', sponsoredLabel: '→ Sponsorizzato', close: 'Chiudi',
      items: {
        'security-1': { title: '🔒 Sicurezza', description: 'Vulnerabilità nel codice' },
        'security-2': { title: '🛡️ Protezione', description: 'Backup con crittografia' },
        'dev-tools-1': { title: '⚡ Prestazioni', description: 'Analisi della velocità' },
        'dev-tools-2': { title: '💻 Test API', description: 'Test REST API' },
        'alert-1': { title: '🚨 Errori', description: 'Monitoraggio in tempo reale' },
        'code-quality': { title: '✨ Qualità del codice', description: 'Suggerimenti per il codice' },
      },
    },
  },
  es: {
    promo: { trial: 'Prueba gratuita', days: 'días', plan: 'Plan: GRATIS', upgrade: 'Mejorar a Pro', toast: 'La mejora está en desarrollo…' },
    ai: {
      button: 'Asistente de IA', title: 'Asistente de IA para desarrollo', bugTab: 'Analizar error', optimizeTab: 'Optimizar',
      bugTitle: 'Carga el código que quieres analizar', language: 'Lenguaje de programación', code: 'Código (pega aquí tu código)',
      codePlaceholder: 'Pega aquí el código que quieres analizar.', errorLabel: 'Error o mensaje de error',
      errorPlaceholder: 'Describe el error o pega aquí su mensaje.', analysis: 'Análisis', correctedCode: 'Código corregido',
      optimizeTitle: 'Optimiza tu código', optimizeCode: 'Código que optimizar', suggestions: 'Sugerencias de optimización',
      proTitle: 'Desbloquea Tatik.space Pro', proBenefits: 'Mensajes ilimitados, GPT-4o, todos los modelos y prioridad en el servidor.',
      welcome: '¡Hola! Soy tu asistente de IA para Tatik.space Pro. Modelo activo: **{model}** — {description}. Ideal para: {strengths}. Pega código o dime qué quieres crear.',
      modelChanged: 'Modelo cambiado: **{model}**\n\n{description}\n\nOptimizado para: {strengths}',
      dailyLimit: 'Has alcanzado el límite diario. Pásate a Pro para obtener mensajes ilimitados.',
      askModel: 'Pregunta a {model}… (Intro para enviar · Mayús+Intro para salto de línea)',
      limitPlaceholder: 'Límite alcanzado: pásate a Pro para continuar…',
      analyzing: 'Analizando…', analyze: 'Analizar error', optimize: 'Optimizar código',
      suggested: 'Sugerido', deploy: 'Despliegue rápido:', linter: 'Linter prémium:',
      bugEmpty: 'Introduce el código y el error.', optimizeEmpty: 'Introduce el código que quieres optimizar.',
      bugSuccess: 'Análisis del error completado', bugFailure: 'No se pudo analizar el error: ',
      optimizeSuccess: 'Se encontraron {count} sugerencias de optimización', optimizeFailure: 'No se pudo analizar la optimización: ',
      codeInserted: 'Código insertado en el editor', copied: 'Copiado', copy: 'Copiar', insertCode: 'Insertar en el editor →',
      chatError: 'Error: ',
    },
    techAd: {
      affiliateTitle: 'Enlace de afiliado (se abre en una pestaña nueva)', sponsoredTitle: 'Anuncio patrocinado',
      affiliateLabel: '→ Enlace de afiliado', sponsoredLabel: '→ Patrocinado', close: 'Cerrar',
      items: {
        'security-1': { title: '🔒 Seguridad', description: 'Vulnerabilidades en el código' },
        'security-2': { title: '🛡️ Protección', description: 'Copias de seguridad cifradas' },
        'dev-tools-1': { title: '⚡ Rendimiento', description: 'Análisis de velocidad' },
        'dev-tools-2': { title: '💻 Pruebas de API', description: 'Pruebas de REST API' },
        'alert-1': { title: '🚨 Errores', description: 'Monitorización en tiempo real' },
        'code-quality': { title: '✨ Calidad del código', description: 'Sugerencias de código' },
      },
    },
  },
  fr: {
    promo: { trial: 'Essai gratuit', days: 'jours', plan: 'Offre : GRATUIT', upgrade: 'Passer à Pro', toast: 'Le passage à Pro est en cours de développement…' },
    ai: {
      button: 'Assistant IA', title: 'Assistant IA de développement', bugTab: 'Analyser un bug', optimizeTab: 'Optimiser',
      bugTitle: 'Charger le code à analyser', language: 'Langage de programmation', code: 'Code (collez votre code ici)',
      codePlaceholder: 'Collez ici le code à analyser.', errorLabel: 'Erreur ou message d’erreur',
      errorPlaceholder: 'Décrivez l’erreur ou collez son message ici.', analysis: 'Analyse', correctedCode: 'Code corrigé',
      optimizeTitle: 'Optimiser votre code', optimizeCode: 'Code à optimiser', suggestions: 'Suggestions d’optimisation',
      proTitle: 'Débloquer Tatik.space Pro', proBenefits: 'Messages illimités, GPT-4o, tous les modèles et priorité serveur.',
      welcome: 'Bonjour ! Je suis votre assistant IA pour Tatik.space Pro. Modèle actif : **{model}** — {description}. Idéal pour : {strengths}. Collez du code ou décrivez votre projet.',
      modelChanged: 'Modèle changé : **{model}**\n\n{description}\n\nOptimisé pour : {strengths}',
      dailyLimit: 'Limite quotidienne atteinte. Passez à Pro pour des messages illimités.',
      askModel: 'Demandez à {model}… (Entrée pour envoyer · Maj+Entrée pour un saut de ligne)',
      limitPlaceholder: 'Limite atteinte — passez à Pro pour continuer…',
      analyzing: 'Analyse en cours…', analyze: 'Analyser le bug', optimize: 'Optimiser le code',
      suggested: 'Suggéré', deploy: 'Déploiement rapide :', linter: 'Linter Premium :',
      bugEmpty: 'Saisissez le code et l’erreur.', optimizeEmpty: 'Saisissez le code à optimiser.',
      bugSuccess: 'Analyse du bug terminée', bugFailure: 'Échec de l’analyse du bug : ',
      optimizeSuccess: '{count} suggestions d’optimisation trouvées', optimizeFailure: 'Échec de l’analyse d’optimisation : ',
      codeInserted: 'Code inséré dans l’éditeur', copied: 'Copié', copy: 'Copier', insertCode: 'Insérer dans l’éditeur →',
      chatError: 'Erreur : ',
    },
    techAd: {
      affiliateTitle: 'Lien affilié (ouvre un nouvel onglet)', sponsoredTitle: 'Publicité sponsorisée',
      affiliateLabel: '→ Lien affilié', sponsoredLabel: '→ Sponsorisé', close: 'Fermer',
      items: {
        'security-1': { title: '🔒 Sécurité', description: 'Vulnérabilités dans le code' },
        'security-2': { title: '🛡️ Protection', description: 'Sauvegardes chiffrées' },
        'dev-tools-1': { title: '⚡ Performances', description: 'Analyse de la vitesse' },
        'dev-tools-2': { title: '💻 Tests API', description: 'Tests REST API' },
        'alert-1': { title: '🚨 Erreurs', description: 'Surveillance en temps réel' },
        'code-quality': { title: '✨ Qualité du code', description: 'Suggestions de code' },
      },
    },
  },
  de: {
    promo: { trial: 'Kostenloser Testzeitraum', days: 'Tage', plan: 'Tarif: KOSTENLOS', upgrade: 'Auf Pro upgraden', toast: 'Das Upgrade ist in Entwicklung…' },
    ai: {
      button: 'KI-Assistent', title: 'KI-Entwicklungsassistent', bugTab: 'Fehler analysieren', optimizeTab: 'Optimieren',
      bugTitle: 'Zu analysierenden Code laden', language: 'Programmiersprache', code: 'Code (hier einfügen)',
      codePlaceholder: 'Füge hier den zu analysierenden Code ein.', errorLabel: 'Fehler oder Fehlermeldung',
      errorPlaceholder: 'Beschreibe den Fehler oder füge die Meldung hier ein.', analysis: 'Analyse', correctedCode: 'Korrigierter Code',
      optimizeTitle: 'Code optimieren', optimizeCode: 'Zu optimierender Code', suggestions: 'Optimierungsvorschläge',
      proTitle: 'Tatik.space Pro freischalten', proBenefits: 'Unbegrenzte Nachrichten, GPT-4o, alle Modelle und Serverpriorität.',
      welcome: 'Hallo! Ich bin dein KI-Assistent für Tatik.space Pro. Aktives Modell: **{model}** — {description}. Geeignet für: {strengths}. Füge Code ein oder beschreibe dein Vorhaben.',
      modelChanged: 'Modell geändert: **{model}**\n\n{description}\n\nOptimiert für: {strengths}',
      dailyLimit: 'Tageslimit erreicht. Wechsle zu Pro für unbegrenzte Nachrichten.',
      askModel: 'Frage {model}… (Eingabe zum Senden · Umschalt+Eingabe für neue Zeile)',
      limitPlaceholder: 'Limit erreicht — wechsle zu Pro, um fortzufahren…',
      analyzing: 'Wird analysiert…', analyze: 'Fehler analysieren', optimize: 'Code optimieren',
      suggested: 'Empfohlen', deploy: 'Schnelles Deployment:', linter: 'Premium-Linter:',
      bugEmpty: 'Bitte Code und Fehler eingeben.', optimizeEmpty: 'Bitte den zu optimierenden Code eingeben.',
      bugSuccess: 'Fehleranalyse abgeschlossen', bugFailure: 'Fehleranalyse fehlgeschlagen: ',
      optimizeSuccess: '{count} Optimierungsvorschläge gefunden', optimizeFailure: 'Optimierungsanalyse fehlgeschlagen: ',
      codeInserted: 'Code im Editor eingefügt', copied: 'Kopiert', copy: 'Kopieren', insertCode: 'Im Editor einfügen →',
      chatError: 'Fehler: ',
    },
    techAd: {
      affiliateTitle: 'Affiliate-Link (wird in neuem Tab geöffnet)', sponsoredTitle: 'Gesponserte Anzeige',
      affiliateLabel: '→ Affiliate-Link', sponsoredLabel: '→ Gesponsert', close: 'Schließen',
      items: {
        'security-1': { title: '🔒 Sicherheit', description: 'Schwachstellen im Code' },
        'security-2': { title: '🛡️ Schutz', description: 'Verschlüsselte Sicherungen' },
        'dev-tools-1': { title: '⚡ Leistung', description: 'Geschwindigkeitsanalyse' },
        'dev-tools-2': { title: '💻 API-Tests', description: 'REST-API-Tests' },
        'alert-1': { title: '🚨 Fehler', description: 'Echtzeitüberwachung' },
        'code-quality': { title: '✨ Codequalität', description: 'Code-Vorschläge' },
      },
    },
  },
  pt: {
    promo: { trial: 'Teste gratuito', days: 'dias', plan: 'Plano: GRÁTIS', upgrade: 'Mudar para Pro', toast: 'A atualização está em desenvolvimento…' },
    ai: {
      button: 'Assistente de IA', title: 'Assistente de IA para desenvolvimento', bugTab: 'Analisar erro', optimizeTab: 'Otimizar',
      bugTitle: 'Carregue o código para analisar', language: 'Linguagem de programação', code: 'Código (cole seu código aqui)',
      codePlaceholder: 'Cole aqui o código que deseja analisar.', errorLabel: 'Erro ou mensagem de erro',
      errorPlaceholder: 'Descreva o erro ou cole a mensagem aqui.', analysis: 'Análise', correctedCode: 'Código corrigido',
      optimizeTitle: 'Otimize seu código', optimizeCode: 'Código para otimizar', suggestions: 'Sugestões de otimização',
      proTitle: 'Desbloqueie o Tatik.space Pro', proBenefits: 'Mensagens ilimitadas, GPT-4o, todos os modelos e prioridade no servidor.',
      welcome: 'Olá! Sou seu assistente de IA para o Tatik.space Pro. Modelo ativo: **{model}** — {description}. Ideal para: {strengths}. Cole código ou diga o que deseja criar.',
      modelChanged: 'Modelo alterado: **{model}**\n\n{description}\n\nOtimizado para: {strengths}',
      dailyLimit: 'Limite diário atingido. Mude para Pro para ter mensagens ilimitadas.',
      askModel: 'Pergunte ao {model}… (Enter para enviar · Shift+Enter para nova linha)',
      limitPlaceholder: 'Limite atingido — mude para Pro para continuar…',
      analyzing: 'Analisando…', analyze: 'Analisar erro', optimize: 'Otimizar código',
      suggested: 'Sugerido', deploy: 'Deploy rápido:', linter: 'Linter Premium:',
      bugEmpty: 'Insira o código e o erro.', optimizeEmpty: 'Insira o código que deseja otimizar.',
      bugSuccess: 'Análise do erro concluída', bugFailure: 'Falha na análise do erro: ',
      optimizeSuccess: '{count} sugestões de otimização encontradas', optimizeFailure: 'Falha na análise de otimização: ',
      codeInserted: 'Código inserido no editor', copied: 'Copiado', copy: 'Copiar', insertCode: 'Inserir no editor →',
      chatError: 'Erro: ',
    },
    techAd: {
      affiliateTitle: 'Link de afiliado (abre em uma nova aba)', sponsoredTitle: 'Anúncio patrocinado',
      affiliateLabel: '→ Link de afiliado', sponsoredLabel: '→ Patrocinado', close: 'Fechar',
      items: {
        'security-1': { title: '🔒 Segurança', description: 'Vulnerabilidades no código' },
        'security-2': { title: '🛡️ Proteção', description: 'Backups criptografados' },
        'dev-tools-1': { title: '⚡ Desempenho', description: 'Análise de velocidade' },
        'dev-tools-2': { title: '💻 Testes de API', description: 'Testes de REST API' },
        'alert-1': { title: '🚨 Erros', description: 'Monitoramento em tempo real' },
        'code-quality': { title: '✨ Qualidade do código', description: 'Sugestões de código' },
      },
    },
  },
  ru: {
    promo: { trial: 'Бесплатный пробный период', days: 'дней', plan: 'План: БЕСПЛАТНО', upgrade: 'Перейти на Pro', toast: 'Переход на Pro находится в разработке…' },
    ai: {
      button: 'ИИ-ассистент', title: 'ИИ-ассистент разработчика', bugTab: 'Анализ ошибки', optimizeTab: 'Оптимизация',
      bugTitle: 'Загрузите код для анализа', language: 'Язык программирования', code: 'Код (вставьте его сюда)',
      codePlaceholder: 'Вставьте сюда код для анализа.', errorLabel: 'Ошибка или сообщение об ошибке',
      errorPlaceholder: 'Опишите ошибку или вставьте сообщение.', analysis: 'Анализ', correctedCode: 'Исправленный код',
      optimizeTitle: 'Оптимизация кода', optimizeCode: 'Код для оптимизации', suggestions: 'Советы по оптимизации',
      proTitle: 'Откройте Tatik.space Pro', proBenefits: 'Неограниченные сообщения, GPT-4o, все модели и приоритет сервера.',
      welcome: 'Здравствуйте! Я ИИ-ассистент Tatik.space Pro. Активная модель: **{model}** — {description}. Оптимизирована для: {strengths}. Вставьте код или опишите, что хотите создать.',
      modelChanged: 'Выбрана модель **{model}**\n\n{description}\n\nОптимизирована для: {strengths}',
      dailyLimit: 'Достигнут дневной лимит. Перейдите на Pro для неограниченных сообщений.',
      askModel: 'Спросите {model}… (Enter — отправить · Shift+Enter — новая строка)',
      limitPlaceholder: 'Лимит исчерпан — перейдите на Pro, чтобы продолжить…',
      analyzing: 'Анализ…', analyze: 'Анализ ошибки', optimize: 'Оптимизировать код',
      suggested: 'Рекомендуем', deploy: 'Быстрый деплой:', linter: 'Премиум-линтер:',
      bugEmpty: 'Введите код и ошибку.', optimizeEmpty: 'Введите код для оптимизации.',
      bugSuccess: 'Анализ ошибки завершён', bugFailure: 'Не удалось проанализировать ошибку: ',
      optimizeSuccess: 'Найдено советов по оптимизации: {count}', optimizeFailure: 'Не удалось выполнить оптимизацию: ',
      codeInserted: 'Код вставлен в редактор', copied: 'Скопировано', copy: 'Копировать', insertCode: 'Вставить в редактор →',
      chatError: 'Ошибка: ',
    },
    techAd: {
      affiliateTitle: 'Партнёрская ссылка (откроется в новой вкладке)', sponsoredTitle: 'Рекламное объявление',
      affiliateLabel: '→ Партнёрская ссылка', sponsoredLabel: '→ Реклама', close: 'Закрыть',
      items: {
        'security-1': { title: '🔒 Безопасность', description: 'Уязвимости в коде' },
        'security-2': { title: '🛡️ Защита', description: 'Зашифрованные резервные копии' },
        'dev-tools-1': { title: '⚡ Производительность', description: 'Анализ скорости' },
        'dev-tools-2': { title: '💻 Тестирование API', description: 'Тесты REST API' },
        'alert-1': { title: '🚨 Ошибки', description: 'Мониторинг в реальном времени' },
        'code-quality': { title: '✨ Качество кода', description: 'Рекомендации по коду' },
      },
    },
  },
  zh: {
    promo: { trial: '免费试用', days: '天', plan: '套餐：免费', upgrade: '升级到 Pro', toast: '升级功能正在开发中…' },
    ai: {
      button: 'AI 助手', title: 'AI 开发助手', bugTab: '分析错误', optimizeTab: '优化',
      bugTitle: '加载要分析的代码', language: '编程语言', code: '代码（请在此粘贴）',
      codePlaceholder: '在此粘贴要分析的代码。', errorLabel: '错误或错误消息',
      errorPlaceholder: '请描述错误或粘贴错误消息。', analysis: '分析', correctedCode: '修正后的代码',
      optimizeTitle: '优化代码', optimizeCode: '要优化的代码', suggestions: '优化建议',
      proTitle: '解锁 Tatik.space Pro', proBenefits: '无限消息、GPT-4o、全部模型和服务器优先级。',
      welcome: '你好！我是 Tatik.space Pro 的 AI 助手。当前模型：**{model}** — {description}。擅长：{strengths}。粘贴代码或告诉我你想构建什么。',
      modelChanged: '已切换到模型 **{model}**\n\n{description}\n\n擅长：{strengths}',
      dailyLimit: '已达到每日上限。升级到 Pro 即可无限发送消息。',
      askModel: '向 {model} 提问…（Enter 发送 · Shift+Enter 换行）',
      limitPlaceholder: '已达到上限 — 升级到 Pro 以继续…',
      analyzing: '正在分析…', analyze: '分析错误', optimize: '优化代码',
      suggested: '推荐', deploy: '快速部署：', linter: '高级代码检查：',
      bugEmpty: '请输入代码和错误信息。', optimizeEmpty: '请输入要优化的代码。',
      bugSuccess: '错误分析完成', bugFailure: '错误分析失败：',
      optimizeSuccess: '找到 {count} 条优化建议', optimizeFailure: '优化分析失败：',
      codeInserted: '代码已插入编辑器', copied: '已复制', copy: '复制', insertCode: '插入编辑器 →',
      chatError: '错误：',
    },
    techAd: {
      affiliateTitle: '联盟链接（将在新标签页中打开）', sponsoredTitle: '赞助广告',
      affiliateLabel: '→ 联盟链接', sponsoredLabel: '→ 赞助内容', close: '关闭',
      items: {
        'security-1': { title: '🔒 安全', description: '代码漏洞' },
        'security-2': { title: '🛡️ 防护', description: '加密备份' },
        'dev-tools-1': { title: '⚡ 性能', description: '速度分析' },
        'dev-tools-2': { title: '💻 API 测试', description: 'REST API 测试' },
        'alert-1': { title: '🚨 错误', description: '实时监控' },
        'code-quality': { title: '✨ 代码质量', description: '代码建议' },
      },
    },
  },
  ja: {
    promo: { trial: '無料トライアル', days: '日間', plan: 'プラン：無料', upgrade: 'Pro にアップグレード', toast: 'アップグレード機能は開発中です…' },
    ai: {
      button: 'AI アシスタント', title: 'AI 開発アシスタント', bugTab: 'バグを分析', optimizeTab: '最適化',
      bugTitle: '分析するコードを読み込む', language: 'プログラミング言語', code: 'コード（ここに貼り付け）',
      codePlaceholder: '分析するコードをここに貼り付けてください。', errorLabel: 'エラーまたはエラーメッセージ',
      errorPlaceholder: 'エラーを説明するか、メッセージを貼り付けてください。', analysis: '分析', correctedCode: '修正済みコード',
      optimizeTitle: 'コードを最適化', optimizeCode: '最適化するコード', suggestions: '最適化の提案',
      proTitle: 'Tatik.space Pro を利用する', proBenefits: '無制限のメッセージ、GPT-4o、全モデル、サーバー優先利用。',
      welcome: 'こんにちは。Tatik.space Pro の AI アシスタントです。現在のモデル：**{model}** — {description}。得意分野：{strengths}。コードを貼り付けるか、作りたいものを説明してください。',
      modelChanged: 'モデルを **{model}** に変更しました。\n\n{description}\n\n最適な用途：{strengths}',
      dailyLimit: '1日の上限に達しました。Pro にアップグレードすると無制限に利用できます。',
      askModel: '{model} に質問…（Enter で送信 · Shift+Enter で改行）',
      limitPlaceholder: '上限に達しました — 続けるには Pro にアップグレードしてください…',
      analyzing: '分析中…', analyze: 'バグを分析', optimize: 'コードを最適化',
      suggested: 'おすすめ', deploy: '高速デプロイ：', linter: 'プレミアム Linter：',
      bugEmpty: 'コードとエラーを入力してください。', optimizeEmpty: '最適化するコードを入力してください。',
      bugSuccess: 'バグ分析が完了しました', bugFailure: 'バグ分析に失敗しました：',
      optimizeSuccess: '最適化の提案が {count} 件見つかりました', optimizeFailure: '最適化分析に失敗しました：',
      codeInserted: 'コードをエディターに挿入しました', copied: 'コピーしました', copy: 'コピー', insertCode: 'エディターに挿入 →',
      chatError: 'エラー：',
    },
    techAd: {
      affiliateTitle: 'アフィリエイトリンク（新しいタブで開きます）', sponsoredTitle: 'スポンサー広告',
      affiliateLabel: '→ アフィリエイトリンク', sponsoredLabel: '→ スポンサー', close: '閉じる',
      items: {
        'security-1': { title: '🔒 セキュリティ', description: 'コードの脆弱性' },
        'security-2': { title: '🛡️ 保護', description: '暗号化バックアップ' },
        'dev-tools-1': { title: '⚡ パフォーマンス', description: '速度分析' },
        'dev-tools-2': { title: '💻 API テスト', description: 'REST API テスト' },
        'alert-1': { title: '🚨 エラー', description: 'リアルタイム監視' },
        'code-quality': { title: '✨ コード品質', description: 'コードの提案' },
      },
    },
  },
  ko: {
    promo: { trial: '무료 체험', days: '일', plan: '요금제: 무료', upgrade: 'Pro로 업그레이드', toast: '업그레이드 기능은 개발 중입니다…' },
    ai: {
      button: 'AI 어시스턴트', title: 'AI 개발 어시스턴트', bugTab: '버그 분석', optimizeTab: '최적화',
      bugTitle: '분석할 코드 불러오기', language: '프로그래밍 언어', code: '코드 (여기에 붙여넣기)',
      codePlaceholder: '분석할 코드를 여기에 붙여넣으세요.', errorLabel: '오류 또는 오류 메시지',
      errorPlaceholder: '오류를 설명하거나 메시지를 붙여넣으세요.', analysis: '분석', correctedCode: '수정된 코드',
      optimizeTitle: '코드 최적화', optimizeCode: '최적화할 코드', suggestions: '최적화 제안',
      proTitle: 'Tatik.space Pro 잠금 해제', proBenefits: '무제한 메시지, GPT-4o, 모든 모델 및 서버 우선순위.',
      welcome: '안녕하세요! Tatik.space Pro AI 어시스턴트입니다. 현재 모델: **{model}** — {description}. 전문 분야: {strengths}. 코드를 붙여넣거나 만들고 싶은 것을 알려주세요.',
      modelChanged: '모델이 **{model}**(으)로 변경되었습니다.\n\n{description}\n\n적합한 작업: {strengths}',
      dailyLimit: '일일 한도에 도달했습니다. Pro로 업그레이드하면 무제한 메시지를 사용할 수 있습니다.',
      askModel: '{model}에게 질문… (Enter 전송 · Shift+Enter 줄 바꿈)',
      limitPlaceholder: '한도에 도달했습니다 — 계속하려면 Pro로 업그레이드하세요…',
      analyzing: '분석 중…', analyze: '버그 분석', optimize: '코드 최적화',
      suggested: '추천', deploy: '빠른 배포:', linter: '프리미엄 Linter:',
      bugEmpty: '코드와 오류를 입력하세요.', optimizeEmpty: '최적화할 코드를 입력하세요.',
      bugSuccess: '버그 분석 완료', bugFailure: '버그 분석 실패: ',
      optimizeSuccess: '최적화 제안 {count}개를 찾았습니다', optimizeFailure: '최적화 분석 실패: ',
      codeInserted: '코드를 편집기에 삽입했습니다', copied: '복사됨', copy: '복사', insertCode: '편집기에 삽입 →',
      chatError: '오류: ',
    },
    techAd: {
      affiliateTitle: '제휴 링크 (새 탭에서 열림)', sponsoredTitle: '스폰서 광고',
      affiliateLabel: '→ 제휴 링크', sponsoredLabel: '→ 스폰서', close: '닫기',
      items: {
        'security-1': { title: '🔒 보안', description: '코드 취약점' },
        'security-2': { title: '🛡️ 보호', description: '암호화 백업' },
        'dev-tools-1': { title: '⚡ 성능', description: '속도 분석' },
        'dev-tools-2': { title: '💻 API 테스트', description: 'REST API 테스트' },
        'alert-1': { title: '🚨 오류', description: '실시간 모니터링' },
        'code-quality': { title: '✨ 코드 품질', description: '코드 제안' },
      },
    },
  },
  ar: {
    promo: { trial: 'فترة تجريبية مجانية', days: 'أيام', plan: 'الخطة: مجاني', upgrade: 'الترقية إلى Pro', toast: 'ميزة الترقية قيد التطوير…' },
    ai: {
      button: 'مساعد الذكاء الاصطناعي', title: 'مساعد التطوير بالذكاء الاصطناعي', bugTab: 'تحليل خطأ', optimizeTab: 'تحسين',
      bugTitle: 'حمّل التعليمات البرمجية لتحليلها', language: 'لغة البرمجة', code: 'التعليمات البرمجية (الصقها هنا)',
      codePlaceholder: 'الصق التعليمات البرمجية المراد تحليلها هنا.', errorLabel: 'الخطأ أو رسالته',
      errorPlaceholder: 'صِف الخطأ أو الصق رسالته هنا.', analysis: 'التحليل', correctedCode: 'التعليمات البرمجية المصححة',
      optimizeTitle: 'تحسين التعليمات البرمجية', optimizeCode: 'التعليمات المراد تحسينها', suggestions: 'اقتراحات التحسين',
      proTitle: 'افتح Tatik.space Pro', proBenefits: 'رسائل غير محدودة وGPT-4o وجميع النماذج وأولوية الخادم.',
      welcome: 'مرحبًا! أنا مساعد الذكاء الاصطناعي في Tatik.space Pro. النموذج النشط: **{model}** — {description}. مناسب لـ: {strengths}. الصق التعليمات أو أخبرني بما تريد إنشاءه.',
      modelChanged: 'تم التغيير إلى النموذج **{model}**\n\n{description}\n\nمناسب لـ: {strengths}',
      dailyLimit: 'تم بلوغ الحد اليومي. انتقل إلى Pro للحصول على رسائل غير محدودة.',
      askModel: 'اسأل {model}… (Enter للإرسال · Shift+Enter لسطر جديد)',
      limitPlaceholder: 'تم بلوغ الحد — انتقل إلى Pro للمتابعة…',
      analyzing: 'جارٍ التحليل…', analyze: 'تحليل الخطأ', optimize: 'تحسين التعليمات',
      suggested: 'مقترح', deploy: 'نشر سريع:', linter: 'مدقق Premium:',
      bugEmpty: 'أدخل التعليمات البرمجية والخطأ.', optimizeEmpty: 'أدخل التعليمات المراد تحسينها.',
      bugSuccess: 'اكتمل تحليل الخطأ', bugFailure: 'فشل تحليل الخطأ: ',
      optimizeSuccess: 'تم العثور على {count} من اقتراحات التحسين', optimizeFailure: 'فشل تحليل التحسين: ',
      codeInserted: 'أُدرجت التعليمات في المحرر', copied: 'تم النسخ', copy: 'نسخ', insertCode: 'إدراج في المحرر ←',
      chatError: 'خطأ: ',
    },
    techAd: {
      affiliateTitle: 'رابط تابع (يفتح في علامة تبويب جديدة)', sponsoredTitle: 'إعلان برعاية',
      affiliateLabel: '→ رابط تابع', sponsoredLabel: '→ برعاية', close: 'إغلاق',
      items: {
        'security-1': { title: '🔒 الأمان', description: 'ثغرات في التعليمات البرمجية' },
        'security-2': { title: '🛡️ الحماية', description: 'نسخ احتياطية مشفّرة' },
        'dev-tools-1': { title: '⚡ الأداء', description: 'تحليل السرعة' },
        'dev-tools-2': { title: '💻 اختبار API', description: 'اختبار REST API' },
        'alert-1': { title: '🚨 الأخطاء', description: 'مراقبة فورية' },
        'code-quality': { title: '✨ جودة التعليمات', description: 'اقتراحات برمجية' },
      },
    },
  },
  hi: {
    promo: { trial: 'निःशुल्क परीक्षण', days: 'दिन', plan: 'योजना: मुफ़्त', upgrade: 'Pro में अपग्रेड करें', toast: 'अपग्रेड सुविधा विकसित की जा रही है…' },
    ai: {
      button: 'AI सहायक', title: 'AI डेवलपर सहायक', bugTab: 'बग का विश्लेषण', optimizeTab: 'अनुकूलित करें',
      bugTitle: 'विश्लेषण के लिए कोड लोड करें', language: 'प्रोग्रामिंग भाषा', code: 'कोड (यहाँ पेस्ट करें)',
      codePlaceholder: 'विश्लेषण के लिए कोड यहाँ पेस्ट करें।', errorLabel: 'त्रुटि या त्रुटि संदेश',
      errorPlaceholder: 'त्रुटि बताएँ या उसका संदेश यहाँ पेस्ट करें।', analysis: 'विश्लेषण', correctedCode: 'सुधारा गया कोड',
      optimizeTitle: 'अपने कोड को अनुकूलित करें', optimizeCode: 'अनुकूलित करने के लिए कोड', suggestions: 'अनुकूलन सुझाव',
      proTitle: 'Tatik.space Pro अनलॉक करें', proBenefits: 'असीमित संदेश, GPT-4o, सभी मॉडल और सर्वर प्राथमिकता।',
      welcome: 'नमस्ते! मैं Tatik.space Pro का AI सहायक हूँ। सक्रिय मॉडल: **{model}** — {description}। इनके लिए उपयुक्त: {strengths}। कोड पेस्ट करें या बताएँ कि आप क्या बनाना चाहते हैं।',
      modelChanged: 'मॉडल **{model}** पर स्विच किया गया।\n\n{description}\n\nइन कार्यों के लिए उपयुक्त: {strengths}',
      dailyLimit: 'दैनिक सीमा पूरी हो गई। असीमित संदेशों के लिए Pro पर जाएँ।',
      askModel: '{model} से पूछें… (भेजने के लिए Enter · नई पंक्ति के लिए Shift+Enter)',
      limitPlaceholder: 'सीमा पूरी — जारी रखने के लिए Pro पर जाएँ…',
      analyzing: 'विश्लेषण हो रहा है…', analyze: 'बग का विश्लेषण करें', optimize: 'कोड अनुकूलित करें',
      suggested: 'सुझाया गया', deploy: 'त्वरित डिप्लॉय:', linter: 'प्रीमियम Linter:',
      bugEmpty: 'कृपया कोड और त्रुटि दर्ज करें।', optimizeEmpty: 'कृपया अनुकूलित करने के लिए कोड दर्ज करें।',
      bugSuccess: 'बग विश्लेषण पूरा हुआ', bugFailure: 'बग विश्लेषण विफल: ',
      optimizeSuccess: '{count} अनुकूलन सुझाव मिले', optimizeFailure: 'अनुकूलन विश्लेषण विफल: ',
      codeInserted: 'कोड एडिटर में जोड़ा गया', copied: 'कॉपी किया गया', copy: 'कॉपी करें', insertCode: 'एडिटर में जोड़ें →',
      chatError: 'त्रुटि: ',
    },
    techAd: {
      affiliateTitle: 'एफ़िलिएट लिंक (नए टैब में खुलेगा)', sponsoredTitle: 'प्रायोजित विज्ञापन',
      affiliateLabel: '→ एफ़िलिएट लिंक', sponsoredLabel: '→ प्रायोजित', close: 'बंद करें',
      items: {
        'security-1': { title: '🔒 सुरक्षा', description: 'कोड की कमज़ोरियाँ' },
        'security-2': { title: '🛡️ सुरक्षा', description: 'एन्क्रिप्टेड बैकअप' },
        'dev-tools-1': { title: '⚡ प्रदर्शन', description: 'गति विश्लेषण' },
        'dev-tools-2': { title: '💻 API परीक्षण', description: 'REST API परीक्षण' },
        'alert-1': { title: '🚨 त्रुटियाँ', description: 'रीयल-टाइम निगरानी' },
        'code-quality': { title: '✨ कोड गुणवत्ता', description: 'कोड सुझाव' },
      },
    },
  },
  pl: {
    promo: { trial: 'Bezpłatny okres próbny', days: 'dni', plan: 'Plan: BEZPŁATNY', upgrade: 'Przejdź na Pro', toast: 'Funkcja ulepszenia jest w przygotowaniu…' },
    ai: {
      button: 'Asystent AI', title: 'Asystent AI dla programistów', bugTab: 'Analizuj błąd', optimizeTab: 'Optymalizuj',
      bugTitle: 'Wczytaj kod do analizy', language: 'Język programowania', code: 'Kod (wklej tutaj swój kod)',
      codePlaceholder: 'Wklej tutaj kod do analizy.', errorLabel: 'Błąd lub komunikat o błędzie',
      errorPlaceholder: 'Opisz błąd lub wklej tutaj komunikat.', analysis: 'Analiza', correctedCode: 'Poprawiony kod',
      optimizeTitle: 'Optymalizuj kod', optimizeCode: 'Kod do optymalizacji', suggestions: 'Sugestie optymalizacji',
      proTitle: 'Odblokuj Tatik.space Pro', proBenefits: 'Nielimitowane wiadomości, GPT-4o, wszystkie modele i priorytet serwera.',
      welcome: 'Cześć! Jestem asystentem AI Tatik.space Pro. Aktywny model: **{model}** — {description}. Najlepszy do: {strengths}. Wklej kod lub opisz, co chcesz zbudować.',
      modelChanged: 'Zmieniono model na **{model}**\n\n{description}\n\nNajlepszy do: {strengths}',
      dailyLimit: 'Osiągnięto dzienny limit. Przejdź na Pro, aby wysyłać wiadomości bez limitu.',
      askModel: 'Zapytaj {model}… (Enter, aby wysłać · Shift+Enter, aby przejść do nowego wiersza)',
      limitPlaceholder: 'Osiągnięto limit — przejdź na Pro, aby kontynuować…',
      analyzing: 'Analizowanie…', analyze: 'Analizuj błąd', optimize: 'Optymalizuj kod',
      suggested: 'Polecane', deploy: 'Szybkie wdrożenie:', linter: 'Linter Premium:',
      bugEmpty: 'Wprowadź kod i błąd.', optimizeEmpty: 'Wprowadź kod do optymalizacji.',
      bugSuccess: 'Analiza błędu zakończona', bugFailure: 'Analiza błędu nie powiodła się: ',
      optimizeSuccess: 'Znaleziono sugestie optymalizacji: {count}', optimizeFailure: 'Analiza optymalizacji nie powiodła się: ',
      codeInserted: 'Kod wstawiono do edytora', copied: 'Skopiowano', copy: 'Kopiuj', insertCode: 'Wstaw do edytora →',
      chatError: 'Błąd: ',
    },
    techAd: {
      affiliateTitle: 'Link partnerski (otwiera się w nowej karcie)', sponsoredTitle: 'Reklama sponsorowana',
      affiliateLabel: '→ Link partnerski', sponsoredLabel: '→ Sponsorowane', close: 'Zamknij',
      items: {
        'security-1': { title: '🔒 Bezpieczeństwo', description: 'Luki w kodzie' },
        'security-2': { title: '🛡️ Ochrona', description: 'Szyfrowane kopie zapasowe' },
        'dev-tools-1': { title: '⚡ Wydajność', description: 'Analiza szybkości' },
        'dev-tools-2': { title: '💻 Testowanie API', description: 'Testy REST API' },
        'alert-1': { title: '🚨 Błędy', description: 'Monitorowanie w czasie rzeczywistym' },
        'code-quality': { title: '✨ Jakość kodu', description: 'Sugestie dotyczące kodu' },
      },
    },
  },
  nl: {
    promo: { trial: 'Gratis proefperiode', days: 'dagen', plan: 'Abonnement: GRATIS', upgrade: 'Upgraden naar Pro', toast: 'De upgradefunctie is in ontwikkeling…' },
    ai: {
      button: 'AI-assistent', title: 'AI-assistent voor ontwikkelaars', bugTab: 'Bug analyseren', optimizeTab: 'Optimaliseren',
      bugTitle: 'Laad code om te analyseren', language: 'Programmeertaal', code: 'Code (plak je code hier)',
      codePlaceholder: 'Plak hier de code die je wilt analyseren.', errorLabel: 'Fout of foutmelding',
      errorPlaceholder: 'Beschrijf de fout of plak de melding hier.', analysis: 'Analyse', correctedCode: 'Gecorrigeerde code',
      optimizeTitle: 'Je code optimaliseren', optimizeCode: 'Te optimaliseren code', suggestions: 'Optimalisatiesuggesties',
      proTitle: 'Tatik.space Pro ontgrendelen', proBenefits: 'Onbeperkte berichten, GPT-4o, alle modellen en serverprioriteit.',
      welcome: 'Hallo! Ik ben je AI-assistent voor Tatik.space Pro. Actief model: **{model}** — {description}. Geschikt voor: {strengths}. Plak code of vertel wat je wilt bouwen.',
      modelChanged: 'Model gewijzigd naar **{model}**\n\n{description}\n\nGeoptimaliseerd voor: {strengths}',
      dailyLimit: 'Daglimiet bereikt. Upgrade naar Pro voor onbeperkte berichten.',
      askModel: 'Vraag {model}… (Enter om te verzenden · Shift+Enter voor een nieuwe regel)',
      limitPlaceholder: 'Limiet bereikt — upgrade naar Pro om door te gaan…',
      analyzing: 'Analyseren…', analyze: 'Bug analyseren', optimize: 'Code optimaliseren',
      suggested: 'Aanbevolen', deploy: 'Snel deployen:', linter: 'Premium-linter:',
      bugEmpty: 'Voer code en een fout in.', optimizeEmpty: 'Voer code in om te optimaliseren.',
      bugSuccess: 'Buganalyse voltooid', bugFailure: 'Buganalyse mislukt: ',
      optimizeSuccess: '{count} optimalisatiesuggesties gevonden', optimizeFailure: 'Optimalisatieanalyse mislukt: ',
      codeInserted: 'Code ingevoegd in de editor', copied: 'Gekopieerd', copy: 'Kopiëren', insertCode: 'Invoegen in editor →',
      chatError: 'Fout: ',
    },
    techAd: {
      affiliateTitle: 'Affiliate-link (opent in een nieuw tabblad)', sponsoredTitle: 'Gesponsorde advertentie',
      affiliateLabel: '→ Affiliate-link', sponsoredLabel: '→ Gesponsord', close: 'Sluiten',
      items: {
        'security-1': { title: '🔒 Beveiliging', description: 'Kwetsbaarheden in code' },
        'security-2': { title: '🛡️ Bescherming', description: 'Versleutelde back-ups' },
        'dev-tools-1': { title: '⚡ Prestaties', description: 'Snelheidsanalyse' },
        'dev-tools-2': { title: '💻 API-testen', description: 'REST API-testen' },
        'alert-1': { title: '🚨 Fouten', description: 'Realtime bewaking' },
        'code-quality': { title: '✨ Codekwaliteit', description: 'Codesuggesties' },
      },
    },
  },
  tr: {
    promo: { trial: 'Ücretsiz deneme', days: 'gün', plan: 'Plan: ÜCRETSİZ', upgrade: 'Pro’ya yükselt', toast: 'Yükseltme özelliği geliştiriliyor…' },
    ai: {
      button: 'Yapay zekâ asistanı', title: 'Yapay zekâ geliştirici asistanı', bugTab: 'Hatayı analiz et', optimizeTab: 'Optimize et',
      bugTitle: 'Analiz edilecek kodu yükle', language: 'Programlama dili', code: 'Kod (buraya yapıştırın)',
      codePlaceholder: 'Analiz edilecek kodu buraya yapıştırın.', errorLabel: 'Hata veya hata mesajı',
      errorPlaceholder: 'Hatayı açıklayın veya mesajını buraya yapıştırın.', analysis: 'Analiz', correctedCode: 'Düzeltilmiş kod',
      optimizeTitle: 'Kodunuzu optimize edin', optimizeCode: 'Optimize edilecek kod', suggestions: 'Optimizasyon önerileri',
      proTitle: 'Tatik.space Pro’nun kilidini açın', proBenefits: 'Sınırsız mesaj, GPT-4o, tüm modeller ve sunucu önceliği.',
      welcome: 'Merhaba! Tatik.space Pro yapay zekâ asistanınızım. Etkin model: **{model}** — {description}. Şunlar için uygun: {strengths}. Kod yapıştırın veya ne oluşturmak istediğinizi anlatın.',
      modelChanged: 'Model **{model}** olarak değiştirildi.\n\n{description}\n\nŞunlar için optimize edildi: {strengths}',
      dailyLimit: 'Günlük sınıra ulaşıldı. Sınırsız mesaj için Pro’ya geçin.',
      askModel: '{model}’e sorun… (Göndermek için Enter · Yeni satır için Shift+Enter)',
      limitPlaceholder: 'Sınıra ulaşıldı — devam etmek için Pro’ya geçin…',
      analyzing: 'Analiz ediliyor…', analyze: 'Hatayı analiz et', optimize: 'Kodu optimize et',
      suggested: 'Önerilen', deploy: 'Hızlı dağıtım:', linter: 'Premium Linter:',
      bugEmpty: 'Lütfen kodu ve hatayı girin.', optimizeEmpty: 'Lütfen optimize edilecek kodu girin.',
      bugSuccess: 'Hata analizi tamamlandı', bugFailure: 'Hata analizi başarısız: ',
      optimizeSuccess: '{count} optimizasyon önerisi bulundu', optimizeFailure: 'Optimizasyon analizi başarısız: ',
      codeInserted: 'Kod düzenleyiciye eklendi', copied: 'Kopyalandı', copy: 'Kopyala', insertCode: 'Düzenleyiciye ekle →',
      chatError: 'Hata: ',
    },
    techAd: {
      affiliateTitle: 'Bağlı kuruluş bağlantısı (yeni sekmede açılır)', sponsoredTitle: 'Sponsorlu reklam',
      affiliateLabel: '→ Bağlı kuruluş bağlantısı', sponsoredLabel: '→ Sponsorlu', close: 'Kapat',
      items: {
        'security-1': { title: '🔒 Güvenlik', description: 'Kod güvenlik açıkları' },
        'security-2': { title: '🛡️ Koruma', description: 'Şifrelenmiş yedeklemeler' },
        'dev-tools-1': { title: '⚡ Performans', description: 'Hız analizi' },
        'dev-tools-2': { title: '💻 API testi', description: 'REST API testi' },
        'alert-1': { title: '🚨 Hatalar', description: 'Gerçek zamanlı izleme' },
        'code-quality': { title: '✨ Kod kalitesi', description: 'Kod önerileri' },
      },
    },
  },
  sv: {
    promo: { trial: 'Gratis provperiod', days: 'dagar', plan: 'Plan: GRATIS', upgrade: 'Uppgradera till Pro', toast: 'Uppgraderingen är under utveckling…' },
    ai: {
      button: 'AI-assistent', title: 'AI-assistent för utvecklare', bugTab: 'Analysera fel', optimizeTab: 'Optimera',
      bugTitle: 'Ladda kod för analys', language: 'Programmeringsspråk', code: 'Kod (klistra in här)',
      codePlaceholder: 'Klistra in koden som ska analyseras här.', errorLabel: 'Fel eller felmeddelande',
      errorPlaceholder: 'Beskriv felet eller klistra in meddelandet här.', analysis: 'Analys', correctedCode: 'Korrigerad kod',
      optimizeTitle: 'Optimera din kod', optimizeCode: 'Kod att optimera', suggestions: 'Optimeringsförslag',
      proTitle: 'Lås upp Tatik.space Pro', proBenefits: 'Obegränsade meddelanden, GPT-4o, alla modeller och serverprioritet.',
      welcome: 'Hej! Jag är din AI-assistent för Tatik.space Pro. Aktiv modell: **{model}** — {description}. Bäst för: {strengths}. Klistra in kod eller berätta vad du vill bygga.',
      modelChanged: 'Modell ändrad till **{model}**\n\n{description}\n\nOptimerad för: {strengths}',
      dailyLimit: 'Dagsgränsen har nåtts. Uppgradera till Pro för obegränsade meddelanden.',
      askModel: 'Fråga {model}… (Enter för att skicka · Skift+Enter för ny rad)',
      limitPlaceholder: 'Gränsen har nåtts — uppgradera till Pro för att fortsätta…',
      analyzing: 'Analyserar…', analyze: 'Analysera fel', optimize: 'Optimera kod',
      suggested: 'Föreslaget', deploy: 'Snabb driftsättning:', linter: 'Premium-linter:',
      bugEmpty: 'Ange kod och ett fel.', optimizeEmpty: 'Ange kod som ska optimeras.',
      bugSuccess: 'Felanalysen är klar', bugFailure: 'Felanalysen misslyckades: ',
      optimizeSuccess: '{count} optimeringsförslag hittades', optimizeFailure: 'Optimeringsanalysen misslyckades: ',
      codeInserted: 'Kod infogad i redigeraren', copied: 'Kopierat', copy: 'Kopiera', insertCode: 'Infoga i redigeraren →',
      chatError: 'Fel: ',
    },
    techAd: {
      affiliateTitle: 'Affiliate-länk (öppnas i en ny flik)', sponsoredTitle: 'Sponsrad annons',
      affiliateLabel: '→ Affiliate-länk', sponsoredLabel: '→ Sponsrad', close: 'Stäng',
      items: {
        'security-1': { title: '🔒 Säkerhet', description: 'Sårbarheter i kod' },
        'security-2': { title: '🛡️ Skydd', description: 'Krypterade säkerhetskopior' },
        'dev-tools-1': { title: '⚡ Prestanda', description: 'Hastighetsanalys' },
        'dev-tools-2': { title: '💻 API-testning', description: 'REST API-testning' },
        'alert-1': { title: '🚨 Fel', description: 'Övervakning i realtid' },
        'code-quality': { title: '✨ Kodkvalitet', description: 'Kodförslag' },
      },
    },
  },
  da: {
    promo: { trial: 'Gratis prøveperiode', days: 'dage', plan: 'Plan: GRATIS', upgrade: 'Opgrader til Pro', toast: 'Opgraderingen er under udvikling…' },
    ai: {
      button: 'AI-assistent', title: 'AI-assistent til udvikling', bugTab: 'Analysér fejl', optimizeTab: 'Optimér',
      bugTitle: 'Indlæs kode til analyse', language: 'Programmeringssprog', code: 'Kode (indsæt din kode her)',
      codePlaceholder: 'Indsæt koden, der skal analyseres, her.', errorLabel: 'Fejl eller fejlmeddelelse',
      errorPlaceholder: 'Beskriv fejlen, eller indsæt meddelelsen her.', analysis: 'Analyse', correctedCode: 'Rettet kode',
      optimizeTitle: 'Optimér din kode', optimizeCode: 'Kode, der skal optimeres', suggestions: 'Optimeringsforslag',
      proTitle: 'Lås op for Tatik.space Pro', proBenefits: 'Ubegrænsede beskeder, GPT-4o, alle modeller og serverprioritet.',
      welcome: 'Hej! Jeg er din AI-assistent til Tatik.space Pro. Aktiv model: **{model}** — {description}. Bedst til: {strengths}. Indsæt kode, eller fortæl, hvad du vil bygge.',
      modelChanged: 'Model ændret til **{model}**\n\n{description}\n\nOptimeret til: {strengths}',
      dailyLimit: 'Dagsgrænsen er nået. Opgrader til Pro for ubegrænsede beskeder.',
      askModel: 'Spørg {model}… (Enter for at sende · Skift+Enter for ny linje)',
      limitPlaceholder: 'Grænsen er nået — opgrader til Pro for at fortsætte…',
      analyzing: 'Analyserer…', analyze: 'Analysér fejl', optimize: 'Optimér kode',
      suggested: 'Foreslået', deploy: 'Hurtig udrulning:', linter: 'Premium-linter:',
      bugEmpty: 'Indtast kode og en fejl.', optimizeEmpty: 'Indtast kode, der skal optimeres.',
      bugSuccess: 'Fejlanalysen er fuldført', bugFailure: 'Fejlanalysen mislykkedes: ',
      optimizeSuccess: '{count} optimeringsforslag fundet', optimizeFailure: 'Optimeringsanalysen mislykkedes: ',
      codeInserted: 'Kode indsat i editoren', copied: 'Kopieret', copy: 'Kopiér', insertCode: 'Indsæt i editor →',
      chatError: 'Fejl: ',
    },
    techAd: {
      affiliateTitle: 'Affiliate-link (åbner i en ny fane)', sponsoredTitle: 'Sponsoreret annonce',
      affiliateLabel: '→ Affiliate-link', sponsoredLabel: '→ Sponsoreret', close: 'Luk',
      items: {
        'security-1': { title: '🔒 Sikkerhed', description: 'Sårbarheder i kode' },
        'security-2': { title: '🛡️ Beskyttelse', description: 'Krypterede sikkerhedskopier' },
        'dev-tools-1': { title: '⚡ Ydeevne', description: 'Hastighedsanalyse' },
        'dev-tools-2': { title: '💻 API-test', description: 'REST API-test' },
        'alert-1': { title: '🚨 Fejl', description: 'Overvågning i realtid' },
        'code-quality': { title: '✨ Kodekvalitet', description: 'Kodeforslag' },
      },
    },
  },
  no: {
    promo: { trial: 'Gratis prøveperiode', days: 'dager', plan: 'Plan: GRATIS', upgrade: 'Oppgrader til Pro', toast: 'Oppgraderingen er under utvikling…' },
    ai: {
      button: 'AI-assistent', title: 'AI-assistent for utviklere', bugTab: 'Analyser feil', optimizeTab: 'Optimaliser',
      bugTitle: 'Last inn kode for analyse', language: 'Programmeringsspråk', code: 'Kode (lim inn koden her)',
      codePlaceholder: 'Lim inn koden som skal analyseres her.', errorLabel: 'Feil eller feilmelding',
      errorPlaceholder: 'Beskriv feilen eller lim inn meldingen her.', analysis: 'Analyse', correctedCode: 'Korrigert kode',
      optimizeTitle: 'Optimaliser koden', optimizeCode: 'Kode som skal optimaliseres', suggestions: 'Optimaliseringsforslag',
      proTitle: 'Lås opp Tatik.space Pro', proBenefits: 'Ubegrensede meldinger, GPT-4o, alle modeller og serverprioritet.',
      welcome: 'Hei! Jeg er AI-assistenten din for Tatik.space Pro. Aktiv modell: **{model}** — {description}. Best for: {strengths}. Lim inn kode eller fortell hva du vil bygge.',
      modelChanged: 'Modellen er endret til **{model}**\n\n{description}\n\nOptimalisert for: {strengths}',
      dailyLimit: 'Dagsgrensen er nådd. Oppgrader til Pro for ubegrensede meldinger.',
      askModel: 'Spør {model}… (Enter for å sende · Skift+Enter for ny linje)',
      limitPlaceholder: 'Grensen er nådd — oppgrader til Pro for å fortsette…',
      analyzing: 'Analyserer…', analyze: 'Analyser feil', optimize: 'Optimaliser kode',
      suggested: 'Foreslått', deploy: 'Rask utrulling:', linter: 'Premium-linter:',
      bugEmpty: 'Skriv inn kode og en feil.', optimizeEmpty: 'Skriv inn kode som skal optimaliseres.',
      bugSuccess: 'Feilanalyse fullført', bugFailure: 'Feilanalyse mislyktes: ',
      optimizeSuccess: '{count} optimaliseringsforslag funnet', optimizeFailure: 'Optimaliseringsanalysen mislyktes: ',
      codeInserted: 'Kode satt inn i editoren', copied: 'Kopiert', copy: 'Kopier', insertCode: 'Sett inn i editoren →',
      chatError: 'Feil: ',
    },
    techAd: {
      affiliateTitle: 'Partnerlenke (åpnes i en ny fane)', sponsoredTitle: 'Sponset annonse',
      affiliateLabel: '→ Partnerlenke', sponsoredLabel: '→ Sponset', close: 'Lukk',
      items: {
        'security-1': { title: '🔒 Sikkerhet', description: 'Sårbarheter i kode' },
        'security-2': { title: '🛡️ Beskyttelse', description: 'Krypterte sikkerhetskopier' },
        'dev-tools-1': { title: '⚡ Ytelse', description: 'Hastighetsanalyse' },
        'dev-tools-2': { title: '💻 API-testing', description: 'REST API-testing' },
        'alert-1': { title: '🚨 Feil', description: 'Overvåking i sanntid' },
        'code-quality': { title: '✨ Kodekvalitet', description: 'Kodeforslag' },
      },
    },
  },
  fi: {
    promo: { trial: 'Maksuton kokeilujakso', days: 'päivää', plan: 'Tilaus: ILMAINEN', upgrade: 'Päivitä Pro-versioon', toast: 'Päivitysominaisuus on kehitteillä…' },
    ai: {
      button: 'Tekoälyavustaja', title: 'Tekoälyavustaja kehittäjille', bugTab: 'Analysoi virhe', optimizeTab: 'Optimoi',
      bugTitle: 'Lataa analysoitava koodi', language: 'Ohjelmointikieli', code: 'Koodi (liitä koodi tähän)',
      codePlaceholder: 'Liitä analysoitava koodi tähän.', errorLabel: 'Virhe tai virheilmoitus',
      errorPlaceholder: 'Kuvaile virhe tai liitä sen viesti tähän.', analysis: 'Analyysi', correctedCode: 'Korjattu koodi',
      optimizeTitle: 'Optimoi koodisi', optimizeCode: 'Optimoitava koodi', suggestions: 'Optimointiehdotukset',
      proTitle: 'Avaa Tatik.space Pro', proBenefits: 'Rajattomasti viestejä, GPT-4o, kaikki mallit ja palvelimen etusija.',
      welcome: 'Hei! Olen Tatik.space Pron tekoälyavustaja. Aktiivinen malli: **{model}** — {description}. Sopii erityisesti: {strengths}. Liitä koodia tai kerro, mitä haluat rakentaa.',
      modelChanged: 'Malliksi vaihdettiin **{model}**\n\n{description}\n\nOptimoitu seuraaviin: {strengths}',
      dailyLimit: 'Päivittäinen raja saavutettu. Päivitä Pro-versioon saadaksesi rajattomasti viestejä.',
      askModel: 'Kysy mallilta {model}… (Enter lähettää · Shift+Enter lisää rivinvaihdon)',
      limitPlaceholder: 'Raja saavutettu — päivitä Pro-versioon jatkaaksesi…',
      analyzing: 'Analysoidaan…', analyze: 'Analysoi virhe', optimize: 'Optimoi koodi',
      suggested: 'Suositeltu', deploy: 'Nopea käyttöönotto:', linter: 'Premium-linter:',
      bugEmpty: 'Anna koodi ja virhe.', optimizeEmpty: 'Anna optimoitava koodi.',
      bugSuccess: 'Virheanalyysi valmis', bugFailure: 'Virheen analysointi epäonnistui: ',
      optimizeSuccess: 'Löytyi {count} optimointiehdotusta', optimizeFailure: 'Optimointianalyysi epäonnistui: ',
      codeInserted: 'Koodi lisätty editoriin', copied: 'Kopioitu', copy: 'Kopioi', insertCode: 'Lisää editoriin →',
      chatError: 'Virhe: ',
    },
    techAd: {
      affiliateTitle: 'Kumppanuuslinkki (avautuu uuteen välilehteen)', sponsoredTitle: 'Sponsoroitu mainos',
      affiliateLabel: '→ Kumppanuuslinkki', sponsoredLabel: '→ Sponsoroitu', close: 'Sulje',
      items: {
        'security-1': { title: '🔒 Tietoturva', description: 'Koodin haavoittuvuudet' },
        'security-2': { title: '🛡️ Suojaus', description: 'Salatut varmuuskopiot' },
        'dev-tools-1': { title: '⚡ Suorituskyky', description: 'Nopeusanalyysi' },
        'dev-tools-2': { title: '💻 API-testaus', description: 'REST API -testaus' },
        'alert-1': { title: '🚨 Virheet', description: 'Reaaliaikainen valvonta' },
        'code-quality': { title: '✨ Koodin laatu', description: 'Koodiehdotukset' },
      },
    },
  },
  uk: {
    promo: { trial: 'Безкоштовний пробний період', days: 'днів', plan: 'План: БЕЗКОШТОВНО', upgrade: 'Перейти на Pro', toast: 'Функція переходу на Pro у розробці…' },
    ai: {
      button: 'ШІ-помічник', title: 'ШІ-помічник розробника', bugTab: 'Аналіз помилки', optimizeTab: 'Оптимізація',
      bugTitle: 'Завантажте код для аналізу', language: 'Мова програмування', code: 'Код (вставте його сюди)',
      codePlaceholder: 'Вставте сюди код для аналізу.', errorLabel: 'Помилка або повідомлення про помилку',
      errorPlaceholder: 'Опишіть помилку або вставте її повідомлення.', analysis: 'Аналіз', correctedCode: 'Виправлений код',
      optimizeTitle: 'Оптимізуйте код', optimizeCode: 'Код для оптимізації', suggestions: 'Поради з оптимізації',
      proTitle: 'Відкрийте Tatik.space Pro', proBenefits: 'Необмежені повідомлення, GPT-4o, усі моделі та пріоритет сервера.',
      welcome: 'Вітаю! Я ШІ-помічник Tatik.space Pro. Активна модель: **{model}** — {description}. Оптимізована для: {strengths}. Вставте код або розкажіть, що хочете створити.',
      modelChanged: 'Вибрано модель **{model}**\n\n{description}\n\nОптимізована для: {strengths}',
      dailyLimit: 'Досягнуто денного ліміту. Перейдіть на Pro для необмежених повідомлень.',
      askModel: 'Запитайте {model}… (Enter — надіслати · Shift+Enter — новий рядок)',
      limitPlaceholder: 'Досягнуто ліміту — перейдіть на Pro, щоб продовжити…',
      analyzing: 'Аналіз…', analyze: 'Аналізувати помилку', optimize: 'Оптимізувати код',
      suggested: 'Рекомендовано', deploy: 'Швидке розгортання:', linter: 'Преміум-лінтер:',
      bugEmpty: 'Введіть код і помилку.', optimizeEmpty: 'Введіть код для оптимізації.',
      bugSuccess: 'Аналіз помилки завершено', bugFailure: 'Не вдалося проаналізувати помилку: ',
      optimizeSuccess: 'Знайдено порад з оптимізації: {count}', optimizeFailure: 'Не вдалося виконати оптимізацію: ',
      codeInserted: 'Код вставлено в редактор', copied: 'Скопійовано', copy: 'Копіювати', insertCode: 'Вставити в редактор →',
      chatError: 'Помилка: ',
    },
    techAd: {
      affiliateTitle: 'Партнерське посилання (відкриється в новій вкладці)', sponsoredTitle: 'Рекламне оголошення',
      affiliateLabel: '→ Партнерське посилання', sponsoredLabel: '→ Реклама', close: 'Закрити',
      items: {
        'security-1': { title: '🔒 Безпека', description: 'Вразливості в коді' },
        'security-2': { title: '🛡️ Захист', description: 'Зашифровані резервні копії' },
        'dev-tools-1': { title: '⚡ Продуктивність', description: 'Аналіз швидкості' },
        'dev-tools-2': { title: '💻 Тестування API', description: 'Тестування REST API' },
        'alert-1': { title: '🚨 Помилки', description: 'Моніторинг у реальному часі' },
        'code-quality': { title: '✨ Якість коду', description: 'Поради щодо коду' },
      },
    },
  },
  cs: {
    promo: { trial: 'Bezplatná zkušební verze', days: 'dní', plan: 'Tarif: ZDARMA', upgrade: 'Přejít na Pro', toast: 'Upgrade se připravuje…' },
    ai: {
      button: 'Asistent AI', title: 'Vývojářský asistent AI', bugTab: 'Analyzovat chybu', optimizeTab: 'Optimalizovat',
      bugTitle: 'Načtěte kód k analýze', language: 'Programovací jazyk', code: 'Kód (vložte ho sem)',
      codePlaceholder: 'Sem vložte kód k analýze.', errorLabel: 'Chyba nebo chybová zpráva',
      errorPlaceholder: 'Popište chybu nebo sem vložte její zprávu.', analysis: 'Analýza', correctedCode: 'Opravený kód',
      optimizeTitle: 'Optimalizujte svůj kód', optimizeCode: 'Kód k optimalizaci', suggestions: 'Návrhy na optimalizaci',
      proTitle: 'Odemknout Tatik.space Pro', proBenefits: 'Neomezené zprávy, GPT-4o, všechny modely a priorita serveru.',
      welcome: 'Dobrý den! Jsem asistent AI pro Tatik.space Pro. Aktivní model: **{model}** — {description}. Nejlepší pro: {strengths}. Vložte kód nebo popište, co chcete vytvořit.',
      modelChanged: 'Model změněn na **{model}**\n\n{description}\n\nOptimalizace pro: {strengths}',
      dailyLimit: 'Byl dosažen denní limit. Přejděte na Pro a získejte neomezené zprávy.',
      askModel: 'Zeptejte se modelu {model}… (Enter odešle · Shift+Enter přidá nový řádek)',
      limitPlaceholder: 'Limit dosažen — přejděte na Pro a pokračujte…',
      analyzing: 'Probíhá analýza…', analyze: 'Analyzovat chybu', optimize: 'Optimalizovat kód',
      suggested: 'Doporučeno', deploy: 'Rychlé nasazení:', linter: 'Prémiový linter:',
      bugEmpty: 'Zadejte kód a chybu.', optimizeEmpty: 'Zadejte kód k optimalizaci.',
      bugSuccess: 'Analýza chyby dokončena', bugFailure: 'Analýza chyby se nezdařila: ',
      optimizeSuccess: 'Nalezeno návrhů na optimalizaci: {count}', optimizeFailure: 'Analýza optimalizace se nezdařila: ',
      codeInserted: 'Kód byl vložen do editoru', copied: 'Zkopírováno', copy: 'Kopírovat', insertCode: 'Vložit do editoru →',
      chatError: 'Chyba: ',
    },
    techAd: {
      affiliateTitle: 'Partnerský odkaz (otevře se na nové kartě)', sponsoredTitle: 'Sponzorovaná reklama',
      affiliateLabel: '→ Partnerský odkaz', sponsoredLabel: '→ Sponzorováno', close: 'Zavřít',
      items: {
        'security-1': { title: '🔒 Zabezpečení', description: 'Zranitelnosti v kódu' },
        'security-2': { title: '🛡️ Ochrana', description: 'Šifrované zálohy' },
        'dev-tools-1': { title: '⚡ Výkon', description: 'Analýza rychlosti' },
        'dev-tools-2': { title: '💻 Testování API', description: 'Testování REST API' },
        'alert-1': { title: '🚨 Chyby', description: 'Monitorování v reálném čase' },
        'code-quality': { title: '✨ Kvalita kódu', description: 'Návrhy ke kódu' },
      },
    },
  },
};

export function getComponentCopy(locale: ComponentLocale): ComponentCopy {
  return componentCopy[locale] ?? componentCopy.en;
}

type ModelCopy = {
  badges: [string, string, string, string];
  descriptions: [string, string, string, string];
  strengths: [[string, string, string, string], [string, string, string, string], [string, string, string, string], [string, string, string, string]];
};

const modelCopy: Record<ComponentLocale, ModelCopy> = {
  en: { badges: ['Best for code', 'Best for debugging', 'Best for UX/SEO', 'Pro only'], descriptions: ['For complex code generation and architecture', 'Excellent reasoning and bug fixing', 'Fast, great for SEO, UX, and content', 'Most powerful — unlock with Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refactoring', 'Architecture'], ['Debugging', 'Algorithms', 'Optimization', 'Explanation'], ['SEO', 'UX Copy', 'Accessibility', 'Performance'], ['Full Stack', 'Complex UX', 'System Design', 'All Tasks']] },
  it: { badges: ['Ideale per il codice', 'Ideale per il debug', 'Ideale per UX/SEO', 'Solo Pro'], descriptions: ['Per generazione di codice complessa e architettura', 'Ottimo ragionamento e correzione dei bug', 'Veloce, ideale per SEO, UX e contenuti', 'Il più potente — disponibile con Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refactoring', 'Architettura'], ['Debug', 'Algoritmi', 'Ottimizzazione', 'Spiegazioni'], ['SEO', 'Testi UX', 'Accessibilità', 'Prestazioni'], ['Full stack', 'UX complessa', 'Progettazione di sistemi', 'Tutte le attività']] },
  es: { badges: ['Ideal para código', 'Ideal para depuración', 'Ideal para UX/SEO', 'Solo Pro'], descriptions: ['Para generar código complejo y diseñar arquitecturas', 'Excelente razonamiento y corrección de errores', 'Rápido, ideal para SEO, UX y contenido', 'El más potente: disponible con Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refactorización', 'Arquitectura'], ['Depuración', 'Algoritmos', 'Optimización', 'Explicación'], ['SEO', 'Textos UX', 'Accesibilidad', 'Rendimiento'], ['Full Stack', 'UX compleja', 'Diseño de sistemas', 'Todas las tareas']] },
  fr: { badges: ['Idéal pour le code', 'Idéal pour le débogage', 'Idéal pour UX/SEO', 'Pro uniquement'], descriptions: ['Pour la génération de code complexe et l’architecture', 'Excellent raisonnement et correction des bugs', 'Rapide, idéal pour le SEO, l’UX et le contenu', 'Le plus puissant — disponible avec Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refactorisation', 'Architecture'], ['Débogage', 'Algorithmes', 'Optimisation', 'Explication'], ['SEO', 'Textes UX', 'Accessibilité', 'Performances'], ['Full Stack', 'UX complexe', 'Conception de systèmes', 'Toutes les tâches']] },
  de: { badges: ['Ideal für Code', 'Ideal fürs Debugging', 'Ideal für UX/SEO', 'Nur Pro'], descriptions: ['Für komplexe Codegenerierung und Architektur', 'Hervorragendes logisches Denken und Fehlerbehebung', 'Schnell, ideal für SEO, UX und Inhalte', 'Am leistungsstärksten — mit Pro verfügbar'], strengths: [['HTML/CSS', 'JavaScript', 'Refactoring', 'Architektur'], ['Debugging', 'Algorithmen', 'Optimierung', 'Erklärung'], ['SEO', 'UX-Texte', 'Barrierefreiheit', 'Leistung'], ['Full Stack', 'Komplexe UX', 'Systemdesign', 'Alle Aufgaben']] },
  pt: { badges: ['Ideal para código', 'Ideal para depuração', 'Ideal para UX/SEO', 'Somente Pro'], descriptions: ['Para geração de código complexo e arquitetura', 'Excelente raciocínio e correção de erros', 'Rápido, ótimo para SEO, UX e conteúdo', 'O mais poderoso — disponível no Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refatoração', 'Arquitetura'], ['Depuração', 'Algoritmos', 'Otimização', 'Explicação'], ['SEO', 'Textos UX', 'Acessibilidade', 'Desempenho'], ['Full Stack', 'UX complexa', 'Design de sistemas', 'Todas as tarefas']] },
  ru: { badges: ['Для работы с кодом', 'Для отладки', 'Для UX/SEO', 'Только Pro'], descriptions: ['Для сложной генерации кода и проектирования архитектуры', 'Отлично рассуждает и исправляет ошибки', 'Быстрая модель для SEO, UX и контента', 'Самая мощная модель — доступна с Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Рефакторинг', 'Архитектура'], ['Отладка', 'Алгоритмы', 'Оптимизация', 'Объяснение'], ['SEO', 'UX-тексты', 'Доступность', 'Производительность'], ['Full Stack', 'Сложный UX', 'Проектирование систем', 'Все задачи']] },
  zh: { badges: ['擅长编程', '擅长调试', '适用于 UX/SEO', '仅限 Pro'], descriptions: ['适用于复杂代码生成和架构设计', '推理和修复错误能力出色', '速度快，适用于 SEO、UX 和内容创作', '功能最强大 — 升级 Pro 即可解锁'], strengths: [['HTML/CSS', 'JavaScript', '重构', '架构设计'], ['调试', '算法', '优化', '解释说明'], ['SEO', 'UX 文案', '无障碍访问', '性能'], ['全栈开发', '复杂 UX', '系统设计', '所有任务']] },
  ja: { badges: ['コード向け', 'デバッグ向け', 'UX/SEO 向け', 'Pro 限定'], descriptions: ['複雑なコード生成とアーキテクチャ設計に適しています', '推論とバグ修正に優れています', '高速で、SEO・UX・コンテンツに最適です', '最も強力 — Pro で利用可能'], strengths: [['HTML/CSS', 'JavaScript', 'リファクタリング', 'アーキテクチャ'], ['デバッグ', 'アルゴリズム', '最適化', '解説'], ['SEO', 'UX ライティング', 'アクセシビリティ', 'パフォーマンス'], ['フルスタック', '複雑な UX', 'システム設計', 'すべてのタスク']] },
  ko: { badges: ['코드 작업에 적합', '디버깅에 적합', 'UX/SEO에 적합', 'Pro 전용'], descriptions: ['복잡한 코드 생성 및 아키텍처 설계에 적합', '추론 및 버그 수정에 탁월', '빠르고 SEO, UX, 콘텐츠 작업에 적합', '가장 강력한 모델 — Pro에서 사용 가능'], strengths: [['HTML/CSS', 'JavaScript', '리팩터링', '아키텍처'], ['디버깅', '알고리즘', '최적화', '설명'], ['SEO', 'UX 카피', '접근성', '성능'], ['풀스택', '복잡한 UX', '시스템 설계', '모든 작업']] },
  ar: { badges: ['الأفضل للبرمجة', 'الأفضل لتصحيح الأخطاء', 'الأفضل لـ UX/SEO', 'لـ Pro فقط'], descriptions: ['لتوليد التعليمات البرمجية المعقدة وتصميم البنية', 'استدلال ممتاز وإصلاح للأخطاء', 'سريع ومناسب لـ SEO وUX والمحتوى', 'الأقوى — متاح مع Pro'], strengths: [['HTML/CSS', 'JavaScript', 'إعادة هيكلة الكود', 'البنية'], ['تصحيح الأخطاء', 'الخوارزميات', 'التحسين', 'الشرح'], ['SEO', 'نصوص UX', 'إمكانية الوصول', 'الأداء'], ['Full Stack', 'UX معقدة', 'تصميم الأنظمة', 'جميع المهام']] },
  hi: { badges: ['कोड के लिए श्रेष्ठ', 'डिबगिंग के लिए श्रेष्ठ', 'UX/SEO के लिए श्रेष्ठ', 'केवल Pro'], descriptions: ['जटिल कोड निर्माण और आर्किटेक्चर के लिए', 'बेहतरीन तर्क क्षमता और बग समाधान', 'तेज़, SEO, UX और सामग्री के लिए उपयुक्त', 'सबसे शक्तिशाली — Pro के साथ उपलब्ध'], strengths: [['HTML/CSS', 'JavaScript', 'रीफैक्टरिंग', 'आर्किटेक्चर'], ['डिबगिंग', 'एल्गोरिदम', 'अनुकूलन', 'व्याख्या'], ['SEO', 'UX कॉपी', 'सुलभता', 'प्रदर्शन'], ['फुल स्टैक', 'जटिल UX', 'सिस्टम डिज़ाइन', 'सभी कार्य']] },
  pl: { badges: ['Najlepszy do kodu', 'Najlepszy do debugowania', 'Najlepszy do UX/SEO', 'Tylko Pro'], descriptions: ['Do złożonego generowania kodu i projektowania architektury', 'Świetne wnioskowanie i naprawianie błędów', 'Szybki, dobry do SEO, UX i treści', 'Najpotężniejszy — dostępny w Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktoryzacja', 'Architektura'], ['Debugowanie', 'Algorytmy', 'Optymalizacja', 'Wyjaśnianie'], ['SEO', 'Teksty UX', 'Dostępność', 'Wydajność'], ['Full Stack', 'Złożone UX', 'Projektowanie systemów', 'Wszystkie zadania']] },
  nl: { badges: ['Beste voor code', 'Beste voor debuggen', 'Beste voor UX/SEO', 'Alleen Pro'], descriptions: ['Voor complexe codegeneratie en architectuur', 'Uitstekend redeneren en bugs oplossen', 'Snel, geschikt voor SEO, UX en content', 'Krachtigste model — beschikbaar met Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refactoring', 'Architectuur'], ['Debuggen', 'Algoritmen', 'Optimalisatie', 'Uitleg'], ['SEO', 'UX-teksten', 'Toegankelijkheid', 'Prestaties'], ['Full Stack', 'Complexe UX', 'Systeemontwerp', 'Alle taken']] },
  tr: { badges: ['Kod için en iyisi', 'Hata ayıklama için en iyisi', 'UX/SEO için en iyisi', 'Yalnızca Pro'], descriptions: ['Karmaşık kod üretimi ve mimari için', 'Mükemmel akıl yürütme ve hata düzeltme', 'Hızlı; SEO, UX ve içerik için ideal', 'En güçlü model — Pro ile kullanılabilir'], strengths: [['HTML/CSS', 'JavaScript', 'Yeniden düzenleme', 'Mimari'], ['Hata ayıklama', 'Algoritmalar', 'Optimizasyon', 'Açıklama'], ['SEO', 'UX metinleri', 'Erişilebilirlik', 'Performans'], ['Full Stack', 'Karmaşık UX', 'Sistem tasarımı', 'Tüm görevler']] },
  sv: { badges: ['Bäst för kod', 'Bäst för felsökning', 'Bäst för UX/SEO', 'Endast Pro'], descriptions: ['För komplex kodgenerering och arkitektur', 'Utmärkt resonemang och buggfixning', 'Snabb, utmärkt för SEO, UX och innehåll', 'Kraftfullast — lås upp med Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktorering', 'Arkitektur'], ['Felsökning', 'Algoritmer', 'Optimering', 'Förklaring'], ['SEO', 'UX-text', 'Tillgänglighet', 'Prestanda'], ['Full Stack', 'Komplex UX', 'Systemdesign', 'Alla uppgifter']] },
  da: { badges: ['Bedst til kode', 'Bedst til fejlfinding', 'Bedst til UX/SEO', 'Kun Pro'], descriptions: ['Til kompleks kodegenerering og arkitektur', 'Fremragende ræsonnement og fejlrettelse', 'Hurtig og god til SEO, UX og indhold', 'Mest kraftfulde — lås op med Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktorering', 'Arkitektur'], ['Fejlfinding', 'Algoritmer', 'Optimering', 'Forklaring'], ['SEO', 'UX-tekst', 'Tilgængelighed', 'Ydeevne'], ['Full Stack', 'Kompleks UX', 'Systemdesign', 'Alle opgaver']] },
  no: { badges: ['Best for kode', 'Best for feilsøking', 'Best for UX/SEO', 'Kun Pro'], descriptions: ['For kompleks kodegenerering og arkitektur', 'Utmerket resonnering og feilretting', 'Rask, god for SEO, UX og innhold', 'Kraftigst — lås opp med Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktorering', 'Arkitektur'], ['Feilsøking', 'Algoritmer', 'Optimalisering', 'Forklaring'], ['SEO', 'UX-tekst', 'Tilgjengelighet', 'Ytelse'], ['Full Stack', 'Kompleks UX', 'Systemdesign', 'Alle oppgaver']] },
  fi: { badges: ['Paras koodaukseen', 'Paras virheiden etsintään', 'Paras UX/SEO-tehtäviin', 'Vain Pro'], descriptions: ['Monimutkaiseen koodin luontiin ja arkkitehtuuriin', 'Erinomainen päättely ja virheiden korjaus', 'Nopea, sopii SEO:hon, UX:ään ja sisältöön', 'Tehokkain — avaa Pro-versiolla'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktorointi', 'Arkkitehtuuri'], ['Virheiden etsintä', 'Algoritmit', 'Optimointi', 'Selittäminen'], ['SEO', 'UX-tekstit', 'Esteettömyys', 'Suorituskyky'], ['Full Stack', 'Monimutkainen UX', 'Järjestelmäsuunnittelu', 'Kaikki tehtävät']] },
  uk: { badges: ['Для роботи з кодом', 'Для налагодження', 'Для UX/SEO', 'Лише Pro'], descriptions: ['Для складної генерації коду та проєктування архітектури', 'Чудово міркує та виправляє помилки', 'Швидка модель для SEO, UX і контенту', 'Найпотужніша — доступна з Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Рефакторинг', 'Архітектура'], ['Налагодження', 'Алгоритми', 'Оптимізація', 'Пояснення'], ['SEO', 'UX-тексти', 'Доступність', 'Продуктивність'], ['Full Stack', 'Складний UX', 'Проєктування систем', 'Усі завдання']] },
  cs: { badges: ['Nejlepší na kód', 'Nejlepší na ladění', 'Nejlepší pro UX/SEO', 'Pouze Pro'], descriptions: ['Pro složité generování kódu a návrh architektury', 'Výborné uvažování a oprava chyb', 'Rychlý, vhodný pro SEO, UX a obsah', 'Nejvýkonnější — dostupný s Pro'], strengths: [['HTML/CSS', 'JavaScript', 'Refaktoring', 'Architektura'], ['Ladění', 'Algoritmy', 'Optimalizace', 'Vysvětlení'], ['SEO', 'Texty UX', 'Přístupnost', 'Výkon'], ['Full Stack', 'Komplexní UX', 'Návrh systémů', 'Všechny úkoly']] },
};

export function getModelCopy(locale: ComponentLocale): ModelCopy {
  return modelCopy[locale] ?? modelCopy.en;
}

export function formatCopy(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
