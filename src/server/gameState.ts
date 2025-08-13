import { type GameState, gameStateSchema } from '@/lib/schemas';
import { getRandomMovie } from '@/server/getMovies';
import { cookies } from 'next/headers';

export async function getGameState(): Promise<GameState> {
  try {
    const gameCookie = (await cookies()).get('game');
    return gameStateSchema.parse(JSON.parse(gameCookie?.value ?? '{}'));
  } catch {
    const movie = await getRandomMovie(1000);
    return {
      movieIds: [movie.id],
    };
  }
}
