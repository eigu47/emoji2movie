import localDb from '@/db/local';
import { sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export function getMovieList(ids: number[] | undefined) {
  return localDb.query.movie.findMany({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate, voteCount }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
      vote: sql<number>`${voteCount}`.as('vote'),
    }),
    where: (movie, { inArray }) => (ids ? inArray(movie.id, ids) : undefined),
  });
}

export const getMovieById = localDb.query.movie
  .findFirst({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate, voteCount }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
      vote: sql<number>`${voteCount}`.as('vote'),
    }),
    where: ({ id }, { eq }) => eq(id, sql.placeholder('id')),
  })
  .prepare();

const getMoviesLimit = localDb.query.movie
  .findMany({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate, voteCount }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
      vote: sql<number>`${voteCount}`.as('vote'),
    }),
    orderBy: ({ voteCount }, { desc }) => desc(voteCount),
    limit: sql.placeholder('limit'),
  })
  .prepare();

export const getTopMovies = unstable_cache((limit = 5000) =>
  getMoviesLimit.execute({ limit })
);

const getMovieOffset = localDb.query.movie
  .findFirst({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate, voteCount }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
      vote: sql<number>`${voteCount}`.as('vote'),
    }),
    orderBy: (movie, { desc }) => desc(movie.voteCount),
    offset: sql.placeholder('offset'),
  })
  .prepare();

export async function getRandomMovie(top = 1000) {
  const randomMovie = await getMovieOffset.execute({
    offset: Math.floor(Math.random() * top),
  });

  if (!randomMovie) throw new Error('No random movie found');

  return randomMovie;
}
