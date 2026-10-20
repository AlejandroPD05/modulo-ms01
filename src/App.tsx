import { useEffect } from 'react'
import { motor } from './audio/motor'
import { BancoPresets, Pantalla } from './componentes/Pantalla'
import { Cabecera } from './componentes/Cabecera'
import { FilaModulos } from './componentes/Controles'
import { Teclado } from './componentes/Teclado'
import { useSynth } from './estado/useSynth'

export default function App() {
  const mensaje = useSynth((estado) => estado.mensaje)
  const limpiarMensaje = useSynth((estado) => estado.limpiarMensaje)

  useEffect(() => {
    if (import.meta.env.DEV) {
      Object.assign(window, {
        __modulo: { motor, tienda: useSynth },
      })
    }
  }, [])

  useEffect(() => {
    if (!mensaje) return
    const temporizador = window.setTimeout(limpiarMensaje, 4200)
    return () => window.clearTimeout(temporizador)
  }, [mensaje, limpiarMensaje])

  return (
    <div className="escena">
      <a className="saltar" href="#instrumento">
        Saltar al instrumento
      </a>
      <div className="grano" aria-hidden="true" />

      <div className="contenedor">
        <Cabecera />

        <main className="instrumento" id="instrumento" tabIndex={-1}>
          <div className="tapa">
            <span className="tornillo tornillo--tl" aria-hidden="true" />
            <span className="tornillo tornillo--tr" aria-hidden="true" />
            <span className="tornillo tornillo--bl" aria-hidden="true" />
            <span className="tornillo tornillo--br" aria-hidden="true" />

            <div className="tapa__franja">
              <span className="tapa__marca">
                MÓDULO <i>INSTRUMENTS</i>
              </span>
              <span className="tapa__modelo">MODEL / MS-01</span>
              <span className="tapa__serie">SERIAL / 0001</span>
              <span className="tapa__origen">HECHO PARA LA WEB</span>
            </div>

            <Pantalla />
            <BancoPresets />
            <FilaModulos />
            <Teclado />

            <div className="tapa__pie">
              <div className="ruta" aria-hidden="true">
                <span>01 OSC</span>
                <i />
                <span>02 FILTER</span>
                <i />
                <span>03 ENV</span>
                <i />
                <span>04 SPACE</span>
                <i />
                <span>05 OUT</span>
              </div>
              <span className="tapa__firma">
                HECHO CON WEB AUDIO API · SIN PLUGINS
              </span>
            </div>
          </div>
        </main>

        <footer className="pie">
          <span>
            MÓDULO MS-01 <i>·</i> UN INSTRUMENTO DE BOLSILLO PARA LA WEB
          </span>
          <span className="pie__meta">
            ARRASTRA LAS PERILLAS <i>·</i> DOBLE CLIC PARA REINICIAR
          </span>
        </footer>
      </div>

      {mensaje && (
        <div className="aviso" role="status" aria-live="polite">
          <span className="aviso__led" aria-hidden="true" />
          {mensaje}
        </div>
      )}
    </div>
  )
}
