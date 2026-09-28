# Cine de adviento

Calendario de adviento de películas: cada día se abre una casilla con 3 o 4 películas para elegir. Lo que has visto se guarda en el navegador (localStorage), sin cuentas ni servidor.

**Stack:** React 19 + Vite + Tailwind CSS 4. Alojado en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev
```

Añade `?abrir` a la URL (por ejemplo `http://localhost:5173/?abrir`) para desbloquear todos los días y probar.

## Añadir películas

Edita `src/data/movies.js`: una entrada por día con 3 o 4 películas. Cada `id` debe ser único y no cambiarse una vez publicado, porque es lo que se guarda en el navegador de cada persona.

Ajustes generales (nº de días, desbloqueo por fecha) en `src/config.js`. Colores y tipografías en `src/index.css`.

## Publicar en GitHub Pages

1. Sube el repo a GitHub (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**.
3. Cada push a `main` construye y despliega la web con `.github/workflows/deploy.yml`.

## Estructura

```
src/
  App.jsx               estado y rejilla del calendario
  config.js             días, mes, desbloqueo por fecha
  data/movies.js        contenido: películas por día
  hooks/useLocalStorage.js
  components/           DayCard, DayModal
```
