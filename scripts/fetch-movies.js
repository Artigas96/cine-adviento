/**
 * Genera src/data/movies.js desde TMDB para el calendario de adviento de terror.
 *
 * Cada día contiene:
 *   - Warren             todo el universo Warren, repartido entre los días disponibles
 *   - ANIMATION_PER_DAY  película(s) de animación (curadas + descubiertas con alta nota)
 *   - el resto           terror de calidad (mismos filtros que antes, más exigentes)
 *
 * Uso:
 *   TMDB_API_KEY=tu_key node scripts/fetch-movies.js
 *
 * El reparto es determinista (semilla fija): si lo relanzas, sale el mismo calendario
 * mientras TMDB no cambie sus datos. Cambia SEED para obtener otro reparto.
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// ─── Calendario ─────────────────────────────────────────────────────────────
// Días que se generan. Pon null para generar los 31 días.
const AVAILABLE_DAYS = [4, 5, 11, 12, 18, 19, 25, 26, 30, 31];
const DAYS = AVAILABLE_DAYS ?? Array.from({ length: 31 }, (_, i) => i + 1);

const MOVIES_PER_DAY = 4; // el README admite 3 o 4
const ANIMATION_PER_DAY = 1;
// Las películas Warren se reparten TODAS entre los días (no hay tope fijo por día).
// El resto de huecos se rellena con terror de calidad.

const SEED = 2026;

// ─── Filtros de calidad (subidos respecto a la versión anterior) ────────────
const HORROR_GENRE = 27;
const ANIMATION_GENRE = 16;
const MIN_YEAR = 1990;

const HORROR_MIN_VOTE_AVERAGE = 7.2; // antes 7
const HORROR_MIN_VOTE_COUNT = 1500; // antes 100
const ANIMATION_MIN_VOTE_AVERAGE = 7.0;
const ANIMATION_MIN_VOTE_COUNT = 1000;

// Idiomas asiáticos y de Oriente a excluir (códigos ISO 639-1)
const ASIAN_LANGUAGES = [
  "hi",
  "th",
  "ja",
  "ko",
  "zh",
  "ta",
  "te",
  "ml",
  "bn",
  "ur",
  "fa",
  "he",
  "tr",
  "id",
  "ms",
  "vi",
  "km",
  "lo",
  "my",
  "ne",
  "si",
  "dz",
  "mn",
  "kk",
  "uz",
  "tk",
  "ky",
  "tg",
  "az",
  "hy",
  "ka",
];

// ─── Listas curadas (se buscan por título + año, no por ID, para evitar errores) ─
// Universo Warren completo: se añaden todas, sin filtro de nota.
// Las tres últimas no son del universo "Conjuring" como tal, pero están basadas
// en casos reales de Ed y Lorraine Warren. Quita las que no quieras.
const WARREN_MOVIES = [
  { title: "The Conjuring", year: 2013 },
  { title: "Annabelle", year: 2014 },
  { title: "The Conjuring 2", year: 2016 },
  { title: "Annabelle: Creation", year: 2017 },
  { title: "The Nun", year: 2018 },
  { title: "Annabelle Comes Home", year: 2019 },
  { title: "The Curse of La Llorona", year: 2019 },
  { title: "The Conjuring: The Devil Made Me Do It", year: 2021 },
  { title: "The Nun II", year: 2023 },
  { title: "The Conjuring: Last Rites", year: 2025 },
  // Casos reales de los Warren
  { title: "The Haunting in Connecticut", year: 2009 },
  { title: "The Amityville Horror", year: 1979 },
  { title: "The Amityville Horror", year: 2005 },
];

// Animación con aire de Halloween / familiar. Se completa con descubiertas por nota.
const ANIMATION_MOVIES = [
  { title: "The Nightmare Before Christmas", year: 1993 },
  { title: "Corpse Bride", year: 2005 },
  { title: "Coraline", year: 2009 },
  { title: "Monster House", year: 2006 },
  { title: "ParaNorman", year: 2012 },
  { title: "Frankenweenie", year: 2012 },
  { title: "Hotel Transylvania", year: 2012 },
  { title: "The Book of Life", year: 2014 },
  { title: "The Boxtrolls", year: 2014 },
  { title: "Coco", year: 2017 },
  { title: "Monsters, Inc.", year: 2001 },
  { title: "Wallace & Gromit: The Curse of the Were-Rabbit", year: 2005 },
  { title: "The Addams Family", year: 2019 },
  { title: "Hotel Transylvania 2", year: 2015 },
];

if (!TMDB_API_KEY) {
  console.error("❌ Error: Debes proporcionar la API key de TMDB");
  console.error(
    "   Ejecuta: TMDB_API_KEY=tu_key_aqui node scripts/fetch-movies.js",
  );
  process.exit(1);
}

// ─── Utilidades ─────────────────────────────────────────────────────────────
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function tmdb(path, params = {}, language = "es-ES") {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", language);
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `❌ Error en la API (${path}): ${response.status} ${response.statusText}`,
      );
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error(`❌ Error de red (${path}):`, err.message);
    return null;
  }
}

function toMovie(m) {
  if (!m.poster_path || !m.overview || !m.release_date) return null;
  return {
    id: `tmdb-${m.id}`,
    title: m.title,
    year: parseInt(m.release_date.slice(0, 4)),
    synopsis: m.overview,
    poster: `${TMDB_IMAGE_BASE}${m.poster_path}`,
    tmdbId: m.id,
  };
}

async function fetchTrailer(movieId) {
  // Primero en español, luego en inglés si no hay
  for (const language of ["es-ES", "en-US"]) {
    const data = await tmdb(`/movie/${movieId}/videos`, {}, language);
    const videos = data?.results?.filter((v) => v.site === "YouTube") ?? [];
    const trailer =
      videos.find((v) => v.type === "Trailer") ??
      videos.find((v) => v.type === "Teaser");
    if (trailer) return `https://www.youtube.com/watch?v=${trailer.key}`;
  }
  return null;
}

// Busca una película concreta por título y año
async function findMovie(title, year) {
  const data = await tmdb("/search/movie", {
    query: title,
    year,
    include_adult: "false",
  });
  let hit = data?.results?.find((r) =>
    r.release_date?.startsWith(String(year)),
  );
  if (!hit) return null;

  // Si no hay sinopsis en español, probamos con la de inglés
  if (!hit.overview) {
    const en = await tmdb(`/movie/${hit.id}`, {}, "en-US");
    if (en?.overview) hit = { ...hit, overview: en.overview };
  }
  return toMovie(hit);
}

async function fetchCurated(list, label, seen) {
  console.log(`\n${label}`);
  const result = [];
  for (const { title, year } of list) {
    const movie = await findMovie(title, year);
    if (!movie) {
      console.log(`   ✗ ${title} (${year}) no encontrada o sin datos`);
      continue;
    }
    if (seen.has(movie.id)) continue;
    seen.add(movie.id);
    console.log(`   ✓ ${movie.title} (${movie.year})`);
    result.push(movie);
  }
  return result;
}

// Descubre películas con filtros. Devuelve candidatas (sin límite duro).
async function discover({
  genres,
  withoutGenres,
  minAvg,
  minCount,
  ranges,
  pages,
  seen,
  label,
}) {
  const pool = [];
  for (const range of ranges) {
    for (let page = 1; page <= pages; page++) {
      console.log(
        `📡 ${label} ${range.start.slice(0, 4)}-${range.end.slice(0, 4)} (pág. ${page}, géneros ${genres})...`,
      );
      const params = {
        with_genres: genres,
        "primary_release_date.gte": range.start,
        "primary_release_date.lte": range.end,
        sort_by: "popularity.desc",
        "vote_average.gte": minAvg,
        "vote_count.gte": minCount,
        with_original_language: "en|es", // suelen tener doblaje al español
        include_adult: "false",
        page,
      };
      if (withoutGenres) params.without_genres = withoutGenres;

      const data = await tmdb("/discover/movie", params);
      if (!data || data.results.length === 0) break;

      for (const m of data.results) {
        const id = `tmdb-${m.id}`;
        if (seen.has(id)) continue;
        if (ASIAN_LANGUAGES.includes(m.original_language)) continue; // filtro existente
        const movie = toMovie(m);
        if (!movie) continue;
        movie.voteAverage = m.vote_average;
        seen.add(id);
        pool.push(movie);
      }
    }
  }
  return pool;
}

// ─── Generación ─────────────────────────────────────────────────────────────
function take(queue, n) {
  return queue.splice(0, n);
}

function buildDays(warren, animation, horror) {
  const warrenQ = shuffleArray(warren);
  const animQ = [...animation]; // ya viene ordenada por prioridad
  const horrorQ = shuffleArray(horror);
  const days = [];

  for (const [i, day] of DAYS.entries()) {
    // Reparto equitativo: todas las Warren caen en algún día
    const warrenToday =
      Math.floor((warren.length * (i + 1)) / DAYS.length) -
      Math.floor((warren.length * i) / DAYS.length);
    const picks = [
      ...take(
        warrenQ,
        Math.min(warrenToday, MOVIES_PER_DAY - ANIMATION_PER_DAY),
      ),
      ...take(animQ, ANIMATION_PER_DAY),
    ];
    picks.push(...take(horrorQ, MOVIES_PER_DAY - picks.length));
    // Si alguna categoría se quedó corta, rellenamos con lo que sobre
    while (picks.length < MOVIES_PER_DAY) {
      const extra =
        take(horrorQ, 1)[0] ?? take(animQ, 1)[0] ?? take(warrenQ, 1)[0];
      if (!extra) break;
      picks.push(extra);
    }
    if (picks.length === 0) continue;
    days.push({ day, movies: shuffleArray(picks) });
  }
  return days;
}

function generateMoviesFile(days) {
  return `// Contenido del calendario: ${MOVIES_PER_DAY} películas por día, sin repeticiones.
// Cada día incluye ${ANIMATION_PER_DAY} de animación, películas del universo Warren repartidas entre todos los días, y el resto de terror.
// Generado automáticamente desde TMDB (https://www.themoviedb.org/)
// Los días que no estén aquí se muestran como "Próximamente".
// \`id\` debe ser único y NO cambiarlo después de publicar (es lo que se guarda
// en el navegador de cada persona). \`poster\` es opcional (ruta en /public o URL).
export const CALENDAR = ${JSON.stringify(days, null, 2)}

export const getDay = (day) => CALENDAR.find((d) => d.day === day)
`;
}

async function main() {
  console.log("🎬 Generando calendario desde TMDB...");
  const seen = new Set();

  // 1. Warren y animación curada (van primero para reservar sus IDs)
  const warren = await fetchCurated(WARREN_MOVIES, "👻 Universo Warren:", seen);
  const curatedAnimation = await fetchCurated(
    ANIMATION_MOVIES,
    "🎨 Animación curada:",
    seen,
  );

  // 2. Animación descubierta por nota (terror/fantasía animados)
  const discoveredAnimation = (
    await Promise.all(
      ["16,27", "16,14"].map((genres) =>
        discover({
          genres,
          minAvg: ANIMATION_MIN_VOTE_AVERAGE,
          minCount: ANIMATION_MIN_VOTE_COUNT,
          ranges: [{ start: `${MIN_YEAR}-01-01`, end: "2026-12-31" }],
          pages: 2,
          seen,
          label: "Animación",
        }),
      ),
    )
  )
    .flat()
    .sort((a, b) => b.voteAverage - a.voteAverage);

  // La curada va primero; la descubierta completa lo que falte
  const animation = [...shuffleArray(curatedAnimation), ...discoveredAnimation];

  // 3. Terror de calidad, repartido por décadas
  const horror = await discover({
    genres: String(HORROR_GENRE),
    withoutGenres: String(ANIMATION_GENRE),
    minAvg: HORROR_MIN_VOTE_AVERAGE,
    minCount: HORROR_MIN_VOTE_COUNT,
    ranges: [
      { start: "1990-01-01", end: "1999-12-31" },
      { start: "2000-01-01", end: "2009-12-31" },
      { start: "2010-01-01", end: "2019-12-31" },
      { start: "2020-01-01", end: "2026-12-31" },
    ],
    pages: 2,
    seen,
    label: "Terror",
  });

  // 4. Reparto por días
  const days = buildDays(warren, animation, horror);
  const chosen = days.flatMap((d) => d.movies);

  if (chosen.length === 0) {
    console.error("❌ No se encontraron películas. Verifica tu API key.");
    process.exit(1);
  }

  // 5. Tráilers solo para las elegidas
  console.log("\n🎬 Buscando trailers...");
  for (let i = 0; i < chosen.length; i++) {
    const movie = chosen[i];
    console.log(`   [${i + 1}/${chosen.length}] ${movie.title}`);
    movie.trailer = await fetchTrailer(movie.tmdbId);
    delete movie.tmdbId;
    delete movie.voteAverage;
  }

  const outputPath = "src/data/movies.js";
  const fs = await import("fs");
  fs.writeFileSync(outputPath, generateMoviesFile(days), "utf-8");

  console.log(`\n📝 Archivo generado: ${outputPath}`);
  console.log(`   ${days.length} días, ${chosen.length} películas`);
  console.log(
    `   Warren disponibles: ${warren.length} | animación: ${animation.length} | terror: ${horror.length}`,
  );
  console.log(
    "\n🎉 ¡Listo! Ya puedes ejecutar npm run dev para ver el calendario.",
  );
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
