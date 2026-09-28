// Contenido del calendario: 3 o 4 películas por día.
// Los días que no estén aquí se muestran como "Próximamente".
// `id` debe ser único y NO cambiarlo después de publicar (es lo que se guarda
// en el navegador de cada persona). `poster` es opcional (ruta en /public o URL).
export const CALENDAR = [
  {
    day: 1,
    movies: [
      { id: 'elf-2003', title: 'Elf', year: 2003, synopsis: 'Un humano criado por elfos viaja a Nueva York a buscar a su padre.' },
      { id: 'solo-en-casa-1990', title: 'Solo en casa', year: 1990, synopsis: 'Un niño olvidado en casa defiende su hogar de dos ladrones.' },
      { id: 'love-actually-2003', title: 'Love Actually', year: 2003, synopsis: 'Varias historias de amor entrelazadas en las semanas previas a Navidad.' },
    ],
  },
  {
    day: 2,
    movies: [
      { id: 'jungla-de-cristal-1988', title: 'La jungla de cristal', year: 1988, synopsis: 'Un policía se enfrenta solo a un grupo de terroristas en Nochebuena.' },
      { id: 'gremlins-1984', title: 'Gremlins', year: 1984, synopsis: 'Un regalo de Navidad se convierte en una plaga de criaturas.' },
      { id: 'pesadilla-antes-navidad-1993', title: 'Pesadilla antes de Navidad', year: 1993, synopsis: 'El rey de Halloween descubre la Navidad y decide hacerse cargo.' },
      { id: 'polar-express-2004', title: 'El expreso polar', year: 2004, synopsis: 'Un niño sube a un tren mágico rumbo al Polo Norte.' },
    ],
  },
  {
    day: 3,
    movies: [
      { id: 'que-bello-es-vivir-1946', title: '¡Qué bello es vivir!', year: 1946, synopsis: 'Un ángel muestra a un hombre desesperado cómo sería el mundo sin él.' },
      { id: 'milagro-calle-34-1947', title: 'Milagro en la calle 34', year: 1947, synopsis: 'Un anciano asegura ser Papá Noel y acaba en los tribunales.' },
      { id: 'grinch-2000', title: 'El Grinch', year: 2000, synopsis: 'Un gruñón intenta arruinar la Navidad a todo el pueblo.' },
    ],
  },
]

export const getDay = (day) => CALENDAR.find((d) => d.day === day)
