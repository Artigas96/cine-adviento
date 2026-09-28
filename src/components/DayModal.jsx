import { useEffect } from 'react'

export default function DayModal({ day, data, watchedId, onWatch, onUnwatch, onClose }) {
  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-10 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Películas del día ${day}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-entrada p-6 text-tinta sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Día {day}: elige una película</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded px-2 text-2xl leading-none hover:bg-tinta/10"
          >
            ×
          </button>
        </div>

        {!data ? (
          <p>Todavía no hay películas para este día. Vuelve pronto.</p>
        ) : (
          <ul className="space-y-3">
            {data.movies.map((m) => {
              const isWatched = watchedId === m.id
              return (
                <li
                  key={m.id}
                  className={`flex gap-4 rounded-lg border-2 p-4 ${
                    isWatched ? 'border-cortina bg-oro/30' : 'border-tinta/15'
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
                    <button
                      type="button"
                      onClick={() => (isWatched ? onUnwatch() : onWatch(m.id))}
                      className={`mt-3 rounded-md px-3 py-1.5 text-sm font-medium ${
                        isWatched
                          ? 'border border-tinta/40 hover:bg-tinta/10'
                          : 'bg-cortina text-entrada hover:bg-cortina-claro'
                      }`}
                    >
                      {isWatched ? 'Quitar de vistas' : 'Marcar como vista'}
                    </button>
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
