// The only JavaScript on a page: a start button on timed sets (`20–30 s`). `html.ts` inlines the
// source of this function with `toString()` (Node has already stripped the types), so it runs in
// the browser and must not use anything from outside its own body.
//
// Each run is one generated WAV played by an <audio> element started by the tap: 5 seconds to get
// in position (ticks on the last three), a start beep, a short beep at the minimum time and an
// alarm at the end. One media file keeps the timing right even when the browser throttles timers,
// and on iOS it still sounds with the ring switch on silent, which Web Audio does not.
export function cronometro(): void {
  const PREPARO = 5
  const TAXA = 8000

  function som(minimo: number, maximo: number): string {
    const fim = PREPARO + maximo
    const bipes: [inicio: number, duracao: number, frequencia: number][] = [
      [PREPARO - 3, 0.08, 660],
      [PREPARO - 2, 0.08, 660],
      [PREPARO - 1, 0.08, 660],
      [PREPARO, 0.4, 880],
      [fim, 0.3, 1320],
      [fim + 0.45, 0.3, 1320],
      [fim + 0.9, 0.3, 1320],
    ]
    if (minimo < maximo) bipes.push([PREPARO + minimo, 0.25, 880])
    const amostras = Math.ceil((fim + 1.4) * TAXA)
    const dados = new DataView(new ArrayBuffer(44 + amostras * 2))
    const texto = (posicao: number, valor: string): void => {
      for (let i = 0; i < valor.length; i++) dados.setUint8(posicao + i, valor.charCodeAt(i))
    }
    // 16-bit mono PCM header.
    texto(0, 'RIFF')
    dados.setUint32(4, 36 + amostras * 2, true)
    texto(8, 'WAVEfmt ')
    dados.setUint32(16, 16, true)
    dados.setUint16(20, 1, true)
    dados.setUint16(22, 1, true)
    dados.setUint32(24, TAXA, true)
    dados.setUint32(28, TAXA * 2, true)
    dados.setUint16(32, 2, true)
    dados.setUint16(34, 16, true)
    texto(36, 'data')
    dados.setUint32(40, amostras * 2, true)
    for (const [inicio, duracao, frequencia] of bipes) {
      const primeira = Math.round(inicio * TAXA)
      const total = Math.round(duracao * TAXA)
      for (let i = 0; i < total; i++) {
        // 10 ms fade in and out, so the beep does not click.
        const envelope = Math.min(1, i / 80, (total - i) / 80)
        const valor = Math.sin((2 * Math.PI * frequencia * i) / TAXA) * envelope * 26000
        dados.setInt16(44 + (primeira + i) * 2, Math.round(valor), true)
      }
    }
    return URL.createObjectURL(new Blob([dados], { type: 'audio/wav' }))
  }

  function ligar(botao: HTMLButtonElement): void {
    const minimo = Number(botao.dataset.minimo)
    const maximo = Number(botao.dataset.maximo)
    const rotulo = botao.textContent
    let audio: HTMLAudioElement | undefined
    let relogio: number | undefined
    let tela: WakeLockSentinel | undefined

    function parar(texto: string): void {
      window.clearInterval(relogio)
      if (audio) {
        audio.pause()
        URL.revokeObjectURL(audio.src)
        audio = undefined
      }
      tela?.release().catch(() => undefined)
      tela = undefined
      botao.classList.remove('cronometro-ativo', 'cronometro-minimo')
      botao.textContent = texto
    }

    botao.addEventListener('click', () => {
      // A tap while it runs cancels.
      if (audio) {
        parar(rotulo)
        return
      }
      const atual = new Audio(som(minimo, maximo))
      audio = atual
      botao.classList.add('cronometro-ativo')
      const mostrar = (): void => {
        const t = atual.currentTime
        if (t < PREPARO) {
          botao.textContent = `Prepare-se… ${Math.ceil(PREPARO - t)}`
        } else if (t < PREPARO + maximo) {
          botao.textContent = `${Math.ceil(PREPARO + maximo - t)} s`
          botao.classList.toggle('cronometro-minimo', t >= PREPARO + minimo)
        } else {
          botao.textContent = 'Feito!'
        }
      }
      mostrar()
      relogio = window.setInterval(mostrar, 200)
      atual.addEventListener('ended', () => {
        if (audio !== atual) return
        parar('Feito!')
        if ('vibrate' in navigator) navigator.vibrate([300, 150, 300])
        // Tick the next set of this exercise.
        const proxima = botao
          .closest('.item')
          ?.querySelector<HTMLInputElement>('.serie-caixa:not(:checked)')
        if (proxima) proxima.checked = true
        window.setTimeout(() => {
          if (!audio) botao.textContent = rotulo
        }, 3000)
      })
      atual.play().catch(() => {
        parar(rotulo)
      })
      // Keep the screen on while the countdown shows.
      if ('wakeLock' in navigator) {
        navigator.wakeLock
          .request('screen')
          .then((trava) => {
            if (audio === atual) tela = trava
            else trava.release().catch(() => undefined)
          })
          .catch(() => undefined)
      }
    })
    // Rendered hidden: the button only appears where this script runs.
    botao.hidden = false
  }

  document.querySelectorAll<HTMLButtonElement>('.cronometro').forEach(ligar)
}
