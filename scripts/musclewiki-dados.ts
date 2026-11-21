// MuscleWiki data in this repository: `musclewiki/mapa.json` maps each catalog exercise to the
// slug of the same exercise on MuscleWiki (often under another name), or `null` when MuscleWiki
// does not have it; `musclewiki/cache.json` holds what `pnpm musclewiki` read from those pages.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ORIGEM = 'https://musclewiki.com'

export type Video = string

export interface ExercicioMuscleWiki {
  slug: string
  nome: string
  nome_en: string
  /** Step-by-step instructions in Brazilian Portuguese. */
  passos: string[]
  videos: Record<'male' | 'female', Partial<Record<'front' | 'side', Video>>>
}

const pasta = join(import.meta.dirname, '..', 'musclewiki')

function ler(arquivo: string): unknown {
  const caminho = join(pasta, arquivo)
  return existsSync(caminho) ? JSON.parse(readFileSync(caminho, 'utf8')) : {}
}

function registro(valor: unknown): valor is Record<string, unknown> {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}

function textos(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === 'string')
}

function angulos(valor: unknown): valor is Partial<Record<'front' | 'side', Video>> {
  return registro(valor) && Object.values(valor).every((url) => typeof url === 'string')
}

function exercicioMuscleWiki(valor: unknown): valor is ExercicioMuscleWiki {
  return (
    registro(valor) &&
    typeof valor.slug === 'string' &&
    typeof valor.nome === 'string' &&
    typeof valor.nome_en === 'string' &&
    textos(valor.passos) &&
    registro(valor.videos) &&
    angulos(valor.videos.male) &&
    angulos(valor.videos.female)
  )
}

export function lerMapa(): Record<string, string | null> {
  const dados = ler('mapa.json')
  const mapa: Record<string, string | null> = {}
  if (!registro(dados)) throw new Error('musclewiki/mapa.json: expected an object')
  for (const [id, valor] of Object.entries(dados)) {
    if (valor !== null && typeof valor !== 'string')
      throw new Error(`musclewiki/mapa.json: invalid entry "${id}"`)
    mapa[id] = valor
  }
  return mapa
}

export function lerCache(): Record<string, ExercicioMuscleWiki> {
  const dados = ler('cache.json')
  const cache: Record<string, ExercicioMuscleWiki> = {}
  if (!registro(dados)) throw new Error('musclewiki/cache.json: expected an object')
  for (const [slug, valor] of Object.entries(dados)) {
    if (!exercicioMuscleWiki(valor))
      throw new Error(`musclewiki/cache.json: invalid entry "${slug}"`)
    cache[slug] = valor
  }
  return cache
}
