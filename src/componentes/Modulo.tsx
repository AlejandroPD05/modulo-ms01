import type { ReactNode } from 'react'

type Props = {
  numero: string
  titulo: string
  children: ReactNode
  className?: string
}

export function Modulo({ numero, titulo, children, className = '' }: Props) {
  return (
    <section className={`modulo ${className}`.trim()}>
      <header className="modulo__cabecera">
        <span className="modulo__numero">{numero}</span>
        <h2>{titulo}</h2>
        <span className="modulo__punto" aria-hidden="true" />
      </header>
      <div className="modulo__cuerpo">{children}</div>
    </section>
  )
}
