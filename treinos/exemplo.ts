import { defineTreino } from '../scripts/treino.ts'

// Example to copy: replace with your real workout.
export default defineTreino({
  titulo: 'Treino de exemplo',
  descricao: 'Kettlebell e barra fixa. Aqueça 5 minutos antes.',
  itens: [
    { exercicio: 'swing_russo', series: 4, repeticoes: '15', carga: '16 kg', descanso: '60 s' },
    { exercicio: 'goblet_squat', series: 3, repeticoes: '10', carga: '16 kg', descanso: '90 s' },
    { exercicio: 'pullup_negativa', series: 3, repeticoes: '5', descanso: '2 min' },
    {
      exercicio: 'dead_hang',
      series: 3,
      repeticoes: '30 s',
      descanso: '60 s',
      obs: 'Ombros ativos, sem balançar.',
    },
  ],
})
