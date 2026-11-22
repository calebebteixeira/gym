// Body map beside each exercise: front and rear views with the exercise's muscles colored by role.
// The artwork is Open Muscle Map (MIT, vendor/open-muscle-map/, kept verbatim). The page embeds it
// once as an SVG <symbol>; each card draws it with <use> and sets one custom property per muscle
// region, which the symbol's paths read through inheritance. No JavaScript, no remote file.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Exercicio } from './catalogo.ts'

type Modelo = 'male' | 'female'

const pasta = join(import.meta.dirname, '..', 'vendor', 'open-muscle-map')

/** Both views, cropped to the bodies (which span x 41–1209, y 45–1163 in the artwork). */
const VIEWBOX = '30 30 1195 1140'

// Catalog muscle → Open Muscle Map regions (`muscleId`, or `muscleId-subregion` for the trapezius).
// Muscles the artwork does not draw (supraspinatus, subscapularis, transversus, gluteus minimus,
// deep hip rotators) are left out; deep muscles that lie under a drawn region use that region.
const REGIOES: Record<string, string[]> = {
  TRAP_S: ['trapezius-upper', 'trapezius-upper_lateral'],
  TRAP_M: ['trapezius-middle_lower'],
  TRAP_I: ['trapezius-middle_lower'],
  ROMB: ['trapezius-middle_lower'],
  LEV_ESC: ['trapezius-upper'],
  SERR: ['serratus_anterior'],
  PEIT_C: ['pectoralis_major'],
  PEIT_E: ['pectoralis_major'],
  DELT_A: ['anterior_deltoid'],
  DELT_M: ['lateral_deltoid'],
  DELT_P: ['posterior_deltoid'],
  INFRA: ['posterior_rotator_cuff'],
  RED_MAI: ['posterior_rotator_cuff'],
  LAT: ['latissimus_dorsi'],
  BIC: ['biceps_brachii'],
  BRAQ: ['brachialis'],
  BRAQRAD: ['forearm_extensors'],
  TRI_L: ['triceps_brachii'],
  TRI_LM: ['triceps_brachii'],
  FLEX_ANT: ['forearm_flexors'],
  EXT_ANT: ['forearm_extensors'],
  RETO_ABD: ['rectus_abdominis'],
  OBL_EXT: ['external_oblique'],
  OBL_INT: ['external_oblique'],
  ERET: ['erector_spinae'],
  MULTI: ['erector_spinae'],
  QL: ['erector_spinae'],
  GLU_MAX: ['gluteus_maximus'],
  GLU_MED: ['gluteus_medius'],
  ILIOPS: ['iliopsoas'],
  TFL: ['tensor_fasciae_latae'],
  ADU_MAG: ['hip_adductors'],
  ADU: ['hip_adductors'],
  RETO_FEM: ['rectus_femoris'],
  VASTOS: ['vastus_lateralis', 'vastus_medialis'],
  ISQ: ['biceps_femoris', 'medial_hamstrings'],
  GASTRO: ['gastrocnemius'],
  SOLEO: ['soleus'],
  TIB_ANT: ['tibialis_anterior'],
  FIB: ['fibularis_group'],
  ECM: ['sternocleidomastoid'],
}

function atributo(atributos: string, nome: string): string | undefined {
  return new RegExp(`\\b${nome}="([^"]*)"`, 'u').exec(atributos)?.[1]
}

/** One decimal is plenty at card size and roughly halves the path data. */
function arredondar(d: string): string {
  return d.replace(/-?\d+\.\d+/gu, (n) => String(Math.round(Number(n) * 10) / 10))
}

const simbolos = new Map<Modelo, string>()

/** The `<symbol id="corpo-<modelo>">` for one body, built from the vendored SVG. */
function simbolo(modelo: Modelo): string {
  const pronto = simbolos.get(modelo)
  if (pronto) return pronto
  const svg = readFileSync(join(pasta, `${modelo}-muscle-map.svg`), 'utf8')
  const grupos: string[] = []
  // Leaf groups: one silhouette or one muscle panel each, holding its paths.
  for (const [, atributos = '', conteudo = ''] of svg.matchAll(
    /<g ([^>]*\btransform="[^"]*"[^>]*)>((?:(?!<g[\s>])[\s\S])*?)<\/g>/gu,
  )) {
    const transform = atributo(atributos, 'transform')
    const musculo = atributo(atributos, 'data-muscle-id')
    const sub = atributo(atributos, 'data-subregion')
    const regiao = musculo === 'trapezius' && sub ? `${musculo}-${sub}` : musculo
    const preenchimento = regiao
      ? `var(--mm-${regiao},var(--corpo-musculo))`
      : 'var(--corpo-contorno)'
    const caminhos = [...conteudo.matchAll(/<path ([^>]*?)\/?>/gu)].map(([, p = '']) => {
      const d = atributo(p, 'd') ?? ''
      const t = atributo(p, 'transform')
      return `<path d="${arredondar(d)}"${t ? ` transform="${t}"` : ''}/>`
    })
    grupos.push(
      `<g transform="${transform ?? ''}" style="fill:${preenchimento}">${caminhos.join('')}</g>`,
    )
  }
  const novo = `<symbol id="corpo-${modelo}" viewBox="${VIEWBOX}">${grupos.join('')}</symbol>`
  simbolos.set(modelo, novo)
  return novo
}

/** Hidden SVG holding the body symbols a page uses. Goes once per page. */
export function spriteCorpo(modelos: Modelo[]): string {
  const unicos = [...new Set(modelos)]
  return `<!-- Mapa muscular: Open Muscle Map, MIT License, (c) 2026 PerspicaciousGuy -->
<svg class="sprite" aria-hidden="true">${unicos.map(simbolo).join('')}</svg>`
}

/** The body map for one exercise: strongest role wins when several muscles share a region. */
export function corpo(e: Exercicio, modelo: Modelo): string {
  const nivel = new Map<string, number>()
  const papeis: [string[], number][] = [
    [e.musculos.estabilizadores, 1],
    [e.musculos.sinergistas, 2],
    [e.musculos.agonistas_primarios, 3],
  ]
  for (const [ids, valor] of papeis)
    for (const id of ids)
      for (const regiao of REGIOES[id] ?? [])
        nivel.set(regiao, Math.max(valor, nivel.get(regiao) ?? 0))
  const estilo = [...nivel]
    .map(([regiao, valor]) => `--mm-${regiao}:var(--nivel-${valor})`)
    .join(';')
  // The symbol already maps its viewBox onto the full <use> area, so the card's own coordinates
  // start at 0; repeating the symbol's offset here would crop the heads.
  return `<svg class="item-corpo" viewBox="0 0 1195 1140" role="img" aria-label="Músculos trabalhados, de frente e de costas" style="${estilo}"><use href="#corpo-${modelo}"/></svg>`
}
