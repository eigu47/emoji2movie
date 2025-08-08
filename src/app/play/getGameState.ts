import { getAllMovies } from '@/lib/getMovieLists';
import { gameStateSchema } from '@/types/gameState';
import { cookies } from 'next/headers';

export async function getGameState() {
  try {
    const gameCookie = (await cookies()).get('game');
    return gameStateSchema.parse(JSON.parse(gameCookie?.value ?? '{}'));
  } catch {
    const moviesList = await getAllMovies();
    const movieId =
      moviesList[Math.floor(Math.random() * moviesList.length)]!.id;
    return {
      movieIds: [movieId],
    };
  }
}
