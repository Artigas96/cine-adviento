import { useEffect, useState } from 'react'

// Como useState, pero persiste en localStorage. Si el almacenamiento no está
// disponible (modo privado, bloqueado...) sigue funcionando en memoria.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* sin almacenamiento: ignoramos */
    }
  }, [key, value])

  return [value, setValue]
}
