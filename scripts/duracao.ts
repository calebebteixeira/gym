// Estimates how long a workout takes from its free-text prescription: the work of every set plus
// the rest after it, except after the last set of the workout. Warm-up is not included.
import type { ItemTreino } from './treino.ts'

/** Average time of one repetition, setup included. */
const SEGUNDOS_POR_REPETICAO = 4
/** Loaded carries: about one meter per second. */
const SEGUNDOS_POR_METRO = 1
/** A set whose prescription has no number. */
const SERIE_PADRAO = 30

/** Middle of the first number or range in the text: `8–10` → 9, `30 s` → 30. */
function media(texto: string): number | undefined {
  const encontrado = /(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?/u.exec(texto)
  if (!encontrado?.[1]) return undefined
  const inicio = Number(encontrado[1].replace(',', '.'))
  const fim = encontrado[2] ? Number(encontrado[2].replace(',', '.')) : inicio
  return (inicio + fim) / 2
}

/** `60 s`, `90 s`, `2 min` → seconds. */
function tempo(texto: string | undefined): number {
  if (!texto) return 0
  const valor = media(texto) ?? 0
  return /\bmin\b/u.test(texto) ? valor * 60 : valor
}

/** One set: `10`, `8 cada perna`, `20–30 s`, `30 m cada lado` → seconds. */
function serie(repeticoes: string | undefined): number {
  if (!repeticoes) return SERIE_PADRAO
  const valor = media(repeticoes)
  if (valor === undefined) return SERIE_PADRAO
  const lados = /\bcada\b/u.test(repeticoes) ? 2 : 1
  if (/\bmin\b/u.test(repeticoes)) return valor * 60 * lados
  if (/\d\s*s\b/u.test(repeticoes)) return valor * lados
  if (/\d\s*m\b/u.test(repeticoes)) return valor * SEGUNDOS_POR_METRO * lados
  return valor * SEGUNDOS_POR_REPETICAO * lados
}

/** A timed set (`20–30 s`, `10–15 s no topo`, `1 min`) in seconds; `undefined` when the set is
 *  counted in repetitions or distance. */
export function tempoDaSerie(
  repeticoes: string | undefined,
): { minimo: number; maximo: number } | undefined {
  const encontrado = /(\d+)(?:\s*[–-]\s*(\d+))?\s*(s|seg|min)\b/u.exec(repeticoes ?? '')
  if (!encontrado?.[1]) return undefined
  const fator = encontrado[3] === 'min' ? 60 : 1
  const minimo = Number(encontrado[1]) * fator
  const maximo = encontrado[2] ? Number(encontrado[2]) * fator : minimo
  return { minimo, maximo }
}

/** Estimated minutes, rounded to the nearest 5. */
export function duracaoEstimada(itens: ItemTreino[]): number {
  let segundos = 0
  for (const item of itens) {
    const series = item.series ?? 1
    segundos += series * (serie(item.repeticoes) + tempo(item.descanso))
  }
  segundos -= tempo(itens.at(-1)?.descanso)
  return Math.max(5, Math.round(segundos / 60 / 5) * 5)
}
