export const NOMBRES_NOTA = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export function frecuenciaDeNota(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function nombreDeNota(midi: number) {
  const indice = ((midi % 12) + 12) % 12
  const octava = Math.floor(midi / 12) - 1
  return `${NOMBRES_NOTA[indice]}${octava}`
}

/**
 * Mapa de teclado de computadora: una octava cromática + La otra fila.
 * Las etiquetas se muestran en el teclado físico virtual.
 */
export const TECLAS_COMPUTADORA = [
  { codigo: 'KeyA', etiqueta: 'A', semitono: 0 },
  { codigo: 'KeyW', etiqueta: 'W', semitono: 1 },
  { codigo: 'KeyS', etiqueta: 'S', semitono: 2 },
  { codigo: 'KeyE', etiqueta: 'E', semitono: 3 },
  { codigo: 'KeyD', etiqueta: 'D', semitono: 4 },
  { codigo: 'KeyF', etiqueta: 'F', semitono: 5 },
  { codigo: 'KeyT', etiqueta: 'T', semitono: 6 },
  { codigo: 'KeyG', etiqueta: 'G', semitono: 7 },
  { codigo: 'KeyY', etiqueta: 'Y', semitono: 8 },
  { codigo: 'KeyH', etiqueta: 'H', semitono: 9 },
  { codigo: 'KeyU', etiqueta: 'U', semitono: 10 },
  { codigo: 'KeyJ', etiqueta: 'J', semitono: 11 },
  { codigo: 'KeyK', etiqueta: 'K', semitono: 12 },
  { codigo: 'KeyO', etiqueta: 'O', semitono: 13 },
  { codigo: 'KeyL', etiqueta: 'L', semitono: 14 },
  { codigo: 'KeyP', etiqueta: 'P', semitono: 15 },
  { codigo: 'Semicolon', etiqueta: ';', semitono: 16 },
] as const

export const NOTAS_BLANCAS = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23]
export const NOTAS_NEGRAS = [
  { semitono: 1, despuesDeBlanca: 0 },
  { semitono: 3, despuesDeBlanca: 1 },
  { semitono: 6, despuesDeBlanca: 3 },
  { semitono: 8, despuesDeBlanca: 4 },
  { semitono: 10, despuesDeBlanca: 5 },
  { semitono: 13, despuesDeBlanca: 7 },
  { semitono: 15, despuesDeBlanca: 8 },
  { semitono: 18, despuesDeBlanca: 10 },
  { semitono: 20, despuesDeBlanca: 11 },
  { semitono: 22, despuesDeBlanca: 12 },
]

export const esTeclaBlanca = (semitono: number) =>
  NOTAS_BLANCAS.includes(semitono)

export function etiquetaDeTeclaParaNota(baseMidi: number, midi: number) {
  return TECLAS_COMPUTADORA.find(
    (tecla) => baseMidi + tecla.semitono === midi,
  )?.etiqueta
}
