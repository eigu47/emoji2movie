import { MOVIE_LIST } from '@/constants/movie-list';
import db from '@/db/local';
import { unstable_cache } from 'next/cache';

export const getAllMovies = unstable_cache(() => getMovieList(undefined));

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

export async function getRandomMovie() {
  let randomMovie;
  try {
    randomMovie = await db.query.movie.findFirst({
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
      offset: Math.floor(Math.random() * 1000),
    });

    randomMovie ??= MOVIE_LIST[Math.floor(Math.random() * MOVIE_LIST.length)]!;
  } catch {
    randomMovie = MOVIE_LIST[Math.floor(Math.random() * MOVIE_LIST.length)]!;
  }
  return randomMovie;
}
