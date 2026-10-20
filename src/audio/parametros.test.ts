import { describe, expect, it } from 'vitest'
import {
  PRESETS,
  RANGOS,
  aNormalizado,
  codificarPatch,
  decodificarPatch,
  desdeNormalizado,
  formatearFrecuencia,
  leerPatchDeUrl,
  normalizarPatch,
} from './parametros'

describe('parámetros del sintetizador', () => {
  it('define seis presets dentro de los rangos permitidos', () => {
    expect(PRESETS).toHaveLength(6)
    for (const preset of PRESETS) {
      expect(preset.parametros.corte).toBeGreaterThanOrEqual(RANGOS.corte.min)
      expect(preset.parametros.corte).toBeLessThanOrEqual(RANGOS.corte.max)
      expect(preset.parametros.volumen).toBeGreaterThanOrEqual(0)
      expect(preset.parametros.volumen).toBeLessThanOrEqual(1)
    }
  })

  it('mapea una perilla logarítmica de forma reversible', () => {
    const min = 80
    const max = 12000
    expect(aNormalizado(min, min, max, 'log')).toBeCloseTo(0)
    expect(aNormalizado(max, min, max, 'log')).toBeCloseTo(1)
    expect(aNormalizado(1000, min, max, 'log')).toBeGreaterThan(0.4)
    expect(aNormalizado(1000, min, max, 'log')).toBeLessThan(0.6)
    const vuelta = desdeNormalizado(
      aNormalizado(2400, min, max, 'log'),
      min,
      max,
      'log',
    )
    expect(vuelta).toBeCloseTo(2400, 4)
  })

  it('formatea frecuencias para la pantalla', () => {
    expect(formatearFrecuencia(420)).toBe('420 Hz')
    expect(formatearFrecuencia(2400)).toBe('2.4 kHz')
    expect(formatearFrecuencia(12000)).toBe('12 kHz')
  })
})

describe('patches compartibles', () => {
  it('codifica y decodifica un patch sin perder parámetros', () => {
    const original = PRESETS[4].parametros
    const codigo = codificarPatch(original)
    expect(codigo).not.toContain('+')
    expect(codigo).not.toContain('/')
    expect(decodificarPatch(codigo)).toEqual(original)
  })

  it('recorta valores fuera de rango y rechaza tipos incorrectos', () => {
    const saneado = normalizarPatch({
      corte: 999999,
      volumen: -3,
      onda1: 'triangle',
    })
    expect(saneado?.corte).toBe(RANGOS.corte.max)
    expect(saneado?.volumen).toBe(0)
    expect(saneado?.onda1).toBe('triangle')
    expect(normalizarPatch({ corte: 'mucho' })).toBeNull()
    expect(normalizarPatch({ onda2: 'ruido' })).toBeNull()
    expect(normalizarPatch(null)).toBeNull()
  })

  it('lee el patch desde el hash de la URL', () => {
    const parametros = PRESETS[2].parametros
    const href = `https://modulo.test/#p=${codificarPatch(parametros)}`
    expect(leerPatchDeUrl(href)).toEqual(parametros)
    expect(leerPatchDeUrl('https://modulo.test/#p=no-es-base64')).toBeNull()
  })
})
