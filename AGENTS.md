# AGENCIAS

Calendario de adviento de películas. React 19 + Vite 7 + Tailwind CSS 4. Sin backend: el estado vive en `localStorage` del navegador.

## Comandos

```bash
npm install
npm run dev       # dev server
npm run build     # build de producción a dist/
npm run preview   # sirve dist/ localmente
```

No hay tests, lint ni typecheck configurados.

## Desarrollo

- Añade `?abrir` a la URL (p. ej. `http://localhost:5173/?abrir`) para desbloquear todos los días sin esperar a su fecha.
- El estado de películas vistas se guarda en `localStorage` bajo la clave `cine-adviento:v1` como `{ "1": "elf-2003", ... }` (día → id de película).

## Contenido y datos

- Las películas viven en `src/data/movies.js`. Cada `id` debe ser único y **no debe cambiar nunca** una vez publicado: es la clave que se guarda en el navegador de cada persona. Las películas no se repiten entre días.
- Los días sin entrada en `CALENDAR` se muestran como "Próximamente".
- Ajustes globales (nº de días, desbloqueo por fecha, año) en `src/config.js`. Actualmente: 31 días de octubre (Halloween).

## Estilos

- Tailwind CSS 4 con tema personalizado definido en `src/index.css` mediante `@theme`. Colores: `cortina`, `cortina-claro`, `entrada`, `oro`, `tinta`. Tipografías: `font-display` (Playfair Display) y `font-sans`.

## Deploy

- Push a `main` → GitHub Actions (`.github/workflows/deploy.yml`) construye y despliega en GitHub Pages.
- `vite.config.js` usa `base: './'` para que funcione en la subcarpeta de GitHub Pages sin hardcodear el nombre del repo.
- El workflow usa `npm install` (no `npm ci`) a pesar de existir `package-lock.json`; hay un comentario en el workflow indicando cuándo cambiarlo.

## Estructura del proyecto

```
src/
├── main.jsx               # Punto de entrada de React
├── App.jsx                # Componente principal: grid de días + modal
├── index.css              # Tailwind CSS 4 + tema personalizado (@theme)
├── config.js              # Ajustes globales (año, mes, días, desbloqueo)
├── data/
│   └── movies.js          # CALENDAR: películas por día
├── hooks/
│   └── useLocalStorage.js # Hook para persistir en localStorage
└── components/
    ├── DayCard.jsx        # Casilla del calendario (bloqueada/vista/abierta)
    └── DayModal.jsx       # Modal con las películas del día
```

## Componentes

- **`App.jsx`**: Renderiza el grid de `TOTAL_DAYS` días. Gestiona el estado `watched` (día → id de película) y controla qué modal está abierto.
- **`DayCard.jsx`**: Muestra un día con su estado: `Cerrado` (bloqueado), `Vista` (película elegida), `Próximamente` (sin películas) o `Abrir` (disponible).
- **`DayModal.jsx`**: Lista las películas del día con su título, año, sinopsis y botón para marcar/desmarcar como vista. Se cierra con `Escape` o clic fuera.

## Estado y persistencia

- El estado vive en `localStorage` bajo la clave `cine-adviento:v1`.
- Formato: `{ "1": "elf-2003", "2": "gremlins-1984", ... }` (día → id de película).
- El hook `useLocalStorage` sincroniza automáticamente cada cambio.
- Si `localStorage` no está disponible, la app funciona en memoria (sin persistencia).

## Añadir películas

1. Edita `src/data/movies.js`.
2. Añade un objeto al array `CALENDAR` con el día y sus películas.
3. Cada película necesita: `id` (único, inmutable), `title`, `year`, `synopsis`. `poster` es opcional.
4. Los días sin entrada en `CALENDAR` se muestran como "Próximamente".

## Desbloqueo de días

- Por defecto, cada día se desbloquea en su fecha (`UNLOCK_BY_DATE = true`).
- Añade `?abrir` a la URL para desbloquear todos los días (útil para desarrollo).
- Para cambiar el año, mes o número de días, edita `src/config.js`.

## Idioma

- Toda la interfaz, comentarios y documentación están en español.
