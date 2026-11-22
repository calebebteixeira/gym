// Every workout that `pnpm gerar` renders. The key is the output file name: `dist/<key>.html`.
import type { Plano } from '../scripts/treino.ts'
import exemplo from './exemplo.ts'
import inferiorA from './inferior-a.ts'
import inferiorB from './inferior-b.ts'
import superiorA from './superior-a.ts'
import superiorB from './superior-b.ts'

export const treinos = {
  exemplo,
  'superior-a': superiorA,
  'inferior-a': inferiorA,
  'superior-b': superiorB,
  'inferior-b': inferiorB,
}

// Pages with several workouts, one tab each: `dist/<key>.html`.
export const planos: Record<string, Plano<keyof typeof treinos>> = {
  semana: {
    titulo: 'Treino da semana',
    descricao: 'Kettlebell e barra fixa, 4 dias por semana.',
    treinos: [
      { dia: 'Seg', treino: 'superior-a' },
      { dia: 'Ter', treino: 'inferior-a' },
      { dia: 'Qui', treino: 'superior-b' },
      { dia: 'Sex', treino: 'inferior-b' },
    ],
  },
}
