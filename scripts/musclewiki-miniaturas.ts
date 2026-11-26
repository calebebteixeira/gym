// Extracts one thumbnail per video in `musclewiki/videos/` into `musclewiki/miniaturas/` with
// ffmpeg. The pages use them as the video poster and in the exercise gallery; like the videos,
// the files are committed and served by GitHub Pages.
//
//   pnpm musclewiki:miniaturas          # only the missing ones
//   pnpm musclewiki:miniaturas --todas  # every thumbnail again
//
// The frame is the one that best shows the exercise: the end of the movement, held still. Each
// video is a few repetitions filmed from a tripod, starting at the rest position, so that frame is
// the one that differs most from the first frame, and among the frames close to that the one
// where the body moves least (no motion blur). A video with almost no movement (a hang, a hold)
// gets its middle frame.
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

const raiz = join(import.meta.dirname, '..', 'musclewiki')
const videos = join(raiz, 'videos')
const miniaturas = join(raiz, 'miniaturas')
const executar = promisify(execFile)

/** Frames per second sampled to choose the frame. */
const FPS = 10
/** Size of the sampled frames: enough to see the body move, small enough to compare fast. */
const LARGURA = 96
const ALTURA = 54
/** Width of the thumbnail; the height follows the video (16:9 → 270). */
const LARGURA_MINIATURA = 480
/** Mean difference (0–255) from the first frame below which the video counts as a static hold. */
const MOVIMENTO_MINIMO = 2
/** Frames at least this close to the largest difference compete on stillness. */
const PERTO_DO_AUGE = 0.85

// Chosen by eye, in seconds, where the rule above picks a poor frame: swings (the rule takes the
// backswing; the top of the swing is the recognizable pose), hip thrusts (the video starts at the
// top, so the rule takes the bottom) and carries (the model walks toward the camera and away; the
// rule takes a close-up from behind). Keyed by file name without extension.
const INSTANTES: Record<string, number> = {
  'female-Kettlebells-double-swing-front_baIwtC8': 1.8,
  'female-Kettlebells-double-swing-side_sngUSdT': 1.8,
  'female-Kettlebells-kettlebell-farmers-carry-front': 3,
  'female-Kettlebells-kettlebell-farmers-carry-side': 2,
  'female-Kettlebells-kettlebell-hip-thrust-front': 3.4,
  'female-Kettlebells-kettlebell-hip-thrust-side': 3.4,
  'female-Kettlebells-kettlebell-single-leg-hip-thrust-front': 3.5,
  'female-Kettlebells-kettlebell-single-leg-hip-thrust-side': 3.6,
  'female-Kettlebells-kettlebell-swing-front': 1.7,
  'female-Kettlebells-kettlebell-swing-side': 1.7,
  'female-Kettlebells-swing-to-upright-row-front': 1.2,
  'female-Kettlebells-swing-to-upright-row-side': 1.2,
  'female-Recovery-farmers-walk-front': 3.4,
  'female-Recovery-farmers-walk-side': 2.3,
  'male-Kettlebells-kettlebell-double-swing-front': 1.5,
  'male-Kettlebells-kettlebell-double-swing-side': 1.4,
  'male-Kettlebells-kettlebell-farmers-carry-front': 2.9,
  'male-Kettlebells-kettlebell-farmers-carry-side': 2,
  'male-Kettlebells-kettlebell-hip-thrust-front': 3.7,
  'male-Kettlebells-kettlebell-hip-thrust-side': 3.8,
  'male-Kettlebells-kettlebell-single-leg-hip-thrust-front': 3.1,
  'male-Kettlebells-kettlebell-single-leg-hip-thrust-side': 3,
  'male-Kettlebells-kettlebell-swing-front': 1.6,
  'male-Kettlebells-kettlebell-swing-side': 1.6,
  'male-Kettlebells-swing-to-upright-row-front': 1.3,
  'male-Kettlebells-swing-to-upright-row-side': 1.3,
  'male-Recovery-farmers-walk-front': 3.4,
  'male-Recovery-farmers-walk-side': 2.3,
}

/** Mean absolute difference between two sampled frames. */
function diferenca(quadros: Buffer, a: number, b: number): number {
  const tamanho = LARGURA * ALTURA
  let soma = 0
  for (let i = 0; i < tamanho; i++) {
    soma += Math.abs((quadros[a * tamanho + i] ?? 0) - (quadros[b * tamanho + i] ?? 0))
  }
  return soma / tamanho
}

/** Time, in seconds, of the frame that best shows the exercise. */
async function melhorInstante(video: string): Promise<number> {
  const { stdout: quadros } = await executar(
    'ffmpeg',
    [
      '-v',
      'error',
      '-i',
      video,
      '-vf',
      `fps=${FPS},scale=${LARGURA}:${ALTURA},format=gray`,
      '-f',
      'rawvideo',
      '-',
    ],
    { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 },
  )
  const total = Math.floor(quadros.length / (LARGURA * ALTURA))
  if (total < 3) return 0
  const doInicio = Array.from({ length: total }, (_, i) => diferenca(quadros, i, 0))
  const auge = Math.max(...doInicio)
  if (auge < MOVIMENTO_MINIMO) return Math.floor(total / 2) / FPS
  let melhor = 0
  let menorMovimento = Infinity
  for (let i = 1; i < total - 1; i++) {
    if ((doInicio[i] ?? 0) < auge * PERTO_DO_AUGE) continue
    const movimento = diferenca(quadros, i, i - 1) + diferenca(quadros, i, i + 1)
    if (movimento < menorMovimento) {
      menorMovimento = movimento
      melhor = i
    }
  }
  return melhor / FPS
}

async function extrair(arquivo: string): Promise<void> {
  const video = join(videos, arquivo)
  const instante = INSTANTES[arquivo.replace(/\.mp4$/u, '')] ?? (await melhorInstante(video))
  await executar('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-ss',
    instante.toFixed(2),
    '-i',
    video,
    '-frames:v',
    '1',
    '-vf',
    `scale=${LARGURA_MINIATURA}:-2`,
    '-q:v',
    '5',
    join(miniaturas, arquivo.replace(/\.mp4$/u, '.jpg')),
  ])
}

const todas = process.argv.includes('--todas')
mkdirSync(miniaturas, { recursive: true })
const fila = readdirSync(videos)
  .filter((arquivo) => arquivo.endsWith('.mp4'))
  .filter((arquivo) => todas || !existsSync(join(miniaturas, arquivo.replace(/\.mp4$/u, '.jpg'))))
const novas = fila.length
const falhas: string[] = []

// Four videos at a time.
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let arquivo = fila.shift(); arquivo; arquivo = fila.shift()) {
      try {
        await extrair(arquivo)
      } catch (erro) {
        falhas.push(`${arquivo}: ${erro instanceof Error ? erro.message.trim() : String(erro)}`)
      }
    }
  }),
)

for (const falha of falhas) console.error(`✖ ${falha}`)
const prontas = readdirSync(miniaturas).filter((arquivo) => arquivo.endsWith('.jpg')).length
console.log(`✔ ${prontas} miniaturas em musclewiki/miniaturas (${novas - falhas.length} novas)`)
if (falhas.length) process.exit(1)
