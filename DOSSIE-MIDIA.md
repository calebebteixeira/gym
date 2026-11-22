# Dossiê: fontes de vídeo, GIF e imagem para os exercícios

Levantamento de 21/11/2026 sobre fontes de mídia para os exercícios de **kettlebell** e **barra fixa** do catálogo (`exercicios/`). A busca foi feita no GitHub e nas fontes que os repositórios apontam.

**Decisão atual: usar só o MuscleWiki.** As outras fontes ficam registradas aqui para uma próxima etapa.

## Situação do catálogo

- 146 exercícios: 115 de kettlebell e 31 de barra fixa.
- O MuscleWiki tem vídeo do exercício exato para **67**. Os outros **79** estão como `null` em `musclewiki/mapa.json`.
- Ordem de preferência: vídeo, depois GIF, depois imagem.

## Resumo

| Formato | Fonte                                              | Visual                                           | Licença                                                  | Serve?                              |
| ------- | -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- | ----------------------------------- |
| Vídeo   | **MuscleWiki**                                     | Pessoa real, de lado e de frente, homem e mulher | Grátis sem fins lucrativos, com marca e link             | **Sim, em uso**                     |
| Vídeo   | olwal/exercises.json-ai-visuals                    | Gerado por IA, clipes de cerca de 2s             | Restrita                                                 | Não: erra o movimento               |
| Vídeo   | ExerciseDB API, Vital Animations, RepDB Standard   | Animações MP4                                    | Pagas                                                    | Só se formos pagar                  |
| Vídeo   | wger                                               | Vídeos enviados pela comunidade                  | CC-BY-SA                                                 | Não: nenhum de kettlebell           |
| GIF     | **Gym visual** (via ExerciseDB e cópias no GitHub) | Boneco 3D com os músculos em vermelho            | 180px com crédito; acima disso, licença com a Gym visual | Melhor GIF, com ressalva de licença |
| Imagem  | **RepDB**                                          | Ilustração 512px, poses de início e pico         | Grátis com crédito                                       | Melhor imagem                       |
| Imagem  | yuhonas/free-exercise-db                           | Fotos de academia, 850×569, 2 poses              | Diz Unlicense, mas a origem das fotos é duvidosa         | Não                                 |

## Vídeo

### MuscleWiki (em uso)

- Páginas públicas `musclewiki.com/pt-br/exercise/<slug>`, lidas por `pnpm musclewiki`.
- Cada exercício tem 4 MP4: homem e mulher, de frente e de lado.
- Os termos permitem compartilhar vídeos e instruções sem fins lucrativos, com a marca e um link para musclewiki.com. A API oficial (`api.musclewiki.com`) é paga e as URLs de vídeo dela expiram em 15 minutos.
- Ponto fraco: falta cobertura para variações de barra (aberta, toalha, typewriter, toes to bar e outras) e para movimentos de kettlebell como turkish get-up, clean e halo.

### olwal/exercises.json-ai-visuals (IA)

- https://github.com/olwal/exercises.json-ai-visuals
- 873 vídeos gerados com Wan 2.2 a partir das fotos do wrkout/exercises.json, a mesma origem do free-exercise-db. Resolução 1024×768, cerca de 2,3s cada.
- O próprio autor diz que a licença é restrita porque as fotos de origem têm limitação de copyright.
- Quadros do turkish get-up: o kettlebell fica no chão e o movimento vira um agachamento. Não serve como guia.

### Pagas

- **ExerciseDB API** (https://github.com/ExerciseDB/exercisedb-api): diz ter 11.000+ exercícios e 15.000+ vídeos. O código é AGPL; os dados são vendidos.
- **Vital Animations / exercisedb-pro** (https://vitalanimations.com): 1.500+ animações MP4 em 1080p, compra única. O repositório no GitHub tem só o README.
- **RepDB Standard** (https://repdb.co/pricing): animações em loop para 551 dos 708 exercícios, fundo transparente. As prévias do repositório gratuito não podem ser usadas em produção (termo 6 da licença).

### wger

- https://github.com/wger-project/wger e API pública em `wger.de/api/v2/`.
- 979 exercícios: 46 com vídeo e 288 com imagem. Dos 18 de kettlebell, nenhum tem vídeo e 6 têm imagem.

## GIF

### Gym visual

Todos os repositórios de GIF que encontrei usam os mesmos GIFs da Gym visual (https://gymvisual.com), na numeração do ExerciseDB:

| Repositório                                            | GIFs  | Resolução | Observação                                                                           |
| ------------------------------------------------------ | ----- | --------- | ------------------------------------------------------------------------------------ |
| hasaneyldrm/exercises-dataset (23,9k★)                 | 1.324 | 180×180   | Cópia com autorização escrita da Gym visual. Dados em MIT, mídia com termos próprios |
| JahelCuadrado/ExerciseGymGifsDB                        | 1.323 | 360×360   | Organizado por músculo, cerca de 55 de kettlebell. Sem licença                       |
| omercotkd/exercises-gifs                               | 1.323 | 360×360   | Diz MIT, mas a mídia é da Gym visual                                                 |
| mohamedatef90/exercise-library                         | 1.112 | 180×180   | Sem licença                                                                          |
| API grátis do ExerciseDB (`oss.exercisedb.dev/api/v1`) | 1.500 | 180×180   | `gifUrl` em `static.exercisedb.dev`                                                  |

- Kettlebell: 41 exercícios no hasaneyldrm, incluindo swing, turkish get-up, windmill, bent press, clean, snatch, jerk, figure 8, renegade row e pistol.
- Barra fixa: pull-up em várias pegadas, chin-up, archer, L-pull-up, mixed grip, front lever, scapular pull-up, hanging leg raise e hanging oblique knee raise.
- Licença (NOTICE.md do hasaneyldrm): a mídia é © Gym visual. Só pode ser distribuída em 180×180 e sempre com o crédito "© Gym visual — https://gymvisual.com/". Clonar o repositório não dá licença; para outro uso valem os termos da Gym visual (https://gymvisual.com/content/3-terms-and-conditions-of-use).
- 180px fica pequeno no celular. Para usar maior, é preciso comprar a licença da Gym visual.

## Imagem

### RepDB

- https://github.com/RepDB/exercise-dataset (licença em `LICENSE-DATA.md`)
- 708 exercícios num único `exercises.json`, com instruções em inglês, alemão e espanhol.
- Imagens WebP de 512×512 num estilo uniforme, quase sempre em duas poses (`<slug>-start.webp` e `<slug>-peak.webp`).
- A busca por nome achou cerca de 98 exercícios ligados a kettlebell ou barra, sem auditoria. Entre eles: dead hang, toes to bar, commando pull-up, negativa, archer, front lever, L-sit suspenso, scapular pull-up, kickstand deadlift, tibialis raise, bottoms-up press, halo, carries, turkish get-up e Svend press.
- Licença gratuita: uso livre em sites e apps, inclusive comerciais, desde que haja um link visível "Exercise data by RepDB (repdb.co)". Não pode redistribuir como dataset nem usar as imagens em IA generativa.
- As imagens são geradas por IA, então pose e pegada precisam ser conferidas uma a uma.

### yuhonas/free-exercise-db

- https://github.com/yuhonas/free-exercise-db (2,2k★)
- 876 exercícios (56 de kettlebell), 2 fotos 850×569 por exercício, tiradas numa academia de fundo vermelho.
- Diz Unlicense, mas as fotos vêm do wrkout/exercises.json, e o autor do olwal/exercises.json-ai-visuals registra que elas têm limitação de copyright.

## Exemplos para comparar

Os mesmos exercícios em cada fonte. Os links do GitHub passam pelo jsDelivr, que entrega o tipo de arquivo certo para o navegador.

| Exercício         | MuscleWiki (vídeo)                                                                                    | Gym visual (GIF 360px)                                                                                                   | RepDB (imagem)                                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Swing             | [lado](https://musclewiki.com/api-next/videos/male-Kettlebells-kettlebell-swing-side.mp4)             | [GIF](https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/kettlebell-swing.gif)                      | [início](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/kettlebell-swing-start.webp), [pico](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/kettlebell-swing-peak.webp)                     |
| Turkish get-up    | não tem                                                                                               | [GIF](https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/glutes/kettlebell-turkish-get-up-squat-style.gif) | [início](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/kettlebell-turkish-get-ups-start.webp), [pico](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/kettlebell-turkish-get-ups-peak.webp) |
| Pull-up           | [lado](https://musclewiki.com/api-next/videos/male-bodyweight-pullup-side.mp4)                        | [GIF](https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/lats/pull-up.gif)                                 | [início](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/pull-up-start.webp), [pico](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/pull-up-peak.webp)                                       |
| Elevação na barra | [lado](https://musclewiki.com/api-next/videos/male-bodyweight-hanging-knee-raises-side.mp4) (joelhos) | [GIF](https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/hanging-leg-raise.gif)                        | [início](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/hanging-leg-raise-start.webp), [pico](https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/images/flat/hanging-leg-raise-peak.webp)                   |

## Se um dia formos além do MuscleWiki

1. Mapear os 79 exercícios sem vídeo contra a Gym visual e o RepDB, conferindo o movimento exato de cada um, como foi feito com o MuscleWiki.
2. Decidir sobre o GIF: 180px com crédito, ou comprar a licença da Gym visual para usar maior.
3. Atualizar o `AGENTS.md`, que hoje permite só os vídeos do MuscleWiki como mídia remota, e colocar nas páginas o crédito que cada fonte exige.
