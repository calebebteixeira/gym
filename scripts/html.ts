// Renders workouts as self-contained HTML pages with inline CSS, so a file opens on its own when
// sent over WhatsApp. The page works without JavaScript; the only script is the set timer
// (`cronometro.ts`), added when a workout has timed sets. The only remote resources are the MuscleWiki videos, with MuscleWiki's
// watermark, played from this repository's copy or from musclewiki.com; the footer links to
// musclewiki.com.
import { nomeMusculo, type Exercicio } from './catalogo.ts'
import { corpo, spriteCorpo } from './corpo.ts'
import { cronometro } from './cronometro.ts'
import { duracaoEstimada, tempoDaSerie } from './duracao.ts'
import { copia, miniatura, type ExercicioMuscleWiki } from './musclewiki-dados.ts'
import type { ItemTreino, Plano, Treino } from './treino.ts'

export interface ItemResolvido {
  item: ItemTreino
  exercicio: Exercicio
  musclewiki?: ExercicioMuscleWiki
}

type Modelo = NonNullable<Treino['modelo']>

/** One tab of a multi-workout page. */
export interface Aba {
  dia: string
  slug: string
  treino: Treino
  itens: ItemResolvido[]
}

const entidades: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function esc(texto: string): string {
  return texto.replace(/[&<>"']/gu, (c) => entidades[c] ?? c)
}

// Sets and repetitions on one line to read at a glance; load and rest as tags below it.
function prescricao({ series, repeticoes, carga, descanso }: ItemTreino): string {
  const volume = [series === undefined ? '' : `${series} séries`, repeticoes ?? '']
    .filter(Boolean)
    .join(' × ')
  const etiquetas = [carga ?? '', descanso === undefined ? '' : `descanso ${descanso}`]
    .filter(Boolean)
    .map((texto) => `<span class="etiqueta">${esc(texto)}</span>`)
  return `${volume ? `<p class="item-prescricao">${esc(volume)}</p>` : ''}${
    etiquetas.length ? `<p class="item-etiquetas">${etiquetas.join('')}</p>` : ''
  }`
}

// Start button for a timed set. Rendered hidden: `cronometro.ts` shows it where scripts run.
function botaoCronometro({ repeticoes }: ItemTreino): string {
  const tempo = tempoDaSerie(repeticoes)
  if (!tempo) return ''
  return `<button class="cronometro" type="button" hidden data-minimo="${tempo.minimo}" data-maximo="${tempo.maximo}">▶ Iniciar ${tempo.maximo} s</button>`
}

// One checkbox per set to tick off while training. No JavaScript: the browser keeps the state
// while the page stays open, and CSS marks the card once every set is ticked.
function series({ series: total }: ItemTreino): string {
  if (total === undefined || total < 1) return ''
  const caixas = Array.from(
    { length: total },
    (_, i) =>
      `<label class="serie"><input class="serie-caixa" type="checkbox" aria-label="Série ${i + 1} feita"><span class="serie-num" aria-hidden="true">${i + 1}</span></label>`,
  )
  return `<div class="series" role="group" aria-label="Séries feitas">${caixas.join('')}</div>`
}

function musculos(ids: string[]): string {
  return ids.map((id) => esc(nomeMusculo(id))).join(', ')
}

function campo(rotulo: string, valor: string | undefined): string {
  return valor ? `<dt>${esc(rotulo)}</dt><dd>${esc(valor)}</dd>` : ''
}

// Browsers autoplay a video without JavaScript only when it is muted and, on iOS, `playsinline`.
// `#t=0.1` paints the first frame where autoplay is blocked (iOS Low Power Mode, data saver).
// Two sources: this repository's copy first, then musclewiki.com, which the browser tries when the
// copy does not load. MuscleWiki alone is not reliable: it serves other sites only while its CDN
// has the file cached.
function video(mw: ItemResolvido['musclewiki'], modelo: Modelo): string {
  const original = mw?.videos[modelo].front ?? mw?.videos[modelo].side
  if (!original) return ''
  const fontes = [copia(original), original]
    .filter((url) => url !== undefined)
    .map((url) => `<source src="${esc(url)}#t=0.1" type="video/mp4">`)
  const capa = miniatura(original)
  return `<video class="item-video"${capa ? ` poster="${esc(capa)}"` : ''} controls autoplay muted loop playsinline>${fontes.join('')}</video>`
}

// Thumbnails of a workout's exercises, each a link to its card: a strip to swipe on a phone, a
// sidebar on a wide screen.
function galeria(itens: ItemResolvido[], modelo: Modelo, prefixo: string): string {
  const links = itens.map(({ exercicio: e, musclewiki: mw }, i) => {
    const original = mw?.videos[modelo].front ?? mw?.videos[modelo].side
    const capa = original ? miniatura(original) : undefined
    const foto = capa
      ? `<img class="galeria-foto" src="${esc(capa)}" alt="" width="480" height="270" loading="lazy" decoding="async">`
      : '<span class="galeria-foto"></span>'
    return `<a class="galeria-item" href="#${prefixo}-${i + 1}"><span class="galeria-quadro">${foto}<span class="galeria-num">${i + 1}</span></span><span class="galeria-nome">${esc(e.nome_pt)}</span></a>`
  })
  return `<nav class="galeria" aria-label="Exercícios do treino">${links.join('')}</nav>`
}

function passos(mw: ItemResolvido['musclewiki']): string {
  if (!mw?.passos.length) return ''
  const itens = mw.passos.map((passo) => `<li>${esc(passo)}</li>`).join('')
  return `<details class="item-detalhes">
    <summary>Como fazer</summary>
    <ol>${itens}</ol>
  </details>`
}

function cartao(
  { item, exercicio: e, musclewiki: mw }: ItemResolvido,
  modelo: Modelo,
  nivel: 2 | 3,
  id: string,
): string {
  return `<li class="item" id="${id}">
  <div class="item-cabeca">
  <h${nivel} class="item-nome">${esc(e.nome_pt)}</h${nivel}>
  <p class="item-meta">${esc(e.equipamento)} · ${esc(e.nivel)}</p>
  </div>
  ${video(mw, modelo)}
  <div class="item-conteudo">
  ${corpo(e, modelo)}
  ${prescricao(item)}
  ${item.obs ? `<p class="item-obs">${esc(item.obs)}</p>` : ''}
  ${botaoCronometro(item)}
  ${series(item)}
  ${passos(mw)}
  <p class="item-musculos"><strong>Músculos principais:</strong> ${musculos(e.musculos.agonistas_primarios)}</p>
  <details class="item-detalhes">
    <summary>Detalhes</summary>
    <dl>
      ${campo('Nome em inglês', e.nome_en)}
      ${campo('Padrão de movimento', e.padrao_movimento)}
      ${campo('Contração', e.tipo_contracao)}
      ${campo('Lateralidade', e.lateralidade)}
      ${campo('Pegada', e.pegada)}
      ${campo('Ações articulares', e.acoes_articulares)}
      <dt>Sinergistas</dt><dd>${musculos(e.musculos.sinergistas)}</dd>
      <dt>Estabilizadores</dt><dd>${musculos(e.musculos.estabilizadores)}</dd>
      ${campo('Notas', e.notas)}
    </dl>
  </details>
  </div>
</li>`
}

const css = `
:root {
  color-scheme: light dark;
  --cor-fundo: #f6f7f8;
  --cor-cartao: #fff;
  --cor-texto: #16191c;
  --cor-suave: #5b6570;
  --cor-destaque: #00805a;
  --cor-borda: #dde1e5;
  --cor-sobre-destaque: #fff;
  --corpo-contorno: #2b3038;
  --corpo-musculo: #c3c8d0;
  --nivel-1: #f2c200;
  --nivel-2: #f07800;
  --nivel-3: #d70015;
  --fonte-base: 1rem;
  --fonte-pequena: 0.875rem;
  --fonte-mini: 0.75rem;
  --fonte-titulo: 1.5rem;
  --fonte-item: 1.125rem;
  --raio: 12px;
  /* Height of whatever sticks to the top of the page (the tab bar). */
  --topo: 0rem;
}
@media (prefers-color-scheme: dark) {
  :root {
    --cor-fundo: #101214;
    --cor-cartao: #1a1d20;
    --cor-texto: #eceff1;
    --cor-suave: #9aa4ad;
    --cor-destaque: #3ecf8e;
    --cor-borda: #2c3135;
    --cor-sobre-destaque: #0b1a13;
    --corpo-contorno: var(--cor-suave);
    --corpo-musculo: #59616c;
    --nivel-1: #ffd60a;
    --nivel-2: #ff9500;
    --nivel-3: #ff3b30;
  }
}
* { box-sizing: border-box; }
html { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
body {
  --margem: 0.75rem;
  margin: 0;
  padding-block: var(--margem) calc(2rem + env(safe-area-inset-bottom));
  padding-inline: max(var(--margem), env(safe-area-inset-left)) max(var(--margem), env(safe-area-inset-right));
  font: var(--fonte-base) / 1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--cor-fundo);
  color: var(--cor-texto);
  overflow-wrap: anywhere;
  -webkit-tap-highlight-color: transparent;
}
@media (min-width: 40rem) {
  body { --margem: 1.5rem; }
}
.pagina { max-inline-size: 40rem; margin-inline: auto; }
.sprite { position: absolute; inline-size: 0; block-size: 0; overflow: hidden; }
.rodape {
  max-inline-size: 40rem;
  margin: 1.5rem auto 0;
  font-size: var(--fonte-pequena);
  color: var(--cor-suave);
  & a { color: inherit; }
}
.aba-radio { position: absolute; opacity: 0; pointer-events: none; }
.abas {
  position: sticky;
  inset-block-start: 0;
  z-index: 1;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 0.25rem;
  margin-inline: calc(-1 * var(--margem));
  margin-block-end: 1rem;
  padding-block: calc(0.5rem + env(safe-area-inset-top)) 0.5rem;
  padding-inline: var(--margem);
  background: var(--cor-fundo);
  border-block-end: 1px solid var(--cor-borda);
}
.aba {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-inline-size: 0;
  min-block-size: 3.25rem;
  padding: 0.375rem 0.125rem;
  background: var(--cor-cartao);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  line-height: 1.2;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
}
.aba-dia { font-weight: 700; }
.aba-nome {
  max-inline-size: 100%;
  overflow: hidden;
  font-size: var(--fonte-mini);
  color: var(--cor-suave);
  overflow-wrap: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.treino { display: none; }
.duracao {
  margin-block: 0 0.25rem;
  font-size: var(--fonte-pequena);
  font-weight: 600;
  color: var(--cor-destaque);
}
.titulo { margin-block: 0 0.25rem; font-size: var(--fonte-titulo); }
.descricao { margin-block: 0 1rem; font-size: var(--fonte-pequena); color: var(--cor-suave); }
.lista { list-style: none; margin: 0; padding: 0; counter-reset: item; }
.abas ~ .treino { --topo: 4.5rem; }
/* Phone: a strip of thumbnails to swipe sideways. */
.galeria {
  display: flex;
  gap: 0.5rem;
  margin-inline: calc(-1 * var(--margem));
  margin-block-end: 1rem;
  padding-inline: var(--margem);
  padding-block-end: 0.5rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scroll-padding-inline: var(--margem);
}
.galeria-item {
  flex: 0 0 7.5rem;
  scroll-snap-align: start;
  font-size: var(--fonte-mini);
  line-height: 1.3;
  color: inherit;
  text-decoration: none;
  touch-action: manipulation;
}
.galeria-quadro { position: relative; display: block; }
.galeria-foto {
  display: block;
  inline-size: 100%;
  block-size: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: var(--cor-borda);
  border: 1px solid var(--cor-borda);
  border-radius: 8px;
}
.galeria-num {
  position: absolute;
  inset-block-start: 0.25rem;
  inset-inline-start: 0.25rem;
  min-inline-size: 1.25rem;
  padding-inline: 0.25rem;
  background: var(--cor-destaque);
  border-radius: 999px;
  font-weight: 700;
  text-align: center;
  color: var(--cor-sobre-destaque);
}
.galeria-nome {
  display: -webkit-box;
  margin-block-start: 0.25rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
/* Wide screen: the gallery becomes a sidebar that stays in view beside the cards. */
@media (min-width: 62rem) {
  .pagina, .rodape { max-inline-size: 58rem; }
  .treino-corpo {
    display: grid;
    grid-template-columns: 15rem minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }
  .galeria {
    position: sticky;
    inset-block-start: calc(var(--topo) + 0.75rem);
    flex-direction: column;
    max-block-size: calc(100dvh - var(--topo) - 1.5rem);
    margin: 0;
    padding: 0;
    padding-inline-end: 0.25rem;
    overflow: hidden auto;
  }
  .galeria-item {
    display: grid;
    flex: none;
    grid-template-columns: 6.5rem minmax(0, 1fr);
    gap: 0.5rem;
    align-items: center;
    font-size: var(--fonte-pequena);
  }
  .galeria-nome { margin: 0; -webkit-line-clamp: 3; line-clamp: 3; }
}
.item {
  scroll-margin-block-start: calc(var(--topo) + 0.5rem);
  counter-increment: item;
  margin-block-end: 0.75rem;
  padding: 1rem;
  background: var(--cor-cartao);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  & p { margin-block: 0.25rem 0; }
}
/* Name and level on one line, the video below at full width, then the text with the body map
   floated to the right so long text wraps under it. */
.item-cabeca {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.125rem 0.75rem;
  margin-block-end: 0.5rem;
  & .item-meta { margin: 0; white-space: nowrap; }
}
.item-conteudo { display: flow-root; margin-block-start: 0.5rem; }
.item-corpo {
  float: inline-end;
  inline-size: clamp(6.25rem, 32vw, 9.5rem);
  aspect-ratio: 1195 / 1140;
  margin-inline-start: 0.75rem;
  margin-block-end: 0.25rem;
}
.item-nome {
  margin: 0;
  font-size: var(--fonte-item);
  &::before { content: counter(item) '. '; color: var(--cor-destaque); }
}
.item-meta, .item-musculos { font-size: var(--fonte-pequena); color: var(--cor-suave); }
.item-prescricao { font-size: var(--fonte-item); font-weight: 700; line-height: 1.3; color: var(--cor-destaque); }
.item-etiquetas { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-block: 0.375rem 0.5rem; }
.etiqueta {
  padding: 0.125rem 0.5rem;
  background: var(--cor-fundo);
  border: 1px solid var(--cor-borda);
  border-radius: 999px;
  font-size: var(--fonte-pequena);
  font-weight: 600;
  white-space: nowrap;
}
.cronometro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 10rem;
  min-block-size: 2.75rem;
  margin-block-start: 0.75rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 2px solid var(--cor-destaque);
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--cor-destaque);
  cursor: pointer;
  touch-action: manipulation;
  &[hidden] { display: none; }
}
.cronometro-ativo { border-color: var(--cor-suave); color: var(--cor-texto); }
.cronometro-minimo {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: var(--cor-sobre-destaque);
}
.series { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-block-start: 0.75rem; }
.serie { position: relative; cursor: pointer; touch-action: manipulation; }
.serie-caixa {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  &:checked + .serie-num {
    background: var(--cor-destaque);
    border-color: var(--cor-destaque);
    color: var(--cor-sobre-destaque);
  }
  &:focus-visible + .serie-num { outline: 2px solid var(--cor-destaque); outline-offset: 2px; }
}
.serie-num {
  display: grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  border: 2px solid var(--cor-borda);
  border-radius: 50%;
  font-weight: 700;
  color: var(--cor-suave);
}
/* Every set ticked: the card is done. */
.item:has(.serie-caixa:checked):not(:has(.serie-caixa:not(:checked))) {
  border-color: var(--cor-destaque);
  & .item-nome::before { content: '✓ '; }
}
.item-video {
  display: block;
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  background: var(--cor-borda);
  border-radius: var(--raio);
}
.item-detalhes {
  font-size: var(--fonte-pequena);
  & summary { padding-block: 0.625rem; cursor: pointer; color: var(--cor-destaque); touch-action: manipulation; }
  & ol { margin-block: 0.25rem 0; padding-inline-start: 1.25rem; }
  & dt { margin-block-start: 0.5rem; font-weight: 600; }
  & dd { margin-inline-start: 0; color: var(--cor-suave); }
}
`

/** `prefixo` makes the card ids unique when a page holds several workouts. */
function conteudo(treino: Treino, itens: ItemResolvido[], nivel: 1 | 2, prefixo: string): string {
  const modelo = treino.modelo ?? 'male'
  return `<header>
<p class="duracao">Tempo total: cerca de ${duracaoEstimada(treino.itens)} min · ${itens.length} exercícios</p>
<h${nivel} class="titulo">${esc(treino.titulo)}</h${nivel}>
${treino.descricao ? `<p class="descricao">${esc(treino.descricao)}</p>` : ''}
</header>
<div class="treino-corpo">
${galeria(itens, modelo, prefixo)}
<ol class="lista">
${itens.map((item, i) => cartao(item, modelo, nivel === 1 ? 2 : 3, `${prefixo}-${i + 1}`)).join('\n')}
</ol>
</div>`
}

function documento(titulo: string, principal: string, modelos: Modelo[], cssExtra = ''): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f6f7f8" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101214" media="(prefers-color-scheme: dark)">
<title>${esc(titulo)}</title>
<style>${css}${cssExtra}</style>
</head>
<body>
${spriteCorpo(modelos)}
<main class="pagina">
${principal}
</main>
${principal.includes('class="cronometro"') ? `<script>(${cronometro.toString()})()</script>\n` : ''}<footer class="rodape">Vídeos: <a href="https://musclewiki.com">MuscleWiki</a> · Mapa muscular: <a href="https://github.com/PerspicaciousGuy/Open-Muscle-Map">Open Muscle Map</a></footer>
</body>
</html>
`
}

export function renderizar(treino: Treino, itens: ItemResolvido[]): string {
  return documento(treino.titulo, conteudo(treino, itens, 1, 'ex'), [treino.modelo ?? 'male'])
}

// Tabs without JavaScript: one radio per workout, placed before the tab bar and the workouts so
// `:checked ~` can show the matching workout and highlight its tab.
export function renderizarPlano(plano: Plano, abas: Aba[]): string {
  const radios = abas
    .map(
      (aba, i) =>
        `<input class="aba-radio aba-radio-${i}" type="radio" name="aba" id="aba-${esc(aba.slug)}"${
          i === 0 ? ' checked' : ''
        }>`,
    )
    .join('\n')
  const rotulos = abas
    .map(
      (aba, i) =>
        `<label class="aba aba-${i}" for="aba-${esc(aba.slug)}"><span class="aba-dia">${esc(
          aba.dia,
        )}</span><span class="aba-nome">${esc(aba.treino.titulo)}</span></label>`,
    )
    .join('\n')
  const secoes = abas
    .map(
      (aba, i) =>
        `<section class="treino treino-${i}">\n${conteudo(aba.treino, aba.itens, 2, aba.slug)}\n</section>`,
    )
    .join('\n')
  const cssAbas = abas
    .map(
      (_, i) => `
.aba-radio-${i}:checked ~ .treino-${i} { display: block; }
.aba-radio-${i}:checked ~ .abas .aba-${i} {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: var(--cor-sobre-destaque);
  & .aba-nome { color: inherit; }
}
.aba-radio-${i}:focus-visible ~ .abas .aba-${i} { outline: 2px solid var(--cor-destaque); outline-offset: 2px; }`,
    )
    .join('')
  return documento(
    plano.titulo,
    `<header class="plano">
<h1 class="titulo">${esc(plano.titulo)}</h1>
${plano.descricao ? `<p class="descricao">${esc(plano.descricao)}</p>` : ''}
</header>
${radios}
<nav class="abas" aria-label="Treinos">
${rotulos}
</nav>
${secoes}`,
    abas.map((aba) => aba.treino.modelo ?? 'male'),
    cssAbas,
  )
}
