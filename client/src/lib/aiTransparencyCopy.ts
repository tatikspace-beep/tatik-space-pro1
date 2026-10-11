import { translations } from '@/lib/i18n';

type AITransparencyCopy = {
  title: string;
  summary: string;
  processing: string;
  privacyLink: string;
};

export const aiTransparencyCopy: Record<keyof typeof translations, AITransparencyCopy> = {
  en: {
    title: 'AI assistant: transparency and responsible use',
    summary: 'You are interacting with an AI system. Its answers and code suggestions may be inaccurate or incomplete. Review and test any output before using it; do not rely on it as professional advice.',
    processing: 'When you submit a prompt, code, or error details, that content is sent to an external AI provider to generate a response. Depending on service configuration and availability, providers may include Groq, OpenRouter, Google Gemini, and Hugging Face; a request may be retried with another available provider. Open project files are not attached automatically. Do not submit personal or confidential data, passwords, API keys, or other secrets. Provider processing and retention are governed by the relevant provider terms and privacy information.',
    privacyLink: 'Privacy Policy',
  },
  it: {
    title: 'Assistente IA: trasparenza e uso responsabile',
    summary: 'Stai interagendo con un sistema di IA. Le risposte e i suggerimenti di codice possono essere inesatti o incompleti. Verifica e testa ogni risultato prima di utilizzarlo; non considerarlo un parere professionale.',
    processing: 'Quando invii una richiesta, del codice o dettagli di un errore, questi contenuti vengono trasmessi a un provider IA esterno per generare una risposta. In base alla configurazione e alla disponibilità del servizio, i provider possono includere Groq, OpenRouter, Google Gemini e Hugging Face; la richiesta può essere riprovata con un altro provider disponibile. I file di progetto aperti non vengono allegati automaticamente. Non inviare dati personali o riservati, password, chiavi API o altri segreti. Il trattamento e la conservazione da parte dei provider sono disciplinati dalle rispettive condizioni e informative privacy.',
    privacyLink: 'Informativa privacy',
  },
  es: {
    title: 'Asistente de IA: transparencia y uso responsable',
    summary: 'Estás interactuando con un sistema de IA. Sus respuestas y sugerencias de código pueden ser inexactas o incompletas. Revisa y prueba cada resultado antes de usarlo; no lo consideres asesoramiento profesional.',
    processing: 'Cuando envías una solicitud, código o detalles de un error, ese contenido se transmite a un proveedor externo de IA para generar una respuesta. Según la configuración y disponibilidad del servicio, los proveedores pueden incluir Groq, OpenRouter, Google Gemini y Hugging Face; la solicitud puede volver a intentarse con otro proveedor disponible. Los archivos abiertos del proyecto no se adjuntan automáticamente. No envíes datos personales o confidenciales, contraseñas, claves API ni otros secretos. El tratamiento y la conservación por parte de los proveedores se rigen por sus respectivas condiciones e información de privacidad.',
    privacyLink: 'Política de privacidad',
  },
  fr: {
    title: 'Assistant IA : transparence et utilisation responsable',
    summary: 'Vous interagissez avec un système d’IA. Ses réponses et suggestions de code peuvent être inexactes ou incomplètes. Vérifiez et testez chaque résultat avant de l’utiliser ; ne le considérez pas comme un conseil professionnel.',
    processing: 'Lorsque vous envoyez une demande, du code ou des détails d’erreur, ce contenu est transmis à un fournisseur d’IA externe afin de générer une réponse. Selon la configuration et la disponibilité du service, les fournisseurs peuvent inclure Groq, OpenRouter, Google Gemini et Hugging Face ; la demande peut être réessayée auprès d’un autre fournisseur disponible. Les fichiers de projet ouverts ne sont pas joints automatiquement. N’envoyez pas de données personnelles ou confidentielles, de mots de passe, de clés API ni d’autres secrets. Le traitement et la conservation par les fournisseurs sont régis par leurs conditions et informations de confidentialité respectives.',
    privacyLink: 'Politique de confidentialité',
  },
  de: {
    title: 'KI-Assistent: Transparenz und verantwortungsvolle Nutzung',
    summary: 'Du interagierst mit einem KI-System. Antworten und Codevorschläge können ungenau oder unvollständig sein. Prüfe und teste jedes Ergebnis vor der Verwendung; betrachte es nicht als professionelle Beratung.',
    processing: 'Wenn du eine Anfrage, Code oder Fehlerdetails sendest, werden diese Inhalte zur Erstellung einer Antwort an einen externen KI-Anbieter übermittelt. Je nach Dienstkonfiguration und Verfügbarkeit können Groq, OpenRouter, Google Gemini und Hugging Face zum Einsatz kommen; eine Anfrage kann bei einem anderen verfügbaren Anbieter erneut versucht werden. Geöffnete Projektdateien werden nicht automatisch angehängt. Sende keine personenbezogenen oder vertraulichen Daten, Passwörter, API-Schlüssel oder sonstigen Geheimnisse. Verarbeitung und Speicherung durch die Anbieter richten sich nach deren jeweiligen Bedingungen und Datenschutzhinweisen.',
    privacyLink: 'Datenschutzerklärung',
  },
  pt: {
    title: 'Assistente de IA: transparência e utilização responsável',
    summary: 'Está a interagir com um sistema de IA. As respostas e sugestões de código podem ser imprecisas ou incompletas. Reveja e teste cada resultado antes de o utilizar; não o considere aconselhamento profissional.',
    processing: 'Quando envia um pedido, código ou detalhes de um erro, esse conteúdo é transmitido a um fornecedor externo de IA para gerar uma resposta. Consoante a configuração e disponibilidade do serviço, os fornecedores podem incluir Groq, OpenRouter, Google Gemini e Hugging Face; o pedido pode ser tentado novamente com outro fornecedor disponível. Os ficheiros de projeto abertos não são anexados automaticamente. Não envie dados pessoais ou confidenciais, palavras-passe, chaves API ou outros segredos. O tratamento e a conservação pelos fornecedores são regidos pelos respetivos termos e informações de privacidade.',
    privacyLink: 'Política de privacidade',
  },
  ru: {
    title: 'ИИ-помощник: прозрачность и ответственное использование',
    summary: 'Вы взаимодействуете с системой искусственного интеллекта. Ответы и предложения кода могут быть неточными или неполными. Проверяйте и тестируйте результат перед использованием; не воспринимайте его как профессиональную консультацию.',
    processing: 'Когда вы отправляете запрос, код или сведения об ошибке, это содержимое передаётся внешнему поставщику ИИ для подготовки ответа. В зависимости от конфигурации и доступности сервиса могут использоваться Groq, OpenRouter, Google Gemini и Hugging Face; запрос может быть повторён через другого доступного поставщика. Открытые файлы проекта автоматически не прикрепляются. Не отправляйте персональные или конфиденциальные данные, пароли, ключи API и другие секреты. Обработка и хранение данных поставщиками регулируются их условиями и политиками конфиденциальности.',
    privacyLink: 'Политика конфиденциальности',
  },
  zh: {
    title: 'AI 助手：透明度与负责任使用',
    summary: '您正在与人工智能系统交互。其回答和代码建议可能不准确或不完整。使用前请检查并测试结果；请勿将其视为专业建议。',
    processing: '您提交提示、代码或错误详情时，这些内容会发送给外部 AI 服务提供商以生成回复。根据服务配置和可用情况，提供商可能包括 Groq、OpenRouter、Google Gemini 和 Hugging Face；请求也可能改由其他可用提供商重试。打开的项目文件不会自动附加。请勿提交个人或机密数据、密码、API 密钥或其他秘密信息。提供商的数据处理和保留受其各自条款与隐私说明约束。',
    privacyLink: '隐私政策',
  },
  ja: {
    title: 'AI アシスタント：透明性と責任ある利用',
    summary: '現在、AI システムと対話しています。回答やコードの提案は不正確または不完全な場合があります。使用前に確認・テストしてください。専門家による助言として扱わないでください。',
    processing: 'プロンプト、コード、エラーの詳細を送信すると、回答の生成のため、その内容が外部 AI プロバイダーに送信されます。サービスの設定や利用状況に応じて、Groq、OpenRouter、Google Gemini、Hugging Face などが使われ、別の利用可能なプロバイダーで再試行される場合があります。開いているプロジェクトファイルが自動的に添付されることはありません。個人情報や機密情報、パスワード、API キーなどの秘密情報は送信しないでください。プロバイダーによる処理と保存は、それぞれの利用条件およびプライバシー情報に従います。',
    privacyLink: 'プライバシーポリシー',
  },
  ko: {
    title: 'AI 어시스턴트: 투명성과 책임 있는 사용',
    summary: '현재 AI 시스템과 상호작용하고 있습니다. 답변과 코드 제안은 부정확하거나 불완전할 수 있습니다. 사용 전에 결과를 검토하고 테스트하세요. 전문적인 조언으로 간주하지 마세요.',
    processing: '프롬프트, 코드 또는 오류 세부정보를 제출하면 답변 생성을 위해 해당 내용이 외부 AI 제공업체로 전송됩니다. 서비스 구성 및 가용성에 따라 Groq, OpenRouter, Google Gemini, Hugging Face가 사용될 수 있으며, 다른 이용 가능한 제공업체로 요청이 재시도될 수 있습니다. 열려 있는 프로젝트 파일은 자동으로 첨부되지 않습니다. 개인정보나 기밀 정보, 비밀번호, API 키 또는 기타 비밀정보를 제출하지 마세요. 제공업체의 처리 및 보관은 각 제공업체의 약관과 개인정보 안내를 따릅니다.',
    privacyLink: '개인정보 처리방침',
  },
  ar: {
    title: 'مساعد الذكاء الاصطناعي: الشفافية والاستخدام المسؤول',
    summary: 'أنت تتفاعل مع نظام ذكاء اصطناعي. قد تكون إجاباته واقتراحات الشيفرة غير دقيقة أو غير مكتملة. راجع النتائج واختبرها قبل استخدامها، ولا تعتبرها استشارة مهنية.',
    processing: 'عند إرسال طلب أو شيفرة أو تفاصيل خطأ، يُرسل هذا المحتوى إلى مزوّد ذكاء اصطناعي خارجي لإنشاء الرد. بحسب إعداد الخدمة وتوافرها، قد تشمل المزوّدات Groq وOpenRouter وGoogle Gemini وHugging Face، وقد يُعاد إرسال الطلب إلى مزوّد آخر متاح. لا تُرفق ملفات المشروع المفتوحة تلقائيًا. لا ترسل بيانات شخصية أو سرية أو كلمات مرور أو مفاتيح API أو أي أسرار أخرى. يخضع تعامل المزوّدين مع البيانات والاحتفاظ بها لشروطهم وإشعارات الخصوصية الخاصة بهم.',
    privacyLink: 'سياسة الخصوصية',
  },
  hi: {
    title: 'AI सहायक: पारदर्शिता और जिम्मेदार उपयोग',
    summary: 'आप एक AI प्रणाली से बातचीत कर रहे हैं। इसके उत्तर और कोड सुझाव गलत या अधूरे हो सकते हैं। उपयोग से पहले हर परिणाम की समीक्षा और जाँच करें; इसे पेशेवर सलाह न मानें।',
    processing: 'जब आप कोई अनुरोध, कोड या त्रुटि का विवरण भेजते हैं, तो उत्तर तैयार करने के लिए यह सामग्री किसी बाहरी AI प्रदाता को भेजी जाती है। सेवा की सेटिंग और उपलब्धता के अनुसार Groq, OpenRouter, Google Gemini और Hugging Face का उपयोग हो सकता है; अनुरोध किसी अन्य उपलब्ध प्रदाता से दोबारा आज़माया जा सकता है। खुली हुई प्रोजेक्ट फ़ाइलें अपने-आप संलग्न नहीं होतीं। व्यक्तिगत या गोपनीय डेटा, पासवर्ड, API कुंजियाँ या अन्य रहस्य न भेजें। प्रदाताओं द्वारा प्रसंस्करण और डेटा रखने की अवधि उनकी संबंधित शर्तों और गोपनीयता जानकारी के अधीन है।',
    privacyLink: 'गोपनीयता नीति',
  },
  pl: {
    title: 'Asystent AI: przejrzystość i odpowiedzialne korzystanie',
    summary: 'Korzystasz z systemu AI. Odpowiedzi i sugestie kodu mogą być niedokładne lub niekompletne. Sprawdź i przetestuj każdy wynik przed użyciem; nie traktuj go jako profesjonalnej porady.',
    processing: 'Gdy wysyłasz prompt, kod lub opis błędu, treść ta jest przekazywana zewnętrznemu dostawcy AI w celu wygenerowania odpowiedzi. Zależnie od konfiguracji i dostępności usługi mogą to być Groq, OpenRouter, Google Gemini i Hugging Face; żądanie może zostać ponowione przez innego dostępnego dostawcę. Otwarte pliki projektu nie są dołączane automatycznie. Nie wysyłaj danych osobowych ani poufnych, haseł, kluczy API ani innych tajemnic. Przetwarzanie i przechowywanie przez dostawców podlega ich warunkom i informacjom o prywatności.',
    privacyLink: 'Polityka prywatności',
  },
  nl: {
    title: 'AI-assistent: transparantie en verantwoord gebruik',
    summary: 'Je communiceert met een AI-systeem. Antwoorden en codesuggesties kunnen onjuist of onvolledig zijn. Controleer en test elk resultaat voordat je het gebruikt; beschouw het niet als professioneel advies.',
    processing: 'Wanneer je een prompt, code of foutdetails verstuurt, wordt die inhoud naar een externe AI-provider verzonden om een antwoord te genereren. Afhankelijk van de configuratie en beschikbaarheid kunnen dit Groq, OpenRouter, Google Gemini en Hugging Face zijn; een verzoek kan opnieuw worden geprobeerd via een andere beschikbare provider. Geopende projectbestanden worden niet automatisch meegestuurd. Verstuur geen persoonsgegevens of vertrouwelijke gegevens, wachtwoorden, API-sleutels of andere geheimen. De verwerking en bewaring door providers vallen onder hun eigen voorwaarden en privacyinformatie.',
    privacyLink: 'Privacybeleid',
  },
  tr: {
    title: 'Yapay zekâ asistanı: şeffaflık ve sorumlu kullanım',
    summary: 'Bir yapay zekâ sistemiyle etkileşim kuruyorsunuz. Yanıtlar ve kod önerileri hatalı veya eksik olabilir. Kullanmadan önce her sonucu inceleyip test edin; profesyonel tavsiye olarak değerlendirmeyin.',
    processing: 'Bir istem, kod veya hata ayrıntısı gönderdiğinizde, yanıt oluşturulması için bu içerik harici bir yapay zekâ sağlayıcısına iletilir. Hizmet yapılandırmasına ve kullanılabilirliğe bağlı olarak Groq, OpenRouter, Google Gemini ve Hugging Face kullanılabilir; istek başka bir kullanılabilir sağlayıcıyla yeniden denenebilir. Açık proje dosyaları otomatik olarak eklenmez. Kişisel veya gizli verileri, parolaları, API anahtarlarını ya da başka sırları göndermeyin. Sağlayıcıların verileri işlemesi ve saklaması kendi koşullarına ve gizlilik bildirimlerine tabidir.',
    privacyLink: 'Gizlilik politikası',
  },
  sv: {
    title: 'AI-assistent: transparens och ansvarsfull användning',
    summary: 'Du interagerar med ett AI-system. Svar och kodförslag kan vara felaktiga eller ofullständiga. Granska och testa resultaten innan du använder dem; se dem inte som professionell rådgivning.',
    processing: 'När du skickar en prompt, kod eller felinformation överförs innehållet till en extern AI-leverantör för att skapa ett svar. Beroende på tjänstens konfiguration och tillgänglighet kan leverantörerna vara Groq, OpenRouter, Google Gemini och Hugging Face; en begäran kan provas igen med en annan tillgänglig leverantör. Öppna projektfiler bifogas inte automatiskt. Skicka inte personuppgifter eller konfidentiell information, lösenord, API-nycklar eller andra hemligheter. Leverantörernas behandling och lagring styrs av deras respektive villkor och integritetsinformation.',
    privacyLink: 'Integritetspolicy',
  },
  da: {
    title: 'AI-assistent: gennemsigtighed og ansvarlig brug',
    summary: 'Du interagerer med et AI-system. Svar og kodeforslag kan være unøjagtige eller ufuldstændige. Gennemgå og test resultater, før du bruger dem; betragt dem ikke som professionel rådgivning.',
    processing: 'Når du sender en prompt, kode eller fejloplysninger, sendes indholdet til en ekstern AI-udbyder for at generere et svar. Afhængigt af tjenestens konfiguration og tilgængelighed kan udbyderne omfatte Groq, OpenRouter, Google Gemini og Hugging Face; en anmodning kan forsøges igen hos en anden tilgængelig udbyder. Åbne projektfiler vedhæftes ikke automatisk. Send ikke personoplysninger eller fortrolige data, adgangskoder, API-nøgler eller andre hemmeligheder. Udbydernes behandling og opbevaring er underlagt deres respektive vilkår og privatlivsoplysninger.',
    privacyLink: 'Privatlivspolitik',
  },
  no: {
    title: 'AI-assistent: åpenhet og ansvarlig bruk',
    summary: 'Du samhandler med et AI-system. Svar og kodeforslag kan være unøyaktige eller ufullstendige. Gå gjennom og test resultatene før du bruker dem; ikke betrakt dem som profesjonelle råd.',
    processing: 'Når du sender en forespørsel, kode eller feildetaljer, sendes innholdet til en ekstern AI-leverandør for å generere et svar. Avhengig av tjenestens konfigurasjon og tilgjengelighet kan leverandørene omfatte Groq, OpenRouter, Google Gemini og Hugging Face; forespørselen kan prøves på nytt hos en annen tilgjengelig leverandør. Åpne prosjektfiler legges ikke ved automatisk. Ikke send personopplysninger eller konfidensielle data, passord, API-nøkler eller andre hemmeligheter. Leverandørenes behandling og lagring reguleres av deres respektive vilkår og personverninformasjon.',
    privacyLink: 'Personvernerklæring',
  },
  fi: {
    title: 'Tekoälyavustaja: avoimuus ja vastuullinen käyttö',
    summary: 'Keskustelet tekoälyjärjestelmän kanssa. Vastaukset ja koodiehdotukset voivat olla virheellisiä tai puutteellisia. Tarkista ja testaa tulokset ennen käyttöä; älä pidä niitä ammatillisena neuvona.',
    processing: 'Kun lähetät kehotteen, koodia tai virhetietoja, sisältö välitetään ulkoiselle tekoälypalveluntarjoajalle vastauksen luomiseksi. Palvelun kokoonpanon ja saatavuuden mukaan palveluntarjoajia voivat olla Groq, OpenRouter, Google Gemini ja Hugging Face; pyyntö voidaan yrittää uudelleen toisen saatavilla olevan palveluntarjoajan kautta. Avoimia projektitiedostoja ei liitetä automaattisesti. Älä lähetä henkilötietoja tai luottamuksellisia tietoja, salasanoja, API-avaimia tai muita salaisuuksia. Palveluntarjoajien käsittelyyn ja säilytykseen sovelletaan niiden omia ehtoja ja tietosuojatietoja.',
    privacyLink: 'Tietosuojakäytäntö',
  },
  uk: {
    title: 'ШІ-помічник: прозорість і відповідальне використання',
    summary: 'Ви взаємодієте із системою штучного інтелекту. Відповіді та пропозиції коду можуть бути неточними або неповними. Перевіряйте й тестуйте результати перед використанням; не вважайте їх професійною консультацією.',
    processing: 'Коли ви надсилаєте запит, код або відомості про помилку, цей вміст передається зовнішньому постачальнику ШІ для створення відповіді. Залежно від конфігурації та доступності сервісу можуть використовуватися Groq, OpenRouter, Google Gemini і Hugging Face; запит може бути повторно надіслано іншому доступному постачальнику. Відкриті файли проєкту не додаються автоматично. Не надсилайте персональні чи конфіденційні дані, паролі, ключі API або інші секрети. Обробка та зберігання постачальниками регулюються їхніми умовами й політиками конфіденційності.',
    privacyLink: 'Політика конфіденційності',
  },
  cs: {
    title: 'Asistent AI: transparentnost a odpovědné používání',
    summary: 'Komunikujete se systémem AI. Odpovědi a návrhy kódu mohou být nepřesné nebo neúplné. Před použitím každý výsledek zkontrolujte a otestujte; nepovažujte jej za odborné poradenství.',
    processing: 'Když odešlete zadání, kód nebo podrobnosti o chybě, je tento obsah předán externímu poskytovateli AI za účelem vytvoření odpovědi. Podle konfigurace a dostupnosti služby mohou být využiti Groq, OpenRouter, Google Gemini a Hugging Face; požadavek může být znovu odeslán jinému dostupnému poskytovateli. Otevřené soubory projektu se automaticky nepřikládají. Neodesílejte osobní ani důvěrné údaje, hesla, klíče API ani jiná tajemství. Zpracování a uchovávání u poskytovatelů se řídí jejich příslušnými podmínkami a informacemi o ochraně soukromí.',
    privacyLink: 'Zásady ochrany osobních údajů',
  },
};
