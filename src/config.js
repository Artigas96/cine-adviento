// Configuración del calendario
export const YEAR = new Date().getFullYear()
export const MONTH = 9 // 0 = enero, 9 = octubre
export const TOTAL_DAYS = 31

// true: cada día se abre en su fecha. false: todos abiertos desde el principio.
export const UNLOCK_BY_DATE = true

// Para probar: añade ?abrir a la URL y se desbloquean todos los días.
export const forceUnlock = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('abrir')

export function isUnlocked(day, now = new Date()) {
  if (!UNLOCK_BY_DATE || forceUnlock()) return true
  const date = new Date(YEAR, MONTH, day)
  const dayOfWeek = date.getDay() // 0 = domingo, 6 = sábado
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const isDay30 = day === 30
  return (isWeekend || isDay30) && now >= date
}
