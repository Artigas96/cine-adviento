export default function DayCard({ day, locked, empty, watchedId, onOpen }) {
  const watched = Boolean(watchedId)
  const disabled = locked

  const base =
    'relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oro'
  const state = disabled
    ? 'border-entrada/15 bg-black/20 text-entrada/40 cursor-not-allowed'
    : watched
      ? 'border-oro bg-oro text-tinta hover:brightness-105'
      : 'border-entrada/40 bg-cortina-claro hover:border-oro hover:bg-cortina-claro/70'

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      aria-label={`Día ${day}${locked ? ', todavía cerrado' : watched ? ', película vista' : ''}`}
      className={`${base} ${state}`}
    >
      <span className="font-display text-3xl font-bold sm:text-4xl">{day}</span>
      <span className="mt-1 text-xs">
        {locked ? 'Cerrado' : watched ? 'Vista' : empty ? 'Próximamente' : 'Abrir'}
      </span>
    </button>
  )
}
