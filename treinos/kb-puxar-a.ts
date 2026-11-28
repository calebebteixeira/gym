import { defineTreino } from '../scripts/treino.ts'

// Kettlebell-only week (`planos['semana-kettlebell']`): no pull-up bar.
export default defineTreino({
  titulo: 'Puxar A',
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
      exercicio: 'rosca_biceps',
      series: 3,
      repeticoes: '8–10',
      carga: '20 kg',
      descanso: '60 s',
      obs: 'Segure a alça com as duas mãos, cotovelos junto ao corpo.',
    },
    {
      exercicio: 'flexao_kb',
      series: 3,
      repeticoes: '8–12',
      descanso: '90 s',
      obs: 'Flexão normal, mãos no chão como no vídeo. Se não fizer 8, apoie os joelhos.',
    },
    {
      exercicio: 'woodchop',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '16 kg',
      descanso: '60 s',
    },
  ],
})
