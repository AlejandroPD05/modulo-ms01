import type { Onda } from '../audio/parametros'

const ICONOS: Record<Onda, string> = {
  sine: 'M2 12 C6 2 10 2 14 12 S22 22 26 12',
  triangle: 'M2 12 L7 4 L17 20 L22 12',
  sawtooth: 'M2 18 L10 4 L10 18 L18 4 L18 18 L26 4',
  square: 'M2 18 L2 6 L10 6 L10 18 L18 18 L18 6 L26 6',
}

type Props = {
  valor: Onda
  onChange: (onda: Onda) => void
  etiqueta: string
  compacto?: boolean
}

const OPCIONES: Array<{ id: Onda; nombre: string }> = [
  { id: 'sine', nombre: 'Seno' },
  { id: 'triangle', nombre: 'Triángulo' },
  { id: 'sawtooth', nombre: 'Sierra' },
  { id: 'square', nombre: 'Cuadrada' },
]

export function SelectorOnda({ valor, onChange, etiqueta, compacto }: Props) {
  return (
    <div
      className={`selector-onda ${compacto ? 'selector-onda--compacto' : ''}`}
      role="group"
      aria-label={etiqueta}
    >
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.id}
          type="button"
          className={`selector-onda__boton ${valor === opcion.id ? 'is-activa' : ''}`}
          aria-label={`${etiqueta}: ${opcion.nombre}`}
          aria-pressed={valor === opcion.id}
          onClick={() => onChange(opcion.id)}
          title={opcion.nombre}
        >
          <svg viewBox="0 0 28 24" aria-hidden="true">
            <path d={ICONOS[opcion.id]} />
          </svg>
          {!compacto && <span>{opcion.nombre.toUpperCase()}</span>}
        </button>
      ))}
    </div>
  )
}
