import { translations } from "@/lib/i18n";

type ControllerPrivacyCopy = {
  title: string;
  identity: string;
  pseudonymNote: string;
  contactIntro: string;
  providerUpdateNotice: string;
};

export const controllerPrivacyCopy: Record<keyof typeof translations, ControllerPrivacyCopy> = {
  en: {
    title: "Data controller",
    identity: "The data controller is TATIK, the pseudonym used by the author of the Tatik.space project.",
    pseudonymNote: "TATIK is the public-facing pseudonym used for this project. Article 9 of the Italian Civil Code concerns protection of a pseudonym under Article 7 when it has acquired the importance of a name; it does not waive the controller's duties under applicable data-protection and consumer law. Under GDPR Article 13(1)(a), the controller's identity and contact details must be provided to data subjects as required by law, not only after a dispute. The legal identity may also be requested by competent authorities or disclosed in legal proceedings where required.",
    contactIntro: "You may also send privacy requests to one of these customer-support email addresses. These addresses are contact channels and do not replace any disclosure of the controller’s legal identity required by applicable law:",
    providerUpdateNotice: "The service is continuously evolving. AI providers, models and routing may therefore change, be added or removed; the providers listed here describe the current configuration and may not all be used for every request. The Privacy Policy and in-product notices will be updated when relevant processing changes.",
  },
  it: {
    title: "Titolare del trattamento",
    identity: "Il titolare del trattamento è TATIK, pseudonimo utilizzato dall’autore del progetto Tatik.space.",
    pseudonymNote: "TATIK è lo pseudonimo utilizzato pubblicamente per questo progetto. Il richiamo all’art. 9 c.c. riguarda la tutela dello pseudonimo ai sensi dell’art. 7 c.c. quando abbia acquistato l’importanza del nome; non esonera il titolare dagli obblighi previsti dalla normativa applicabile in materia di protezione dei dati e dei consumatori. Ai sensi dell’art. 13, par. 1, lett. a) GDPR, l’identità e i recapiti del titolare devono essere forniti agli interessati nei casi e nei modi previsti dalla legge, non soltanto dopo una controversia. L’identità legale può inoltre essere richiesta dalle autorità competenti o comunicata nell’ambito di procedimenti quando previsto dalla legge.",
    contactIntro: "Puoi inviare le richieste relative alla privacy anche a uno dei seguenti indirizzi email per l’assistenza clienti. Questi indirizzi sono canali di contatto e non sostituiscono l’indicazione dell’identità legale del titolare quando richiesta dalla normativa applicabile:",
    providerUpdateNotice: "Il servizio è in continua evoluzione. Provider, modelli e modalità di instradamento dell’IA possono quindi cambiare, essere aggiunti o rimossi; l’elenco indica la configurazione attuale e non significa che tutti i provider siano usati per ogni richiesta. L’Informativa privacy e gli avvisi nel servizio saranno aggiornati quando cambieranno aspetti rilevanti del trattamento.",
  },
  es: {
    title: "Responsable del tratamiento",
    identity: "El responsable del tratamiento es TATIK, seudónimo utilizado por el autor del proyecto Tatik.space.",
    pseudonymNote: "TATIK es el seudónimo utilizado públicamente para este proyecto. La referencia al artículo 9 del Código Civil italiano se refiere a la protección del seudónimo conforme al artículo 7 cuando haya adquirido la importancia de un nombre; no exime al responsable de las obligaciones establecidas por la legislación aplicable en materia de protección de datos y de consumo. Según el artículo 13, apartado 1, letra a), del RGPD, la identidad y los datos de contacto del responsable deben facilitarse a los interesados cuando y como lo exija la ley, no solo después de una controversia. Las autoridades competentes también pueden solicitar la identidad legal, que podrá comunicarse en procedimientos cuando así lo exija la ley.",
    contactIntro: "También puedes enviar solicitudes de privacidad a una de estas direcciones de correo electrónico de atención al cliente. Estas direcciones son canales de contacto y no sustituyen la información sobre la identidad legal del responsable cuando la legislación aplicable la exija:",
    providerUpdateNotice: "El servicio evoluciona continuamente. Por ello, los proveedores, modelos y rutas de IA pueden cambiar, añadirse o eliminarse; la lista describe la configuración actual y no significa que todos los proveedores se utilicen en cada solicitud. La Política de privacidad y los avisos dentro del servicio se actualizarán cuando cambie algún aspecto relevante del tratamiento.",
  },
  fr: {
    title: "Responsable du traitement",
    identity: "Le responsable du traitement est TATIK, pseudonyme utilisé par l’auteur du projet Tatik.space.",
    pseudonymNote: "TATIK est le pseudonyme utilisé publiquement pour ce projet. La référence à l’article 9 du Code civil italien concerne la protection, au titre de l’article 7, d’un pseudonyme ayant acquis l’importance d’un nom ; elle ne dispense pas le responsable de ses obligations prévues par le droit applicable en matière de protection des données et de consommation. En vertu de l’article 13, paragraphe 1, point a), du RGPD, l’identité et les coordonnées du responsable doivent être fournies aux personnes concernées dans les cas et selon les modalités prévus par la loi, et pas uniquement après un litige. Les autorités compétentes peuvent également demander l’identité juridique, qui peut être communiquée dans le cadre d’une procédure lorsque la loi l’exige.",
    contactIntro: "Vous pouvez également envoyer vos demandes relatives à la confidentialité à l’une des adresses e-mail d’assistance client suivantes. Ces adresses sont des moyens de contact et ne remplacent pas la communication de l’identité légale du responsable lorsque le droit applicable l’exige :",
    providerUpdateNotice: "Le service évolue en permanence. Les fournisseurs, modèles et mécanismes d’acheminement de l’IA peuvent donc changer, être ajoutés ou supprimés ; la liste décrit la configuration actuelle et ne signifie pas que tous les fournisseurs traitent chaque demande. La politique de confidentialité et les avis dans le service seront mis à jour en cas de changement pertinent du traitement.",
  },
  de: {
    title: "Verantwortlicher",
    identity: "Verantwortlicher ist TATIK, das Pseudonym, das der Autor des Projekts Tatik.space verwendet.",
    pseudonymNote: "TATIK ist das öffentlich verwendete Pseudonym für dieses Projekt. Der Verweis auf Artikel 9 des italienischen Zivilgesetzbuchs betrifft den Schutz eines Pseudonyms nach Artikel 7, wenn es die Bedeutung eines Namens erlangt hat; er entbindet den Verantwortlichen nicht von Pflichten nach dem anwendbaren Datenschutz- und Verbraucherrecht. Nach Artikel 13 Absatz 1 Buchstabe a DSGVO müssen Identität und Kontaktdaten des Verantwortlichen betroffenen Personen in den gesetzlich vorgesehenen Fällen und auf die vorgeschriebene Weise mitgeteilt werden, nicht erst nach einem Streitfall. Zuständige Behörden können außerdem die rechtliche Identität verlangen; sie kann in gesetzlich vorgesehenen Verfahren offengelegt werden.",
    contactIntro: "Datenschutzanfragen können Sie auch an eine der folgenden E-Mail-Adressen des Kundensupports senden. Diese Adressen dienen als Kontaktwege und ersetzen nicht die Offenlegung der rechtlichen Identität des Verantwortlichen, sofern das anwendbare Recht dies verlangt:",
    providerUpdateNotice: "Der Dienst wird kontinuierlich weiterentwickelt. KI-Anbieter, Modelle und Weiterleitungswege können daher geändert, hinzugefügt oder entfernt werden. Die Liste beschreibt die aktuelle Konfiguration; nicht jeder Anbieter wird für jede Anfrage verwendet. Die Datenschutzerklärung und Hinweise im Dienst werden bei relevanten Änderungen der Verarbeitung aktualisiert.",
  },
  pt: {
    title: "Responsável pelo tratamento",
    identity: "O responsável pelo tratamento é TATIK, pseudónimo utilizado pelo autor do projeto Tatik.space.",
    pseudonymNote: "TATIK é o pseudónimo utilizado publicamente para este projeto. A referência ao artigo 9.º do Código Civil italiano diz respeito à proteção, nos termos do artigo 7.º, de um pseudónimo que tenha adquirido a importância de um nome; não isenta o responsável das obrigações previstas na legislação aplicável em matéria de proteção de dados e de consumidores. Nos termos do artigo 13.º, n.º 1, alínea a), do RGPD, a identidade e os contactos do responsável devem ser fornecidos aos titulares dos dados nos casos e termos previstos na lei, e não apenas após um litígio. As autoridades competentes também podem solicitar a identidade legal, que poderá ser comunicada em processos quando a lei o exigir.",
    contactIntro: "Também pode enviar pedidos relativos à privacidade para um dos seguintes endereços de e-mail de apoio ao cliente. Estes endereços são canais de contacto e não substituem a divulgação da identidade legal do responsável quando exigida pela legislação aplicável:",
    providerUpdateNotice: "O serviço está em evolução contínua. Os fornecedores, modelos e encaminhamentos de IA podem, por isso, mudar, ser adicionados ou removidos; a lista descreve a configuração atual e não significa que todos os fornecedores sejam usados em cada pedido. A Política de Privacidade e os avisos no serviço serão atualizados quando houver alterações relevantes ao tratamento.",
  },
  ru: {
    title: "Оператор персональных данных",
    identity: "Оператором данных является TATIK — псевдоним автора проекта Tatik.space.",
    pseudonymNote: "TATIK — псевдоним, публично используемый для этого проекта. Ссылка на статью 9 Гражданского кодекса Италии касается защиты по статье 7 псевдонима, приобретшего значение имени; она не освобождает оператора от обязанностей по применимому законодательству о защите данных и прав потребителей. Согласно статье 13(1)(a) GDPR, личность и контактные данные оператора должны предоставляться субъектам данных в случаях и порядке, предусмотренных законом, а не только после возникновения спора. Компетентные органы также могут запросить юридические данные оператора, которые могут быть раскрыты в рамках разбирательства, если этого требует закон.",
    contactIntro: "Запросы по вопросам конфиденциальности также можно отправить на один из следующих адресов электронной почты службы поддержки. Эти адреса являются каналами связи и не заменяют раскрытие юридической личности оператора, если этого требует применимое законодательство:",
    providerUpdateNotice: "Сервис постоянно развивается. Поэтому поставщики ИИ, модели и маршрутизация запросов могут меняться, добавляться или отключаться; список отражает текущую конфигурацию и не означает, что каждый запрос обрабатывается всеми поставщиками. Политика конфиденциальности и уведомления в сервисе будут обновляться при существенных изменениях обработки.",
  },
  zh: {
    title: "数据控制者",
    identity: "数据控制者为 TATIK，这是 Tatik.space 项目作者使用的笔名。",
    pseudonymNote: "TATIK 是本项目对外使用的笔名。意大利《民法典》第9条的引用涉及依据第7条保护已具有姓名重要性的笔名；这并不免除控制者根据适用的数据保护和消费者法律承担的义务。根据 GDPR 第13条第1款(a)项，控制者的身份和联系方式须在法律规定的情形和方式下提供给数据主体，而不只是发生争议后提供。主管机关也可依法要求提供控制者的法定身份；法律程序依法需要时，该身份也可能被披露。",
    contactIntro: "您也可以将隐私相关请求发送至以下任一客户支持邮箱。这些邮箱是联系渠道；适用法律要求披露数据控制者法定身份时，它们不能替代该项披露：",
    providerUpdateNotice: "本服务持续迭代，因此 AI 服务提供商、模型和请求路由可能会变更、增加或移除；此列表反映当前配置，并不表示每个请求都会使用所有提供商。若数据处理发生相关变化，我们会更新隐私政策和服务内提示。",
  },
  ja: {
    title: "データ管理者",
    identity: "データ管理者は、Tatik.space プロジェクトの作者が使用する筆名 TATIK です。",
    pseudonymNote: "TATIK は本プロジェクトで公開上使用する筆名です。イタリア民法第9条への言及は、氏名と同等の重要性を得た筆名を第7条に基づき保護することに関するものであり、適用されるデータ保護法および消費者法上の義務を免除するものではありません。GDPR 第13条第1項(a)に基づき、管理者の身元および連絡先は、法律で定められた場合・方法によりデータ主体へ提供する必要があり、紛争発生後に限られるものではありません。所管当局は法的身元を求めることができ、法律上必要な場合には手続において開示されることがあります。",
    contactIntro: "プライバシーに関する請求は、以下のカスタマーサポート用メールアドレスにもお送りいただけます。これらは連絡窓口であり、適用法令により求められる管理者の法的身元の開示に代わるものではありません。",
    providerUpdateNotice: "本サービスは継続的に進化しています。そのため、AIプロバイダー、モデル、リクエストの振り分け先は変更・追加・削除されることがあります。一覧は現在の構成を示すもので、すべてのリクエストで全プロバイダーを利用するという意味ではありません。処理に関する重要な変更がある場合、プライバシーポリシーとサービス内の案内を更新します。",
  },
  ko: {
    title: "개인정보처리자",
    identity: "개인정보처리자는 Tatik.space 프로젝트 작성자가 사용하는 필명 TATIK입니다.",
    pseudonymNote: "TATIK은 이 프로젝트에서 대외적으로 사용하는 필명입니다. 이탈리아 민법 제9조에 대한 언급은 이름과 같은 중요성을 획득한 필명을 제7조에 따라 보호하는 것과 관련되며, 적용되는 개인정보 및 소비자 관련 법률상의 의무를 면제하지 않습니다. GDPR 제13조 제1항(a)에 따라 개인정보처리자의 신원과 연락처는 분쟁이 발생한 후에만이 아니라 법률이 정한 경우와 방식으로 정보주체에게 제공되어야 합니다. 관할 당국은 법적 신원을 요청할 수 있으며, 법률상 필요한 경우 절차에서 공개될 수 있습니다.",
    contactIntro: "개인정보 관련 요청은 다음 고객 지원 이메일 주소 중 하나로도 보내실 수 있습니다. 이 주소들은 연락 창구이며, 관련 법률에 따라 요구되는 개인정보처리자의 법적 신원 공개를 대체하지 않습니다:",
    providerUpdateNotice: "서비스는 지속적으로 발전하고 있습니다. 따라서 AI 제공업체, 모델 및 요청 라우팅은 변경·추가·삭제될 수 있습니다. 목록은 현재 구성을 나타내며 모든 요청에 모든 제공업체가 사용된다는 뜻은 아닙니다. 처리에 중요한 변경이 있으면 개인정보 처리방침과 서비스 내 안내를 업데이트합니다.",
  },
  ar: {
    title: "متحكم البيانات",
    identity: "متحكم البيانات هو TATIK، الاسم المستعار الذي يستخدمه مؤلف مشروع Tatik.space.",
    pseudonymNote: "TATIK هو الاسم المستعار المستخدم علنًا لهذا المشروع. وتشير الإحالة إلى المادة 9 من القانون المدني الإيطالي إلى حماية الاسم المستعار وفقًا للمادة 7 إذا اكتسب أهمية الاسم؛ ولا تعفي المتحكم من الالتزامات المنصوص عليها في قوانين حماية البيانات والمستهلك المعمول بها. وبموجب المادة 13(1)(أ) من GDPR، يجب تقديم هوية المتحكم وبيانات الاتصال به إلى أصحاب البيانات في الحالات وبالطريقة التي يحددها القانون، وليس فقط بعد نشوء نزاع. ويجوز للسلطات المختصة أيضًا طلب الهوية القانونية، وقد يتم الإفصاح عنها في الإجراءات عندما يقتضي القانون ذلك.",
    contactIntro: "يمكنك أيضًا إرسال طلبات الخصوصية إلى أحد عناوين البريد الإلكتروني التالية لدعم العملاء. هذه العناوين قنوات للتواصل ولا تحل محل الإفصاح عن الهوية القانونية للمتحكم عندما يقتضي القانون المعمول به ذلك:",
    providerUpdateNotice: "الخدمة في تطور مستمر. لذلك قد تتغير مزودات الذكاء الاصطناعي والنماذج ومسارات الطلبات أو تُضاف أو تُزال؛ وتعكس القائمة الإعدادات الحالية ولا تعني استخدام جميع المزودات لكل طلب. سنحدّث سياسة الخصوصية والإشعارات داخل الخدمة عند حدوث تغييرات جوهرية في المعالجة.",
  },
  hi: {
    title: "डेटा नियंत्रक",
    identity: "डेटा नियंत्रक TATIK हैं, जो Tatik.space परियोजना के लेखक द्वारा उपयोग किया जाने वाला छद्मनाम है।",
    pseudonymNote: "TATIK इस परियोजना के लिए सार्वजनिक रूप से इस्तेमाल किया जाने वाला छद्मनाम है। इतालवी नागरिक संहिता के अनुच्छेद 9 का संदर्भ अनुच्छेद 7 के तहत ऐसे छद्मनाम की सुरक्षा से जुड़ा है जिसने नाम जैसी महत्ता प्राप्त की हो; इससे लागू डेटा-सुरक्षा और उपभोक्ता कानूनों के दायित्व समाप्त नहीं होते। GDPR के अनुच्छेद 13(1)(a) के अनुसार नियंत्रक की पहचान और संपर्क विवरण कानून द्वारा निर्धारित मामलों और तरीके से डेटा विषयों को दिए जाने चाहिए, केवल विवाद होने के बाद नहीं। सक्षम प्राधिकारी कानूनी पहचान मांग सकते हैं और कानून के अनुसार कार्यवाही में इसका खुलासा किया जा सकता है।",
    contactIntro: "गोपनीयता संबंधी अनुरोध नीचे दिए गए ग्राहक सहायता ईमेल पतों में से किसी एक पर भी भेजे जा सकते हैं। ये संपर्क माध्यम हैं और लागू कानून के तहत आवश्यक होने पर डेटा नियंत्रक की कानूनी पहचान बताने का विकल्प नहीं हैं:",
    providerUpdateNotice: "सेवा लगातार विकसित हो रही है। इसलिए AI प्रदाता, मॉडल और अनुरोधों का रूटिंग बदल सकता है, जोड़ा या हटाया जा सकता है; सूची वर्तमान कॉन्फ़िगरेशन बताती है और इसका अर्थ यह नहीं कि हर अनुरोध में सभी प्रदाता उपयोग होते हैं। प्रसंस्करण में महत्वपूर्ण बदलाव होने पर गोपनीयता नीति और सेवा के भीतर दिए गए नोटिस अपडेट किए जाएंगे।",
  },
  pl: {
    title: "Administrator danych",
    identity: "Administratorem danych jest TATIK, pseudonim używany przez autora projektu Tatik.space.",
    pseudonymNote: "TATIK to pseudonim używany publicznie w odniesieniu do tego projektu. Odniesienie do artykułu 9 włoskiego kodeksu cywilnego dotyczy ochrony na podstawie artykułu 7 pseudonimu, który nabrał znaczenia nazwiska; nie zwalnia administratora z obowiązków wynikających z właściwych przepisów o ochronie danych i prawach konsumentów. Zgodnie z art. 13 ust. 1 lit. a) RODO tożsamość i dane kontaktowe administratora należy przekazywać osobom, których dane dotyczą, w przypadkach i na zasadach określonych prawem, a nie dopiero po sporze. Właściwe organy mogą również zażądać danych prawnych administratora; mogą one zostać ujawnione w postępowaniu, gdy wymaga tego prawo.",
    contactIntro: "Wnioski dotyczące prywatności możesz również wysłać na jeden z poniższych adresów e-mail obsługi klienta. Są to kanały kontaktu i nie zastępują ujawnienia prawnej tożsamości administratora, gdy wymaga tego obowiązujące prawo:",
    providerUpdateNotice: "Usługa jest stale rozwijana. Dostawcy AI, modele i kierowanie żądań mogą się zmieniać, być dodawane lub usuwane; lista przedstawia bieżącą konfigurację i nie oznacza, że każdy dostawca obsługuje każde żądanie. Polityka prywatności i komunikaty w usłudze będą aktualizowane w przypadku istotnych zmian przetwarzania.",
  },
  nl: {
    title: "Verwerkingsverantwoordelijke",
    identity: "De verwerkingsverantwoordelijke is TATIK, het pseudoniem dat de auteur van het project Tatik.space gebruikt.",
    pseudonymNote: "TATIK is het pseudoniem dat voor dit project openbaar wordt gebruikt. De verwijzing naar artikel 9 van het Italiaanse Burgerlijk Wetboek betreft de bescherming op grond van artikel 7 van een pseudoniem dat de betekenis van een naam heeft verworven; zij ontslaat de verwerkingsverantwoordelijke niet van verplichtingen uit toepasselijk gegevensbeschermings- en consumentenrecht. Volgens artikel 13, lid 1, onder a), AVG moeten de identiteit en contactgegevens van de verwerkingsverantwoordelijke aan betrokkenen worden verstrekt in de gevallen en op de wijze die de wet voorschrijft, niet pas na een geschil. Bevoegde autoriteiten kunnen ook de juridische identiteit opvragen; deze kan in procedures worden bekendgemaakt wanneer de wet dat vereist.",
    contactIntro: "U kunt privacyverzoeken ook sturen naar een van de volgende e-mailadressen van de klantenservice. Deze adressen zijn contactkanalen en vervangen niet de vermelding van de wettelijke identiteit van de verwerkingsverantwoordelijke wanneer het toepasselijke recht dat vereist:",
    providerUpdateNotice: "De dienst wordt voortdurend doorontwikkeld. AI-aanbieders, modellen en routering kunnen daarom wijzigen, worden toegevoegd of verwijderd; de lijst beschrijft de huidige configuratie en betekent niet dat elke aanbieder voor elk verzoek wordt gebruikt. Het privacybeleid en meldingen in de dienst worden bijgewerkt bij relevante wijzigingen in de verwerking.",
  },
  tr: {
    title: "Veri sorumlusu",
    identity: "Veri sorumlusu, Tatik.space projesinin yazarı tarafından kullanılan TATIK takma adıdır.",
    pseudonymNote: "TATIK, bu proje için kamuya açık olarak kullanılan takma addır. İtalyan Medeni Kanunu’nun 9. maddesine yapılan atıf, ad kadar önem kazanmış bir takma adın 7. madde uyarınca korunmasıyla ilgilidir; veri koruma ve tüketici mevzuatından doğan yükümlülükleri ortadan kaldırmaz. GDPR’nin 13(1)(a) maddesi uyarınca veri sorumlusunun kimliği ve iletişim bilgileri, yalnızca bir uyuşmazlık çıktıktan sonra değil, kanunun öngördüğü durumlarda ve biçimde ilgili kişilere sağlanmalıdır. Yetkili makamlar yasal kimliği talep edebilir; kanunun gerektirdiği hâllerde bu kimlik yargılamalarda açıklanabilir.",
    contactIntro: "Gizlilik taleplerinizi aşağıdaki müşteri destek e-posta adreslerinden birine de gönderebilirsiniz. Bu adresler iletişim kanallarıdır ve yürürlükteki mevzuatın gerektirdiği durumlarda veri sorumlusunun yasal kimliğinin açıklanmasının yerini tutmaz:",
    providerUpdateNotice: "Hizmet sürekli gelişmektedir. Bu nedenle yapay zekâ sağlayıcıları, modeller ve istek yönlendirmeleri değiştirilebilir, eklenebilir veya kaldırılabilir; liste mevcut yapılandırmayı gösterir ve her istekte tüm sağlayıcıların kullanıldığı anlamına gelmez. İşleme ilişkin önemli değişikliklerde Gizlilik Politikası ve hizmet içi bildirimler güncellenecektir.",
  },
  sv: {
    title: "Personuppgiftsansvarig",
    identity: "Personuppgiftsansvarig är TATIK, den pseudonym som författaren till projektet Tatik.space använder.",
    pseudonymNote: "TATIK är det pseudonym som används offentligt för projektet. Hänvisningen till artikel 9 i den italienska civillagen gäller skydd enligt artikel 7 för en pseudonym som har fått samma betydelse som ett namn; den befriar inte den personuppgiftsansvarige från skyldigheter enligt tillämplig dataskydds- och konsumentlagstiftning. Enligt artikel 13.1 a i GDPR ska den personuppgiftsansvariges identitet och kontaktuppgifter lämnas till registrerade i de fall och på det sätt som lagen kräver, inte först efter en tvist. Behöriga myndigheter kan också begära den juridiska identiteten, som kan lämnas ut i rättsliga förfaranden när lagen kräver det.",
    contactIntro: "Du kan även skicka integritetsärenden till någon av följande e-postadresser för kundsupport. Dessa adresser är kontaktvägar och ersätter inte utlämnande av den personuppgiftsansvariges juridiska identitet när tillämplig lag kräver det:",
    providerUpdateNotice: "Tjänsten utvecklas kontinuerligt. AI-leverantörer, modeller och dirigering kan därför ändras, läggas till eller tas bort. Listan beskriver den aktuella konfigurationen och innebär inte att alla leverantörer används för varje begäran. Integritetspolicyn och information i tjänsten uppdateras vid relevanta ändringar av behandlingen.",
  },
  da: {
    title: "Dataansvarlig",
    identity: "Den dataansvarlige er TATIK, det pseudonym, som forfatteren af projektet Tatik.space bruger.",
    pseudonymNote: "TATIK er det pseudonym, der bruges offentligt for projektet. Henvisningen til artikel 9 i den italienske civillovbog vedrører beskyttelse efter artikel 7 af et pseudonym, der har fået samme betydning som et navn; den fritager ikke den dataansvarlige for forpligtelser efter gældende databeskyttelses- og forbrugerlovgivning. Efter GDPR artikel 13, stk. 1, litra a), skal den dataansvarliges identitet og kontaktoplysninger gives til registrerede i de tilfælde og på den måde, loven kræver, ikke først efter en tvist. Kompetente myndigheder kan også anmode om den juridiske identitet, som kan videregives i retssager, når loven kræver det.",
    contactIntro: "Du kan også sende privatlivsanmodninger til en af følgende e-mailadresser til kundesupport. Adresserne er kontaktkanaler og erstatter ikke oplysning om den dataansvarliges juridiske identitet, når gældende lovgivning kræver det:",
    providerUpdateNotice: "Tjenesten er under løbende udvikling. AI-udbydere, modeller og routing kan derfor ændres, tilføjes eller fjernes; listen beskriver den aktuelle konfiguration og betyder ikke, at alle udbydere bruges til hver anmodning. Privatlivspolitikken og meddelelser i tjenesten opdateres ved relevante ændringer i behandlingen.",
  },
  no: {
    title: "Behandlingsansvarlig",
    identity: "Behandlingsansvarlig er TATIK, pseudonymet som forfatteren av prosjektet Tatik.space bruker.",
    pseudonymNote: "TATIK er pseudonymet som brukes offentlig for prosjektet. Henvisningen til artikkel 9 i den italienske sivilloven gjelder beskyttelse etter artikkel 7 av et pseudonym som har fått samme betydning som et navn; den fritar ikke den behandlingsansvarlige fra plikter etter gjeldende personvern- og forbrukerlovgivning. Etter GDPR artikkel 13 nr. 1 bokstav a skal den behandlingsansvarliges identitet og kontaktopplysninger gis til registrerte i tilfellene og på måten loven krever, ikke først etter en tvist. Kompetente myndigheter kan også be om den juridiske identiteten, som kan oppgis i rettslige prosesser når loven krever det.",
    contactIntro: "Du kan også sende personvernforespørsler til en av følgende e-postadresser for kundestøtte. Disse adressene er kontaktkanaler og erstatter ikke opplysning om den behandlingsansvarliges juridiske identitet når gjeldende lov krever det:",
    providerUpdateNotice: "Tjenesten er i kontinuerlig utvikling. AI-leverandører, modeller og ruting kan derfor endres, legges til eller fjernes. Listen beskriver den gjeldende konfigurasjonen og betyr ikke at alle leverandører brukes for hver forespørsel. Personvernerklæringen og informasjon i tjenesten oppdateres ved relevante endringer i behandlingen.",
  },
  fi: {
    title: "Rekisterinpitäjä",
    identity: "Rekisterinpitäjä on TATIK, Tatik.space-projektin tekijän käyttämä salanimi.",
    pseudonymNote: "TATIK on tässä projektissa julkisesti käytettävä salanimi. Viittaus Italian siviililain 9 §:ään koskee 7 §:n mukaista sellaisen salanimen suojaa, joka on saavuttanut nimen merkityksen; se ei vapauta rekisterinpitäjää sovellettavan tietosuoja- ja kuluttajalainsäädännön velvoitteista. GDPR:n 13 artiklan 1 kohdan a alakohdan mukaan rekisterinpitäjän henkilöllisyys ja yhteystiedot on annettava rekisteröidyille lain edellyttämissä tilanteissa ja tavalla, ei vasta riidan synnyttyä. Toimivaltaiset viranomaiset voivat myös pyytää oikeudellista henkilöllisyyttä, joka voidaan ilmoittaa oikeudenkäynnissä lain niin vaatiessa.",
    contactIntro: "Voit lähettää tietosuojaa koskevia pyyntöjä myös johonkin seuraavista asiakastuen sähköpostiosoitteista. Osoitteet ovat yhteydenottokanavia eivätkä korvaa rekisterinpitäjän oikeudellisen henkilöllisyyden ilmoittamista silloin, kun sovellettava laki sitä edellyttää:",
    providerUpdateNotice: "Palvelua kehitetään jatkuvasti. Tekoälypalveluntarjoajat, mallit ja pyyntöjen reititys voivat siksi muuttua, niitä voidaan lisätä tai poistaa. Luettelo kuvaa nykyistä kokoonpanoa, eikä tarkoita, että kaikkia palveluntarjoajia käytetään jokaiseen pyyntöön. Tietosuojakäytäntö ja palvelun sisäiset ilmoitukset päivitetään, jos käsittely muuttuu olennaisesti.",
  },
  uk: {
    title: "Контролер персональних даних",
    identity: "Контролером персональних даних є TATIK — псевдонім автора проєкту Tatik.space.",
    pseudonymNote: "TATIK — псевдонім, що публічно використовується для цього проєкту. Посилання на статтю 9 Цивільного кодексу Італії стосується захисту за статтею 7 псевдоніма, який набув значення імені; воно не звільняє контролера від обов’язків за застосовним законодавством про захист даних і права споживачів. Відповідно до статті 13(1)(a) GDPR особу та контактні дані контролера потрібно надавати суб’єктам даних у випадках і способом, передбаченими законом, а не лише після спору. Компетентні органи також можуть вимагати юридичні дані; їх може бути розкрито в судовому провадженні, якщо цього вимагає закон.",
    contactIntro: "Запити щодо конфіденційності також можна надіслати на одну з наведених адрес електронної пошти служби підтримки. Ці адреси є каналами зв’язку й не замінюють розкриття юридичної особи контролера, якщо цього вимагає чинне законодавство:",
    providerUpdateNotice: "Сервіс постійно розвивається. Постачальники ШІ, моделі та маршрутизація запитів можуть змінюватися, додаватися або вилучатися; список відображає поточну конфігурацію і не означає, що всі постачальники використовуються для кожного запиту. Політика конфіденційності та повідомлення в сервісі оновлюватимуться за суттєвих змін обробки.",
  },
  cs: {
    title: "Správce osobních údajů",
    identity: "Správcem osobních údajů je TATIK, pseudonym autora projektu Tatik.space.",
    pseudonymNote: "TATIK je pseudonym veřejně používaný pro tento projekt. Odkaz na článek 9 italského občanského zákoníku se týká ochrany podle článku 7 pseudonymu, který nabyl významu jména; správce tím není zbaven povinností podle použitelných právních předpisů o ochraně údajů a spotřebitelů. Podle čl. 13 odst. 1 písm. a) GDPR musí být totožnost a kontaktní údaje správce poskytnuty subjektům údajů v případech a způsobem stanoveným zákonem, nikoli až po vzniku sporu. Příslušné orgány mohou rovněž požadovat právní totožnost, která může být v řízení sdělena, pokud to vyžaduje zákon.",
    contactIntro: "Žádosti týkající se ochrany osobních údajů můžete zaslat také na jednu z následujících e-mailových adres zákaznické podpory. Tyto adresy slouží jako kontaktní kanály a nenahrazují zveřejnění právní identity správce, pokud to vyžadují platné právní předpisy:",
    providerUpdateNotice: "Služba se průběžně vyvíjí. Poskytovatelé AI, modely a směrování požadavků se proto mohou měnit, přidávat nebo odebírat; seznam popisuje aktuální konfiguraci a neznamená, že se každý poskytovatel používá pro každý požadavek. Zásady ochrany osobních údajů a oznámení v aplikaci budou aktualizovány při relevantních změnách zpracování.",
  },
};
