// A workout: the exercises to do, in order, with their prescription. `exercicio` is an `id` from
// `exercicios/*/…_exercicios.json`; `pnpm gerar` fails on an unknown id.
export interface ItemTreino {
  exercicio: string
  series?: number
  /** Free text: `8–10`, `30 s`, `máximo`. */
  repeticoes?: string
  carga?: string
  descanso?: string
  obs?: string
}

export interface Treino {
  titulo: string
  descricao?: string
  /** Model in the MuscleWiki videos. Default: `male`. */
  modelo?: 'male' | 'female'
  itens: ItemTreino[]
}

export function defineTreino(treino: Treino): Treino {
  return treino
}
