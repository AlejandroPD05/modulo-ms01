import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  aNormalizado,
  clamp,
  desdeNormalizado,
} from '../audio/parametros'

type Props = {
  etiqueta: string
  valor: number
  min: number
  max: number
  paso?: number
  escala?: 'lineal' | 'log'
  formatear: (valor: number) => string
  onChange: (valor: number) => void
  valorPorDefecto?: number
  tamano?: 'pequena' | 'mediana' | 'grande'
}

type Arrastre = {
  y: number
  normalizado: number
}

function redondear(valor: number, paso: number) {
  const decimales = (String(paso).split('.')[1] ?? '').length
  return Number((Math.round(valor / paso) * paso).toFixed(decimales))
}

export function Perilla({
  etiqueta,
  valor,
  min,
  max,
  paso = 0.01,
  escala = 'lineal',
  formatear,
  onChange,
  valorPorDefecto,
  tamano = 'mediana',
}: Props) {
  const [arrastrando, setArrastrando] = useState(false)
  const arrastre = useRef<Arrastre | null>(null)
  const normalizado = clamp(aNormalizado(valor, min, max, escala), 0, 1)
  const angulo = -135 + normalizado * 270

  const aplicar = (nuevoNormalizado: number) => {
    const nuevo = desdeNormalizado(nuevoNormalizado, min, max, escala)
    onChange(clamp(redondear(nuevo, paso), min, max))
  }

  const alBajar = (evento: PointerEvent<HTMLDivElement>) => {
    if (evento.button !== 0) return
    evento.preventDefault()
    evento.currentTarget.focus()
    evento.currentTarget.setPointerCapture(evento.pointerId)
    arrastre.current = { y: evento.clientY, normalizado }
    setArrastrando(true)
  }

  const alMover = (evento: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current) return
    const sensibilidad = evento.shiftKey ? 520 : 210
    const delta = (arrastre.current.y - evento.clientY) / sensibilidad
    aplicar(clamp(arrastre.current.normalizado + delta, 0, 1))
  }

  const alSoltar = (evento: PointerEvent<HTMLDivElement>) => {
    if (!arrastre.current) return
    arrastre.current = null
    setArrastrando(false)
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId)
    }
  }

  const alTeclear = (evento: KeyboardEvent<HTMLDivElement>) => {
    const salto = evento.shiftKey ? 0.002 : 0.012
    let objetivo = normalizado
    switch (evento.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        objetivo += salto
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        objetivo -= salto
        break
      case 'PageUp':
        objetivo += 0.06
        break
      case 'PageDown':
        objetivo -= 0.06
        break
      case 'Home':
        objetivo = 0
        break
      case 'End':
        objetivo = 1
        break
      default:
        return
    }
    evento.preventDefault()
    aplicar(clamp(objetivo, 0, 1))
  }

  return (
    <div className={`perilla perilla--${tamano}`}>
      <span className="perilla__etiqueta">{etiqueta}</span>
      <div
        className={`perilla__control ${arrastrando ? 'is-arrastrando' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label={etiqueta}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(valor.toFixed(3))}
        aria-valuetext={formatear(valor)}
        aria-orientation="vertical"
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onDoubleClick={() =>
          valorPorDefecto !== undefined && onChange(valorPorDefecto)
        }
        onKeyDown={alTeclear}
        title={`${etiqueta} · arrastra o usa las flechas · doble clic para reiniciar`}
      >
        <span
          className="perilla__aro"
          style={{ '--giro': `${angulo}deg` } as CSSProperties}
          aria-hidden="true"
        >
          <span className="perilla__cuerpo">
            <span className="perilla__indicador" />
          </span>
        </span>
      </div>
      <output className="perilla__valor">{formatear(valor)}</output>
    </div>
  )
}
