// Downloads every video referenced by `musclewiki/cache.json` (both models, both angles) into
// `musclewiki/videos/`, which git ignores. A local copy for reference and auditing; the pages
// keep playing the videos from musclewiki.com.
//
//   pnpm musclewiki:videos
//
// MuscleWiki's origin serves a video only to requests that look like they come from its own
// exercise page, so curl sends the headers a browser sends there. Files already downloaded are
// kept; a file that is not an MP4 is fetched again.
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, openSync, readSync, closeSync, renameSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'

import { lerCache, ORIGEM } from './musclewiki-dados.ts'

const pasta = join(import.meta.dirname, '..', 'musclewiki', 'videos')
const executar = promisify(execFile)
const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

/** An MP4 file has `ftyp` at byte 4. */
function ehMp4(arquivo: string): boolean {
  if (!existsSync(arquivo)) return false
  const descritor = openSync(arquivo, 'r')
  const cabecalho = Buffer.alloc(8)
  readSync(descritor, cabecalho, 0, 8, 0)
  closeSync(descritor)
  return cabecalho.toString('latin1', 4, 8) === 'ftyp'
}

async function baixar(url: string, slug: string): Promise<'novo' | 'existente'> {
  const destino = join(pasta, basename(url))
  if (ehMp4(destino)) return 'existente'
  const temporario = `${destino}.parcial`
  await executar('curl', [
    '-sSf',
    '-A',
    userAgent,
    '-H',
    `Referer: ${ORIGEM}/pt-br/exercise/${slug}`,
    '-H',
    'Sec-Fetch-Dest: video',
    '-H',
    'Sec-Fetch-Mode: no-cors',
    '-H',
    'Sec-Fetch-Site: same-origin',
    '-o',
    temporario,
    url,
  ])
  if (!ehMp4(temporario)) {
    rmSync(temporario, { force: true })
    throw new Error(`${url}: not an MP4`)
  }
  renameSync(temporario, destino)
  return 'novo'
}

mkdirSync(pasta, { recursive: true })
const fila = Object.values(lerCache()).flatMap(({ slug, videos }) =>
  [videos.male, videos.female].flatMap((angulos) =>
    Object.values(angulos).map((url) => ({ url, slug })),
  ),
)
const total = fila.length
let novos = 0
const falhas: string[] = []

// Three downloads at a time.
await Promise.all(
  Array.from({ length: 3 }, async () => {
    for (let tarefa = fila.shift(); tarefa; tarefa = fila.shift()) {
      try {
        if ((await baixar(tarefa.url, tarefa.slug)) === 'novo') novos++
      } catch (erro) {
        falhas.push(erro instanceof Error ? erro.message.trim() : String(erro))
      }
    }
  }),
)

console.log(`✔ ${total - falhas.length} de ${total} vídeos em musclewiki/videos (${novos} novos)`)
if (falhas.length) {
  for (const falha of falhas) console.error(`✖ ${falha}`)
  process.exit(1)
}
