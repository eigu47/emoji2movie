import { type GameState, gameStateSchema } from '@/lib/validation';
import { getRandomMovie } from '@/server/getMovies';
import { cookies } from 'next/headers';

export async function getGameState() {
  const gameCookie = (await cookies()).get('game');

  return gameStateSchema.parse(JSON.parse(gameCookie?.value ?? '{}'));
}

export async function getOrCreateGameState(): Promise<GameState> {
  try {
    return await getGameState();
  } catch {
    const { id } = await getRandomMovie(1000);
    const session = crypto.randomUUID();

    return {
      session,
      movieId: id,
      guessed: [],
      hint: [],
      streak: 0,
      bestStreak: 0,
    };
  }
}

export async function updateGameState(state: Partial<GameState>) {
  const cookieStore = await cookies();
  const gameCookie = cookieStore.get('game');
  const gameState = gameStateSchema.parse(
    JSON.parse(gameCookie?.value ?? '{}')
  );

  const newState = { ...gameState, ...state };
  cookieStore.set('game', JSON.stringify(newState));
  return newState;
}
