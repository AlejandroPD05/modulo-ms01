import type { Parametros } from '../audio/parametros'

type Props = Pick<
  Parametros,
  'ataque' | 'decay' | 'sostenido' | 'release'
>

export function Envolvente({ ataque, decay, sostenido, release }: Props) {
  const total = ataque + decay + release + 0.35
  const x1 = Math.max(18, 12 + (ataque / total) * 170)
  const x2 = x1 + Math.max(20, (decay / total) * 170)
  const x3 = Math.min(184, x2 + 34)
  const x4 = Math.min(232, x3 + Math.max(18, (release / total) * 170))
  const ySostenido = 62 - sostenido * 44
  const camino = `M12 62 L${x1.toFixed(1)} 15 L${x2.toFixed(1)} ${ySostenido.toFixed(1)} L${x3.toFixed(1)} ${ySostenido.toFixed(1)} L${x4.toFixed(1)} 62`

  return (
    <svg
      className="grafico grafico--envolvente"
      viewBox="0 0 240 78"
      role="img"
      aria-label="Forma de la envolvente ADSR"
    >
      <g className="grafico__rejilla">
        <line x1="12" y1="15" x2="232" y2="15" />
        <line x1="12" y1="38.5" x2="232" y2="38.5" />
        <line x1="12" y1="62" x2="232" y2="62" />
      </g>
      <path
        d={`${camino} L12 62 Z`}
        className="grafico__relleno"
      />
      <path d={camino} className="grafico__linea" />
      <g className="grafico__puntos">
        <circle cx={x1} cy="15" r="2.3" />
        <circle cx={x2} cy={ySostenido} r="2.3" />
        <circle cx={x3} cy={ySostenido} r="2.3" />
        <circle cx={x4} cy="62" r="2.3" />
      </g>
      <g className="grafico__etiquetas">
        <text x={Math.max(12, (12 + x1) / 2 - 2)} y="74">
          A
        </text>
        <text x={Math.max(x1 + 8, (x1 + x2) / 2 - 2)} y="74">
          D
        </text>
        <text x={(x2 + x3) / 2 - 2} y="74">
          S
        </text>
        <text x={Math.min(232, (x3 + x4) / 2 - 2)} y="74">
          R
        </text>
      </g>
    </svg>
  )
}
