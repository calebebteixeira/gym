// Writes `dist/<treino>.html` for every workout registered in `treinos/index.ts`.
//
//   pnpm gerar
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { treinos } from '../treinos/index.ts'
import { exercicio } from './catalogo.ts'
import { renderizar, type ItemResolvido } from './html.ts'
import { lerCache, lerMapa } from './musclewiki-dados.ts'

const dist = join(import.meta.dirname, '..', 'dist')
const mapa = lerMapa()
const cache = lerCache()

const erros: string[] = []
const paginas = Object.entries(treinos).map(([slug, treino]) => {
  const itens: ItemResolvido[] = []
  for (const item of treino.itens) {
    const encontrado = exercicio(item.exercicio)
    if (!encontrado) {
      erros.push(`treinos/${slug}: exercício desconhecido "${item.exercicio}"`)
      continue
    }
    const mapeado = mapa[item.exercicio]
    const musclewiki = mapeado ? cache[mapeado.slug] : undefined
    if (mapeado && !musclewiki)
      erros.push(`${mapeado.slug} não está em musclewiki/cache.json: rode \`pnpm musclewiki\``)
    itens.push({
      item,
      exercicio: encontrado,
      ...(mapeado && musclewiki
        ? { musclewiki: { ...musclewiki, aproximado: mapeado.aproximado } }
        : {}),
    })
  }
  return { arquivo: `${slug}.html`, html: renderizar(treino, itens) }
})

if (erros.length) {
  for (const erro of erros) console.error(`✖ ${erro}`)
  process.exit(1)
}

rmSync(dist, { recursive: true, force: true })
mkdirSync(dist)
for (const { arquivo, html } of paginas) {
  writeFileSync(join(dist, arquivo), html)
  console.log(`✔ dist/${arquivo}`)
}
