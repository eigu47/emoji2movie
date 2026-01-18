import {
  type GameState,
  gameStateSchema,
  type GameStateWithMovieId,
} from '@/lib/validation';
import { getRandomMovie } from '@/server/getMovies';
import { cookies } from 'next/headers';

export async function getGameState() {
  const gameCookie = (await cookies()).get('game');
  const { data, success } = gameStateSchema.safeParse(
    JSON.parse(gameCookie?.value ?? '{}')
  );

  if (success) return data;

  return null;
}

export async function getOrCreateGameState(): Promise<GameStateWithMovieId> {
  const state = await getGameState();
  if (state) {
    if (state.movieId == null) {
      const { id } = await getRandomMovie();

      await updateGameState({ movieId: id });

      return {
        ...state,
        movieId: id,
      };
    }

    return state as GameStateWithMovieId;
  }

  // Create new state
  const { id } = await getRandomMovie();
  const session = crypto.randomUUID();

  const newState = {
    session,
    movieId: id,
    guessed: [],
    hint: [],
    streak: 0,
    bestStreak: 0,
  };

  const cookieStore = await cookies();
  cookieStore.set('game', JSON.stringify(newState));
  return newState;
}

export function filterGameState(state: GameState) {
  const { session, movieId, ...rest } = state;
  return rest;
}

export type GameStateFront = ReturnType<typeof filterGameState>;

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
