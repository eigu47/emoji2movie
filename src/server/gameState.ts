import { type GameState, gameStateSchema } from '@/lib/schemas';
import { getAllMovies } from '@/server/getMovies';
import { cookies } from 'next/headers';

export async function getGameState(): Promise<GameState> {
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
