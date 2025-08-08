import localDb from '@/db/local';
import { unstable_cache } from 'next/cache';

export const getAllMovies = unstable_cache(async () =>
  getMovieLists(undefined)
);

export function getMovieLists(ids: number[] | undefined) {
  return localDb.query.movie.findMany({
    columns: {
      id: true,
      title: true,
      voteCount: true,
    },
    extras: ({ releaseDate }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
    }),
    where: (movie, { inArray }) => (ids ? inArray(movie.id, ids) : undefined),
  });
}

export type Movie = Awaited<ReturnType<typeof getMovieLists>>[number];
