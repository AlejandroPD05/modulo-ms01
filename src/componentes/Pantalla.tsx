import { nombreDeNota } from '../audio/notas'
import { PRESETS } from '../audio/parametros'
import { useSynth } from '../estado/useSynth'
import { Visualizador } from './Visualizador'

export function Pantalla() {
  const preset = useSynth((estado) => estado.preset)
  const encendido = useSynth((estado) => estado.encendido)
  const notasActivas = useSynth((estado) => estado.notasActivas)
  const grabando = useSynth((estado) => estado.grabando)
  const demoActivo = useSynth((estado) => estado.demoActivo)
  const tocarDemo = useSynth((estado) => estado.tocarDemo)
  const detenerDemo = useSynth((estado) => estado.detenerDemo)

  const presetActual = PRESETS.find((item) => item.nombre === preset)
  const descripcion =
    presetActual?.descripcion ??
    'Un patch tuyo. Compártelo para que otros lo puedan tocar.'
  const notaActual =
    notasActivas.length > 0
      ? nombreDeNota(notasActivas[notasActivas.length - 1])
      : null

  return (
    <section
      className={`pantalla ${encendido ? 'pantalla--encendida' : ''}`}
      aria-label="Pantalla del sintetizador"
    >
      <div className="pantalla__barra" aria-hidden="true">
        <span>MEMORIA DE PATCH / 01</span>
        <span>8 VOCES</span>
        <span>WEB AUDIO</span>
      </div>

      <div className="pantalla__contenido">
        <div className="pantalla__preset">
          <span className="pantalla__micro">PATCH ACTIVO</span>
          <strong className="pantalla__nombre">{preset}</strong>
          <p className="pantalla__descripcion">{descripcion}</p>
        </div>

        <div className="pantalla__visual">
          <Visualizador encendido={encendido} />
          <span className="pantalla__visual-etiqueta">SEÑAL / SALIDA</span>
        </div>

        <div className="pantalla__lecturas">
          <div className="pantalla__dato">
            <span>NOTA</span>
            <strong>{notaActual ?? '—'}</strong>
          </div>
          <div className="pantalla__dato">
            <span>VOCES</span>
            <strong>
              {String(notasActivas.length).padStart(2, '0')}
              <em>/08</em>
            </strong>
          </div>
          <div className="pantalla__estado">
            <span
              className={`led ${encendido ? 'led--on' : ''}`}
              aria-hidden="true"
            />
            <span>{encendido ? 'AUDIO' : 'STANDBY'}</span>
            {grabando && <b className="rec">REC</b>}
          </div>
          <button
            type="button"
            className={`demo ${demoActivo ? 'is-activo' : ''}`}
            onClick={() => void (demoActivo ? detenerDemo() : tocarDemo())}
            aria-label={demoActivo ? 'Detener demostración' : 'Reproducir demostración'}
          >
            {demoActivo ? (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <rect x="2.5" y="2.5" width="7" height="7" rx=".5" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 2.5 9.5 6 3 9.5Z" />
              </svg>
            )}
            <span>{demoActivo ? 'PARAR' : 'DEMO'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export function BancoPresets() {
  const preset = useSynth((estado) => estado.preset)
  const aplicarPreset = useSynth((estado) => estado.aplicarPreset)

  return (
    <nav className="banco" aria-label="Presets del sintetizador">
      <span className="banco__etiqueta">
        BANCO <b>01</b>
      </span>
      <div className="banco__lista">
        {PRESETS.map((item, indice) => (
          <button
            key={item.nombre}
            type="button"
            className={`banco__boton ${preset === item.nombre ? 'is-activo' : ''}`}
            onClick={() => aplicarPreset(item.nombre)}
            aria-pressed={preset === item.nombre}
            title={item.descripcion}
          >
            <span className="banco__numero">
              {String(indice + 1).padStart(2, '0')}
            </span>
            <span>{item.nombre}</span>
          </button>
        ))}
      </div>
      <span className="banco__nota" aria-hidden="true">
        6 SONIDOS
      </span>
    </nav>
  )
}
