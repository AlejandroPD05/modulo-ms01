import type { Parametros } from '../audio/parametros'

type Props = Pick<Parametros, 'corte' | 'resonancia'>

export function CurvaFiltro({ corte, resonancia }: Props) {
  const normalizado =
    Math.log(Math.max(80, corte) / 80) / Math.log(12000 / 80)
  const x = 10 + normalizado * 180
  const pico = 4 + (resonancia / 18) * 13
  const inicio = Math.max(10, x - 24)
  const final = Math.min(228, x + 20)
  const camino = `M8 30 L${inicio} 30 C${(inicio + x) / 2} 30 ${x - 8} ${30 - pico} ${x} ${30 - pico} C${x + 8} ${30 - pico} ${x + 8} 43 ${final} 55 L232 58`

  return (
    <svg
      className="grafico grafico--filtro"
      viewBox="0 0 240 70"
      role="img"
      aria-label="Respuesta del filtro paso bajo"
    >
      <g className="grafico__rejilla">
        <line x1="8" y1="30" x2="232" y2="30" />
        <line x1="8" y1="45" x2="232" y2="45" />
        <line x1="8" y1="58" x2="232" y2="58" />
        <line x1="8" y1="12" x2="8" y2="58" />
        <line x1="90" y1="12" x2="90" y2="58" />
        <line x1="174" y1="12" x2="174" y2="58" />
      </g>
      <path d={`${camino} L232 58 L8 58 Z`} className="grafico__relleno" />
      <path d={camino} className="grafico__linea grafico__linea--filtro" />
      <line
        x1={x}
        y1="12"
        x2={x}
        y2="58"
        className="grafico__cursor"
      />
      <circle cx={x} cy={30 - pico} r="2.8" className="grafico__punto" />
      <g className="grafico__etiquetas">
        <text x="13" y="67">
          100
        </text>
        <text x="87" y="67">
          1k
        </text>
        <text x="169" y="67">
          10k
        </text>
      </g>
    </svg>
  )
}
