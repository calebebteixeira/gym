import { defineTreino } from '../scripts/treino.ts'

export default defineTreino({
  titulo: 'Superior B',
  descricao:
    'Quinta. Aqueça 5 minutos antes. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.',
  itens: [
    {
      exercicio: 'dead_hang',
      series: 3,
      repeticoes: '20–30 s',
      descanso: '60 s',
    },
    {
      exercicio: 'chinup_supinada',
      series: 4,
      repeticoes: '10–15 s no topo',
      descanso: '2 min',
      obs: 'Suba com um pulo ou apoiado numa cadeira e segure com o queixo acima da barra.',
    },
    {
      exercicio: 'flexao_kb',
      series: 4,
      repeticoes: '8–12',
      descanso: '90 s',
      obs: 'Flexão normal, mãos no chão como no vídeo. Se não fizer 8, apoie os joelhos.',
    },
    {
      exercicio: 'remada_unilateral',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '20 kg',
      descanso: '90 s',
      obs: 'Mão livre e joelho apoiados numa cadeira. Cotovelo junto ao corpo.',
    },
    {
      exercicio: 'woodchop',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '16 kg',
      descanso: '60 s',
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
      exercicio: 'elevacao_joelhos',
      series: 3,
      repeticoes: '8–10',
      descanso: '60 s',
      obs: 'Sem balançar o corpo.',
    },
  ],
})
