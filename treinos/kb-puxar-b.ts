import { defineTreino } from '../scripts/treino.ts'

// Kettlebell-only week (`planos['semana-kettlebell']`): no pull-up bar.
export default defineTreino({
  titulo: 'Puxar B',
  itens: [
    {
      exercicio: 'gorilla_row',
      series: 4,
      repeticoes: '8 cada lado',
      carga: '16 kg + 20 kg',
      descanso: '90 s',
      obs: 'Os dois kettlebells no chão entre os pés, quadril para trás e costas retas. Puxe um de cada vez. Troque os kettlebells de lado a cada série.',
    },
    {
      exercicio: 'remada_unilateral',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '16 kg',
      descanso: '90 s',
      obs: 'Mão livre e joelho apoiados numa cadeira. Hoje com o cotovelo aberto, afastado do corpo, para pegar a parte de cima das costas.',
    },
    {
      exercicio: 'woodchop',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '16 kg',
      descanso: '60 s',
    },
    {
      exercicio: 'farmers_carry',
      series: 4,
      repeticoes: '20 m',
      carga: '16 kg + 20 kg',
      descanso: '60 s',
      obs: 'Um kettlebell em cada mão, tronco reto e ombros para trás. Troque os kettlebells de lado a cada série.',
    },
  ],
})
