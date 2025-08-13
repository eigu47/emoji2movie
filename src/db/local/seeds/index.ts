import localDb from '@/db/local';
import fs from 'fs';

const SEEDS = {
  genres: './src/db/local/seeds/genres.sql',
  movies: './src/db/local/seeds/movies.sql',
  movieGenre: './src/db/local/seeds/movie_genre.sql',
} as const;

function runSeed(seed: keyof typeof SEEDS) {
  console.log(`Running ${seed} seed...`);
  const sql = fs.readFileSync(SEEDS[seed], 'utf8');
  localDb.run(sql);
  console.log(`${seed} seed complete`);
}

function main() {
  try {
    runSeed('genres');
    runSeed('movies');
    runSeed('movieGenre');
  } catch (err: unknown) {
    console.error(err);
    process.exit(1);
  }
}

main();
