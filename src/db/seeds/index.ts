import { drizzle } from 'drizzle-orm/libsql';
import fs from 'fs';

const SEEDS = {
  genres: './src/db/seeds/genres.sql',
  movies: './src/db/seeds/movies.sql',
  movieGenre: './src/db/seeds/movie_genre.sql',
};

async function main() {
  const db = drizzle({
    connection: {
      url: 'http://127.0.0.1:8080',
    },
    casing: 'snake_case',
  });

  async function runSeed(seed: keyof typeof SEEDS) {
    const sql = fs.readFileSync(SEEDS[seed], 'utf8');
    await db.run(sql);
  }

  await runSeed('genres');
  await runSeed('movies');
  await runSeed('movieGenre');
}

main().catch(console.error);
