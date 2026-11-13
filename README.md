# 🎸 Violão Quest

Aulas de violão do iniciante ao avançado em formato de jogo: mapa de fases, vidas, combos, estrelas, XP, sequência diária e conquistas. Feito com React Native + Expo, roda em Android, iOS e web com o mesmo código.

**Jogue no navegador:** https://violao-quest-xi.vercel.app

## O que tem no jogo

- **6 mundos, 36 fases**, cada mundo fechando com um desafio que sorteia exercícios das aulas anteriores.
- **Seis tipos de etapa**
  - Aprenda: explicação curta com diagrama e botão de ouvir
  - Pergunta: múltipla escolha
  - De ouvido: identifique corda, acorde, intervalo ou escala pelo som
  - Monte o acorde: coloque os dedos no braço e verifique
  - Encontre a nota: toque na casa certa
  - Ritmo: toque a levada no tempo, com contagem e avaliação de cada batida
- **Sistema de jogo**: 3 vidas por aula, combo, até 3 estrelas, XP, níveis com títulos (Aprendiz → Lenda das Cordas), sequência de dias e 10 conquistas. Quem erra revê o exercício no fim da aula.
- **Dicionário de acordes** com 27 acordes (abertos, sétimas, pestanas, power chords e tétrades), todos tocáveis.
- **Ferramentas**: afinador de referência (toca a nota de cada corda) e metrônomo.
- Progresso salvo no aparelho, sem conta e sem internet.

### Trilha de aprendizado

| Mundo | Nível | Conteúdo |
| --- | --- | --- |
| 1. Primeiros Passos | Iniciante | Partes do violão, postura, cordas, cifras, afinação, primeiras notas, pulso |
| 2. Primeiros Acordes | Iniciante | Em, Am, E, A, D, Dm, G, C e troca de acordes |
| 3. Ritmo e Levadas | Intermediário | Batida baixo/cima, levada universal, acordes com sétima, dedilhado, Fá com pestana |
| 4. Dominando o Braço | Intermediário | Notas nos bordões, pestanas formato E e A, power chords, tom e semitom |
| 5. Escalas e Harmonia | Avançado | Escala maior, pentatônica menor, intervalos, campo harmônico, progressões |
| 6. Mestre das Cordas | Avançado | Tétrades, escala menor e modos, técnicas expressivas, CAGED, improvisação |

## Plano grátis e Premium

| | Grátis | Premium |
| --- | --- | --- |
| Mundos | 1 e 2 | 1 a 6 |
| Afinador e metrônomo | Sim | Sim |
| Dicionário de acordes | Acordes abertos | Os 27 acordes |
| Teste grátis | — | 7 dias, configurado nas lojas |

A assinatura só existe nos builds do EAS (`EXPO_PUBLIC_MONETIZATION=on` nos perfis do `eas.json`). O site na Vercel e o APK do GitHub Actions continuam com todo o conteúdo liberado.

O app apresenta o Premium depois da primeira aula concluída (uma vez), ao vencer o desafio do Mundo 2 e ao tocar numa fase ou num grupo de acordes premium. Na segunda aula concluída, ele pede permissão para o lembrete diário da sequência, às 19h, que também pode ser ligado no Perfil.

## Tecnologias

- **Expo SDK 58** + **React Native 0.88** + **React 19** + **TypeScript** (modo estrito)
- **Expo Router** (rotas por arquivos em `src/app`)
- **Reanimated 4** para as animações
- **Zustand** + **AsyncStorage** para estado e progresso persistente
- **react-native-svg** para os diagramas do braço
- **expo-audio** para o som e **expo-haptics** para a vibração
- **RevenueCat** (`react-native-purchases`) para a assinatura e **expo-notifications** para o lembrete diário

Os sons não dependem de nenhum arquivo externo: `scripts/gen-audio.mjs` sintetiza as 37 notas do violão (Mi grave até a 12ª casa da 1ª corda) e os efeitos, e gera os WAV em `assets/audio`.

## Como rodar

```bash
npm install
```

```bash
npm run web
```

```bash
npm run android
```

No celular, instale o Expo Go, rode `npm start` e leia o QR code. O Expo Go roda o jogo inteiro, mas não as compras: para testar a assinatura, use um build de desenvolvimento (veja abaixo).

Outros comandos:

```bash
npm run typecheck
```

```bash
npm run gen:audio
```

## Configurar a assinatura

1. **Lojas.** Crie as assinaturas mensal e anual num mesmo grupo. Na App Store, adicione uma oferta introdutória de teste grátis de 1 semana; no Google Play, uma oferta de teste grátis de 7 dias no plano base.
2. **RevenueCat.** Crie o projeto com os apps iOS (`com.renanfrontend.violaoquest`) e Android, o entitlement `premium` e a oferta atual com os pacotes Mensal e Anual.
3. **Chaves.** Defina `EXPO_PUBLIC_REVENUECAT_IOS_KEY` e `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` nas variáveis de ambiente do EAS (ou em `.env.local`, a partir do `.env.example`).
4. **Build de desenvolvimento.** `npx eas-cli@latest build --profile development --platform android` e, com o app instalado, `npx expo start --dev-client`.
5. **Antes de enviar às lojas.** Publique os Termos de Uso e a Política de Privacidade nas URLs de `src/billing/config.ts`; a tela de assinatura já aponta para elas.

Perfis do `eas.json`: `development` (build de desenvolvimento), `preview` (APK para testadores) e `production` (envio às lojas, com número de versão automático).

## Estrutura

```
src/
  app/                 telas (Expo Router)
    (tabs)/            Jornada, Acordes, Ferramentas, Perfil
    lesson/[id].tsx    motor das aulas
    paywall.tsx        tela de assinatura
  billing/             porta de pagamentos, adaptador RevenueCat e regras de acesso
  reminders/           lembrete diário (notificações locais)
  components/          braço interativo, etapas das aulas, botões
  data/                currículo, dicionário de acordes e o que é grátis ou premium
  audio/               motor de som e mapa dos samples
  store/               progresso do jogador e estado da assinatura
scripts/gen-audio.mjs  sintetizador dos sons
```

Para criar uma aula nova, basta acrescentar uma entrada em `src/data/curriculum.ts`: o mapa, o desbloqueio e o desafio do mundo se ajustam sozinhos.

## Limitações conhecidas

- O afinador toca a nota de referência; ele ainda não escuta o violão pelo microfone.
- Os desafios de ritmo e de acorde são feitos na tela, não detectam o instrumento real.
