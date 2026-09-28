import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { TOTAL_DAYS, isUnlocked } from './config'
import { getDay } from './data/movies'
import DayCard from './components/DayCard'
import DayModal from './components/DayModal'

const STORAGE_KEY = 'cine-adviento:v1'

// Decoración flotante de Halloween
function FloatingDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Murciélagos */}
      <span className="absolute top-[10%] left-[5%] text-4xl animate-float opacity-20" style={{ animationDelay: '0s' }}>🦇</span>
      <span className="absolute top-[15%] right-[8%] text-3xl animate-float opacity-15" style={{ animationDelay: '1s' }}>🦇</span>
      <span className="absolute top-[60%] left-[3%] text-2xl animate-float opacity-10" style={{ animationDelay: '2s' }}>🦇</span>
      
      {/* Calabazas */}
      <span className="absolute bottom-[10%] right-[5%] text-5xl animate-float opacity-20" style={{ animationDelay: '0.5s' }}>🎃</span>
      <span className="absolute top-[40%] right-[3%] text-3xl animate-float opacity-15" style={{ animationDelay: '1.5s' }}>🎃</span>
      
      {/* Arañas */}
      <span className="absolute top-[25%] left-[10%] text-2xl animate-float opacity-10" style={{ animationDelay: '0.8s' }}>🕷️</span>
      <span className="absolute bottom-[20%] left-[8%] text-xl animate-float opacity-10" style={{ animationDelay: '2.5s' }}>🕸️</span>
      
      {/* Fantasmas */}
      <span className="absolute top-[5%] left-[40%] text-3xl animate-float opacity-10" style={{ animationDelay: '1.2s' }}>👻</span>
    </div>
  )
}

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
    <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <FloatingDecor />
      
      <header className="relative mb-10 max-w-xl">
        <div className="mb-2 text-4xl animate-flicker" aria-hidden="true">🎃</div>
        <h1 className="font-display text-4xl font-bold sm:text-5xl text-oro drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]">
          Cine de Terror
        </h1>
        <p className="mt-3 text-entrada/80">
          Cada día de octubre se abre una casilla con películas de terror. Elige una, márcala como vista y sigue
          con el calendario. ¡Que no te de miedo!
        </p>
        <p className="mt-4 text-sm text-oro">
          👻 Has visto {seenCount} de {TOTAL_DAYS} películas
        </p>
      </header>

      <main className="relative grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
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
          watchedIds={new Set(Object.values(watched))}
          onWatch={(id) => markWatched(openDay, id)}
          onUnwatch={() => unmark(openDay)}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  )
}
