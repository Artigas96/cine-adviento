// Configuración del calendario
export const YEAR = new Date().getFullYear()
export const MONTH = 11 // 0 = enero, 11 = diciembre
export const TOTAL_DAYS = 24 // pon 25 si quieres incluir Navidad

// true: cada día se abre en su fecha. false: todos abiertos desde el principio.
export const UNLOCK_BY_DATE = true

// Para probar: añade ?abrir a la URL y se desbloquean todos los días.
export const forceUnlock = () =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('abrir')

export function isUnlocked(day, now = new Date()) {
  if (!UNLOCK_BY_DATE || forceUnlock()) return true
  return now >= new Date(YEAR, MONTH, day)
}
