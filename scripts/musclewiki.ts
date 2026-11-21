// Refreshes `musclewiki/cache.json` from the public MuscleWiki exercise pages for every slug in
// `musclewiki/mapa.json`. `pnpm gerar` reads only the cache, so it never touches the network.
//
//   pnpm musclewiki
//
// Each page (`/pt-br/exercise/<slug>`) embeds the exercise as JSON in its React Server Components
// payload. Only text and media paths are kept: videos stay on musclewiki.com and the HTML points
// to them (MuscleWiki terms: share videos and instructions with branding and a link, non-profit
// use only; image assets may not be redistributed).
import { execFile } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

import {
  lerCache,
  lerMapa,
  ORIGEM,
  type ExercicioMuscleWiki,
  type Video,
} from './musclewiki-dados.ts'

const raiz = join(import.meta.dirname, '..')
const arquivoCache = join(raiz, 'musclewiki', 'cache.json')
const executar = promisify(execFile)
const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

type Json = null | boolean | number | string | Json[] | { [chave: string]: Json }

function objeto(valor: Json | undefined): { [chave: string]: Json } | undefined {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor) ? valor : undefined
}

function lista(valor: Json | undefined): Json[] {
  return Array.isArray(valor) ? valor : []
}

function texto(valor: Json | undefined): string {
  return typeof valor === 'string' ? valor : ''
}

function numero(valor: Json | undefined): number {
  return typeof valor === 'number' ? valor : 0
}

/** The RSC payload: every `self.__next_f.push([1,"…"])` string, decoded and joined. */
function payload(html: string): string {
  const partes = html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/gu)
  return [...partes].map(([, parte]) => String(JSON.parse(`"${parte ?? ''}"`))).join('')
}

/** The JSON object that starts at `inicio`, or undefined when it does not parse. */
function objetoEm(fonte: string, inicio: number): Json | undefined {
  let profundidade = 0
  let emTexto = false
  for (let i = inicio; i < fonte.length; i++) {
    const c = fonte[i]
    if (emTexto) {
      if (c === '\\') i++
      else if (c === '"') emTexto = false
    } else if (c === '"') emTexto = true
    else if (c === '{') profundidade++
    else if (c === '}' && --profundidade === 0) {
      try {
        const valor: Json = JSON.parse(fonte.slice(inicio, i + 1))
        return valor
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

function videos(imagens: Json[]): Partial<Record<'front' | 'side', Video>> {
  const caminhos = imagens.map((imagem) => texto(objeto(imagem)?.branded_video))
  const porAngulo: Partial<Record<'front' | 'side', Video>> = {}
  // Fixed key order keeps the cache diff stable.
  for (const angulo of ['front', 'side'] as const) {
    const caminho = caminhos.find((c) => c.endsWith(`-${angulo}.mp4`))
    if (caminho) porAngulo[angulo] = `${ORIGEM}${caminho}`
  }
  return porAngulo
}

function extrair(html: string, slug: string): ExercicioMuscleWiki {
  const fonte = payload(html)
  for (const { index } of fonte.matchAll(/\{"id":\d+,"muscles"/gu)) {
    const dados = objeto(objetoEm(fonte, index))
    if (!dados || dados.slug !== slug || !('correct_steps' in dados)) continue
    const imagens = objeto(dados.images)
    return {
      slug,
      nome: texto(dados.name),
      nome_en: texto(dados.name_en_us),
      passos: lista(dados.correct_steps)
        .map((passo) => objeto(passo) ?? {})
        .sort((a, b) => numero(a.order) - numero(b.order))
        .map((passo) => texto(passo.text))
        .filter(Boolean),
      videos: { male: videos(lista(imagens?.male)), female: videos(lista(imagens?.female)) },
    }
  }
  throw new Error(`${slug}: exercise data not found in the page`)
}

// Cloudflare answers 403 to Node's fetch (its TLS fingerprint) but serves curl.
async function buscar(slug: string): Promise<ExercicioMuscleWiki> {
  const url = `${ORIGEM}/pt-br/exercise/${slug}`
  try {
    const { stdout } = await executar('curl', ['-sSf', '-A', userAgent, url], {
      maxBuffer: 16 * 1024 * 1024,
    })
    return extrair(stdout, slug)
  } catch (erro) {
    throw new Error(`${slug}: ${erro instanceof Error ? erro.message.trim() : String(erro)}`, {
      cause: erro,
    })
  }
}

const slugs = [...new Set(Object.values(lerMapa()).flatMap((item) => (item ? [item.slug] : [])))]
const cache = lerCache()
const resultado: Record<string, ExercicioMuscleWiki> = {}
const falhas: string[] = []

// Four pages at a time: enough for ~100 pages, gentle on the site.
const fila = [...slugs].sort()
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let slug = fila.shift(); slug; slug = fila.shift()) {
      try {
        resultado[slug] = await buscar(slug)
      } catch (erro) {
        falhas.push(String(erro))
        const anterior = cache[slug]
        if (anterior) resultado[slug] = anterior
      }
    }
  }),
)

const ordenado = Object.fromEntries(
  Object.entries(resultado).sort(([a], [b]) => a.localeCompare(b)),
)
writeFileSync(arquivoCache, `${JSON.stringify(ordenado, null, 2)}\n`)
console.log(`✔ ${Object.keys(ordenado).length} exercícios em musclewiki/cache.json`)
if (falhas.length) {
  for (const falha of falhas) console.error(`✖ ${falha}`)
  process.exit(1)
}
