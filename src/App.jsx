import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { TOTAL_DAYS, isUnlocked } from './config'
import { getDay } from './data/movies'
import DayCard from './components/DayCard'
import DayModal from './components/DayModal'

const STORAGE_KEY = 'cine-adviento:v1'

export default function App() {
  // watched = { "1": "elf-2003", "2": "gremlins-1984", ... }  (día -> peli vista)
  const [watched, setWatched] = useLocalStorage(STORAGE_KEY, {})
  const [openDay, setOpenDay] = useState(null)

  const days = Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1)
  const seenCount = Object.keys(watched).length

  const markWatched = (day, movieId) => setWatched((w) => ({ ...w, [day]: movieId }))
  const unmark = (day) =>
    setWatched((w) => {
      const { [day]: _removed, ...rest } = w
      return rest
    })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-10 max-w-xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Cine de adviento</h1>
        <p className="mt-3 text-entrada/80">
          Cada día se abre una casilla con 3 o 4 películas. Elige una, márcala como vista y sigue
          con el calendario.
        </p>
        <p className="mt-4 text-sm text-oro">
          Has visto {seenCount} de {TOTAL_DAYS} películas
        </p>
      </header>

      <main className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {days.map((day) => (
          <DayCard
            key={day}
            day={day}
            locked={!isUnlocked(day)}
            empty={!getDay(day)}
            watchedId={watched[day]}
            onOpen={() => setOpenDay(day)}
          />
        ))}
      </main>

      {openDay && (
        <DayModal
          day={openDay}
          data={getDay(openDay)}
          watchedId={watched[openDay]}
          onWatch={(id) => markWatched(openDay, id)}
          onUnwatch={() => unmark(openDay)}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  )
}
