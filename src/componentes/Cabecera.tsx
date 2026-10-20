import { useEffect, useState } from 'react'
import { useSynth } from '../estado/useSynth'

function IconoCompartir() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 2v10M10 2 6.5 5.5M10 2l3.5 3.5M4 9v7h12V9" />
    </svg>
  )
}

function IconoGrabar({ activo }: { activo: boolean }) {
  return activo ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="5" y="5" width="10" height="10" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="5.5" />
    </svg>
  )
}

function IconoMidi() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <circle cx="6.5" cy="10" r="1.1" />
      <circle cx="10" cy="10" r="1.1" />
      <circle cx="13.5" cy="10" r="1.1" />
    </svg>
  )
}

function TiempoGrabacion({ inicio }: { inicio: number }) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(Date.now()), 500)
    return () => window.clearInterval(intervalo)
  }, [])

  const segundos = Math.max(0, Math.floor((ahora - inicio) / 1000))
  const minutos = Math.floor(segundos / 60)
  const resto = String(segundos % 60).padStart(2, '0')

  return (
    <span className="accion__tiempo" aria-label={`Grabando ${minutos}:${resto}`}>
      {minutos}:{resto}
    </span>
  )
}

export function Cabecera() {
  const encendido = useSynth((estado) => estado.encendido)
  const grabando = useSynth((estado) => estado.grabando)
  const inicioGrabacion = useSynth((estado) => estado.inicioGrabacion)
  const midiActivo = useSynth((estado) => estado.midiActivo)
  const compartido = useSynth((estado) => estado.compartido)
  const encender = useSynth((estado) => estado.encender)
  const apagar = useSynth((estado) => estado.apagar)
  const alternarGrabacion = useSynth((estado) => estado.alternarGrabacion)
  const alternarMidi = useSynth((estado) => estado.alternarMidi)
  const compartir = useSynth((estado) => estado.compartir)

  return (
    <header className="cabecera">
      <a className="marca" href="./" aria-label="MÓDULO MS-01, recargar">
        <span className="marca__simbolo" aria-hidden="true">
          M
          <i />
        </span>
        <span className="marca__texto">
          <strong>MÓDULO</strong>
          <small>INSTRUMENTS · ES</small>
        </span>
      </a>

      <div className="cabecera__centro" aria-hidden="true">
        <span className="cabecera__modelo">MS-01</span>
        <span className="cabecera__linea" />
        <span className="cabecera__lema">SINTETIZADOR POLIFÓNICO</span>
      </div>

      <div className="cabecera__acciones">
        <button
          type="button"
          className={`accion ${compartido ? 'is-activa' : ''}`}
          onClick={() => void compartir()}
          aria-label={
            compartido ? 'Enlace copiado' : 'Copiar enlace con este patch'
          }
          title={
            compartido ? 'Enlace copiado' : 'Copiar enlace con este patch'
          }
        >
          <IconoCompartir />
          <span>{compartido ? 'COPIADO' : 'COMPARTIR'}</span>
        </button>

        <button
          type="button"
          className={`accion accion--grabar ${grabando ? 'is-grabando' : ''}`}
          onClick={() => void alternarGrabacion()}
          aria-label={grabando ? 'Detener y exportar grabación' : 'Grabar audio'}
          aria-pressed={grabando}
          title={grabando ? 'Detener y exportar grabación' : 'Grabar audio'}
        >
          <IconoGrabar activo={grabando} />
          <span>{grabando ? 'DETENER' : 'GRABAR'}</span>
          {grabando && inicioGrabacion !== null && (
            <TiempoGrabacion inicio={inicioGrabacion} />
          )}
        </button>

        <button
          type="button"
          className={`accion ${midiActivo ? 'is-activa' : ''}`}
          onClick={() => void alternarMidi()}
          aria-label={midiActivo ? 'Desconectar MIDI' : 'Conectar MIDI'}
          aria-pressed={midiActivo}
          title={midiActivo ? 'Desconectar MIDI' : 'Conectar MIDI'}
        >
          <IconoMidi />
          <span>MIDI</span>
        </button>

        <button
          type="button"
          className={`interruptor ${encendido ? 'is-encendido' : ''}`}
          onClick={() => void (encendido ? apagar() : encender())}
          aria-label={encendido ? 'Apagar audio' : 'Encender audio'}
          aria-pressed={encendido}
        >
          <span className="interruptor__led" aria-hidden="true" />
          <span className="interruptor__texto">
            <small>POWER</small>
            <strong>{encendido ? 'ON' : 'OFF'}</strong>
          </span>
          <span className="interruptor__palanca" aria-hidden="true">
            <i />
          </span>
        </button>
      </div>
    </header>
  )
}
