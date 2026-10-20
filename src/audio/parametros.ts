export type Onda = 'sine' | 'triangle' | 'sawtooth' | 'square'

export type Parametros = {
  onda1: Onda
  onda2: Onda
  detune1: number
  detune2: number
  mezcla: number
  corte: number
  resonancia: number
  ataque: number
  decay: number
  sostenido: number
  release: number
  delayTiempo: number
  delayFeedback: number
  delayMezcla: number
  volumen: number
}

export type NombrePreset =
  | 'INICIO'
  | 'ÁMBAR'
  | 'VIDRIO'
  | 'CINTA'
  | 'NIEBLA'
  | 'MOTOR'

export type Preset = {
  nombre: NombrePreset
  descripcion: string
  parametros: Parametros
}

export const ONDAS: ReadonlyArray<{ id: Onda; nombre: string }> = [
  { id: 'sine', nombre: 'SENO' },
  { id: 'triangle', nombre: 'TRIÁNGULO' },
  { id: 'sawtooth', nombre: 'SIERRA' },
  { id: 'square', nombre: 'CUADRADA' },
]

export const RANGOS = {
  detune1: { min: -50, max: 50, paso: 1 },
  detune2: { min: -50, max: 50, paso: 1 },
  mezcla: { min: 0, max: 1, paso: 0.01 },
  corte: { min: 80, max: 12000, paso: 1 },
  resonancia: { min: 0.1, max: 18, paso: 0.1 },
  ataque: { min: 0.005, max: 2, paso: 0.005 },
  decay: { min: 0.03, max: 2, paso: 0.005 },
  sostenido: { min: 0, max: 1, paso: 0.01 },
  release: { min: 0.05, max: 4, paso: 0.005 },
  delayTiempo: { min: 0.04, max: 0.75, paso: 0.005 },
  delayFeedback: { min: 0, max: 0.82, paso: 0.01 },
  delayMezcla: { min: 0, max: 0.65, paso: 0.01 },
  volumen: { min: 0, max: 1, paso: 0.01 },
} as const

export type ParametroNumerico = keyof typeof RANGOS

const PRESET_INICIO: Parametros = {
  onda1: 'sawtooth',
  onda2: 'square',
  detune1: -7,
  detune2: 7,
  mezcla: 0.34,
  corte: 3200,
  resonancia: 3,
  ataque: 0.012,
  decay: 0.22,
  sostenido: 0.55,
  release: 0.6,
  delayTiempo: 0.28,
  delayFeedback: 0.28,
  delayMezcla: 0.16,
  volumen: 0.7,
}

export const PRESETS: ReadonlyArray<Preset> = [
  {
    nombre: 'INICIO',
    descripcion: 'El punto de partida. Sierra y cuadrada, apenas desalineadas.',
    parametros: PRESET_INICIO,
  },
  {
    nombre: 'ÁMBAR',
    descripcion: 'Un poli cálido y redondo, con la luz justa en los bordes.',
    parametros: {
      ...PRESET_INICIO,
      onda1: 'triangle',
      onda2: 'sawtooth',
      detune1: -4,
      detune2: 9,
      mezcla: 0.42,
      corte: 1900,
      resonancia: 2.4,
      ataque: 0.018,
      decay: 0.35,
      sostenido: 0.62,
      release: 0.9,
      delayTiempo: 0.36,
      delayFeedback: 0.3,
      delayMezcla: 0.2,
      volumen: 0.72,
    },
  },
  {
    nombre: 'VIDRIO',
    descripcion: 'Ataque corto, cola larga. Para arpegios que brillan.',
    parametros: {
      ...PRESET_INICIO,
      onda1: 'sine',
      onda2: 'triangle',
      detune1: 0,
      detune2: 6,
      mezcla: 0.55,
      corte: 7000,
      resonancia: 1.2,
      ataque: 0.006,
      decay: 0.5,
      sostenido: 0.18,
      release: 1.2,
      delayTiempo: 0.46,
      delayFeedback: 0.42,
      delayMezcla: 0.35,
      volumen: 0.66,
    },
  },
  {
    nombre: 'CINTA',
    descripcion: 'Dos sierras que se abrazan. Un acorde ancho y analógico.',
    parametros: {
      ...PRESET_INICIO,
      onda1: 'sawtooth',
      onda2: 'sawtooth',
      detune1: -11,
      detune2: 11,
      mezcla: 0.5,
      corte: 1400,
      resonancia: 3.8,
      ataque: 0.12,
      decay: 0.5,
      sostenido: 0.7,
      release: 1.6,
      delayTiempo: 0.5,
      delayFeedback: 0.38,
      delayMezcla: 0.24,
      volumen: 0.64,
    },
  },
  {
    nombre: 'NIEBLA',
    descripcion: 'Una nube lenta. Ideal para mantas armónicas y silencios.',
    parametros: {
      ...PRESET_INICIO,
      onda1: 'triangle',
      onda2: 'sine',
      detune1: -6,
      detune2: 6,
      mezcla: 0.6,
      corte: 800,
      resonancia: 1.6,
      ataque: 0.45,
      decay: 0.8,
      sostenido: 0.8,
      release: 2.6,
      delayTiempo: 0.62,
      delayFeedback: 0.55,
      delayMezcla: 0.38,
      volumen: 0.62,
    },
  },
  {
    nombre: 'MOTOR',
    descripcion: 'Grave, tenso y con mordida. La resonancia hace el trabajo.',
    parametros: {
      ...PRESET_INICIO,
      onda1: 'square',
      onda2: 'sawtooth',
      detune1: -14,
      detune2: 14,
      mezcla: 0.48,
      corte: 620,
      resonancia: 9,
      ataque: 0.008,
      decay: 0.18,
      sostenido: 0.38,
      release: 0.35,
      delayTiempo: 0.19,
      delayFeedback: 0.22,
      delayMezcla: 0.12,
      volumen: 0.58,
    },
  },
]

export const PRESET_POR_DEFECTO = PRESETS[1]
export const PARAMETROS_INICIALES = PRESET_POR_DEFECTO.parametros

export const clamp = (valor: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valor))

/**
 * Convierte un valor real a una posición 0..1. La escala logarítmica se usa
 * en frecuencias y tiempos para que el recorrido de la perilla sea musical.
 */
export function aNormalizado(
  valor: number,
  min: number,
  max: number,
  escala: 'lineal' | 'log' = 'lineal',
) {
  if (max === min) return 0
  if (escala === 'log') {
    return Math.log(valor / min) / Math.log(max / min)
  }
  return (valor - min) / (max - min)
}

export function desdeNormalizado(
  normalizado: number,
  min: number,
  max: number,
  escala: 'lineal' | 'log' = 'lineal',
) {
  const n = clamp(normalizado, 0, 1)
  if (escala === 'log') {
    return min * Math.pow(max / min, n)
  }
  return min + (max - min) * n
}

export function formatearFrecuencia(valor: number) {
  return valor >= 1000
    ? `${(valor / 1000).toFixed(valor >= 10000 ? 0 : 1)} kHz`
    : `${Math.round(valor)} Hz`
}

export function formatearTiempo(valor: number) {
  return valor >= 1
    ? `${valor.toFixed(2)} s`
    : `${Math.round(valor * 1000)} ms`
}

export function formatearPorcentaje(valor: number) {
  return `${Math.round(valor * 100)} %`
}

export function formatearDetune(valor: number) {
  return `${valor > 0 ? '+' : ''}${Math.round(valor)} ct`
}

export function esOnda(valor: unknown): valor is Onda {
  return (
    valor === 'sine' ||
    valor === 'triangle' ||
    valor === 'sawtooth' ||
    valor === 'square'
  )
}

/**
 * Sanea un patch externo antes de aplicarlo. Devuelve null si algún valor
 * declarado tiene un tipo incorrecto; los campos ausentes usan el preset base.
 */
export function normalizarPatch(datos: unknown): Parametros | null {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return null
  const objeto = datos as Record<string, unknown>
  const resultado: Parametros = { ...PARAMETROS_INICIALES }

  for (const clave of Object.keys(RANGOS) as ParametroNumerico[]) {
    if (!(clave in objeto)) continue
    const valor = objeto[clave]
    if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
    const rango = RANGOS[clave]
    resultado[clave] = clamp(valor, rango.min, rango.max)
  }

  for (const clave of ['onda1', 'onda2'] as const) {
    if (!(clave in objeto)) continue
    const valor = objeto[clave]
    if (!esOnda(valor)) return null
    resultado[clave] = valor
  }

  return resultado
}

function base64UrlDesdeTexto(texto: string) {
  return btoa(texto)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function textoDesdeBase64Url(codigo: string) {
  const base64 = codigo.replace(/-/g, '+').replace(/_/g, '/')
  const relleno = '='.repeat((4 - (base64.length % 4)) % 4)
  return atob(base64 + relleno)
}

export function codificarPatch(parametros: Parametros) {
  return base64UrlDesdeTexto(JSON.stringify(parametros))
}

export function decodificarPatch(codigo: string): Parametros | null {
  try {
    return normalizarPatch(JSON.parse(textoDesdeBase64Url(codigo)))
  } catch {
    return null
  }
}

export function leerPatchDeUrl(href: string): Parametros | null {
  try {
    const url = new URL(href)
    const codigo = new URLSearchParams(url.hash.replace(/^#/, '')).get('p')
    return codigo ? decodificarPatch(codigo) : null
  } catch {
    return null
  }
}
