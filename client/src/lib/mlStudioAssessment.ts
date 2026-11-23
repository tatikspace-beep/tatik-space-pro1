export const mlStudioLanguages = [
  "en", "it", "es", "fr", "de", "pt", "ru", "pl", "nl", "tr", "sv", "da", "no", "fi", "uk", "cs",
] as const;

export type MlAssessmentLanguage = (typeof mlStudioLanguages)[number];

export function getMlStudioLanguage(language: string): MlAssessmentLanguage {
  return mlStudioLanguages.includes(language as MlAssessmentLanguage)
    ? (language as MlAssessmentLanguage)
    : "en";
}

export function getMlStudioLocale(language: string) {
  const normalized = getMlStudioLanguage(language);
  return normalized === "no" ? "nb-NO" : normalized;
}

type AssessmentModel = {
  name: string;
  accuracy?: number;
  balancedAccuracy?: number;
  macroF1?: number;
  r2?: number;
  mae?: number;
  rmse?: number;
  confusionMatrix?: number[][];
};

export type MlAssessmentResult = {
  task: "classification" | "regression";
  target: string;
  usableRows: number;
  testRows: number;
  models: AssessmentModel[];
  bestModel: string;
  classLabels: string[];
  featureImportance: Array<{ name: string; importance: number }>;
  warnings: string[];
};

type AssessmentCopy = {
  title: string;
  empty: string;
  evaluation: (testRows: string, usableRows: string) => string;
  validation: string;
  classification: (model: string, f1: string, accuracy: string) => string;
  confusion: (correct: string, total: string) => string;
  regression: (model: string, mae: string, target: string, rmse: string, r2: string) => string;
  negativeR2: string;
  feature: (name: string, value: string) => string;
  mlp: string;
  disclaimer: string;
  shortDisclaimer: string;
};

const assessmentCopy: Record<MlAssessmentLanguage, AssessmentCopy> = {
  en: {
    title: "Automated technical assessment",
    empty: "There are no metrics to interpret.",
    evaluation: (test, usable) => `Evaluation used ${test} test observations from ${usable} usable rows. A single random split does not quantify metric variability: repeat with cross-validation and an independent test set.`,
    validation: "Before operational use, check label quality, class imbalance, data leakage, and the cost of errors in your domain.",
    classification: (model, f1, accuracy) => `${model} scored highest among the compared models on this test: macro F1 ${f1} and balanced accuracy ${accuracy}.`,
    confusion: (correct, total) => `The confusion matrix shows ${correct} correct predictions out of ${total} in the test set; inspect per-class errors, especially when error costs differ.`,
    regression: (model, mae, target, rmse, r2) => `${model} achieved the lowest MAE among compared models: ${mae} (in the units of target “${target}”); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negative R²: on this test, the model performed worse than a baseline that predicts the target mean.",
    feature: (name, value) => `Random Forest assigns the highest importance to “${name}” (${value}); importance describes predictive association, not causality.`,
    mlp: "The MLP did not converge within the CPU limit; do not treat its score as a definitive comparison.",
    disclaimer: "Automated guidance based only on the results shown: it is not a certification, independent audit, or signed professional opinion. For consequential decisions, seek review by a qualified domain professional.",
    shortDisclaimer: "This automated assessment is not a certification or a signed professional opinion.",
  },
  it: {
    title: "Lettura tecnica automatica",
    empty: "Non ci sono metriche da interpretare.",
    evaluation: (test, usable) => `Valutazione su ${test} osservazioni di test, estratte da ${usable} righe utilizzabili. Un solo split casuale non quantifica la variabilità delle metriche: ripeti la valutazione con cross-validation e un test indipendente.`,
    validation: "Prima dell'uso operativo, verifica qualità delle etichette, sbilanciamento delle classi, leakage e costo degli errori nel tuo settore.",
    classification: (model, f1, accuracy) => `${model} ha ottenuto il risultato migliore tra i modelli confrontati sul test: F1 macro ${f1} e accuratezza bilanciata ${accuracy}.`,
    confusion: (correct, total) => `La matrice di confusione mostra ${correct} previsioni corrette su ${total} nel test; controlla gli errori per classe, soprattutto se i costi degli errori sono diversi.`,
    regression: (model, mae, target, rmse, r2) => `${model} ha ottenuto il MAE più basso tra i modelli confrontati: ${mae} (nelle unita della variabile obiettivo “${target}”); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "R² negativo: su questo test il modello è andato peggio della baseline che predice la media del target.",
    feature: (name, value) => `La Random Forest attribuisce il maggior peso a “${name}” (${value}); l'importanza descrive un'associazione predittiva, non causalità.`,
    mlp: "La rete MLP non ha raggiunto la convergenza entro il limite CPU; non interpretarne il punteggio come confronto definitivo.",
    disclaimer: "Indicazione automatica basata solo sui risultati mostrati: non è una certificazione, un audit indipendente o un parere professionale firmato. Per decisioni rilevanti, richiedi la revisione di un professionista del settore.",
    shortDisclaimer: "Questa lettura automatica non è una certificazione né un parere professionale firmato.",
  },
  es: {
    title: "Evaluación técnica automática",
    empty: "No hay métricas que interpretar.",
    evaluation: (test, usable) => `La evaluación utilizó ${test} observaciones de prueba de ${usable} filas válidas. Una sola partición aleatoria no cuantifica la variabilidad de las métricas: repite la evaluación con validación cruzada y un conjunto de prueba independiente.`,
    validation: "Antes del uso operativo, comprueba la calidad de las etiquetas, el desequilibrio de clases, la fuga de datos y el coste de los errores en tu ámbito.",
    classification: (model, f1, accuracy) => `${model} obtuvo el mejor resultado entre los modelos comparados en esta prueba: F1 macro ${f1} y exactitud balanceada ${accuracy}.`,
    confusion: (correct, total) => `La matriz de confusión muestra ${correct} predicciones correctas de ${total} en el conjunto de prueba; revisa los errores por clase, especialmente si sus costes difieren.`,
    regression: (model, mae, target, rmse, r2) => `${model} obtuvo el MAE más bajo entre los modelos comparados: ${mae} (en las unidades de la variable objetivo «${target}»); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "R² negativo: en esta prueba, el modelo rindió peor que una referencia que predice la media del objetivo.",
    feature: (name, value) => `Random Forest atribuye la mayor importancia a «${name}» (${value}); la importancia describe una asociación predictiva, no causalidad.`,
    mlp: "El MLP no convergió dentro del límite de CPU; no consideres su puntuación una comparación definitiva.",
    disclaimer: "Orientación automática basada únicamente en los resultados mostrados: no es una certificación, auditoría independiente ni opinión profesional firmada. Para decisiones importantes, solicita la revisión de un profesional cualificado del ámbito.",
    shortDisclaimer: "Esta evaluación automática no es una certificación ni una opinión profesional firmada.",
  },
  fr: {
    title: "Évaluation technique automatisée",
    empty: "Aucune métrique à interpréter.",
    evaluation: (test, usable) => `L’évaluation a utilisé ${test} observations de test parmi ${usable} lignes exploitables. Un seul découpage aléatoire ne mesure pas la variabilité des métriques : recommencez avec une validation croisée et un jeu de test indépendant.`,
    validation: "Avant toute utilisation opérationnelle, vérifiez la qualité des étiquettes, le déséquilibre des classes, les fuites de données et le coût des erreurs dans votre domaine.",
    classification: (model, f1, accuracy) => `${model} obtient le meilleur résultat parmi les modèles comparés sur ce test : F1 macro ${f1} et exactitude équilibrée ${accuracy}.`,
    confusion: (correct, total) => `La matrice de confusion indique ${correct} prédictions correctes sur ${total} dans le jeu de test ; examinez les erreurs par classe, surtout si leur coût diffère.`,
    regression: (model, mae, target, rmse, r2) => `${model} obtient la MAE la plus faible parmi les modèles comparés : ${mae} (dans les unités de la variable cible « ${target} ») ; RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "R² négatif : sur ce test, le modèle fait moins bien qu’une référence prédisant la moyenne de la cible.",
    feature: (name, value) => `La Random Forest attribue l’importance la plus élevée à « ${name} » (${value}) ; l’importance décrit une association prédictive, pas une causalité.`,
    mlp: "Le MLP n’a pas convergé dans la limite CPU ; ne considérez pas son score comme une comparaison définitive.",
    disclaimer: "Indication automatisée fondée uniquement sur les résultats affichés : ce n’est ni une certification, ni un audit indépendant, ni un avis professionnel signé. Pour les décisions importantes, demandez l’avis d’un professionnel qualifié du domaine.",
    shortDisclaimer: "Cette évaluation automatisée n’est ni une certification ni un avis professionnel signé.",
  },
  de: {
    title: "Automatische technische Bewertung",
    empty: "Es gibt keine Kennzahlen zur Auswertung.",
    evaluation: (test, usable) => `Die Auswertung verwendete ${test} Testbeobachtungen aus ${usable} nutzbaren Zeilen. Eine einzelne zufällige Aufteilung erfasst die Variabilität der Kennzahlen nicht: Wiederholen Sie die Auswertung mit Kreuzvalidierung und einem unabhängigen Testsatz.`,
    validation: "Prüfen Sie vor dem operativen Einsatz die Labelqualität, Klassenungleichgewichte, Datenlecks und die Fehlerkosten in Ihrem Anwendungsbereich.",
    classification: (model, f1, accuracy) => `${model} erzielte im Test unter den verglichenen Modellen das beste Ergebnis: Macro-F1 ${f1} und balancierte Genauigkeit ${accuracy}.`,
    confusion: (correct, total) => `Die Konfusionsmatrix zeigt ${correct} korrekte Vorhersagen von ${total} im Testsatz; prüfen Sie Fehler je Klasse, besonders bei unterschiedlichen Fehlerkosten.`,
    regression: (model, mae, target, rmse, r2) => `${model} erzielte unter den verglichenen Modellen den niedrigsten MAE: ${mae} (in den Einheiten des Zielmerkmals „${target}“); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negatives R²: Das Modell war in diesem Test schlechter als eine Referenz, die den Zielmittelwert vorhersagt.",
    feature: (name, value) => `Random Forest weist „${name}“ die höchste Wichtigkeit zu (${value}); Wichtigkeit beschreibt einen prädiktiven Zusammenhang, keine Kausalität.`,
    mlp: "Das MLP konvergierte nicht innerhalb des CPU-Limits; behandeln Sie seinen Wert nicht als endgültigen Vergleich.",
    disclaimer: "Automatische Orientierung nur auf Basis der angezeigten Ergebnisse: keine Zertifizierung, unabhängige Prüfung oder unterschriebene Fachmeinung. Lassen Sie wichtige Entscheidungen von einer qualifizierten Fachperson prüfen.",
    shortDisclaimer: "Diese automatische Bewertung ist keine Zertifizierung oder unterschriebene Fachmeinung.",
  },
  pt: {
    title: "Avaliação técnica automática",
    empty: "Não há métricas para interpretar.",
    evaluation: (test, usable) => `A avaliação utilizou ${test} observações de teste entre ${usable} linhas utilizáveis. Uma única divisão aleatória não quantifica a variabilidade das métricas: repita com validação cruzada e um conjunto de teste independente.`,
    validation: "Antes do uso operacional, verifique a qualidade dos rótulos, o desequilíbrio das classes, o vazamento de dados e o custo dos erros no seu domínio.",
    classification: (model, f1, accuracy) => `${model} obteve o melhor resultado entre os modelos comparados neste teste: F1 macro ${f1} e exatidão equilibrada ${accuracy}.`,
    confusion: (correct, total) => `A matriz de confusão mostra ${correct} previsões corretas de ${total} no conjunto de teste; examine os erros por classe, sobretudo quando os custos diferem.`,
    regression: (model, mae, target, rmse, r2) => `${model} obteve o menor MAE entre os modelos comparados: ${mae} (nas unidades da variável-alvo “${target}”); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "R² negativo: neste teste, o modelo teve desempenho inferior a uma referência que prevê a média do alvo.",
    feature: (name, value) => `A Random Forest atribui maior importância a “${name}” (${value}); a importância descreve uma associação preditiva, não causalidade.`,
    mlp: "O MLP não convergiu dentro do limite de CPU; não considere a sua pontuação uma comparação definitiva.",
    disclaimer: "Orientação automática baseada apenas nos resultados apresentados: não é uma certificação, auditoria independente ou parecer profissional assinado. Para decisões relevantes, peça a revisão de um profissional qualificado da área.",
    shortDisclaimer: "Esta avaliação automática não é uma certificação nem um parecer profissional assinado.",
  },
  ru: {
    title: "Автоматическая техническая оценка",
    empty: "Нет метрик для интерпретации.",
    evaluation: (test, usable) => `Для оценки использовано тестовых наблюдений: ${test} из ${usable} пригодных строк. Одно случайное разбиение не показывает изменчивость метрик: повторите оценку с перекрёстной проверкой и независимой тестовой выборкой.`,
    validation: "Перед практическим применением проверьте качество меток, дисбаланс классов, утечку данных и цену ошибок в вашей области.",
    classification: (model, f1, accuracy) => `${model} показала лучший результат среди сравниваемых моделей на этом тесте: макро-F1 ${f1} и сбалансированная точность ${accuracy}.`,
    confusion: (correct, total) => `Матрица ошибок показывает ${correct} верных прогнозов из ${total} в тестовой выборке; изучите ошибки по классам, особенно если цена ошибок различается.`,
    regression: (model, mae, target, rmse, r2) => `${model} показала наименьшую MAE среди сравниваемых моделей: ${mae} (в единицах целевой переменной «${target}»); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Отрицательный R²: на этом тесте модель уступила базовому прогнозу среднего целевой переменной.",
    feature: (name, value) => `Random Forest присвоила наибольшую важность признаку «${name}» (${value}); важность отражает предиктивную связь, а не причинность.`,
    mlp: "MLP не достигла сходимости в пределах лимита CPU; не считайте её оценку окончательным сравнением.",
    disclaimer: "Автоматическая рекомендация основана только на показанных результатах и не является сертификацией, независимым аудитом или подписанным профессиональным заключением. По важным вопросам обратитесь к квалифицированному специалисту.",
    shortDisclaimer: "Автоматическая оценка не является сертификацией или подписанным профессиональным заключением.",
  },
  pl: {
    title: "Automatyczna ocena techniczna",
    empty: "Brak metryk do interpretacji.",
    evaluation: (test, usable) => `Ocena wykorzystała ${test} obserwacji testowych z ${usable} użytecznych wierszy. Pojedynczy losowy podział nie określa zmienności metryk: powtórz ocenę z walidacją krzyżową i niezależnym zbiorem testowym.`,
    validation: "Przed użyciem operacyjnym sprawdź jakość etykiet, niezrównoważenie klas, wyciek danych i koszt błędów w swojej dziedzinie.",
    classification: (model, f1, accuracy) => `${model} uzyskał najlepszy wynik spośród porównywanych modeli w tym teście: makro F1 ${f1} i zrównoważona dokładność ${accuracy}.`,
    confusion: (correct, total) => `Macierz pomyłek pokazuje ${correct} poprawnych predykcji z ${total} w zbiorze testowym; sprawdź błędy dla każdej klasy, zwłaszcza gdy ich koszty się różnią.`,
    regression: (model, mae, target, rmse, r2) => `${model} uzyskał najniższe MAE spośród porównywanych modeli: ${mae} (w jednostkach zmiennej docelowej „${target}”); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Ujemne R²: w tym teście model wypadł gorzej niż punkt odniesienia przewidujący średnią celu.",
    feature: (name, value) => `Random Forest przypisuje największą ważność zmiennej „${name}” (${value}); ważność opisuje zależność predykcyjną, a nie przyczynowość.`,
    mlp: "MLP nie osiągnął zbieżności w limicie CPU; nie traktuj jego wyniku jako ostatecznego porównania.",
    disclaimer: "Automatyczna wskazówka oparta wyłącznie na pokazanych wynikach: nie jest certyfikacją, niezależnym audytem ani podpisaną opinią zawodową. W ważnych decyzjach skonsultuj się z wykwalifikowanym specjalistą.",
    shortDisclaimer: "Ta automatyczna ocena nie jest certyfikacją ani podpisaną opinią zawodową.",
  },
  nl: {
    title: "Automatische technische beoordeling",
    empty: "Er zijn geen statistieken om te interpreteren.",
    evaluation: (test, usable) => `De evaluatie gebruikte ${test} testobservaties uit ${usable} bruikbare rijen. Eén willekeurige splitsing geeft geen beeld van de variatie in statistieken: herhaal met kruisvalidatie en een onafhankelijke testset.`,
    validation: "Controleer vóór operationeel gebruik de kwaliteit van labels, klasse-onbalans, datalekken en de kosten van fouten in uw domein.",
    classification: (model, f1, accuracy) => `${model} scoorde in deze test het hoogst van de vergeleken modellen: macro-F1 ${f1} en gebalanceerde nauwkeurigheid ${accuracy}.`,
    confusion: (correct, total) => `De verwarringsmatrix toont ${correct} correcte voorspellingen van ${total} in de testset; bekijk fouten per klasse, vooral als de foutkosten verschillen.`,
    regression: (model, mae, target, rmse, r2) => `${model} behaalde de laagste MAE van de vergeleken modellen: ${mae} (in de eenheden van doelvariabele “${target}”); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negatieve R²: in deze test presteerde het model slechter dan een basislijn die het gemiddelde van het doel voorspelt.",
    feature: (name, value) => `Random Forest kent de hoogste belangrijkheid toe aan “${name}” (${value}); belangrijkheid beschrijft een voorspellende samenhang, geen causaliteit.`,
    mlp: "De MLP convergeerde niet binnen de CPU-limiet; beschouw de score niet als een definitieve vergelijking.",
    disclaimer: "Automatische aanwijzing uitsluitend gebaseerd op de getoonde resultaten: geen certificering, onafhankelijke audit of ondertekend professioneel advies. Vraag bij belangrijke beslissingen een gekwalificeerde vakdeskundige om beoordeling.",
    shortDisclaimer: "Deze automatische beoordeling is geen certificering of ondertekend professioneel advies.",
  },
  tr: {
    title: "Otomatik teknik değerlendirme",
    empty: "Yorumlanacak metrik yok.",
    evaluation: (test, usable) => `Değerlendirmede ${usable} kullanılabilir satırdan ${test} test gözlemi kullanıldı. Tek bir rastgele bölme metrik değişkenliğini ölçmez: çapraz doğrulama ve bağımsız test kümesiyle tekrarlayın.`,
    validation: "Operasyonel kullanımdan önce etiket kalitesini, sınıf dengesizliğini, veri sızıntısını ve alanınızdaki hata maliyetlerini kontrol edin.",
    classification: (model, f1, accuracy) => `${model}, bu testte karşılaştırılan modeller arasında en iyi sonucu aldı: makro F1 ${f1} ve dengeli doğruluk ${accuracy}.`,
    confusion: (correct, total) => `Karmaşıklık matrisi test kümesinde ${total} tahminden ${correct} tanesinin doğru olduğunu gösteriyor; özellikle hata maliyetleri farklıysa sınıf bazındaki hataları inceleyin.`,
    regression: (model, mae, target, rmse, r2) => `${model}, karşılaştırılan modeller arasında en düşük MAE değerini elde etti: ${mae} (hedef “${target}” değişkeninin birimlerinde); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negatif R²: bu testte model, hedef ortalamasını tahmin eden temel yöntemden daha kötü performans gösterdi.",
    feature: (name, value) => `Random Forest en yüksek önemi “${name}” özelliğine veriyor (${value}); önem, nedenselliği değil tahmine dayalı ilişkiyi gösterir.`,
    mlp: "MLP, CPU sınırı içinde yakınsamadı; puanını kesin bir karşılaştırma olarak değerlendirmeyin.",
    disclaimer: "Yalnızca gösterilen sonuçlara dayalı otomatik yönlendirmedir; sertifika, bağımsız denetim veya imzalı profesyonel görüş değildir. Önemli kararlar için alanında uzman bir profesyonelden görüş alın.",
    shortDisclaimer: "Bu otomatik değerlendirme sertifika veya imzalı profesyonel görüş değildir.",
  },
  sv: {
    title: "Automatisk teknisk bedömning",
    empty: "Det finns inga mätvärden att tolka.",
    evaluation: (test, usable) => `Utvärderingen använde ${test} testobservationer av ${usable} användbara rader. En enda slumpmässig uppdelning mäter inte variationen i mätvärdena: upprepa med korsvalidering och ett oberoende testset.`,
    validation: "Kontrollera etikettkvalitet, klassobalans, dataläckage och kostnaden för fel inom ditt område före operativ användning.",
    classification: (model, f1, accuracy) => `${model} fick bäst resultat av de jämförda modellerna på testet: makro-F1 ${f1} och balanserad träffsäkerhet ${accuracy}.`,
    confusion: (correct, total) => `Förväxlingsmatrisen visar ${correct} korrekta förutsägelser av ${total} i testmängden; granska fel per klass, särskilt om felkostnaderna skiljer sig.`,
    regression: (model, mae, target, rmse, r2) => `${model} fick lägst MAE bland de jämförda modellerna: ${mae} (i målets ”${target}”-enheter); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negativt R²: modellen presterade sämre än en baslinje som förutsäger målets medelvärde på detta test.",
    feature: (name, value) => `Random Forest ger störst vikt åt ”${name}” (${value}); vikt beskriver ett prediktivt samband, inte orsakssamband.`,
    mlp: "MLP-modellen konvergerade inte inom CPU-gränsen; betrakta inte resultatet som en definitiv jämförelse.",
    disclaimer: "Automatisk vägledning baserad enbart på resultaten som visas: ingen certifiering, oberoende granskning eller undertecknat professionellt utlåtande. Be en kvalificerad expert inom området granska viktiga beslut.",
    shortDisclaimer: "Den automatiska bedömningen är ingen certifiering eller ett undertecknat professionellt utlåtande.",
  },
  da: {
    title: "Automatisk teknisk vurdering",
    empty: "Der er ingen målinger at fortolke.",
    evaluation: (test, usable) => `Evalueringen brugte ${test} testobservationer fra ${usable} brugbare rækker. Én tilfældig opdeling viser ikke målingernes variation: gentag med krydsvalidering og et uafhængigt testsæt.`,
    validation: "Kontrollér kvaliteten af etiketter, klasseubalance, datalækage og fejlomkostninger i dit fagområde før operationel brug.",
    classification: (model, f1, accuracy) => `${model} klarede sig bedst blandt de sammenlignede modeller på testen: makro-F1 ${f1} og balanceret nøjagtighed ${accuracy}.`,
    confusion: (correct, total) => `Forvekslingsmatricen viser ${correct} korrekte forudsigelser ud af ${total} i testsættet; undersøg fejl pr. klasse, især hvis fejlomkostningerne varierer.`,
    regression: (model, mae, target, rmse, r2) => `${model} opnåede den laveste MAE blandt de sammenlignede modeller: ${mae} (i målets “${target}”-enheder); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negativ R²: Modellen klarede sig dårligere end en baseline, der forudsiger målets gennemsnit, på denne test.",
    feature: (name, value) => `Random Forest tildeler “${name}” den største betydning (${value}); betydning beskriver en prædiktiv sammenhæng, ikke årsagssammenhæng.`,
    mlp: "MLP-modellen konvergerede ikke inden for CPU-grænsen; betragt ikke resultatet som en endelig sammenligning.",
    disclaimer: "Automatisk vejledning baseret alene på de viste resultater: ikke en certificering, uafhængig revision eller underskrevet faglig vurdering. Få en kvalificeret fagperson til at gennemgå vigtige beslutninger.",
    shortDisclaimer: "Denne automatiske vurdering er ikke en certificering eller underskrevet faglig vurdering.",
  },
  no: {
    title: "Automatisk teknisk vurdering",
    empty: "Det finnes ingen måltall å tolke.",
    evaluation: (test, usable) => `Evalueringen brukte ${test} testobservasjoner fra ${usable} brukbare rader. Én tilfeldig deling viser ikke variasjonen i måltallene: gjenta med kryssvalidering og et uavhengig testsett.`,
    validation: "Kontroller etikettkvalitet, klasseubalanse, datalekkasje og kostnaden ved feil i fagområdet ditt før operativ bruk.",
    classification: (model, f1, accuracy) => `${model} fikk best resultat blant de sammenlignede modellene på testen: makro-F1 ${f1} og balansert nøyaktighet ${accuracy}.`,
    confusion: (correct, total) => `Forvekslingsmatrisen viser ${correct} riktige prediksjoner av ${total} i testsettet; undersøk feil per klasse, særlig hvis feilkostnadene er ulike.`,
    regression: (model, mae, target, rmse, r2) => `${model} fikk lavest MAE blant de sammenlignede modellene: ${mae} (i enhetene til målvariabelen «${target}»); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negativ R²: På denne testen presterte modellen dårligere enn en grunnlinje som predikerer gjennomsnittet til målet.",
    feature: (name, value) => `Random Forest tillegger «${name}» størst viktighet (${value}); viktighet beskriver en prediktiv sammenheng, ikke årsakssammenheng.`,
    mlp: "MLP nådde ikke konvergens innenfor CPU-grensen; ikke betrakt poengsummen som en endelig sammenligning.",
    disclaimer: "Automatisk veiledning kun basert på resultatene som vises: ikke en sertifisering, uavhengig revisjon eller signert faglig uttalelse. Be en kvalifisert fagperson vurdere viktige beslutninger.",
    shortDisclaimer: "Denne automatiske vurderingen er ikke en sertifisering eller signert faglig uttalelse.",
  },
  fi: {
    title: "Automaattinen tekninen arvio",
    empty: "Ei tulkittavia mittareita.",
    evaluation: (test, usable) => `Arvioinnissa käytettiin ${test} testihavaintoa ${usable} käyttökelpoisesta rivistä. Yksi satunnainen jako ei kuvaa mittareiden vaihtelua: toista arviointi ristiinvalidoinnilla ja riippumattomalla testijoukolla.`,
    validation: "Tarkista ennen operatiivista käyttöä tunnisteiden laatu, luokkien epätasapaino, tietovuoto ja virheiden kustannukset omalla alallasi.",
    classification: (model, f1, accuracy) => `${model} sai vertailtujen mallien parhaan tuloksen tässä testissä: makro-F1 ${f1} ja tasapainotettu tarkkuus ${accuracy}.`,
    confusion: (correct, total) => `Sekaannusmatriisi näyttää ${correct} oikeaa ennustetta ${total}:sta testijoukossa; tarkastele luokkakohtaisia virheitä erityisesti, jos niiden kustannukset vaihtelevat.`,
    regression: (model, mae, target, rmse, r2) => `${model} sai vertailun pienimmän MAE-arvon: ${mae} (kohdemuuttujan ”${target}” yksiköissä); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Negatiivinen R²: tässä testissä malli suoriutui huonommin kuin kohteen keskiarvoa ennustava perustaso.",
    feature: (name, value) => `Random Forest antaa suurimman tärkeyden muuttujalle ”${name}” (${value}); tärkeys kuvaa ennustavaa yhteyttä, ei syy-seuraussuhdetta.`,
    mlp: "MLP ei saavuttanut konvergenssia CPU-rajan puitteissa; älä pidä tulosta lopullisena vertailuna.",
    disclaimer: "Automaattinen ohje perustuu vain näytettyihin tuloksiin: se ei ole sertifiointi, riippumaton auditointi eikä allekirjoitettu ammattilaislausunto. Pyydä tärkeisiin päätöksiin pätevän alan asiantuntijan arvio.",
    shortDisclaimer: "Tämä automaattinen arvio ei ole sertifiointi eikä allekirjoitettu ammattilaislausunto.",
  },
  uk: {
    title: "Автоматична технічна оцінка",
    empty: "Немає метрик для інтерпретації.",
    evaluation: (test, usable) => `Для оцінювання використано ${test} тестових спостережень із ${usable} придатних рядків. Один випадковий поділ не вимірює мінливість метрик: повторіть оцінювання з перехресною перевіркою та незалежною тестовою вибіркою.`,
    validation: "Перед практичним використанням перевірте якість міток, дисбаланс класів, витік даних і вартість помилок у вашій сфері.",
    classification: (model, f1, accuracy) => `${model} показала найкращий результат серед порівнюваних моделей на цьому тесті: макро-F1 ${f1} і збалансована точність ${accuracy}.`,
    confusion: (correct, total) => `Матриця помилок показує ${correct} правильних прогнозів із ${total} у тестовій вибірці; перевірте помилки за класами, особливо якщо їхня вартість різниться.`,
    regression: (model, mae, target, rmse, r2) => `${model} має найменшу MAE серед порівнюваних моделей: ${mae} (в одиницях цільової змінної «${target}»); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Від’ємний R²: на цьому тесті модель поступилася базовому прогнозу середнього цільової змінної.",
    feature: (name, value) => `Random Forest надає найбільшу важливість ознаці «${name}» (${value}); важливість описує прогнозний зв’язок, а не причинність.`,
    mlp: "MLP не досягла збіжності в межах ліміту CPU; не вважайте її оцінку остаточним порівнянням.",
    disclaimer: "Автоматична рекомендація ґрунтується лише на показаних результатах і не є сертифікацією, незалежним аудитом чи підписаним професійним висновком. Для важливих рішень зверніться до кваліфікованого фахівця.",
    shortDisclaimer: "Ця автоматична оцінка не є сертифікацією чи підписаним професійним висновком.",
  },
  cs: {
    title: "Automatické technické hodnocení",
    empty: "Nejsou k dispozici žádné metriky k interpretaci.",
    evaluation: (test, usable) => `Hodnocení použilo ${test} testovacích pozorování z ${usable} použitelných řádků. Jedno náhodné rozdělení neurčuje variabilitu metrik: opakujte hodnocení pomocí křížové validace a nezávislé testovací sady.`,
    validation: "Před provozním použitím ověřte kvalitu štítků, nevyváženost tříd, únik dat a náklady na chyby ve svém oboru.",
    classification: (model, f1, accuracy) => `${model} dosáhl v tomto testu nejlepšího výsledku ze srovnávaných modelů: makro F1 ${f1} a vyvážená přesnost ${accuracy}.`,
    confusion: (correct, total) => `Matice záměn ukazuje ${correct} správných predikcí z ${total} v testovací sadě; zkontrolujte chyby podle tříd, zejména pokud se jejich náklady liší.`,
    regression: (model, mae, target, rmse, r2) => `${model} dosáhl nejnižší MAE ze srovnávaných modelů: ${mae} (v jednotkách cílové proměnné „${target}“); RMSE ${rmse}, R² ${r2}.`,
    negativeR2: "Záporné R²: model v tomto testu dopadl hůře než výchozí predikce průměru cíle.",
    feature: (name, value) => `Random Forest přisuzuje nejvyšší důležitost proměnné „${name}“ (${value}); důležitost popisuje prediktivní souvislost, nikoli kauzalitu.`,
    mlp: "MLP nedosáhla konvergence v limitu CPU; její skóre nepovažujte za definitivní srovnání.",
    disclaimer: "Automatické doporučení založené pouze na zobrazených výsledcích: nejde o certifikaci, nezávislý audit ani podepsaný odborný posudek. U důležitých rozhodnutí požádejte o kontrolu kvalifikovaného odborníka.",
    shortDisclaimer: "Toto automatické hodnocení není certifikace ani podepsaný odborný posudek.",
  },
};

const modelNames: Record<string, Partial<Record<MlAssessmentLanguage, string>>> = {
  "SVM lineare": {
    en: "Linear SVM", es: "SVM lineal", fr: "SVM linéaire", de: "Lineare SVM", pt: "SVM linear",
    ru: "Линейная SVM", pl: "Liniowy SVM", nl: "Lineaire SVM", tr: "Doğrusal SVM", sv: "Linjär SVM",
    da: "Lineær SVM", no: "Lineær SVM", fi: "Lineaarinen SVM", uk: "Лінійна SVM", cs: "Lineární SVM",
  },
  "Rete neurale MLP": {
    en: "Neural MLP", es: "MLP neuronal", fr: "MLP neuronal", de: "Neuronales MLP", pt: "MLP neural",
    ru: "Нейронная MLP", pl: "Neuronowa MLP", nl: "Neuraal MLP", tr: "Sinirsel MLP", sv: "Neuralt MLP",
    da: "Neural MLP", no: "Nevralt MLP", fi: "Neuraalinen MLP", uk: "Нейронна MLP", cs: "Neuronová MLP",
  },
};

export function localizeMlModelName(name: string, language: string) {
  const locale = getMlStudioLanguage(language);
  if (locale === "it") return name;
  return modelNames[name]?.[locale] ?? name;
}

const warningTranslations: Record<string, Partial<Record<MlAssessmentLanguage, string>>> = {
  split: {
    en: "Metrics are based on a single random 80/20 split; this is not independent validation.",
    es: "Las métricas se basan en una única partición aleatoria 80/20; no es una validación independiente.",
    fr: "Les métriques reposent sur un seul découpage aléatoire 80/20 ; il ne s’agit pas d’une validation indépendante.",
    de: "Die Kennzahlen beruhen auf einer einzelnen zufälligen 80/20-Aufteilung; dies ist keine unabhängige Validierung.",
    pt: "As métricas baseiam-se numa única divisão aleatória 80/20; isto não é uma validação independente.",
    ru: "Метрики рассчитаны по одному случайному разбиению 80/20; это не является независимой проверкой.",
    pl: "Metryki obliczono na podstawie pojedynczego losowego podziału 80/20; nie jest to niezależna walidacja.",
    nl: "De statistieken zijn gebaseerd op één willekeurige 80/20-splitsing; dit is geen onafhankelijke validatie.",
    tr: "Metrikler tek bir rastgele 80/20 bölmesine dayanır; bu bağımsız doğrulama değildir.",
    sv: "Mätvärdena bygger på en enda slumpmässig 80/20-delning; detta är ingen oberoende validering.",
    da: "Målingerne er baseret på én tilfældig 80/20-opdeling; dette er ikke uafhængig validering.",
    no: "Måltallene er basert på én tilfeldig 80/20-deling; dette er ikke uavhengig validering.",
    fi: "Mittarit perustuvat yhteen satunnaiseen 80/20-jakoon; kyseessä ei ole riippumaton validointi.",
    uk: "Метрики базуються на одному випадковому поділі 80/20; це не є незалежною перевіркою.",
    cs: "Metriky vycházejí z jediného náhodného rozdělení 80/20; nejde o nezávislou validaci.",
  },
  neural: {
    en: "The MLP is a lightweight tabular neural network trained under CPU limits; it is not an image CNN or image deep-learning model.",
    es: "El MLP es una red neuronal ligera para datos tabulares, entrenada con límites de CPU; no es una CNN ni un modelo de aprendizaje profundo para imágenes.",
    fr: "Le MLP est un réseau neuronal léger pour données tabulaires, entraîné avec des limites CPU ; ce n’est pas un CNN ni un modèle d’apprentissage profond pour images.",
    de: "Das MLP ist ein leichtgewichtiges neuronales Netz für Tabellendaten, das unter CPU-Beschränkungen trainiert wurde; es ist kein Bild-CNN oder Deep-Learning-Modell für Bilder.",
    pt: "O MLP é uma rede neural leve para dados tabulares, treinada com limites de CPU; não é uma CNN nem um modelo de aprendizagem profunda para imagens.",
    ru: "MLP — лёгкая нейронная сеть для табличных данных, обученная с ограничениями CPU; это не CNN и не модель глубокого обучения для изображений.",
    pl: "MLP to lekka sieć neuronowa do danych tabelarycznych, trenowana przy ograniczeniach CPU; nie jest to CNN ani model głębokiego uczenia obrazów.",
    nl: "De MLP is een licht neuraal netwerk voor tabelgegevens, getraind met CPU-beperkingen; het is geen CNN of deep-learningmodel voor afbeeldingen.",
    tr: "MLP, CPU sınırları altında eğitilmiş hafif bir tablo verisi sinir ağıdır; görüntü CNN'i veya görüntü derin öğrenme modeli değildir.",
    sv: "MLP är ett lätt neuralt nätverk för tabelldata som tränats med CPU-begränsningar; det är inte ett bild-CNN eller en modell för djupinlärning av bilder.",
    da: "MLP er et let neuralt netværk til tabeldata, trænet under CPU-begrænsninger; det er ikke et billed-CNN eller en deep learning-model til billeder.",
    no: "MLP er et lett nevralt nettverk for tabelldata, trent med CPU-begrensninger; det er ikke et bilde-CNN eller en modell for dyp læring av bilder.",
    fi: "MLP on kevyt taulukkodatan neuroverkko, joka on koulutettu CPU-rajoituksin; se ei ole kuvien CNN- tai syväoppimismalli.",
    uk: "MLP — це легка нейронна мережа для табличних даних, навчена з обмеженнями CPU; це не CNN і не модель глибокого навчання для зображень.",
    cs: "MLP je lehká neuronová síť pro tabulková data trénovaná s omezením CPU; nejde o obrazovou CNN ani model hlubokého učení pro obrázky.",
  },
  causality: {
    en: "Predictive associations do not demonstrate causality; check for leakage, class imbalance, and label quality.",
    es: "Las asociaciones predictivas no demuestran causalidad; comprueba la fuga de datos, el desequilibrio de clases y la calidad de las etiquetas.",
    fr: "Les associations prédictives ne démontrent pas de causalité ; vérifiez les fuites de données, le déséquilibre des classes et la qualité des étiquettes.",
    de: "Prädiktive Zusammenhänge belegen keine Kausalität; prüfen Sie Datenlecks, Klassenungleichgewichte und Labelqualität.",
    pt: "Associações preditivas não demonstram causalidade; verifique vazamento de dados, desequilíbrio de classes e qualidade dos rótulos.",
    ru: "Предиктивные связи не доказывают причинность; проверьте утечку данных, дисбаланс классов и качество меток.",
    pl: "Zależności predykcyjne nie dowodzą przyczynowości; sprawdź wyciek danych, niezrównoważenie klas i jakość etykiet.",
    nl: "Voorspellende verbanden tonen geen causaliteit aan; controleer op datalekken, klasse-onbalans en labelkwaliteit.",
    tr: "Tahmine dayalı ilişkiler nedenselliği kanıtlamaz; veri sızıntısını, sınıf dengesizliğini ve etiket kalitesini kontrol edin.",
    sv: "Prediktiva samband visar inte orsakssamband; kontrollera dataläckage, klassobalans och etikettkvalitet.",
    da: "Prædiktive sammenhænge beviser ikke årsagssammenhæng; kontrollér datalækage, klasseubalance og etiketter.",
    no: "Prediktive sammenhenger viser ikke årsakssammenheng; kontroller datalekkasje, klasseubalanse og etikettkvalitet.",
    fi: "Ennustavat yhteydet eivät osoita syy-seuraussuhdetta; tarkista tietovuoto, luokkien epätasapaino ja tunnisteiden laatu.",
    uk: "Прогнозні зв’язки не доводять причинність; перевірте витік даних, дисбаланс класів і якість міток.",
    cs: "Prediktivní souvislosti neprokazují příčinnost; zkontrolujte únik dat, nevyváženost tříd a kvalitu štítků.",
  },
  convergence: {
    en: "The MLP did not converge within the CPU limit; interpret its metrics with caution.",
    es: "El MLP no convergió dentro del límite de CPU; interpreta sus métricas con cautela.",
    fr: "Le MLP n’a pas convergé dans la limite CPU ; interprétez ses métriques avec prudence.",
    de: "Das MLP konvergierte nicht innerhalb des CPU-Limits; interpretieren Sie seine Kennzahlen mit Vorsicht.",
    pt: "O MLP não convergiu dentro do limite de CPU; interprete as métricas com cautela.",
    ru: "MLP не достигла сходимости в пределах лимита CPU; интерпретируйте её метрики осторожно.",
    pl: "MLP nie osiągnął zbieżności w limicie CPU; interpretuj jego metryki ostrożnie.",
    nl: "De MLP convergeerde niet binnen de CPU-limiet; interpreteer de statistieken voorzichtig.",
    tr: "MLP, CPU sınırı içinde yakınsamadı; metriklerini dikkatle yorumlayın.",
    sv: "MLP konvergerade inte inom CPU-gränsen; tolka mätvärdena med försiktighet.",
    da: "MLP konvergerede ikke inden for CPU-grænsen; fortolk målingerne med forsigtighed.",
    no: "MLP konvergerte ikke innenfor CPU-grensen; tolk måltallene med forsiktighet.",
    fi: "MLP ei saavuttanut konvergenssia CPU-rajan puitteissa; tulkitse mittareita varoen.",
    uk: "MLP не досягла збіжності в межах ліміту CPU; інтерпретуйте її метрики обережно.",
    cs: "MLP nedosáhla konvergence v limitu CPU; metriky interpretujte opatrně.",
  },
};

function warningKey(warning: string) {
  const normalized = warning.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("metriche calcolate su un singolo split casuale")) return "split";
  if (normalized.includes("modello neurale tabellare leggero")) return "neural";
  if (normalized.includes("associazioni predittive non dimostrano causalita")) return "causality";
  if (normalized.includes("non ha raggiunto la convergenza")) return "convergence";
  return undefined;
}

export function localizeMlWarning(warning: string, language: string) {
  const locale = getMlStudioLanguage(language);
  if (locale === "it") return warning;
  const key = warningKey(warning);
  return (key && warningTranslations[key]?.[locale]) || warning;
}

function formatMetric(value: number | undefined, language: string) {
  return value === undefined
    ? "—"
    : value.toLocaleString(getMlStudioLocale(language), { maximumFractionDigits: 3 });
}

export function createMlAssessment(result: MlAssessmentResult, language: string) {
  const locale = getMlStudioLanguage(language);
  const copy = assessmentCopy[locale];
  const best = result.models.find(model => model.name === result.bestModel) ?? result.models[0];
  const bestModelName = best ? localizeMlModelName(best.name, locale) : "";

  if (!best) {
    return {
      title: copy.title,
      summary: copy.empty,
      findings: [],
      disclaimer: copy.shortDisclaimer,
    };
  }

  const findings = [
    copy.evaluation(
      result.testRows.toLocaleString(getMlStudioLocale(locale)),
      result.usableRows.toLocaleString(getMlStudioLocale(locale))
    ),
    copy.validation,
  ];
  let summary: string;
  if (result.task === "classification") {
    summary = copy.classification(
      bestModelName,
      formatMetric(best.macroF1, locale),
      formatMetric(best.balancedAccuracy, locale)
    );
    const matrix = best.confusionMatrix ?? [];
    if (matrix.length) {
      const correct = matrix.reduce((sum, row, index) => sum + (row[index] ?? 0), 0);
      const total = matrix.reduce((sum, row) => sum + row.reduce((rowSum, count) => rowSum + count, 0), 0);
      if (total) findings.unshift(copy.confusion(
        correct.toLocaleString(getMlStudioLocale(locale)),
        total.toLocaleString(getMlStudioLocale(locale))
      ));
    }
  } else {
    summary = copy.regression(
      bestModelName,
      formatMetric(best.mae, locale),
      result.target,
      formatMetric(best.rmse, locale),
      formatMetric(best.r2, locale)
    );
    if (best.r2 !== undefined && best.r2 < 0) findings.unshift(copy.negativeR2);
  }

  const leadingFeature = result.featureImportance[0];
  if (leadingFeature) findings.push(copy.feature(
    leadingFeature.name,
    formatMetric(leadingFeature.importance, locale)
  ));
  if (result.warnings.some(warning => warningKey(warning) === "convergence")) findings.push(copy.mlp);

  return {
    title: copy.title,
    summary,
    findings,
    disclaimer: copy.disclaimer,
  };
}
