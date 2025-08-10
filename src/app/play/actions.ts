'use server';

import { GameState, gameStateSchema } from '@/lib/schemas';
import {
  errorResponse,
  ServerResponse,
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

export async function submitGuessAction(
  prev: ServerResponse<{ guess: string }, string>,
  form: FormData
) {
  try {
    const { guess } = z
      .object({ guess: z.string() })
      .parse(Object.fromEntries(form));
    const cookieStore = await cookies();
    console.log({ guess });
    return successResponse({ guess });
  } catch (error) {
    return errorResponse('Failed to submit', error);
  }
}
