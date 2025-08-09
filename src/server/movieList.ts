import db from '@/db';
import { unstable_cache } from 'next/cache';

export const getAllMovies = unstable_cache(async () => getMovieList(undefined));

export function getMovieList(ids: number[] | undefined) {
  return db.query.movie.findMany({
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
