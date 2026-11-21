// Exercise catalog: the two downloaded databases under `exercicios/`, read as they are. Both use
// the same muscle IDs, so one muscle list serves every exercise.
import barraFixa from '../exercicios/barra_fixa/barra_fixa_exercicios.json' with { type: 'json' }
import kettlebell from '../exercicios/kettlebell/kettlebell_exercicios.json' with { type: 'json' }

export type Equipamento = 'Kettlebell' | 'Barra fixa'

export interface Exercicio {
  id: string
  equipamento: Equipamento
  nome_pt: string
  nome_en: string
  categoria: string
  padrao_movimento: string
  tipo_contracao: string
  lateralidade: string
  nivel: string
  acoes_articulares: string
  notas: string
  pegada?: string
  musculos: {
    agonistas_primarios: string[]
    sinergistas: string[]
    estabilizadores: string[]
  }
}

const exercicios: Exercicio[] = [
  ...kettlebell.exercicios.map((e) => ({ ...e, equipamento: 'Kettlebell' as const })),
  ...barraFixa.exercicios.map((e) => ({ ...e, equipamento: 'Barra fixa' as const })),
]

const porId = new Map(exercicios.map((e) => [e.id, e]))
const musculoPorId = new Map(kettlebell.musculos.map((m) => [m.id, m.nome_pt]))

export function exercicio(id: string): Exercicio | undefined {
  return porId.get(id)
}

export function nomeMusculo(id: string): string {
  return musculoPorId.get(id) ?? id
}
