import localDb from '@/db/local';
import { HINT_TYPE } from '@/lib/constants';
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

const getMovieByIdPrepared = localDb.query.movie
  .findFirst({
    columns: {
      id: true,
      title: true,
      posterPath: true,
    },
    extras: ({ releaseDate }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
    }),
    where: ({ id }, { eq }) => eq(id, sql.placeholder('id')),
  })
  .prepare();

export async function getMovieById(id: number) {
  const movie = await getMovieByIdPrepared.execute({ id });
  if (!movie) throw new Error(`Movie not found in db ${id}`);

  return movie;
}

export type MovieById = Awaited<ReturnType<typeof getMovieById>>;

const getMoviesLimitPrepared = localDb.query.movie
  .findMany({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
    }),
    orderBy: ({ voteCount }, { desc }) => desc(voteCount),
    limit: sql.placeholder('limit'),
  })
  .prepare();

export const getTopMovies = unstable_cache((limit = 5000) =>
  getMoviesLimitPrepared.execute({ limit })
);

export type TopMovies = Awaited<ReturnType<typeof getTopMovies>>[number];

const getMovieOffsetPrepared = localDb.query.movie
  .findFirst({
    columns: {
      id: true,
      title: true,
    },
    extras: ({ releaseDate }, { sql }) => ({
      year: sql<number>`CAST(substr(${releaseDate}, 1, 4) AS INTEGER)`.as(
        'year'
      ),
    }),
    orderBy: (movie, { desc }) => desc(movie.voteCount),
    offset: sql.placeholder('offset'),
  })
  .prepare();

export async function getRandomMovie(top = 1000) {
  const randomMovie = await getMovieOffsetPrepared.execute({
    offset: Math.floor(Math.random() * top),
  });
  if (!randomMovie) throw new Error('No random movie found');

  return randomMovie;
}

const getMovieForHintPrepared = localDb.query.movie
  .findFirst({
    columns: {
      id: true,
      title: true,
      originalTitle: true,
      releaseDate: true,
      overview: true,
      genreIds: true,
    },
    where: ({ id }, { eq }) => eq(id, sql.placeholder('id')),
  })
  .prepare();

export async function getMovieHint(
  id: number,
  currHints: { type: (typeof HINT_TYPE)[number] }[] = []
) {
  const movie = await getMovieForHintPrepared.execute({ id });
  if (!movie) throw new Error(`Movie not found in db ${id}`);

  if (movie.title === movie.originalTitle) {
    currHints = [...currHints, { type: 'originalTitle' }];
  }

  const hintType = HINT_TYPE.filter(
    (type) => !currHints.some((h) => h.type === type)
  );
  const type = hintType[Math.floor(Math.random() * hintType.length)];
  let text;

  switch (type) {
    case 'releaseDate':
      text = movie.releaseDate;
      break;
    case 'overview':
      text = movie.overview.slice(0, 80) + '...';
      break;
    case 'genres':
      const genres = await localDb.query.genre.findMany({
        columns: {
          name: true,
        },
        where: (genre, { inArray }) => inArray(genre.id, movie.genreIds),
      });
      text = genres.map(({ name }) => name).join(', ');
      break;
    case 'originalTitle':
      text = movie.originalTitle;
      break;
    default:
      throw new Error(`Invalid hint type: ${type}`);
  }

  return {
    type,
    text,
  };
}

export type MovieHint = Awaited<ReturnType<typeof getMovieHint>>;
