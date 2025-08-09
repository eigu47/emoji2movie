import fs from 'fs';
import db from '../index';

const SEEDS = {
  genres: './src/db/seeds/genres.sql',
  movies: './src/db/seeds/movies.sql',
  movieGenre: './src/db/seeds/movie_genre.sql',
};

function main() {
  function runSeed(seed: keyof typeof SEEDS) {
    console.log(`Running ${seed} seed...`);
    const sql = fs.readFileSync(SEEDS[seed], 'utf8');
    db.run(sql);
    console.log(`${seed} seed complete`);
  }

  runSeed('genres');
  runSeed('movies');
  runSeed('movieGenre');
}

main();
