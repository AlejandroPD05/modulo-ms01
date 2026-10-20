import {
  ONDAS,
  PARAMETROS_INICIALES,
  formatearDetune,
  formatearFrecuencia,
  formatearPorcentaje,
  formatearTiempo,
  type ParametroNumerico,
} from '../audio/parametros'
import { useSynth } from '../estado/useSynth'
import { CurvaFiltro } from './CurvaFiltro'
import { Envolvente } from './Envolvente'
import { Modulo } from './Modulo'
import { Perilla } from './Perilla'
import { SelectorOnda } from './SelectorOnda'

function useControl(clave: ParametroNumerico) {
  const valor = useSynth((estado) => estado.parametros[clave])
  const cambiar = useSynth((estado) => estado.cambiarParametro)
  return [valor, (nuevo: number) => cambiar(clave, nuevo)] as const
}

function PanelOsciladores() {
  const onda1 = useSynth((estado) => estado.parametros.onda1)
  const onda2 = useSynth((estado) => estado.parametros.onda2)
  const cambiarOnda = useSynth((estado) => estado.cambiarOnda)
  const [detune1, setDetune1] = useControl('detune1')
  const [detune2, setDetune2] = useControl('detune2')
  const [mezcla, setMezcla] = useControl('mezcla')

  const nombreOnda = (onda: typeof onda1) =>
    ONDAS.find((item) => item.id === onda)?.nombre ?? onda

  return (
    <Modulo numero="01" titulo="Osciladores" className="modulo--osc">
      <div className="oscilador">
        <div className="oscilador__fila">
          <div className="oscilador__canal">
            <div className="control-cabecera">
              <span>OSC 1</span>
              <em>{nombreOnda(onda1)}</em>
            </div>
            <SelectorOnda
              valor={onda1}
              onChange={(onda) => cambiarOnda('onda1', onda)}
              etiqueta="Onda del oscilador 1"
              compacto
            />
          </div>
          <Perilla
            etiqueta="TUNE 1"
            valor={detune1}
            min={-50}
            max={50}
            paso={1}
            formatear={formatearDetune}
            onChange={setDetune1}
            valorPorDefecto={PARAMETROS_INICIALES.detune1}
            tamano="pequena"
          />
        </div>

        <div className="oscilador__fila">
          <div className="oscilador__canal">
            <div className="control-cabecera">
              <span>OSC 2</span>
              <em>{nombreOnda(onda2)}</em>
            </div>
            <SelectorOnda
              valor={onda2}
              onChange={(onda) => cambiarOnda('onda2', onda)}
              etiqueta="Onda del oscilador 2"
              compacto
            />
          </div>
          <Perilla
            etiqueta="TUNE 2"
            valor={detune2}
            min={-50}
            max={50}
            paso={1}
            formatear={formatearDetune}
            onChange={setDetune2}
            valorPorDefecto={PARAMETROS_INICIALES.detune2}
            tamano="pequena"
          />
        </div>

        <div className="oscilador__mezcla">
          <Perilla
            etiqueta="MEZCLA"
            valor={mezcla}
            min={0}
            max={1}
            paso={0.01}
            formatear={formatearPorcentaje}
            onChange={setMezcla}
            valorPorDefecto={PARAMETROS_INICIALES.mezcla}
          />
          <div className="mezcla" aria-hidden="true">
            <span style={{ opacity: 1 - mezcla * 0.75 }}>1</span>
            <i>
              <b style={{ width: `${mezcla * 100}%` }} />
            </i>
            <span style={{ opacity: 0.35 + mezcla * 0.65 }}>2</span>
          </div>
        </div>
      </div>
    </Modulo>
  )
}

function PanelFiltro() {
  const [corte, setCorte] = useControl('corte')
  const [resonancia, setResonancia] = useControl('resonancia')

  return (
    <Modulo numero="02" titulo="Filtro" className="modulo--filtro">
      <div className="filtro">
        <div className="filtro__perillas">
          <Perilla
            etiqueta="CORTE"
            valor={corte}
            min={80}
            max={12000}
            paso={1}
            escala="log"
            formatear={formatearFrecuencia}
            onChange={setCorte}
            valorPorDefecto={PARAMETROS_INICIALES.corte}
            tamano="grande"
          />
          <Perilla
            etiqueta="RESONANCIA"
            valor={resonancia}
            min={0.1}
            max={18}
            paso={0.1}
            formatear={(valor) => `${valor.toFixed(1)} Q`}
            onChange={setResonancia}
            valorPorDefecto={PARAMETROS_INICIALES.resonancia}
          />
        </div>
        <CurvaFiltro corte={corte} resonancia={resonancia} />
        <span className="filtro__tipo">
          <i aria-hidden="true" />
          PASO BAJO · 12 DB
        </span>
      </div>
    </Modulo>
  )
}

function PanelEnvolvente() {
  const [ataque, setAtaque] = useControl('ataque')
  const [decay, setDecay] = useControl('decay')
  const [sostenido, setSostenido] = useControl('sostenido')
  const [release, setRelease] = useControl('release')

  return (
    <Modulo numero="03" titulo="Envolvente" className="modulo--env">
      <div className="envolvente">
        <div className="envolvente__perillas">
          <Perilla
            etiqueta="ATAQUE"
            valor={ataque}
            min={0.005}
            max={2}
            paso={0.005}
            escala="log"
            formatear={formatearTiempo}
            onChange={setAtaque}
            valorPorDefecto={PARAMETROS_INICIALES.ataque}
            tamano="pequena"
          />
          <Perilla
            etiqueta="DECAY"
            valor={decay}
            min={0.03}
            max={2}
            paso={0.005}
            escala="log"
            formatear={formatearTiempo}
            onChange={setDecay}
            valorPorDefecto={PARAMETROS_INICIALES.decay}
            tamano="pequena"
          />
          <Perilla
            etiqueta="SOSTENIDO"
            valor={sostenido}
            min={0}
            max={1}
            paso={0.01}
            formatear={formatearPorcentaje}
            onChange={setSostenido}
            valorPorDefecto={PARAMETROS_INICIALES.sostenido}
            tamano="pequena"
          />
          <Perilla
            etiqueta="RELEASE"
            valor={release}
            min={0.05}
            max={4}
            paso={0.005}
            escala="log"
            formatear={formatearTiempo}
            onChange={setRelease}
            valorPorDefecto={PARAMETROS_INICIALES.release}
            tamano="pequena"
          />
        </div>
        <Envolvente
          ataque={ataque}
          decay={decay}
          sostenido={sostenido}
          release={release}
        />
      </div>
    </Modulo>
  )
}

function PanelEspacio() {
  const [tiempo, setTiempo] = useControl('delayTiempo')
  const [feedback, setFeedback] = useControl('delayFeedback')
  const [mezcla, setMezcla] = useControl('delayMezcla')

  return (
    <Modulo numero="04" titulo="Espacio" className="modulo--delay">
      <div className="espacio">
        <div className="espacio__perillas">
          <Perilla
            etiqueta="TIEMPO"
            valor={tiempo}
            min={0.04}
            max={0.75}
            paso={0.005}
            escala="log"
            formatear={formatearTiempo}
            onChange={setTiempo}
            valorPorDefecto={PARAMETROS_INICIALES.delayTiempo}
            tamano="pequena"
          />
          <Perilla
            etiqueta="FEEDBACK"
            valor={feedback}
            min={0}
            max={0.82}
            paso={0.01}
            formatear={formatearPorcentaje}
            onChange={setFeedback}
            valorPorDefecto={PARAMETROS_INICIALES.delayFeedback}
            tamano="pequena"
          />
          <Perilla
            etiqueta="MEZCLA"
            valor={mezcla}
            min={0}
            max={0.65}
            paso={0.01}
            formatear={formatearPorcentaje}
            onChange={setMezcla}
            valorPorDefecto={PARAMETROS_INICIALES.delayMezcla}
            tamano="pequena"
          />
        </div>
        <div className="ecos" aria-hidden="true">
          {Array.from({ length: 6 }, (_, indice) => {
            const intensidad =
              Math.max(0, 1 - indice / 6) * (0.25 + mezcla / 0.65)
            return (
              <span
                key={indice}
                style={{
                  height: `${24 + intensidad * 24}px`,
                  opacity: Math.min(0.9, 0.08 + intensidad * 0.7),
                }}
              />
            )
          })}
        </div>
        <span className="espacio__tipo">DELAY CON RETROALIMENTACIÓN</span>
      </div>
    </Modulo>
  )
}

function PanelSalida() {
  const [volumen, setVolumen] = useControl('volumen')
  const notasActivas = useSynth((estado) => estado.notasActivas.length)
  const encendido = useSynth((estado) => estado.encendido)

  return (
    <Modulo numero="05" titulo="Salida" className="modulo--salida">
      <div className="salida">
        <Perilla
          etiqueta="MASTER"
          valor={volumen}
          min={0}
          max={1}
          paso={0.01}
          formatear={formatearPorcentaje}
          onChange={setVolumen}
          valorPorDefecto={PARAMETROS_INICIALES.volumen}
          tamano="grande"
        />
        <div className="salida__voces" aria-label={`${notasActivas} de 8 voces activas`}>
          <div className="salida__leds" aria-hidden="true">
            {Array.from({ length: 8 }, (_, indice) => (
              <span
                key={indice}
                className={`${encendido && indice < notasActivas ? 'is-activa' : ''}`}
              />
            ))}
          </div>
          <span>
            VOCES {String(notasActivas).padStart(2, '0')}/08
          </span>
        </div>
        <span className="salida__nota">
          <i className={encendido ? 'is-on' : ''} aria-hidden="true" />
          {encendido ? 'SALIDA ACTIVA' : 'SALIDA EN ESPERA'}
        </span>
      </div>
    </Modulo>
  )
}

export function FilaModulos() {
  return (
    <div className="modulos">
      <PanelOsciladores />
      <PanelFiltro />
      <PanelEnvolvente />
      <PanelEspacio />
      <PanelSalida />
    </div>
  )
}
