import fs from 'fs';
import localDb from '../index';

const SEEDS = {
  genres: './src/db/local/seeds/genres.sql',
  movies: './src/db/local/seeds/movies.sql',
  movieGenre: './src/db/local/seeds/movie_genre.sql',
};

function main() {
  function runSeed(seed: keyof typeof SEEDS) {
    console.log(`Running ${seed} seed...`);
    const sql = fs.readFileSync(SEEDS[seed], 'utf8');
    localDb.run(sql);
    console.log(`${seed} seed complete`);
  }

  runSeed('genres');
  runSeed('movies');
  runSeed('movieGenre');
}

main();
