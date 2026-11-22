import { defineTreino } from '../scripts/treino.ts'

export default defineTreino({
  titulo: 'Superior A',
  descricao:
    'Segunda. Aqueça 5 minutos antes. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.',
  itens: [
    {
      exercicio: 'chinup_supinada',
      series: 4,
      repeticoes: '3 descidas',
      descanso: '2 min',
      obs: 'Só a descida: suba com um pulo ou apoiado numa cadeira até o queixo passar da barra e desça contando 5 s. Quando conseguir subir sozinho, faça a barra inteira.',
    },
    {
      exercicio: 'push_press',
      series: 3,
      repeticoes: '6–8 cada lado',
      carga: '16 kg',
      descanso: '90 s',
      obs: 'Dobre um pouco os joelhos e use o impulso das pernas para subir. Desça devagar.',
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
      exercicio: 'remada_alta',
      series: 3,
      repeticoes: '10',
      carga: '20 kg',
      descanso: '60 s',
      obs: 'Segure a alça com as duas mãos. Os cotovelos param na altura dos ombros.',
    },
    {
      exercicio: 'woodchop',
      series: 3,
      repeticoes: '10 cada lado',
      carga: '16 kg',
      descanso: '60 s',
    },
    {
      exercicio: 'triceps_overhead',
      series: 2,
      repeticoes: '10–12',
      carga: '16 kg',
      descanso: '60 s',
      obs: 'Segure a alça com as duas mãos.',
    },
    { exercicio: 'dead_hang', series: 3, repeticoes: '20–30 s', descanso: '60 s' },
  ],
})
