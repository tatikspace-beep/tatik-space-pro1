export type LogicAgeGroup = "kids" | "youth" | "adult";
export type LogicChallengeCopy = {
  category: string;
  prompt: string;
  options: string[];
  explanation: string;
};

export type AdvancedLogicChallenge = {
  id: string;
  correct: number;
  it: LogicChallengeCopy;
  en: LogicChallengeCopy;
};

export const advancedLogicChallenges: Record<
  LogicAgeGroup,
  AdvancedLogicChallenge[]
> = {
  kids: [
    {
      id: "number-steps",
      correct: 2,
      it: {
        category: "Sequenza a più passaggi",
        prompt: "Quale numero viene dopo: 2, 6, 12, 20, 30, ...?",
        options: ["38", "40", "42", "44"],
        explanation:
          "Le differenze aumentano di 2: +4, +6, +8, +10. La prossima è +12, quindi 30 + 12 = 42.",
      },
      en: {
        category: "Multi-step sequence",
        prompt: "Which number comes next: 2, 6, 12, 20, 30, ...?",
        options: ["38", "40", "42", "44"],
        explanation:
          "The differences increase by 2: +4, +6, +8, +10. The next is +12, so 30 + 12 = 42.",
      },
    },
    {
      id: "number-machine",
      correct: 2,
      it: {
        category: "Macchina dei numeri",
        prompt:
          "Una macchina trasforma 3 in 8, 5 in 14 e 7 in 20. Che cosa diventa 9?",
        options: ["24", "25", "26", "27"],
        explanation:
          "La regola è moltiplicare per 3 e poi togliere 1: 9 × 3 − 1 = 26.",
      },
      en: {
        category: "Number machine",
        prompt:
          "A machine changes 3 into 8, 5 into 14, and 7 into 20. What does it change 9 into?",
        options: ["24", "25", "26", "27"],
        explanation:
          "The rule is multiply by 3, then subtract 1: 9 × 3 − 1 = 26.",
      },
    },
    {
      id: "alphabet-skip",
      correct: 1,
      it: {
        category: "Codice alfabetico",
        prompt:
          "Usando l'alfabeto A–Z, quale lettera completa la sequenza A, C, E, G, ...?",
        options: ["H", "I", "J", "K"],
        explanation:
          "Si salta una lettera ogni volta: A, C, E, G, quindi la successiva è I.",
      },
      en: {
        category: "Letter code",
        prompt:
          "Using the A–Z alphabet, which letter completes A, C, E, G, ...?",
        options: ["H", "I", "J", "K"],
        explanation:
          "One letter is skipped each time: A, C, E, G, so the next is I.",
      },
    },
    {
      id: "age-order",
      correct: 2,
      it: {
        category: "Deduzione",
        prompt:
          "Nina è più grande di Omar. Omar è più grande di Pia. Chi è sicuramente il più giovane?",
        options: ["Nina", "Omar", "Pia", "Non si può sapere"],
        explanation:
          "L'ordine è Nina, poi Omar, poi Pia: quindi Pia è la più giovane.",
      },
      en: {
        category: "Deduction",
        prompt:
          "Nina is older than Omar. Omar is older than Pia. Who is definitely the youngest?",
        options: ["Nina", "Omar", "Pia", "There is not enough information"],
        explanation:
          "The order is Nina, then Omar, then Pia, so Pia is the youngest.",
      },
    },
    {
      id: "triangle-rule",
      correct: 0,
      it: {
        category: "Regola e conclusione",
        prompt:
          "Tutti i triangoli hanno 3 lati. La figura sul foglio è un triangolo. Quanti lati ha?",
        options: ["3", "4", "6", "Non si può sapere"],
        explanation:
          "La regola vale per tutti i triangoli; la figura è un triangolo, quindi ha 3 lati.",
      },
      en: {
        category: "Rule and conclusion",
        prompt:
          "Every triangle has 3 sides. The shape on the page is a triangle. How many sides does it have?",
        options: ["3", "4", "6", "There is not enough information"],
        explanation:
          "The rule applies to every triangle; this shape is a triangle, so it has 3 sides.",
      },
    },
    {
      id: "handshakes",
      correct: 1,
      it: {
        category: "Conteggio delle coppie",
        prompt:
          "Quattro amici si stringono la mano una sola volta con ciascun altro. Quante strette di mano ci sono?",
        options: ["4", "6", "8", "12"],
        explanation:
          "Le coppie possibili sono 4 × 3 ÷ 2 = 6; dividiamo per 2 perché ogni coppia altrimenti sarebbe contata due volte.",
      },
      en: {
        category: "Counting pairs",
        prompt:
          "Four friends each shake hands with every other friend exactly once. How many handshakes are there?",
        options: ["4", "6", "8", "12"],
        explanation:
          "There are 4 × 3 ÷ 2 = 6 pairs; divide by 2 so each pair is counted only once.",
      },
    },
    {
      id: "painted-cube",
      correct: 1,
      it: {
        category: "Ragionamento spaziale",
        prompt:
          "Un cubo grande è formato da 27 cubetti (3 × 3 × 3) e viene dipinto su tutte le facce esterne. Quanti cubetti hanno esattamente 2 facce dipinte?",
        options: ["8", "12", "16", "20"],
        explanation:
          "Su ciascuno dei 12 spigoli c'è un cubetto con esattamente 2 facce dipinte: 12 in tutto. I cubetti agli angoli ne hanno 3.",
      },
      en: {
        category: "Spatial reasoning",
        prompt:
          "A large cube is made of 27 small cubes (3 × 3 × 3) and painted on every outside face. How many small cubes have exactly 2 painted faces?",
        options: ["8", "12", "16", "20"],
        explanation:
          "Each of the 12 edges has one small cube with exactly 2 painted faces: 12 altogether. Corner cubes have 3.",
      },
    },
    {
      id: "two-step-machine",
      correct: 2,
      it: {
        category: "Calcolo in due mosse",
        prompt:
          "Una macchina raddoppia il numero in ingresso e poi aggiunge 3. Qual è il risultato se inserisci 8?",
        options: ["16", "18", "19", "22"],
        explanation: "Prima 8 × 2 = 16, poi 16 + 3 = 19.",
      },
      en: {
        category: "Two-step calculation",
        prompt:
          "A machine doubles its input and then adds 3. What is the result when you enter 8?",
        options: ["16", "18", "19", "22"],
        explanation: "First 8 × 2 = 16, then 16 + 3 = 19.",
      },
    },
    {
      id: "cats-and-mice",
      correct: 0,
      it: {
        category: "Ritmo di lavoro",
        prompt:
          "Due gatti prendono 2 topi in 2 minuti. Quanto tempo impiegano 6 gatti a prendere 6 topi, allo stesso ritmo?",
        options: ["2 minuti", "3 minuti", "6 minuti", "12 minuti"],
        explanation:
          "Ogni gatto prende un topo in 2 minuti. Con 6 gatti, i 6 topi vengono presi contemporaneamente: servono sempre 2 minuti.",
      },
      en: {
        category: "Rate reasoning",
        prompt:
          "Two cats catch 2 mice in 2 minutes. At the same rate, how long do 6 cats take to catch 6 mice?",
        options: ["2 minutes", "3 minutes", "6 minutes", "12 minutes"],
        explanation:
          "Each cat catches one mouse in 2 minutes. With 6 cats, all 6 mice are caught at the same time: it still takes 2 minutes.",
      },
    },
    {
      id: "time-shift",
      correct: 1,
      it: {
        category: "Tempo",
        prompt: "Sono le 9:40. Che ora sarà tra 35 minuti?",
        options: ["10:05", "10:15", "10:25", "10:35"],
        explanation:
          "Dalle 9:40 alle 10:00 passano 20 minuti; ne restano 15. Il risultato è 10:15.",
      },
      en: {
        category: "Time",
        prompt: "It is 9:40. What time will it be in 35 minutes?",
        options: ["10:05", "10:15", "10:25", "10:35"],
        explanation:
          "It takes 20 minutes to reach 10:00, leaving 15 minutes. The answer is 10:15.",
      },
    },
  ],
  youth: [
    {
      id: "growing-differences",
      correct: 2,
      it: {
        category: "Sequenza a differenze crescenti",
        prompt: "Completa la sequenza: 1, 4, 10, 19, 31, ...",
        options: ["43", "45", "46", "49"],
        explanation:
          "Le differenze sono +3, +6, +9, +12: aumentano di 3. La prossima è +15, quindi 31 + 15 = 46.",
      },
      en: {
        category: "Increasing-difference sequence",
        prompt: "Complete the sequence: 1, 4, 10, 19, 31, ...",
        options: ["43", "45", "46", "49"],
        explanation:
          "The differences are +3, +6, +9, +12: they increase by 3. The next is +15, so 31 + 15 = 46.",
      },
    },
    {
      id: "doubling-sequence",
      correct: 2,
      it: {
        category: "Regola numerica",
        prompt: "Quale numero viene dopo: 2, 5, 11, 23, 47, ...?",
        options: ["93", "94", "95", "96"],
        explanation: "Ogni numero è il precedente × 2 + 1: 47 × 2 + 1 = 95.",
      },
      en: {
        category: "Number rule",
        prompt: "Which number comes next: 2, 5, 11, 23, 47, ...?",
        options: ["93", "94", "95", "96"],
        explanation:
          "Each number is the previous one × 2 + 1: 47 × 2 + 1 = 95.",
      },
    },
    {
      id: "ordering-chain",
      correct: 1,
      it: {
        category: "Ordine e deduzione",
        prompt:
          "Alice arriva prima di Bea. Bea arriva prima di Dana. Carla arriva dopo Alice. Quale relazione è sicuramente vera?",
        options: [
          "Dana arriva prima di Alice",
          "Alice arriva prima di Dana",
          "Carla arriva prima di Alice",
          "Bea arriva dopo Dana",
        ],
        explanation:
          "Alice è prima di Bea e Bea è prima di Dana; per transitività, Alice è prima anche di Dana.",
      },
      en: {
        category: "Ordering and deduction",
        prompt:
          "Alice finishes before Bea. Bea finishes before Dana. Carla finishes after Alice. Which statement must be true?",
        options: [
          "Dana finishes before Alice",
          "Alice finishes before Dana",
          "Carla finishes before Alice",
          "Bea finishes after Dana",
        ],
        explanation:
          "Alice is before Bea, and Bea is before Dana; therefore Alice is also before Dana.",
      },
    },
    {
      id: "letter-code",
      correct: 0,
      it: {
        category: "Codice alfabetico",
        prompt:
          "Sposta la prima lettera di 1 posto, la seconda di 2, la terza di 3 e la quarta di 4 nell'alfabeto A–Z. MATH diventa...",
        options: ["NCWL", "NBUK", "ODXM", "NCWM"],
        explanation:
          "M→N (+1), A→C (+2), T→W (+3), H→L (+4): il codice è NCWL.",
      },
      en: {
        category: "Letter code",
        prompt:
          "Move the first letter forward by 1 place, the second by 2, the third by 3, and the fourth by 4 in the A–Z alphabet. MATH becomes...",
        options: ["NCWL", "NBUK", "ODXM", "NCWM"],
        explanation:
          "M→N (+1), A→C (+2), T→W (+3), H→L (+4): the code is NCWL.",
      },
    },
    {
      id: "set-deduction",
      correct: 2,
      it: {
        category: "Deduzione tra insiemi",
        prompt:
          "Tutti gli elementi del gruppo A appartengono al gruppo B. Nessun elemento di B appartiene a C. Quale conclusione è certa?",
        options: [
          "Tutti i C appartengono ad A",
          "Alcuni A appartengono a C",
          "Nessun A appartiene a C",
          "A e C sono lo stesso gruppo",
        ],
        explanation:
          "A è interamente dentro B e B non ha elementi in comune con C; quindi neppure A può avere elementi in comune con C.",
      },
      en: {
        category: "Set deduction",
        prompt:
          "Every member of group A belongs to group B. No member of B belongs to C. Which conclusion must be true?",
        options: [
          "Every C belongs to A",
          "Some A belongs to C",
          "No A belongs to C",
          "A and C are the same group",
        ],
        explanation:
          "A is entirely inside B, and B has no members in common with C; therefore A cannot overlap C.",
      },
    },
    {
      id: "painted-cube-four",
      correct: 3,
      it: {
        category: "Ragionamento spaziale",
        prompt:
          "Un cubo 4 × 4 × 4 è dipinto all'esterno e poi diviso in 64 cubetti. Quanti cubetti hanno esattamente 2 facce dipinte?",
        options: ["8", "12", "16", "24"],
        explanation:
          "Su ciascuno dei 12 spigoli restano 4 − 2 = 2 cubetti non d'angolo: 12 × 2 = 24.",
      },
      en: {
        category: "Spatial reasoning",
        prompt:
          "A 4 × 4 × 4 cube is painted on the outside and then split into 64 small cubes. How many small cubes have exactly 2 painted faces?",
        options: ["8", "12", "16", "24"],
        explanation:
          "Along each of the 12 edges, 4 − 2 = 2 non-corner cubes remain: 12 × 2 = 24.",
      },
    },
    {
      id: "probability-draw",
      correct: 1,
      it: {
        category: "Probabilità",
        prompt:
          "In un sacchetto ci sono 2 biglie rosse e 3 blu. Estraendone una senza guardare, qual è la probabilità che sia rossa?",
        options: ["1/2", "2/5", "3/5", "2/3"],
        explanation:
          "Ci sono 5 biglie in tutto e 2 sono rosse: la probabilità è 2 su 5, cioè 2/5.",
      },
      en: {
        category: "Probability",
        prompt:
          "A bag contains 2 red marbles and 3 blue ones. If you draw one without looking, what is the probability it is red?",
        options: ["1/2", "2/5", "3/5", "2/3"],
        explanation:
          "There are 5 marbles in total and 2 are red, so the probability is 2 out of 5, or 2/5.",
      },
    },
    {
      id: "equation",
      correct: 2,
      it: {
        category: "Equazione",
        prompt: "Quale valore soddisfa 3(x − 2) = 2x + 7?",
        options: ["9", "11", "13", "15"],
        explanation:
          "Sviluppando: 3x − 6 = 2x + 7. Sottraendo 2x e aggiungendo 6, si ottiene x = 13.",
      },
      en: {
        category: "Equation",
        prompt: "Which value satisfies 3(x − 2) = 2x + 7?",
        options: ["9", "11", "13", "15"],
        explanation:
          "Expand to get 3x − 6 = 2x + 7. Subtract 2x and add 6 to get x = 13.",
      },
    },
    {
      id: "clock-angle",
      correct: 1,
      it: {
        category: "Angoli e orologio",
        prompt: "Alle 3:30, qual è il minore angolo tra le lancette?",
        options: ["60°", "75°", "90°", "105°"],
        explanation:
          "La lancetta dei minuti è a 180°. Quella delle ore è a metà tra 3 e 4, cioè a 105°: la differenza è 75°.",
      },
      en: {
        category: "Angles and clocks",
        prompt: "At 3:30, what is the smaller angle between the clock hands?",
        options: ["60°", "75°", "90°", "105°"],
        explanation:
          "The minute hand is at 180°. The hour hand is halfway between 3 and 4, at 105°: the difference is 75°.",
      },
    },
    {
      id: "round-robin",
      correct: 0,
      it: {
        category: "Conteggio dei confronti",
        prompt:
          "Cinque squadre giocano una partita contro ciascuna delle altre, una sola volta. Quante partite si disputano?",
        options: ["10", "15", "20", "25"],
        explanation:
          "Ogni partita corrisponde a una coppia di squadre: 5 × 4 ÷ 2 = 10 coppie.",
      },
      en: {
        category: "Counting matchups",
        prompt:
          "Five teams each play every other team exactly once. How many matches are played?",
        options: ["10", "15", "20", "25"],
        explanation: "Each match is one pair of teams: 5 × 4 ÷ 2 = 10 pairs.",
      },
    },
  ],
  adult: [
    {
      id: "recursive-sequence",
      correct: 3,
      it: {
        category: "Sequenza ricorsiva",
        prompt: "Quale numero viene dopo: 3, 8, 18, 38, 78, ...?",
        options: ["154", "156", "157", "158"],
        explanation: "Ogni termine è il precedente × 2 + 2: 78 × 2 + 2 = 158.",
      },
      en: {
        category: "Recursive sequence",
        prompt: "Which number comes next: 3, 8, 18, 38, 78, ...?",
        options: ["154", "156", "157", "158"],
        explanation: "Each term is the previous one × 2 + 2: 78 × 2 + 2 = 158.",
      },
    },
    {
      id: "letter-increments",
      correct: 1,
      it: {
        category: "Sequenza alfabetica",
        prompt:
          "Usando l'alfabeto A–Z e ripartendo da A dopo Z, quale lettera segue B, D, G, K, P, ...?",
        options: ["U", "V", "W", "X"],
        explanation:
          "Gli avanzamenti sono +2, +3, +4, +5; il prossimo è +6. Da P, sei posti avanti, si arriva a V.",
      },
      en: {
        category: "Letter sequence",
        prompt:
          "Using the A–Z alphabet and wrapping around after Z, which letter follows B, D, G, K, P, ...?",
        options: ["U", "V", "W", "X"],
        explanation:
          "The jumps are +2, +3, +4, +5; the next is +6. Six places after P is V.",
      },
    },
    {
      id: "three-boxes",
      correct: 0,
      it: {
        category: "Enigma delle scatole",
        prompt:
          "Il premio è in una scatola. A dice: «È nella B». B dice: «Non è nella B». C dice: «Non è nella A». Se esattamente una frase è vera, dov'è il premio?",
        options: ["Nella A", "Nella B", "Nella C", "Non si può determinare"],
        explanation:
          "Se il premio è in A, solo la frase di B è vera. Se è in B, sono vere A e C; se è in C, sono vere B e C. L'unico caso con una sola frase vera è A.",
      },
      en: {
        category: "The three-box puzzle",
        prompt:
          "A prize is in one box. A says, “It is in B.” B says, “It is not in B.” C says, “It is not in A.” If exactly one statement is true, where is the prize?",
        options: ["In A", "In B", "In C", "It cannot be determined"],
        explanation:
          "If the prize is in A, only B's statement is true. If it is in B, A and C are true; if in C, B and C are true. Only A gives exactly one true statement.",
      },
    },
    {
      id: "machine-rate",
      correct: 1,
      it: {
        category: "Proporzioni e ritmo",
        prompt:
          "Tre macchine identiche producono 3 pezzi in 3 minuti. Quanto impiegano 9 macchine identiche a produrre 9 pezzi?",
        options: ["1 minuto", "3 minuti", "9 minuti", "27 minuti"],
        explanation:
          "Ogni macchina produce un pezzo in 3 minuti. Le 9 macchine lavorano insieme e producono 9 pezzi nello stesso intervallo: 3 minuti.",
      },
      en: {
        category: "Rates and proportions",
        prompt:
          "Three identical machines make 3 parts in 3 minutes. How long do 9 identical machines take to make 9 parts?",
        options: ["1 minute", "3 minutes", "9 minutes", "27 minutes"],
        explanation:
          "Each machine makes one part in 3 minutes. The 9 machines work simultaneously and make 9 parts in the same interval: 3 minutes.",
      },
    },
    {
      id: "combined-pipes",
      correct: 1,
      it: {
        category: "Tassi combinati",
        prompt:
          "Un rubinetto riempie una vasca in 6 ore e un altro in 3 ore. Quanto impiegano insieme, mantenendo costante il flusso?",
        options: ["1 ora", "2 ore", "3 ore", "4 ore"],
        explanation:
          "In un'ora riempiono rispettivamente 1/6 e 1/3 della vasca; insieme 1/2. Quindi servono 2 ore.",
      },
      en: {
        category: "Combined rates",
        prompt:
          "One tap fills a tank in 6 hours and another in 3 hours. How long do they take together at constant rates?",
        options: ["1 hour", "2 hours", "3 hours", "4 hours"],
        explanation:
          "In one hour they fill 1/6 and 1/3 of the tank, or 1/2 together. So they need 2 hours.",
      },
    },
    {
      id: "syllogism",
      correct: 2,
      it: {
        category: "Sillogismo",
        prompt:
          "Tutti i musicisti sono pazienti. Alcuni scrittori sono musicisti. Quale conclusione segue necessariamente?",
        options: [
          "Tutti gli scrittori sono pazienti",
          "Nessuno scrittore è paziente",
          "Alcuni scrittori sono pazienti",
          "Tutti i pazienti sono musicisti",
        ],
        explanation:
          "Gli scrittori che sono musicisti appartengono al gruppo dei pazienti; quindi almeno alcuni scrittori sono pazienti.",
      },
      en: {
        category: "Syllogism",
        prompt:
          "All musicians are patient. Some writers are musicians. Which conclusion necessarily follows?",
        options: [
          "All writers are patient",
          "No writers are patient",
          "Some writers are patient",
          "All patient people are musicians",
        ],
        explanation:
          "The writers who are musicians belong to the patient group, so at least some writers are patient.",
      },
    },
    {
      id: "paired-books",
      correct: 0,
      it: {
        category: "Combinatoria",
        prompt:
          "Cinque libri diversi vanno in fila su uno scaffale. Due libri specifici devono restare vicini. In quanti ordini si possono disporre?",
        options: ["48", "24", "36", "60"],
        explanation:
          "Considera i due libri vicini come un unico blocco: ci sono 4 elementi da ordinare (4! modi) e il blocco può essere invertito (×2). 4! × 2 = 48.",
      },
      en: {
        category: "Combinatorics",
        prompt:
          "Five different books are arranged on a shelf. Two particular books must stay next to each other. How many arrangements are possible?",
        options: ["48", "24", "36", "60"],
        explanation:
          "Treat the adjacent books as one block: there are 4 items to arrange (4! ways), and the block can be reversed (×2). 4! × 2 = 48.",
      },
    },
    {
      id: "switches-and-bulb",
      correct: 3,
      it: {
        category: "Strategia sperimentale",
        prompt:
          "Fuori da una stanza ci sono 3 interruttori; dentro c'è una lampadina. Puoi entrare nella stanza una sola volta. Come individui l'interruttore giusto?",
        options: [
          "Accendi un interruttore e poi entra",
          "Accendi tutti e tre e poi entra",
          "Prova gli interruttori a caso entrando ogni volta",
          "Lascia acceso il primo, poi spegnilo; accendi il secondo e controlla luce e calore",
        ],
        explanation:
          "La luce accesa identifica il secondo interruttore. Se è spenta ma la lampadina è calda, è il primo; se è spenta e fredda, è il terzo.",
      },
      en: {
        category: "Experimental strategy",
        prompt:
          "There are 3 switches outside a room and one bulb inside. You may enter the room only once. How can you identify the correct switch?",
        options: [
          "Turn one switch on, then enter",
          "Turn all three on, then enter",
          "Try switches at random, entering each time",
          "Leave the first on, then turn it off; turn the second on and check light and heat",
        ],
        explanation:
          "A lit bulb identifies the second switch. If it is off but warm, it is the first; if it is off and cold, it is the third.",
      },
    },
    {
      id: "square-differences",
      correct: 1,
      it: {
        category: "Sequenza di quadrati",
        prompt: "Completa: 1, 2, 6, 15, 31, 56, ...",
        options: ["86", "92", "96", "102"],
        explanation:
          "Le differenze sono 1, 4, 9, 16, 25: i quadrati da 1² a 5². La prossima è 6² = 36; 56 + 36 = 92.",
      },
      en: {
        category: "Square-difference sequence",
        prompt: "Complete the sequence: 1, 2, 6, 15, 31, 56, ...",
        options: ["86", "92", "96", "102"],
        explanation:
          "The differences are 1, 4, 9, 16, 25: the squares from 1² to 5². The next is 6² = 36; 56 + 36 = 92.",
      },
    },
    {
      id: "average-speed",
      correct: 0,
      it: {
        category: "Velocità media",
        prompt:
          "Un'auto percorre la stessa distanza all'andata a 60 km/h e al ritorno a 40 km/h. Qual è la velocità media sull'intero viaggio?",
        options: ["48 km/h", "50 km/h", "52 km/h", "60 km/h"],
        explanation:
          "Con distanze uguali si fa la media armonica: 2 × 60 × 40 ÷ (60 + 40) = 48 km/h.",
      },
      en: {
        category: "Average speed",
        prompt:
          "A car covers the same distance at 60 km/h going out and 40 km/h returning. What is its average speed for the whole trip?",
        options: ["48 km/h", "50 km/h", "52 km/h", "60 km/h"],
        explanation:
          "For equal distances, use the harmonic mean: 2 × 60 × 40 ÷ (60 + 40) = 48 km/h.",
      },
    },
  ],
};
