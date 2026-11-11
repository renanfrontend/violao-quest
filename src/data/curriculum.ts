import type { Sound } from '@/audio/engine';

/** [índice da corda (0 = 6ª), casa, é tônica?] */
export type Dot = [number, number, boolean?];
export type Visual = { chord?: string; pattern?: string; dots?: Dot[]; baseFret?: number; numFrets?: number; strings?: boolean };

export type Step =
  | { t: 'teach'; title: string; body: string; visual?: Visual; sound?: Sound }
  | { t: 'quiz'; q: string; options: string[]; a: number; visual?: Visual }
  | { t: 'ear'; q: string; sound: Sound; options: string[]; a: number }
  | { t: 'build'; chord: string }
  | { t: 'find'; pc: number; string: number; baseFret?: number; numFrets?: number }
  | { t: 'rhythm'; pattern: string; bpm: number; chord?: string };

export type Level = { id: string; title: string; icon: string; boss?: boolean; steps: Step[] };
export type World = { id: string; title: string; tier: 'Iniciante' | 'Intermediário' | 'Avançado'; color: string; dark: string; icon: string; levels: Level[] };

const teach = (title: string, body: string, visual?: Visual, sound?: Sound): Step => ({ t: 'teach', title, body, visual, sound });
const quiz = (q: string, options: string[], a: number, visual?: Visual): Step => ({ t: 'quiz', q, options, a, visual });
const ear = (q: string, sound: Sound, options: string[], a: number): Step => ({ t: 'ear', q, sound, options, a });
const build = (chord: string): Step => ({ t: 'build', chord });
const find = (pc: number, string: number, baseFret?: number, numFrets?: number): Step => ({ t: 'find', pc, string, baseFret, numFrets });
const rhythm = (pattern: string, bpm: number, chord?: string): Step => ({ t: 'rhythm', pattern, bpm, chord });
const chordCard = (name: string, title: string, body: string): Step => teach(title, body, { chord: name }, { chord: name });

const MAJOR_SCALE: Sound = { notes: [48, 50, 52, 53, 55, 57, 59, 60], gap: 260 };
const MINOR_SCALE: Sound = { notes: [45, 47, 48, 50, 52, 53, 55, 57], gap: 260 };
const C_MAJOR_DOTS: Dot[] = [[1, 3, true], [2, 0], [2, 2], [2, 3], [3, 0], [3, 2], [4, 0], [4, 1, true]];
const A_PENTA_DOTS: Dot[] = [[0, 5, true], [0, 8], [1, 5], [1, 7], [2, 5], [2, 7, true], [3, 5], [3, 7], [4, 5], [4, 8], [5, 5, true], [5, 8]];
const A_PENTA: Sound = { notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72], gap: 220 };

const RAW: Omit<World, 'levels'>[] = [
  { id: 'w1', title: 'Primeiros Passos', tier: 'Iniciante', color: '#34D399', dark: '#12946A', icon: '🌱' },
  { id: 'w2', title: 'Primeiros Acordes', tier: 'Iniciante', color: '#22D3EE', dark: '#0E93A8', icon: '🎵' },
  { id: 'w3', title: 'Ritmo e Levadas', tier: 'Intermediário', color: '#FFB627', dark: '#C4830B', icon: '🥁' },
  { id: 'w4', title: 'Dominando o Braço', tier: 'Intermediário', color: '#FB923C', dark: '#C2570C', icon: '🔥' },
  { id: 'w5', title: 'Escalas e Harmonia', tier: 'Avançado', color: '#A78BFA', dark: '#6D3FE0', icon: '🔮' },
  { id: 'w6', title: 'Mestre das Cordas', tier: 'Avançado', color: '#FB7185', dark: '#BE3654', icon: '👑' },
];

const LESSONS: Record<string, [string, string, Step[]][]> = {
  w1: [
    ['Conheça o violão', '🎸', [
      teach('As partes do violão', 'O CORPO amplifica o som pela BOCA. O BRAÇO é onde você pressiona as cordas. Na MÃO (a ponta do braço) ficam as TARRAXAS, que afinam cada corda. As cordas terminam no CAVALETE.'),
      teach('Trastes e casas', 'Os TRASTES são as barrinhas de metal no braço. O espaço entre dois trastes é uma CASA. Pressione sempre dentro da casa, bem perto do traste da frente: o som sai limpo e com menos esforço.'),
      quiz('Onde ficam as tarraxas?', ['No corpo', 'Na mão do violão', 'No cavalete'], 1),
      quiz('O que é uma casa?', ['O espaço entre dois trastes', 'A barrinha de metal', 'O furo do corpo'], 0),
      teach('Postura', 'Sente com a coluna reta, apoie a curva do violão na perna e mantenha o braço do instrumento levemente inclinado para cima. Para destros: a mão esquerda pressiona as cordas, a direita faz o ritmo. Ombros soltos!'),
      quiz('Para um destro, qual mão pressiona as cordas no braço?', ['Direita', 'Esquerda', 'As duas'], 1),
      quiz('Onde o dedo deve pressionar dentro da casa?', ['No meio da casa', 'Em cima do traste', 'Perto do traste da frente'], 2),
    ]],
    ['As seis cordas', '🧵', [
      teach('Da 6ª à 1ª', 'As cordas são numeradas de baixo para cima no som: a 6ª é a mais grossa e grave, a 1ª é a mais fina e aguda. Soltas, elas soam Mi, Lá, Ré, Sol, Si, Mi. Toque em ouvir!', { strings: true }, { notes: [40, 45, 50, 55, 59, 64], gap: 420 }),
      quiz('Qual é a corda mais grossa?', ['1ª corda', '3ª corda', '6ª corda'], 2),
      quiz('Qual nota soa a 5ª corda solta?', ['Lá', 'Ré', 'Sol'], 0),
      ear('Qual corda você ouviu?', { notes: [40] }, ['6ª (Mi grave)', '1ª (Mi agudo)', '3ª (Sol)'], 0),
      teach('Corda solta no diagrama', 'Nos desafios de braço, cada linha vertical é uma corda (6ª à esquerda). Para tocar uma corda SOLTA, toque na bolinha acima dela, no topo do diagrama.'),
      find(9, 5),
      find(2, 4),
      ear('E agora, qual corda?', { notes: [64] }, ['6ª (Mi grave)', '4ª (Ré)', '1ª (Mi agudo)'], 2),
    ]],
    ['Cifras e afinação', '🔤', [
      teach('O alfabeto do músico', 'As cifras usam letras: C = Dó, D = Ré, E = Mi, F = Fá, G = Sol, A = Lá, B = Si. Então as cordas soltas, da 6ª à 1ª, são E A D G B E.'),
      quiz('A cifra G representa qual nota?', ['Lá', 'Sol', 'Mi'], 1),
      quiz('E a cifra A?', ['Lá', 'Dó', 'Fá'], 0),
      quiz('Qual cifra representa Fá?', ['E', 'B', 'F'], 2),
      teach('Afinando', 'Abra Ferramentas > Afinador, toque a nota de referência de cada corda e gire a tarraxa até os dois sons ficarem iguais. Apertar a corda deixa o som mais agudo; afrouxar deixa mais grave. Afine sempre antes de tocar.'),
      quiz('Apertar a tarraxa (esticar a corda) deixa o som mais...', ['Grave', 'Agudo', 'Baixo em volume'], 1),
      ear('Qual corda solta é esta?', { notes: [50] }, ['5ª (Lá)', '4ª (Ré)', '2ª (Si)'], 1),
      quiz('As cordas soltas, da 6ª à 1ª, são:', ['E A D G B E', 'E B G D A E', 'C D E F G A'], 0),
    ]],
    ['Primeiras notas', '☝️', [
      teach('Cada casa sobe um degrau', 'Cada casa que você avança deixa a nota um SEMITOM mais aguda. Na 6ª corda: solta é Mi, na casa 1 é Fá, na casa 3 é Sol. Use a ponta do dedo e mantenha o polegar atrás do braço.', { dots: [[0, 1], [0, 3]] }, { notes: [40, 41, 43], gap: 450 }),
      find(5, 6),
      find(7, 6),
      quiz('Avançar uma casa deixa a nota quanto mais aguda?', ['Um tom', 'Um semitom', 'Uma oitava'], 1),
      teach('Na 5ª corda', 'A 5ª corda solta é Lá. Na casa 2 temos Si e na casa 3, Dó. Repare: entre Si e Dó existe só uma casa de distância.', { dots: [[1, 2], [1, 3]] }, { notes: [45, 47, 48], gap: 450 }),
      find(0, 5),
      find(11, 5),
      ear('A segunda nota é mais...', { notes: [40, 43], gap: 600 }, ['Aguda', 'Grave', 'Igual'], 0),
    ]],
    ['Sinta o pulso', '❤️', [
      teach('O pulso', 'Toda música tem um PULSO, como um coração batendo. No compasso 4/4, o mais comum, contamos 1, 2, 3, 4 e recomeçamos. O andamento é medido em BPM (batidas por minuto).'),
      quiz('Quantos tempos tem um compasso 4/4?', ['3', '4', '8'], 1),
      teach('Batida para baixo', 'Com o pulso relaxado, passe a mão pelas cordas de cima para baixo (↓) em cada tempo. No desafio, ouça a contagem e toque no botão exatamente em cada seta.', { pattern: 'D.D.D.D.' }),
      rhythm('D.D.D.D.', 70),
      quiz('O que significa BPM?', ['Batidas por minuto', 'Base para música', 'Braço, ponte e mão'], 0),
      rhythm('D.D.D.D.', 90),
    ]],
  ],
  w2: [
    ['Mi menor e Lá menor', '🌙', [
      teach('O que é um acorde?', 'Acorde é um grupo de três ou mais notas tocadas juntas. No diagrama, as linhas verticais são as cordas (6ª à esquerda), as bolinhas mostram onde pressionar, "○" é corda solta e "✕" é corda que não se toca.'),
      chordCard('Em', 'Mi menor (Em)', 'O acorde mais fácil: dois dedos na casa 2, nas cordas 5 e 4. Toque as seis cordas.'),
      build('Em'),
      chordCard('Am', 'Lá menor (Am)', 'Casa 2 nas cordas 4 e 3, casa 1 na corda 2. A 6ª corda não é tocada.'),
      build('Am'),
      quiz('O que significa "✕" em cima de uma corda?', ['Corda solta', 'Não tocar a corda', 'Fazer pestana'], 1),
      ear('Qual acorde é este?', { chord: 'Em' }, ['Em', 'Am'], 0),
      ear('E este?', { chord: 'Am' }, ['Em', 'Am'], 1),
    ]],
    ['Mi e Lá maiores', '☀️', [
      teach('Maior x menor', 'Acordes MAIORES soam abertos e alegres; os MENORES soam mais fechados e melancólicos. A cifra maior é só a letra (E); a menor leva um "m" (Em).'),
      chordCard('E', 'Mi maior (E)', 'É o Em com mais um dedo: casa 1 na 3ª corda.'),
      build('E'),
      chordCard('A', 'Lá maior (A)', 'Três dedos em fila na casa 2, nas cordas 4, 3 e 2.'),
      build('A'),
      ear('Este acorde é maior ou menor?', { chord: 'E' }, ['Maior', 'Menor'], 0),
      ear('E este?', { chord: 'Am' }, ['Maior', 'Menor'], 1),
      quiz('Como se escreve a cifra de Lá menor?', ['A', 'Am', 'a-'], 1),
    ]],
    ['Ré e Ré menor', '🌊', [
      chordCard('D', 'Ré maior (D)', 'Um triângulo nas três cordas mais finas. Toque só da 4ª corda para baixo.'),
      build('D'),
      chordCard('Dm', 'Ré menor (Dm)', 'Parecido com o D, mas a 1ª corda desce para a casa 1.'),
      build('Dm'),
      quiz('Quantas cordas tocamos no acorde D?', ['Seis', 'Cinco', 'Quatro'], 2),
      ear('Qual acorde é este?', { chord: 'D' }, ['D', 'Dm'], 0),
      ear('E este?', { chord: 'Dm' }, ['D', 'Dm'], 1),
    ]],
    ['Sol e Dó', '⛰️', [
      chordCard('G', 'Sol maior (G)', 'Abre a mão: casa 3 na 6ª corda, casa 2 na 5ª e casa 3 na 1ª.'),
      build('G'),
      chordCard('C', 'Dó maior (C)', 'Uma escadinha: casa 3 na 5ª corda, casa 2 na 4ª e casa 1 na 2ª. Não toque a 6ª.'),
      build('C'),
      ear('Qual acorde é este?', { chord: 'G' }, ['G', 'C', 'D'], 0),
      ear('E este?', { chord: 'C' }, ['G', 'C', 'D'], 1),
      quiz('Qual corda NÃO tocamos no acorde C?', ['6ª', '1ª', '3ª'], 0),
    ]],
    ['Troca de acordes', '🔁', [
      teach('Trocando sem parar', 'O segredo é trocar DEVAGAR e sem interromper o ritmo. Procure o "dedo guia": o dedo que fica no mesmo lugar ou anda pouco entre dois acordes. Mova todos os dedos juntos, como um bloco.'),
      quiz('O que é um dedo guia?', ['O polegar da mão direita', 'O dedo que quase não se move na troca', 'O dedo mais forte'], 1),
      rhythm('D.D.D.D.', 80, 'G'),
      teach('Sua primeira progressão', 'G, D, Em, C: quatro acordes que tocam centenas de músicas. Treine um compasso em cada um, sem pressa.', { chord: 'G' }, { chord: 'G' }),
      rhythm('D.DUD.DU', 80, 'C'),
      ear('Qual acorde é este?', { chord: 'Em' }, ['Em', 'G', 'C', 'D'], 0),
      ear('E este?', { chord: 'D' }, ['Em', 'G', 'C', 'D'], 3),
    ]],
  ],
  w3: [
    ['Baixo e cima', '↕️', [
      teach('O contratempo', 'Dividindo cada tempo em dois, contamos "1 e 2 e 3 e 4 e". A mão desce (↓) nos números e sobe (↑) nos "e". Ela nunca para: é um pêndulo.', { pattern: 'DUDUDUDU' }),
      rhythm('DUDUDUDU', 66, 'Em'),
      quiz('Em "1 e 2 e", a batida para cima cai...', ['Nos números', 'Nos "e"', 'Só no 4'], 1),
      teach('Deixando espaços', 'Ritmo bom tem respiração. A mão continua no pêndulo, mas em alguns momentos passa sem encostar nas cordas.', { pattern: 'D.DUD.DU' }),
      rhythm('D.DUD.DU', 76, 'Am'),
      quiz('Por que a mão direita se move como um pêndulo?', ['Para manter o tempo constante', 'Para tocar mais forte', 'Para descansar o braço'], 0),
    ]],
    ['A levada universal', '🌍', [
      teach('Baixo, baixo-cima, cima-baixo-cima', 'Esta é a levada mais usada do pop, rock e sertanejo. Repare no silêncio do 3º tempo: a mão desce sem tocar (a "mão fantasma").', { pattern: 'D.DU.UDU' }),
      rhythm('D.DU.UDU', 68, 'G'),
      quiz('Na levada universal, o que acontece no 3º tempo?', ['Batida forte para baixo', 'A mão desce sem tocar', 'A mão para'], 1),
      rhythm('D.DU.UDU', 82, 'Em'),
      quiz('O que é a "mão fantasma"?', ['Movimento que mantém o pêndulo sem soar', 'Abafar com a mão esquerda', 'Tocar com o polegar'], 0),
      rhythm('D.DU.UDU', 92, 'C'),
    ]],
    ['Acordes com sétima', '7️⃣', [
      teach('A sétima cria tensão', 'Acordes com 7 (A7, D7, E7, B7) soam "inacabados": eles pedem para resolver em outro acorde. E7 puxa para A, A7 puxa para D, D7 puxa para G.'),
      chordCard('A7', 'Lá com sétima (A7)', 'É o acorde A sem o dedo do meio: a 3ª corda fica solta.'),
      build('A7'),
      chordCard('E7', 'Mi com sétima (E7)', 'É o E com a 4ª corda solta.'),
      build('E7'),
      chordCard('D7', 'Ré com sétima (D7)', 'Um triângulo invertido em relação ao D.'),
      build('D7'),
      chordCard('B7', 'Si com sétima (B7)', 'Quatro dedos! Muito usado antes do Em e do E.'),
      build('B7'),
      ear('Qual destes você ouviu?', { chord: 'A7' }, ['A', 'A7'], 1),
      quiz('O acorde E7 "pede" para resolver em...', ['A', 'G', 'D'], 0),
    ]],
    ['Dedilhado', '🖐️', [
      teach('P, I, M, A', 'No dedilhado cada dedo da mão direita tem nome e função: P (polegar) toca os bordões (cordas 6, 5 e 4); I (indicador) toca a 3ª; M (médio) a 2ª; A (anelar) a 1ª.'),
      quiz('Qual dedo toca a 1ª corda?', ['P', 'M', 'A'], 2),
      quiz('O polegar (P) cuida de quais cordas?', ['6ª, 5ª e 4ª', '3ª, 2ª e 1ª', 'Só a 1ª'], 0),
      teach('Arpejo', 'Tocar as notas de um acorde uma a uma chama-se ARPEJO. Ouça o padrão P-I-M-A-M-I em Lá menor.', { chord: 'Am' }, { notes: [45, 57, 60, 64, 60, 57], gap: 300 }),
      ear('Este arpejo é de qual acorde?', { notes: [45, 57, 60, 64, 60, 57], gap: 280 }, ['Am', 'Em', 'D'], 0),
      ear('E este?', { notes: [40, 55, 59, 64, 59, 55], gap: 280 }, ['Am', 'Em', 'D'], 1),
      quiz('O que é um arpejo?', ['As notas do acorde tocadas uma a uma', 'Uma batida abafada', 'Um acorde com pestana'], 0),
    ]],
    ['O temido Fá', '🧗', [
      teach('Pestana', 'Na PESTANA o indicador deita e pressiona várias cordas na mesma casa. Dicas: use a lateral mais dura do dedo, fique bem perto do traste, polegar atrás do braço e cotovelo junto ao corpo.'),
      chordCard('F', 'Fá maior (F)', 'Pestana na casa 1 e o formato do E montado à frente. Dói no começo, e é normal: força vem com dias de treino curto.'),
      build('F'),
      quiz('O que é uma pestana?', ['Um dedo pressionando várias cordas na mesma casa', 'Tocar só as cordas graves', 'Abafar as cordas'], 0),
      ear('Qual acorde é este?', { chord: 'F' }, ['F', 'C', 'Em'], 0),
      rhythm('D.DU.UDU', 74, 'F'),
    ]],
  ],
  w4: [
    ['Notas nos bordões', '🧭', [
      teach('A escala cromática', 'Subindo casa a casa: Mi, Fá, Fá#, Sol, Sol#, Lá, Lá#, Si, Dó, Dó#, Ré, Ré#, Mi. Atenção: NÃO existe sustenido entre Mi e Fá nem entre Si e Dó. Saber as notas das cordas 6 e 5 é a chave para as pestanas.'),
      find(7, 6),
      find(9, 6),
      find(0, 5),
      find(2, 5),
      find(11, 5),
      quiz('Qual a distância entre Si e Dó?', ['Um tom', 'Um semitom', 'Dois tons'], 1),
      quiz('Na 6ª corda, a casa 5 é a nota...', ['Sol', 'Lá', 'Si'], 1),
    ]],
    ['Pestana formato E', '🅴', [
      teach('Um formato, doze acordes', 'O formato do E com pestana desliza pelo braço. A nota da pestana na 6ª corda dá o nome: casa 1 = F, casa 3 = G, casa 5 = A. O formato do Em faz o mesmo para os menores.', { chord: 'G (pestana)' }, { chord: 'G (pestana)' }),
      build('G (pestana)'),
      chordCard('Fm', 'Fá menor (Fm)', 'Pestana na casa 1 com o formato do Em.'),
      build('Fm'),
      quiz('Formato E com pestana na casa 5 dá qual acorde?', ['G', 'A', 'B'], 1),
      quiz('Formato Em com pestana na casa 3 dá...', ['Gm', 'Fm', 'Am'], 0),
    ]],
    ['Pestana formato A', '🅰️', [
      teach('Tônica na 5ª corda', 'Os formatos do A e do Am também deslizam, agora com a nota principal na 5ª corda: casa 2 = B, casa 3 = C, casa 5 = D.'),
      chordCard('Bm', 'Si menor (Bm)', 'Pestana na casa 2 com o formato do Am. Aparece em muitas músicas em Ré e Sol.'),
      build('Bm'),
      chordCard('B', 'Si maior (B)', 'Pestana na casa 2 com o formato do A.'),
      build('B'),
      ear('Qual acorde é este?', { chord: 'Bm' }, ['Bm', 'B'], 0),
      quiz('Formato Am com pestana na casa 3 dá...', ['Bm', 'Cm', 'Dm'], 1),
    ]],
    ['Power chords', '⚡', [
      teach('Só tônica e quinta', 'O power chord tem apenas duas notas diferentes: a tônica e a quinta. Sem a terça, ele não é maior nem menor, e soa firme e pesado. É a base do rock.'),
      chordCard('E5', 'E5', 'Só as três cordas graves.'),
      build('E5'),
      chordCard('A5', 'A5', 'O mesmo desenho, começando na 5ª corda.'),
      build('A5'),
      chordCard('G5', 'G5', 'Formato móvel: indicador na casa 3, os outros na casa 5.'),
      build('G5'),
      rhythm('DDDDDDDD', 90, 'E5'),
      quiz('Um power chord é formado por...', ['Tônica e terça', 'Tônica e quinta', 'Terça e sétima'], 1),
    ]],
    ['Tom e semitom', '📏', [
      teach('As réguas da música', 'SEMITOM = 1 casa. TOM = 2 casas. O sustenido (#) sobe a nota um semitom; o bemol (b) desce um semitom. Por isso Fá# e Solb são a mesma casa.'),
      quiz('De Dó a Ré temos...', ['Um semitom', 'Um tom', 'Dois tons'], 1),
      quiz('De Mi a Fá temos...', ['Um semitom', 'Um tom', 'Três casas'], 0),
      find(6, 6),
      find(1, 5),
      quiz('O que o bemol (b) faz com a nota?', ['Sobe um semitom', 'Desce um semitom', 'Dobra a duração'], 1),
      quiz('Um tom corresponde a quantas casas?', ['1', '2', '3'], 1),
    ]],
  ],
  w5: [
    ['Escala maior', '🪜', [
      teach('Tom, Tom, Semitom...', 'A escala maior segue sempre a fórmula T T S T T T S. Partindo de Dó: Dó, Ré, Mi, Fá, Sol, Lá, Si, Dó (nenhum sustenido).', { dots: C_MAJOR_DOTS }, MAJOR_SCALE),
      quiz('Qual é a fórmula da escala maior?', ['T S T T S T T', 'T T S T T T S', 'T T T S T T S'], 1),
      quiz('Quantas notas diferentes tem a escala maior?', ['5', '7', '12'], 1),
      quiz('A escala de Sol maior tem qual nota alterada?', ['Fá#', 'Dó#', 'Sib'], 0),
      ear('Esta escala é maior ou menor?', MAJOR_SCALE, ['Maior', 'Menor'], 0),
      ear('E esta?', MINOR_SCALE, ['Maior', 'Menor'], 1),
    ]],
    ['Pentatônica menor', '🎯', [
      teach('Cinco notas que não erram', 'A pentatônica menor é a escala dos solos de rock e blues. Este é o desenho 1 em Lá: começa na casa 5 e usa só duas notas por corda.', { dots: A_PENTA_DOTS, baseFret: 5, numFrets: 4 }, A_PENTA),
      quiz('Quantas notas tem uma escala pentatônica?', ['5', '6', '7'], 0),
      find(9, 6, 5, 4),
      find(0, 6, 5, 4),
      find(2, 5, 5, 4),
      quiz('Quais são as notas da pentatônica menor de Lá?', ['Lá Si Dó Ré Mi', 'Lá Dó Ré Mi Sol', 'Lá Dó# Mi Fá# Sol'], 1),
    ]],
    ['Intervalos', '📐', [
      teach('Distância entre notas', 'Intervalo é a distância entre duas notas. Terça menor = 3 semitons; terça maior = 4; quinta justa = 7; oitava = 12. A TERÇA é quem decide se um acorde é maior ou menor.'),
      ear('Que intervalo é este?', { notes: [48, 55], gap: 600 }, ['Terça maior', 'Quinta justa', 'Oitava'], 1),
      ear('E este?', { notes: [48, 60], gap: 600 }, ['Terça maior', 'Quinta justa', 'Oitava'], 2),
      ear('E este?', { notes: [48, 52], gap: 600 }, ['Terça maior', 'Quinta justa', 'Oitava'], 0),
      quiz('Quantos semitons tem uma terça menor?', ['3', '4', '7'], 0),
      quiz('Qual intervalo define se o acorde é maior ou menor?', ['A quinta', 'A terça', 'A oitava'], 1),
    ]],
    ['Campo harmônico', '🗺️', [
      teach('A família de acordes', 'Empilhando notas da escala maior nascem sete acordes que combinam entre si. Em Dó: C, Dm, Em, F, G, Am e Bº. Em graus: I, ii, iii, IV, V, vi, vii°. Os graus I, IV e V são maiores.'),
      quiz('Qual é o ii grau de Dó maior?', ['Dm', 'D', 'Em'], 0),
      quiz('E o V grau?', ['F', 'G', 'Am'], 1),
      quiz('E o vi grau (a relativa menor)?', ['Em', 'Dm', 'Am'], 2),
      quiz('No campo de Sol maior (G Am Bm C D Em F#º), o IV grau é...', ['C', 'D', 'Bm'], 0),
      quiz('Quais graus do campo maior são acordes maiores?', ['I, IV e V', 'ii, iii e vi', 'I, iii e V'], 0),
    ]],
    ['Progressões famosas', '🚀', [
      teach('I, V, vi, IV', 'Em Dó: C, G, Am, F. É a progressão de milhares de sucessos. Outras clássicas: I-IV-V (blues e rock) e ii-V-I (jazz e bossa).'),
      quiz('A progressão I-V-vi-IV em Sol é...', ['G D Em C', 'G C D Em', 'G Am C D'], 0),
      rhythm('D.DU.UDU', 88, 'C'),
      quiz('ii-V-I em Dó maior é...', ['Em Am Dm', 'Dm G C', 'F G C'], 1),
      rhythm('D.DU.UDU', 100, 'G'),
      quiz('I-IV-V em Lá maior é...', ['A D E', 'A C D', 'A Bm E'], 0),
    ]],
  ],
  w6: [
    ['Tétrades', '💎', [
      teach('Acordes de quatro notas', 'Somando a sétima à tríade surgem as tétrades: maj7 (sétima maior, som sofisticado), m7 (menor suave) e 7 (dominante, tenso). São a cor da bossa nova, do jazz e da MPB.'),
      chordCard('Cmaj7', 'Cmaj7', 'É o C com a 2ª corda solta.'),
      build('Cmaj7'),
      chordCard('Am7', 'Am7', 'É o Am com a 3ª corda solta.'),
      build('Am7'),
      chordCard('Dm7', 'Dm7', 'Uma pestaninha de dois dedos na casa 1.'),
      build('Dm7'),
      chordCard('G7', 'G7', 'O G com a 1ª corda na casa 1.'),
      build('G7'),
      ear('Qual destes você ouviu?', { chord: 'Cmaj7' }, ['C', 'Cmaj7'], 1),
    ]],
    ['Menor e modos', '🌗', [
      teach('Escala menor natural', 'Fórmula: T S T T S T T. Toda escala maior tem uma RELATIVA MENOR que usa as mesmas notas, começando no 6º grau: Dó maior e Lá menor são relativas.', undefined, MINOR_SCALE),
      quiz('Qual é a relativa menor de Dó maior?', ['Mi menor', 'Lá menor', 'Ré menor'], 1),
      quiz('E a relativa menor de Sol maior?', ['Mi menor', 'Si menor', 'Lá menor'], 0),
      teach('Os sete modos', 'Começando a escala maior em cada grau surgem os modos: Jônio (1º), Dórico (2º), Frígio (3º), Lídio (4º), Mixolídio (5º), Eólio (6º) e Lócrio (7º). Cada um tem uma cor própria.'),
      quiz('O modo Dórico começa em qual grau da escala maior?', ['2º', '4º', '5º'], 0),
      quiz('E o Mixolídio?', ['3º', '5º', '7º'], 1),
      ear('Esta escala é maior ou menor?', MINOR_SCALE, ['Maior', 'Menor'], 1),
    ]],
    ['Técnicas expressivas', '✨', [
      teach('Ligados', 'HAMMER-ON: você palheta uma nota e "martela" outro dedo numa casa acima, sem palhetar de novo. PULL-OFF é o inverso: puxa o dedo para soar a nota de baixo.'),
      quiz('No hammer-on, a segunda nota soa porque...', ['Você palheta de novo', 'Um dedo martela a corda', 'A corda é abafada'], 1),
      teach('Slide, bend e vibrato', 'SLIDE: desliza o dedo pressionado até outra casa. BEND: empurra a corda para subir a afinação. VIBRATO: pequenas oscilações que fazem a nota "cantar".'),
      quiz('Que técnica sobe a afinação empurrando a corda?', ['Slide', 'Bend', 'Pull-off'], 1),
      quiz('Deslizar o dedo de uma casa a outra sem soltar é...', ['Slide', 'Vibrato', 'Hammer-on'], 0),
      quiz('O pull-off faz soar uma nota...', ['Mais aguda', 'Mais grave', 'Igual'], 1),
    ]],
    ['Sistema CAGED', '🧩', [
      teach('Cinco formatos, o braço inteiro', 'Os formatos abertos de C, A, G, E e D podem ser deslocados com pestana e se encaixam um no outro ao longo do braço. Com isso você toca qualquer acorde em cinco regiões diferentes.'),
      quiz('Formato E com pestana na casa 3 é o acorde...', ['G', 'F', 'A'], 0),
      quiz('Formato A com pestana na casa 3 é o acorde...', ['B', 'C', 'D'], 1),
      build('G (pestana)'),
      build('C#m'),
      quiz('O que significa a sigla CAGED?', ['Os cinco formatos de acorde: C, A, G, E, D', 'Uma escala de cinco notas', 'Uma afinação alternativa'], 0),
    ]],
    ['Improvisação', '🎤', [
      teach('Conte uma história', 'Improvisar não é tocar muitas notas: é criar frases. Use pergunta e resposta, repita ideias com pequenas variações, deixe silêncios e termine as frases em notas do acorde (as notas-alvo).'),
      quiz('O que são notas-alvo?', ['Notas fora da escala', 'Notas do acorde que está soando', 'As notas mais agudas'], 1),
      teach('Blues em Lá', 'Doze compassos com A7, D7 e E7. Por cima, a pentatônica menor de Lá na casa 5 funciona do início ao fim.', { dots: A_PENTA_DOTS, baseFret: 5, numFrets: 4 }, A_PENTA),
      ear('Qual acorde do blues é este?', { chord: 'E7' }, ['A7', 'D7', 'E7'], 2),
      rhythm('D.DUD.DU', 96, 'A7'),
      find(0, 6, 5, 4),
      quiz('Qual escala combina com um blues em Lá?', ['Pentatônica menor de Lá', 'Escala maior de Fá', 'Pentatônica de Mib'], 0),
    ]],
  ],
};

export const WORLDS: World[] = RAW.map((w) => {
  const levels: Level[] = LESSONS[w.id].map(([title, icon, steps], i) => ({ id: `${w.id}-${i + 1}`, title, icon, steps }));
  levels.push({ id: `${w.id}-boss`, title: `Desafio: ${w.title}`, icon: '🏆', boss: true, steps: [] });
  return { ...w, levels };
});

export const ALL_LEVELS: Level[] = WORLDS.flatMap((w) => w.levels);

export function findLevel(id: string): { level: Level; world: World } | undefined {
  for (const world of WORLDS) {
    const level = world.levels.find((l) => l.id === id);
    if (level) return { level, world };
  }
}

/** Fase liberada quando a anterior já foi concluída. */
export function isUnlocked(id: string, stars: Record<string, number>): boolean {
  const i = ALL_LEVELS.findIndex((l) => l.id === id);
  return i <= 0 || (stars[ALL_LEVELS[i - 1].id] ?? 0) > 0;
}

/** O desafio do mundo sorteia exercícios das aulas dele. */
export function stepsFor(level: Level, world: World): Step[] {
  if (!level.boss) return level.steps;
  const pool = world.levels.flatMap((l) => l.steps).filter((s) => s.t !== 'teach');
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 9);
}
