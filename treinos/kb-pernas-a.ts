import { defineTreino } from '../scripts/treino.ts'

// Kettlebell-only week (`planos['semana-kettlebell']`): no pull-up bar.
export default defineTreino({
  titulo: 'Pernas A',
  descricao:
    'Terça. Aqueça 5 minutos antes. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.',
  itens: [
    { exercicio: 'goblet_squat', series: 4, repeticoes: '8–10', carga: '20 kg', descanso: '2 min' },
    {
      exercicio: 'avanco_reverso',
      series: 3,
      repeticoes: '8 cada perna',
      carga: '16 kg',
      descanso: '90 s',
      obs: 'Kettlebell junto ao peito, segurando pela alça.',
    },
    {
      exercicio: 'rdl_bilateral',
      series: 3,
      repeticoes: '10',
      carga: '20 kg',
      descanso: '90 s',
      obs: 'Quadril para trás, coluna neutra, joelhos levemente dobrados.',
    },
    {
      exercicio: 'panturrilha_em_pe',
      series: 3,
      repeticoes: '12–15 cada perna',
      carga: '20 kg',
      descanso: '60 s',
      obs: 'Uma perna por vez, kettlebell na mão do mesmo lado e a outra mão na parede.',
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
