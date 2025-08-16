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
      streak: 0,
      bestStreak: 0,
    };
  }
}

export async function updateGameState({
  correct,
  ...state
}: Partial<GameState & { correct: boolean }>) {
  const cookieStore = await cookies();
  const gameCookie = cookieStore.get('game');
  const gameState = gameStateSchema.parse(
    JSON.parse(gameCookie?.value ?? '{}')
  );

  if (correct === true) {
    gameState.streak++;
    gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
  } else if (correct === false) {
    gameState.streak = 0;
  }

  const newState = { ...gameState, ...state };
  cookieStore.set('game', JSON.stringify(newState));
  return newState;
}
