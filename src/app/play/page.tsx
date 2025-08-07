import localDb from '@/db/local';

export default async function Play() {
  const movie = await localDb.query.movie.findFirst();
  return <div>{JSON.stringify(movie)}</div>;
}
