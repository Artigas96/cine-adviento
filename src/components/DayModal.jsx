import { useEffect, useState } from 'react'

export default function DayModal({ day, data, watchedId, watchedIds, onWatch, onUnwatch, onClose }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  // Animación de entrada al montar
  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setVisible(false)
    // Esperar a que termine la animación de salida antes de desmontar
    setTimeout(onClose, 200)
  }

  const overlayClasses = `fixed inset-0 z-10 flex items-end justify-center p-0 sm:items-center sm:p-4 transition-opacity duration-200 ${
    visible ? 'opacity-100' : 'opacity-0'
  }`

  const panelClasses = `max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-entrada p-6 text-tinta sm:rounded-2xl border-2 border-oro/30 shadow-[0_0_30px_rgba(255,140,0,0.2)] transition-all duration-200 ${
    visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
  }`

  return (
    <div
      className={overlayClasses}
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Películas del día ${day}`}
        onClick={(e) => e.stopPropagation()}
        className={panelClasses}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-cortina">
            🎃 Día {day}: elige una película
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="rounded px-2 text-2xl leading-none hover:bg-tinta/10"
          >
            ×
          </button>
        </div>

        {!data ? (
          <p>Todavía no hay películas para este día. Vuelve pronto... si te atreves. 👻</p>
        ) : (
          <ul className="space-y-3">
            {data.movies.map((m) => {
              const isWatched = watchedId === m.id
              const seenElsewhere = !isWatched && watchedIds.has(m.id)
              const disabled = seenElsewhere
              return (
                <li
                  key={m.id}
                  className={`flex gap-4 rounded-lg border-2 p-4 transition-all ${
                    isWatched ? 'border-oro bg-oro/20 shadow-[0_0_10px_rgba(255,140,0,0.2)]' : seenElsewhere ? 'border-tinta/10 opacity-50' : 'border-tinta/15 hover:border-oro/30'
                  }`}
                >
                  {m.poster && (
                    <img src={m.poster} alt="" className="h-28 w-20 flex-none rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold">
                      {m.title} <span className="font-sans text-sm font-normal">({m.year})</span>
                    </h3>
                    <p className="mt-1 text-sm">{m.synopsis}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.trailer && (
                        <a
                          href={m.trailer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-morado px-3 py-1.5 text-sm font-medium text-white hover:bg-morado-claro transition-colors"
                        >
                          ▶ Ver trailer
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => (isWatched ? onUnwatch() : onWatch(m.id))}
                        disabled={disabled}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                          isWatched
                            ? 'border border-tinta/40 hover:bg-tinta/10'
                            : disabled
                              ? 'cursor-not-allowed bg-tinta/20 text-tinta/50'
                              : 'bg-cortina text-oro hover:bg-cortina-claro hover:shadow-[0_0_10px_rgba(255,140,0,0.3)]'
                        }`}
                      >
                        {isWatched ? 'Quitar de vistas' : seenElsewhere ? 'Vista en otro día' : 'Marcar como vista'}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
