import { useEffect, useState } from 'react'

export function useMediaQuery(consulta: string) {
  const [coincide, setCoincide] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(consulta).matches
  })

  useEffect(() => {
    const media = window.matchMedia(consulta)
    const actualizar = () => setCoincide(media.matches)
    actualizar()
    media.addEventListener('change', actualizar)
    return () => media.removeEventListener('change', actualizar)
  }, [consulta])

  return coincide
}

export function useMovimientoReducido() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
