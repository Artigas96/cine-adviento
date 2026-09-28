export default function DayCard({ day, locked, empty, watchedId, onOpen }) {
  const watched = Boolean(watchedId)
  const disabled = locked

  const base =
    'relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oro'
  const state = disabled
    ? 'border-entrada/10 bg-black/40 text-entrada/30 cursor-not-allowed'
    : watched
      ? 'border-oro bg-gradient-to-br from-oro to-oro-claro text-tinta shadow-[0_0_15px_rgba(255,140,0,0.5)] hover:shadow-[0_0_25px_rgba(255,140,0,0.7)] hover:scale-105'
      : 'border-oro/30 bg-cortina-claro hover:border-oro hover:bg-cortina-claro/70 hover:shadow-[0_0_15px_rgba(255,140,0,0.3)] hover:scale-105'

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      aria-label={`Día ${day}${locked ? ', todavía cerrado' : watched ? ', película vista' : ''}`}
      className={`${base} ${state}`}
    >
      <span className="font-display text-3xl font-bold sm:text-4xl drop-shadow-md">{day}</span>
      <span className="mt-1 text-xs font-medium">
        {locked ? '🔒 Cerrado' : watched ? '✓ Vista' : empty ? '⏳ Próximamente' : '🎬 Abrir'}
      </span>
    </button>
  )
}
