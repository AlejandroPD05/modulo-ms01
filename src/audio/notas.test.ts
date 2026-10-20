import { describe, expect, it } from 'vitest'
import {
  NOTAS_BLANCAS,
  NOTAS_NEGRAS,
  TECLAS_COMPUTADORA,
  etiquetaDeTeclaParaNota,
  frecuenciaDeNota,
  nombreDeNota,
} from './notas'

describe('notas y teclado', () => {
  it('afina A4 y C4 según el temperamento igual', () => {
    expect(frecuenciaDeNota(69)).toBeCloseTo(440, 6)
    expect(frecuenciaDeNota(60)).toBeCloseTo(261.6256, 3)
  })

  it('nombra las notas en notación científica', () => {
    expect(nombreDeNota(60)).toBe('C4')
    expect(nombreDeNota(61)).toBe('C#4')
    expect(nombreDeNota(23)).toBe('B0')
    expect(nombreDeNota(24)).toBe('C1')
  })

  it('cubre dos octavas cromáticas sin duplicados', () => {
    const semitonos = [
      ...NOTAS_BLANCAS,
      ...NOTAS_NEGRAS.map((nota) => nota.semitono),
    ]
    expect(semitonos).toHaveLength(24)
    expect(new Set(semitonos).size).toBe(24)
    expect([...semitonos].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 24 }, (_, indice) => indice),
    )
  })

  it('traduce las teclas físicas a la octava visible', () => {
    expect(TECLAS_COMPUTADORA).toHaveLength(17)
    expect(etiquetaDeTeclaParaNota(48, 48)).toBe('A')
    expect(etiquetaDeTeclaParaNota(48, 55)).toBe('G')
    expect(etiquetaDeTeclaParaNota(48, 64)).toBe(';')
    expect(etiquetaDeTeclaParaNota(48, 36)).toBeUndefined()
  })
})
