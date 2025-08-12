import db from '@/db/local';
import fs from 'fs';

const SEEDS = {
  genres: './src/db/local/seeds/genres.sql',
  movies: './src/db/local/seeds/movies.sql',
  movieGenre: './src/db/local/seeds/movie_genre.sql',
};

async function runSeed(seed: keyof typeof SEEDS) {
  console.log(`Running ${seed} seed...`);
  const sql = fs.readFileSync(SEEDS[seed], 'utf8');
  await db.run(sql);
  console.log(`${seed} seed complete`);
}

async function main() {
  await runSeed('genres');
  await runSeed('movies');
  await runSeed('movieGenre');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
