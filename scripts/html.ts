// Renders one workout as a self-contained HTML page: inline CSS, no JavaScript, so the file opens
// on its own when sent over WhatsApp. The only remote resources are the MuscleWiki videos, which
// play from musclewiki.com with MuscleWiki's branding and a link back to the exercise page.
import { nomeMusculo, type Exercicio } from './catalogo.ts'
import { ORIGEM, type ExercicioMuscleWiki } from './musclewiki-dados.ts'
import type { ItemTreino, Treino } from './treino.ts'

export interface ItemResolvido {
  item: ItemTreino
  exercicio: Exercicio
  musclewiki?: ExercicioMuscleWiki & { aproximado: boolean }
}

type Modelo = NonNullable<Treino['modelo']>

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

function prescricao({ series, repeticoes, carga, descanso }: ItemTreino): string {
  const volume = [series === undefined ? '' : `${series} séries`, repeticoes ?? '']
    .filter(Boolean)
    .join(' × ')
  const partes = [volume, carga ?? '', descanso === undefined ? '' : `descanso ${descanso}`]
  return partes.filter(Boolean).map(esc).join(' · ')
}

function musculos(ids: string[]): string {
  return ids.map((id) => esc(nomeMusculo(id))).join(', ')
}

function campo(rotulo: string, valor: string | undefined): string {
  return valor ? `<dt>${esc(rotulo)}</dt><dd>${esc(valor)}</dd>` : ''
}

function video(mw: NonNullable<ItemResolvido['musclewiki']>, modelo: Modelo): string {
  const { front, side } = mw.videos[modelo]
  const src = front ?? side
  if (!src) return ''
  const pagina = `${ORIGEM}/pt-br/exercise/${mw.slug}?model=${modelo === 'male' ? 'm' : 'f'}`
  const aviso = mw.aproximado ? `Vídeo aproximado: ${mw.nome}. ` : ''
  // `#t=0.1` makes mobile browsers paint the first frame before playback.
  return `<figure class="item-video">
    <video src="${esc(src)}#t=0.1" controls muted loop playsinline preload="metadata"></video>
    <figcaption>${esc(aviso)}Vídeo: <a href="${esc(pagina)}">MuscleWiki</a>${
      front && side ? ` · <a href="${esc(side)}">vista lateral</a>` : ''
    }</figcaption>
  </figure>`
}

function passos(mw: ItemResolvido['musclewiki']): string {
  if (!mw?.passos.length) return ''
  const itens = mw.passos.map((passo) => `<li>${esc(passo)}</li>`).join('')
  return `<details class="item-detalhes">
    <summary>Como fazer${mw.aproximado ? ' (variação próxima)' : ''}</summary>
    <ol>${itens}</ol>
  </details>`
}

function cartao({ item, exercicio: e, musclewiki: mw }: ItemResolvido, modelo: Modelo): string {
  const linha = prescricao(item)
  return `<li class="item">
  <h2 class="item-nome">${esc(e.nome_pt)}</h2>
  <p class="item-meta">${esc(e.equipamento)} · ${esc(e.nivel)}</p>
  ${linha ? `<p class="item-prescricao">${linha}</p>` : ''}
  ${item.obs ? `<p class="item-obs">${esc(item.obs)}</p>` : ''}
  ${mw ? video(mw, modelo) : ''}
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
  --fonte-base: 1rem;
  --fonte-pequena: 0.875rem;
  --fonte-titulo: 1.5rem;
  --fonte-item: 1.125rem;
  --raio: 12px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --cor-fundo: #101214;
    --cor-cartao: #1a1d20;
    --cor-texto: #eceff1;
    --cor-suave: #9aa4ad;
    --cor-destaque: #3ecf8e;
    --cor-borda: #2c3135;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 1rem;
  font: var(--fonte-base) / 1.5 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--cor-fundo);
  color: var(--cor-texto);
}
.pagina { max-inline-size: 40rem; margin-inline: auto; }
.titulo { margin-block: 0 0.25rem; font-size: var(--fonte-titulo); }
.descricao { margin-block: 0 1rem; color: var(--cor-suave); }
.lista { list-style: none; margin: 0; padding: 0; counter-reset: item; }
.item {
  counter-increment: item;
  margin-block-end: 0.75rem;
  padding: 1rem;
  background: var(--cor-cartao);
  border: 1px solid var(--cor-borda);
  border-radius: var(--raio);
  & p { margin-block: 0.25rem 0; }
}
.item-nome {
  margin: 0;
  font-size: var(--fonte-item);
  &::before { content: counter(item) '. '; color: var(--cor-destaque); }
}
.item-meta, .item-musculos { font-size: var(--fonte-pequena); color: var(--cor-suave); }
.item-prescricao { font-weight: 600; color: var(--cor-destaque); }
.item-video {
  margin: 0.75rem 0 0;
  & video {
    display: block;
    inline-size: 100%;
    aspect-ratio: 16 / 9;
    background: var(--cor-borda);
    border-radius: var(--raio);
  }
  & figcaption { margin-block-start: 0.25rem; font-size: var(--fonte-pequena); color: var(--cor-suave); }
  & a { color: var(--cor-destaque); }
}
.item-detalhes {
  margin-block-start: 0.5rem;
  font-size: var(--fonte-pequena);
  & summary { cursor: pointer; color: var(--cor-destaque); }
  & ol { margin-block: 0.25rem 0; padding-inline-start: 1.25rem; }
  & dt { margin-block-start: 0.5rem; font-weight: 600; }
  & dd { margin-inline-start: 0; color: var(--cor-suave); }
}
`

export function renderizar(treino: Treino, itens: ItemResolvido[]): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(treino.titulo)}</title>
<style>${css}</style>
</head>
<body>
<main class="pagina">
<h1 class="titulo">${esc(treino.titulo)}</h1>
${treino.descricao ? `<p class="descricao">${esc(treino.descricao)}</p>` : ''}
<ol class="lista">
${itens.map((item) => cartao(item, treino.modelo ?? 'male')).join('\n')}
</ol>
</main>
</body>
</html>
`
}
