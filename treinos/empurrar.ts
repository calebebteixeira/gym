import { defineTreino } from '../scripts/treino.ts'

export default defineTreino({
  titulo: 'Empurrar',
  descricao:
    'Quarta. Aqueça 5 minutos antes. Quando fizer o máximo de repetições em todas as séries, suba a carga ou as repetições.',
  itens: [
    {
      exercicio: 'push_press',
      series: 3,
      repeticoes: '6–8 cada lado',
      carga: '16 kg',
      descanso: '90 s',
      obs: 'Dobre um pouco os joelhos e use o impulso das pernas para subir. Desça devagar.',
    },
    {
      exercicio: 'flexao_kb',
      series: 4,
      repeticoes: '8–12',
      descanso: '90 s',
      obs: 'Flexão normal, mãos no chão como no vídeo. Se não fizer 8, apoie os joelhos.',
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
      exercicio: 'triceps_overhead',
      series: 2,
      repeticoes: '10–12',
      carga: '16 kg',
      descanso: '60 s',
      obs: 'Segure a alça com as duas mãos.',
    },
  ],
})
