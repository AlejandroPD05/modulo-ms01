import { frecuenciaDeNota } from './notas'
import { PARAMETROS_INICIALES, type Parametros } from './parametros'

type Voz = {
  midi: number
  osc1: OscillatorNode
  osc2: OscillatorNode
  ganancia1: GainNode
  ganancia2: GainNode
  filtro: BiquadFilterNode
  envolvente: GainNode
  envioDelay: GainNode
  creada: number
  liberada: boolean
}

const VOCES_MAXIMAS = 8
const RETARDO_MAXIMO = 1.2
const esperar = (ms: number) =>
  new Promise<void>((resolver) => window.setTimeout(resolver, ms))

function gananciaMaestra(volumen: number) {
  return Math.pow(Math.max(0, Math.min(1, volumen)), 1.5) * 0.6
}

function gananciaMezcla(mezcla: number) {
  const m = Math.max(0, Math.min(1, mezcla))
  return {
    osc1: Math.cos((m * Math.PI) / 2) * 0.65,
    osc2: Math.sin((m * Math.PI) / 2) * 0.65,
  }
}

/**
 * Motor de audio independiente de React.
 *
 * Cadena por voz:
 *   osc1 ─┐
 *         ├─ filtro ─ envolvente ─┬─ master ─ compresor ─ analizador ─ salida
 *   osc2 ─┘                      └─ envío ─ delay ─ retorno ─ master
 */
export class MotorSynth {
  private contexto: AudioContext | null = null
  private maestro: GainNode | null = null
  private compresor: DynamicsCompressorNode | null = null
  private analizador: AnalyserNode | null = null
  private delay: DelayNode | null = null
  private delayFeedback: GainNode | null = null
  private voces = new Map<number, Voz>()
  private vocesEnLiberacion = new Set<Voz>()
  private parametros: Parametros
  private yaSaludo = false
  private grabadora: MediaRecorder | null = null
  private trozos: Blob[] = []
  private destinoGrabacion: MediaStreamAudioDestinationNode | null = null
  private timersSaludo: number[] = []

  constructor(parametrosIniciales: Parametros) {
    this.parametros = { ...parametrosIniciales }
  }

  get estadoAudio() {
    return this.contexto?.state ?? 'closed'
  }

  get estaGrabando() {
    return this.grabadora?.state === 'recording'
  }

  get analizadorActual() {
    return this.analizador
  }

  get contextoActual() {
    return this.contexto
  }

  get vocesActivas() {
    return this.voces.size
  }

  async iniciar() {
    if (this.contexto) {
      if (this.contexto.state === 'suspended') {
        await this.contexto.resume()
      }
      this.aplicarMaestro()
      return
    }

    const contexto = new AudioContext({ latencyHint: 'interactive' })
    const maestro = contexto.createGain()
    const compresor = contexto.createDynamicsCompressor()
    const analizador = contexto.createAnalyser()
    const delay = contexto.createDelay(RETARDO_MAXIMO)
    const delayRetorno = contexto.createGain()
    const delayFeedback = contexto.createGain()

    compresor.threshold.value = -12
    compresor.knee.value = 14
    compresor.ratio.value = 5
    compresor.attack.value = 0.004
    compresor.release.value = 0.18
    analizador.fftSize = 1024
    analizador.smoothingTimeConstant = 0.76
    delayRetorno.gain.value = 0.8

    maestro.connect(compresor)
    compresor.connect(analizador)
    analizador.connect(contexto.destination)
    delay.connect(delayRetorno)
    delayRetorno.connect(maestro)
    delay.connect(delayFeedback)
    delayFeedback.connect(delay)

    this.contexto = contexto
    this.maestro = maestro
    this.compresor = compresor
    this.analizador = analizador
    this.delay = delay
    this.delayFeedback = delayFeedback

    this.aplicarMaestro()
    this.aplicarDelay()
    await contexto.resume()

    if (!this.yaSaludo) {
      this.yaSaludo = true
      this.saludoDeEncendido()
    }
  }

  async apagar() {
    if (!this.contexto || !this.maestro) return
    if (this.contexto.state === 'suspended') return

    for (const timer of this.timersSaludo) window.clearTimeout(timer)
    this.timersSaludo = []

    const ahora = this.contexto.currentTime
    this.maestro.gain.cancelScheduledValues(ahora)
    this.maestro.gain.setTargetAtTime(0.0001, ahora, 0.018)

    await esperar(90)
    this.silenciarTodo()
    await this.contexto.suspend()
    this.maestro.gain.setValueAtTime(
      gananciaMaestra(this.parametros.volumen),
      this.contexto.currentTime,
    )
  }

  actualizar(parametros: Parametros) {
    this.parametros = { ...parametros }
    if (!this.contexto) return

    this.aplicarMaestro()
    this.aplicarDelay()

    for (const voz of this.voces.values()) {
      this.actualizarVoz(voz)
    }
  }

  notaOn(midi: number, velocidad = 0.85) {
    if (
      !this.contexto ||
      !this.maestro ||
      !this.delay ||
      this.contexto.state !== 'running'
    ) {
      return
    }

    if (this.voces.has(midi)) {
      this.notaOff(midi)
    }

    if (this.voces.size >= VOCES_MAXIMAS) {
      let masAntigua: Voz | null = null
      for (const voz of this.voces.values()) {
        if (!masAntigua || voz.creada < masAntigua.creada) masAntigua = voz
      }
      if (masAntigua) this.notaOff(masAntigua.midi)
    }

    const contexto = this.contexto
    const ahora = contexto.currentTime
    const p = this.parametros
    const frecuencia = frecuenciaDeNota(midi)

    const osc1 = contexto.createOscillator()
    const osc2 = contexto.createOscillator()
    const ganancia1 = contexto.createGain()
    const ganancia2 = contexto.createGain()
    const filtro = contexto.createBiquadFilter()
    const envolvente = contexto.createGain()
    const envioDelay = contexto.createGain()

    osc1.type = p.onda1
    osc2.type = p.onda2
    osc1.frequency.setValueAtTime(frecuencia, ahora)
    osc2.frequency.setValueAtTime(frecuencia, ahora)
    osc1.detune.setValueAtTime(p.detune1, ahora)
    osc2.detune.setValueAtTime(p.detune2, ahora)

    const mezcla = gananciaMezcla(p.mezcla)
    ganancia1.gain.setValueAtTime(mezcla.osc1, ahora)
    ganancia2.gain.setValueAtTime(mezcla.osc2, ahora)

    filtro.type = 'lowpass'
    filtro.frequency.setValueAtTime(p.corte, ahora)
    filtro.Q.setValueAtTime(p.resonancia, ahora)

    const pico = Math.max(0.0001, Math.min(1, velocidad) * 0.9)
    const sostenido = Math.max(0.0001, p.sostenido * pico)
    const ataque = Math.max(0.005, p.ataque)
    const decay = Math.max(0.03, p.decay)

    envolvente.gain.setValueAtTime(0.0001, ahora)
    envolvente.gain.linearRampToValueAtTime(pico, ahora + ataque)
    envolvente.gain.linearRampToValueAtTime(
      sostenido,
      ahora + ataque + decay,
    )

    const envio = Math.max(0, Math.min(0.65, p.delayMezcla)) * 0.75
    envioDelay.gain.setValueAtTime(envio, ahora)

    osc1.connect(ganancia1)
    osc2.connect(ganancia2)
    ganancia1.connect(filtro)
    ganancia2.connect(filtro)
    filtro.connect(envolvente)
    envolvente.connect(this.maestro)
    envolvente.connect(envioDelay)
    envioDelay.connect(this.delay)

    const voz: Voz = {
      midi,
      osc1,
      osc2,
      ganancia1,
      ganancia2,
      filtro,
      envolvente,
      envioDelay,
      creada: ahora,
      liberada: false,
    }

    osc1.start(ahora)
    osc2.start(ahora)
    this.voces.set(midi, voz)
  }

  notaOff(midi: number) {
    const voz = this.voces.get(midi)
    if (!voz) return
    this.voces.delete(midi)
    this.liberarVoz(voz)
  }

  silenciarTodo() {
    for (const voz of this.voces.values()) {
      this.liberarVoz(voz)
    }
    this.voces.clear()
    for (const voz of this.vocesEnLiberacion) {
      this.detenerVoz(voz, true)
    }
    this.vocesEnLiberacion.clear()
  }

  async iniciarGrabacion() {
    if (!this.contexto || !this.compresor) {
      await this.iniciar()
    }
    if (!this.contexto || !this.compresor) return false
    if (this.grabadora?.state === 'recording') return true

    if (typeof MediaRecorder === 'undefined') return false

    const destino = this.contexto.createMediaStreamDestination()
    const tipos = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]
    const tipo = tipos.find((candidato) =>
      MediaRecorder.isTypeSupported(candidato),
    )

    try {
      const grabadora = new MediaRecorder(
        destino.stream,
        tipo ? { mimeType: tipo } : undefined,
      )
      this.trozos = []
      this.destinoGrabacion = destino
      this.compresor.connect(destino)
      grabadora.ondataavailable = (evento) => {
        if (evento.data.size > 0) this.trozos.push(evento.data)
      }
      grabadora.start(100)
      this.grabadora = grabadora
      return true
    } catch {
      this.limpiarGrabacion()
      return false
    }
  }

  async detenerGrabacion(): Promise<Blob | null> {
    const grabadora = this.grabadora
    if (!grabadora || grabadora.state === 'inactive') return null

    return new Promise((resolver) => {
      grabadora.onstop = () => {
        const tipo = grabadora.mimeType || 'audio/webm'
        const blob = new Blob(this.trozos, { type: tipo })
        this.limpiarGrabacion()
        resolver(blob.size > 0 ? blob : null)
      }
      grabadora.stop()
    })
  }

  private aplicarMaestro() {
    if (!this.contexto || !this.maestro) return
    this.maestro.gain.setTargetAtTime(
      gananciaMaestra(this.parametros.volumen),
      this.contexto.currentTime,
      0.025,
    )
  }

  private aplicarDelay() {
    if (!this.contexto || !this.delay || !this.delayFeedback) return
    const ahora = this.contexto.currentTime
    this.delay.delayTime.setTargetAtTime(
      this.parametros.delayTiempo,
      ahora,
      0.02,
    )
    this.delayFeedback.gain.setTargetAtTime(
      this.parametros.delayFeedback,
      ahora,
      0.02,
    )
  }

  private actualizarVoz(voz: Voz) {
    if (!this.contexto || voz.liberada) return
    const ahora = this.contexto.currentTime
    const p = this.parametros
    const mezcla = gananciaMezcla(p.mezcla)

    voz.osc1.type = p.onda1
    voz.osc2.type = p.onda2
    voz.osc1.detune.setTargetAtTime(p.detune1, ahora, 0.01)
    voz.osc2.detune.setTargetAtTime(p.detune2, ahora, 0.01)
    voz.ganancia1.gain.setTargetAtTime(mezcla.osc1, ahora, 0.01)
    voz.ganancia2.gain.setTargetAtTime(mezcla.osc2, ahora, 0.01)
    voz.filtro.frequency.setTargetAtTime(p.corte, ahora, 0.015)
    voz.filtro.Q.setTargetAtTime(p.resonancia, ahora, 0.015)
    voz.envioDelay.gain.setTargetAtTime(
      Math.max(0, Math.min(0.65, p.delayMezcla)) * 0.75,
      ahora,
      0.02,
    )
  }

  private liberarVoz(voz: Voz) {
    if (voz.liberada) return
    voz.liberada = true

    if (!this.contexto) {
      this.detenerVoz(voz, true)
      return
    }

    const ahora = this.contexto.currentTime
    const release = Math.max(0.05, this.parametros.release)
    const envelope = voz.envolvente.gain

    try {
      envelope.cancelAndHoldAtTime(ahora)
    } catch {
      envelope.cancelScheduledValues(ahora)
    }
    envelope.setValueAtTime(Math.max(0.0001, envelope.value), ahora)
    envelope.exponentialRampToValueAtTime(0.0001, ahora + release)

    this.vocesEnLiberacion.add(voz)
    this.detenerVoz(voz, false, ahora + release + 0.08)
  }

  private detenerVoz(voz: Voz, inmediato: boolean, cuando?: number) {
    try {
      voz.osc1.stop(inmediato ? undefined : cuando)
      voz.osc2.stop(inmediato ? undefined : cuando)
    } catch {
      // La voz ya estaba detenida.
    }

    voz.osc1.onended = () => {
      this.desconectarVoz(voz)
      this.vocesEnLiberacion.delete(voz)
    }
    voz.osc2.onended = () => {
      this.desconectarVoz(voz)
    }

    if (inmediato) {
      this.desconectarVoz(voz)
      this.vocesEnLiberacion.delete(voz)
    }
  }

  private desconectarVoz(voz: Voz) {
    for (const nodo of [
      voz.osc1,
      voz.osc2,
      voz.ganancia1,
      voz.ganancia2,
      voz.filtro,
      voz.envolvente,
      voz.envioDelay,
    ]) {
      try {
        nodo.disconnect()
      } catch {
        // Nodo ya desconectado.
      }
    }
  }

  private limpiarGrabacion() {
    if (this.compresor && this.destinoGrabacion) {
      try {
        this.compresor.disconnect(this.destinoGrabacion)
      } catch {
        // Ya estaba desconectado.
      }
      for (const pista of this.destinoGrabacion.stream.getTracks()) {
        pista.stop()
      }
    }
    this.grabadora = null
    this.destinoGrabacion = null
    this.trozos = []
  }

  private saludoDeEncendido() {
    const notas = [48, 55, 60, 64, 67]
    for (const [indice, nota] of notas.entries()) {
      const exterior = window.setTimeout(() => {
        // Si el usuario ya está tocando esa nota, el saludo no debe
        // arrebatársela ni apagarla después.
        if (this.voces.has(nota)) return
        this.notaOn(nota, 0.32)
        const vozSaludo = this.voces.get(nota)
        const interior = window.setTimeout(() => {
          if (vozSaludo && this.voces.get(nota) === vozSaludo) {
            this.notaOff(nota)
          }
        }, 520)
        this.timersSaludo.push(interior)
      }, indice * 90)
      this.timersSaludo.push(exterior)
    }
  }
}

export const motor = new MotorSynth(PARAMETROS_INICIALES)
