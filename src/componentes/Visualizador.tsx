import { useEffect, useRef } from 'react'
import { motor } from '../audio/motor'
import { useMovimientoReducido } from '../utiles/useMediaQuery'

type Props = {
  encendido: boolean
}

export function Visualizador({ encendido }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducido = useMovimientoReducido()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const contexto = canvas.getContext('2d')
    if (!contexto) return

    let frame = 0
    let datos: Uint8Array<ArrayBuffer> | null = null
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const prepararLienzo = () => {
      const ancho = canvas.clientWidth
      const alto = canvas.clientHeight
      const anchoFisico = Math.round(ancho * dpr)
      const altoFisico = Math.round(alto * dpr)
      if (canvas.width !== anchoFisico || canvas.height !== altoFisico) {
        canvas.width = anchoFisico
        canvas.height = altoFisico
      }
      contexto.setTransform(dpr, 0, 0, dpr, 0, 0)
      return { ancho, alto }
    }

    const dibujar = () => {
      const { ancho, alto } = prepararLienzo()
      if (!ancho || !alto) return

      contexto.clearRect(0, 0, ancho, alto)

      contexto.strokeStyle = 'rgba(215, 227, 180, 0.09)'
      contexto.lineWidth = 1
      for (let i = 1; i < 6; i += 1) {
        const x = (ancho / 6) * i
        contexto.beginPath()
        contexto.moveTo(x, 0)
        contexto.lineTo(x, alto)
        contexto.stroke()
      }
      for (let i = 1; i < 3; i += 1) {
        const y = (alto / 3) * i
        contexto.beginPath()
        contexto.moveTo(0, y)
        contexto.lineTo(ancho, y)
        contexto.stroke()
      }

      const analizador = motor.analizadorActual
      if (!encendido || !analizador) {
        contexto.strokeStyle = 'rgba(215, 227, 180, 0.34)'
        contexto.lineWidth = 1
        contexto.beginPath()
        contexto.moveTo(0, alto / 2)
        contexto.lineTo(ancho, alto / 2)
        contexto.stroke()
        return
      }

      if (!datos || datos.length !== analizador.fftSize) {
        datos = new Uint8Array(analizador.fftSize)
      }
      analizador.getByteTimeDomainData(datos)

      const gradiente = contexto.createLinearGradient(0, 0, 0, alto)
      gradiente.addColorStop(0, 'rgba(215, 227, 180, 0.16)')
      gradiente.addColorStop(0.5, 'rgba(215, 227, 180, 0.035)')
      gradiente.addColorStop(1, 'rgba(215, 227, 180, 0)')

      contexto.beginPath()
      for (let i = 0; i < datos.length; i += 1) {
        const x = (i / (datos.length - 1)) * ancho
        const valor = (datos[i] - 128) / 128
        const y = alto / 2 + valor * alto * 0.4
        if (i === 0) contexto.moveTo(x, y)
        else contexto.lineTo(x, y)
      }
      contexto.lineTo(ancho, alto)
      contexto.lineTo(0, alto)
      contexto.closePath()
      contexto.fillStyle = gradiente
      contexto.fill()

      contexto.beginPath()
      for (let i = 0; i < datos.length; i += 1) {
        const x = (i / (datos.length - 1)) * ancho
        const valor = (datos[i] - 128) / 128
        const y = alto / 2 + valor * alto * 0.4
        if (i === 0) contexto.moveTo(x, y)
        else contexto.lineTo(x, y)
      }
      contexto.strokeStyle = '#d7e3b4'
      contexto.lineWidth = 1.4
      contexto.shadowColor = 'rgba(215, 227, 180, 0.45)'
      contexto.shadowBlur = 7
      contexto.stroke()
      contexto.shadowBlur = 0
    }

    const animar = () => {
      dibujar()
      frame = window.requestAnimationFrame(animar)
    }

    if (reducido || !encendido) {
      dibujar()
      const alRedimensionar = () => dibujar()
      window.addEventListener('resize', alRedimensionar)
      return () => window.removeEventListener('resize', alRedimensionar)
    }

    frame = window.requestAnimationFrame(animar)
    return () => window.cancelAnimationFrame(frame)
  }, [encendido, reducido])

  return (
    <canvas
      ref={canvasRef}
      className="visualizador"
      aria-hidden="true"
    />
  )
}
