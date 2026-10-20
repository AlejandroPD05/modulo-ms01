import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  NOTAS_BLANCAS,
  NOTAS_NEGRAS,
  TECLAS_COMPUTADORA,
  etiquetaDeTeclaParaNota,
  nombreDeNota,
} from '../audio/notas'
import { useSynth } from '../estado/useSynth'
import { useMediaQuery } from '../utiles/useMediaQuery'

export function Teclado() {
  const [octava, setOctava] = useState(3)
  const unaOctava = useMediaQuery('(max-width: 640px)')
  const notasActivas = useSynth((estado) => estado.notasActivas)
  const notaOn = useSynth((estado) => estado.notaOn)
  const notaOff = useSynth((estado) => estado.notaOff)
  const pulsadas = useRef(new Map<string, number>())

  const baseMidi = 12 * (octava + 1)
  const blancas = unaOctava ? NOTAS_BLANCAS.slice(0, 7) : NOTAS_BLANCAS
  const negras = unaOctava
    ? NOTAS_NEGRAS.filter((nota) => nota.semitono < 12)
    : NOTAS_NEGRAS
  const ultimaNota = baseMidi + (unaOctava ? 11 : 23)

  useEffect(() => {
    const mapaPulsadas = pulsadas.current

    const alBajar = (evento: KeyboardEvent) => {
      if (evento.repeat || evento.ctrlKey || evento.metaKey || evento.altKey) {
        return
      }
      const objetivo = evento.target
      if (
        objetivo instanceof HTMLElement &&
        objetivo.closest(
          'input, textarea, select, [contenteditable="true"]',
        )
      ) {
        return
      }

      const tecla = TECLAS_COMPUTADORA.find(
        (candidata) => candidata.codigo === evento.code,
      )
      if (
        !tecla ||
        tecla.semitono >= (unaOctava ? 12 : 24) ||
        mapaPulsadas.has(evento.code)
      ) {
        return
      }
      evento.preventDefault()
      const midi = baseMidi + tecla.semitono
      mapaPulsadas.set(evento.code, midi)
      notaOn(midi)
    }

    const alSubir = (evento: KeyboardEvent) => {
      const midi = mapaPulsadas.get(evento.code)
      if (midi === undefined) return
      evento.preventDefault()
      mapaPulsadas.delete(evento.code)
      notaOff(midi)
    }

    const alPerderFoco = () => {
      for (const midi of mapaPulsadas.values()) notaOff(midi)
      mapaPulsadas.clear()
    }

    window.addEventListener('keydown', alBajar)
    window.addEventListener('keyup', alSubir)
    window.addEventListener('blur', alPerderFoco)
    document.addEventListener('visibilitychange', alPerderFoco)

    return () => {
      window.removeEventListener('keydown', alBajar)
      window.removeEventListener('keyup', alSubir)
      window.removeEventListener('blur', alPerderFoco)
      document.removeEventListener('visibilitychange', alPerderFoco)
      for (const midi of mapaPulsadas.values()) notaOff(midi)
      mapaPulsadas.clear()
    }
  }, [baseMidi, notaOn, notaOff, unaOctava])

  const cambiarOctava = (delta: number) => {
    const nueva = Math.min(5, Math.max(1, octava + delta))
    if (nueva === octava) return
    setOctava(nueva)
  }

  const empezarNota = (midi: number) => {
    notaOn(midi)
  }

  const terminarNota = (midi: number) => {
    notaOff(midi)
  }

  const alPulsarTecla = (
    evento: ReactPointerEvent<HTMLButtonElement>,
    midi: number,
  ) => {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return
    evento.preventDefault()
    evento.currentTarget.setPointerCapture(evento.pointerId)
    empezarNota(midi)
  }

  const alSoltarTecla = (
    evento: ReactPointerEvent<HTMLButtonElement>,
    midi: number,
  ) => {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
    terminarNota(midi)
  }

  const alPerderCaptura = (midi: number) => {
    terminarNota(midi)
  }

  const alTeclearTecla = (
    evento: ReactKeyboardEvent<HTMLButtonElement>,
    midi: number,
  ) => {
    if (evento.key !== ' ' && evento.key !== 'Enter') return
    evento.preventDefault()
    if (!evento.repeat) empezarNota(midi)
  }

  const alSoltarTeclaTeclado = (
    evento: ReactKeyboardEvent<HTMLButtonElement>,
    midi: number,
  ) => {
    if (evento.key !== ' ' && evento.key !== 'Enter') return
    evento.preventDefault()
    terminarNota(midi)
  }

  return (
    <section className="teclado" aria-label="Teclado del sintetizador">
      <div className="teclado__barra">
        <div className="octava">
          <span className="octava__etiqueta">OCTAVA</span>
          <button
            type="button"
            onClick={() => cambiarOctava(-1)}
            aria-label="Bajar una octava"
            title="Bajar una octava"
          >
            −
          </button>
          <span className="octava__valor">
            {nombreDeNota(baseMidi)} <i>—</i> {nombreDeNota(ultimaNota)}
          </span>
          <button
            type="button"
            onClick={() => cambiarOctava(1)}
            aria-label="Subir una octava"
            title="Subir una octava"
          >
            +
          </button>
        </div>
        <span className="teclado__division" aria-hidden="true" />
        <span className="teclado__ayuda">
          TECLAS: A W S E D F T G Y H U J K O L P ;
        </span>
        <span className="teclado__voces" aria-hidden="true">
          {unaOctava ? '1 OCTAVA' : '2 OCTAVAS'} · 8 VOCES
        </span>
      </div>

      <div className="teclado__marco">
        <div className="teclado__blancas">
          {blancas.map((semitono) => {
            const midi = baseMidi + semitono
            const activa = notasActivas.includes(midi)
            const atajo = etiquetaDeTeclaParaNota(baseMidi, midi)
            return (
              <button
                key={semitono}
                type="button"
                className={`tecla tecla--blanca ${activa ? 'is-activa' : ''}`}
                aria-label={`Tocar ${nombreDeNota(midi)}`}
                aria-pressed={activa}
                onPointerDown={(evento) => alPulsarTecla(evento, midi)}
                onPointerUp={(evento) => alSoltarTecla(evento, midi)}
                onPointerCancel={(evento) => alSoltarTecla(evento, midi)}
                onLostPointerCapture={() => alPerderCaptura(midi)}
                onKeyDown={(evento) => alTeclearTecla(evento, midi)}
                onKeyUp={(evento) => alSoltarTeclaTeclado(evento, midi)}
              >
                {atajo && <span className="tecla__atajo">{atajo}</span>}
                <span className="tecla__nota">{nombreDeNota(midi)}</span>
              </button>
            )
          })}
        </div>
        <div className="teclado__negras">
          {negras.map((negra) => {
            const midi = baseMidi + negra.semitono
            const activa = notasActivas.includes(midi)
            const atajo = etiquetaDeTeclaParaNota(baseMidi, midi)
            return (
              <button
                key={negra.semitono}
                type="button"
                className={`tecla tecla--negra ${activa ? 'is-activa' : ''}`}
                style={
                  {
                    '--after': negra.despuesDeBlanca,
                    '--total': blancas.length,
                  } as CSSProperties
                }
                aria-label={`Tocar ${nombreDeNota(midi)}`}
                aria-pressed={activa}
                onPointerDown={(evento) => alPulsarTecla(evento, midi)}
                onPointerUp={(evento) => alSoltarTecla(evento, midi)}
                onPointerCancel={(evento) => alSoltarTecla(evento, midi)}
                onLostPointerCapture={() => alPerderCaptura(midi)}
                onKeyDown={(evento) => alTeclearTecla(evento, midi)}
                onKeyUp={(evento) => alSoltarTeclaTeclado(evento, midi)}
              >
                {atajo && <span className="tecla__atajo">{atajo}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
