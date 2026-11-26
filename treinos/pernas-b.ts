import { defineTreino } from '../scripts/treino.ts'

export default defineTreino({
  titulo: 'Pernas B',
  descricao:
    'Sexta. Aqueça 5 minutos antes. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.',
  itens: [
    {
      exercicio: 'swing_russo',
      series: 5,
      repeticoes: '10',
      carga: '20 kg',
      descanso: '90 s',
      obs: 'A força vem do quadril; os braços só guiam o kettlebell.',
    },
    {
      exercicio: 'rdl_kickstand',
      series: 3,
      repeticoes: '8 cada perna',
      carga: '20 kg',
      descanso: '90 s',
    },
    {
      exercicio: 'box_squat',
      series: 3,
      repeticoes: '10',
      carga: '20 kg',
      descanso: '90 s',
      obs: 'Kettlebell junto ao peito. Sente de leve numa cadeira e levante sem impulso.',
    },
    {
      exercicio: 'avanco_lateral',
      series: 3,
      repeticoes: '8 cada lado',
      carga: '16 kg',
      descanso: '90 s',
    },
    {
      exercicio: 'suitcase_carry',
      series: 3,
      repeticoes: '30 m cada lado',
      carga: '20 kg',
      descanso: '60 s',
      obs: 'Tronco reto, sem inclinar para o lado do peso.',
    },
  ],
})
