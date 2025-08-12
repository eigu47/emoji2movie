import { relations } from 'drizzle-orm';
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
    title: text().notNull(),
    originalTitle: text().notNull(),
    originalLanguage: text().notNull(),
    overview: text().notNull(),
    posterPath: text().notNull(),
    backdropPath: text().notNull(),
    releaseDate: text().notNull(),
    genreIds: text({ mode: 'json' }).$type<number[]>().notNull(),
    adult: integer({ mode: 'boolean' }).notNull(),
    video: integer({ mode: 'boolean' }).notNull(),
    popularity: real().notNull(),
    voteAverage: real().notNull(),
    voteCount: integer().notNull(),
  },
  (m) => [index('vote_count_idx').on(m.voteCount)]
);

export const genre = sqliteTable(
  'genre',
  {
    id: integer().primaryKey(),
    name: text().notNull(),
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

export const movieRelations = relations(movie, ({ many }) => ({
  movieGenres: many(movie_genre),
}));

export const genreRelations = relations(genre, ({ many }) => ({
  movieGenres: many(movie_genre),
}));

export const movieGenreRelations = relations(movie_genre, ({ one }) => ({
  movie: one(movie, {
    fields: [movie_genre.movieId],
    references: [movie.id],
  }),
  genre: one(genre, {
    fields: [movie_genre.genreId],
    references: [genre.id],
  }),
}));
