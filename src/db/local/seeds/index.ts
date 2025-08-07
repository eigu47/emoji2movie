import fs from 'fs';
import localDb from '../index';

const SEEDS = {
  genres: './src/db/local/seeds/genres.sql',
  movies: './src/db/local/seeds/movies.sql',
  movieGenre: './src/db/local/seeds/movie_genre.sql',
};

async function main() {
  async function runSeed(seed: keyof typeof SEEDS) {
    const sql = fs.readFileSync(SEEDS[seed], 'utf8');
    await localDb.run(sql);
  }

  await runSeed('genres');
  await runSeed('movies');
  await runSeed('movieGenre');
}

main().catch(console.error);
