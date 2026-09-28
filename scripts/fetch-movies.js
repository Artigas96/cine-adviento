/**
 * Script para obtener películas de terror ya estrenadas desde TMDB
 * y generar el contenido de src/data/movies.js
 *
 * Uso:
 *   1. Crea una cuenta en https://www.themoviedb.org/
 *   2. Obtén tu API key en https://www.themoviedb.org/settings/api
 *   3. Ejecuta: TMDB_API_KEY=tu_key_aqui node scripts/fetch-movies.js
 *
 * El script genera 31 días × 3 películas = 93 películas de terror.
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const TOTAL_DAYS = 31
const MOVIES_PER_DAY = 3
const TOTAL_MOVIES = TOTAL_DAYS * MOVIES_PER_DAY

// Género 27 = Horror en TMDB
const HORROR_GENRE = 27
const ANIMATION_GENRE = 16 // Género de animación (excluir)
const MIN_VOTE_AVERAGE = 7 // 7/10 en TMDB (equivalente a 3.5/5)
const MIN_YEAR = 1990

// Idiomas asiáticos y de Oriente a excluir (códigos ISO 639-1)
const ASIAN_LANGUAGES = [
  'hi', // hindi
  'th', // tailandés
  'ja', // japonés
  'ko', // coreano
  'zh', // chino
  'ta', // tamil
  'te', // telugu
  'ml', // malayalam
  'bn', // bengalí
  'ur', // urdu
  'fa', // persa
  'he', // hebreo
  'tr', // turco
  'id', // indonesio
  'ms', // malayo
  'vi', // vietnamita
  'km', // jemer
  'lo', // lao
  'my', // birmano
  'ne', // nepalí
  'si', // cingalés
  'dz', // dzongkha
  'mn', // mongol
  'kk', // kazajo
  'uz', // uzbeko
  'tk', // turkmeno
  'ky', // kirguís
  'tg', // tayiko
  'az', // azerí
  'hy', // armenio
  'ka', // georgiano
]

// Whitelist de películas de animación permitidas (IDs de TMDB)
const ANIMATION_WHITELIST = [
  9479,   // The Nightmare Before Christmas (1993)
  3933,   // Corpse Bride (2005)
  14836,  // Coraline (2009)
  76492,  // Hotel Transylvania (2012)
  354912, // Coco (2017)
  9297,   // Monster House (2006)
  11631,  // Casper (1995)
  927,    // Gremlins (1984)
  620,    // Ghostbusters (1984)
  257445, // Goosebumps (2015)
]

if (!TMDB_API_KEY) {
  console.error('❌ Error: Debes proporcionar la API key de TMDB')
  console.error('   Ejecuta: TMDB_API_KEY=tu_key_aqui node scripts/fetch-movies.js')
  process.exit(1)
}

async function fetchTrailer(movieId) {
  const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}/videos`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('language', 'es-ES')

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()

    // Buscar un trailer de YouTube
    const trailer = data.results.find(
      (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    )

    if (trailer) {
      return `https://www.youtube.com/watch?v=${trailer.key}`
    }
  } catch {
    // Si falla, simplemente no hay trailer
  }
  return null
}

async function fetchWhitelistedMovie(movieId) {
  const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}`)
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('language', 'es-ES')

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const movie = await response.json()

    if (!movie.poster_path || !movie.overview) return null

    return {
      id: `tmdb-${movie.id}`,
      title: movie.title,
      year: parseInt(movie.release_date.slice(0, 4)),
      synopsis: movie.overview,
      poster: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
      tmdbId: movie.id,
    }
  } catch {
    return null
  }
}

async function fetchMovies() {
  const allMovies = []
  const seenIds = new Set()

  // Películas de terror populares ya estrenadas (ordenadas por popularidad)
  // Buscamos en varios años para tener variedad
  const years = [
    { start: '1990-01-01', end: '1999-12-31' }, // 90s
    { start: '2000-01-01', end: '2009-12-31' }, // 2000s
    { start: '2010-01-01', end: '2019-12-31' }, // 2010s
    { start: '2020-01-01', end: '2026-12-31' }, // 2020s
  ]

  for (const yearRange of years) {
    if (allMovies.length >= TOTAL_MOVIES) break

    let page = 1
    const maxPages = 5 // Límite de páginas por rango de años

    while (page <= maxPages && allMovies.length < TOTAL_MOVIES) {
      const url = new URL(`${TMDB_BASE_URL}/discover/movie`)
      url.searchParams.set('api_key', TMDB_API_KEY)
      url.searchParams.set('language', 'es-ES')
      url.searchParams.set('with_genres', HORROR_GENRE)
      url.searchParams.set('primary_release_date.gte', yearRange.start)
      url.searchParams.set('primary_release_date.lte', yearRange.end)
      url.searchParams.set('sort_by', 'popularity.desc')
      url.searchParams.set('vote_average.gte', MIN_VOTE_AVERAGE)
      url.searchParams.set('vote_count.gte', 100) // Mínimo de votos para que el rating sea fiable
      url.searchParams.set('without_genres', ANIMATION_GENRE) // Excluir animación (excepto whitelist)
      url.searchParams.set('with_original_language', 'en|es') // Solo inglés o español (suelen tener doblaje al español)
      url.searchParams.set('page', page)
      url.searchParams.set('include_adult', 'false')

      console.log(`📡 Buscando películas ${yearRange.start.slice(0, 4)}-${yearRange.end.slice(0, 4)} (página ${page})...`)

      const response = await fetch(url)
      if (!response.ok) {
        console.error(`❌ Error en la API: ${response.status} ${response.statusText}`)
        break
      }

      const data = await response.json()

      for (const movie of data.results) {
        if (allMovies.length >= TOTAL_MOVIES) break
        if (seenIds.has(movie.id)) continue
        if (!movie.poster_path) continue // Sin póster no nos sirve
        if (!movie.overview) continue // Sin sinopsis no nos sirve

        // Excluir películas asiáticas (por idioma original)
        if (ASIAN_LANGUAGES.includes(movie.original_language)) continue

        seenIds.add(movie.id)
        allMovies.push({
          id: `tmdb-${movie.id}`,
          title: movie.title,
          year: parseInt(movie.release_date.slice(0, 4)),
          synopsis: movie.overview,
          poster: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
          tmdbId: movie.id, // Guardamos el ID de TMDB para buscar el trailer
        })
      }

      if (data.results.length === 0) break
      page++
    }
  }

  // Buscar trailers para cada película
  console.log('\n🎬 Buscando trailers...')
  for (let i = 0; i < allMovies.length; i++) {
    const movie = allMovies[i]
    console.log(`   [${i + 1}/${allMovies.length}] ${movie.title}`)
    movie.trailer = await fetchTrailer(movie.tmdbId)
    delete movie.tmdbId // Eliminamos el ID temporal
  }

  return allMovies
}

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateMoviesFile(movies) {
  const shuffledMovies = shuffleArray(movies)
  const days = []

  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const startIdx = (day - 1) * MOVIES_PER_DAY
    const dayMovies = shuffledMovies.slice(startIdx, startIdx + MOVIES_PER_DAY)

    if (dayMovies.length === 0) continue

    days.push({
      day,
      movies: dayMovies,
    })
  }

  const content = `// Contenido del calendario: ${MOVIES_PER_DAY} películas por día, sin repeticiones.
// Generado automáticamente desde TMDB (https://www.themoviedb.org/)
// Los días que no estén aquí se muestran como "Próximamente".
// \`id\` debe ser único y NO cambiarlo después de publicar (es lo que se guarda
// en el navegador de cada persona). \`poster\` es opcional (ruta en /public o URL).
export const CALENDAR = ${JSON.stringify(days, null, 2)}

export const getDay = (day) => CALENDAR.find((d) => d.day === day)
`

  return content
}

async function main() {
  console.log('🎬 Obteniendo películas de terror desde TMDB...\n')

  const movies = await fetchMovies()

  if (movies.length === 0) {
    console.error('❌ No se encontraron películas. Verifica tu API key.')
    process.exit(1)
  }

  console.log(`\n✅ Se encontraron ${movies.length} películas de terror`)

  // Obtener películas de animación de la whitelist
  console.log('\n🎨 Obteniendo películas de animación de la whitelist...')
  const whitelistedMovies = []
  for (const movieId of ANIMATION_WHITELIST) {
    const movie = await fetchWhitelistedMovie(movieId)
    if (movie) {
      console.log(`   ✓ ${movie.title}`)
      whitelistedMovies.push(movie)
    } else {
      console.log(`   ✗ Película ${movieId} no encontrada o sin datos`)
    }
  }

  // Buscar trailers para las películas de la whitelist
  console.log('\n🎬 Buscando trailers para películas de animación...')
  for (let i = 0; i < whitelistedMovies.length; i++) {
    const movie = whitelistedMovies[i]
    console.log(`   [${i + 1}/${whitelistedMovies.length}] ${movie.title}`)
    movie.trailer = await fetchTrailer(movie.tmdbId)
    delete movie.tmdbId
  }

  // Combinar todas las películas
  const allMovies = [...movies, ...whitelistedMovies]

  const content = generateMoviesFile(allMovies)

  const outputPath = 'src/data/movies.js'
  const fs = await import('fs')
  fs.writeFileSync(outputPath, content, 'utf-8')

  console.log(`\n📝 Archivo generado: ${outputPath}`)
  console.log(`   ${TOTAL_DAYS} días × ${MOVIES_PER_DAY} películas = ${allMovies.length} películas`)
  console.log(`   (${movies.length} de terror + ${whitelistedMovies.length} de animación)`)
  console.log('\n🎉 ¡Listo! Ya puedes ejecutar npm run dev para ver el calendario.')
}

main().catch((err) => {
  console.error('❌ Error inesperado:', err)
  process.exit(1)
})
