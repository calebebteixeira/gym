// Every workout that `pnpm gerar` renders. The key is the output file name: `dist/<key>.html`.
import type { Plano } from '../scripts/treino.ts'
import empurrar from './empurrar.ts'
import exemplo from './exemplo.ts'
import kbPernasA from './kb-pernas-a.ts'
import kbPuxarA from './kb-puxar-a.ts'
import kbPuxarB from './kb-puxar-b.ts'
import pernasA from './pernas-a.ts'
import pernasB from './pernas-b.ts'
import puxarA from './puxar-a.ts'
import puxarB from './puxar-b.ts'

export const treinos = {
  exemplo,
  'puxar-a': puxarA,
  'pernas-a': pernasA,
  empurrar,
  'puxar-b': puxarB,
  'pernas-b': pernasB,
  'kb-puxar-a': kbPuxarA,
  'kb-pernas-a': kbPernasA,
  'kb-puxar-b': kbPuxarB,
}

const nota =
  'Aqueça 5 minutos antes de cada treino. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.'

// Pages with several workouts, one tab each: `dist/<key>.html`.
export const planos: Record<string, Plano<keyof typeof treinos>> = {
  semana: {
    titulo: 'Treino da semana',
    descricao: 'Kettlebell e barra fixa, 5 dias por semana.',
    nota,
    treinos: [
      { dia: 'Seg', treino: 'puxar-a' },
      { dia: 'Ter', treino: 'pernas-a' },
      { dia: 'Qua', treino: 'empurrar' },
      { dia: 'Qui', treino: 'puxar-b' },
      { dia: 'Sex', treino: 'pernas-b' },
    ],
  },
  // Same week without the pull-up bar. `empurrar` and `pernas-b` already use no bar.
  'semana-kettlebell': {
    titulo: 'Treino da semana: só kettlebell',
    descricao: 'Só kettlebell, sem barra fixa. 5 dias por semana.',
    nota,
    treinos: [
      { dia: 'Seg', treino: 'kb-puxar-a' },
      { dia: 'Ter', treino: 'kb-pernas-a' },
      { dia: 'Qua', treino: 'empurrar' },
      { dia: 'Qui', treino: 'kb-puxar-b' },
      { dia: 'Sex', treino: 'pernas-b' },
    ],
  },
}
