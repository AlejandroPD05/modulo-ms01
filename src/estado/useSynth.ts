import { create } from 'zustand'
import { motor } from '../audio/motor'
import {
  PRESETS,
  PRESET_POR_DEFECTO,
  codificarPatch,
  leerPatchDeUrl,
  type NombrePreset,
  type Onda,
  type ParametroNumerico,
  type Parametros,
} from '../audio/parametros'

type NavigatorConMidi = Navigator & {
  requestMIDIAccess?: () => Promise<MIDIAccess>
}

type EstadoSynth = {
  parametros: Parametros
  preset: string
  encendido: boolean
  notasActivas: number[]
  midiActivo: boolean
  grabando: boolean
  inicioGrabacion: number | null
  demoActivo: boolean
  mensaje: string | null
  compartido: boolean
  cambiarParametro: (clave: ParametroNumerico, valor: number) => void
  cambiarOnda: (clave: 'onda1' | 'onda2', valor: Onda) => void
  aplicarPreset: (nombre: NombrePreset) => void
  encender: () => Promise<void>
  apagar: () => Promise<void>
  notaOn: (midi: number) => void
  notaOff: (midi: number) => void
  alternarGrabacion: () => Promise<void>
  alternarMidi: () => Promise<void>
  tocarDemo: () => Promise<void>
  detenerDemo: () => void
  compartir: () => Promise<void>
  limpiarMensaje: () => void
}

const patchDeUrl = leerPatchDeUrl(window.location.href)
const parametrosIniciales: Parametros = patchDeUrl
  ? { ...patchDeUrl }
  : { ...PRESET_POR_DEFECTO.parametros }

motor.actualizar(parametrosIniciales)

let demoTimers: number[] = []
let accesoMidi: MIDIAccess | null = null
const notasMidiActivas = new Set<number>()
const notasDemoActivas = new Set<number>()

const limpiarDemo = () => {
  for (const timer of demoTimers) window.clearTimeout(timer)
  demoTimers = []
}

const limpiarHash = () => {
  if (!window.location.hash) return
  history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}`,
  )
}

const descargarBlob = (blob: Blob) => {
  const tipo = blob.type.toLowerCase()
  const extension = tipo.includes('ogg')
    ? 'ogg'
    : tipo.includes('mp4')
      ? 'm4a'
      : 'webm'
  const enlace = document.createElement('a')
  const url = URL.createObjectURL(blob)
  enlace.href = url
  enlace.download = `modulo-ms01-${new Date().toISOString().slice(0, 10)}.${extension}`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    // Algunos navegadores niegan la API sin permisos explícitos. El área de
    // texto temporal mantiene la función útil en ese caso.
    const area = document.createElement('textarea')
    area.value = texto
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    area.setSelectionRange(0, area.value.length)
    let copiado: boolean
    try {
      copiado = document.execCommand('copy')
    } catch {
      copiado = false
    }
    area.remove()
    return copiado
  }
}

export const useSynth = create<EstadoSynth>((set, get) => ({
  parametros: parametrosIniciales,
  preset: patchDeUrl ? 'PATCH' : PRESET_POR_DEFECTO.nombre,
  encendido: false,
  notasActivas: [],
  midiActivo: false,
  grabando: false,
  inicioGrabacion: null,
  demoActivo: false,
  mensaje: patchDeUrl ? 'PATCH RECIBIDO · PULSA ENCENDER' : null,
  compartido: false,

  cambiarParametro: (clave, valor) => {
    const parametros = { ...get().parametros, [clave]: valor }
    motor.actualizar(parametros)
    limpiarHash()
    set({ parametros, preset: 'PATCH', compartido: false })
  },

  cambiarOnda: (clave, valor) => {
    const parametros = { ...get().parametros, [clave]: valor }
    motor.actualizar(parametros)
    limpiarHash()
    set({ parametros, preset: 'PATCH', compartido: false })
  },

  aplicarPreset: (nombre) => {
    const preset = PRESETS.find((item) => item.nombre === nombre)
    if (!preset) return
    const parametros = { ...preset.parametros }
    motor.actualizar(parametros)
    limpiarHash()
    set({
      parametros,
      preset: preset.nombre,
      compartido: false,
      mensaje: null,
    })
  },

  encender: async () => {
    if (get().encendido) {
      await motor.iniciar()
      return
    }
    try {
      await motor.iniciar()
      set({ encendido: true, mensaje: null })
    } catch {
      set({ mensaje: 'NO SE PUDO INICIAR EL AUDIO' })
    }
  },

  apagar: async () => {
    limpiarDemo()
    notasMidiActivas.clear()
    notasDemoActivas.clear()
    if (get().grabando) {
      const blob = await motor.detenerGrabacion()
      if (blob) descargarBlob(blob)
    }
    await motor.apagar()
    set({
      encendido: false,
      notasActivas: [],
      demoActivo: false,
      grabando: false,
      inicioGrabacion: null,
      mensaje: null,
    })
  },

  notaOn: (midi) => {
    const yaActiva = get().notasActivas.includes(midi)
    if (!yaActiva) {
      set((estado) => ({
        notasActivas: [...estado.notasActivas, midi],
        mensaje: null,
      }))
    }

    if (!get().encendido || motor.estadoAudio !== 'running') {
      void get()
        .encender()
        .then(() => {
          if (!get().encendido) {
            set((estado) => ({
              notasActivas: estado.notasActivas.filter((nota) => nota !== midi),
            }))
            return
          }
          if (get().notasActivas.includes(midi)) motor.notaOn(midi)
        })
      return
    }

    motor.notaOn(midi)
  },

  notaOff: (midi) => {
    notasDemoActivas.delete(midi)
    motor.notaOff(midi)
    set((estado) => ({
      notasActivas: estado.notasActivas.filter((nota) => nota !== midi),
    }))
  },

  alternarGrabacion: async () => {
    if (get().grabando) {
      const blob = await motor.detenerGrabacion()
      set({
        grabando: false,
        inicioGrabacion: null,
        mensaje: blob
          ? 'GRABACIÓN EXPORTADA'
          : 'NO HAY AUDIO PARA EXPORTAR',
      })
      if (blob) descargarBlob(blob)
      return
    }

    if (!get().encendido || motor.estadoAudio !== 'running') {
      await get().encender()
    }
    if (!get().encendido) return
    let iniciada: boolean
    try {
      iniciada = await motor.iniciarGrabacion()
    } catch {
      set({ mensaje: 'NO SE PUDO INICIAR LA GRABACIÓN' })
      return
    }
    set(
      iniciada
        ? {
            grabando: true,
            inicioGrabacion: Date.now(),
            mensaje: null,
          }
        : { mensaje: 'TU NAVEGADOR NO PERMITE GRABAR AUDIO' },
    )
  },

  alternarMidi: async () => {
    if (get().midiActivo) {
      for (const nota of notasMidiActivas) get().notaOff(nota)
      notasMidiActivas.clear()
      if (accesoMidi) {
        accesoMidi.inputs.forEach((entrada) => {
          entrada.onmidimessage = null
        })
        accesoMidi.onstatechange = null
      }
      accesoMidi = null
      set({ midiActivo: false, mensaje: 'MIDI DESCONECTADO' })
      return
    }

    const nav = navigator as NavigatorConMidi
    if (!nav.requestMIDIAccess) {
      set({ mensaje: 'WEB MIDI NO ESTÁ DISPONIBLE EN ESTE NAVEGADOR' })
      return
    }

    try {
      const acceso = await nav.requestMIDIAccess()
      const enlazar = () => {
        acceso.inputs.forEach((entrada) => {
          entrada.onmidimessage = (evento) => {
            if (!evento.data) return
            const [estado, nota, velocidad] = evento.data
            const comando = estado & 0xf0
            if (comando === 0x90 && velocidad > 0) {
              notasMidiActivas.add(nota)
              get().notaOn(nota)
            } else if (comando === 0x80 || (comando === 0x90 && !velocidad)) {
              notasMidiActivas.delete(nota)
              get().notaOff(nota)
            }
          }
        })
      }
      enlazar()
      acceso.onstatechange = enlazar
      accesoMidi = acceso
      set({ midiActivo: true, mensaje: 'MIDI CONECTADO' })
    } catch {
      set({ mensaje: 'NO SE PUDO ACCEDER AL MIDI' })
    }
  },

  tocarDemo: async () => {
    if (get().demoActivo) get().detenerDemo()
    limpiarDemo()
    if (!get().encendido || motor.estadoAudio !== 'running') {
      await get().encender()
    }
    if (!get().encendido) return
    set({ demoActivo: true, mensaje: null })

    const notaDemoOn = (nota: number) => {
      if (get().notasActivas.includes(nota)) return
      notasDemoActivas.add(nota)
      get().notaOn(nota)
    }
    const notaDemoOff = (nota: number) => {
      if (!notasDemoActivas.delete(nota)) return
      get().notaOff(nota)
    }

    const patron: Array<[number, number, number]> = [
      [0, 48, 480],
      [160, 55, 480],
      [320, 60, 520],
      [480, 63, 520],
      [640, 67, 620],
      [800, 70, 620],
      [960, 72, 760],
      [1120, 75, 760],
      [1380, 48, 1500],
      [1380, 55, 1500],
      [1380, 63, 1500],
      [1380, 67, 1500],
      [2200, 48, 1400],
      [2200, 60, 1400],
      [2200, 67, 1400],
      [2200, 72, 1400],
    ]

    for (const [cuando, nota, duracion] of patron) {
      demoTimers.push(
        window.setTimeout(() => notaDemoOn(nota), cuando),
        window.setTimeout(() => notaDemoOff(nota), cuando + duracion),
      )
    }

    demoTimers.push(
      window.setTimeout(() => {
        for (const nota of [...notasDemoActivas]) notaDemoOff(nota)
        set({ demoActivo: false })
        demoTimers = []
      }, 3800),
    )
  },

  detenerDemo: () => {
    limpiarDemo()
    for (const nota of [...notasDemoActivas]) get().notaOff(nota)
    notasDemoActivas.clear()
    set({ demoActivo: false })
  },

  compartir: async () => {
    const codigo = codificarPatch(get().parametros)
    const url = new URL(window.location.href)
    url.hash = `p=${codigo}`
    try {
      history.replaceState(null, '', url.toString())
    } catch {
      // file:// puede no permitir replaceState; el portapapeles sigue funcionando.
    }

    const copiado = await copiarTexto(url.toString())
    set(
      copiado
        ? { compartido: true, mensaje: 'ENLACE COPIADO AL PORTAPAPELES' }
        : {
            compartido: false,
            mensaje: 'EL ENLACE ESTÁ EN LA BARRA DE DIRECCIONES',
          },
    )

    window.setTimeout(() => set({ compartido: false }), 2400)
  },

  limpiarMensaje: () => set({ mensaje: null }),
}))
