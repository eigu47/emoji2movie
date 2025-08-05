import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from 'drizzle-orm/sqlite-core';

export const movie = sqliteTable(
  'movie',
  {
    id: integer().primaryKey(),
    title: text(),
    originalTitle: text(),
    originalLanguage: text(),
    overview: text(),
    posterPath: text(),
    backdropPath: text(),
    releaseDate: text(),
    // genreIds: [878, 53],
    adult: integer({ mode: 'boolean' }),
    video: integer({ mode: 'boolean' }),
    popularity: real(),
    voteAverage: real(),
    voteCount: integer(),
  },
  (m) => [index('title_idx').on(m.title)]
);

export const genre = sqliteTable(
  'genre',
  {
    id: integer().primaryKey(),
    name: text(),
  },
  (g) => [unique().on(g.name)]
);

export const movie_genre = sqliteTable(
  'movie_genre',
  {
    movieId: integer().references(() => movie.id),
    genreId: integer().references(() => genre.id),
  },
  (mg) => [primaryKey({ columns: [mg.genreId, mg.movieId] })]
);
