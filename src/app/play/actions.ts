'use server';

import { type GameState, gameStateSchema } from '@/lib/schemas';
import { getGameState } from '@/server/gameState';
import { getTopMovies } from '@/server/getMovies';
import {
  errorResponse,
  type ServerResponse,
  successResponse,
} from '@/server/serverResponse';
import { cookies } from 'next/headers';
import z from 'zod';

export async function setGameAction(gameState: GameState) {
  try {
    const parsedGameState = gameStateSchema.parse(gameState);
    const cookieStore = await cookies();
    cookieStore.set('game', JSON.stringify(parsedGameState));
    return successResponse(parsedGameState);
  } catch {
    return errorResponse('Failed to set game state');
  }
}

export async function getAutocompleteMovies() {
  try {
    return successResponse(await getTopMovies(5000));
  } catch (error: unknown) {
    return errorResponse('Failed to load movies', error);
  }
}

export async function submitGuessAction(
  prev: ServerResponse<{ guess: string }>,
  form: FormData
) {
  try {
    const { guess } = z
      .object({ guess: z.coerce.number() })
      .parse(Object.fromEntries(form));

    const gameState = await getGameState();

    if (gameState.movies.at(-1)!.id == guess) {
      return successResponse({ guess: 'correct!' });
    }

    return successResponse({ guess: 'incorrect!' });
  } catch (error) {
    return errorResponse('Failed to submit', error);
  }
}
