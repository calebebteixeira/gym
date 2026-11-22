// Writes `dist/<treino>.html` for every workout and `dist/<plano>.html` for every multi-workout page
// registered in `treinos/index.ts`.
//
//   pnpm gerar
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { planos, treinos } from '../treinos/index.ts'
import { exercicio } from './catalogo.ts'
import { renderizar, renderizarPlano, type ItemResolvido } from './html.ts'
import { lerCache, lerMapa } from './musclewiki-dados.ts'

const dist = join(import.meta.dirname, '..', 'dist')
const mapa = lerMapa()
const cache = lerCache()

const erros: string[] = []
const resolvidos = Object.entries(treinos).map(([slug, treino]) => {
  const itens: ItemResolvido[] = []
  for (const item of treino.itens) {
    const encontrado = exercicio(item.exercicio)
    if (!encontrado) {
      erros.push(`treinos/${slug}: exercício desconhecido "${item.exercicio}"`)
      continue
    }
    const slugMuscleWiki = mapa[item.exercicio]
    const musclewiki = slugMuscleWiki ? cache[slugMuscleWiki] : undefined
    if (slugMuscleWiki && !musclewiki)
      erros.push(`${slugMuscleWiki} não está em musclewiki/cache.json: rode \`pnpm musclewiki\``)
    itens.push({ item, exercicio: encontrado, ...(musclewiki ? { musclewiki } : {}) })
  }
  return { slug, treino, itens }
})

const paginas = resolvidos.map(({ slug, treino, itens }) => ({
  arquivo: `${slug}.html`,
  html: renderizar(treino, itens),
}))
for (const [slug, plano] of Object.entries(planos)) {
  if (slug in treinos) erros.push(`planos.${slug}: mesmo nome de um treino`)
  const abas = plano.treinos.flatMap(({ dia, treino }) => {
    const resolvido = resolvidos.find((r) => r.slug === treino)
    return resolvido ? [{ dia, ...resolvido }] : []
  })
  paginas.push({ arquivo: `${slug}.html`, html: renderizarPlano(plano, abas) })
}

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
